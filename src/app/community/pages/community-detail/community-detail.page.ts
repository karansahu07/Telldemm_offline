// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { IonicModule, NavController } from '@ionic/angular';
// import { ActivatedRoute, Router } from '@angular/router';
// import { FirebaseChatService } from '../../../services/firebase-chat.service';
// import { get, ref } from 'firebase/database';

// @Component({
//   selector: 'app-community-detail',
//   templateUrl: './community-detail.page.html',
//   styleUrls: ['./community-detail.page.scss'],
//   standalone: true,
//   imports: [IonicModule, CommonModule],
// })
// export class CommunityDetailPage implements OnInit {
//   communityId: string | null = null;
//   community: any = null;
//   announcementGroup: any = null;
//   groups: any[] = []; // other groups (non-announcement)
//   loading = false;

//   // computed counts for template (avoid using Object.* in template)
//   memberCount = 0;
//   groupCount = 0;

//   constructor(
//     private navCtrl: NavController,
//     private route: ActivatedRoute,
//     private router: Router,
//     private firebaseService: FirebaseChatService
//   ) {}

//   ngOnInit() {
//     // read communityId from query params
//     this.route.queryParams.subscribe(params => {
//       const cid = params['communityId'] || params['id'];
//       if (!cid) {
//         return;
//       }
//       this.communityId = cid;
//       this.loadCommunityDetail();
//     });
//   }

//   async loadCommunityDetail() {
//     if (!this.communityId) return;
//     this.loading = true;
//     try {
//       // fetch community node
//       const commSnap = await get(ref(this.firebaseService['db'], `communities/${this.communityId}`));
//       if (!commSnap.exists()) {
//         this.community = null;
//         this.memberCount = 0;
//         this.groupCount = 0;
//         this.loading = false;
//         return;
//       }
//       this.community = commSnap.val();

//       // compute counts from the community object (fallbacks)
//       this.memberCount = this.community.membersCount ??
//         (this.community.members ? Object.keys(this.community.members).length : 0);

//       this.groupCount = this.community.groups ? Object.keys(this.community.groups).length : 0;

//       // fetch groups for community (ids)
//       const groupIds = await this.firebaseService.getGroupsInCommunity(this.communityId);

//       this.announcementGroup = null;
//       this.groups = [];

//       // fetch details for each group
//       for (const gid of groupIds) {
//         const g = await this.firebaseService.getGroupInfo(gid);
//         if (!g) continue;

//         const groupObj = {
//           id: gid,
//           name: g.name || 'Unnamed group',
//           type: g.type || 'normal',
//           lastMessage: g.lastMessage || null,
//           membersCount: g.membersCount || (g.members ? Object.keys(g.members).length : 0)
//         };

//         if (groupObj.type === 'announcement' && !this.announcementGroup) {
//           this.announcementGroup = groupObj;
//         } else {
//           this.groups.push(groupObj);
//         }
//       }

//       // optional: sort groups (general first)
//       this.groups.sort((a, b) => {
//         if (a.name === 'General') return -1;
//         if (b.name === 'General') return 1;
//         return (a.name || '').localeCompare(b.name || '');
//       });

//     } catch (err) {
//       console.error('loadCommunityDetail error', err);
//     } finally {
//       this.loading = false;
//     }
//   }

//   goToaddgroupcommunity() {
//     // navigate to add-group-community and pass communityId
//     this.router.navigate(['/add-group-community'], {
//       queryParams: { communityId: this.communityId }
//     });
//   }

//   openGroupChat(groupId: string) {
//     this.router.navigate(['/chatting-screen', groupId]);
//   }

//   back() {
//     this.navCtrl.back();
//   }
// }


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, PopoverController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseChatService } from '../../../services/firebase-chat.service';
import { get, ref } from 'firebase/database';

// import the popover component
import { CommunityMenuPopoverComponent } from '../../components/community-menu-popover/community-menu-popover.component';

