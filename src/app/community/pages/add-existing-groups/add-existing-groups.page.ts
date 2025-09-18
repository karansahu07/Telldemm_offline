// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { IonicModule, NavController, ToastController } from '@ionic/angular';
// import { ActivatedRoute, Router } from '@angular/router';
// import { FirebaseChatService } from 'src/app/services/firebase-chat.service';
// import { AuthService } from 'src/app/auth/auth.service';
// import { FormsModule } from '@angular/forms';

// @Component({
//   selector: 'app-add-existing-groups',
//   templateUrl: './add-existing-groups.page.html',
//   styleUrls: ['./add-existing-groups.page.scss'],
//   standalone: true,
//   imports: [IonicModule, CommonModule, FormsModule]
// })
// export class AddExistingGroupsPage implements OnInit {
//   communityId: string | null = null;
//   userId: string | null = null;
//   groups: Array<any> = [];
//   loading = false;
//   selectedCount = 0;
//   totalGroups = 0;

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
//     this.route.queryParams.subscribe(params => {
//       this.communityId = params['communityId'] || params['id'] || null;
//       this.loadAdminGroups();
//     });
//   }

//   // Load groups where this user is admin AND exclude community groups (keys starting with 'comm_group_')
//   async loadAdminGroups() {
//     if (!this.userId) {
//       console.error('No userId available');
//       return;
//     }
//     this.loading = true;
//     this.groups = [];

//     try {
//       const groupIds = await this.firebaseService.getGroupsForUser(this.userId);

//       for (const gid of groupIds || []) {
//         if (typeof gid !== 'string') continue;
//         if (gid.startsWith('comm_group_')) continue; // skip community-linked groups

//         const g = await this.firebaseService.getGroupInfo(gid);
//         if (!g || !g.members) continue;

//         const me = g.members[this.userId];
//         if (!me) continue;

//         // treat 'admin' / 'owner' / 'creator' as admin
//         const role = (me.role || '').toLowerCase();
//         if (role === 'admin' || role === 'owner' || role === 'creator') {
//           const memberKeys = Object.keys(g.members || {}).slice(0, 4);
//           const previewNames = memberKeys.map(k => g.members[k]?.name || k).join(', ');

//           this.groups.push({
//             id: gid,
//             name: g.name || 'Unnamed group',
//             dp: g.dp || '',
//             type: g.type || 'normal',
//             membersCount: g.membersCount || (g.members ? Object.keys(g.members).length : 0),
//             membersPreview: previewNames,
//             selected: false,
//             raw: g
//           });
//         }
//       }

//       this.totalGroups = this.groups.length;
//       this.reorderGroups(); // ensure selected first (none selected on load)
//     } catch (err) {
//       console.error('loadAdminGroups error', err);
//     } finally {
//       this.loading = false;
//       this.selectedCount = this.groups.filter(g => g.selected).length;
//     }
//   }

//   // toggle selection from checkbox or row tap
//   toggleSelect(g: any) {
//     g.selected = !g.selected;
//     this.onSelectChange();
//   }

//   onSelectChange() {
//     this.selectedCount = this.groups.filter(g => g.selected).length;
//     this.reorderGroups();
//   }

//   // move selected groups to front, preserving their relative order
//   reorderGroups() {
//     const selected = this.groups.filter(g => g.selected);
//     const others = this.groups.filter(g => !g.selected);
//     this.groups = [...selected, ...others];
//   }

//   // getter for chips row content (selected groups top)
//   get selectedGroups() {
//     return this.groups.filter(g => g.selected).slice(0, 12); // show up to 12 chips
//   }

//   // Called by forward button. Link selected groups to the community
//   async confirmSelection() {
//     const selected = this.groups.filter(g => g.selected).map(g => g.id);
//     if (selected.length === 0) {
//       const t = await this.toastCtrl.create({ message: 'Select at least one group', duration: 1500 });
//       await t.present();
//       return;
//     }

//     if (this.communityId) {
//       try {
//         // prefer using a bulkUpdate helper in your service
//         const updates: any = {};
//         selected.forEach(gid => {
//           updates[`/communities/${this.communityId}/groups/${gid}`] = true;
//           updates[`/groups/${gid}/communityId`] = this.communityId;
//         });

//         // attempt to call firebaseService.bulkUpdate if available
//         if (typeof (this.firebaseService as any).bulkUpdate === 'function') {
//           await (this.firebaseService as any).bulkUpdate(updates);
//         } else {
//           // fallback: create a simple helper in service or update individually
//           const rawDb = (this.firebaseService as any).db;
//           // best to implement bulkUpdate in service. fallback: set each path via a service util
//           if (typeof (this.firebaseService as any).setPath === 'function') {
//             const promises = Object.keys(updates).map(p => (this.firebaseService as any).setPath(p, updates[p]));
//             await Promise.all(promises);
//           } else {
//             // final fallback: attempt available public API paths (may not exist) -> throw
//             throw new Error('No bulkUpdate or setPath available on FirebaseChatService. Add one to commit atomically.');
//           }
//         }

