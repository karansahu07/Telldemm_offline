// import { CommonModule } from '@angular/common';
// import { Component, OnInit, ViewChild } from '@angular/core';
// import { IonicModule, IonInput, PopoverController } from '@ionic/angular';
// import { MenuPopoverComponent } from '../components/menu-popover/menu-popover.component';
// import { ActionSheetController } from '@ionic/angular';
// import { Router } from '@angular/router';
// import { FormsModule } from '@angular/forms';

// @Component({
//   selector: 'app-contacts',
//   templateUrl: './contacts.page.html',
//   styleUrls: ['./contacts.page.scss'],
//   standalone: true,
//   imports: [IonicModule, CommonModule, FormsModule],
// })
// export class ContactsPage implements OnInit {

//   @ViewChild('searchInput', { static: false }) searchInput!: IonInput;

//   contacts = [
//     { name: 'Riya Sharma', message: 'Available', image: 'assets/images/user.jfif' },
//     { name: 'Manav Mehta', message: 'Busy at work', image: 'assets/images/user.jfif' },
//     { name: 'Tanya Verma', message: 'Let’s catch up soon!', image: 'assets/images/user.jfif' },
//     { name: 'Rohit Bansal', message: '❤️ Music is life', image: 'assets/images/user.jfif' },
//     { name: 'Priya Singh', message: 'Om Namah Shivaya 🚩', image: 'assets/images/user.jfif' },
//     { name: 'Grandma Sushma', message: 'Call in emergency only', image: 'assets/images/user.jfif' },
//     { name: 'Karan Yadav', message: '🌞 Good vibes only!', image: 'assets/images/user.jfif' },
//   ];

//   filteredContacts = [...this.contacts];
//   searchTerm: string = '';
//   showSearchBar = false;
//   keyboardType: 'text' | 'tel' = 'text'; // 'tel' for numeric keyboard

//   constructor(
//     private router: Router,
//     private popoverControl: PopoverController,
//     private actionSheetCtrl: ActionSheetController
//   ) {}

//   ngOnInit() {}

//   // Show search bar and focus input
//   focusSearchBar() {
//     this.showSearchBar = true;

//     // Wait for Angular to render the input, then focus it
//     setTimeout(() => {
//       if (this.searchInput) {
//         this.searchInput.setFocus();
//       } else {
//         console.warn('searchInput is undefined!');
//       }
//     }, 300);
//   }

//   toggleSearch() {
//     this.showSearchBar = !this.showSearchBar;
//   }

//   // Toggle between text and numeric keyboards and focus input after toggle
//   toggleKeyboardType() {
//     this.keyboardType = this.keyboardType === 'text' ? 'tel' : 'text';

//     // Delay to ensure keyboardType change is reflected
//     setTimeout(() => {
//       if (this.searchInput) {
//         this.searchInput.setFocus();
//       }
//     }, 300);
//   }

//   async presentPopover(ev: any) {
//     const popover = await this.popoverControl.create({
//       component: MenuPopoverComponent,
//       event: ev,
//       translucent: true,
//     });
//     await popover.present();
//   }

//   filterContacts() {
//     const term = this.searchTerm.toLowerCase();

//     this.filteredContacts = this.contacts.filter(
//       (contact) =>
//         contact.name.toLowerCase().includes(term) ||
//         contact.message.toLowerCase().includes(term)
//     );

//     console.log('Search Term:', term);
//     console.log('Filtered Contacts:', this.filteredContacts);
//   }
// }



// import { CommonModule } from '@angular/common';
// import { Component, OnInit, ViewChild } from '@angular/core';
// import { IonicModule, IonInput, PopoverController } from '@ionic/angular';
// import { MenuPopoverComponent } from '../components/menu-popover/menu-popover.component';
// import { ContactMenuComponent } from '../components/contact-menu/contact-menu.component'; // ✅ Import here
// import { ActionSheetController } from '@ionic/angular';
// import { Router } from '@angular/router';
// import { FormsModule } from '@angular/forms';

// @Component({
//   selector: 'app-contacts',
//   templateUrl: './contacts.page.html',
//   styleUrls: ['./contacts.page.scss'],
//   standalone: true,
//   imports: [IonicModule, CommonModule, FormsModule],
// })
// export class ContactsPage implements OnInit {

