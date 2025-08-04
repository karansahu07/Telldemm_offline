// import { CommonModule } from '@angular/common';
// import { Component, OnInit } from '@angular/core';
// import { IonicModule, PopoverController } from '@ionic/angular';
// import { FooterTabsComponent } from "../components/footer-tabs/footer-tabs.component";
// import { Router } from '@angular/router';
// import { MenuPopoverComponent } from '../components/menu-popover/menu-popover.component';
// import { FormsModule } from '@angular/forms';
// @Component({
//   selector: 'app-home-screen',
//   templateUrl: './home-screen.page.html',
//   styleUrls: ['./home-screen.page.scss'],
//   standalone: true,
//   imports: [IonicModule, CommonModule, FooterTabsComponent, FormsModule]
// })
// export class HomeScreenPage implements OnInit {

//   constructor(private router: Router, private popoverCtrl: PopoverController) {}

//   ngOnInit() {}

//   searchText: string = '';
//   selectedFilter: string = 'all'; 

//   chatList = [
//     { name: 'Alice', message: 'Hello', messageStatus: 'sent', unread: false, time: '10:00 AM', unreadCount: 0, group: false },
//     { name: 'Alice', message: 'Hello again', messageStatus: 'seen', unread: false, time: '10:30 AM', unreadCount: 0, group: false },
//     { name: 'Bob', message: 'How are you?', messageStatus: 'received', unread: true, time: '11:00 AM', unreadCount: 2, group: false },
//     { name: 'Group Chat', message: 'Welcome all!', messageStatus: 'received', unread: true, time: '12:00 PM', unreadCount: 4, group: true },
//     { name: 'Charlie', message: 'Ping me later', messageStatus: 'sent', unread: false, time: '1:15 PM', unreadCount: 0, group: false }
//   ];

//   get filteredChats() {
//     let filtered = this.chatList;


//     if (this.selectedFilter === 'read') {
//       filtered = filtered.filter(chat => !chat.unread);
//     } else if (this.selectedFilter === 'unread') {
//       filtered = filtered.filter(chat => chat.unread);
//     } else if (this.selectedFilter === 'groups') {
//       filtered = filtered.filter(chat => chat.group);
//     }

//     if (this.searchText.trim() !== '') {
//       const searchLower = this.searchText.toLowerCase();
//       filtered = filtered.filter(chat =>
//         chat.name.toLowerCase().includes(searchLower) ||
//         chat.message.toLowerCase().includes(searchLower)
//       );
//     }

//     return filtered;
//   }

//   get totalUnreadCount(): number {
//     return this.chatList.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
//   }

//   setFilter(filter: string) {
//     this.selectedFilter = filter;
//   }

//   openChat(chat: any) {
//     this.router.navigate(['/chatting-screen']);
//   }

//   async presentPopover(ev: any) {
//     const popover = await this.popoverCtrl.create({
//       component: MenuPopoverComponent,
//       event: ev,
//       translucent: true,
//     });
//     await popover.present();
//   }

// }



// import { CommonModule } from '@angular/common';
// import { Component, OnInit } from '@angular/core';
// import { IonicModule, PopoverController } from '@ionic/angular';
// import { FooterTabsComponent } from "../components/footer-tabs/footer-tabs.component";
// import { Router } from '@angular/router';
// import { MenuPopoverComponent } from '../components/menu-popover/menu-popover.component';
// import { FormsModule } from '@angular/forms';

// @Component({
//   selector: 'app-home-screen',
//   templateUrl: './home-screen.page.html',
//   styleUrls: ['./home-screen.page.scss'],
//   standalone: true,
//   imports: [IonicModule, CommonModule, FooterTabsComponent, FormsModule]
// })
// export class HomeScreenPage implements OnInit {

//   constructor(private router: Router, private popoverCtrl: PopoverController) { }

//   ngOnInit() { }

//   searchText: string = '';
//   selectedFilter: string = 'all'; // default selected tab


//   currUserId: string | null = localStorage.getItem("userId");

//   chatList = [
//     { name: 'Alice', userId: '9138152160', message: 'Hello', messageStatus: 'sent', unread: false, time: '10:00 AM', unreadCount: 0, group: false },
//     // { name: 'smith', userId: '9034223456', message: 'Hello again', messageStatus: 'seen', unread: false, time: '10:30 AM', unreadCount: 0, group: false },
//     { name: 'Bob', userId: '9034223457', message: 'How are you?', messageStatus: 'received', unread: true, time: '11:00 AM', unreadCount: 2, group: false },
//     // { name: 'Group Chat', userId: 'groupchat456', message: 'Welcome all!', messageStatus: 'received', unread: true, time: '12:00 PM', unreadCount: 4, group: true },
//     // { name: 'karan', userId: '9138152160', message: 'Ping me later', messageStatus: 'sent', unread: false, time: '1:15 PM', unreadCount: 0, group: false }
//   ].filter(u => u.userId != this.currUserId);

//   get filteredChats() {
//     let filtered = this.chatList;

//     // Step 1: Apply tab filter
//     if (this.selectedFilter === 'read') {
//       filtered = filtered.filter(chat => !chat.unread);
//     } else if (this.selectedFilter === 'unread') {
//       filtered = filtered.filter(chat => chat.unread);
//     } else if (this.selectedFilter === 'groups') {
//       filtered = filtered.filter(chat => chat.group);
//     }

//     // Step 2: Apply search filter
//     if (this.searchText.trim() !== '') {
//       const searchLower = this.searchText.toLowerCase();
//       filtered = filtered.filter(chat =>
//         chat.name.toLowerCase().includes(searchLower) ||
//         chat.message.toLowerCase().includes(searchLower)
//       );
//     }

//     return filtered;
//   }

//   get totalUnreadCount(): number {
//     return this.chatList.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
//   }

//   setFilter(filter: string) {
//     this.selectedFilter = filter;
//   }

//   openChat(chat: any) {
//     // 1. Set current userId in localStorage (replace with actual login/session logic if needed)
//     // localStorage.setItem('userId', 'bob123'); // This is the logged-in user
//     // console.log('userId');

//     // 2. Navigate to chat screen with receiverId in queryParams
//     console.log(chat.userId);
//     this.router.navigate(['/chatting-screen'], {
//       queryParams: { receiverId: chat.userId }
//     });
//   }

//   async presentPopover(ev: any) {
//     const popover = await this.popoverCtrl.create({
//       component: MenuPopoverComponent,
//       event: ev,
//       translucent: true,
//     });
//     await popover.present();
//   }
// }



// import { CommonModule } from '@angular/common';
// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { IonicModule, PopoverController } from '@ionic/angular';
// import { FooterTabsComponent } from "../components/footer-tabs/footer-tabs.component";
// import { Router } from '@angular/router';
// import { MenuPopoverComponent } from '../components/menu-popover/menu-popover.component';
// import { FormsModule } from '@angular/forms';
// import { SocketService } from '../services/socket.service'; // ✅ import your service
// import { Subscription } from 'rxjs';

// @Component({
//   selector: 'app-home-screen',
//   templateUrl: './home-screen.page.html',
//   styleUrls: ['./home-screen.page.scss'],
//   standalone: true,
//   imports: [IonicModule, CommonModule, FooterTabsComponent, FormsModule]
// })
// export class HomeScreenPage implements OnInit, OnDestroy {
//   constructor(
//     private router: Router,
//     private popoverCtrl: PopoverController,
//     private socketService: SocketService // ✅ inject socket service
//   ) {}

//   searchText: string = '';
//   selectedFilter: string = 'all';
//   currUserId: string | null = localStorage.getItem("userId");
//   private messageSub: Subscription | undefined;

//   chatList = [
//     { name: 'Alice', phone: '9138152160', message: 'Hello', messageStatus: 'sent', unread: false, time: '10:00 AM', unreadCount: 0, group: false },
//     { name: 'Bob', phone: '9034223457', message: 'How are you?', messageStatus: 'received', unread: true, time: '11:00 AM', unreadCount: 2, group: false },
//   ].filter(u => u.phone != this.currUserId);

//   ngOnInit() {
//     this.listenToMessages(); // ✅ Listen when component loads
//   }

//   ngOnDestroy(): void {
//     if (this.messageSub) {
//       this.messageSub.unsubscribe();
//     }
//   }

