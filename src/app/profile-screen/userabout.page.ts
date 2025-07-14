// import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { IonicModule, PopoverController } from '@ionic/angular';
// import { ActivatedRoute, Router } from '@angular/router';
// import { UseraboutMenuComponent } from '../components/userabout-menu/userabout-menu.component'; // Make sure the path is correct
// import { getDatabase, ref, get } from 'firebase/database';
// import { ActionSheetController, ToastController } from '@ionic/angular';
// import { remove } from 'firebase/database';


// @Component({
//   selector: 'app-userabout',
//   templateUrl: './userabout.page.html',
//   styleUrls: ['./userabout.page.scss'],
//   standalone: true,
//   schemas: [CUSTOM_ELEMENTS_SCHEMA],
//   imports: [IonicModule, CommonModule],
// })
// export class UseraboutPage implements OnInit {
//   receiverId: string = '';
//   receiver_phone: string = '';
//   isGroup: boolean = false;
//   receiver_name: string = '';
//   chatType: 'private' | 'group' = 'private';
//   groupName = '';

//   groupMembers: {
//     user_id: any; name: string; phone: string; avatar?: string 
// }[] = [];
//   groupId = "";
//   actionSheetCtrl: any;
//   toastCtrl: any;

//   constructor(
//     private router: Router,
//     private route: ActivatedRoute,
//     private popoverCtrl: PopoverController
//   ) { }

//   ngOnInit() {
//     this.route.queryParams.subscribe(async params => {
//       this.receiverId = params['receiverId'] || '';
//       this.receiver_phone = params['receiver_phone'] || '';
//       this.isGroup = params['isGroup'] === 'true';
//       this.chatType = this.isGroup ? 'group' : 'private';
//       this.receiver_name = localStorage.getItem('receiver_name') || '';
//       this.groupId = this.route.snapshot.queryParamMap.get('groupId') || '';
//       console.log("fkdsdjfg", this.receiverId)
//       if (this.chatType === 'group') {
//         // 👇 Fetch group name from Firebase
//         await this.fetchGroupName(this.receiverId);
//         // console.log("fkdsdjfg", this.receiverId);
//       }
//     });
//   }

//   isScrolled = false;

//   onScroll(event: any) {
//     const scrollTop = event.detail.scrollTop;
//     this.isScrolled = scrollTop > 10;
//   }

//   async openMenu(ev: any) {
//     const popover = await this.popoverCtrl.create({
//       component: UseraboutMenuComponent,
//       event: ev,
//       translucent: true,
//       componentProps: {
//         chatType: this.chatType,
//         groupId: this.chatType === 'group' ? this.receiverId : ''  // ✅ Pass groupId only for group chat
//       }
//     });

//     await popover.present();

//     const { data } = await popover.onDidDismiss();
//     if (data?.action) {
//       console.log('Action selected:', data.action);

//       // ✅ Optionally refresh group info if name/member was updated
//       if (data.action === 'memberAdded' || data.action === 'nameChanged') {
//         this.fetchGroupName(this.receiverId);
//       }
//     }
//   }


//   // goToHome() {
//   //   this.router.navigate(['/home-screen']);
//   // }

//   goBackToChat() {
//     this.router.navigate(['/chatting-screen'], {
//       queryParams: {
//         receiverId: this.receiverId,
//         receiver_phone: this.receiver_phone,
//         isGroup: this.isGroup
//       }
//     });
//   }

//   onAddMember() {
//   const memberPhones = this.groupMembers.map(member => member.phone);

//   this.router.navigate(['/add-members'], {
//     queryParams: {
//       groupId: this.receiverId,
//       members: JSON.stringify(memberPhones) // pass as string
//     }
//   });
// } 

// async openActionSheet(member: any) {
//   const actionSheet = await this.actionSheetCtrl.create({
//     header: member.name,
//     buttons: [
//       {
//         text: 'Remove from group',
//         role: 'destructive',
//         icon: 'person-remove',
//         handler: () => this.removeMemberFromGroup(member)
//       },
//       {
//         text: 'Cancel',
//         role: 'cancel'
//       }
//     ]
//   });
//   await actionSheet.present();
// }


// async removeMemberFromGroup(member: any) {
//   const db = getDatabase();
//   const groupId = this.groupId; // Ensure this is set from query param or elsewhere

//   try {
//     await remove(ref(db, `groups/${groupId}/members/${member.user_id}`));

//     // Remove from UI list
//     this.groupMembers = this.groupMembers.filter(m => m.user_id !== member.user_id);

//     const toast = await this.toastCtrl.create({
//       message: `${member.name} removed from group`,
//       duration: 2000,
//       color: 'success'
//     });
//     await toast.present();
//   } catch (error) {
//     console.error('Error removing member:', error);
//     const toast = await this.toastCtrl.create({
//       message: `Error removing member`,
//       duration: 2000,
//       color: 'danger'
//     });
//     await toast.present();
//   }
// }


//   // async fetchGroupName(groupId: string) {
//   //     try {
//   //       const db = getDatabase();
//   //       const groupRef = ref(db, `groups/${groupId}`);
//   //       const snapshot = await get(groupRef);