//   @ViewChild('searchInput', { static: false }) searchInput!: IonInput;

//   contacts = [
//     { name: 'Riya Sharma', message: 'Available', image: 'assets/images/user.jfif' },
//     { name: 'Manav Mehta', message: 'Busy at work', image: 'assets/images/user.jfif' },
//     { name: 'Tanya Verma', message: 'Let’s catch up soon!', image: 'assets/images/user.jfif' },
//     { name: 'Rohit Bansal', message: '❤️ Music is life', image: 'assets/images/user.jfif' },
//     { name: 'Priya Singh', message: 'Om Namah Shivaya 🚩', image: 'assets/images/user.jfif' },
//     { name: 'Grandma Sushma', message: 'Call in emergency only', image: 'assets/images/user.jfif' },
//     { name: 'Karan Yadav', message: '🌞 Good vibes only!', image: 'assets/images/user.jfif' },
//   ];

//   filteredContacts = [...this.contacts];
//   searchTerm: string = '';
//   showSearchBar = false;
//   keyboardType: 'text' | 'tel' = 'text';

//   constructor(
//     private router: Router,
//     private popoverControl: PopoverController,
//     private actionSheetCtrl: ActionSheetController
//   ) {}

//   ngOnInit() {}

//   focusSearchBar() {
//     this.showSearchBar = true;

//     setTimeout(() => {
//       if (this.searchInput) {
//         this.searchInput.setFocus();
//       }
//     }, 300);
//   }

//   toggleSearch() {
//     this.showSearchBar = !this.showSearchBar;
//   }

//   toggleKeyboardType() {
//     this.keyboardType = this.keyboardType === 'text' ? 'tel' : 'text';

//     setTimeout(() => {
//       if (this.searchInput) {
//         this.searchInput.setFocus();
//       }
//     }, 300);
//   }

//   async presentPopover(ev: any) {
//     const popover = await this.popoverControl.create({
//       component: MenuPopoverComponent,
//       event: ev,
//       translucent: true,
//     });
//     await popover.present();
//   }

//   // ✅ NEW METHOD TO OPEN ContactMenuComponent
//   async presentContactMenu(ev: any) {
//     const popover = await this.popoverControl.create({
//       component: ContactMenuComponent,
//       event: ev,
//       translucent: true,
//     });
//     await popover.present();

//     const { data } = await popover.onDidDismiss();
//     console.log('Selected Contact Menu Option:', data);
//   }

//   filterContacts() {
//     const term = this.searchTerm.toLowerCase();

//     this.filteredContacts = this.contacts.filter(
//       (contact) =>
//         contact.name.toLowerCase().includes(term) ||
//         contact.message.toLowerCase().includes(term)
//     );

//     console.log('Search Term:', term);
//     console.log('Filtered Contacts:', this.filteredContacts);
//   }
// }


// import { CommonModule } from '@angular/common';
// import { Component, OnInit, ViewChild } from '@angular/core';
// import { IonicModule, IonInput, PopoverController } from '@ionic/angular';
// import { MenuPopoverComponent } from '../components/menu-popover/menu-popover.component';
// import { ContactMenuComponent } from '../components/contact-menu/contact-menu.component';
// import { ActionSheetController } from '@ionic/angular';
// import { Router } from '@angular/router';
// import { FormsModule } from '@angular/forms';
// import { ApiService } from '../services/api/api.service';
// import { FirebaseChatService } from '../services/firebase-chat.service';

// @Component({
//   selector: 'app-contacts',
//   templateUrl: './contacts.page.html',
//   styleUrls: ['./contacts.page.scss'],
//   standalone: true,
//   imports: [IonicModule, CommonModule, FormsModule],
// })
// export class ContactsPage implements OnInit {
//   @ViewChild('searchInput', { static: false }) searchInput!: IonInput;

//   allUsers: any[] = [];
//   filteredContacts: any[] = [];

//   showSearchBar = false;
//   searchTerm: string = '';
//   keyboardType: 'text' | 'tel' = 'text';

//   creatingGroup = false;
//   newGroupName: string = '';

//   constructor(
//     private router: Router,
//     private popoverControl: PopoverController,
//     private actionSheetCtrl: ActionSheetController,
//     private apiService: ApiService,
//     private firebaseChatService: FirebaseChatService
//   ) {}