//   listenToMessages() {
//     //comment by khusha
//     // this.messageSub = this.socketService.onMessage().subscribe((msg) => {
//     //   const { senderId, message } = msg;

//     //   const chat = this.chatList.find(c => c.userId === senderId);
//     //   if (chat) {
//     //     chat.message = message;
//     //     chat.unread = true;
//     //     chat.unreadCount += 1;
//     //     chat.time = new Date().toLocaleTimeString(); // Update to current time
//     //   } else {
//     //     // Optional: If message is from unknown user, add new chat card
//     //     this.chatList.push({
//     //       name: senderId, // You can replace this with actual user lookup
//     //       userId: senderId,
//     //       message: message,
//     //       messageStatus: 'received',
//     //       unread: true,
//     //       unreadCount: 1,
//     //       time: new Date().toLocaleTimeString(),
//     //       group: false
//     //     });
//     //   }
//     // });
//   }

//   get filteredChats() {
//     let filtered = this.chatList;

//     if (this.selectedFilter === 'read') {
//       filtered = filtered.filter(chat => !chat.unread);
//     } else if (this.selectedFilter === 'unread') {
//       filtered = filtered.filter(chat => chat.unread);
//     } else if (this.selectedFilter === 'groups') {
//       filtered = filtered.filter(chat => chat.group);
//     }

//     if (this.searchText.trim() !== '') {
//       const searchLower = this.searchText.toLowerCase();
//       filtered = filtered.filter(chat =>
//         chat.name.toLowerCase().includes(searchLower) ||
//         chat.message.toLowerCase().includes(searchLower)
//       );
//     }

//     return filtered;
//   }

//   get totalUnreadCount(): number {
//     return this.chatList.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
//   }

//   setFilter(filter: string) {
//     this.selectedFilter = filter;
//   }

//   openChat(chat: any) {
//     this.router.navigate(['/chatting-screen'], {
//       queryParams: { receiverId: chat.userId }
//     });
//   }

//   async presentPopover(ev: any) {
//     const popover = await this.popoverCtrl.create({
//       component: MenuPopoverComponent,
//       event: ev,
//       translucent: true,
//     });
//     await popover.present();
//   }
// }



// import { CommonModule } from '@angular/common';
// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { IonicModule, PopoverController } from '@ionic/angular';
// import { FooterTabsComponent } from "../components/footer-tabs/footer-tabs.component";
// import { Router } from '@angular/router';
// import { MenuPopoverComponent } from '../components/menu-popover/menu-popover.component';
// import { FormsModule } from '@angular/forms';
// import { SocketService } from '../services/socket.service';
// import { Subscription } from 'rxjs';

// @Component({
//   selector: 'app-home-screen',
//   templateUrl: './home-screen.page.html',
//   styleUrls: ['./home-screen.page.scss'],
//   standalone: true,
//   imports: [IonicModule, CommonModule, FooterTabsComponent, FormsModule]
// })
// export class HomeScreenPage implements OnInit, OnDestroy {

//   constructor(
//     private router: Router,
//     private popoverCtrl: PopoverController,
//     private socketService: SocketService
//   ) {}

//   searchText: string = '';
//   selectedFilter: string = 'all';
//   currUserId: string | null = localStorage.getItem("phone_number");
//   private messageSub: Subscription | undefined;

//   chatList = [
//     { name: 'Alice', phone: '+919138152160', message: 'Hello', messageStatus: 'sent', unread: false, time: '10:00 AM', unreadCount: 0, group: false },
//     { name: 'Bob', phone: '+919034223457', message: 'How are you?', messageStatus: 'received', unread: true, time: '11:00 AM', unreadCount: 2, group: false },
//   ];

//   ngOnInit() {
//     // Remove current user's own number from chat list
//     this.chatList = this.chatList.filter(chat => chat.phone !== this.currUserId);

//     // Setup message listener
//     this.listenToMessages();
//   }

//   ngOnDestroy(): void {
//     if (this.messageSub) {
//       this.messageSub.unsubscribe();
//     }
//   }

//   listenToMessages() {
//     this.socketService.onMessageReceived((msg) => {
//       const { senderId, receiverId, message } = msg;

//       // Only update if current user is the receiver
//       if (receiverId !== this.currUserId) return;

//       const existingChat = this.chatList.find(c => c.phone === senderId);

//       if (existingChat) {
//         existingChat.message = message;
//         existingChat.unread = true;
//         existingChat.unreadCount += 1;
//         existingChat.time = new Date().toLocaleTimeString();
//       } else {
//         this.chatList.push({
//           name: senderId, // You can replace this with actual name lookup if available
//           phone: senderId,
//           message: message,
//           messageStatus: 'received',
//           unread: true,
//           unreadCount: 1,
//           time: new Date().toLocaleTimeString(),
//           group: false
//         });
//       }
//     });
//   }

//   get filteredChats() {
//     let filtered = this.chatList;

//     if (this.selectedFilter === 'read') {
//       filtered = filtered.filter(chat => !chat.unread);
//     } else if (this.selectedFilter === 'unread') {
//       filtered = filtered.filter(chat => chat.unread);
//     } else if (this.selectedFilter === 'groups') {
//       filtered = filtered.filter(chat => chat.group);
//     }

//     if (this.searchText.trim() !== '') {
//       const searchLower = this.searchText.toLowerCase();
//       filtered = filtered.filter(chat =>
//         chat.name.toLowerCase().includes(searchLower) ||
//         chat.message.toLowerCase().includes(searchLower)
//       );
//     }

//     return filtered;
//   }

//   get totalUnreadCount(): number {
//     return this.chatList.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
//   }

//   setFilter(filter: string) {
//     this.selectedFilter = filter;
//   }

//   openChat(chat: any) {
//     this.router.navigate(['/chatting-screen'], {
//       queryParams: { receiverId: chat.phone }
//     });
//   }

//   async presentPopover(ev: any) {
//     const popover = await this.popoverCtrl.create({
//       component: MenuPopoverComponent,
//       event: ev,
//       translucent: true,
//     });
//     await popover.present();
//   }
// }



// import { CommonModule } from '@angular/common';
// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { IonicModule, PopoverController } from '@ionic/angular';
// import { FooterTabsComponent } from "../components/footer-tabs/footer-tabs.component";
// import { Router } from '@angular/router';
// import { MenuPopoverComponent } from '../components/menu-popover/menu-popover.component';
// import { FormsModule } from '@angular/forms';
// import { SocketService } from '../services/socket.service';
// import { ApiService } from '../services/api/api.service';
// // import { Camera, CameraResultType } from '@capacitor/camera';
// //import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
// import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
// // import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
// import { BarcodeScanner } from '@capacitor-community/barcode-scanner';


// @Component({
//   selector: 'app-home-screen',
//   templateUrl: './home-screen.page.html',
//   styleUrls: ['./home-screen.page.scss'],
//   standalone: true,
//   imports: [IonicModule, CommonModule, FooterTabsComponent, FormsModule]
// })
// export class HomeScreenPage implements OnInit, OnDestroy {

//   constructor(
//     private router: Router,
//     private popoverCtrl: PopoverController,
//     private socketService: SocketService,
//     private apiService: ApiService
//   ) {}

//   searchText: string = '';
//   selectedFilter: string = 'all';
//   currUserId: string | null = localStorage.getItem("phone_number");
//   // capturedImage: string | undefined;
//   // scannedResult: string = '';
//   scannedText: string = '';


//   chatList: any[] = [];
//   galleryImages: string[] = [];
// capturedImage: string = '';

//   ngOnInit() {
//     this.fetchAllUsers();
//     this.listenToMessages();
//   }

//   ngOnDestroy(): void {
//     // No need to unsubscribe if not using observable subscription
//   }

//   // fetchAllUsers() {
//   //   this.apiService.getAllUsers().subscribe({
//   //     next: (users: any[]) => {
//   //       this.chatList = users
//   //         .filter((user: any) => user.phone_number !== this.currUserId)
//   //         .map((user: any) => ({
//   //           name: user.name || user.phone_number,
//   //           phone: user.phone_number,
//   //           message: 'No messages yet',
//   //           messageStatus: 'sent',
//   //           unread: false,
//   //           time: '',
//   //           unreadCount: 0,
//   //           group: false
//   //         }));
//   //     },
//   //     error: (err: any) => {
//   //       console.error("Failed to fetch users", err);
//   //     }
//   //   });
//   // }


