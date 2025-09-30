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
import { get, ref } from 'firebase/database';
import { TranslateModule, TranslateService } from '@ngx-translate/core'; // 👈 add

@Component({
  selector: 'app-community',
  templateUrl: './community.page.html',
  styleUrls: ['./community.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FooterTabsComponent, TranslateModule], // 👈 add
})
export class CommunityPage implements OnInit {
  userId = this.authService.authData?.userId as string;
  joinedCommunities: any[] = [];
  selectedCommunity: any = null;
  communityGroups: any[] = [];

  constructor(
    private router: Router,
    private popoverCtrl: PopoverController,
    private actionSheetCtrl: ActionSheetController,
    private firebaseService: FirebaseChatService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private authService: AuthService,
    private translate: TranslateService, // 👈 inject
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

    for (const cid of communityIds) {
      const commSnap = await get(ref(this.firebaseService['db'], `communities/${cid}`));
      if (!commSnap.exists()) continue;
      const commData = commSnap.val();

      // groups in this community
      const groupIds = await this.firebaseService.getGroupsInCommunity(cid);
      const groups: any[] = [];
      for (const gid of groupIds) {
        const gData = await this.firebaseService.getGroupInfo(gid);
        if (gData) {
          groups.push({
            id: gid,
            name: gData.name,
            type: gData.type || 'normal',
          });
        }
      }

      this.joinedCommunities.push({
        id: cid,
        name: commData.name || this.translate.instant('community.unnamedCommunity'), // 👈 localized fallback
        icon: commData.icon || 'assets/images/user.jfif',
        groups
      });
    }
  }

  createCommunityPrompt() {
    // redirect to page (text handled there)
    this.router.navigate(['/new-community']);
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
          type: groupData.type || 'normal',
        });
      }
    }
  }

  async createGroupInCommunityPrompt() {
    const t = this.translate;

    const alert = await this.alertCtrl.create({
      header: t.instant('community.newGroup.header'),
      inputs: [
        { name: 'name', type: 'text', placeholder: t.instant('community.newGroup.placeholder') },
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
        { text: t.instant('common.cancel'), role: 'cancel' },
        {
          text: t.instant('community.newGroup.create'),
          handler: async (data: any) => {
            if (!data?.name || !this.selectedCommunity) return;

            const groupId = 'group_' + Date.now();
            await this.firebaseService.createGroup(
              groupId,
              data.name,
              [this.userId],
              this.selectedCommunity.id,
            );

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

  goToGroupChat(groupId: string) {
    this.router.navigate(['/chatting-screen', groupId]);
  }

  goToAddGroupCommunity(community: any) {
    this.router.navigate(['/community-detail'], {
      queryParams: { communityId: community.id }
    });
  }
}