//   ngOnInit() {
//     this.loadAllUsers();
//   }

//   loadAllUsers() {
//     const currentUserPhone = localStorage.getItem('phone_number');
//     this.allUsers = [];

//     this.apiService.getAllUsers().subscribe((users: any[]) => {
//       users.forEach(user => {
//         if (user.phone_number !== currentUserPhone) {
//           this.apiService.getUserProfilebyId(user.user_id.toString()).subscribe((profile: any) => {
//             const receiverId = profile.phone_number;
//             const contact = {
//               ...user,
//               name: profile.name || user.phone_number,
//               message: profile.bio || '',
//               image: 'assets/images/user.jfif',
//               receiver_Id: receiverId,
//               selected: false,
//             };
//             this.allUsers.push(contact);
//             this.filteredContacts = [...this.allUsers];
//           });
//         }
//       });
//     });
//   }

//   startGroupCreation() {
//     this.creatingGroup = true;
//   }

//   async createGroup() {
//     const selectedUsers = this.allUsers.filter(user => user.selected);
//     const memberIds = selectedUsers.map(u => u.receiver_Id);
//     const currentUser = localStorage.getItem('phone_number');

//     if (currentUser) memberIds.push(currentUser);
//     const groupId = `group_${Date.now()}`;

//     if (!this.newGroupName.trim()) {
//       alert('Group name is required');
//       return;
//     }

//     await this.firebaseChatService.createGroup(groupId, this.newGroupName, memberIds);
//     this.creatingGroup = false;
//     this.newGroupName = '';
//     this.allUsers.forEach(u => (u.selected = false));
//     alert('Group created successfully');
//   }

//   focusSearchBar() {
//     this.showSearchBar = true;
//     setTimeout(() => this.searchInput?.setFocus(), 300);
//   }

//   toggleSearch() {
//     this.showSearchBar = !this.showSearchBar;
//   }

//   toggleKeyboardType() {
//     this.keyboardType = this.keyboardType === 'text' ? 'tel' : 'text';
//     setTimeout(() => this.searchInput?.setFocus(), 300);
//   }

//   async presentPopover(ev: any) {
//     const popover = await this.popoverControl.create({
//       component: MenuPopoverComponent,
//       event: ev,
//       translucent: true,
//     });
//     await popover.present();
//   }

//   async presentContactMenu(ev: any) {
//     const popover = await this.popoverControl.create({
//       component: ContactMenuComponent,
//       event: ev,
//       translucent: true,
//     });
//     await popover.present();
//     const { data } = await popover.onDidDismiss();
//     console.log('Selected Contact Menu Option:', data);
//   }

//   filterContacts() {
//     const term = this.searchTerm.toLowerCase();
//     this.filteredContacts = this.allUsers.filter(
//       contact =>
//         contact.name?.toLowerCase().includes(term) ||
//         contact.message?.toLowerCase().includes(term)
//     );
//   }
// }

//this is for demo on web
// import { CommonModule } from '@angular/common';
// import { Component, OnInit, ViewChild } from '@angular/core';
// import { IonicModule, IonInput, PopoverController } from '@ionic/angular';
// import { MenuPopoverComponent } from '../components/menu-popover/menu-popover.component';
// import { ContactMenuComponent } from '../components/contact-menu/contact-menu.component';
// import { ActionSheetController } from '@ionic/angular';
// import { Router } from '@angular/router';
// import { FormsModule } from '@angular/forms';
// import { ApiService } from '../services/api/api.service';
// import { FirebaseChatService } from '../services/firebase-chat.service';

// @Component({
//   selector: 'app-contacts',
//   templateUrl: './contacts.page.html',
//   styleUrls: ['./contacts.page.scss'],
//   standalone: true,
//   imports: [IonicModule, CommonModule, FormsModule],
// })
// export class ContactsPage implements OnInit {
//   @ViewChild('searchInput', { static: false }) searchInput!: IonInput;

//   allUsers: any[] = [];
//   filteredContacts: any[] = [];

//   showSearchBar = false;
//   searchTerm: string = '';
//   keyboardType: 'text' | 'tel' = 'text';

//   creatingGroup = false;
//   newGroupName: string = '';

