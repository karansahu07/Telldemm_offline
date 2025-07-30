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
import { MenuPopoverComponent } from '../components/menu-popover/menu-popover.component';
import { FooterTabsComponent } from '../components/footer-tabs/footer-tabs.component';
 import { FirebaseChatService } from '../services/firebase-chat.service';

@Component({
  selector: 'app-community',
  templateUrl: './community.page.html',
  styleUrls: ['./community.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FooterTabsComponent],
})
export class CommunityPage implements OnInit {
 userId = localStorage.getItem('userId') || '';
  joinedCommunities: any[] = [];
  selectedCommunity: any = null;
  communityGroups: any[] = [];

  constructor(
    private router: Router,
    private popoverCtrl: PopoverController,
    private actionSheetCtrl: ActionSheetController,
    private firebaseService: FirebaseChatService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
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

  async loadUserCommunities() {
    this.joinedCommunities = [];
    const communityIds = await this.firebaseService.getUserCommunities(this.userId);

    for (const id of communityIds) {
      const snapshot = await this.firebaseService.getGroupInfo(id); // fallback if no direct community info
      this.joinedCommunities.push({
        id,
        name: snapshot?.name || 'Unnamed Community',
        icon: 'assets/images/user.jfif',
      });
    }
  }

  async createCommunityPrompt() {
    const alert = await this.alertCtrl.create({
      header: 'New Community',
      inputs: [
        { name: 'name', type: 'text', placeholder: 'Community Name' },
        { name: 'description', type: 'text', placeholder: 'Community Description' },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Create',
          handler: async (data) => {
            if (data.name) {
              const communityId = 'community_' + Date.now();
              await this.firebaseService.createCommunity(
                communityId,
                data.name,
                data.description,
                this.userId
              );
              await this.firebaseService.addUserToCommunity(this.userId, communityId);

              // Create announcement group automatically
              const groupId = 'group_' + Date.now();
              await this.firebaseService.createGroup(
                groupId,
                'Announcements',
                [this.userId],
                communityId,
                // true
              );

              this.loadUserCommunities();

              const toast = await this.toastCtrl.create({
                message: 'Community created successfully',
                duration: 2000,
                color: 'success',
              });
              toast.present();
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async openCommunityGroups(community: any) {
    this.selectedCommunity = community;
    this.communityGroups = [];

    const groupIds = await this.firebaseService.getGroupsInCommunity(community.id);
    for (const gid of groupIds) {
      const groupData = await this.firebaseService.getGroupInfo(gid);
      if (groupData) {
        this.communityGroups.push({
          id: gid,
          name: groupData.name,
          type: groupData.type,
        });
      }
    }
  }

  async createGroupInCommunityPrompt() {
    const alert = await this.alertCtrl.create({
      header: 'New Group',
      inputs: [
        { name: 'name', type: 'text', placeholder: 'Group Name' },
        {
          name: 'type',
          type: 'radio',
          label: 'Normal Group',
          value: 'normal',
          checked: true,
        },
        {
          name: 'type',
          type: 'radio',
          label: 'Announcement Group',
          value: 'announcement',
        },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Create',
          handler: async (data) => {
            if (!data.name || !this.selectedCommunity) return;

            const groupId = 'group_' + Date.now();
            const isAnn = data.type === 'announcement';
            await this.firebaseService.createGroup(
              groupId,
              data.name,
              [this.userId],
              this.selectedCommunity.id,
              // isAnn
            );

            this.openCommunityGroups(this.selectedCommunity);

            const toast = await this.toastCtrl.create({
              message: 'Group created',
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

  goToGroupChat(groupId: string) {
    this.router.navigate(['/chatting-screen', groupId]);
  }
}