//         const toast = await this.toastCtrl.create({ message: 'Groups added to community', duration: 2000, color: 'success' });
//         await toast.present();

//         // go back to community detail (or wherever)
//         this.navCtrl.back();
//       } catch (err) {
//         console.error('Error adding groups to community', err);
//         const t = await this.toastCtrl.create({ message: 'Failed to add groups', duration: 2000, color: 'danger' });
//         await t.present();
//       }
//       return;
//     }

//     const toast = await this.toastCtrl.create({ message: `${selected.length} groups selected`, duration: 1500 });
//     await toast.present();
//   }
// }


// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { IonicModule, NavController, ToastController } from '@ionic/angular';
// import { ActivatedRoute, Router } from '@angular/router';
// import { FirebaseChatService } from 'src/app/services/firebase-chat.service';
// import { AuthService } from 'src/app/auth/auth.service';
// import { FormsModule } from '@angular/forms';

// @Component({
//   selector: 'app-add-existing-groups',
//   templateUrl: './add-existing-groups.page.html',
//   styleUrls: ['./add-existing-groups.page.scss'],
//   standalone: true,
//   imports: [IonicModule, CommonModule, FormsModule]
// })
// export class AddExistingGroupsPage implements OnInit {
//   communityId: string | null = null;
//   userId: string | null = null;
//   groups: Array<any> = [];
//   loading = false;
//   selectedCount = 0;
//   totalGroups = 0;

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
//     this.route.queryParams.subscribe(params => {
//       this.communityId = params['communityId'] || params['id'] || null;
//       this.loadAdminGroups();
//     });
//   }

//   // Load groups where this user is admin AND exclude community groups (keys starting with 'comm_group_')
//   async loadAdminGroups() {
//     if (!this.userId) {
//       console.error('No userId available');
//       return;
//     }
//     this.loading = true;
//     this.groups = [];

//     try {
//       const groupIds = await this.firebaseService.getGroupsForUser(this.userId);

//       for (const gid of groupIds || []) {
//         if (typeof gid !== 'string') continue;
//         if (gid.startsWith('comm_group_')) continue; // skip community-linked groups

//         const g = await this.firebaseService.getGroupInfo(gid);
//         if (!g || !g.members) continue;

//         const me = g.members[this.userId];
//         if (!me) continue;

//         // treat 'admin' / 'owner' / 'creator' as admin
//         const role = (me.role || '').toLowerCase();
//         if (role === 'admin' || role === 'owner' || role === 'creator') {
//           const memberKeys = Object.keys(g.members || {}).slice(0, 4);
//           const previewNames = memberKeys.map(k => g.members[k]?.name || k).join(', ');

//           this.groups.push({
//             id: gid,
//             name: g.name || 'Unnamed group',
//             dp: g.dp || '',
//             type: g.type || 'normal',
//             membersCount: g.membersCount || (g.members ? Object.keys(g.members).length : 0),
//             membersPreview: previewNames,
//             selected: false,
//             raw: g
//           });
//         }
//       }

//       this.totalGroups = this.groups.length;
//       this.reorderGroups(); // ensure selected first (none selected on load)
//     } catch (err) {
//       console.error('loadAdminGroups error', err);
//     } finally {
//       this.loading = false;
//       this.selectedCount = this.groups.filter(g => g.selected).length;
//     }
//   }

//   // toggle selection from checkbox or row tap
//   toggleSelect(g: any) {
//     g.selected = !g.selected;
//     this.onSelectChange();
//   }

//   onSelectChange() {
//     this.selectedCount = this.groups.filter(g => g.selected).length;
//     this.reorderGroups();
//   }

//   // move selected groups to front, preserving their relative order
//   reorderGroups() {
//     const selected = this.groups.filter(g => g.selected);
//     const others = this.groups.filter(g => !g.selected);
//     this.groups = [...selected, ...others];
//   }

//   // getter for chips row content (selected groups top)
//   get selectedGroups() {
//     return this.groups.filter(g => g.selected).slice(0, 12); // show up to 12 chips
//   }

//   // 👉 Forward FAB handler: redirect to confirm page with selected groups
//   async confirmSelection() {
//     const selectedGroups = this.groups.filter(g => g.selected);