//   constructor(
//     private router: Router,
//     private popoverControl: PopoverController,
//     private actionSheetCtrl: ActionSheetController,
//     private service: ApiService,
//     private firebaseChatService: FirebaseChatService
//   ) {}

//   ngOnInit() {
//     this.loadAllUsers();
//   }

//   loadAllUsers() {
//     const currentUserPhone = localStorage.getItem('phone_number');
//     this.allUsers = [];

//     this.service.getAllUsers().subscribe((users: any[]) => {
//       console.log(users);
//       users.forEach(user => {
//         if (user.phone_number !== currentUserPhone) {
//           this.service.getUserProfilebyId(user.user_id.toString()).subscribe((profile: any) => {
//             const receiverId = profile.phone_number;
//             const contact = {
//               ...user,
//               name: user.name || user.phone_number,
//               message: profile.bio || '',
//               image: 'assets/images/user.jfif',
//               receiver_Id: receiverId,
//               selected: false,
//             };
//             this.allUsers.push(contact);
//             this.filteredContacts = [...this.allUsers];
//           });
//         }
//       });
//     });
//   }

//   startGroupCreation() {
//     this.creatingGroup = true;
//   }

//   // async createGroup() {
//   //   const selectedUsers = this.allUsers.filter(user => user.selected);
//   //   const memberIds = selectedUsers.map(u => u.user_id);
//   //   const currentUser = localStorage.getItem('userId');

//   //   if (currentUser) memberIds.push(currentUser);
//   //   console.log("sdsd", memberIds);
//   //   const groupId = `group_${Date.now()}`;

//   //   if (!this.newGroupName.trim()) {
//   //     alert('Group name is required');
//   //     return;
//   //   }

//   //   await this.firebaseChatService.createGroup(groupId, this.newGroupName, memberIds);
//   //   this.creatingGroup = false;
//   //   this.newGroupName = '';
//   //   this.allUsers.forEach(u => (u.selected = false));
//   //   alert('Group created successfully');
//   // }


//   async createGroup() {
//   const selectedUsers = this.allUsers.filter(user => user.selected);
//   const currentUserId = localStorage.getItem('userId');
//   const currentUserPhone = localStorage.getItem('phone_number');
//   const currentUserName = localStorage.getItem('name') || currentUserPhone;

//   const members = selectedUsers.map(u => ({
//     user_id: u.user_id,
//     name: u.name,
//     phone_number: u.phone_number
//   }));

//   // Add current user to the group
//   if (currentUserId && currentUserPhone) {
//     members.push({
//       user_id: currentUserId,
//       name: currentUserName,
//       phone_number: currentUserPhone
//     });
//   }

//   const groupId = `group_${Date.now()}`;
//   if (!this.newGroupName.trim()) {
//     alert('Group name is required');
//     return;
//   }

//   await this.firebaseChatService.createGroup(groupId, this.newGroupName, members);
//   this.creatingGroup = false;
//   this.newGroupName = '';
//   this.allUsers.forEach(u => (u.selected = false));
//   alert('Group created successfully');
// }

  

// //   async createGroup() {
// //   const selectedUsers = this.allUsers.filter(user => user.selected);
// //   const currentUserId = localStorage.getItem('userId');
// //   const currentUserPhone = localStorage.getItem('phone_number');

// //   const currentUserDetails = this.allUsers.find(u => u.phone_number === currentUserPhone);

// //   if (!this.newGroupName.trim()) {
// //     alert('Group name is required');
// //     return;
// //   }

// //   const groupId = `group_${Date.now()}`;

// //   // Build members object with user_id as keys
// //   const membersObj: any = {};

// //   selectedUsers.forEach(u => {
// //     // console.log(u);
// //     membersObj[u.user_id] = {
// //       name: u.name,
// //       phone: u.phone_number,
// //       avatar: u.image || 'assets/images/default-avatar.png',
// //     };
// //   });

// //   if (currentUserId && currentUserDetails) {
// //     membersObj[currentUserId] = {
// //       name: currentUserDetails.name,
// //       phone: currentUserDetails.phone_number,
// //       avatar: currentUserDetails.image || 'assets/images/default-avatar.png',
// //     };
// //   }

// //   console.log("members",membersObj);