// fetchAllUsers() {
//   // Show only Alice and Bob excluding current user
//   const allUsers = [
//     { name: 'Alice', phone_number: '+919138152160', message: 'Hello', messageStatus: 'sent', unread: false, time: '10:00 AM', unreadCount: 0, group: false },
//     { name: 'Bob', phone_number: '+919034223457', message: 'How are you?', messageStatus: 'received', unread: true, time: '11:00 AM', unreadCount: 2, group: false }
//   ];

//   this.chatList = allUsers.filter(u => u.phone_number !== this.currUserId);
// }

//   listenToMessages() {
//     this.socketService.onMessageReceived((msg) => {
//       const { senderId, receiverId, message } = msg;

//       if (receiverId !== this.currUserId) return;

//       const existingChat = this.chatList.find(c => c.phone === senderId);

//       if (existingChat) {
//         existingChat.message = message;
//         existingChat.unread = true;
//         existingChat.unreadCount += 1;
//         existingChat.time = new Date().toLocaleTimeString();
//       } else {
//         this.chatList.push({
//           name: senderId,
//           phone: senderId,
//           message: message,
//           messageStatus: 'received',
//           unread: true,
//           unreadCount: 1,
//           time: new Date().toLocaleTimeString(),
//           group: false
//         });
//       }
//     });
//   }

//   get filteredChats() {
//     let filtered = this.chatList;

//     if (this.selectedFilter === 'read') {
//       filtered = filtered.filter(chat => !chat.unread);
//     } else if (this.selectedFilter === 'unread') {
//       filtered = filtered.filter(chat => chat.unread);
//     } else if (this.selectedFilter === 'groups') {
//       filtered = filtered.filter(chat => chat.group);
//     }

//     if (this.searchText.trim() !== '') {
//       const searchLower = this.searchText.toLowerCase();
//       filtered = filtered.filter(chat =>
//         chat.name.toLowerCase().includes(searchLower) ||
//         chat.message.toLowerCase().includes(searchLower)
//       );
//     }

//     return filtered;
//   }

//   get totalUnreadCount(): number {
//     return this.chatList.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
//   }

//   setFilter(filter: string) {
//     this.selectedFilter = filter;
//   }

//   openChat(chat: any) {
//     this.router.navigate(['/chatting-screen'], {
//       queryParams: { receiverId: chat.phone }
//     });
//   }

//   async presentPopover(ev: any) {
//     const popover = await this.popoverCtrl.create({
//       component: MenuPopoverComponent,
//       event: ev,
//       translucent: true,
//     });
//     await popover.present();
//   }

//   goToContact() {
//   this.router.navigate(['/contact-screen']);
// }
// // async takePicture() {
// //     try {
// //       const image = await Camera.getPhoto({
// //         quality: 90,
// //         allowEditing: true,
// //         resultType: CameraResultType.Uri,
// //       });

// //       this.capturedImage = image.webPath!;
// //     } catch (error) {
// //       console.error('Camera error:', error);
// //     }
// //   }

// //camera
// async openCamera() {
//   try {
//     const image = await Camera.getPhoto({
//       source: CameraSource.Camera, 
//       quality: 90,
//       resultType: CameraResultType.Uri,
//     });

//     this.capturedImage = image.webPath!;
//   } catch (error) {
//     console.error('Camera error:', error);
//   }
// }


// //bar-code
// async scanBarcode() {
//   const status = await BarcodeScanner.checkPermission({ force: true });

//   if (!status.granted) {
//     alert('Camera permission is required.');
//     return;
//   }

//   await BarcodeScanner.hideBackground(); // Optional: hides webview background
//   document.body.classList.add('scanner-active'); // Add styling

//   const result = await BarcodeScanner.startScan(); // Starts scanning

//   if (result.hasContent) {
//     alert(`Scanned: ${result.content}`);
//   } else {
//     alert('No barcode found.');
//   }

//   await BarcodeScanner.showBackground(); // Restore webview
//   document.body.classList.remove('scanner-active');
// }

// }





// import { CommonModule } from '@angular/common';
// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { IonicModule, PopoverController } from '@ionic/angular';
// import { FooterTabsComponent } from "../components/footer-tabs/footer-tabs.component";
// import { Router } from '@angular/router';
// import { MenuPopoverComponent } from '../components/menu-popover/menu-popover.component';
// import { FormsModule } from '@angular/forms';
// import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
// import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
// import { ApiService } from '../services/api/api.service';

// @Component({
//   selector: 'app-home-screen',
//   templateUrl: './home-screen.page.html',
//   styleUrls: ['./home-screen.page.scss'],
//   standalone: true,
//   imports: [IonicModule, CommonModule, FooterTabsComponent, FormsModule]
// })
// export class HomeScreenPage implements OnInit, OnDestroy {

//   constructor(
//     private router: Router,
//     private popoverCtrl: PopoverController,
//     private service: ApiService
//   ) {}

//   searchText: string = '';
//   selectedFilter: string = 'all';
//   currUserId: string | null = localStorage.getItem("phone_number");
//   scannedText: string = '';
//   capturedImage: string = '';

//   chatList: any[] = [];
//   galleryImages: string[] = [];

//   ngOnInit() {
//     // this.fetchAllUsers();
//      this.getAllUsers();
//   }

//   ngOnDestroy(): void {
//     // Nothing to clean up in this version
//   }

//   // fetchAllUsers() {
//   //   const allUsers = [
//   //     {
//   //       name: 'Karan',
//   //       receiver_Id: '9138152160',
//   //       phone_number: '+919138152160',
//   //       message: 'Hello',
//   //       messageStatus: 'sent',
//   //       unread: false,
//   //       time: '10:00 AM',
//   //       unreadCount: 0,
//   //       group: false
//   //     },
//   //     {
//   //       name: 'Khushboo',
//   //       receiver_Id: '7700075618',
//   //       phone_number: '+917700075618',
//   //       message: 'How are you?',
//   //       messageStatus: 'received',
//   //       unread: true,
//   //       time: '11:00 AM',
//   //       unreadCount: 2,
//   //       group: false
//   //     },
//   //     {
//   //       name: 'khushi',
//   //       receiver_Id: '7700075619',
//   //       phone_number: '+917700075619',
//   //       message: '?',
//   //       messageStatus: 'received',
//   //       unread: true,
//   //       time: '1:00 AM',
//   //       unreadCount: 2,
//   //       group: false
//   //     }
//   //   ];

//   //   const currentUser = this.currUserId?.toString();
//   //   this.chatList = allUsers.filter(u => u.phone_number !== currentUser);
//   // }

//  getAllUsers() {
//   const currentUserPhone = localStorage.getItem('phone_number'); // e.g. "+919138152160"

//   this.service.getAllUsers().subscribe((users: any[]) => {
//     users.forEach(user => {
//       // Compare with phone number from localStorage
//       if (user.phone_number !== currentUserPhone) {
//         this.service.getUserProfilebyId(user.user_id.toString()).subscribe((profile: any) => {
//           const receiverId = profile.phone_number;

//           // Add to chatList with receiver_Id
//           this.chatList.push({
//             ...user,
//             receiver_Id: receiverId
//           });
//         });
//       }
//     });
//   });
// }



// // getAllUsers() {
// //     this.service.getAllUsers().subscribe((users: any[]) => {
// //       const currentUser = this.currUserId?.toString();
// //       this.chatList = users.filter(u => u.phone_number !== currentUser);
// //     });
// //   }

//   get filteredChats() {
//     let filtered = this.chatList;

//     if (this.selectedFilter === 'read') {
//       filtered = filtered.filter(chat => !chat.unread);
//     } else if (this.selectedFilter === 'unread') {
//       filtered = filtered.filter(chat => chat.unread);
//     } else if (this.selectedFilter === 'groups') {
//       filtered = filtered.filter(chat => chat.group);
//     }

