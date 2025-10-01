import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, IonicModule, PopoverController } from '@ionic/angular';
import { FooterTabsComponent } from '../components/footer-tabs/footer-tabs.component';
import { Router } from '@angular/router';
import { MenuPopoverComponent } from '../components/menu-popover/menu-popover.component';
import { FormsModule } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { ApiService } from '../services/api/api.service';
import { FirebaseChatService } from '../services/firebase-chat.service';
import { Subscription } from 'rxjs';
import { EncryptionService } from '../services/encryption.service';
import { Capacitor } from '@capacitor/core';
import { SecureStorageService } from '../services/secure-storage/secure-storage.service';
import { decodeBase64 } from '../utils/decodeBase64.util';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';
import { onValue } from '@angular/fire/database';
import { Database } from '@angular/fire/database';
import { ContactSyncService } from '../services/contact-sync.service';
import { NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Device, DeviceInfo } from '@capacitor/device';

// Firebase modular imports
import { getDatabase, ref as rtdbRef, onValue as rtdbOnValue, off as rtdbOff, get, update, remove, set } from 'firebase/database';
import { TypingService } from '../services/typing.service';
import { Resetapp } from '../services/resetapp';
import { VersionCheck } from '../services/version-check';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuHomePopoverComponent } from '../components/menu-home-popover/menu-home-popover.component';