// //   // Send group data to Firebase
// //   await this.firebaseChatService.createGroup(groupId, this.newGroupName, membersObj);

// //   // Reset UI
// //   this.creatingGroup = false;
// //   this.newGroupName = '';
// //   this.allUsers.forEach(u => (u.selected = false));
// //   alert('Group created successfully');
// // }


  
//   focusSearchBar() {
//     this.showSearchBar = true;
//     setTimeout(() => {
//       if (this.searchInput) {
//         this.searchInput.setFocus();
//       } else {
//         console.warn('searchInput is undefined!');
//       }
//     }, 300);
//   }

  
//   toggleSearch() {
//     this.showSearchBar = !this.showSearchBar;
//     if (!this.showSearchBar) {
//       this.searchTerm = '';
//       this.keyboardType = 'text';
//       this.filterContacts();
//     }
//   }

  
//   toggleKeyboardType() {
//     this.keyboardType = this.keyboardType === 'text' ? 'tel' : 'text';
//     setTimeout(() => {
//       if (this.searchInput) {
//         this.searchInput.setFocus();
//       }
//     }, 300);
//   }

//   async presentPopover(ev: any) {
//     const popover = await this.popoverControl.create({
//       component: MenuPopoverComponent,
//       event: ev,
//       translucent: true,
//     });
//     await popover.present();
//   }

//   async presentContactMenu(ev: any) {
//     const popover = await this.popoverControl.create({
//       component: ContactMenuComponent,
//       event: ev,
//       translucent: true,
//     });
//     await popover.present();
//     const { data } = await popover.onDidDismiss();
//     console.log('Selected Contact Menu Option:', data);
//   }

//   filterContacts() {
//     const term = this.searchTerm.toLowerCase();
//     this.filteredContacts = this.allUsers.filter(
//       contact =>
//         contact.name?.toLowerCase().includes(term) ||
//         contact.message?.toLowerCase().includes(term)
//     );
//   }
// }



// import { CommonModule } from '@angular/common';
// import { Component, OnInit, ViewChild } from '@angular/core';
// import { IonicModule, IonInput, PopoverController } from '@ionic/angular';
// import { MenuPopoverComponent } from '../components/menu-popover/menu-popover.component';
// import { ContactMenuComponent } from '../components/contact-menu/contact-menu.component';
// import { ActionSheetController } from '@ionic/angular';
// import { Router } from '@angular/router';
// import { FormsModule } from '@angular/forms';
// import { FirebaseChatService } from '../services/firebase-chat.service';
// import { ContactSyncService } from '../services/contact-sync.service'; // ✅ NEW

// @Component({
//   selector: 'app-contacts',
//   templateUrl: './contacts.page.html',
//   styleUrls: ['./contacts.page.scss'],
//   standalone: true,
//   imports: [IonicModule, CommonModule, FormsModule],
// })
// export class ContactsPage implements OnInit {
//   @ViewChild('searchInput', { static: false }) searchInput!: IonInput;

//   allUsers: any[] = [];
//   filteredContacts: any[] = [];

//   showSearchBar = false;
//   searchTerm: string = '';
//   keyboardType: 'text' | 'tel' = 'text';

//   creatingGroup = false;
//   newGroupName: string = '';

//   constructor(
//     private router: Router,
//     private popoverControl: PopoverController,
//     private actionSheetCtrl: ActionSheetController,
//     private firebaseChatService: FirebaseChatService,
//     private contactSyncService: ContactSyncService // ✅ NEW
//   ) {}

//   ngOnInit() {
//     this.loadDeviceMatchedContacts(); // ✅ NEW FUNCTION
//     // this.loadDeviceMatchedContacts();
//   }

//   /**
//    * ✅ Load only contacts who are also registered users on your backend
//    */
//   // async loadDeviceMatchedContacts() {
//   //   const currentUserPhone = localStorage.getItem('phone_number');
//   //   this.allUsers = [];

//   //   try {
//   //     const deviceNumbers = await this.contactSyncService.getPhoneNumbers();

