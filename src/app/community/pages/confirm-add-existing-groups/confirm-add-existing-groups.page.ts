import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FirebaseChatService } from 'src/app/services/firebase-chat.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-confirm-add-existing-groups',
  templateUrl: './confirm-add-existing-groups.page.html',
  styleUrls: ['./confirm-add-existing-groups.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ConfirmAddExistingGroupsPage implements OnInit {
  communityId: string | null = null;
  communityName: string | null = null; // <-- added property
  userId: string | null = null;

  // groups: array of { id, name, dp, visibility, permissionsSummary, membersCount, raw }
  groups: any[] = [];

  loading = false;
  adding = false;

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private firebaseService: FirebaseChatService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.userId = this.authService?.authData?.userId ?? null;

    // Prefer navigation extras state (when navigating with router.navigate([...], { state: {...} }))
    const navState: any = this.router.getCurrentNavigation()?.extras?.state;
    const histState: any = window.history.state;

    // read community info & groups from navigation state OR history state fallback
    this.communityId = navState?.communityId || histState?.communityId || null;
    this.communityName = navState?.communityName || histState?.communityName || null;

    // groups may be passed as `groups` array (preferred) or `selected` fallback
    this.groups = navState?.groups || histState?.groups || navState?.selected || histState?.selected || [];

    if (!this.groups || this.groups.length === 0) {
      console.warn('⚠️ No groups passed to confirm page');
    }
  }

  // Final commit: link groups into the community
  // async addToCommunity() {
  //   if (!this.communityId) {
  //     const t = await this.toastCtrl.create({
  //       message: 'Community id missing',
  //       duration: 2000,
  //       color: 'danger'
  //     });
  //     await t.present();
  //     return;
  //   }

  //   const ids = this.groups.map(g => g.id).filter(Boolean);
  //   if (!ids.length) {
  //     const t = await this.toastCtrl.create({
  //       message: 'No groups to add',
  //       duration: 1500
  //     });
  //     await t.present();
  //     return;
  //   }

  //   this.adding = true;
  //   try {
  //     const updates: any = {};

  //     for (const gid of ids) {
  //       updates[`/communities/${this.communityId}/groups/${gid}`] = true;
  //       updates[`/groups/${gid}/communityId`] = this.communityId;
  //     }

  //     if (typeof (this.firebaseService as any).bulkUpdate === 'function') {
  //       await (this.firebaseService as any).bulkUpdate(updates);
  //     } else if (typeof (this.firebaseService as any).setPath === 'function') {
  //       const promises = Object.keys(updates).map(p =>
  //         (this.firebaseService as any).setPath(p, updates[p])
  //       );
  //       await Promise.all(promises);
  //     } else {
  //       // last resort: throw with helpful message for dev
  //       throw new Error('bulkUpdate or setPath not found on FirebaseChatService. Add helper to perform atomic update.');
  //     }

  //     const toast = await this.toastCtrl.create({
  //       message: 'Groups added to community',
  //       duration: 2000,
  //       color: 'success'
  //     });
  //     await toast.present();

  //     // after success, navigate back to community detail or wherever appropriate
  //     this.navCtrl.navigateBack('/community-detail');
  //   } catch (err: any) {
  //     console.error('addToCommunity failed', err);
  //     const msg = err && (err.message || err.code) ? (err.message || err.code) : String(err);
  //     const t = await this.toastCtrl.create({
  //       message: `Failed to add groups: ${msg}`,
  //       duration: 4000,
  //       color: 'danger'
  //     });
  //     await t.present();
  //   } finally {
  //     this.adding = false;
  //   }
  // }

  async addToCommunity() {
  if (!this.communityId) {
    const t = await this.toastCtrl.create({
      message: 'Community id missing',
      duration: 2000,
      color: 'danger'
    });
    await t.present();
    return;
  }

  const ids = this.groups.map(g => g.id).filter(Boolean);
  if (!ids.length) {
    const t = await this.toastCtrl.create({
      message: 'No groups to add',
      duration: 1500
    });
    await t.present();
    return;
  }

  this.adding = true;

  try {
    const updates: any = {};
    const newMemberIds = new Set<string>();

    // 1) Collect members from each selected group
    for (const gid of ids) {
      // link group under community and set group's communityId
      updates[`/communities/${this.communityId}/groups/${gid}`] = true;
      updates[`/groups/${gid}/communityId`] = this.communityId;

      try {
        const g = await this.firebaseService.getGroupInfo(gid);
        if (g && g.members) {
          const membersObj = g.members;
          Object.keys(membersObj).forEach((mid) => {
            if (mid) newMemberIds.add(mid);
          });
        }
      } catch (err) {
        console.warn('Failed to load group members for', gid, err);
      }
    }

    // 2) Also fetch existing community members (to compute final membersCount)
    let existingMembersObj: any = null;
    try {
      const comm = await this.firebaseService.getCommunityInfo(this.communityId);
      existingMembersObj = comm?.members || {};
      // add existing to set too so count is accurate
      Object.keys(existingMembersObj || {}).forEach(k => newMemberIds.add(k));
    } catch (err) {
      console.warn('Failed to load existing community members', err);
    }

    // 3) For each member ensure community membership references + usersInCommunity index
    newMemberIds.forEach((uid) => {
      updates[`/communities/${this.communityId}/members/${uid}`] = true;
      updates[`/usersInCommunity/${uid}/joinedCommunities/${this.communityId}`] = true;
    });

    // 4) Update membersCount to new size
    updates[`/communities/${this.communityId}/membersCount`] = newMemberIds.size;

    // 5) Commit via helper on firebaseService (bulkUpdate preferred)
    if (typeof (this.firebaseService as any).bulkUpdate === 'function') {
      await (this.firebaseService as any).bulkUpdate(updates);
    } else if (typeof (this.firebaseService as any).setPath === 'function') {
      // fallback: set each path separately (not fully atomic)
      const promises = Object.keys(updates).map(p =>
        (this.firebaseService as any).setPath(p, updates[p])
      );
      await Promise.all(promises);
    } else {
      throw new Error('bulkUpdate or setPath not found on FirebaseChatService. Add helper to perform atomic update.');
    }

    const toast = await this.toastCtrl.create({
      message: 'Groups and their members added to community',
      duration: 2000,
      color: 'success'
    });
    await toast.present();

    this.navCtrl.navigateBack('/community-detail');
  } catch (err: any) {
    console.error('addToCommunity failed', err);
    const msg = err && (err.message || err.code) ? (err.message || err.code) : String(err);
    const t = await this.toastCtrl.create({
      message: `Failed to add groups: ${msg}`,
      duration: 4000,
      color: 'danger'
    });
    await t.present();
  } finally {
    this.adding = false;
  }
}
}
