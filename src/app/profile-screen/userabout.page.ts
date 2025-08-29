// import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { IonicModule, PopoverController, ActionSheetController, ToastController } from '@ionic/angular';
// import { ActivatedRoute, Router } from '@angular/router';
// import { getDatabase, ref, get, remove, set, update } from 'firebase/database';
// import { UseraboutMenuComponent } from '../components/userabout-menu/userabout-menu.component';
// import { ActionSheetButton } from '@ionic/angular';
// import { FirebaseChatService } from '../services/firebase-chat.service';
// import { SecureStorageService } from '../services/secure-storage/secure-storage.service';
// import { NavController } from '@ionic/angular';
// import { NgZone } from '@angular/core';
// import { AuthService } from '../auth/auth.service';
// import { ApiService } from '../services/api/api.service';
// import { ReceiverService } from '../services/receiver.service';

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
//   receiver_name: string = '';
//   groupId: string = '';
//   isGroup: boolean = false;
//   chatType: 'private' | 'group' = 'private';
//   groupName: string = '';
//   // groupMembers: { user_id: string; name: string; phone: string; avatar?: string }[] = [];
//   groupMembers: {
//     user_id: string;
//     name: string;
//     phone: string;
//     avatar?: string;
//     role?: string;
//     phone_number?: string;
//   }[] = [];
//   commonGroups: any[] = [];
//   receiverAbout: string = '';
//   receiverAboutUpdatedAt: string = '';

//   groupDescription: string = '';
//   groupCreatedBy: string = '';
//   groupCreatedAt: string = '';
//   hasPastMembers = false;




//   isScrolled: boolean = false;
//   currentUserId = "";
//   showPastMembersButton: boolean = false;

//   constructor(
//     private router: Router,
//     private route: ActivatedRoute,
//     private popoverCtrl: PopoverController,
//     private actionSheetCtrl: ActionSheetController,
//     private toastCtrl: ToastController,
//     private firebaseChatService: FirebaseChatService,
//     private secureStorage: SecureStorageService,
//     private navCtrl: NavController,
//     private zone: NgZone,
//     private authService: AuthService,
//     private service : ApiService,
//     private receiverService : ReceiverService
//   ) { }

//   // ngOnInit() {
//   //   this.route.queryParams.subscribe(async params => {
//   //     this.receiverId = params['receiverId'] || '';
//   //     this.receiver_phone = params['receiver_phone'] || '';
//   //     this.isGroup = params['isGroup'] === 'true';
//   //     this.chatType = this.isGroup ? 'group' : 'private';
//   //     // this.receiver_name = localStorage.getItem('receiver_name') || '';
//   //     this.receiver_name = (await this.secureStorage.getItem('receiver_name')) || '';
//   //     // this.currentUserId = localStorage.getItem('userId') || '';
//   //     this.currentUserId = this.authService.authData?.userId || '';
//   //     this.groupId = this.route.snapshot.queryParamMap.get('receiverId') || '';
//   //     console.log("gruop id checking:", this.groupId);

//   //     console.log("dasfsdfgdg",this.isGroup);
//   //     // if (this.chatType === 'group') {
//   //     //   await this.fetchGroupName(this.receiverId);
//   //     // }
//   //     if (this.chatType === 'group') {
//   //       await this.fetchGroupName(this.receiverId);
//   //       await this.fetchGroupMeta(this.receiverId);
//   //     } else {
//   //       await this.fetchReceiverAbout(this.receiverId);
//   //     }
//   //   });
//   //   this.checkForPastMembers();
//   //   // this.checkForPastMembers();
//   //   this.findCommonGroups(this.currentUserId, this.receiverId);

//   // }

//   async ngOnInit() {
//   // Get receiver from service
//   const receiver = this.receiverService.getReceiver();

//   // Safely set receiver details
//   this.receiverId = receiver ? receiver.receiverId : '';
//   this.receiver_phone = receiver ? (receiver.receiverPhone || '') : '';
//   this.isGroup = receiver ? !!receiver.isGroup : false;
//   this.chatType = this.isGroup ? 'group' : 'private';
//   this.receiver_name = receiver ? (receiver.receiverName || '') : '';

//   // Current user ID
//   this.currentUserId = this.authService.authData?.userId || '';

//   // Group ID (same as receiverId if group)
//   this.groupId = this.receiverId || '';
//   console.log("group id checking:", this.groupId);
//   console.log("isGroup:", this.isGroup);

//   // Group vs Private handling
//   if (this.chatType === 'group') {
//     await this.fetchGroupName(this.receiverId);
//     await this.fetchGroupMeta(this.receiverId);
//   } else {
//     await this.fetchReceiverAbout(this.receiverId);
//   }

//   // Extra setups
//   this.checkForPastMembers();
//   this.findCommonGroups(this.currentUserId, this.receiverId);
// }


//   async ionViewWillEnter() {
//       // Get receiver from service
//   const receiver = this.receiverService.getReceiver();

//   // Safely set receiver details
//   this.receiverId = receiver ? receiver.receiverId : '';
//   this.receiver_phone = receiver ? (receiver.receiverPhone || '') : '';
//   this.isGroup = receiver ? !!receiver.isGroup : false;
//   this.chatType = this.isGroup ? 'group' : 'private';
//   this.receiver_name = receiver ? (receiver.receiverName || '') : '';

//   // Current user ID
//   this.currentUserId = this.authService.authData?.userId || '';