//   //     this.contactSyncService.matchContacts(deviceNumbers).subscribe((matchedUsers: any[]) => {
//   //       matchedUsers.forEach((user) => {
//   //         if (user.phone_number !== currentUserPhone) {
//   //           const contact = {
//   //             ...user,
//   //             name: user.name || user.phone_number,
//   //             message: user.bio || '',
//   //             image: 'assets/images/user.jfif',
//   //             receiver_Id: user.phone_number,
//   //             selected: false,
//   //           };
//   //           this.allUsers.push(contact);
//   //         }
//   //       });

//   //       this.filteredContacts = [...this.allUsers];
//   //     });
//   //   } catch (err) {
//   //     console.error('Error loading contacts:', err);
//   //   }
//   // }

//   async loadDeviceMatchedContacts() {
//   const currentUserPhone = localStorage.getItem('phone_number');
//   this.allUsers = [];

//   try {
//     const matchedUsers = await this.contactSyncService.getMatchedContacts();

//     matchedUsers.forEach((user) => {
//       if (user.phone_number !== currentUserPhone) {
//         const contact = {
//           ...user,
//           name: user.name || user.phone_number,
//           message: user.bio || '',
//           image: 'assets/images/user.jfif',
//           receiver_Id: user.phone_number,
//           selected: false,
//         };
//         this.allUsers.push(contact);
//       }
//     });

//     this.filteredContacts = [...this.allUsers];
//   } catch (err) {
//     console.error('Error matching contacts:', err);
//   }
// }


//   startGroupCreation() {
//     this.creatingGroup = true;
//   }

//   async createGroup() {
//     const selectedUsers = this.allUsers.filter(user => user.selected);
//     const memberIds = selectedUsers.map(u => u.user_id);
//     const currentUser = localStorage.getItem('userId');

//     if (currentUser) memberIds.push(currentUser);
//     const groupId = `group_${Date.now()}`;

//     if (!this.newGroupName.trim()) {
//       alert('Group name is required');
//       return;
//     }

//     await this.firebaseChatService.createGroup(groupId, this.newGroupName, memberIds);
//     this.creatingGroup = false;
//     this.newGroupName = '';
//     this.allUsers.forEach(u => (u.selected = false));
//     alert('Group created successfully');
//   }

//   focusSearchBar() {
//     this.showSearchBar = true;
//     setTimeout(() => {
//       if (this.searchInput) {
//         this.searchInput.setFocus();
//       }
//     }, 300);
//   }

//   toggleSearch() {
//     this.showSearchBar = !this.showSearchBar;
//     if (!this.showSearchBar) {
//       this.searchTerm = '';
//       this.keyboardType = 'text';
//       this.filterContacts();
//     }
//   }

//   toggleKeyboardType() {
//     this.keyboardType = this.keyboardType === 'text' ? 'tel' : 'text';
//     setTimeout(() => {
//       if (this.searchInput) {
//         this.searchInput.setFocus();
//       }
//     }, 300);
//   }

//   async presentPopover(ev: any) {
//     const popover = await this.popoverControl.create({
//       component: MenuPopoverComponent,
//       event: ev,
//       translucent: true,
//     });
//     await popover.present();
//   }

//   async presentContactMenu(ev: any) {
//     const popover = await this.popoverControl.create({
//       component: ContactMenuComponent,
//       event: ev,
//       translucent: true,
//     });
//     await popover.present();
//     const { data } = await popover.onDidDismiss();
//     console.log('Selected Contact Menu Option:', data);
//   }

//   filterContacts() {
//     const term = this.searchTerm.toLowerCase();
//     this.filteredContacts = this.allUsers.filter(
//       contact =>
//         contact.name?.toLowerCase().includes(term) ||
//         contact.message?.toLowerCase().includes(term)
//     );
//   }
// }



// import { CommonModule } from '@angular/common';
// import { Component, OnInit, ViewChild } from '@angular/core';
// import { IonicModule, IonInput, PopoverController } from '@ionic/angular';
// import { MenuPopoverComponent } from '../components/menu-popover/menu-popover.component';
// import { ContactMenuComponent } from '../components/contact-menu/contact-menu.component';
// import { ActionSheetController } from '@ionic/angular';
// import { Router } from '@angular/router';
// import { FormsModule } from '@angular/forms';
// import { FirebaseChatService } from '../services/firebase-chat.service';
// import { ContactSyncService } from '../services/contact-sync.service'; // ✅