@Component({
  selector: 'app-home-screen',
  templateUrl: './home-screen.page.html',
  styleUrls: ['./home-screen.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FooterTabsComponent, FormsModule, TranslateModule]
})
export class HomeScreenPage implements OnInit, OnDestroy {

  searchText = '';
  selectedFilter = 'all';
  currUserId: string | null = null;
  senderUserId: string | null = null;

  scannedText = '';
  capturedImage = '';
  chatList: any[] = [];
  toggleGroupCreator = false;
  newGroupName = '';
  unreadSubs: Subscription[] = [];
  selectedImage: string | null = null;
  showPopup = false;
  sender_name: string | undefined;

  private avatarErrorIds = new Set<string>();
  isLoading: boolean = true;

  // typing listeners: map roomId -> unsubscribe fn
  private typingUnsubs: Map<string, () => void> = new Map();
  private communityUnreadSubs: Map<string, any> = new Map();

  selectedChats: any[] = [];
  private longPressTimer: any = null;
  private readonly MAX_PINNED = 3;
  private pinUnsub: (() => void) | null = null;
  private archiveUnsub: (() => void) | null = null;

  // private archiveUnsub: (() => void) | null = null;
  private lockUnsub: (() => void) | null = null;

  // maps to track counts
  private archivedMap: Record<string, { archivedAt: number; isArchived: boolean }> = {};
  private lockedMap: Record<string, { lockedAt: number; isLocked: boolean }> = {};

  constructor(
    private router: Router,
    private popoverCtrl: PopoverController,
    private service: ApiService,
    private firebaseChatService: FirebaseChatService,
    private encryptionService: EncryptionService,
    private secureStorage: SecureStorageService,
    private authService: AuthService,
    private db: Database,
    private contactSyncService: ContactSyncService,
    private typingService: TypingService,
    private alertCtrl: AlertController,
    private resetapp: Resetapp,
    private versionService: VersionCheck,
    private translate: TranslateService
  ) { }

  async ngOnInit() {
    this.currUserId = this.authService.authData?.phone_number || '';
    this.senderUserId = this.authService.authData?.userId || '';

    await this.loadData();
    await this.syncPinnedFromServer();
    await this.startPinListener();
    await this.startArchiveListener();
    this.trackRouteChanges();
  }

  async ionViewWillEnter() {
    // 1) First check server for force-logout decision every time user revisits home
    try {
      this.senderUserId = this.authService.authData?.userId || this.senderUserId || '';
      await this.checkForceLogout(); // will show popup & call resetApp() if server says force_logout === 0
    } catch (err) {
      console.warn('checkForceLogout error (ignored):', err);
    }

        // 1.2 Verify device
  const verified = await this.verifyDeviceOnEnter();
  if (!verified) return; // stop if mismatch

    // 2) Existing logic (kept as before)
    const shouldRefresh = localStorage.getItem('shouldRefreshHome');

    if (shouldRefresh === 'true') {
      // console.log('Refreshing home page after group creation...');
      localStorage.removeItem('shouldRefreshHome');
      this.clearChatData();
      await this.refreshHomeData();
      await this.loadData();
      this.sender_name = this.authService.authData?.name || '';
    }
  }

  async verifyDeviceOnEnter(): Promise<boolean> {
  if (!this.senderUserId) {
    console.warn('Skipping device verification: senderUserId is missing');
    return false;
  }
 
  try {
    // 1️⃣ Get device info (with web fallback)
    let info: any;
    const platform = Capacitor.getPlatform();
    if (platform === 'web') {
      // Fallback for web platform
      info = {
        model: navigator.userAgent.includes('Mobile') ? 'Mobile Web' : 'Desktop Web',
        operatingSystem: 'Web',
        osVersion: 'N/A',
        uuid: localStorage.getItem('device_uuid') || crypto.randomUUID()
      };
      // Persist UUID if new
      if (!localStorage.getItem('device_uuid')) {
        localStorage.setItem('device_uuid', info.uuid);
      }
    } else {
      info = await Device.getInfo();
    }
    console.log('Device info retrieved:', info);
 
    // 2️⃣ Get current app version (with web fallback)
    let appVersion = '1.0.0'; // Default fallback
    if (platform !== 'web') {
      try {
        const versionResult = await this.versionService.checkVersion();
        appVersion = versionResult.currentVersion || '1.0.0';
      } catch (versionErr) {
        console.warn('Version check failed:', versionErr);
        appVersion = '1.0.0';
      }
    } else {
      // For web, use a placeholder or read from manifest.json if needed
      appVersion = 'web.1.0.0';
    }
    console.log('App version retrieved:', appVersion);
 
    // 3️⃣ Use persistent UUID
    let uuid = localStorage.getItem('device_uuid') || info.uuid || crypto.randomUUID();
    if (!localStorage.getItem('device_uuid')) {
      localStorage.setItem('device_uuid', uuid);
    }
    console.log('UUID used:', uuid);
 
    // 4️⃣ Create device payload
    const devicePayload = {
      device_uuid: uuid,
      device_model: info.model,
      os_name: info.operatingSystem,
      os_version: info.osVersion,
      app_version: appVersion
    };
 
    // 5️⃣ Prepare payload
    const payload = {
      user_id: this.senderUserId,
      device_details: devicePayload  // Note: device_details expects an object, not array like in OTP
    };
    console.log('📨 Device verification payload:', payload);
 
    // 6️⃣ Call backend API
    console.log('🔄 Calling verifyDevice API...');
    const res: any = await this.authService.verifyDevice(payload);
    console.log('✅ API Response:', res);
 
    if (res.device_mismatch) {
      const backButtonHandler = (ev: any) => ev.detail.register(10000, () => { });
      document.addEventListener('ionBackButton', backButtonHandler);
 
      const alert = await this.alertCtrl.create({
        header: 'Device Mismatch',
        message: 'You are logged in on another device. Please login again.',
        backdropDismiss: false,
        keyboardClose: false,
        buttons: [{
          text: 'OK',
          handler: () => {
            this.resetapp.resetApp();
          }
        }]
      });
 
      await alert.present();
 
      alert.onDidDismiss().then(() => {
        document.removeEventListener('ionBackButton', backButtonHandler);
      });
 
      return false;
    }
 
    console.log('✅ Device verified:', res.message);
    return true;
 
  } catch (err) {
    console.error('Verify Device API error:', err); // Changed to error for visibility
    return false;
  }
}


  //this is for testing
  //   ionViewWillEnter() {
  //     console.log('Forecast ionViewWillEnter')
  //     console.timeLog();
  //     console.timeStamp('Forecast ionViewWillEnter');
  // }

  // ionViewDidEnter() {

  //     console.log('Forecast ionViewDidEnter start')
  //     console.timeLog();
  // }
  private async checkForceLogout(): Promise<void> {
    try {
      const uidStr = this.senderUserId || this.authService.authData?.userId;
      const uid = Number(uidStr);
      if (!uid) return;

      this.service.checkUserLogout(uid).subscribe({
        next: async (res: any) => {
          if (!res) return;
          const force = Number(res.force_logout);

          // force === 1 → show alert and reset
          if (force === 1) {
            const alert = await this.alertCtrl.create({
              header: this.translate.instant('home.logout.header'),
              message: this.translate.instant('home.logout.message'),
              backdropDismiss: false,
              buttons: [
                {
                  text: this.translate.instant('common.ok'),
                  handler: () => {
                    try { this.resetapp.resetApp(); } catch { }
                  }
                }
              ]
            });
            await alert.present();
          }
        },
        error: () => { }
      });
    } catch { }
  }

  private clearChatData() {
    this.unreadSubs.forEach(sub => sub.unsubscribe());
    this.unreadSubs = [];

    // stop typing listeners
    this.typingUnsubs.forEach(unsub => {
      try { unsub(); } catch (e) { }
    });
    this.typingUnsubs.clear();

    this.chatList = [];
  }

  private async refreshHomeData() {
    try {
      this.currUserId = this.authService.authData?.phone_number || '';
      this.senderUserId = this.authService.authData?.userId || '';

      this.chatList = [];

      await Promise.all([
        this.getAllUsers(),
        this.loadUserGroups(),
        this.loadUserCommunitiesForHome()
      ]);

      console.log('Home page refreshed successfully');
    } catch (error) {
      console.error('Error refreshing home data:', error);
    }
  }

  async loadData() {
    try {
      this.isLoading = true;
      await Promise.all([
        this.getAllUsers(),
        this.loadUserGroups(),
        this.loadUserCommunitiesForHome()
      ]);
      this.isLoading = false;
    } catch (err) {
      console.error('Error loading home data:', err);
      this.isLoading = false;
    }
  }

  ngOnDestroy() {
    this.unreadSubs.forEach(sub => sub.unsubscribe());
    this.unreadSubs = [];

    // detach typing listeners
    this.typingUnsubs.forEach(unsub => {
      try { unsub(); } catch (e) { }
    });
    this.typingUnsubs.clear();

    try { this.pinUnsub?.(); } catch { }
    this.pinUnsub = null;

    try { this.archiveUnsub?.(); } catch { }
    this.archiveUnsub = null;
  }

  goToUserAbout() {
    this.showPopup = false;
    setTimeout(() => {
      this.router.navigate(['/profile-screen']);
    }, 100);
  }

  async goToUserchat() {
    this.showPopup = false;
    setTimeout(async () => {
      // optional navigation
    }, 100);
  }

  goToUsercall() {
    this.showPopup = false;
    setTimeout(() => {
      this.router.navigate(['/calls-screen']);
    }, 100);
  }

  goToUservideocall() {
    this.showPopup = false;
    setTimeout(() => {
      this.router.navigate(['/calling-screen']);
    }, 100);
  }

  openImagePopup(profile_picture_url: string) {
    this.selectedImage = profile_picture_url;
    this.showPopup = true;
  }

  closeImagePopup() {
    this.selectedImage = null;
    this.showPopup = false;
  }

  /* ===== Selection mode logic ===== */
  isChatSelected(chat: any): boolean {
    return this.selectedChats.some(c =>
      c.receiver_Id === chat.receiver_Id &&
      !!c.isCommunity === !!chat.isCommunity &&
      !!c.group === !!chat.group
    );
  }

  // toggleChatSelection(chat: any, ev?: Event) {
  //   if (ev) ev.stopPropagation();
  //   const idx = this.selectedChats.findIndex(c =>
  //     c.receiver_Id === chat.receiver_Id &&
  //     !!c.isCommunity === !!chat.isCommunity &&
  //     !!c.group === !!chat.group
  //   );
  //   if (idx > -1) this.selectedChats.splice(idx, 1);
  //   else this.selectedChats.push(chat);
  //   if (this.selectedChats.length === 0) this.clearChatSelection();
  // }

  toggleChatSelection(chat: any, ev?: Event) {
    if (ev) ev.stopPropagation();

    const isCommunity = !!chat.isCommunity;
    const already = this.selectedChats.find(c => this.sameItem(c, chat));

    // --- COMMUNITY SELECTION RULES ---
    if (isCommunity) {
      // non-community already selected → ignore community tap
      if (this.hasNonCommunitySelected()) return;

      // community already selected
      const previouslySelectedCommunity = this.selectedChats.find(c => !!c.isCommunity);
      if (already) {
        // tap again → unselect
        this.selectedChats = this.selectedChats.filter(c => !this.sameItem(c, chat));
      } else if (previouslySelectedCommunity) {
        // switch to this community (never allow 2 communities together)
        this.selectedChats = [chat];
      } else {
        // first community → single select
        this.selectedChats = [chat];
      }
      if (this.selectedChats.length === 0) this.cancelHomeLongPress();
      return;
    }

    // --- NON-COMMUNITY (PRIVATE/GROUP) RULES ---
    // if a community is selected, clear it (community can’t coexist)
    if (this.hasCommunitySelected()) this.selectedChats = [];

    if (already) {
      // toggle off
      this.selectedChats = this.selectedChats.filter(c => !this.sameItem(c, chat));
      if (this.selectedChats.length === 0) this.cancelHomeLongPress();
    } else {
      // add alongside other non-communities
      this.selectedChats.push(chat);
    }
  }

  /** selection guards */
  private hasCommunitySelected(): boolean {
    return this.selectedChats.some(c => !!c.isCommunity);
  }
  private hasNonCommunitySelected(): boolean {
    return this.selectedChats.some(c => !c.isCommunity);
  }
  private sameItem(a: any, b: any): boolean {
    return a?.receiver_Id === b?.receiver_Id &&
      !!a?.group === !!b?.group &&
      !!a?.isCommunity === !!b?.isCommunity;
  }


  clearChatSelection() { this.selectedChats = []; this.cancelHomeLongPress(); }
  onChatRowClick(chat: any, ev: Event) {
    if (this.selectedChats.length > 0) { this.toggleChatSelection(chat, ev); return; }
    this.openChat(chat);
  }
  startHomeLongPress(chat: any) {
    this.cancelHomeLongPress();
    this.longPressTimer = setTimeout(() => {
      if (!this.isChatSelected(chat)) this.selectedChats = [chat];
    }, 500);
  }
  cancelHomeLongPress() {
    if (this.longPressTimer) { clearTimeout(this.longPressTimer); this.longPressTimer = null; }
  }

  /* ===== Selection meta (for header icon logic) ===== */
  get selectionMeta() {
    const sel = this.selectedChats || [];
    const count = sel.length;
    const includesCommunity = sel.some(c => c.isCommunity);
    const includesGroup = sel.some(c => c.group && !c.isCommunity);
    const includesUser = sel.some(c => !c.group && !c.isCommunity);
    const onlyUsers = includesUser && !includesGroup && !includesCommunity && sel.every(c => !c.group && !c.isCommunity);
    return {
      count,
      includesCommunity,
      includesGroup,
      includesUser,
      isSingleUser: count === 1 && onlyUsers && !(sel[0]?.pinned === true),
      isSinglePinned: count === 1 && onlyUsers && (sel[0]?.pinned === true),
      isMultiUsersOnly: count > 1 && onlyUsers
    };
  }

  /* ===== Selection actions (stubbed to local flags; wire to backend if needed) ===== */
  // async onPinSelected() {
  //   // for (const c of this.selectedChats) { c.pinned = true; }
  //    const alert = await this.alertCtrl.create({
  //   header: 'Pin Chat',
  //   message: '📌 Work in progress',
  //   buttons: ['OK']
  // });
  // await alert.present();
  //   this.clearChatSelection();
  // }

  async onPinSelected() {
    const userId = this.senderUserId || this.authService.authData?.userId || '';
    if (!userId) { this.clearChatSelection(); return; }

    const db = getDatabase();

    // only chats (no communities)
    const candidates = this.selectedChats.filter(c => !c.isCommunity);

    // count current pinned (in full list)
    const currentPinned = this.chatList.filter(c => c.pinned).length;

    let pinsAdded = 0;
    for (const chat of candidates) {
      if (chat.pinned) continue; // already pinned

      if (currentPinned + pinsAdded >= this.MAX_PINNED) {
        const alert = await this.alertCtrl.create({
          header: 'Pin Chat',
          message: `You can only pin up to ${this.MAX_PINNED} chats.`,
          buttons: ['OK']
        });
        await alert.present();
        break;
      }

      const key = this.getPinKey(chat);
      try {
        const pinnedAt = Date.now();
        await set(rtdbRef(db, `pinnedChats/${userId}/${key}`), { pinnedAt });
        chat.pinned = true;
        chat.pinnedAt = pinnedAt;
        pinsAdded++;
      } catch { }
    }

    this.clearChatSelection();
  }

  private getPinKey(chat: any): string {
    // groups use groupId; 1:1 uses the same roomId you already use
    if (chat.group) return String(chat.receiver_Id);
    const me = this.senderUserId || this.authService.authData?.userId || '';
    return this.getRoomId(me, String(chat.receiver_Id));
  }

  private async syncPinnedFromServer(): Promise<void> {
    try {
      const userId = this.senderUserId || this.authService.authData?.userId || '';
      if (!userId) return;

      const db = getDatabase();
      const snap = await get(rtdbRef(db, `pinnedChats/${userId}`));
      const map = snap.exists() ? snap.val() : {};

      // reset pin flags locally
      this.chatList.forEach(c => { c.pinned = false; c.pinnedAt = 0; });

      // apply from server
      this.chatList.forEach(c => {
        const k = this.getPinKey(c);
        if (map && map[k]) {
          c.pinned = true;
          c.pinnedAt = Number(map[k]?.pinnedAt || 0);
        }
      });
    } catch { }
  }

  async onUnpinSelected() {
    const userId = this.senderUserId || this.authService.authData?.userId || '';
    if (!userId) { this.clearChatSelection(); return; }

    const db = getDatabase();

    // unpin the first selected (you can loop if you want multi-unpin)
    const chat = this.selectedChats[0];
    if (!chat) { this.clearChatSelection(); return; }

    try {
      const key = this.getPinKey(chat);
      await remove(rtdbRef(db, `pinnedChats/${userId}/${key}`));
      chat.pinned = false;
      chat.pinnedAt = 0;
    } catch { }

    this.clearChatSelection();
  }

  private startPinListener() {
    if (this.pinUnsub) return;
    const userId = this.senderUserId || this.authService.authData?.userId || '';
    if (!userId) return;

    const db = getDatabase();
    const ref = rtdbRef(db, `pinnedChats/${userId}`);
    const unsub = rtdbOnValue(ref, (snap) => {
      const map = snap.exists() ? snap.val() : {};
      this.chatList.forEach(c => {
        const k = this.getPinKey(c);
        if (map[k]) { c.pinned = true; c.pinnedAt = Number(map[k].pinnedAt || 0); }
        else { c.pinned = false; c.pinnedAt = 0; }
      });
    });
    this.pinUnsub = () => { try { rtdbOff(ref); } catch { } };
  }


  // delete chat code start
  async onDeleteSelected() {
    try {
      const deletables = this.selectedChats.filter(c => !c.isCommunity);

      if (deletables.length === 0) {
        const alert = await this.alertCtrl.create({
          header: 'Can\'t Delete',
          message: 'Communities cannot be deleted from here',
          buttons: ['OK']
        });
        await alert.present();
        this.clearChatSelection();
        return;
      }

      const alert = await this.alertCtrl.create({
        header: 'Delete Chat',
        message: deletables.length === 1
          ? 'Delete this chat?'
          : `Delete ${deletables.length} chats?`,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Delete',
            handler: async () => {
              await this.deleteChatsForMe(deletables);
            }
          },
          // Delete for Everyone - only for single private chat
          // ...(deletables.length === 1 && !deletables[0].group ? [{
          //   text: 'Delete for Everyone',
          //   cssClass: 'danger-button',
          //   handler: async () => {
          //     await this.deleteChatsForEveryone(deletables);
          //   }
          // }] : [])
        ]
      });

      await alert.present();

    } catch (error) {
      console.error('❌ Delete error:', error);
      this.clearChatSelection();
    }
  }

  // Delete for Me (soft delete) - UPDATED
  private async deleteChatsForMe(chats: any[]) {
    try {
      const userId = this.senderUserId;
      if (!userId) return;

      for (const chat of chats) {
        const roomId = chat.group
          ? chat.receiver_Id
          : this.getRoomId(userId, chat.receiver_Id);

        // Firebase soft delete
        await this.firebaseChatService.deleteChatForUser(roomId, userId);

        // ✅ Remove from local chatList (row + placeholder)
        this.chatList = this.chatList.filter(c => {
          if (chat.group && c.group) {
            return c.receiver_Id !== chat.receiver_Id;
          }
          if (chat.isCommunity && c.isCommunity) {
            return c.receiver_Id !== chat.receiver_Id;
          }
          if (!chat.group && !chat.isCommunity && !c.group && !c.isCommunity) {
            return c.receiver_Id !== chat.receiver_Id;
          }
          return true;
        });

        // cleanup listeners
        this.stopTypingListenerForChat(chat);
        const unreadSub = this.unreadSubs.find(() => true);
        if (unreadSub) {
          unreadSub.unsubscribe();
          this.unreadSubs = this.unreadSubs.filter(s => s !== unreadSub);
        }
      }

      console.log('✅ Chats deleted for me (placeholders removed)');
      this.clearChatSelection();

    } catch (error) {
      console.error('❌ Error deleting chats:', error);
    }
  }


  // Delete for Everyone (hard delete) - same as before
  private async deleteChatsForEveryone(chats: any[]) {
    try {
      const userId = this.senderUserId;
      if (!userId) return;

      for (const chat of chats) {
        if (chat.group) {
          await this.firebaseChatService.deleteGroup(chat.receiver_Id);
        } else {
          const roomId = this.getRoomId(userId, chat.receiver_Id);
          await this.firebaseChatService.deleteChatPermanently(roomId);
        }

        // Remove from local chatList
        this.chatList = this.chatList.filter(c =>
          !(c.receiver_Id === chat.receiver_Id &&
            !!c.group === !!chat.group)
        );

        this.stopTypingListenerForChat(chat);
      }

      console.log('✅ Chats deleted for everyone');
      this.clearChatSelection();

    } catch (error) {
      console.error('❌ Error deleting chats permanently:', error);
    }
  }
  //delete chat code end here
  async onMuteSelected() {
    // const c = this.selectedChats[0]; if (c) c.muted = true;
    const alert = await this.alertCtrl.create({
      header: 'Mute notification',
      message: 'Work in progress',
      buttons: ['OK']
    });
    await alert.present();
    this.clearChatSelection();
  }

  // async onArchievedSelected() {
  //   // console.log('Export threads:', this.selectedChats.map(c => c.receiver_Id));
  //   const alert = await this.alertCtrl.create({
  //     header: 'Archieved chat',
  //     message: 'Work in progress',
  //     buttons: ['OK']
  //   });
  //   await alert.present();
  //   this.clearChatSelection();
  // }

  async onArchievedSelected() {
    try {
      const userId = this.senderUserId || this.authService.authData?.userId || '';
      if (!userId) {
        this.clearChatSelection();
        return;
      }

      const archivables = this.selectedChats.filter(c => !c.isCommunity);

      if (archivables.length === 0) {
        const alert = await this.alertCtrl.create({
          header: this.translate.instant('home.archive.cannotArchive'),
          message: this.translate.instant('home.archive.communityNotAllowed'),
          buttons: [this.translate.instant('common.ok')]
        });
        await alert.present();
        this.clearChatSelection();
        return;
      }

      const db = getDatabase();

      for (const chat of archivables) {
        const roomId = chat.group
          ? chat.receiver_Id
          : this.getRoomId(userId, chat.receiver_Id);

        // Archive in Firebase
        await set(rtdbRef(db, `archivedChats/${userId}/${roomId}`), {
          archivedAt: Date.now(),
          isArchived: true
        });

        // Remove from local chatList
        this.chatList = this.chatList.filter(c =>
          !(c.receiver_Id === chat.receiver_Id &&
            !!c.group === !!chat.group &&
            !!c.isCommunity === !!chat.isCommunity)
        );

        // Stop typing listener
        this.stopTypingListenerForChat(chat);

        // Unsubscribe unread listener
        const unreadSub = this.unreadSubs.find(sub => {
          return true; // You can add specific logic if needed
        });
        if (unreadSub) {
          unreadSub.unsubscribe();
          this.unreadSubs = this.unreadSubs.filter(s => s !== unreadSub);
        }
      }

      console.log('✅ Chats archived successfully');
      this.clearChatSelection();

    } catch (error) {
      console.error('❌ Error archiving chats:', error);
    }
  }

  // private async startArchiveListener() {
  //   try {
  //     const userId = this.senderUserId || this.authService.authData?.userId || '';
  //     if (!userId || this.archiveUnsub) return;

  //     const db = getDatabase();
  //     const archiveRef = rtdbRef(db, `archivedChats/${userId}`);

  //     this.archiveUnsub = rtdbOnValue(archiveRef, (snapshot) => {
  //       const archivedMap = snapshot.exists() ? snapshot.val() : {};

  //       // Filter out archived chats from chatList
  //       this.chatList = this.chatList.filter(chat => {
  //         const roomId = chat.group 
  //           ? chat.receiver_Id 
  //           : this.getRoomId(userId, chat.receiver_Id);

  //         return !archivedMap[roomId]?.isArchived;
  //       });
  //     });
  //   } catch (err) {
  //     console.warn('startArchiveListener error:', err);
  //   }
  // }

  private startArchiveListener() {
    try {
      const userId = this.senderUserId || this.authService.authData?.userId || '';
      if (!userId || this.archiveUnsub) return;

      const db = getDatabase();
      const archiveRef = rtdbRef(db, `archivedChats/${userId}`);

      this.archiveUnsub = rtdbOnValue(archiveRef, (snapshot) => {
        // keep a local mirror (for count)
        this.archivedMap = snapshot.exists() ? snapshot.val() : {};

        // filter archived out from visible list
        this.chatList = this.chatList.filter(chat => {
          const roomId = chat.group ? chat.receiver_Id : this.getRoomId(userId, chat.receiver_Id);
          return !(this.archivedMap[roomId]?.isArchived);
        });
      });
    } catch (err) {
      console.warn('startArchiveListener error:', err);
    }
  }


  private async isRoomArchived(roomId: string): Promise<boolean> {
    try {
      const userId = this.senderUserId || this.authService.authData?.userId || '';
      if (!userId) return false;

      const db = getDatabase();
      const archiveSnap = await get(rtdbRef(db, `archivedChats/${userId}/${roomId}`));

      return archiveSnap.exists() && archiveSnap.val()?.isArchived === true;
    } catch {
      return false;
    }
  }


  get lockedCount(): number {
    return Object.values(this.lockedMap).filter(v => v?.isLocked).length;
  }
  get archivedCount(): number {
    return Object.values(this.archivedMap).filter(v => v?.isArchived).length;
  }


  openLockedChats() {

    this.router.navigate(['/locked-chats']);
  }
  openArchived() {
    this.router.navigate(['/archieved-screen']);
  }



  async onMoreSelected(ev: any) {
    const sel = this.selectedChats || [];
    const users = sel.filter(c => !c.group && !c.isCommunity);
    const groups = sel.filter(c => c.group && !c.isCommunity);

    const isSingleUser = users.length === 1 && groups.length === 0;
    const isMultiUsers = users.length > 1 && groups.length === 0;
    const isSingleGroup = groups.length === 1 && users.length === 0;
    const isMultiGroups = groups.length > 1 && users.length === 0;
    const isMixedChats = users.length > 0 && groups.length > 0;

    const unreadOf = (x: any) => Number(x?.unreadCount || 0) > 0;

    const single = sel.length === 1 ? sel[0] : null;
    const canMarkReadSingle = !!single && unreadOf(single);
    const canMarkUnreadSingle = !!single && !unreadOf(single);

    const anyUnreadSelected = sel.some(unreadOf);
    const allSelectedRead = sel.length > 0 && sel.every(x => !unreadOf(x));
    const canMarkReadMulti = !single && anyUnreadSelected;
    const canMarkUnreadMulti = !single && allSelectedRead;

    const pop = await this.popoverCtrl.create({
      component: MenuHomePopoverComponent,
      event: ev,
      translucent: true,
      componentProps: {
        canLock: true,
        allSelected: this.areAllVisibleSelected(),
        isAllSelectedMode: this.areAllVisibleSelected(),

        isSingleUser, isMultiUsers, isSingleGroup, isMultiGroups, isMixedChats,

        canMarkReadSingle,
        canMarkUnreadSingle,
        canMarkReadMulti,
        canMarkUnreadMulti,
      }
    });
    await pop.present();

    const { data } = await pop.onDidDismiss();
    if (!data?.action) return;

    switch (data.action) {
      case 'viewContact':
        this.openSelectedContactProfile();
        break;

      case 'groupInfo':
        this.openSelectedGroupInfo();
        break;

      case 'markUnread':
        this.markAsUnread();
        break;
      case 'markRead':
        this.markRoomAsRead();
        break;
      case 'selectAll':
        this.selectAllVisible();
        break;
      case 'lockChat':
      case 'lockChats':     /* ... */ break;
      case 'favorite':      /* ... */ break;
      case 'addToList':     /* ... */ break;

      case 'exitGroup':
        await this.confirmAndExitSingleSelectedGroup();
        break;

      case 'exitGroups':
        await this.confirmAndExitMultipleSelectedGroups();
        break;
      case 'exitCommunity':  /* ... */ break;
      case 'communityInfo':  /* ... */ break;
    }
  }

  private openSelectedContactProfile(): void {
    // console.log("selectedChats",this.selectedChats);
    const sel = this.selectedChats.filter(c => !c.group && !c.isCommunity);
    const chat = sel[0];
    if (!chat) return;

    const queryParams: any = {
      receiverId: chat.receiver_Id,
      receiver_phone: chat.receiver_phone,
      receiver_name: chat.name,
      isGroup: false
    };

    this.router.navigate(['/profile-screen'], { queryParams });
    this.clearChatSelection();
  }

  private openSelectedGroupInfo(): void {
    const sel = this.selectedChats.filter(c => c.group && !c.isCommunity);
    const chat = sel[0];
    if (!chat) return;

    const queryParams: any = {
      receiverId: chat.receiver_Id,
      receiver_phone: '',
      receiver_name: chat.group_name || chat.name,
      isGroup: true
    };

    this.router.navigate(['/profile-screen'], { queryParams });
    this.clearChatSelection();
  }

  // returns only the currently visible chats that are NOT communities
  private get visibleNonCommunityChats(): any[] {
    return this.filteredChats.filter(c => !c.isCommunity);
  }

  // are all visible non-community chats currently selected?
  private areAllVisibleSelected(): boolean {
    const visible = this.visibleNonCommunityChats;
    if (visible.length === 0) return false;
    // compare by receiver_Id + group flag (community already excluded)
    const key = (c: any) => `${c.receiver_Id}::${!!c.group}`;
    const selectedKeys = new Set(this.selectedChats.map(key));
    return visible.every(c => selectedKeys.has(key(c)));
  }

  // select all visible (non-community) chats; if already all selected, clear selection (toggle behavior)
  private selectAllVisible(): void {
    if (this.areAllVisibleSelected()) {
      this.clearChatSelection();
      return;
    }
    this.selectedChats = [...this.visibleNonCommunityChats];
  }


  /** Exit ONE selected group (with confirm) */
  private async confirmAndExitSingleSelectedGroup(): Promise<void> {
    const sel = this.selectedChats.filter(c => c.group && !c.isCommunity);
    const chat = sel[0];
    if (!chat) return;

    const alert = await this.alertCtrl.create({
      header: 'Exit Group',
      message: `Are you sure you want to exit "${chat.group_name || chat.name}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Exit',
          handler: async () => {
            await this.exitGroup(chat.receiver_Id);
            // remove row from UI
            this.chatList = this.chatList.filter(c => !(c.receiver_Id === chat.receiver_Id && c.group && !c.isCommunity));
            this.stopTypingListenerForChat(chat);
            // unsubscribe unread for this group
            this.unreadSubs = this.unreadSubs.filter(s => {
              try { /* keep; we don’t track per-row ref here */ return true; } catch { return true; }
            });
            this.clearChatSelection();

            const t = await this.alertCtrl.create({
              header: 'Exited',
              message: 'You exited the group.',
              buttons: ['OK']
            });
            await t.present();
          }
        }
      ]
    });
    await alert.present();
  }

  /** Exit MANY selected groups (with confirm) */
  private async confirmAndExitMultipleSelectedGroups(): Promise<void> {
    const groups = this.selectedChats.filter(c => c.group && !c.isCommunity);
    if (groups.length === 0) return;

    const alert = await this.alertCtrl.create({
      header: 'Exit Groups',
      message: `Exit ${groups.length} selected groups?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Exit',
          handler: async () => {
            let success = 0, fail = 0;
            for (const g of groups) {
              try {
                await this.exitGroup(g.receiver_Id);
                // remove from UI and cleanup listeners
                this.chatList = this.chatList.filter(c => !(c.receiver_Id === g.receiver_Id && c.group && !c.isCommunity));
                this.stopTypingListenerForChat(g);
                success++;
              } catch (e) {
                console.warn('exit group failed:', g.receiver_Id, e);
                fail++;
              }
            }
            this.clearChatSelection();

            const msg = fail === 0
              ? `Exited ${success} groups`
              : `Exited ${success} groups, ${fail} failed`;
            const done = await this.alertCtrl.create({ header: 'Done', message: msg, buttons: ['OK'] });
            await done.present();
          }
        }
      ]
    });
    await alert.present();
  }

  /** Core: exit a group and reassign admin if needed */
  private async exitGroup(groupId: string): Promise<void> {
    const userId = this.senderUserId || this.authService.authData?.userId || '';
    if (!groupId || !userId) throw new Error('Missing groupId/userId');

    const db = getDatabase();

    // 🔹 Read my member record
    const memberPath = `groups/${groupId}/members/${userId}`;
    const memberSnap = await get(rtdbRef(db, memberPath));
    if (!memberSnap.exists()) {
      // already not a member
      return;
    }

    const myMember = memberSnap.val();
    const wasAdmin = String(myMember?.role || '').toLowerCase() === 'admin';

    // 🔹 Move to pastmembers, then remove from members
    const pastMemberPath = `groups/${groupId}/pastmembers/${userId}`;
    const updatedMember = {
      ...myMember,
      status: 'inactive',
      removedAt: new Date().toISOString()
    };

    await Promise.all([
      set(rtdbRef(db, pastMemberPath), updatedMember),
      (async () => {
        try { await update(rtdbRef(db, memberPath), { status: 'inactive' }); } catch { }
        await remove(rtdbRef(db, memberPath));
      })()
    ]);

    // 🔹 If I was admin, check if any admins remain
    if (wasAdmin) {
      const membersSnap = await get(rtdbRef(db, `groups/${groupId}/members`));
      if (membersSnap.exists()) {
        const members = membersSnap.val() || {};
        const remainingIds: string[] = Object.keys(members).filter(mid => String(mid) !== String(userId));

        if (remainingIds.length > 0) {
          // check if another admin already exists
          const otherAdmins = remainingIds.filter(mid =>
            String(members[mid]?.role || '').toLowerCase() === 'admin'
          );

          if (otherAdmins.length === 0) {
            const nonAdmins = remainingIds.filter(mid =>
              String(members[mid]?.role || '').toLowerCase() !== 'admin'
            );
            const pool = nonAdmins.length > 0 ? nonAdmins : remainingIds;
            const newAdminId = pool[Math.floor(Math.random() * pool.length)];

            await update(rtdbRef(db, `groups/${groupId}/members/${newAdminId}`), { role: 'admin' });
            console.log(`Assigned new admin: ${newAdminId}`);
          } else {
            console.log('Another admin already exists, no reassignment needed.');
          }
        }
      }
    }

    // 🔹 Optional: clear my unread count node
    try {
      await this.firebaseChatService.resetUnreadCount(groupId, userId);
    } catch (e) {
      console.warn('resetUnreadCount failed:', e);
    }
  }

 async markRoomAsRead(){
  const me = this.senderUserId || this.authService.authData?.userId || '';
  if (!me) return;

  // build roomIds from current selection (ignore communities)
  const roomIds = (this.selectedChats || [])
    .filter(c => !c.isCommunity)
    .map(c => c.group
      ? String(c.receiver_Id)
      : this.getRoomId(String(me), String(c.receiver_Id))
    );

  await this.firebaseChatService.markManyRoomsAsRead(roomIds, String(me));

  // optimistic UI
  (this.selectedChats || []).forEach(c => { c.unreadCount = 0; c.unread = false; });
  this.clearChatSelection();
}