@Component({
  selector: 'app-community-detail',
  templateUrl: './community-detail.page.html',
  styleUrls: ['./community-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class CommunityDetailPage implements OnInit {
  communityId: string | null = null;
  community: any = null;
  announcementGroup: any = null;
  groups: any[] = [];
  loading = false;

  memberCount = 0;
  groupCount = 0;

  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private router: Router,
    private firebaseService: FirebaseChatService,
    private popoverCtrl: PopoverController
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const cid = params['communityId'] || params['id'];
      if (!cid) {
        return;
      }
      this.communityId = cid;
      this.loadCommunityDetail();
    });
  }
  // ionViewWillEnter() {
  //   this.route.queryParams.subscribe(params => {
  //     const cid = params['communityId'] || params['id'];
  //     if (!cid) {
  //       return;
  //     }
  //     this.communityId = cid;
  //     this.loadCommunityDetail();
  //   });
  // }

  async loadCommunityDetail() {
    if (!this.communityId) return;
    this.loading = true;
    try {
      const commSnap = await get(ref(this.firebaseService['db'], `communities/${this.communityId}`));
      if (!commSnap.exists()) {
        this.community = null;
        this.memberCount = 0;
        this.groupCount = 0;
        this.loading = false;
        return;
      }
      this.community = commSnap.val();

      this.memberCount = this.community.membersCount ??
        (this.community.members ? Object.keys(this.community.members).length : 0);
      this.groupCount = this.community.groups ? Object.keys(this.community.groups).length : 0;

      const groupIds = await this.firebaseService.getGroupsInCommunity(this.communityId);

      this.announcementGroup = null;
      this.groups = [];

      for (const gid of groupIds) {
        const g = await this.firebaseService.getGroupInfo(gid);
        if (!g) continue;

        const groupObj = {
          id: gid,
          name: g.name || 'Unnamed group',
          type: g.type || 'normal',
          lastMessage: g.lastMessage || null,
          membersCount: g.membersCount || (g.members ? Object.keys(g.members).length : 0)
        };

        if (groupObj.type === 'announcement' && !this.announcementGroup) {
          this.announcementGroup = groupObj;
        } else {
          this.groups.push(groupObj);
        }
      }

      this.groups.sort((a, b) => {
        if (a.name === 'General') return -1;
        if (b.name === 'General') return 1;
        return (a.name || '').localeCompare(b.name || '');
      });

    } catch (err) {
      console.error('loadCommunityDetail error', err);
    } finally {
      this.loading = false;
    }
  }

  goToaddgroupcommunity() {
    this.router.navigate(['/add-group-community'], {
      queryParams: { communityId: this.communityId }
    });
  }

//  openGroupChat(groupId: string) {
//   // navigate to community-chat and pass group id & community id as query params
//   this.router.navigate(['/community-chat'], {
//     queryParams: {
//       communityId: this.communityId,
//       groupId
//     }
//   });
// }

openGroupChat(groupId: string, groupName?: string) {
  this.router.navigate(['/community-chat'], {
    queryParams: {
      receiverId: groupId,
      isGroup: true,
      communityId: this.communityId
    }
  });
}

  back() {
    this.navCtrl.back();
  }

  // ----------------- POPUP -----------------
  async presentPopover(ev: any) {
    const pop = await this.popoverCtrl.create({
      component: CommunityMenuPopoverComponent,
      event: ev,
      translucent: true
    });
 
    await pop.present();

    const { data } = await pop.onDidDismiss();
    if (!data || !data.action) return;

    const action: string = data.action;

    switch (action) {
      case 'info':
        // navigate to a community info page (adjust route as needed)
        this.router.navigate(['/community-info'], { queryParams: { communityId: this.communityId } });
        break;
      case 'invite':
        // navigate to invitation flow
        this.router.navigate(['/invite-members'], { queryParams: { communityId: this.communityId } });
        break;
      case 'settings':
        // community settings page
        this.router.navigate(['/community-settings'], { queryParams: { communityId: this.communityId } });
        break;
      default:
        break;
    }
  }
}