//   // Group ID (same as receiverId if group)
//   this.groupId = this.receiverId || '';
//   console.log("group id checking:", this.groupId);
//   console.log("isGroup:", this.isGroup);

//   // Group vs Private handling
//   if (this.chatType === 'group') {
//     await this.fetchGroupName(this.receiverId);
//     await this.fetchGroupMeta(this.receiverId);
//   } else {
//     await this.fetchReceiverAbout(this.receiverId);
//   }

//   // Extra setups
//   this.checkForPastMembers();
//   this.findCommonGroups(this.currentUserId, this.receiverId);
//   }

  

//   onScroll(event: any) {
//     const scrollTop = event.detail.scrollTop;
//     this.isScrolled = scrollTop > 10;
//   }

//   goBackToChat() {
//     this.router.navigate(['/chatting-screen'], {
//       // queryParams: {
//       //   receiverId: this.receiverId,
//       //   receiver_phone: this.receiver_phone,
//       //   isGroup: this.isGroup
//       // }
//     });
//   }

//   openProfileDp() {
//   this.router.navigate(['/profile-dp-view'], {
//     queryParams: { image: 'assets/images/user.jfif', isGroup: this.chatType === 'group', receiverId: this.receiverId, }
//   });
// }

//   onAddMember() {
//     // console.log("fjsdkfjdgdg on clickherees")
//     const memberPhones = this.groupMembers.map(member => member.phone);
//     this.router.navigate(['/add-members'], {
//       queryParams: {
//         groupId: this.receiverId,
//         members: JSON.stringify(memberPhones)
//       }
//     });
//   }


//   viewPastMembers() {
//     this.router.navigate(['/view-past-members'], {
//       queryParams: {
//         groupId: this.receiverId
//       }
//     });
//   }


//   async openMenu(ev: any) {
//     const popover = await this.popoverCtrl.create({
//       component: UseraboutMenuComponent,
//       event: ev,
//       translucent: true,
//       componentProps: {
//         chatType: this.chatType,
//         groupId: this.chatType === 'group' ? this.receiverId : ''
//       }
//     });

//     await popover.present();

//     const { data } = await popover.onDidDismiss();
//     if (data?.action === 'memberAdded' || data?.action === 'nameChanged') {
//       this.fetchGroupName(this.receiverId);
//     }
//   }

//   openGroupDescriptionPage() {
//     if (this.chatType === 'group') {
//       this.navCtrl.navigateForward(`/group-description`, {
//         queryParams: {
//           receiverId: this.receiverId,
//           currentDescription: this.groupDescription,
//           receiver_name: this.receiver_name,
//           isGroup: this.isGroup
//         }
//       });
//     }
//     // console.log("this.chatType === 'group'",this.isGroup);
//   }

//   async openActionSheet(member: any) {
//     const buttons: ActionSheetButton[] = [
//       {
//         text: 'Message',
//         icon: 'chatbox',
//         handler: () => this.messageMember(member)
//       },
//     ];

//     // Only show "Remove from group" if current user is admin
//     // And not removing self
//     const isCurrentUserAdmin = this.groupMembers.find(m => m.user_id === this.currentUserId)?.role === 'admin';
//     const isTargetUserAdmin = member.role === 'admin';
//     const isSelf = member.user_id === this.currentUserId;

//     if (isCurrentUserAdmin && !isSelf) {
//       if (isTargetUserAdmin) {
//         buttons.push({
//           text: 'Dismiss as Admin',
//           icon: 'remove-circle',
//           handler: () => this.dismissAdmin(member)
//         });
//       } else {
//         buttons.push({
//           text: 'Make Admin',
//           icon: 'person-add',
//           handler: () => this.makeAdmin(member)
//         });
//       }

//       buttons.push({
//         text: 'Remove from Group',
//         icon: 'person-remove',
//         role: 'destructive',
//         handler: () => this.removeMemberFromGroup(member)
//       });
//     }

//     buttons.push({
//       text: 'Cancel',
//       role: 'cancel'
//     });

//     const actionSheet = await this.actionSheetCtrl.create({
//       header: member.name,
//       buttons
//     });

//     await actionSheet.present();
//   }

//   //in this need of updation -----------------------------------------------------------------------------------------
//   // messageMember(member: any) {
//   //   const senderId = localStorage.getItem('userId') || '';
//   //   const receiverId = member.user_id;
//   //   // console.log("membewr id", receiverId);

//   //   if (!senderId || !receiverId) {
//   //     alert('Missing sender or receiver ID');
//   //     return;
//   //   }

//   //   const roomId = senderId < receiverId ? `${senderId}_${receiverId}` : `${receiverId}_${senderId}`;
//   //   // console.log("roome id created", roomId);
//   //   const receiverPhone = member.phone_number || member.phone;

//   //   // Optional: set for UI display on chatting screen
//   //   // localStorage.setItem('receiver_name', member.name);

//   //   // Navigate with all required params
//   //   // this.router.navigate(['/chatting-screen'], {
//   //   //   queryParams: {
//   //   //     receiverId: receiverId,
//   //   //     receiver_phone: receiverPhone,
//   //   //     roomId: roomId,
//   //   //     chatType: 'private'
//   //   //   }
//   //   // });
//   //   this.router.navigate(['/chatting-screen'], {
//   //   queryParams: {
//   //     receiverId: receiverId,
//   //     receiver_phone: receiverPhone,
//   //     roomId: roomId,
//   //     receiver_name: member.name,
//   //     chatType: 'private'
//   //   }
//   // });
//   // }