//     if (!selectedGroups || selectedGroups.length === 0) {
//       const t = await this.toastCtrl.create({
//         message: 'Select at least one group',
//         duration: 1500,
//         color: 'warning'
//       });
//       await t.present();
//       return;
//     }

//     // navigate to confirm page with groups + communityId
//     this.router.navigate(['/confirm-add-existing-groups'], {
//       state: {
//         groups: selectedGroups,
//         communityId: this.communityId
//       }
//     });
//   }
// }


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseChatService } from 'src/app/services/firebase-chat.service';
import { AuthService } from 'src/app/auth/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-existing-groups',
  templateUrl: './add-existing-groups.page.html',
  styleUrls: ['./add-existing-groups.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AddExistingGroupsPage implements OnInit {
  communityId: string | null = null;
  userId: string | null = null;
  groups: Array<any> = [];
  loading = false;
  selectedCount = 0;
  totalGroups = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private firebaseService: FirebaseChatService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.userId = this.authService?.authData?.userId ?? null;
    this.route.queryParams.subscribe(params => {
      this.communityId = params['communityId'] || params['id'] || null;
      this.loadAdminGroups();
    });
  }

  // Load groups where this user is admin AND exclude community groups (keys starting with 'comm_group_')
  // ALSO skip groups that already belong to any community (group.communityId present)
  async loadAdminGroups() {
    if (!this.userId) {
      console.error('No userId available');
      return;
    }

    this.loading = true;
    this.groups = [];
    let skippedBecauseCommunity = 0;

    try {
      const groupIds = await this.firebaseService.getGroupsForUser(this.userId);

      for (const gid of groupIds || []) {
        if (typeof gid !== 'string') continue;

        // skip groups that are already community-linked by naming convention
        if (gid.startsWith('comm_group_')) {
          console.log('Skipping community-linked group by prefix:', gid);
          skippedBecauseCommunity++;
          continue;
        }

        const g = await this.firebaseService.getGroupInfo(gid);
        if (!g || !g.members) continue;

        // NEW: skip groups that already have a communityId set on the group node
        if (g.communityId) {
          console.log(`Skipping group ${gid} because it already belongs to community ${g.communityId}`);
          skippedBecauseCommunity++;
          continue;
        }

        const me = g.members[this.userId];
        if (!me) continue;

        // treat 'admin' / 'owner' / 'creator' as admin
        const role = (me.role || '').toLowerCase();
        if (role === 'admin' || role === 'owner' || role === 'creator') {
          const memberKeys = Object.keys(g.members || {}).slice(0, 4);
          const previewNames = memberKeys.map(k => g.members[k]?.name || k).join(', ');

          this.groups.push({
            id: gid,
            name: g.name || 'Unnamed group',
            dp: g.dp || '',
            type: g.type || 'normal',
            membersCount: g.membersCount || (g.members ? Object.keys(g.members).length : 0),
            membersPreview: previewNames,
            selected: false,
            raw: g
          });
        }
      }

      this.totalGroups = this.groups.length;
      this.reorderGroups(); // ensure selected first (none selected on load)

      if (skippedBecauseCommunity > 0) {
        console.info(`loadAdminGroups: skipped ${skippedBecauseCommunity} groups because they are already in a community.`);
      }
    } catch (err) {
      console.error('loadAdminGroups error', err);
    } finally {
      this.loading = false;
      this.selectedCount = this.groups.filter(g => g.selected).length;
    }
  }

  // toggle selection from checkbox or row tap
  toggleSelect(g: any) {
    g.selected = !g.selected;
    this.onSelectChange();
  }

  onSelectChange() {
    this.selectedCount = this.groups.filter(g => g.selected).length;
    this.reorderGroups();
  }

  // move selected groups to front, preserving their relative order
  reorderGroups() {
    const selected = this.groups.filter(g => g.selected);
    const others = this.groups.filter(g => !g.selected);
    this.groups = [...selected, ...others];
  }

  // getter for chips row content (selected groups top)
  get selectedGroups() {
    return this.groups.filter(g => g.selected).slice(0, 12); // show up to 12 chips
  }

  // 👉 Forward FAB handler: redirect to confirm page with selected groups
  async confirmSelection() {
    const selectedGroups = this.groups.filter(g => g.selected);

    if (!selectedGroups || selectedGroups.length === 0) {
      const t = await this.toastCtrl.create({
        message: 'Select at least one group',
        duration: 1500,
        color: 'warning'
      });
      await t.present();
      return;
    }

    // navigate to confirm page with groups + communityId
    this.router.navigate(['/confirm-add-existing-groups'], {
      state: {
        groups: selectedGroups,
        communityId: this.communityId,
        communityName: null
      }
    });
  }
}
