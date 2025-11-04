// import { CommonModule } from '@angular/common';
// import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';
// import {
//   ActionSheetController,
//   AlertController,
//   IonicModule,
//   PopoverController,
//   ToastController,
// } from '@ionic/angular';
// import { MenuPopoverComponent } from '../../components/menu-popover/menu-popover.component';
// import { FooterTabsComponent } from '../../components/footer-tabs/footer-tabs.component';
//  import { FirebaseChatService } from '../../services/firebase-chat.service';
// import { AuthService } from '../../auth/auth.service';
// import { Database, get, ref } from 'firebase/database';
// import { TranslateModule, TranslateService } from '@ngx-translate/core';

// @Component({
//   selector: 'app-community',
//   templateUrl: './community.page.html',
//   styleUrls: ['./community.page.scss'],
//   standalone: true,
//   imports: [IonicModule, CommonModule, FooterTabsComponent,TranslateModule],
// })
// export class CommunityPage implements OnInit {
// //  userId = localStorage.getItem('userId') || '';
//   userId = this.authService.authData?.userId as string;
//   joinedCommunities: any[] = [];
//   selectedCommunity: any = null;
//   communityGroups: any[] = [];

//   constructor(
//     private router: Router,
//     private popoverCtrl: PopoverController,
//     private actionSheetCtrl: ActionSheetController,
//     private firebaseService: FirebaseChatService,
//     private alertCtrl: AlertController,
//     private toastCtrl: ToastController,
//     private authService: AuthService,
//     private translate: TranslateService 
//   ) {}

//   ngOnInit() {
//     this.loadUserCommunities();
//   }

//   async presentPopover(ev: any) {
//     const popover = await this.popoverCtrl.create({
//       component: MenuPopoverComponent,
//       event: ev,
//       translucent: true,
//     });
//     await popover.present();
//   }

//  async loadUserCommunities() {
//   this.joinedCommunities = [];
//   const communityIds = await this.firebaseService.getUserCommunities(this.userId);

//   for (const cid of communityIds) {
//     const commSnap = await get(ref(this.firebaseService['db'] as Database, `communities/${cid}`));
//     if (!commSnap.exists()) continue;
//     const commData = commSnap.val();

//     const groupIds = await this.firebaseService.getGroupsInCommunity(cid);
//     const groups: any[] = [];
//     for (const gid of groupIds) {
//       const gData = await this.firebaseService.getGroupInfo(gid);
//       if (gData) {
//         groups.push({
//           id: gid,
//           name: gData.name,
//           type: gData.type || 'normal',
//         });
//       }
//     }

//     this.joinedCommunities.push({
//       id: cid,
//       name: commData.name || this.translate.instant('community.unnamedCommunity'),
//       icon: commData.icon || 'assets/images/user.jfif',
//       groups
//     });
//   }
// }

//   async createCommunityPrompt() {
//   // instead of showing a popup, redirect to new page
//   this.router.navigate(['/new-community']);
// }

//   async openCommunityGroups(community: any) {
//     this.selectedCommunity = community;
//     this.communityGroups = [];

//     const groupIds = await this.firebaseService.getGroupsInCommunity(community.id);
//     for (const gid of groupIds) {
//       const groupData = await this.firebaseService.getGroupInfo(gid);
//       if (groupData) {
//         this.communityGroups.push({
//           id: gid,
//           name: groupData.name,
//           type: groupData.type,
//         });
//       }
//     }
//   }

//  async createGroupInCommunityPrompt() {
//   const t = this.translate;
//   const alert = await this.alertCtrl.create({
//     header: t.instant('community.newGroup.header'),
//     inputs: [
//       { name: 'name', type: 'text', placeholder: t.instant('community.newGroup.placeholder') },
//       { name: 'type', type: 'radio', label: t.instant('community.groupType.normal'), value: 'normal', checked: true },
//       { name: 'type', type: 'radio', label: t.instant('community.groupType.announcement'), value: 'announcement' },
//     ],
//     buttons: [
//       { text: t.instant('community.actions.cancel'), role: 'cancel' },
//       {
//         text: t.instant('community.newGroup.create'),
//         handler: async (data) => {
//           if (!data?.name || !this.selectedCommunity) return;
//           const groupId = 'group_' + Date.now();
//           // await this.firebaseService.createGroup({groupId, groupName : data.name, this.selectedCommunity.id});
//           this.openCommunityGroups(this.selectedCommunity);
//           const toast = await this.toastCtrl.create({
//             message: t.instant('community.toasts.groupCreated'),
//             duration: 2000,
//             color: 'success',
//           });
//           toast.present();
//         },
//       },
//     ],
//   });
//   await alert.present();
// }