//     if (this.searchText.trim() !== '') {
//       const searchLower = this.searchText.toLowerCase();
//       filtered = filtered.filter(chat =>
//         chat.name.toLowerCase().includes(searchLower) ||
//         chat.message.toLowerCase().includes(searchLower)
//       );
//     }

//     return filtered;
//   }

//   get totalUnreadCount(): number {
//     return this.chatList.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
//   }

//   setFilter(filter: string) {
//     this.selectedFilter = filter;
//   }

//   // openChat(chat: any) {
//   //   console.log("receiver_id",chat.receiver_Id);
//   //   this.router.navigate(['/chatting-screen'], {
//   //     queryParams: { receiverId: chat.receiver_Id }
//   //   });
//   // }


//   openChat(chat: any) {
//   let rawPhone = chat.receiverId || chat.receiver_Id;

//   // Remove "+91" or any non-digit characters and take last 10 digits
//   const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);

//   console.log("Cleaned receiverId:", cleanPhone);

//   this.router.navigate(['/chatting-screen'], {
//     queryParams: { receiverId: cleanPhone }
//   });
// }

//   async presentPopover(ev: any) {
//     const popover = await this.popoverCtrl.create({
//       component: MenuPopoverComponent,
//       event: ev,
//       translucent: true,
//     });
//     await popover.present();
//   }

//   goToContact() {
//     this.router.navigate(['/contact-screen']);
//   }

//   async openCamera() {
//     try {
//       const image = await Camera.getPhoto({
//         source: CameraSource.Camera,
//         quality: 90,
//         resultType: CameraResultType.Uri,
//       });

//       this.capturedImage = image.webPath!;
//     } catch (error) {
//       console.error('Camera error:', error);
//     }
//   }

//   async scanBarcode() {
//     const status = await BarcodeScanner.checkPermission({ force: true });

//     if (!status.granted) {
//       alert('Camera permission is required.');
//       return;
//     }

//     await BarcodeScanner.hideBackground();
//     document.body.classList.add('scanner-active');

//     const result = await BarcodeScanner.startScan();

//     if (result.hasContent) {
//       alert(`Scanned: ${result.content}`);
//     } else {
//       alert('No barcode found.');
//     }

//     await BarcodeScanner.showBackground();
//     document.body.classList.remove('scanner-active');
//   }
// }





// import { CommonModule } from '@angular/common';
// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { IonicModule, PopoverController } from '@ionic/angular';
// import { FooterTabsComponent } from '../components/footer-tabs/footer-tabs.component';
// import { Router } from '@angular/router';
// import { MenuPopoverComponent } from '../components/menu-popover/menu-popover.component';
// import { FormsModule } from '@angular/forms';
// import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
// import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
// import { ApiService } from '../services/api/api.service';
// import { FirebaseChatService } from '../services/firebase-chat.service';

// @Component({
//   selector: 'app-home-screen',
//   templateUrl: './home-screen.page.html',
//   styleUrls: ['./home-screen.page.scss'],
//   standalone: true,
//   imports: [IonicModule, CommonModule, FooterTabsComponent, FormsModule]
// })
// export class HomeScreenPage implements OnInit, OnDestroy {
//   constructor(
//     private router: Router,
//     private popoverCtrl: PopoverController,
//     private service: ApiService,
//     private firebaseChatService: FirebaseChatService
//   ) {}

//   searchText: string = '';
//   selectedFilter: string = 'all';
//   currUserId: string | null = localStorage.getItem('phone_number');
//   scannedText: string = '';
//   capturedImage: string = '';

//   chatList: any[] = [];
//   galleryImages: string[] = [];

//   toggleGroupCreator = false;
//   newGroupName: string = '';

//   ngOnInit() {
//     this.getAllUsers();
//   }

//   ngOnDestroy(): void {}

//   getAllUsers() {
//     const currentUserPhone = localStorage.getItem('phone_number');

//     this.service.getAllUsers().subscribe((users: any[]) => {
//       users.forEach(user => {
//         if (user.phone_number !== currentUserPhone) {
//           this.service.getUserProfilebyId(user.user_id.toString()).subscribe((profile: any) => {
//             const receiverId = profile.phone_number;
//             this.chatList.push({
//               ...user,
//               receiver_Id: receiverId,
//               group: false
//             });
//           });
//         }
//       });
//       this.loadUserGroups();
//     });
//   }

//   async loadUserGroups() {
//     const userPhone = localStorage.getItem('phone_number');
//     if (!userPhone) return;

//     const groupIds = await this.firebaseChatService.getGroupsForUser(userPhone);

//     for (const groupId of groupIds) {
//       const groupInfo = await this.firebaseChatService.getGroupInfo(groupId);
//       this.chatList.push({
//         name: groupInfo.name,
//         receiver_Id: groupId,
//         group: true,
//         message: '',
//         time: '',
//         unread: false,
//         unreadCount: 0
//       });
//     }
//   }

//   get filteredChats() {
//     let filtered = this.chatList;

//     if (this.selectedFilter === 'read') {
//       filtered = filtered.filter(chat => !chat.unread && !chat.group);
//     } else if (this.selectedFilter === 'unread') {
//       filtered = filtered.filter(chat => chat.unread && !chat.group);
//     } else if (this.selectedFilter === 'groups') {
//       filtered = filtered.filter(chat => chat.group);
//     }

//     if (this.searchText.trim() !== '') {
//       const searchLower = this.searchText.toLowerCase();
//       filtered = filtered.filter(chat =>
//         chat.name?.toLowerCase().includes(searchLower) ||
//         chat.message?.toLowerCase().includes(searchLower)
//       );
//     }

//     return filtered;
//   }

//   get totalUnreadCount(): number {
//     return this.chatList.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
//   }

//   setFilter(filter: string) {
//     this.selectedFilter = filter;
//   }

//   openChat(chat: any) {
//     const receiverId = chat.receiver_Id || chat.receiverId;
//     if (chat.group) {
//       this.router.navigate(['/chatting-screen'], {
//         queryParams: { receiverId, isGroup: true }
//       });
//     } else {
//       const cleanPhone = receiverId.replace(/\D/g, '').slice(-10);
//       this.router.navigate(['/chatting-screen'], {
//         queryParams: { receiverId: cleanPhone }
//       });
//     }
//   }

//   async presentPopover(ev: any) {
//     const popover = await this.popoverCtrl.create({
//       component: MenuPopoverComponent,
//       event: ev,
//       translucent: true
//     });
//     await popover.present();
//   }

//   goToContact() {
//     this.router.navigate(['/contact-screen']);
//   }

//   async openCamera() {
//     try {
//       const image = await Camera.getPhoto({
//         source: CameraSource.Camera,
//         quality: 90,
//         resultType: CameraResultType.Uri
//       });
//       this.capturedImage = image.webPath!;
//     } catch (error) {
//       console.error('Camera error:', error);
//     }
//   }

//   async scanBarcode() {
//     const status = await BarcodeScanner.checkPermission({ force: true });
//     if (!status.granted) {
//       alert('Camera permission is required.');
//       return;
//     }

//     await BarcodeScanner.hideBackground();
//     document.body.classList.add('scanner-active');

//     const result = await BarcodeScanner.startScan();
//     if (result.hasContent) {
//       this.scannedText = result.content;
//     } else {
//       alert('No barcode found.');
//     }

//     await BarcodeScanner.showBackground();
//     document.body.classList.remove('scanner-active');
//   }

// }


// import { CommonModule } from '@angular/common';
// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { IonicModule, PopoverController } from '@ionic/angular';
// import { FooterTabsComponent } from '../components/footer-tabs/footer-tabs.component';
// import { Router } from '@angular/router';
// import { MenuPopoverComponent } from '../components/menu-popover/menu-popover.component';
// import { FormsModule } from '@angular/forms';
// import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
// import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
// import { ApiService } from '../services/api/api.service';
// import { FirebaseChatService } from '../services/firebase-chat.service';

// @Component({
//   selector: 'app-home-screen',
//   templateUrl: './home-screen.page.html',
//   styleUrls: ['./home-screen.page.scss'],
//   standalone: true,
//   imports: [IonicModule, CommonModule, FooterTabsComponent, FormsModule]
// })
// export class HomeScreenPage implements OnInit, OnDestroy {
//   constructor(
//     private router: Router,
//     private popoverCtrl: PopoverController,
//     private service: ApiService,
//     private firebaseChatService: FirebaseChatService
//   ) {}

