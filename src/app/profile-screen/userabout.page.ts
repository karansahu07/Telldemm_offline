import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, PopoverController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { UseraboutMenuComponent } from '../components/userabout-menu/userabout-menu.component'; // Make sure the path is correct
import { getDatabase, ref, get } from 'firebase/database';


@Component({
  selector: 'app-userabout',
  templateUrl: './userabout.page.html',
  styleUrls: ['./userabout.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonicModule, CommonModule],
})
export class UseraboutPage implements OnInit {
  receiverId: string = '';
  receiver_phone: string = '';
  isGroup: boolean = false;
  receiver_name: string = '';
  chatType: 'private' | 'group' = 'private';
  groupName = '';

  groupMembers: { name: string; phone: string; avatar?: string }[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private popoverCtrl: PopoverController
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      this.receiverId = params['receiverId'] || '';
      this.receiver_phone = params['receiver_phone'] || '';
      this.isGroup = params['isGroup'] === 'true';
      this.chatType = this.isGroup ? 'group' : 'private';
      this.receiver_name = localStorage.getItem('receiver_name') || '';
      console.log("fkdsdjfg", this.receiverId)
      if (this.chatType === 'group') {
        // 👇 Fetch group name from Firebase
        await this.fetchGroupName(this.receiverId);
        // console.log("fkdsdjfg", this.receiverId);
      }
    });
  }

  isScrolled = false;

  onScroll(event: any) {
    const scrollTop = event.detail.scrollTop;
    this.isScrolled = scrollTop > 10;
  }

  async openMenu(ev: any) {
    const popover = await this.popoverCtrl.create({
      component: UseraboutMenuComponent,
      event: ev,
      translucent: true,
      componentProps: {
        chatType: this.chatType,
        groupId: this.chatType === 'group' ? this.receiverId : ''  // ✅ Pass groupId only for group chat
      }
    });

    await popover.present();

    const { data } = await popover.onDidDismiss();
    if (data?.action) {
      console.log('Action selected:', data.action);

      // ✅ Optionally refresh group info if name/member was updated
      if (data.action === 'memberAdded' || data.action === 'nameChanged') {
        this.fetchGroupName(this.receiverId);
      }
    }
  }


  // goToHome() {
  //   this.router.navigate(['/home-screen']);
  // }

  goBackToChat() {
    this.router.navigate(['/chatting-screen'], {
      queryParams: {
        receiverId: this.receiverId,
        receiver_phone: this.receiver_phone,
        isGroup: this.isGroup
      }
    });
  }

  onAddMember() {
    console.log('Add member clicked');
    // TODO: Open modal or navigate to Add Member page
  }

  // async fetchGroupName(groupId: string) {
  //     try {
  //       const db = getDatabase();
  //       const groupRef = ref(db, `groups/${groupId}`);
  //       const snapshot = await get(groupRef);

  //       if (snapshot.exists()) {
  //         const groupData = snapshot.val();
  //         this.groupName = groupData.name || 'Group';
  //       } else {
  //         this.groupName = 'Group';
  //       }
  //     } catch (error) {
  //       console.error('Error fetching group name:', error);
  //       this.groupName = 'Group';
  //     }
  //   }

  async fetchGroupName(groupId: string) {
    try {
      const db = getDatabase();
      const groupRef = ref(db, `groups/${groupId}`);
      const snapshot = await get(groupRef);

      if (snapshot.exists()) {
        const groupData = snapshot.val();
        // console.log("group name:",groupData);
        this.groupName = groupData.name || 'Group';

        // ✅ Fetch members
        // if (groupData.members) {
        //   this.groupMembers = Object.values(groupData.members);
        // }
        if (groupData.members) {
          this.groupMembers = Object.entries(groupData.members).map(([userId, userData]: [string, any]) => ({
            user_id: userId,
            ...userData
          }));
        } else {
          this.groupMembers = [];
        }
      } else {
        this.groupName = 'Group';
        this.groupMembers = [];
      }
    } catch (error) {
      console.error('Error fetching group name or members:', error);
      this.groupName = 'Group';
      this.groupMembers = [];
    }
    console.log("memebers name : ", this.groupMembers)
  }

}