// @Component({
//   selector: 'app-contacts',
//   templateUrl: './contacts.page.html',
//   styleUrls: ['./contacts.page.scss'],
//   standalone: true,
//   imports: [IonicModule, CommonModule, FormsModule],
// })
// export class ContactsPage implements OnInit {
//   @ViewChild('searchInput', { static: false }) searchInput!: IonInput;

//   allUsers: any[] = [];
//   filteredContacts: any[] = [];

//   showSearchBar = false;
//   searchTerm: string = '';
//   keyboardType: 'text' | 'tel' = 'text';

//   creatingGroup = false;
//   newGroupName: string = '';

//   constructor(
//     private router: Router,
//     private popoverControl: PopoverController,
//     private actionSheetCtrl: ActionSheetController,
//     private firebaseChatService: FirebaseChatService,
//     private contactSyncService: ContactSyncService
//   ) {}

//   ngOnInit() {
//     this.loadDeviceMatchedContacts(); // ✅ Main logic
//     this.contactSyncService.getDevicePhoneNumbers();
//   }

//   /**
//    * ✅ Loads contacts from device that match backend users
//    */
//   async loadDeviceMatchedContacts() {
//     const currentUserPhone = localStorage.getItem('phone_number');
//     this.allUsers = [];

//     try {
//       const matchedUsers = await this.contactSyncService.getMatchedUsers();
//       console.log("matched contacts", matchedUsers);

//       matchedUsers.forEach((user) => {
//         if (user.phone_number !== currentUserPhone) {
//           this.allUsers.push({
//             ...user,
//             name: user.name || user.phone_number,
//             message: user.bio || '',
//             image: 'assets/images/user.jfif',
//             receiver_Id: user.phone_number,
//             selected: false,
//           });
//         }
//       });

//       this.filteredContacts = [...this.allUsers];
//     } catch (err) {
//       console.error('Error loading matched contacts:', err);
//     }
//   }

//   startGroupCreation() {
//     this.creatingGroup = true;
//   }

//   async createGroup() {
//     const selectedUsers = this.allUsers.filter(user => user.selected);
//     const memberIds = selectedUsers.map(u => u.user_id);
//     const currentUser = localStorage.getItem('userId');

//     if (currentUser) memberIds.push(currentUser);
//     const groupId = `group_${Date.now()}`;

//     if (!this.newGroupName.trim()) {
//       alert('Group name is required');
//       return;
//     }

//     await this.firebaseChatService.createGroup(groupId, this.newGroupName, memberIds);
//     this.creatingGroup = false;
//     this.newGroupName = '';
//     this.allUsers.forEach(u => (u.selected = false));
//     alert('Group created successfully');
//   }

//   focusSearchBar() {
//     this.showSearchBar = true;
//     setTimeout(() => {
//       this.searchInput?.setFocus();
//     }, 300);
//   }

//   toggleSearch() {
//     this.showSearchBar = !this.showSearchBar;
//     if (!this.showSearchBar) {
//       this.searchTerm = '';
//       this.keyboardType = 'text';
//       this.filterContacts();
//     }
//   }

//   toggleKeyboardType() {
//     this.keyboardType = this.keyboardType === 'text' ? 'tel' : 'text';
//     setTimeout(() => {
//       this.searchInput?.setFocus();
//     }, 300);
//   }

//   async presentPopover(ev: any) {
//     const popover = await this.popoverControl.create({
//       component: MenuPopoverComponent,
//       event: ev,
//       translucent: true,
//     });
//     await popover.present();
//   }

//   async presentContactMenu(ev: any) {
//     const popover = await this.popoverControl.create({
//       component: ContactMenuComponent,
//       event: ev,
//       translucent: true,
//     });
//     await popover.present();
//     const { data } = await popover.onDidDismiss();
//     console.log('Selected Contact Menu Option:', data);
//   }

//   filterContacts() {
//     const term = this.searchTerm.toLowerCase();
//     this.filteredContacts = this.allUsers.filter(
//       contact =>
//         contact.name?.toLowerCase().includes(term) ||
//         contact.message?.toLowerCase().includes(term)
//     );
//   }
// }