//   async  messageMember(member: any) {
//     // const senderId = localStorage.getItem('userId') || '';
//     const senderId = this.authService.authData?.userId || '';
//     const receiverId = member.user_id;

//     if (!senderId || !receiverId) {
//       alert('Missing sender or receiver ID');
//       return;
//     }

//     const roomId = senderId < receiverId ? `${senderId}_${receiverId}` : `${receiverId}_${senderId}`;
//     const receiverPhone = member.phone_number || member.phone;
//     const receiverName = member.receiver_name;
//     const isGroup = receiverPhone ? false : true;
    
//     await this.receiverService.setReceiver({
//       receiverId: receiverId,
//       receiverPhone: '',
//       receiverName: receiverName,
//       isGroup: isGroup,
//       roomId : roomId
//     });

//     this.router.navigate(['/chatting-screen'], {
//       // queryParams: {
//       //   receiverId: receiverId,
//       //   receiver_phone: receiverPhone,
//       //   roomId: roomId,
//       //   receiver_name: member.name,
//       //   chatType: 'private'
//       // }
//     });
//   }


//   async makeAdmin(member: any) {
//     const db = getDatabase();
//     const groupId = this.groupId || this.receiverId;

//     if (!groupId || !member?.user_id) {
//       console.error('Missing groupId or member.user_id');
//       return;
//     }

//     const memberRef = ref(db, `groups/${groupId}/members/${member.user_id}`);

//     try {
//       await update(memberRef, { role: 'admin' });

//       // ✅ Optional: Update in UI
//       const updatedMemberIndex = this.groupMembers.findIndex(m => m.user_id === member.user_id);
//       if (updatedMemberIndex !== -1) {
//         this.groupMembers[updatedMemberIndex].role = 'admin';
//       }

//       const toast = await this.toastCtrl.create({
//         message: `${member.name} is now an admin`,
//         duration: 2000,
//         color: 'success'
//       });
//       await toast.present();
//     } catch (error) {
//       console.error('Error promoting member to admin:', error);
//       const toast = await this.toastCtrl.create({
//         message: `Failed to make ${member.name} admin`,
//         duration: 2000,
//         color: 'danger'
//       });
//       await toast.present();
//     }
//   }

//   async dismissAdmin(member: any) {
//     const db = getDatabase();
//     const groupId = this.groupId || this.receiverId;

//     if (!groupId || !member?.user_id) {
//       console.error('Missing groupId or member.user_id');
//       return;
//     }

//     const memberRef = ref(db, `groups/${groupId}/members/${member.user_id}`);

//     try {
//       await update(memberRef, { role: 'member' });

//       // ✅ Optional: Update in local UI
//       const updatedIndex = this.groupMembers.findIndex(m => m.user_id === member.user_id);
//       if (updatedIndex !== -1) {
//         this.groupMembers[updatedIndex].role = 'member';
//       }

//       const toast = await this.toastCtrl.create({
//         message: `${member.name} is no longer an admin`,
//         duration: 2000,
//         color: 'medium'
//       });
//       await toast.present();
//     } catch (error) {
//       console.error('Error demoting admin to member:', error);
//       const toast = await this.toastCtrl.create({
//         message: `Failed to dismiss ${member.name} as admin`,
//         duration: 2000,
//         color: 'danger'
//       });
//       await toast.present();
//     }
//   }

//   // async removeMemberFromGroup(member: any) {
//   //   const db = getDatabase();
//   //   const groupId = this.groupId || this.receiverId;

//   //   if (!groupId || !member?.user_id) {
//   //     console.error('Missing groupId or member.user_id');
//   //     return;
//   //   }

//   //   const memberPath = `groups/${groupId}/members/${member.user_id}`;
//   //   const pastMemberPath = `groups/${groupId}/pastmembers/${member.user_id}`;

//   //   console.log('Deactivating and moving to pastmembers:', memberPath);

//   //   try {
//   //     // Update the status to "inactive" in members first
//   //     await update(ref(db, memberPath), {
//   //       ...member,
//   //       status: 'inactive'
//   //     });

//   //     // Move member to pastmembers node
//   //     await set(ref(db, pastMemberPath), {
//   //       ...member,
//   //       status: 'inactive',
//   //       removedAt: new Date().toLocaleString()
//   //     });

//   //     // Remove from current members
//   //     await remove(ref(db, memberPath));

//   //     // Remove from UI
//   //     this.groupMembers = this.groupMembers.filter(m => m.user_id !== member.user_id);

//   //     const toast = await this.toastCtrl.create({
//   //       message: `${member.name} removed from group`,
//   //       duration: 2000,
//   //       color: 'success'
//   //     });
//   //     await toast.present();
//   //   } catch (error) {
//   //     console.error('Error moving member to pastmembers:', error);
//   //     const toast = await this.toastCtrl.create({
//   //       message: `Error removing member`,
//   //       duration: 2000,
//   //       color: 'danger'
//   //     });
//   //     await toast.present();
//   //   }
//   // }

//   async removeMemberFromGroup(member: any) {
//   const db = getDatabase();
//   const groupId = this.groupId || this.receiverId;

//   if (!groupId || !member?.user_id) {
//     console.error('Missing groupId or member.user_id');
//     return;
//   }

//   const memberPath = `groups/${groupId}/members/${member.user_id}`;
//   const pastMemberPath = `groups/${groupId}/pastmembers/${member.user_id}`;

//   console.log('Deactivating and moving to pastmembers:', memberPath);

//   try {
//     // Update the status to "inactive" in members first
//     await update(ref(db, memberPath), {
//       ...member,
//       status: 'inactive'
//     });

