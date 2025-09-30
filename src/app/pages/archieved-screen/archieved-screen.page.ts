import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonicModule, AlertController, PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { getDatabase, ref as rtdbRef, onValue, off, get, set, remove } from 'firebase/database';
import { AuthService } from '../../auth/auth.service';
import { ApiService } from '../../services/api/api.service';
import { FirebaseChatService } from '../../services/firebase-chat.service';
import { EncryptionService } from '../../services/encryption.service';
import { ArchItem } from 'src/types';
import { SecureStorageService } from 'src/app/services/secure-storage/secure-storage.service';


@Component({
  selector: 'app-archieved-screen',
  standalone: true,
  imports: [IonicModule, CommonModule, TranslateModule],
  templateUrl: './archieved-screen.page.html',
  styleUrls: ['./archieved-screen.page.scss']
})
export class ArchievedScreenPage implements OnInit, OnDestroy {
  items: ArchItem[] = [];
  isLoading = true;
  selected: ArchItem[] = [];
private longPressTimer: any = null;

  private userId = '';
  private unsubArchive?: () => void;

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private router: Router,
    private alertCtrl: AlertController,
    private popover: PopoverController,
    private firebaseChat: FirebaseChatService,
    private enc: EncryptionService,
    private secureStorage: SecureStorageService
  ) { }

  async ngOnInit() {
    this.userId = this.auth.authData?.userId?.toString() || '';
    this.startArchiveListener();
  }

  ngOnDestroy() {
    try { this.unsubArchive?.(); } catch { }
  }

  /** live list of archived rooms */
  private startArchiveListener() {
    const db = getDatabase();
    const ref = rtdbRef(db, `archivedChats/${this.userId}`);
    const cb = onValue(ref, async snap => {
      const map = snap.exists() ? snap.val() : {};
      const roomIds = Object.keys(map).filter(k => map[k]?.isArchived === true);

      // build list in parallel
      const items = await Promise.all(roomIds.map(rid => this.buildItem(rid)));
      // newest on top
      this.items = items.sort((a, b) => {
        const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return tb - ta;
      });
      this.isLoading = false;
    });

    this.unsubArchive = () => off(ref, 'value', cb);
  }

  /** construct one row (name, avatar, preview, unread) */
  private async buildItem(roomId: string): Promise<ArchItem> {
    const isGroup = roomId.startsWith('group_');
    let name = 'Chat';
    let avatar: string | null = null;
    let otherUserId: string | undefined;

    if (isGroup) {
      const g = await this.firebaseChat.getGroupInfo(roomId);
      name = g?.name || 'Group';
      avatar = null;
      // optional DP from your REST:
      try {
        const res: any = await new Promise(resolve => this.api.getGroupDp(roomId).subscribe(resolve, () => resolve(null)));
        if (res?.group_dp_url) avatar = res.group_dp_url;
      } catch { }
    } else {
      // private: resolve "other" id from a_b
      const [a, b] = roomId.split('_');
      otherUserId = a === this.userId ? b : a;
      // fetch minimal profile
      const user = await this.fetchUser(otherUserId);
      name = user?.name || otherUserId || 'User';
      avatar = user?.profile_picture_url || null;
    }

    // last message preview
    const { preview, time, ts } = await this.fetchPreview(roomId);

    // unread count
    const unread = await this.firebaseChat.getUnreadCountOnce(roomId, this.userId).catch(() => 0);
    // const unread = await this.fetchUnreadCount(roomId);

    return {
      roomId,
      isGroup,
      otherUserId,
      name,
      avatar,
      message: preview,
      time,
      timestamp: ts,
      unreadCount: unread || 0
    };
  }

  private async fetchUser(userId: string): Promise<any | null> {
    return await new Promise(resolve => {
      this.api.getAllUsers().subscribe({
        next: (list: any[]) => resolve(list?.find(u => String(u.user_id) === String(userId)) || null),
        error: () => resolve(null)
      });
    });
  }