//this is updated or final
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { IonicModule, IonInput, PopoverController } from '@ionic/angular';
import { MenuPopoverComponent } from '../components/menu-popover/menu-popover.component';
import { ContactMenuComponent } from '../components/contact-menu/contact-menu.component';
import { ActionSheetController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FirebaseChatService } from '../services/firebase-chat.service';
import { ContactSyncService } from '../services/contact-sync.service';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.page.html',
  styleUrls: ['./contacts.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ContactsPage implements OnInit {
  @ViewChild('searchInput', { static: false }) searchInput!: IonInput;

  allUsers: any[] = [];
  filteredContacts: any[] = [];

  showSearchBar = false;
  searchTerm: string = '';
  keyboardType: 'text' | 'tel' = 'text';

  creatingGroup = false;
  newGroupName: string = '';

  isLoading = true; // ✅ loader flag

  constructor(
    private router: Router,
    private popoverControl: PopoverController,
    private actionSheetCtrl: ActionSheetController,
    private firebaseChatService: FirebaseChatService,
    private contactSyncService: ContactSyncService
  ) {}

  ngOnInit() {
    this.loadDeviceMatchedContacts();
  }

  /**
   * ✅ Loads contacts from device that match backend users
   */
  async loadDeviceMatchedContacts() {
    const currentUserPhone = localStorage.getItem('phone_number');
    this.allUsers = [];
    this.isLoading = true; // show loader

    try {
      const matchedUsers = await this.contactSyncService.getMatchedUsers();
      console.log("matched contacts", matchedUsers);

      matchedUsers.forEach((user) => {
        if (user.phone_number !== currentUserPhone) {
          this.allUsers.push({
            ...user,
            name: user.name || user.phone_number,
            message: user.bio || '',
            image: 'assets/images/user.jfif',
            receiver_Id: user.phone_number,
            selected: false,
          });
        }
      });

      this.filteredContacts = [...this.allUsers];
    } catch (err) {
      console.error('Error loading matched contacts:', err);
    } finally {
      this.isLoading = false; // hide loader
    }
  }

  startGroupCreation() {
    this.creatingGroup = true;
  }

async createGroup() {
  const selectedUsers = this.allUsers.filter(user => user.selected);
  const currentUserId = localStorage.getItem('userId');
  const currentUserPhone = localStorage.getItem('phone_number');
  const currentUserName = localStorage.getItem('name') || currentUserPhone;

  const members = selectedUsers.map(u => ({
    user_id: u.user_id,
    name: u.name,
    phone_number: u.phone_number
  }));

  // Add current user to the group
  if (currentUserId && currentUserPhone) {
    members.push({
      user_id: currentUserId,
      name: currentUserName,
      phone_number: currentUserPhone
    });
  }

  const groupId = `group_${Date.now()}`;
  if (!this.newGroupName.trim()) {
    alert('Group name is required');
    return;
  }

  await this.firebaseChatService.createGroup(groupId, this.newGroupName, members);
  this.creatingGroup = false;
  this.newGroupName = '';
  this.allUsers.forEach(u => (u.selected = false));
  alert('Group created successfully');
}

  focusSearchBar() {
    this.showSearchBar = true;
    setTimeout(() => {
      this.searchInput?.setFocus();
    }, 300);
  }

  toggleSearch() {
    this.showSearchBar = !this.showSearchBar;
    if (!this.showSearchBar) {
      this.searchTerm = '';
      this.keyboardType = 'text';
      this.filterContacts();
    }
  }

  toggleKeyboardType() {
    this.keyboardType = this.keyboardType === 'text' ? 'tel' : 'text';
    setTimeout(() => {
      this.searchInput?.setFocus();
    }, 300);
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverControl.create({
      component: MenuPopoverComponent,
      event: ev,
      translucent: true,
    });
    await popover.present();
  }

  async presentContactMenu(ev: any) {
    const popover = await this.popoverControl.create({
      component: ContactMenuComponent,
      event: ev,
      translucent: true,
    });
    await popover.present();
    const { data } = await popover.onDidDismiss();
    console.log('Selected Contact Menu Option:', data);
  }

  filterContacts() {
    const term = this.searchTerm.toLowerCase();
    this.filteredContacts = this.allUsers.filter(
      contact =>
        contact.name?.toLowerCase().includes(term) ||
        contact.message?.toLowerCase().includes(term)
    );
  }
}
