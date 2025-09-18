// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { IonicModule, NavController, ToastController } from '@ionic/angular';
// import { ActivatedRoute, Router } from '@angular/router';
// import { FirebaseChatService } from 'src/app/services/firebase-chat.service';
// import { AuthService } from 'src/app/auth/auth.service';

// @Component({
//   selector: 'app-confirm-add-existing-groups',
//   templateUrl: './confirm-add-existing-groups.page.html',
//   styleUrls: ['./confirm-add-existing-groups.page.scss'],
//   standalone: true,
//   imports: [IonicModule, CommonModule]
// })
// export class ConfirmAddExistingGroupsPage implements OnInit {
//   communityId: string | null = null;
//   communityName: string | null = null;
//   userId: string | null = null;

//   // groups: array of { id, name, dp, visibility, permissionsSummary, membersCount, raw }
//   groups: any[] = [];

//   loading = false;
//   adding = false;

//   constructor(
//     private route: ActivatedRoute,
//     private router: Router,
//     private navCtrl: NavController,
//     private toastCtrl: ToastController,
//     private firebaseService: FirebaseChatService,
//     private authService: AuthService
//   ) {}

//   ngOnInit() {
//     this.userId = this.authService?.authData?.userId ?? null;

//     // 1) read communityId from query params (if passed)
//     this.route.queryParams.subscribe(async params => {
//       this.communityId = params['communityId'] || params['id'] || null;
//       if (params['communityName']) this.communityName = params['communityName'];

//       // 2) read selected group ids either from query param "ids" (comma separated)
//       //    or from navigation state (preferred, since arrays encode nicely)
//       let ids: string[] = [];
//       if (params['ids']) {
//         ids = String(params['ids']).split(',').map(s => s.trim()).filter(Boolean);
//       } else {
//         // try navigation state (when you navigate with this.router.navigate([...], { state: { selected: [...] } }))
//         const navState: any = this.router.getCurrentNavigation()?.extras?.state;
//         if (navState && Array.isArray(navState.selected)) {
//           ids = navState.selected;
//         }
//       }

//       // If no IDs, check route snapshot state as fallback
//       if (!ids || ids.length === 0) {
//         const state = window.history.state;
//         if (state && Array.isArray(state.selected)) ids = state.selected;
//       }

//       if (ids && ids.length) {
//         await this.loadGroupsByIds(ids);
//       } else {
//         // nothing selected; go back
//         console.warn('No selected group IDs passed to confirm page.');
//       }
//     });
//   }

//   // fetch each group's info from /groups/<id>
//   async loadGroupsByIds(ids: string[]) {
//     this.loading = true;
//     this.groups = [];

//     try {
//       for (const id of ids) {
//         try {
//           const g = await this.firebaseService.getGroupInfo(id);
//           if (!g) continue;
//           // build minimal view model
//           this.groups.push({
//             id,
//             name: g.name || 'Unnamed group',
//             dp: g.dp || g.groupDp || '', // adapt key if you store group image under another key
//             visibility: g.visibility || 'Visible',
//             permissionsSummary: g.permissionsSummary || (g.type === 'announcement' ? 'Announcement group' : 'Members can send messages'),
//             membersCount: g.membersCount || (g.members ? Object.keys(g.members).length : 0),
//             raw: g
//           });
//         } catch (e) {
//           console.warn('Failed to fetch group', id, e);
//         }
//       }
//     } catch (err) {
//       console.error('loadGroupsByIds error', err);
//     } finally {
//       this.loading = false;
//     }
//   }

//   // Add selected groups to community (atomic if bulkUpdate exists in service)
//   async addToCommunity() {
//     if (!this.communityId) {
//       const t = await this.toastCtrl.create({ message: 'Community id missing', duration: 2000, color: 'danger' });
//       await t.present();
//       return;
//     }

//     const ids = this.groups.map(g => g.id);
//     if (!ids.length) {
//       const t = await this.toastCtrl.create({ message: 'No groups to add', duration: 1500 });
//       await t.present();
//       return;
//     }

//     this.adding = true;
//     try {
//       const updates: any = {};
//       const now = Date.now();

//       for (const gid of ids) {
//         // link group under community
//         updates[`/communities/${this.communityId}/groups/${gid}`] = true;
//         // add field on group pointing to community (optional)
//         updates[`/groups/${gid}/communityId`] = this.communityId;
//         // optionally ensure group has createdBy/admins etc - not modifying those here
//       }

//       // use bulkUpdate on service if available
//       if (typeof (this.firebaseService as any).bulkUpdate === 'function') {
//         await (this.firebaseService as any).bulkUpdate(updates);
//       } else if (typeof (this.firebaseService as any).setPath === 'function') {
//         // fallback: set each path (not atomic)
//         const promises = Object.keys(updates).map(p => (this.firebaseService as any).setPath(p, updates[p]));
//         await Promise.all(promises);
//       } else {
//         // last fallback: create bulkUpdate helper inline using getDatabase/update
//         // (avoid directly importing firebase modules in the page — recommended to add helper in service).
//         throw new Error('bulkUpdate or setPath not found on FirebaseChatService; add helper to service.');
//       }

//       const toast = await this.toastCtrl.create({ message: 'Groups added to community', duration: 2000, color: 'success' });
//       await toast.present();

//       // after success navigate back to community detail (or wherever you want)
//       this.navCtrl.navigateBack('/community-detail'); // or this.navCtrl.back();
//     } catch (err : any) {
//       console.error('addToCommunity failed', err);
//       const t = await this.toastCtrl.create({ message: 'Failed to add groups: ' + (err?.message || ''), duration: 4000, color: 'danger' });
//       await t.present();
//     } finally {
//       this.adding = false;
//     }
//   }
// }


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

      for (const gid of ids) {
        updates[`/communities/${this.communityId}/groups/${gid}`] = true;
        updates[`/groups/${gid}/communityId`] = this.communityId;
      }

      if (typeof (this.firebaseService as any).bulkUpdate === 'function') {
        await (this.firebaseService as any).bulkUpdate(updates);
      } else if (typeof (this.firebaseService as any).setPath === 'function') {
        const promises = Object.keys(updates).map(p =>
          (this.firebaseService as any).setPath(p, updates[p])
        );
        await Promise.all(promises);
      } else {
        // last resort: throw with helpful message for dev
        throw new Error('bulkUpdate or setPath not found on FirebaseChatService. Add helper to perform atomic update.');
      }

      const toast = await this.toastCtrl.create({
        message: 'Groups added to community',
        duration: 2000,
        color: 'success'
      });
      await toast.present();

      // after success, navigate back to community detail or wherever appropriate
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