//   private async fetchUnreadCount(roomId: string): Promise<number> {
//   try {
//     const db = getDatabase();
//     const snap = await get(rtdbRef(db, `unreadCounts/${roomId}/${this.userId}`));
//     return snap.exists() ? snap.val() || 0 : 0;
//   } catch {
//     return 0;
//   }
// }

  private formatTimestamp(timestamp?: string): string {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const yest = new Date(); yest.setDate(now.getDate() - 1);
    if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    if (d.toDateString() === yest.toDateString()) return 'Yesterday';
    if (d.getFullYear() === now.getFullYear()) return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
    return d.toLocaleDateString();
  }

  private async fetchPreview(roomId: string): Promise<{ preview: string; time: string; ts?: string }> {
    try {
      const db = getDatabase();
      const chatsSnap = await get(rtdbRef(db, `chats/${roomId}`));
      const val = chatsSnap.val();
      if (!val) return { preview: '', time: '' };

      const msgs = Object.entries(val).map(([k, v]: any) => ({ key: k, ...(v as any) }));
      // scan from end to find visible
      for (let i = msgs.length - 1; i >= 0; i--) {
        const m: any = msgs[i];
        if (m.isDeleted || m.deletedForEveryone) continue;
        if (m.deletedFor && this.userId && m.deletedFor[String(this.userId)]) continue;

        if (m.attachment?.type && m.attachment.type !== 'text') {
          // const txt = { image:'📷 Photo', video:'🎥 Video', audio:'🎵 Audio', file:'📎 File' }[m.attachment.type] || '[Media]';
          const typeMap: Record<string, string> = {
            image: '📷 Photo',
            video: '🎥 Video',
            audio: '🎵 Audio',
            file: '📎 File'
          };
          const txt = typeMap[m.attachment?.type as string] || '[Media]';
          return { preview: txt, time: this.formatTimestamp(m.timestamp), ts: m.timestamp };
        } else {
          try {
            const dec = await this.enc.decrypt(m.text || '');
            const p = dec?.trim() ? dec : (m.text || '');
            if (p) return { preview: p, time: this.formatTimestamp(m.timestamp), ts: m.timestamp };
          } catch {
            return { preview: '[Encrypted]', time: this.formatTimestamp(m.timestamp), ts: m.timestamp };
          }
        }
      }
      // fallback to last raw
      const last = msgs[msgs.length - 1];
      return { preview: 'This message was deleted', time: this.formatTimestamp(last?.timestamp), ts: last?.timestamp };
    } catch {
      return { preview: '', time: '' };
    }
  }

  // open(item: ArchItem) {
  //   // for groups: roomId is the group id; for private: we navigate using other user id as you do
  //   if (item.isGroup) {
  //     this.router.navigate(['/chatting-screen'], { queryParams: { receiverId: item.roomId, isGroup: true } });
  //   } else {
  //     const receiverId = item.otherUserId!;
  //     this.router.navigate(['/chatting-screen'], { queryParams: { receiverId, receiver_phone: receiverId } });
  //   }
  // }

  async open(item: ArchItem) {
  const receiverId = item.roomId;
  const receiver_name = item.name;

  console.log("item",item);

  await this.secureStorage.setItem('receiver_name', receiver_name);

  // 1) Community case
  if ((item as any).isCommunity) {
    this.router.navigate(['/community-detail'], {
      queryParams: { communityId: receiverId }
    });
    return;
  }

  // 2) Group case
  if (item.isGroup) {
    this.router.navigate(['/chatting-screen'], {
      queryParams: { receiverId, isGroup: true }
    });
  } 
  // 3) Private chat
  else {
    const receiver_phone = item.otherUserId!;
    await this.secureStorage.setItem('receiver_phone', receiver_phone);
    this.router.navigate(['/chatting-screen'], {
      queryParams: { receiverId: receiver_phone, receiver_phone }
    });
  }
}

  isSelected(it: ArchItem): boolean {
  return this.selected.some(s => s.roomId === it.roomId);
}

toggleSelection(it: ArchItem, ev?: Event) {
  if (ev) ev.stopPropagation();
  const i = this.selected.findIndex(s => s.roomId === it.roomId);
  if (i > -1) this.selected.splice(i, 1);
  else this.selected.push(it);
  if (this.selected.length === 0) this.cancelLongPress();
}

clearSelection() {
  this.selected = [];
  this.cancelLongPress();
}

onRowClick(it: ArchItem, ev: Event) {
  if (this.selected.length > 0) { this.toggleSelection(it, ev); return; }
  this.open(it);
}

startLongPress(it: ArchItem) {
  this.cancelLongPress();
  this.longPressTimer = setTimeout(() => {
    if (!this.isSelected(it)) this.selected = [it];
  }, 500);
}

cancelLongPress() {
  if (this.longPressTimer) {
    clearTimeout(this.longPressTimer);
    this.longPressTimer = null;
  }
}

// bulk unarchive from header
async unarchiveSelected() {
  const db = getDatabase();
  const tasks = this.selected.map(it =>
    remove(rtdbRef(db, `archivedChats/${this.userId}/${it.roomId}`)).catch(() => null)
  );
  await Promise.all(tasks);
  // optimistic UI
  const selectedIds = new Set(this.selected.map(s => s.roomId));
  this.items = this.items.filter(i => !selectedIds.has(i.roomId));
  this.clearSelection();
}
}