//   searchText: string = '';
//   selectedFilter: string = 'all';
//   currUserId: string | null = localStorage.getItem('phone_number');
//   scannedText: string = '';
//   capturedImage: string = '';

//   chatList: any[] = [];
//   galleryImages: string[] = [];

//   toggleGroupCreator = false;
//   newGroupName: string = '';

//   ngOnInit() {
//     this.getAllUsers();
//   }

//   ngOnDestroy(): void {}

//   getAllUsers() {
//     const currentUserPhone = localStorage.getItem('phone_number');
//     this.chatList = []; // Clear list

//     this.service.getAllUsers().subscribe((users: any[]) => {
//       users.forEach(user => {
//         if (user.phone_number !== currentUserPhone) {
//           this.service.getUserProfilebyId(user.user_id.toString()).subscribe((profile: any) => {
//             const receiverId = profile.phone_number;
//             const chatId = this.firebaseChatService.generateChatId(currentUserPhone!, receiverId);

//             this.firebaseChatService.getUnreadCount(chatId, currentUserPhone!).then((unreadCount) => {
//               this.chatList.push({
//                 ...user,
//                 receiver_Id: receiverId,
//                 group: false,
//                 unreadCount: unreadCount || 0
//               });
//             });
//           });
//         }
//       });

//       this.loadUserGroups();
//     });
//   }

//   async loadUserGroups() {
//     const userPhone = localStorage.getItem('phone_number');
//     if (!userPhone) return;

//     const groupIds = await this.firebaseChatService.getGroupsForUser(userPhone);

//     for (const groupId of groupIds) {
//       const groupInfo = await this.firebaseChatService.getGroupInfo(groupId);
//       const unreadCount = await this.firebaseChatService.getUnreadCount(groupId, userPhone);

//       this.chatList.push({
//         name: groupInfo.name,
//         receiver_Id: groupId,
//         group: true,
//         message: '',
//         time: '',
//         unreadCount: unreadCount || 0
//       });
//     }
//   }

//   get filteredChats() {
//     let filtered = this.chatList;

//     if (this.selectedFilter === 'read') {
//       filtered = filtered.filter(chat => (chat.unreadCount || 0) === 0 && !chat.group);
//     } else if (this.selectedFilter === 'unread') {
//       filtered = filtered.filter(chat => (chat.unreadCount || 0) > 0 && !chat.group);
//     } else if (this.selectedFilter === 'groups') {
//       filtered = filtered.filter(chat => chat.group);
//     }

//     if (this.searchText.trim() !== '') {
//       const searchLower = this.searchText.toLowerCase();
//       filtered = filtered.filter(chat =>
//         chat.name?.toLowerCase().includes(searchLower) ||
//         chat.message?.toLowerCase().includes(searchLower)
//       );
//     }

//     return filtered;
//   }

//   get totalUnreadCount(): number {
//     return this.chatList.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
//   }

//   setFilter(filter: string) {
//     this.selectedFilter = filter;
//   }

//   openChat(chat: any) {
//     const receiverId = chat.receiver_Id || chat.receiverId;
//     if (chat.group) {
//       this.router.navigate(['/chatting-screen'], {
//         queryParams: { receiverId, isGroup: true }
//       });
//     } else {
//       const cleanPhone = receiverId.replace(/\D/g, '').slice(-10);
//       this.router.navigate(['/chatting-screen'], {
//         queryParams: { receiverId: cleanPhone }
//       });
//     }
//   }

//   async presentPopover(ev: any) {
//     const popover = await this.popoverCtrl.create({
//       component: MenuPopoverComponent,
//       event: ev,
//       translucent: true
//     });
//     await popover.present();
//   }

//   goToContact() {
//     this.router.navigate(['/contact-screen']);
//   }

//   async openCamera() {
//     try {
//       const image = await Camera.getPhoto({
//         source: CameraSource.Camera,
//         quality: 90,
//         resultType: CameraResultType.Uri
//       });
//       this.capturedImage = image.webPath!;
//     } catch (error) {
//       console.error('Camera error:', error);
//     }
//   }

//   async scanBarcode() {
//     const status = await BarcodeScanner.checkPermission({ force: true });
//     if (!status.granted) {
//       alert('Camera permission is required.');
//       return;
//     }

//     await BarcodeScanner.hideBackground();
//     document.body.classList.add('scanner-active');

//     const result = await BarcodeScanner.startScan();
//     if (result.hasContent) {
//       this.scannedText = result.content;
//     } else {
//       alert('No barcode found.');
//     }

//     await BarcodeScanner.showBackground();
//     document.body.classList.remove('scanner-active');
//   }
// }




// import { CommonModule } from '@angular/common';
// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { IonicModule, PopoverController } from '@ionic/angular';
// import { FooterTabsComponent } from '../components/footer-tabs/footer-tabs.component';
// import { Router } from '@angular/router';
// import { MenuPopoverComponent } from '../components/menu-popover/menu-popover.component';
// import { FormsModule } from '@angular/forms';
// import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
// import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
// import { ApiService } from '../services/api/api.service';
// import { FirebaseChatService } from '../services/firebase-chat.service';
// import { Subscription } from 'rxjs';
// import { EncryptionService } from '../services/encryption.service';
// import { Capacitor } from '@capacitor/core';
// import { SecureStorageService } from '../services/secure-storage/secure-storage.service';
// import { decodeBase64 } from '../utils/decodeBase64.util';

// @Component({
//   selector: 'app-home-screen',
//   templateUrl: './home-screen.page.html',
//   styleUrls: ['./home-screen.page.scss'],
//   standalone: true,
//   imports: [IonicModule, CommonModule, FooterTabsComponent, FormsModule]
// })
// export class HomeScreenPage implements OnInit, OnDestroy {
//   constructor(
//     private router: Router,
//     private popoverCtrl: PopoverController,
//     private service: ApiService,
//     private firebaseChatService: FirebaseChatService,
//     private encryptionService: EncryptionService,
//     private secureStorage: SecureStorageService
//   ) { }

//   searchText = '';
//   selectedFilter = 'all';
//   currUserId: string | null = null;
//   senderUserId: string | null = null;

//   // currUserId: string | null = localStorage.getItem('phone_number');
//   // senderUserId: string | null = localStorage.getItem('userId');

//   // currUserId: string | null = localStorage.getItem('phone_number')?.replace(/^(\+91|91)/, '') || null; for one to one chat notification
//   scannedText = '';
//   capturedImage = '';
//   chatList: any[] = [];
//   toggleGroupCreator = false;
//   newGroupName = '';
//   unreadSubs: Subscription[] = [];
//   selectedImage: string | null = null;
//   showPopup = false;

//   async ngOnInit() {
//     this.currUserId = await this.secureStorage.getItem('phone_number');
//     this.senderUserId = await this.secureStorage.getItem('userId');
//     // console.log("currendrt user id ",encUserId);
//     // this.currUserId = decodeBase64(encPhone || '');
//     // this.senderUserId = decodeBase64(encUserId || '');

//     // console.log("currendrt user id ",this.currUserId);
//     this.getAllUsers();
//     this.loadUserGroups();

//     // console.log('Decoded UserID:', this.currUserId);
//   }

//   // async ionViewWillEnter() {
//   //   this.currUserId = await this.secureStorage.getItem('phone_number');
//   //   this.senderUserId = await this.secureStorage.getItem('userId');
//   //   // console.log("currendrt user id ",encUserId);
//   //   // this.currUserId = decodeBase64(encPhone || '');
//   //   // this.senderUserId = decodeBase64(encUserId || '');

//   //   // console.log("currendrt user id ",this.currUserId);
//   //   this.getAllUsers();
//   //   this.loadUserGroups();

//   //   // console.log('Decoded UserID:', this.currUserId);
//   // }

//   ngOnDestroy() {
//     this.unreadSubs.forEach(sub => sub.unsubscribe());
//   }


//   goToUserAbout() {
//     this.showPopup = false;
//     // this.router.navigate(['/userabout']);
//     setTimeout(() => {
//       this.router.navigate(['/profile-screen']);
//     }, 100);
//   }