async markAsUnread() {
  const me = this.senderUserId || this.authService.authData?.userId || '';
  if (!me) return;

  // Build roomIds for selected chats (ignore communities)
  const roomIds = (this.selectedChats || [])
    .filter(c => !c.isCommunity)
    .map(c => c.group
      ? String(c.receiver_Id)                   // group roomId is the groupId
      : this.getRoomId(String(me), String(c.receiver_Id)) // private roomId a_b
    );

  if (roomIds.length === 0) return;

  // Mark in RTDB (centralized)
  await this.firebaseChatService.markManyRoomsAsUnread(roomIds, String(me), 1);

  // Optimistic UI: show badge >= 1 on selected chats
  (this.selectedChats || []).forEach(c => {
    c.unread = true;
    c.unreadCount = Math.max(Number(c.unreadCount || 0), 1);
  });

  // optional: keep selection or clear it
  this.clearChatSelection();
}


  async prepareAndNavigateToChat(chat: any) {
    try {
      if (!chat) return;

      const receiverIdRaw = chat.receiver_Id || chat.receiverId || '';
      const isGroup = !!chat.group;
      const backendPhoneRaw = chat.receiver_phone || chat.phone_number || chat.phone || '';
      const deviceName = chat.name || '';
      const backendName = chat.name || '';
      const displayNameFromDeviceOrBackend = deviceName || backendPhoneRaw || backendName || 'Unknown';

      const cleanPhone = !isGroup ? this.normalizePhone(backendPhoneRaw || receiverIdRaw) : null;

      const receiverNameToSave = deviceName && deviceName !== 'Unknown'
        ? deviceName
        : (backendPhoneRaw ? backendPhoneRaw : (backendName || 'Unknown'));

      if (isGroup) {
        await this.secureStorage.setItem('receiver_name', chat.group_name || receiverNameToSave);
        await this.secureStorage.setItem('receiver_phone', chat.receiver_Id);
        this.router.navigate(['/chatting-screen'], {
          queryParams: { receiverId: receiverIdRaw, isGroup: true }
        });
      } else {
        const phoneToSave = cleanPhone || receiverIdRaw;
        await this.secureStorage.setItem('receiver_name', receiverNameToSave);
        await this.secureStorage.setItem('receiver_phone', phoneToSave);

        this.router.navigate(['/chatting-screen'], {
          queryParams: { receiverId: phoneToSave, receiver_phone: phoneToSave }
        });
      }
    } catch (err) {
      console.error('Error preparing navigation to chat:', err);
    }
  }

  private normalizePhone(num?: string): string {
    if (!num) return '';
    return num.replace(/\D/g, '').slice(-10);
  }

  /**
   * ---------- Chat loading (users) ----------
   */
  // getAllUsers() {
  //   const currentSenderId = this.senderUserId;
  //   // console.log("current sender id:", currentSenderId);
  //   if (!currentSenderId) return;

  //   this.contactSyncService.getMatchedUsers().then((matched) => {
  //     const deviceNameMap = new Map<string, string>();
  //     (matched || []).forEach((m: any) => {
  //       const key = this.normalizePhone(m.phone_number);
  //       if (key && m.name) deviceNameMap.set(key, m.name);
  //     });

  //     this.service.getAllUsers().subscribe((users: any[]) => {
  //       users.forEach((user) => {
  //         const receiverId = user.user_id?.toString();
  //         if (!receiverId || receiverId === currentSenderId) return;

  //         const phoneKey = this.normalizePhone(user.phone_number?.toString());
  //         const deviceName = phoneKey ? deviceNameMap.get(phoneKey) : null;
  //         // const backendPhoneDisplay = phoneKey ? (phoneKey.replace(/^(\d{3})(\d{3})(\d{4})$/, '$1-$2-$3')) : null;
  //         const backendPhoneDisplay = phoneKey ? phoneKey.slice(-10) : null;
  //         // console.log("backend phone display0------------------------------",backendPhoneDisplay);
  //         const displayName = deviceName || backendPhoneDisplay || user.name || 'Unknown';

  //         this.checkUserInRooms(receiverId).subscribe((hasChat: boolean) => {
  //           if (!hasChat) return;

  //           const existingChat = this.chatList.find(
  //             (c: any) => c.receiver_Id === receiverId && !c.group
  //           );
  //           // console.log("existingChat",existingChat);
  //           if (existingChat) return;



  //           const chat: any = {
  //             ...user,
  //             name: displayName,
  //             receiver_Id: receiverId,
  //             profile_picture_url: user.profile_picture_url || null,
  //             receiver_phone: phoneKey,
  //             group: false,
  //             message: '',
  //             time: '',
  //             unreadCount: 0,
  //             unread: false,
  //             // typing fields
  //             isTyping: false,
  //             typingText: null,
  //             typingCount: 0
  //           };
  //           // console.log("existingChat",chat);
  //           this.chatList.push(chat);


  //           // start typing listener for this chat
  //           this.startTypingListenerForChat(chat);

  //           // Listen to last message
  //           const roomId = this.getRoomId(currentSenderId, receiverId);

  //           // unread count
  //           this.firebaseChatService.listenForMessages(roomId).subscribe(async (messages) => {
  //             if (messages.length > 0) {
  //               const lastRaw = messages[messages.length - 1];

  //               // keep delivered marking behavior on the actual last raw message
  //               if (lastRaw.receiver_id === currentSenderId && !lastRaw.delivered) {
  //                 this.firebaseChatService.markDelivered(roomId, lastRaw.key);
  //               }

  //               // Use helper to find the last visible (non-deleted) message preview
  //               try {
  //                 const { previewText, timestamp } = await this.getPreviewFromMessages(messages);
  //                 chat.message = previewText;
  //                 if (timestamp) {
  //                   chat.time = this.formatTimestamp(timestamp);
  //                   chat.timestamp = timestamp;
  //                 }
  //               } catch (e) {
  //                 console.warn('preview extraction failed', e);
  //                 // fallback to last raw behavior
  //                 if (lastRaw.isDeleted) chat.message = 'This message was deleted';
  //                 else {
  //                   try {
  //                     const dec = await this.encryptionService.decrypt(lastRaw.text);
  //                     chat.message = dec;
  //                   } catch {
  //                     chat.message = '[Encrypted]';
  //                   }
  //                 }
  //                 if (lastRaw.timestamp) chat.time = this.formatTimestamp(lastRaw.timestamp);
  //               }
  //             }
  //           });
  //           const sub = this.firebaseChatService
  //             .listenToUnreadCount(roomId, currentSenderId)
  //             .subscribe((count: number) => {
  //               chat.unreadCount = count;
  //               chat.unread = count > 0;
  //             });
  //           this.unreadSubs.push(sub);
  //           // console.log("dsfgdg", this.chatList);
  //         });
  //       });
  //     });
  //   });
  // }

  getAllUsers() {
    const currentSenderId = this.senderUserId;
    if (!currentSenderId) return;

    this.contactSyncService.getMatchedUsers().then((matched) => {
      const deviceNameMap = new Map<string, string>();
      (matched || []).forEach((m: any) => {
        const key = this.normalizePhone(m.phone_number);
        if (key && m.name) deviceNameMap.set(key, m.name);
      });

      this.service.getAllUsers().subscribe((users: any[]) => {
        users.forEach(async (user) => {  // ⭐ async add kiya
          const receiverId = user.user_id?.toString();
          if (!receiverId || receiverId === currentSenderId) return;

          const phoneKey = this.normalizePhone(user.phone_number?.toString());
          const deviceName = phoneKey ? deviceNameMap.get(phoneKey) : null;
          const backendPhoneDisplay = phoneKey ? phoneKey.slice(-10) : null;
          const displayName = deviceName || backendPhoneDisplay || user.name || 'Unknown';

          // this.checkUserInRooms(receiverId).subscribe(async (hasChat: boolean) => {  // ⭐ async add kiya
          //   if (!hasChat) return;

          //   const existingChat = this.chatList.find(
          //     (c: any) => c.receiver_Id === receiverId && !c.group
          //   );
          //   if (existingChat) return;

          //   const roomId = this.getRoomId(currentSenderId, receiverId);
          //   const isArchived = await this.isRoomArchived(roomId);

          //   if (isArchived) {
          //     console.log('Skipping archived chat:', receiverId);
          //     return;
          //   }

          //   const chat: any = {
          //     ...user,
          //     name: displayName,
          //     receiver_Id: receiverId,
          //     profile_picture_url: user.profile_picture_url || null,
          //     receiver_phone: phoneKey,
          //     group: false,
          //     message: '',
          //     time: '',
          //     unreadCount: 0,
          //     unread: false,
          //     isTyping: false,
          //     typingText: null,
          //     typingCount: 0
          //   };

          //   this.chatList.push(chat);

          //   // Start typing listener for this chat
          //   this.startTypingListenerForChat(chat);

          //   // Listen to last message
          //   this.firebaseChatService.listenForMessages(roomId).subscribe(async (messages) => {
          //     if (messages.length > 0) {
          //       const lastRaw = messages[messages.length - 1];

          //       // Keep delivered marking behavior on the actual last raw message
          //       if (lastRaw.receiver_id === currentSenderId && !lastRaw.delivered) {
          //         this.firebaseChatService.markDelivered(roomId, lastRaw.key);
          //       }

          //       // Use helper to find the last visible (non-deleted) message preview
          //       try {
          //         const { previewText, timestamp } = await this.getPreviewFromMessages(messages);
          //         chat.message = previewText;
          //         if (timestamp) {
          //           chat.time = this.formatTimestamp(timestamp);
          //           chat.timestamp = timestamp;
          //         }
          //       } catch (e) {
          //         console.warn('preview extraction failed', e);
          //         // Fallback to last raw behavior
          //         if (lastRaw.isDeleted) chat.message = 'This message was deleted';
          //         else {
          //           try {
          //             const dec = await this.encryptionService.decrypt(lastRaw.text);
          //             chat.message = dec;
          //           } catch {
          //             chat.message = '[Encrypted]';
          //           }
          //         }
          //         if (lastRaw.timestamp) chat.time = this.formatTimestamp(lastRaw.timestamp);
          //       }
          //     }
          //   });

          //   const sub = this.firebaseChatService
          //     .listenToUnreadCount(roomId, currentSenderId)
          //     .subscribe((count: number) => {
          //       chat.unreadCount = count;
          //       chat.unread = count > 0;
          //     });
          //   this.unreadSubs.push(sub);
          // });

          this.checkUserInRooms(receiverId).subscribe(async (hasChat: boolean) => {
            if (!hasChat) return;

            const existingChat = this.chatList.find(
              (c: any) => c.receiver_Id === receiverId && !c.group
            );
            if (existingChat) return;

            const roomId = this.getRoomId(currentSenderId, receiverId);
            const isArchived = await this.isRoomArchived(roomId);
            if (isArchived) return;

            // ⛔️ DO NOT push yet. Wait for first messages.
            this.firebaseChatService.listenForMessages(roomId).subscribe(async (messages) => {
              // compute preview (may be null)
              const preview = await this.getPreviewFromMessages(messages);

              // if no visible message for me → make sure row is removed/not added
              if (!preview) {
                // remove if somehow present
                this.chatList = this.chatList.filter(
                  c => !(c.receiver_Id === receiverId && !c.group && !c.isCommunity)
                );
                return;
              }

              // ✅ ensure row exists (create once)
              let chat = this.chatList.find((c: any) => c.receiver_Id === receiverId && !c.group);
              if (!chat) {
                chat = {
                  ...user,
                  name: displayName,
                  receiver_Id: receiverId,
                  profile_picture_url: user.profile_picture_url || null,
                  receiver_phone: phoneKey,
                  group: false,
                  message: '',
                  time: '',
                  unreadCount: 0,
                  unread: false,
                  isTyping: false,
                  typingText: null,
                  typingCount: 0
                };
                this.chatList.push(chat);

                // start typing + unread only when row exists
                this.startTypingListenerForChat(chat);
                const sub = this.firebaseChatService
                  .listenToUnreadCount(roomId, currentSenderId)
                  .subscribe((count: number) => {
                    chat.unreadCount = count;
                    chat.unread = count > 0;
                  });
                this.unreadSubs.push(sub);
              }

              // update preview/time
              chat.message = preview.previewText || '';
              if (preview.timestamp) {
                chat.time = this.formatTimestamp(preview.timestamp);
                (chat as any).timestamp = preview.timestamp;
              }
            });
          });

        });
      });
    });
  }

  getChatAvatarUrl(chat: any): string | null {
    const id = chat.group ? chat.receiver_Id : chat.receiver_Id;
    if (id && this.avatarErrorIds.has(String(id))) return null;

    const url = chat.group
      ? (chat.dp || null)
      : (chat.profile_picture_url || null);

    return url && String(url).trim() ? url : null;
  }

  // getChatAlt(chat: any): string {
  //   const name = chat.group ? (chat.group_name || chat.name) : chat.name;
  //   return name || 'Profile';
  // }
  getChatAlt(chat: any): string {
    const name = chat.group ? (chat.group_name || chat.name) : chat.name;
    return name || this.translate.instant('home.alt.profile');
  }


  getChatInitial(chat: any): string {
    const name = (chat.group ? (chat.group_name || chat.name) : chat.name) || '';
    const letter = name.trim().charAt(0);
    return letter ? letter.toUpperCase() : '?';
  }

  onAvatarError(chat: any): void {
    const id = chat.group ? chat.receiver_Id : chat.receiver_Id;
    if (id) this.avatarErrorIds.add(String(id));
  }

  checkUserInRooms(userId: string): Observable<boolean> {
    return new Observable(observer => {
      const chatsRef = rtdbRef(getDatabase(), 'chats');

      // Firebase listener
      const unsub = rtdbOnValue(chatsRef, (snapshot: any) => {
        const data = snapshot.val();
        let userFound = false;

        if (data) {
          Object.keys(data).some((roomId: string) => {
            const userIds = roomId.split('_');
            if (userIds.includes(this.senderUserId as string) && userIds.includes(userId)) {
              userFound = true;
              return true;
            }
            return false;
          });
        }

        observer.next(userFound);
      });

      // cleanup for the onValue we created. onValue returns an unsubscribe function in modular firebase,
      // but angularfire wrapper behaves differently; ensure we detach if needed.
      return {
        unsubscribe() {
          try { unsub(); } catch (e) { }
        }
      };
    });
  }

  // async loadUserGroups() {
  //   const userid = this.senderUserId;
  //   // console.log("sender user id:", userid);
  //   if (!userid) return;

  //   const groupIds = await this.firebaseChatService.getGroupsForUser(userid);
  //   // console.log("group ids:", groupIds);

  //   for (const groupId of groupIds) {
  //     // --- FILTER: skip community groups whose id/name prefix is "comm_group_" ---
  //     if (typeof groupId === 'string' && groupId.startsWith('comm_group_')) {
  //       // console.log('Skipping community-linked group by prefix:', groupId);
  //       continue;
  //     }

  //     const existingGroup = this.chatList.find(chat =>
  //       chat.receiver_Id === groupId && chat.group
  //     );
  //     if (existingGroup) {
  //       // console.log('Group already exists in chatList:', groupId);
  //       continue;
  //     }

  //     const groupInfo = await this.firebaseChatService.getGroupInfo(groupId);

  //     // NEW: skip groups that are already assigned to a community
  //     if (!groupInfo) {
  //       // console.log('No groupInfo for', groupId);
  //       continue;
  //     }
  //     if (groupInfo.communityId) {
  //       // console.log('Skipping group already in a community:', groupId, 'communityId=', groupInfo.communityId);
  //       continue;
  //     }

  //     if (!groupInfo.members || !groupInfo.members[userid]) {
  //       // user is not member -> skip
  //       continue;
  //     }

  //     const groupName = groupInfo.name || 'Unnamed Group';
  //     let groupDp = 'assets/images/user.jfif';

  //     this.service.getGroupDp(groupId).subscribe({
  //       next: (res: any) => {
  //         if (res?.group_dp_url) {
  //           const targetGroup = this.chatList.find(chat => chat.receiver_Id === groupId);
  //           if (targetGroup) {
  //             targetGroup.dp = res.group_dp_url;
  //           }
  //         }
  //       },
  //       error: (err: any) => {
  //         console.error('❌ Failed to fetch group DP:', err);
  //       }
  //     });

  //     const groupChat: any = {
  //       name: groupName,
  //       receiver_Id: groupId,
  //       group: true,
  //       message: '',
  //       time: '',
  //       unread: false,
  //       unreadCount: 0,
  //       dp: groupDp,
  //       // typing fields
  //       isTyping: false,
  //       typingText: null,
  //       typingCount: 0,
  //       // optionally keep members if you want to resolve names locally
  //       members: groupInfo.members || {}
  //     };

  //     this.chatList.push(groupChat);

  //     // start typing listener for this group
  //     this.startTypingListenerForChat(groupChat);

  //     // Listen for latest message in group
  //     // this.firebaseChatService.listenForMessages(groupId).subscribe(async (messages) => {
  //     //   if (messages.length > 0) {
  //     //     const lastMsg = messages[messages.length - 1];

  //     //     if (lastMsg.isDeleted) {
  //     //       groupChat.message = 'This message was deleted';
  //     //     } else if (lastMsg.attachment?.type && lastMsg.attachment.type !== 'text') {
  //     //       switch (lastMsg.attachment.type) {
  //     //         case 'image':
  //     //           groupChat.message = '📷 Photo';
  //     //           break;
  //     //         case 'video':
  //     //           groupChat.message = '🎥 Video';
  //     //           break;
  //     //         case 'audio':
  //     //           groupChat.message = '🎵 Audio';
  //     //           break;
  //     //         case 'file':
  //     //           groupChat.message = '📎 Attachment';
  //     //           break;
  //     //         default:
  //     //           groupChat.message = '[Media]';
  //     //       }
  //     //     } else {
  //     //       try {
  //     //         const decryptedText = await this.encryptionService.decrypt(lastMsg.text);
  //     //         groupChat.message = decryptedText;
  //     //       } catch (e) {
  //     //         groupChat.message = '[Encrypted]';
  //     //       }
  //     //     }

  //     //     if (lastMsg.timestamp) {
  //     //       groupChat.time = this.formatTimestamp(lastMsg.timestamp);
  //     //     }
  //     //     groupChat.timestamp = lastMsg.timestamp;
  //     //   }
  //     // });
  //     this.firebaseChatService.listenForMessages(groupId).subscribe(async (messages) => {
  //       if (messages.length > 0) {
  //         const lastRaw = messages[messages.length - 1];

  //         // find preview (skip deleted ones)
  //         try {
  //           const { previewText, timestamp } = await this.getPreviewFromMessages(messages);
  //           groupChat.message = previewText;
  //           if (timestamp) {
  //             groupChat.time = this.formatTimestamp(timestamp);
  //           }
  //           groupChat.timestamp = timestamp || lastRaw.timestamp;
  //         } catch (e) {
  //           console.warn('group preview extraction failed', e);
  //           // fallback to old behavior
  //           if (lastRaw.isDeleted) groupChat.message = 'This message was deleted';
  //           else if (lastRaw.attachment?.type && lastRaw.attachment.type !== 'text') {
  //             switch (lastRaw.attachment.type) {
  //               case 'image': groupChat.message = '📷 Photo'; break;
  //               case 'video': groupChat.message = '🎥 Video'; break;
  //               case 'audio': groupChat.message = '🎵 Audio'; break;
  //               case 'file': groupChat.message = '📎 Attachment'; break;
  //               default: groupChat.message = '[Media]';
  //             }
  //           } else {
  //             try {
  //               const decryptedText = await this.encryptionService.decrypt(lastRaw.text);
  //               groupChat.message = decryptedText;
  //             } catch {
  //               groupChat.message = '[Encrypted]';
  //             }
  //           }
  //           if (lastRaw.timestamp) groupChat.time = this.formatTimestamp(lastRaw.timestamp);
  //           groupChat.timestamp = lastRaw.timestamp;
  //         }
  //       }
  //     });


  //     const sub = this.firebaseChatService
  //       .listenToUnreadCount(groupId, userid)
  //       .subscribe((count: number) => {
  //         groupChat.unreadCount = count;
  //         groupChat.unread = count > 0;
  //       });

  //     this.unreadSubs.push(sub);
  //     // this.chatList.sort((a: any, b: any) => {
  //     //               const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
  //     //               const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
  //     //               return tb - ta;
  //     //             });
  //   }
  // }

  async loadUserGroups() {
    const userid = this.senderUserId;
    if (!userid) return;

    const groupIds = await this.firebaseChatService.getGroupsForUser(userid);

    for (const groupId of groupIds) {
      // --- FILTER: skip community groups whose id/name prefix is "comm_group_" ---
      if (typeof groupId === 'string' && groupId.startsWith('comm_group_')) {
        continue;
      }

      const existingGroup = this.chatList.find(chat =>
        chat.receiver_Id === groupId && chat.group
      );
      if (existingGroup) {
        continue;
      }

      const groupInfo = await this.firebaseChatService.getGroupInfo(groupId);

      // NEW: skip groups that are already assigned to a community
      if (!groupInfo) {
        continue;
      }
      if (groupInfo.communityId) {
        continue;
      }

      if (!groupInfo.members || !groupInfo.members[userid]) {
        // user is not member -> skip
        continue;
      }

      const isArchived = await this.isRoomArchived(groupId);
      if (isArchived) {
        console.log('Skipping archived group:', groupId);
        continue;
      }

      const groupName = groupInfo.name || 'Unnamed Group';
      let groupDp = 'assets/images/user.jfif';

      this.service.getGroupDp(groupId).subscribe({
        next: (res: any) => {
          if (res?.group_dp_url) {
            const targetGroup = this.chatList.find(chat => chat.receiver_Id === groupId);
            if (targetGroup) {
              targetGroup.dp = res.group_dp_url;
            }
          }
        },
        error: (err: any) => {
          console.error('❌ Failed to fetch group DP:', err);
        }
      });

      const groupChat: any = {
        name: groupName,
        receiver_Id: groupId,
        group: true,
        message: '',
        time: '',
        unread: false,
        unreadCount: 0,
        dp: groupDp,
        isTyping: false,
        typingText: null,
        typingCount: 0,
        members: groupInfo.members || {}
      };

      this.chatList.push(groupChat);

      // Start typing listener for this group
      this.startTypingListenerForChat(groupChat);

      // Listen for latest message in group
      // this.firebaseChatService.listenForMessages(groupId).subscribe(async (messages) => {
      //   if (messages.length > 0) {
      //     const lastRaw = messages[messages.length - 1];

      //     // Find preview (skip deleted ones)
      //     try {
      //       const { previewText, timestamp } = await this.getPreviewFromMessages(messages);
      //       groupChat.message = previewText;
      //       if (timestamp) {
      //         groupChat.time = this.formatTimestamp(timestamp);
      //       }
      //       groupChat.timestamp = timestamp || lastRaw.timestamp;
      //     } catch (e) {
      //       console.warn('group preview extraction failed', e);
      //       // Fallback to old behavior
      //       if (lastRaw.isDeleted) groupChat.message = 'This message was deleted';
      //       else if (lastRaw.attachment?.type && lastRaw.attachment.type !== 'text') {
      //         switch (lastRaw.attachment.type) {
      //           case 'image': groupChat.message = '📷 Photo'; break;
      //           case 'video': groupChat.message = '🎥 Video'; break;
      //           case 'audio': groupChat.message = '🎵 Audio'; break;
      //           case 'file': groupChat.message = '📎 Attachment'; break;
      //           default: groupChat.message = '[Media]';
      //         }
      //       } else {
      //         try {
      //           const decryptedText = await this.encryptionService.decrypt(lastRaw.text);
      //           groupChat.message = decryptedText;
      //         } catch {
      //           groupChat.message = '[Encrypted]';
      //         }
      //       }
      //       if (lastRaw.timestamp) groupChat.time = this.formatTimestamp(lastRaw.timestamp);
      //       groupChat.timestamp = lastRaw.timestamp;
      //     }
      //   }
      // });

      this.firebaseChatService.listenForMessages(groupId).subscribe(async (messages) => {
        const preview = await this.getPreviewFromMessages(messages);

        if (!preview) {
          // remove if present (no visible message for me)
          this.chatList = this.chatList.filter(
            c => !(c.group && c.receiver_Id === groupId && !c.isCommunity)
          );
          return;
        }

        // ensure row exists
        let groupChat = this.chatList.find(c => c.group && c.receiver_Id === groupId);
        if (!groupChat) {
          groupChat = {
            name: groupName,
            receiver_Id: groupId,
            group: true,
            message: '',
            time: '',
            unread: false,
            unreadCount: 0,
            dp: groupDp,
            isTyping: false,
            typingText: null,
            typingCount: 0,
            members: groupInfo.members || {}
          };
          this.chatList.push(groupChat);

          const sub = this.firebaseChatService
            .listenToUnreadCount(groupId, userid)
            .subscribe((count: number) => {
              (groupChat as any).unreadCount = count;
              (groupChat as any).unread = count > 0;
            });
          this.unreadSubs.push(sub);

          // typing listener
          this.startTypingListenerForChat(groupChat);
        }

        // update preview/time
        (groupChat as any).message = preview.previewText || '';
        if (preview.timestamp) {
          (groupChat as any).time = this.formatTimestamp(preview.timestamp);
          (groupChat as any).timestamp = preview.timestamp;
        }
      });


      const sub = this.firebaseChatService
        .listenToUnreadCount(groupId, userid)
        .subscribe((count: number) => {
          groupChat.unreadCount = count;
          groupChat.unread = count > 0;
        });

      this.unreadSubs.push(sub);
    }
  }

  get isSelectionMode(): boolean {
    return this.selectedChats.length > 0;
  }

  private trackRouteChanges() {
    this.versionService.checkVersion();
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } else if (isYesterday) {
      // return 'Yesterday';
      return this.translate.instant('home.time.yesterday');
    } else if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
    } else {
      return date.toLocaleDateString();
    }
  }


  private async getPreviewFromMessages(
    messages: any[]
  ): Promise<{ previewText: string; timestamp?: string } | null> {
    if (!messages || messages.length === 0) return null;

    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];

      // skip deleted / deleted for everyone
      if (m.isDeleted || m.deletedForEveryone) continue;

      // skip if deleted for current user
      try {
        if (m.deletedFor && this.senderUserId && m.deletedFor[String(this.senderUserId)]) {
          continue;
        }
      } catch { /* ignore */ }

      // media preview
      if (m.attachment?.type && m.attachment.type !== 'text') {
        let txt = this.translate.instant('home.preview.media.generic');
        switch ((m.attachment.type || '').toString()) {
          case 'image': txt = '📷 ' + this.translate.instant('home.preview.media.photo'); break;
          case 'video': txt = '🎥 ' + this.translate.instant('home.preview.media.video'); break;
          case 'audio': txt = '🎵 ' + this.translate.instant('home.preview.media.audio'); break;
          case 'file': txt = '📎 ' + this.translate.instant('home.preview.media.file'); break;
          default: txt = this.translate.instant('home.preview.media.generic');
        }
        return { previewText: txt, timestamp: m.timestamp };
      }

      // text (decrypt → fallback → skip empties)
      try {
        const dec = await this.encryptionService.decrypt(m.text || '');
        if (dec && String(dec).trim() !== '') {
          return { previewText: dec, timestamp: m.timestamp };
        } else if (m.text && String(m.text).trim() !== '') {
          return { previewText: m.text, timestamp: m.timestamp };
        } else {
          continue;
        }
      } catch {
        return { previewText: this.translate.instant('home.preview.encrypted'), timestamp: m.timestamp };
      }
    }

    // 👉 important: ab yaha koi visible message nahi mila → null
    return null;
  }


  // get filteredChats() {
  //   this.chatList.sort((a: any, b: any) => {
  //     const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
  //     const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
  //     return tb - ta;
  //   });
  //   let filtered = this.chatList;

  //   if (this.selectedFilter === 'read') {
  //     filtered = filtered.filter(chat => !chat.unread && !chat.group);
  //   } else if (this.selectedFilter === 'unread') {
  //     filtered = filtered.filter(chat => chat.unread && !chat.group);
  //   } else if (this.selectedFilter === 'groups') {
  //     filtered = filtered.filter(chat => chat.group);
  //   }

  //   if (this.searchText.trim() !== '') {
  //     const searchLower = this.searchText.toLowerCase();
  //     filtered = filtered.filter(chat =>
  //       (chat.name || '').toLowerCase().includes(searchLower) ||
  //       (chat.message || '').toLowerCase().includes(searchLower)
  //     );
  //   }

  //   // console.log("filtered",filtered);
  //   return filtered;
  //   // Sort by unread count (highest first)
  //   // return filtered.sort((a, b) => b.unreadCount - a.unreadCount);
  // }

  get filteredChats() {
    let filtered = this.chatList;

    if (this.selectedFilter === 'read') {
      filtered = filtered.filter(chat => !chat.unread && !chat.group);
    } else if (this.selectedFilter === 'unread') {
      filtered = filtered.filter(chat => chat.unread && !chat.group);
    } else if (this.selectedFilter === 'groups') {
      filtered = filtered.filter(chat => chat.group);
    }

    if (this.searchText.trim() !== '') {
      const q = this.searchText.toLowerCase();
      filtered = filtered.filter(chat =>
        (chat.name || '').toLowerCase().includes(q) ||
        (chat.message || '').toLowerCase().includes(q)
      );
    }


    return [...filtered].sort((a: any, b: any) => {
      const ap = a.pinned ? 1 : 0;
      const bp = b.pinned ? 1 : 0;
      if (ap !== bp) return bp - ap; // pinned first

      if (ap === 1 && bp === 1) {
        const pa = Number(a.pinnedAt || 0);
        const pb = Number(b.pinnedAt || 0);
        if (pa !== pb) return pb - pa; // newest pin first
      }

      const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return tb - ta; // newest activity first
    });
  }


  get totalUnreadCount(): number {
    return this.chatList.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
  }

  setFilter(filter: string) {
    this.selectedFilter = filter;
  }

  // async openChat(chat: any) {
  //   const receiverId = chat.receiver_Id;
  //   const receiver_phone = chat.receiver_phone;
  //   const receiver_name = chat.name;

  //   await this.secureStorage.setItem('receiver_name', receiver_name);

  //   if (chat.group) {
  //     this.router.navigate(['/chatting-screen'], {
  //       queryParams: { receiverId, isGroup: true }
  //     });
  //   } else {
  //     const cleanPhone = receiverId;
  //     await this.secureStorage.setItem('receiver_phone', receiver_phone);
  //     this.router.navigate(['/chatting-screen'], {
  //       queryParams: { receiverId: cleanPhone, receiver_phone }
  //     });
  //   }
  // }

  async openChat(chat: any) {
    const receiverId = chat.receiver_Id;
    const receiver_phone = chat.receiver_phone;
    const receiver_name = chat.name;

    await this.secureStorage.setItem('receiver_name', receiver_name);

    // If this is a community row -> open community detail page
    if (chat.isCommunity) {
      // navigate to community-detail page with communityId
      this.router.navigate(['/community-detail'], {
        queryParams: { communityId: receiverId }
      });
      return;
    }

    // existing behavior for group or private
    if (chat.group) {
      this.router.navigate(['/chatting-screen'], {
        queryParams: { receiverId, isGroup: true }
      });
    } else {
      const cleanPhone = receiverId;
      await this.secureStorage.setItem('receiver_phone', receiver_phone);
      this.router.navigate(['/chatting-screen'], {
        queryParams: { receiverId: cleanPhone, receiver_phone }
      });
    }
  }

  async loadUserCommunitiesForHome() {
    try {
      const userid = this.senderUserId;
      if (!userid) return;

      const communityIds = await this.firebaseChatService.getUserCommunities(userid);
      // console.log('communities for user:', communityIds);

      for (const cid of communityIds || []) {
        // avoid duplicates
        const exists = this.chatList.find(c => c.receiver_Id === cid && c.isCommunity);
        if (exists) continue;

        // fetch community meta
        const commSnap = await get(rtdbRef(getDatabase(), `communities/${cid}`));
        if (!commSnap.exists()) continue;
        const comm = commSnap.val();

        // fetch groups list under community
        const groupIds = await this.firebaseChatService.getGroupsInCommunity(cid);

        // choose preview group: announcement -> general -> first
        let previewGroupId: string | null = null;
        let previewGroupName = '';
        if (groupIds && groupIds.length > 0) {
          // try announcement
          for (const gid of groupIds) {
            const g = await this.firebaseChatService.getGroupInfo(gid);
            if (!g) continue;
            if (g.type === 'announcement') {
              previewGroupId = gid;
              previewGroupName = g.name || 'Announcements';
              break;
            }
          }
          // fallback to General
          if (!previewGroupId) {
            for (const gid of groupIds) {
              const g = await this.firebaseChatService.getGroupInfo(gid);
              if (!g) continue;
              if ((g.name || '').toLowerCase() === 'general') {
                previewGroupId = gid;
                previewGroupName = g.name || 'General';
                break;
              }
            }
          }
          // final fallback use first group id
          if (!previewGroupId) {
            previewGroupId = groupIds[0];
            const g = await this.firebaseChatService.getGroupInfo(previewGroupId);
            previewGroupName = g?.name || 'Group';
          }
        }

        // fetch last message for previewGroup (one-time)
        let previewText = '';
        let previewTime = '';
        if (previewGroupId) {
          try {
            const chatsSnap = await get(rtdbRef(getDatabase(), `chats/${previewGroupId}`));
            const chatsVal = chatsSnap.val();
            if (chatsVal) {
              const msgs = Object.entries(chatsVal).map(([k, v]: any) => ({ key: k, ...(v as any) }));
              const last = msgs[msgs.length - 1];
              if (last) {
                // derive preview text similar to other code
                if (last.isDeleted) previewText = 'This message was deleted';
                else if (last.attachment?.type && last.attachment.type !== 'text') {
                  switch (last.attachment.type) {
                    case 'image': previewText = '📷 Photo'; break;
                    case 'video': previewText = '🎥 Video'; break;
                    case 'audio': previewText = '🎵 Audio'; break;
                    case 'file': previewText = '📎 Attachment'; break;
                    default: previewText = '[Media]';
                  }
                } else {
                  try {
                    const dec = await this.encryptionService.decrypt(last.text);
                    previewText = dec;
                  } catch {
                    previewText = '[Encrypted]';
                  }
                }
                if (last.timestamp) previewTime = this.formatTimestamp(last.timestamp);
              }
            }
          } catch (err) {
            console.warn('failed to fetch last message for previewGroup', previewGroupId, err);
          }
        }

        // create chat-like object for community row
        const communityChat: any = {
          name: comm.name || 'Community',
          receiver_Id: cid,
          group: true,           // visually treated like a group
          isCommunity: true,     // special flag to open community-detail
          group_name: previewGroupName || '',
          message: previewText || '',
          time: previewTime || '',
          unread: false,
          unreadCount: 0,
          dp: comm.icon || 'assets/images/multiple-users-silhouette (1).png',
        };

        this.chatList.push(communityChat);

        // subscribe to unread count for previewGroup (if exists)
        if (previewGroupId) {
          const sub = this.firebaseChatService.listenToUnreadCount(previewGroupId, userid)
            .subscribe((count: number) => {
              communityChat.unreadCount = count;
              communityChat.unread = count > 0;
            });
          this.unreadSubs.push(sub);
          // keep a reference too if you want to cancel separately later
          this.communityUnreadSubs.set(cid, sub);
        }
      }

      // sort chatList same as other lists (by unread/time etc.)
      this.chatList.sort((a: any, b: any) => b.unreadCount - a.unreadCount);

    } catch (err) {
      console.error('loadUserCommunitiesForHome error', err);
    }
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverCtrl.create({
      component: MenuPopoverComponent,
      event: ev,
      translucent: true
    });
    await popover.present();
  }

  goToContact() {
    this.router.navigate(['/contact-screen']);
  }

  async openCamera() {
    try {
      const image = await Camera.getPhoto({
        source: CameraSource.Camera,
        quality: 90,
        resultType: CameraResultType.Uri
      });
      this.capturedImage = image.webPath!;
    } catch (error) {
      console.error('Camera error:', error);
    }
  }

  // async scanBarcode() {
  //   try {
  //     if (!Capacitor.isNativePlatform()) {
  //       alert('Barcode scanning only works on a real device.');
  //       return;
  //     }

  //     const permission = await BarcodeScanner.checkPermission({ force: true });
  //     if (!permission.granted) {
  //       alert('Camera permission is required to scan barcodes.');
  //       return;
  //     }

  //     await BarcodeScanner.prepare();
  //     await BarcodeScanner.hideBackground();
  //     document.body.classList.add('scanner-active');

  //     const result = await BarcodeScanner.startScan();

  //     if (result?.hasContent) {
  //       // console.log('Scanned Result:', result.content);
  //       this.scannedText = result.content;
  //     } else {
  //       alert('No barcode found.');
  //     }

  //   } catch (error) {
  //     console.error('Barcode Scan Error:', error);
  //     alert('Something went wrong during scanning.');
  //   } finally {
  //     await BarcodeScanner.showBackground();
  //     await BarcodeScanner.stopScan();
  //     document.body.classList.remove('scanner-active');
  //   }
  // }
  async scanBarcode() {
    try {
      if (!Capacitor.isNativePlatform()) {
        alert(this.translate.instant('home.scan.onlyDevice'));
        return;
      }
      const permission = await BarcodeScanner.checkPermission({ force: true });
      if (!permission.granted) {
        alert(this.translate.instant('home.scan.permission'));
        return;
      }
      await BarcodeScanner.prepare();
      await BarcodeScanner.hideBackground();
      document.body.classList.add('scanner-active');

      const result = await BarcodeScanner.startScan();
      if (result?.hasContent) {
        this.scannedText = result.content;
      } else {
        alert(this.translate.instant('home.scan.notFound'));
      }
    } catch (error) {
      console.error('Barcode Scan Error:', error);
      alert(this.translate.instant('home.scan.error'));
    } finally {
      await BarcodeScanner.showBackground();
      await BarcodeScanner.stopScan();
      document.body.classList.remove('scanner-active');
    }
  }

  getRoomId(a: string, b: string): string {
    return a < b ? `${a}_${b}` : `${b}_${a}`;
  }

  /**
   * ------------- Typing listeners helpers -------------
   *
   * startTypingListenerForChat(chat) : starts an onValue listener on typing/{roomId}
   * stopTypingListenerForChat(chat)  : stops that listener
   *
   * The typing node format expected:
   * typing/{roomId}/{userId} => { typing: true, name: 'Rahul', lastUpdated: <ms> }
   */
  private startTypingListenerForChat(chat: any) {
    try {
      // compute roomId
      const db = getDatabase();
      const roomId = chat.group ? chat.receiver_Id : this.getRoomId(this.senderUserId || '', chat.receiver_Id);
      if (!roomId) return;

      if (this.typingUnsubs.has(roomId)) return; // already listening

      const typingRef = rtdbRef(db, `typing/${roomId}`);

      const unsub = rtdbOnValue(typingRef, (snapshot) => {
        const val = snapshot.val() || {};
        const now = Date.now();

        if (!chat.group) {
          // For private: see if the other user has a node set
          const otherUserKey = chat.receiver_Id;
          const entry = val[otherUserKey] || null;

          // If writer writes boolean directly or object
          const isTyping = entry ? (!!entry.typing) : (Object.keys(val).length === 0 ? false : !!val);

          chat.isTyping = !!isTyping;
          chat.typingText = isTyping ? (chat.name || 'typing...') : null;
        } else {
          // Group: count recent typers (exclude current user)
          const entries = Object.keys(val).map(k => ({
            userId: k,
            typing: val[k]?.typing ?? !!val[k],
            lastUpdated: val[k]?.lastUpdated ?? 0,
            name: val[k]?.name ?? null
          }));

          const recent = entries.filter(e => e.userId !== this.senderUserId && e.typing && (now - (e.lastUpdated || 0) < 10000));

          chat.typingCount = recent.length;
          chat.isTyping = recent.length > 0;

          if (recent.length === 1) {
            const r = recent[0];
            // name prefer from DB entry, fallback to group members map
            chat.typingText = r.name || this.lookupMemberName(chat, r.userId) || null;
          } else {
            chat.typingText = null;
          }
        }
      });

      // store unsubscribe
      this.typingUnsubs.set(roomId, unsub);
    } catch (err) {
      console.warn('startTypingListenerForChat error', err);
    }
  }

  private stopTypingListenerForChat(chat: any) {
    try {
      const roomId = chat.group ? chat.receiver_Id : this.getRoomId(this.senderUserId || '', chat.receiver_Id);
      if (!roomId) return;
      const unsub = this.typingUnsubs.get(roomId);
      if (unsub) {
        try { unsub(); } catch (e) { }
        this.typingUnsubs.delete(roomId);
      }
    } catch (err) { }
  }

  // try to lookup member name from loaded group members (if available)
  private lookupMemberName(groupChat: any, userId: string): string | null {
    try {
      if (!groupChat || !groupChat.members) return null;
      const m = groupChat.members[userId];
      return m?.name || null;
    } catch (e) {
      return null;
    }
  }
}