//     // Move member to pastmembers node
//     await set(ref(db, pastMemberPath), {
//       ...member,
//       status: 'inactive',
//       removedAt: new Date().toLocaleString()
//     });

//     // Remove from current members
//     await remove(ref(db, memberPath));

//     // Get backend group ID from Firebase
//     const backendGroupId = await this.getBackendGroupId(groupId);
    
//     if (backendGroupId) {
//       // Call API to update member status in backend
//       this.service.updateMemberStatus(backendGroupId, Number(member.user_id), false).subscribe({
//         next: (res: any) => {
//           console.log('Member status updated in backend:', res);
//         },
//         error: (error: any) => {
//           console.error('Error updating member status in backend:', error);
//         }
//       });
//     }

//     this.groupMembers = this.groupMembers.filter(m => m.user_id !== member.user_id);

//     const toast = await this.toastCtrl.create({
//       message: `${member.name} removed from group`,
//       duration: 2000,
//       color: 'success'
//     });
//     await toast.present();
//   } catch (error) {
//     console.error('Error moving member to pastmembers:', error);
//     const toast = await this.toastCtrl.create({
//       message: `Error removing member`,
//       duration: 2000,
//       color: 'danger'
//     });
//     await toast.present();
//   }
// }

// // Helper function to get backend group ID from Firebase (if you don't have it already)
// async getBackendGroupId(firebaseGroupId: string): Promise<number | null> {
//   try {
//     const db = getDatabase();
//     const groupRef = ref(db, `groups/${firebaseGroupId}/backendGroupId`);
//     const snapshot = await get(groupRef);
//     return snapshot.exists() ? snapshot.val() : null;
//   } catch (error) {
//     console.error('Error getting backend group ID:', error);
//     return null;
//   }
// }

//   async checkForPastMembers() {
//   if (!this.groupId) return;

//   const db = getDatabase();
//   const pastRef = ref(db, `groups/${this.groupId}/pastmembers`);

//   try {
//     const snapshot = await get(pastRef);
//     const exists = snapshot.exists();

//     // ✅ Run inside Angular zone to trigger change detection
//     this.zone.run(() => {
//       this.hasPastMembers = exists;
//     });
//   } catch (error) {
//     console.error('Error checking past members:', error);
//     this.zone.run(() => {
//       this.hasPastMembers = false;
//     });
//   }
// }

//   async createGroupWithMember() {
//     // const currentUserId = localStorage.getItem('userId');
//     const currentUserId = this.authService.authData?.userId;
//     // const currentUserPhone = localStorage.getItem('phone_number');
//     const currentUserPhone = this.authService.authData?.phone_number;
//     const currentUserName = this.authService.authData?.name || currentUserPhone;

//     if (!currentUserId || !this.receiverId || !this.receiver_name) {
//       console.error('Missing data for group creation');
//       return;
//     }

//     const groupId = `group_${Date.now()}`;
//     const groupName = `${currentUserName}, ${this.receiver_name}`;

//     const members = [
//       {
//         user_id: currentUserId,
//         name: currentUserName,
//         phone_number: currentUserPhone
//       },
//       {
//         user_id: this.receiverId,
//         name: this.receiver_name,
//         phone_number: this.receiver_phone
//       }
//     ];

//     try {
//       await this.firebaseChatService.createGroup(groupId, groupName, members, currentUserId);
//       this.router.navigate(['/chatting-screen'], {
//         queryParams: { receiverId: groupId, isGroup: true }
//       });
//     } catch (error) {
//       console.error('Error creating group:', error);
//     }
//   }

//   async findCommonGroups(currentUserId: string, receiverId: string) {
//     if (!currentUserId || !receiverId) return;

//     const db = getDatabase();
//     const groupsRef = ref(db, 'groups');

//     try {
//       const snapshot = await get(groupsRef);
//       if (snapshot.exists()) {
//         const allGroups = snapshot.val();
//         const matchedGroups: any[] = [];

//         Object.entries(allGroups).forEach(([groupId, groupData]: any) => {
//           const members = groupData.members || {};

//           if (members[currentUserId] && members[receiverId]) {
//             matchedGroups.push({
//               groupId,
//               name: groupData.name || 'Unnamed Group'
//             });
//           }
//         });

//         this.commonGroups = matchedGroups;
//         console.log('Common Groups:', this.commonGroups);
//       }
//     } catch (error) {
//       console.error('Error fetching common groups:', error);
//     }
//   }

//   async fetchGroupMeta(groupId: string) {
//     const db = getDatabase();
//     const groupRef = ref(db, `groups/${groupId}`);

//     try {
//       const snapshot = await get(groupRef);
//       if (snapshot.exists()) {
//         const groupData = snapshot.val();
//         this.groupDescription = groupData.description || 'No group description.';
//         this.groupCreatedBy = groupData.createdByName || 'Unknown';
//         this.groupCreatedAt = groupData.createdAt || '';
//       }
//     } catch (error) {
//       console.error('Error fetching group meta:', error);
//     }
//   }

//   async fetchReceiverAbout(userId: string) {
//     const db = getDatabase();
//     const userRef = ref(db, `users/${userId}`);

//     try {
//       const snapshot = await get(userRef);
//       if (snapshot.exists()) {
//         const userData = snapshot.val();
//         this.receiverAbout = userData.about || 'Hey there! I am using WhatsApp.';
//         this.receiverAboutUpdatedAt = userData.updatedAt || '';
//       }
//     } catch (error) {
//       console.error('Error fetching receiver about info:', error);
//     }
//   }