//   goToUserchat() {
//     this.showPopup = false;
//     // this.router.navigate(['/userabout']);
//     setTimeout(() => {
//       this.router.navigate(['/chatting-screen']);
//     }, 100);
//   }
//   //   async goToUserchat(chat: any) {
//   //   this.showPopup = false;

//   //   const receiverId = chat.receiver_Id;
//   //   const receiver_phone = chat.receiver_phone;
//   //   const receiver_name = chat.name;

//   //   await this.secureStorage.setItem('receiver_name', receiver_name);

//   //   if (chat.group) {
//   //     this.router.navigate(['/chatting-screen'], {
//   //       queryParams: { receiverId, isGroup: true }
//   //     });
//   //   } else {
//   //     const cleanPhone = receiverId.replace(/\D/g, '').slice(-10);
//   //     await this.secureStorage.setItem('receiver_phone', receiver_phone);
//   //     this.router.navigate(['/chatting-screen'], {
//   //       queryParams: { receiverId: cleanPhone, receiver_phone }
//   //     });
//   //   }
//   // }


//   goToUsercall() {
//     this.showPopup = false;
//     // this.router.navigate(['/userabout']);
//     setTimeout(() => {
//       this.router.navigate(['/calls-screen']);
//     }, 100);
//   }

//   goToUservideocall() {
//     this.showPopup = false;
//     // this.router.navigate(['/userabout']);
//     setTimeout(() => {
//       this.router.navigate(['/calling-screen']);
//     }, 100);
//   }

//   openImagePopup(imageUrl: string) {
//     this.selectedImage = imageUrl;
//     this.showPopup = true;
//   }

//   closeImagePopup() {
//     this.selectedImage = null;
//     this.showPopup = false;
//   }


//   getAllUsers() {
//     const currentSenderId = this.senderUserId;
//     console.log("dfjsdjidgf", currentSenderId)
//     if (!currentSenderId) return;

//     this.service.getAllUsers().subscribe((users: any[]) => {
//       users.forEach(user => {
//         const receiverId = user.user_id.toString();
//         // const receiver_phone = user.phone_number.toString();

//         let receiver_phone = user.phone_number.toString();
//         receiver_phone = receiver_phone.replace(/^(\+91|91)/, '');
//         const receiver_name = user.name.toString();
//         // console.log("receiver phone", receiver_phone);

//         if (receiverId !== currentSenderId) {
//           const roomId = this.getRoomId(currentSenderId, receiverId);
//           // console.log("ROOM ID", roomId);

//           const chat = {
//             ...user,
//             name: user.name,
//             receiver_Id: receiverId,
//             receiver_phone: receiver_phone,
//             group: false,
//             message: '',
//             time: '',
//             unreadCount: 0,
//             unread: false
//           };

//           // console.log("chaat:", chat);

//           this.chatList.push(chat);

//           // Listen to messages in this room
//           this.firebaseChatService.listenForMessages(roomId).subscribe(async (messages) => {
//             // console.log("messahes jdfdhjk",messages);
//             if (messages.length > 0) {
//               const lastMsg = messages[messages.length - 1];
//               // console.log(lastMsg);

//               if (
//                 lastMsg.receiver_id === currentSenderId && !lastMsg.delivered
//               ) {
//                 this.firebaseChatService.markDelivered(roomId, lastMsg.key);
//               }

//               try {
//                 const decryptedText = await this.encryptionService.decrypt(lastMsg.text);
//                 chat.message = decryptedText;
//               } catch (e) {
//                 chat.message = '[Encrypted]';
//               }

//               // chat.time = lastMsg.timestamp?.split(', ')[1] || '';
//               if (lastMsg.timestamp) {
//                 chat.time = this.formatTimestamp(lastMsg.timestamp);
//               }
//               // console.log("kktime dkefjg", chat.time);
//             }
//           });

//           // Listen to unread message count
//           const sub = this.firebaseChatService
//             .listenToUnreadCount(roomId, currentSenderId)
//             .subscribe((count: number) => {
//               chat.unreadCount = count;
//               chat.unread = count > 0;
//             });

//           this.unreadSubs.push(sub);
//         }
//       });

//     });
//   }



//   async loadUserGroups() {
//     const userid = this.senderUserId;
//     // console.log("sender user id", userid);
//     if (!userid) return;

//     const groupIds = await this.firebaseChatService.getGroupsForUser(userid);
//     console.log("grouop id ", groupIds);
//     console.log('Groups for user:', groupIds);

//     for (const groupId of groupIds) {
//       const groupInfo = await this.firebaseChatService.getGroupInfo(groupId);
//       if (!groupInfo || !groupInfo.members || !groupInfo.members[userid]) continue;

//       const groupName = groupInfo.name || 'Unnamed Group';

//       const groupChat = {
//         name: groupName,
//         receiver_Id: groupId,
//         group: true,
//         message: '',
//         time: '',
//         unread: false,
//         unreadCount: 0
//       };

//       this.chatList.push(groupChat);

//       // ✅ Listen for latest messages
//       this.firebaseChatService.listenForMessages(groupId).subscribe(async (messages) => {
//         if (messages.length > 0) {
//           const lastMsg = messages[messages.length - 1];

//           try {
//             const decryptedText = await this.encryptionService.decrypt(lastMsg.text);
//             groupChat.message = decryptedText;
//           } catch (e) {
//             groupChat.message = '[Encrypted]';
//           }

//           if (lastMsg.timestamp) {
//             groupChat.time = this.formatTimestamp(lastMsg.timestamp);
//           }
//         }
//       });

//       // ✅ Listen for unread count
//       const sub = this.firebaseChatService
//         .listenToUnreadCount(groupId, userid)
//         .subscribe((count: number) => {
//           groupChat.unreadCount = count;
//           groupChat.unread = count > 0;
//         });

//       this.unreadSubs.push(sub);
//     }
//   }


  

//   //   async loadUserGroups() {

//   //     // console.log("calling this function")
//   //   const userId = this.senderUserId;
//   //   if (!userId) return;

//   //   // Step 1: Get group IDs the user belongs to
//   //   const groupIds = await this.firebaseChatService.getGroupsForUser(userId);

//   //   // Step 2: Loop over each group ID
//   //   for (const groupId of groupIds) {
//   //     const groupInfo = await this.firebaseChatService.getGroupInfo(groupId);

//   //     console.log("group info", groupInfo)

//   //     if (!groupInfo || !groupInfo.members || !groupInfo.members[userId]) continue;

//   //     // Step 3: Create chat object
//   //     const groupChat = {
//   //       name: groupInfo.name || 'Unnamed Group',
//   //       receiver_Id: groupId,
//   //       group: true,
//   //       message: '',
//   //       time: '',
//   //       unread: false,
//   //       unreadCount: 0,
//   //     };

//   //     this.chatList.push(groupChat);

//   //     // Step 4: Listen for new messages
//   //     this.firebaseChatService.listenForMessages(groupId).subscribe(async (messages) => {
//   //       if (messages.length > 0) {
//   //         const lastMsg = messages[messages.length - 1];

//   //         try {
//   //           const decryptedText = await this.encryptionService.decrypt(lastMsg.text);
//   //           groupChat.message = decryptedText;
//   //         } catch (e) {
//   //           groupChat.message = '[Encrypted]';
//   //         }

//   //         if (lastMsg.timestamp) {
//   //           groupChat.time = this.formatTimestamp(lastMsg.timestamp);
//   //         }
//   //       }
//   //     });

//   //     // Step 5: Listen for unread count
//   //     const sub = this.firebaseChatService
//   //       .listenToUnreadCount(groupId, userId)
//   //       .subscribe((count: number) => {
//   //         groupChat.unreadCount = count;
//   //         groupChat.unread = count > 0;
//   //       });

//   //     this.unreadSubs.push(sub);
//   //   }
//   // }




//   // this function shows time and date on chat
//   formatTimestamp(timestamp: string): string {
//     const date = new Date(timestamp);
//     const now = new Date();

//     const isToday = date.toDateString() === now.toDateString();

//     const yesterday = new Date();
//     yesterday.setDate(now.getDate() - 1);
//     const isYesterday = date.toDateString() === yesterday.toDateString();