//   //       if (snapshot.exists()) {
//   //         const groupData = snapshot.val();
//   //         this.groupName = groupData.name || 'Group';
//   //       } else {
//   //         this.groupName = 'Group';
//   //       }
//   //     } catch (error) {
//   //       console.error('Error fetching group name:', error);
//   //       this.groupName = 'Group';
//   //     }
//   //   }

//   async fetchGroupName(groupId: string) {
//     try {
//       const db = getDatabase();
//       const groupRef = ref(db, `groups/${groupId}`);
//       const snapshot = await get(groupRef);

//       if (snapshot.exists()) {
//         const groupData = snapshot.val();
//         // console.log("group name:",groupData);
//         this.groupName = groupData.name || 'Group';
//         // console.log("Grouppppppp name:",this.groupName);

//         // ✅ Fetch members
//         // if (groupData.members) {
//         //   this.groupMembers = Object.values(groupData.members);
//         // }
//         if (groupData.members) {
//           this.groupMembers = Object.entries(groupData.members).map(([userId, userData]: [string, any]) => ({
//             user_id: userId,
//             ...userData
//           }));
//         } else {
//           this.groupMembers = [];
//         }
//       } else {
//         this.groupName = 'Group';
//         this.groupMembers = [];
//       }
//     } catch (error) {
//       console.error('Error fetching group name or members:', error);
//       this.groupName = 'Group';
//       this.groupMembers = [];
//     }
//     console.log("memebers name : ", this.groupMembers)
//   }

// }



import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, PopoverController, ActionSheetController, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { getDatabase, ref, get, remove } from 'firebase/database';
import { UseraboutMenuComponent } from '../components/userabout-menu/userabout-menu.component';

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
  receiver_name: string = '';
  groupId: string = '';
  isGroup: boolean = false;
  chatType: 'private' | 'group' = 'private';
  groupName: string = '';
  groupMembers: { user_id: string; name: string; phone: string; avatar?: string }[] = [];

  isScrolled: boolean = false;
  currentUserId = "";

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private popoverCtrl: PopoverController,
    private actionSheetCtrl: ActionSheetController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      this.receiverId = params['receiverId'] || '';
      this.receiver_phone = params['receiver_phone'] || '';
      this.isGroup = params['isGroup'] === 'true';
      this.chatType = this.isGroup ? 'group' : 'private';
      this.receiver_name = localStorage.getItem('receiver_name') || '';
      this.currentUserId = localStorage.getItem('userId') || '';
      this.groupId = this.route.snapshot.queryParamMap.get('groupId') || '';

      if (this.chatType === 'group') {
        await this.fetchGroupName(this.receiverId);
      }
    });
  }

  onScroll(event: any) {
    const scrollTop = event.detail.scrollTop;
    this.isScrolled = scrollTop > 10;
  }

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
    const memberPhones = this.groupMembers.map(member => member.phone);
    this.router.navigate(['/add-members'], {
      queryParams: {
        groupId: this.receiverId,
        members: JSON.stringify(memberPhones)
      }
    });
  }

  async openMenu(ev: any) {
    const popover = await this.popoverCtrl.create({
      component: UseraboutMenuComponent,
      event: ev,
      translucent: true,
      componentProps: {
        chatType: this.chatType,
        groupId: this.chatType === 'group' ? this.receiverId : ''
      }
    });

    await popover.present();

    const { data } = await popover.onDidDismiss();
    if (data?.action === 'memberAdded' || data?.action === 'nameChanged') {
      this.fetchGroupName(this.receiverId);
    }
  }

  async openActionSheet(member: any) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: member.name,
      buttons: [
        {
          text: 'Remove from group',
          role: 'destructive',
          icon: 'person-remove',
          handler: () => this.removeMemberFromGroup(member)
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

 async removeMemberFromGroup(member: any) {
  const db = getDatabase();
  const groupId = this.groupId || this.receiverId;

  if (!groupId || !member?.user_id) {
    console.error('Missing groupId or member.user_id');
    return;
  }

  const path = `groups/${groupId}/members/${member.user_id}`;
  console.log('Removing from Firebase path:', path);

  try {
    await remove(ref(db, path));

    // Remove from UI
    this.groupMembers = this.groupMembers.filter(m => m.user_id !== member.user_id);

    const toast = await this.toastCtrl.create({
      message: `${member.name} removed from group`,
      duration: 2000,
      color: 'success'
    });
    await toast.present();
  } catch (error) {
    console.error('Error removing member from Firebase:', error);
    const toast = await this.toastCtrl.create({
      message: `Error removing member`,
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
  }
}


  async fetchGroupName(groupId: string) {
    try {
      const db = getDatabase();
      const groupRef = ref(db, `groups/${groupId}`);
      const snapshot = await get(groupRef);

      if (snapshot.exists()) {
        const groupData = snapshot.val();
        this.groupName = groupData.name || 'Group';
        this.groupMembers = groupData.members
          ? Object.entries(groupData.members).map(([userId, userData]: [string, any]) => ({
              user_id: userId,
              ...userData
            }))
          : [];
      } else {
        this.groupName = 'Group';
        this.groupMembers = [];
      }
    } catch (error) {
      console.error('Error fetching group name or members:', error);
      this.groupName = 'Group';
      this.groupMembers = [];
    }
  }
}