// goToGroupChat(groupId: string) {
//   this.router.navigate(['/chatting-screen'], {
//     queryParams: {
//       receiverId: groupId,
//       isGroup: true
//     }
//   });
// }


//   goToAddGroupCommunity(community: any) {
//   this.router.navigate(['/community-detail'], {
//     queryParams: { communityId: community.id }
//   });
// }

// }


import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  ActionSheetController,
  AlertController,
  IonicModule,
  PopoverController,
  ToastController,
} from '@ionic/angular';
import { MenuPopoverComponent } from '../../components/menu-popover/menu-popover.component';
import { FooterTabsComponent } from '../../components/footer-tabs/footer-tabs.component';
import { FirebaseChatService } from '../../services/firebase-chat.service';
import { AuthService } from '../../auth/auth.service';
import { Database, get, ref } from 'firebase/database';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface CommunityGroup {
  id: string;
  name: string;
  type: string;
  createdAt?: number;
  isSystemGroup?: boolean;
}

interface Community {
  id: string;
  name: string;
  icon: string;
  groups: CommunityGroup[];
  displayGroups: CommunityGroup[]; // ✅ For displaying max 3 groups
  totalGroups: number; // ✅ Total group count
  hasMore: boolean; // ✅ Show "View All" button
}

@Component({
  selector: 'app-community',
  templateUrl: './community.page.html',
  styleUrls: ['./community.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FooterTabsComponent, TranslateModule],
})
export class CommunityPage implements OnInit {
  userId = this.authService.authData?.userId as string;
  joinedCommunities: Community[] = [];
  selectedCommunity: any = null;
  communityGroups: any[] = [];
  loading = false;

  constructor(
    private router: Router,
    private popoverCtrl: PopoverController,
    private actionSheetCtrl: ActionSheetController,
    private firebaseService: FirebaseChatService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private authService: AuthService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.loadUserCommunities();
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverCtrl.create({
      component: MenuPopoverComponent,
      event: ev,
      translucent: true,
    });
    await popover.present();
  }

  /**
   * ✅ UPDATED: Load communities with proper group sorting and limiting
   */
  async loadUserCommunities() {
    try {
      this.loading = true;
      this.joinedCommunities = [];

      const communityIds = await this.firebaseService.getUserCommunities(this.userId);

      for (const cid of communityIds) {
        try {
          const commSnap = await get(
            ref(this.firebaseService['db'] as Database, `communities/${cid}`)
          );
          
          if (!commSnap.exists()) continue;
          
          const commData = commSnap.val();
          const groupIds = await this.firebaseService.getGroupsInCommunity(cid);
          
          // Fetch all groups with details
          const allGroups: CommunityGroup[] = [];
          
          for (const gid of groupIds) {
            const gData = await this.firebaseService.getGroupInfo(gid);
            if (gData) {
              const groupName = gData.title || gData.name || 'Unnamed Group';
              const isSystemGroup = 
                groupName === 'Announcements' || 
                groupName === 'General' ||
                gData.type === 'announcement';

              allGroups.push({
                id: gid,
                name: groupName,
                type: gData.type || 'normal',
                createdAt: gData.createdAt || 0,
                isSystemGroup
              });
            }
          }

          // ✅ Sort groups: System groups first, then by creation date (oldest first)
          const sortedGroups = this.sortGroups(allGroups);
          
          // ✅ Get max 3 groups for display
          const displayGroups = sortedGroups.slice(0, 3);
          const hasMore = sortedGroups.length > 3;

          this.joinedCommunities.push({
            id: cid,
            name: commData.title || commData.name || this.translate.instant('community.unnamedCommunity'),
            icon: commData.avatar || commData.icon || 'assets/images/user.jfif',
            groups: sortedGroups, // ✅ All groups
            displayGroups, // ✅ Max 3 for display
            totalGroups: sortedGroups.length,
            hasMore
          });
        } catch (err) {
          console.error(`Error loading community ${cid}:`, err);
        }
      }
    } catch (error) {
      console.error('Error loading communities:', error);
      const toast = await this.toastCtrl.create({
        message: this.translate.instant('community.errors.loadFailed'),
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      this.loading = false;
    }
  }

  /**
   * ✅ Sort groups: Announcement → General → Others (by creation date)
   */
  private sortGroups(groups: CommunityGroup[]): CommunityGroup[] {
    return groups.sort((a, b) => {
      // System groups first
      if (a.isSystemGroup && !b.isSystemGroup) return -1;
      if (!a.isSystemGroup && b.isSystemGroup) return 1;

      // Within system groups: Announcement before General
      if (a.isSystemGroup && b.isSystemGroup) {
        if (a.name === 'Announcements') return -1;
        if (b.name === 'Announcements') return 1;
        if (a.name === 'General') return -1;
        if (b.name === 'General') return 1;
      }

      // For other groups: oldest first (by createdAt)
      return (a.createdAt || 0) - (b.createdAt || 0);
    });
  }

  /**
   * Create new community
   */
  async createCommunityPrompt() {
    this.router.navigate(['/new-community']);
  }

  /**
   * Open community groups (legacy method - can be removed if not needed)
   */
  async openCommunityGroups(community: any) {
    this.selectedCommunity = community;
    this.communityGroups = [];

    const groupIds = await this.firebaseService.getGroupsInCommunity(community.id);
    for (const gid of groupIds) {
      const groupData = await this.firebaseService.getGroupInfo(gid);
      if (groupData) {
        this.communityGroups.push({
          id: gid,
          name: groupData.title || groupData.name,
          type: groupData.type,
        });
      }
    }
  }

  /**
   * Create group in community
   */
  async createGroupInCommunityPrompt() {
    const t = this.translate;
    const alert = await this.alertCtrl.create({
      header: t.instant('community.newGroup.header'),
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: t.instant('community.newGroup.placeholder'),
        },
        {
          name: 'type',
          type: 'radio',
          label: t.instant('community.groupType.normal'),
          value: 'normal',
          checked: true,
        },
        {
          name: 'type',
          type: 'radio',
          label: t.instant('community.groupType.announcement'),
          value: 'announcement',
        },
      ],
      buttons: [
        { text: t.instant('community.actions.cancel'), role: 'cancel' },
        {
          text: t.instant('community.newGroup.create'),
          handler: async (data) => {
            if (!data?.name || !this.selectedCommunity) return;
            const groupId = 'group_' + Date.now();
            // await this.firebaseService.createGroup({groupId, groupName : data.name, communityId: this.selectedCommunity.id});
            this.openCommunityGroups(this.selectedCommunity);
            const toast = await this.toastCtrl.create({
              message: t.instant('community.toasts.groupCreated'),
              duration: 2000,
              color: 'success',
            });
            toast.present();
          },
        },
      ],
    });
    await alert.present();
  }

  /**
   * Navigate to group chat
   */
  goToGroupChat(groupId: string) {
    this.router.navigate(['/chatting-screen'], {
      queryParams: {
        receiverId: groupId,
        isGroup: true,
      },
    });
  }

  /**
   * ✅ View all groups in community detail page
   */
  goToAddGroupCommunity(community: Community) {
    this.router.navigate(['/community-detail'], {
      queryParams: { communityId: community.id },
      state: {
        communityName: community.name,
        communityIcon: community.icon
      }
    });
  }

  /**
   * ✅ Get icon based on group type
   */
  getGroupIcon(group: CommunityGroup): string {
    if (group.name === 'Announcements' || group.type === 'announcement') {
      return 'megaphone-outline';
    }
    if (group.name === 'General') {
      return 'people-outline';
    }
    return 'chatbox-outline';
  }

  /**
   * ✅ Get translated group type
   */
  getGroupTypeLabel(group: CommunityGroup): string {
    const typeKey = group.type || 'normal';
    return this.translate.instant(`community.groupType.${typeKey}`);
  }

  /**
   * ✅ Refresh communities
   */
  async refreshCommunities(event?: any) {
    await this.loadUserCommunities();
    if (event) {
      event.target.complete();
    }
  }
}