//     if (isToday) {
//       return date.toLocaleTimeString([], {
//         hour: '2-digit',
//         minute: '2-digit',
//         hour12: true
//       }); // e.g., "11:45 AM"
//     } else if (isYesterday) {
//       return 'Yesterday';
//     } else if (date.getFullYear() === now.getFullYear()) {
//       return date.toLocaleDateString([], { day: 'numeric', month: 'short' }); // e.g., "Jul 1"
//     } else {
//       return date.toLocaleDateString(); // e.g., "01/07/2024"
//     }
//   }



//   get filteredChats() {
//     let filtered = this.chatList;

//     if (this.selectedFilter === 'read') {
//       filtered = filtered.filter(chat => !chat.unread && !chat.group);
//     } else if (this.selectedFilter === 'unread') {
//       filtered = filtered.filter(chat => chat.unread && !chat.group);
//     } else if (this.selectedFilter === 'groups') {
//       filtered = filtered.filter(chat => chat.group);
//     }

//     if (this.searchText.trim() !== '') {
//       const searchLower = this.searchText.toLowerCase();
//       filtered = filtered.filter(chat =>
//         chat.name?.toLowerCase().includes(searchLower) ||
//         chat.message?.toLowerCase().includes(searchLower)
//       );
//     }

//     // Sort by unread count (you can extend to use last message time later)
//     return filtered.sort((a, b) => b.unreadCount - a.unreadCount);
//   }

//   get totalUnreadCount(): number {
//     return this.chatList.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
//   }

//   setFilter(filter: string) {
//     this.selectedFilter = filter;
//   }

//   async openChat(chat: any) {
//     const receiverId = chat.receiver_Id;
//     const receiver_phone = chat.receiver_phone;
//     const receiver_name = chat.name;
//     // localStorage.setItem('receiver_name', receiver_name);
//     // console.log("receivers name for msfk", receiver_name);
//     await this.secureStorage.setItem('receiver_name', receiver_name);
//     if (chat.group) {
//       this.router.navigate(['/chatting-screen'], {
//         queryParams: { receiverId, isGroup: true }
//       });
//     } else {
//       const cleanPhone = receiverId.replace(/\D/g, '').slice(-10);
//       // console.log("lkklkklkl", )
//       // localStorage.setItem('receiver_phone', receiver_phone);
//       await this.secureStorage.setItem('receiver_phone', receiver_phone);
//       this.router.navigate(['/chatting-screen'], {
//         queryParams: { receiverId: cleanPhone, receiver_phone }
//       });
//     }
//   }

//   async presentPopover(ev: any) {
//     const popover = await this.popoverCtrl.create({
//       component: MenuPopoverComponent,
//       event: ev,
//       translucent: true
//     });
//     await popover.present();
//   }

//   goToContact() {
//     this.router.navigate(['/contact-screen']);
//   }

//   async openCamera() {
//     try {
//       const image = await Camera.getPhoto({
//         source: CameraSource.Camera,
//         quality: 90,
//         resultType: CameraResultType.Uri
//       });
//       this.capturedImage = image.webPath!;
//     } catch (error) {
//       console.error('Camera error:', error);
//     }
//   }

//   async scanBarcode() {
//     try {
//       if (!Capacitor.isNativePlatform()) {
//         alert('Barcode scanning only works on a real device.');
//         return;
//       }

//       const permission = await BarcodeScanner.checkPermission({ force: true });
//       if (!permission.granted) {
//         alert('Camera permission is required to scan barcodes.');
//         return;
//       }

//       await BarcodeScanner.prepare(); // Setup camera preview
//       await BarcodeScanner.hideBackground(); // Hide app background to show camera
//       document.body.classList.add('scanner-active');

//       // Start scanning
//       const result = await BarcodeScanner.startScan();

//       if (result?.hasContent) {
//         console.log('Scanned Result:', result.content);
//         this.scannedText = result.content;
//       } else {
//         alert('No barcode found.');
//       }

//     } catch (error) {
//       console.error('Barcode Scan Error:', error);
//       alert('Something went wrong during scanning.');
//     } finally {
//       // Always restore background and clean up
//       await BarcodeScanner.showBackground();
//       await BarcodeScanner.stopScan(); // <-- Ensure scanner is stopped
//       document.body.classList.remove('scanner-active');
//     }
//   }



//   getRoomId(a: string, b: string): string {
//     return a < b ? `${a}_${b}` : `${b}_${a}`;
//   }
// }




//uninstall npm uninstall cordova-plugin-firebasex npm uninstall @ionic-native/firebase-x and change package name




import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule, PopoverController } from '@ionic/angular';
import { FooterTabsComponent } from '../components/footer-tabs/footer-tabs.component';
import { Router } from '@angular/router';
import { MenuPopoverComponent } from '../components/menu-popover/menu-popover.component';
import { FormsModule } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { ApiService } from '../services/api/api.service';
import { FirebaseChatService } from '../services/firebase-chat.service';
import { Subscription } from 'rxjs';
import { EncryptionService } from '../services/encryption.service';
import { Capacitor } from '@capacitor/core';
import { SecureStorageService } from '../services/secure-storage/secure-storage.service';
import { decodeBase64 } from '../utils/decodeBase64.util';