//   async fetchGroupName(groupId: string) {
//     try {
//       const db = getDatabase();
//       const groupRef = ref(db, `groups/${groupId}`);
//       const snapshot = await get(groupRef);

//       if (snapshot.exists()) {
//         const groupData = snapshot.val();
//         this.groupName = groupData.name || 'Group';
//         this.groupMembers = groupData.members
//           ? Object.entries(groupData.members).map(([userId, userData]: [string, any]) => ({
//             // user_id: userId,
//             // ...userData
//             user_id: userId,
//             phone_number: userData.phone_number,
//             ...userData
//           }))
//           : [];
//       } else {
//         this.groupName = 'Group';
//         this.groupMembers = [];
//       }
//     } catch (error) {
//       console.error('Error fetching group name or members:', error);
//       this.groupName = 'Group';
//       this.groupMembers = [];
//     }
//     console.log("group members", this.groupMembers);
//   }
// }


import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, PopoverController, ActionSheetController, ToastController, AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { getDatabase, ref, get, remove, set, update } from 'firebase/database';
import { UseraboutMenuComponent } from '../components/userabout-menu/userabout-menu.component';
import { ActionSheetButton } from '@ionic/angular';
import { FirebaseChatService } from '../services/firebase-chat.service';
import { SecureStorageService } from '../services/secure-storage/secure-storage.service';
import { NavController } from '@ionic/angular';
import { NgZone } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { ApiService } from '../services/api/api.service';
// import { AlertController } from '@ionic/angular';
import { push, child } from 'firebase/database';
import { query, limitToLast, onValue } from "firebase/database";


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
  // groupMembers: { user_id: string; name: string; phone: string; avatar?: string }[] = [];
  groupMembers: {
    user_id: string;
    name: string;
    phone: string;
    avatar?: string;
    role?: string;
    phone_number?: string;
  }[] = [];
  commonGroups: any[] = [];
  receiverAbout: string = '';
  receiverAboutUpdatedAt: string = '';

  groupDescription: string = '';
  groupCreatedBy: string = '';
  groupCreatedAt: string = '';
  hasPastMembers = false;




  isScrolled: boolean = false;
  currentUserId = "";
  showPastMembersButton: boolean = false;
  