@Component({
  selector: 'app-home-screen',
  templateUrl: './home-screen.page.html',
  styleUrls: ['./home-screen.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FooterTabsComponent, FormsModule]
})
export class HomeScreenPage implements OnInit, OnDestroy {

  searchText = '';
  selectedFilter = 'all';
  currUserId: string | null = null;
  senderUserId: string | null = null;

  scannedText = '';
  capturedImage = '';
  chatList: any[] = [];
  toggleGroupCreator = false;
  newGroupName = '';
  unreadSubs: Subscription[] = [];
  selectedImage: string | null = null;
  showPopup = false;

  constructor(
    private router: Router,
    private popoverCtrl: PopoverController,
    private service: ApiService,
    private firebaseChatService: FirebaseChatService,
    private encryptionService: EncryptionService,
    private secureStorage: SecureStorageService
  ) { }

  async ngOnInit() {
    this.currUserId = await this.secureStorage.getItem('phone_number');
    this.senderUserId = await this.secureStorage.getItem('userId');
    
    this.getAllUsers();
    this.loadUserGroups();
  }

  // ✅ Check for refresh flag when entering page
  async ionViewWillEnter() {
    const shouldRefresh = localStorage.getItem('shouldRefreshHome');
    
    if (shouldRefresh === 'true') {
      console.log('Refreshing home page after group creation...');
      
      // Clear the flag
      localStorage.removeItem('shouldRefreshHome');
      
      // Clear existing chat data to prevent duplicates
      this.clearChatData();
      
      // Reload data
      await this.refreshHomeData();
    }
  }

  // ✅ Clear existing chat data and subscriptions
  private clearChatData() {
    // Unsubscribe from existing subscriptions
    this.unreadSubs.forEach(sub => sub.unsubscribe());
    this.unreadSubs = [];
    
    // Clear chat list
    this.chatList = [];
  }

  // ✅ Refresh home page data
  private async refreshHomeData() {
    try {
      // Reload user IDs
      this.currUserId = await this.secureStorage.getItem('phone_number');
      this.senderUserId = await this.secureStorage.getItem('userId');
      
      // Reload users and groups
      this.getAllUsers();
      await this.loadUserGroups();
      
      console.log('Home page refreshed successfully');
    } catch (error) {
      console.error('Error refreshing home data:', error);
    }
  }

  ngOnDestroy() {
    this.unreadSubs.forEach(sub => sub.unsubscribe());
  }

  goToUserAbout() {
    this.showPopup = false;
    setTimeout(() => {
      this.router.navigate(['/profile-screen']);
    }, 100);
  }

  async goToUserchat() {
  this.showPopup = false;

  setTimeout(async () => {
    // await this.prepareAndNavigateToChat(chat);
  }, 100);
}


  goToUsercall() {
    this.showPopup = false;
    setTimeout(() => {
      this.router.navigate(['/calls-screen']);
    }, 100);
  }

  goToUservideocall() {
    this.showPopup = false;
    setTimeout(() => {
      this.router.navigate(['/calling-screen']);
    }, 100);
  }

  openImagePopup(imageUrl: string) {
    this.selectedImage = imageUrl;
    this.showPopup = true;
  }

  closeImagePopup() {
    this.selectedImage = null;
    this.showPopup = false;
  }

  async prepareAndNavigateToChat(chat: any) {
  const receiverId = chat.receiver_Id;
  const receiver_phone = chat.receiver_phone;
  const receiver_name = chat.name;

  await this.secureStorage.setItem('receiver_name', receiver_name);

  if (chat.group) {
    this.router.navigate(['/chatting-screen'], {
      queryParams: { receiverId, isGroup: true }
    });
  } else {
    const cleanPhone = receiverId.replace(/\D/g, '').slice(-10);
    await this.secureStorage.setItem('receiver_phone', receiver_phone);
    this.router.navigate(['/chatting-screen'], {
      queryParams: { receiverId: cleanPhone, receiver_phone }
    });
  }
}


  getAllUsers() {
    const currentSenderId = this.senderUserId;
    console.log("current sender id:", currentSenderId);
    if (!currentSenderId) return;

    this.service.getAllUsers().subscribe((users: any[]) => {
      users.forEach(user => {
        const receiverId = user.user_id.toString();

        let receiver_phone = user.phone_number.toString();
        receiver_phone = receiver_phone.replace(/^(\+91|91)/, '');
        const receiver_name = user.name.toString();

        if (receiverId !== currentSenderId) {
          const roomId = this.getRoomId(currentSenderId, receiverId);

          // ✅ Check if chat already exists to prevent duplicates
          const existingChat = this.chatList.find(chat => 
            chat.receiver_Id === receiverId && !chat.group
          );
          
          if (existingChat) {
            console.log('Chat already exists for user:', receiverId);
            return; // Skip if already exists
          }

          const chat = {
            ...user,
            name: user.name,
            receiver_Id: receiverId,
            receiver_phone: receiver_phone,
            group: false,
            message: '',
            time: '',
            unreadCount: 0,
            unread: false
          };

          this.chatList.push(chat);

          // Listen to messages in this room
          this.firebaseChatService.listenForMessages(roomId).subscribe(async (messages) => {
            if (messages.length > 0) {
              const lastMsg = messages[messages.length - 1];

              if (
                lastMsg.receiver_id === currentSenderId && !lastMsg.delivered
              ) {
                this.firebaseChatService.markDelivered(roomId, lastMsg.key);
              }

              try {
                const decryptedText = await this.encryptionService.decrypt(lastMsg.text);
                chat.message = decryptedText;
              } catch (e) {
                chat.message = '[Encrypted]';
              }

              if (lastMsg.timestamp) {
                chat.time = this.formatTimestamp(lastMsg.timestamp);
              }
            }
          });

          // Listen to unread message count
          const sub = this.firebaseChatService
            .listenToUnreadCount(roomId, currentSenderId)
            .subscribe((count: number) => {
              chat.unreadCount = count;
              chat.unread = count > 0;
            });

          this.unreadSubs.push(sub);
        }
      });
    });
  }

  async loadUserGroups() {
    const userid = this.senderUserId;
    console.log("sender user id:", userid);
    if (!userid) return;

    const groupIds = await this.firebaseChatService.getGroupsForUser(userid);
    console.log("group ids:", groupIds);
    console.log('Groups for user:', groupIds);

    for (const groupId of groupIds) {
      // ✅ Check if group already exists to prevent duplicates
      const existingGroup = this.chatList.find(chat => 
        chat.receiver_Id === groupId && chat.group
      );
      
      if (existingGroup) {
        console.log('Group already exists:', groupId);
        continue; // Skip if already exists
      }

      const groupInfo = await this.firebaseChatService.getGroupInfo(groupId);
      if (!groupInfo || !groupInfo.members || !groupInfo.members[userid]) continue;

      const groupName = groupInfo.name || 'Unnamed Group';

      const groupChat = {
        name: groupName,
        receiver_Id: groupId,
        group: true,
        message: '',
        time: '',
        unread: false,
        unreadCount: 0
      };

      this.chatList.push(groupChat);

      // ✅ Listen for latest messages
      this.firebaseChatService.listenForMessages(groupId).subscribe(async (messages) => {
        if (messages.length > 0) {
          const lastMsg = messages[messages.length - 1];

          try {
            const decryptedText = await this.encryptionService.decrypt(lastMsg.text);
            groupChat.message = decryptedText;
          } catch (e) {
            groupChat.message = '[Encrypted]';
          }

          if (lastMsg.timestamp) {
            groupChat.time = this.formatTimestamp(lastMsg.timestamp);
          }
        }
      });

      // ✅ Listen for unread count
      const sub = this.firebaseChatService
        .listenToUnreadCount(groupId, userid)
        .subscribe((count: number) => {
          groupChat.unreadCount = count;
          groupChat.unread = count > 0;
        });

      this.unreadSubs.push(sub);
    }
  }

  // Format timestamp for display
  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }); // e.g., "11:45 AM"
    } else if (isYesterday) {
      return 'Yesterday';
    } else if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { day: 'numeric', month: 'short' }); // e.g., "Jul 1"
    } else {
      return date.toLocaleDateString(); // e.g., "01/07/2024"
    }
  }

  get filteredChats() {
    let filtered = this.chatList;

    if (this.selectedFilter === 'read') {
      filtered = filtered.filter(chat => !chat.unread && !chat.group);
    } else if (this.selectedFilter === 'unread') {
      filtered = filtered.filter(chat => chat.unread && !chat.group);
    } else if (this.selectedFilter === 'groups') {
      filtered = filtered.filter(chat => chat.group);
    }

    if (this.searchText.trim() !== '') {
      const searchLower = this.searchText.toLowerCase();
      filtered = filtered.filter(chat =>
        chat.name?.toLowerCase().includes(searchLower) ||
        chat.message?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by unread count (highest first)
    return filtered.sort((a, b) => b.unreadCount - a.unreadCount);
  }

  get totalUnreadCount(): number {
    return this.chatList.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
  }

  setFilter(filter: string) {
    this.selectedFilter = filter;
  }

  async openChat(chat: any) {
    const receiverId = chat.receiver_Id;
    const receiver_phone = chat.receiver_phone;
    const receiver_name = chat.name;
    
    await this.secureStorage.setItem('receiver_name', receiver_name);
    
    if (chat.group) {
      this.router.navigate(['/chatting-screen'], {
        queryParams: { receiverId, isGroup: true }
      });
    } else {
      const cleanPhone = receiverId.replace(/\D/g, '').slice(-10);
      await this.secureStorage.setItem('receiver_phone', receiver_phone);
      this.router.navigate(['/chatting-screen'], {
        queryParams: { receiverId: cleanPhone, receiver_phone }
      });
    }
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverCtrl.create({
      component: MenuPopoverComponent,
      event: ev,
      translucent: true
    });
    await popover.present();
  }

  goToContact() {
    this.router.navigate(['/contact-screen']);
  }

  async openCamera() {
    try {
      const image = await Camera.getPhoto({
        source: CameraSource.Camera,
        quality: 90,
        resultType: CameraResultType.Uri
      });
      this.capturedImage = image.webPath!;
    } catch (error) {
      console.error('Camera error:', error);
    }
  }

  async scanBarcode() {
    try {
      if (!Capacitor.isNativePlatform()) {
        alert('Barcode scanning only works on a real device.');
        return;
      }

      const permission = await BarcodeScanner.checkPermission({ force: true });
      if (!permission.granted) {
        alert('Camera permission is required to scan barcodes.');
        return;
      }

      await BarcodeScanner.prepare();
      await BarcodeScanner.hideBackground();
      document.body.classList.add('scanner-active');

      const result = await BarcodeScanner.startScan();

      if (result?.hasContent) {
        console.log('Scanned Result:', result.content);
        this.scannedText = result.content;
      } else {
        alert('No barcode found.');
      }

    } catch (error) {
      console.error('Barcode Scan Error:', error);
      alert('Something went wrong during scanning.');
    } finally {
      await BarcodeScanner.showBackground();
      await BarcodeScanner.stopScan();
      document.body.classList.remove('scanner-active');
    }
  }

  getRoomId(a: string, b: string): string {
    return a < b ? `${a}_${b}` : `${b}_${a}`;
  }
}