isBlocked: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private popoverCtrl: PopoverController,
    private actionSheetCtrl: ActionSheetController,
    private toastCtrl: ToastController,
    private firebaseChatService: FirebaseChatService,
    private secureStorage: SecureStorageService,
    private navCtrl: NavController,
    private zone: NgZone,
    private authService: AuthService,
    private service : ApiService,
    private alertCtrl: AlertController,
  // private toastCtrl: ToastController,
  // private authService: AuthService,
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      this.receiverId = params['receiverId'] || '';
      this.receiver_phone = params['receiver_phone'] || '';
      this.isGroup = params['isGroup'] === 'true';
      this.chatType = this.isGroup ? 'group' : 'private';
      // this.receiver_name = localStorage.getItem('receiver_name') || '';
      this.receiver_name = (await this.secureStorage.getItem('receiver_name')) || '';
      // this.currentUserId = localStorage.getItem('userId') || '';
      this.currentUserId = this.authService.authData?.userId || '';
      this.groupId = this.route.snapshot.queryParamMap.get('receiverId') || '';
      console.log("gruop id checking:", this.groupId);

      console.log("dasfsdfgdg",this.isGroup);
      // if (this.chatType === 'group') {
      //   await this.fetchGroupName(this.receiverId);
      // }
      if (this.chatType === 'group') {
        await this.fetchGroupName(this.receiverId);
        await this.fetchGroupMeta(this.receiverId);  // 👈 fetch group description
      } else {
        await this.fetchReceiverAbout(this.receiverId);  // 👈 fetch private user about
      }
    });
    this.checkForPastMembers();
    // this.checkForPastMembers();
    this.findCommonGroups(this.currentUserId, this.receiverId);
      this.checkIfBlocked();

  }

  ionViewWillEnter() {
    this.route.queryParams.subscribe(async params => {
      this.receiverId = params['receiverId'] || '';
      this.receiver_phone = params['receiver_phone'] || '';
      this.isGroup = params['isGroup'] === 'true';
      this.chatType = this.isGroup ? 'group' : 'private';
      // this.receiver_name = localStorage.getItem('receiver_name') || '';
      // this.receiver_name = (await this.secureStorage.getItem('receiver_name')) || '';
      this.receiver_name = params['receiver_name'] || '';  //this will not update in real device
      console.log("redirect name", this.receiver_name);
      // this.currentUserId = localStorage.getItem('userId') || '';
      this.currentUserId = this.authService.authData?.userId || '';
      this.groupId = this.route.snapshot.queryParamMap.get('receiverId') || '';

      // console.log("dasfsdfgdg",this.isGroup);
      // console.log("dasfsdfgdg",params['isGroup']);

      // if (this.chatType === 'group') {
      //   await this.fetchGroupName(this.receiverId);
      // }
      if (this.chatType === 'group') {
        await this.fetchGroupName(this.receiverId);
        await this.fetchGroupMeta(this.receiverId);  // 👈 fetch group description
      } else {
        await this.fetchReceiverAbout(this.receiverId);  // 👈 fetch private user about
      }
    });
    this.checkForPastMembers();
    this.findCommonGroups(this.currentUserId, this.receiverId);
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

  openProfileDp() {
  this.router.navigate(['/profile-dp-view'], {
    queryParams: { image: 'assets/images/user.jfif', isGroup: this.chatType === 'group', receiverId: this.receiverId, }
  });
}

  onAddMember() {
    // console.log("fjsdkfjdgdg on clickherees")
    const memberPhones = this.groupMembers.map(member => member.phone);
    this.router.navigate(['/add-members'], {
      queryParams: {
        groupId: this.receiverId,
        members: JSON.stringify(memberPhones)
      }
    });
  }


  viewPastMembers() {
    this.router.navigate(['/view-past-members'], {
      queryParams: {
        groupId: this.receiverId
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

  openGroupDescriptionPage() {
    if (this.chatType === 'group') {
      this.navCtrl.navigateForward(`/group-description`, {
        queryParams: {
          receiverId: this.receiverId,
          currentDescription: this.groupDescription,
          receiver_name: this.receiver_name,
          isGroup: this.isGroup
        }
      });
    }
    // console.log("this.chatType === 'group'",this.isGroup);
  }

  async openActionSheet(member: any) {
    const buttons: ActionSheetButton[] = [
      {
        text: 'Message',
        icon: 'chatbox',
        handler: () => this.messageMember(member)
      },
    ];

    // Only show "Remove from group" if current user is admin
    // And not removing self
    const isCurrentUserAdmin = this.groupMembers.find(m => m.user_id === this.currentUserId)?.role === 'admin';
    const isTargetUserAdmin = member.role === 'admin';
    const isSelf = member.user_id === this.currentUserId;

    if (isCurrentUserAdmin && !isSelf) {
      if (isTargetUserAdmin) {
        buttons.push({
          text: 'Dismiss as Admin',
          icon: 'remove-circle',
          handler: () => this.dismissAdmin(member)
        });
      } else {
        buttons.push({
          text: 'Make Admin',
          icon: 'person-add',
          handler: () => this.makeAdmin(member)
        });
      }

      buttons.push({
        text: 'Remove from Group',
        icon: 'person-remove',
        role: 'destructive',
        handler: () => this.removeMemberFromGroup(member)
      });
    }

    buttons.push({
      text: 'Cancel',
      role: 'cancel'
    });

    const actionSheet = await this.actionSheetCtrl.create({
      header: member.name,
      buttons
    });

    await actionSheet.present();
  }

  //in this need of updation -----------------------------------------------------------------------------------------
  // messageMember(member: any) {
  //   const senderId = localStorage.getItem('userId') || '';
  //   const receiverId = member.user_id;
  //   // console.log("membewr id", receiverId);

  //   if (!senderId || !receiverId) {
  //     alert('Missing sender or receiver ID');
  //     return;
  //   }

  //   const roomId = senderId < receiverId ? `${senderId}_${receiverId}` : `${receiverId}_${senderId}`;
  //   // console.log("roome id created", roomId);
  //   const receiverPhone = member.phone_number || member.phone;

  //   // Optional: set for UI display on chatting screen
  //   // localStorage.setItem('receiver_name', member.name);

  //   // Navigate with all required params
  //   // this.router.navigate(['/chatting-screen'], {
  //   //   queryParams: {
  //   //     receiverId: receiverId,
  //   //     receiver_phone: receiverPhone,
  //   //     roomId: roomId,
  //   //     chatType: 'private'
  //   //   }
  //   // });
  //   this.router.navigate(['/chatting-screen'], {
  //   queryParams: {
  //     receiverId: receiverId,
  //     receiver_phone: receiverPhone,
  //     roomId: roomId,
  //     receiver_name: member.name,
  //     chatType: 'private'
  //   }
  // });
  // }

  messageMember(member: any) {
    // const senderId = localStorage.getItem('userId') || '';
    const senderId = this.authService.authData?.userId || '';
    const receiverId = member.user_id;

    if (!senderId || !receiverId) {
      alert('Missing sender or receiver ID');
      return;
    }

    const roomId = senderId < receiverId ? `${senderId}_${receiverId}` : `${receiverId}_${senderId}`;
    const receiverPhone = member.phone_number || member.phone;

    this.router.navigate(['/chatting-screen'], {
      queryParams: {
        receiverId: receiverId,
        receiver_phone: receiverPhone,
        roomId: roomId,
        receiver_name: member.name,
        chatType: 'private'
      }
    });
  }


  async makeAdmin(member: any) {
    const db = getDatabase();
    const groupId = this.groupId || this.receiverId;

    if (!groupId || !member?.user_id) {
      console.error('Missing groupId or member.user_id');
      return;
    }

    const memberRef = ref(db, `groups/${groupId}/members/${member.user_id}`);

    try {
      await update(memberRef, { role: 'admin' });

      // ✅ Optional: Update in UI
      const updatedMemberIndex = this.groupMembers.findIndex(m => m.user_id === member.user_id);
      if (updatedMemberIndex !== -1) {
        this.groupMembers[updatedMemberIndex].role = 'admin';
      }

      const toast = await this.toastCtrl.create({
        message: `${member.name} is now an admin`,
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      console.error('Error promoting member to admin:', error);
      const toast = await this.toastCtrl.create({
        message: `Failed to make ${member.name} admin`,
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  async dismissAdmin(member: any) {
    const db = getDatabase();
    const groupId = this.groupId || this.receiverId;

    if (!groupId || !member?.user_id) {
      console.error('Missing groupId or member.user_id');
      return;
    }

    const memberRef = ref(db, `groups/${groupId}/members/${member.user_id}`);

    try {
      await update(memberRef, { role: 'member' });

      // ✅ Optional: Update in local UI
      const updatedIndex = this.groupMembers.findIndex(m => m.user_id === member.user_id);
      if (updatedIndex !== -1) {
        this.groupMembers[updatedIndex].role = 'member';
      }

      const toast = await this.toastCtrl.create({
        message: `${member.name} is no longer an admin`,
        duration: 2000,
        color: 'medium'
      });
      await toast.present();
    } catch (error) {
      console.error('Error demoting admin to member:', error);
      const toast = await this.toastCtrl.create({
        message: `Failed to dismiss ${member.name} as admin`,
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  // async removeMemberFromGroup(member: any) {
  //   const db = getDatabase();
  //   const groupId = this.groupId || this.receiverId;

  //   if (!groupId || !member?.user_id) {
  //     console.error('Missing groupId or member.user_id');
  //     return;
  //   }

  //   const memberPath = `groups/${groupId}/members/${member.user_id}`;
  //   const pastMemberPath = `groups/${groupId}/pastmembers/${member.user_id}`;

  //   console.log('Deactivating and moving to pastmembers:', memberPath);

  //   try {
  //     // Update the status to "inactive" in members first
  //     await update(ref(db, memberPath), {
  //       ...member,
  //       status: 'inactive'
  //     });

  //     // Move member to pastmembers node
  //     await set(ref(db, pastMemberPath), {
  //       ...member,
  //       status: 'inactive',
  //       removedAt: new Date().toLocaleString()
  //     });

  //     // Remove from current members
  //     await remove(ref(db, memberPath));

  //     // Remove from UI
  //     this.groupMembers = this.groupMembers.filter(m => m.user_id !== member.user_id);

  //     const toast = await this.toastCtrl.create({
  //       message: `${member.name} removed from group`,
  //       duration: 2000,
  //       color: 'success'
  //     });
  //     await toast.present();
  //   } catch (error) {
  //     console.error('Error moving member to pastmembers:', error);
  //     const toast = await this.toastCtrl.create({
  //       message: `Error removing member`,
  //       duration: 2000,
  //       color: 'danger'
  //     });
  //     await toast.present();
  //   }
  // }

  async removeMemberFromGroup(member: any) {
  const db = getDatabase();
  const groupId = this.groupId || this.receiverId;

  if (!groupId || !member?.user_id) {
    console.error('Missing groupId or member.user_id');
    return;
  }

  const memberPath = `groups/${groupId}/members/${member.user_id}`;
  const pastMemberPath = `groups/${groupId}/pastmembers/${member.user_id}`;

  console.log('Deactivating and moving to pastmembers:', memberPath);

  try {
    // Update the status to "inactive" in members first
    await update(ref(db, memberPath), {
      ...member,
      status: 'inactive'
    });

    // Move member to pastmembers node
    await set(ref(db, pastMemberPath), {
      ...member,
      status: 'inactive',
      removedAt: new Date().toLocaleString()
    });

    // Remove from current members
    await remove(ref(db, memberPath));

    // Get backend group ID from Firebase
    const backendGroupId = await this.getBackendGroupId(groupId);
    
    if (backendGroupId) {
      // Call API to update member status in backend
      this.service.updateMemberStatus(backendGroupId, Number(member.user_id), false).subscribe({
        next: (res: any) => {
          console.log('Member status updated in backend:', res);
        },
        error: (error: any) => {
          console.error('Error updating member status in backend:', error);
        }
      });
    }

    this.groupMembers = this.groupMembers.filter(m => m.user_id !== member.user_id);

    const toast = await this.toastCtrl.create({
      message: `${member.name} removed from group`,
      duration: 2000,
      color: 'success'
    });
    await toast.present();
  } catch (error) {
    console.error('Error moving member to pastmembers:', error);
    const toast = await this.toastCtrl.create({
      message: `Error removing member`,
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
  }
}

// Helper function to get backend group ID from Firebase (if you don't have it already)
async getBackendGroupId(firebaseGroupId: string): Promise<number | null> {
  try {
    const db = getDatabase();
    const groupRef = ref(db, `groups/${firebaseGroupId}/backendGroupId`);
    const snapshot = await get(groupRef);
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('Error getting backend group ID:', error);
    return null;
  }
}

  async checkForPastMembers() {
  if (!this.groupId) return;

  const db = getDatabase();
  const pastRef = ref(db, `groups/${this.groupId}/pastmembers`);

  try {
    const snapshot = await get(pastRef);
    const exists = snapshot.exists();

    // ✅ Run inside Angular zone to trigger change detection
    this.zone.run(() => {
      this.hasPastMembers = exists;
    });
  } catch (error) {
    console.error('Error checking past members:', error);
    this.zone.run(() => {
      this.hasPastMembers = false;
    });
  }
}

  async createGroupWithMember() {
    // const currentUserId = localStorage.getItem('userId');
    const currentUserId = this.authService.authData?.userId;
    // const currentUserPhone = localStorage.getItem('phone_number');
    const currentUserPhone = this.authService.authData?.phone_number;
    const currentUserName = this.authService.authData?.name || currentUserPhone;

    if (!currentUserId || !this.receiverId || !this.receiver_name) {
      console.error('Missing data for group creation');
      return;
    }

    const groupId = `group_${Date.now()}`;
    const groupName = `${currentUserName}, ${this.receiver_name}`;

    const members = [
      {
        user_id: currentUserId,
        name: currentUserName,
        phone_number: currentUserPhone
      },
      {
        user_id: this.receiverId,
        name: this.receiver_name,
        phone_number: this.receiver_phone
      }
    ];

    try {
      await this.firebaseChatService.createGroup(groupId, groupName, members, currentUserId);
      this.router.navigate(['/chatting-screen'], {
        queryParams: { receiverId: groupId, isGroup: true }
      });
    } catch (error) {
      console.error('Error creating group:', error);
    }
  }

  async findCommonGroups(currentUserId: string, receiverId: string) {
    if (!currentUserId || !receiverId) return;

    const db = getDatabase();
    const groupsRef = ref(db, 'groups');

    try {
      const snapshot = await get(groupsRef);
      if (snapshot.exists()) {
        const allGroups = snapshot.val();
        const matchedGroups: any[] = [];

        Object.entries(allGroups).forEach(([groupId, groupData]: any) => {
          const members = groupData.members || {};

          if (members[currentUserId] && members[receiverId]) {
            matchedGroups.push({
              groupId,
              name: groupData.name || 'Unnamed Group'
            });
          }
        });

        this.commonGroups = matchedGroups;
        console.log('Common Groups:', this.commonGroups);
      }
    } catch (error) {
      console.error('Error fetching common groups:', error);
    }
  }

  async fetchGroupMeta(groupId: string) {
    const db = getDatabase();
    const groupRef = ref(db, `groups/${groupId}`);

    try {
      const snapshot = await get(groupRef);
      if (snapshot.exists()) {
        const groupData = snapshot.val();
        this.groupDescription = groupData.description || 'No group description.';
        this.groupCreatedBy = groupData.createdByName || 'Unknown';
        this.groupCreatedAt = groupData.createdAt || '';
      }
    } catch (error) {
      console.error('Error fetching group meta:', error);
    }
  }

  async fetchReceiverAbout(userId: string) {
    const db = getDatabase();
    const userRef = ref(db, `users/${userId}`);

    try {
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        this.receiverAbout = userData.about || 'Hey there! I am using WhatsApp.';
        this.receiverAboutUpdatedAt = userData.updatedAt || '';
      }
    } catch (error) {
      console.error('Error fetching receiver about info:', error);
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
            // user_id: userId,
            // ...userData
            user_id: userId,
            phone_number: userData.phone_number,
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
    console.log("group members", this.groupMembers);
  }

async checkIfBlocked() {
  const db = getDatabase();
  const blockRef = ref(db, `blockedContacts/${this.currentUserId}/${this.receiverId}`);
  onValue(blockRef, (snapshot) => {
    this.isBlocked = snapshot.exists();
  });
}

async blockUser() {
  const alert = await this.alertCtrl.create({
    header: 'Block Contact',
    message: `You will no longer receive messages or calls from ${this.receiver_name}.`,
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Block',
        handler: async () => {
          const db = getDatabase();
          const blockRef = ref(db, `blockedContacts/${this.currentUserId}/${this.receiverId}`);
          await set(blockRef, true);

          this.isBlocked = true;

          const toast = await this.toastCtrl.create({
            message: `${this.receiver_name} has been blocked.`,
            duration: 2000,
            color: 'danger'
          });
          toast.present();
        }
      }
    ]
  });
  await alert.present();
}

async unblockUser() {
  const alert = await this.alertCtrl.create({
    header: 'Unblock Contact',
    message: `Are you sure you want to unblock ${this.receiver_name}?`,
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
      },
      {
        text: 'OK',
        handler: async () => {
          const db = getDatabase();
          const blockRef = ref(db, `blockedContacts/${this.currentUserId}/${this.receiverId}`);
          await remove(blockRef);

          this.isBlocked = false;

          const toast = await this.toastCtrl.create({
            message: `${this.receiver_name} has been unblocked.`,
            duration: 2000,
            color: 'success'
          });
          toast.present();
        }
      }
    ]
  });

  await alert.present();
}


// ✅ Report user
async reportUser() {
  const alert = await this.alertCtrl.create({
    header: 'Report Contact',
    message: `The last 5 messages from ${this.receiver_name} will be reported. Do you also want to block this user?`,
    inputs: [{ type: 'checkbox', label: 'Also block contact', value: 'block' }],
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Report',
        handler: async (data) => {
          const db = getDatabase();

          // ✅ Fetch last 5 messages dynamically
          const msgsRef = ref(db, `messages/${this.currentUserId}_${this.receiverId}`);
          const lastMsgsQuery = query(msgsRef, limitToLast(5));
          const snapshot = await get(lastMsgsQuery);

          let lastMessages: any[] = [];
          if (snapshot.exists()) {
            snapshot.forEach((msgSnap) => {
              lastMessages.push(msgSnap.val());
            });
          }

          const reportsRef = ref(db, `reports`);
          const reportId = Date.now().toString();

          await set(child(reportsRef, reportId), {
            reportedBy: this.currentUserId,
            reportedUser: this.receiverId,
            timestamp: Date.now(),
            messages: lastMessages
          });

          if (data.includes('block')) {
            const blockRef = ref(db, `blockedContacts/${this.currentUserId}/${this.receiverId}`);
            await set(blockRef, true);
            this.isBlocked = true;
          }

          const toast = await this.toastCtrl.create({
            message: `${this.receiver_name} has been reported${data.includes('block') ? ' and blocked' : ''}.`,
            duration: 2000,
            color: 'warning'
          });
          toast.present();
        }
      }
    ]
  });

  await alert.present();
}
}
