// import { CommonModule } from '@angular/common';
// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { IonicModule, NavController, PopoverController } from '@ionic/angular';
// // import { FooterTabsComponent } from '../../../components/footer-tabs/footer-tabs.component';
// import { Router } from '@angular/router';
// import { MenuPopoverComponent } from '../../../components/menu-popover/menu-popover.component';
// import { FormsModule } from '@angular/forms';
// import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
// import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
// import { ApiService } from '../../../services/api/api.service';
// import { FirebaseChatService } from '../../../services/firebase-chat.service';
// import { Subscription } from 'rxjs';
// import { EncryptionService } from '../../../services/encryption.service';
// import { Capacitor } from '@capacitor/core';
// import { SecureStorageService } from '../../../services/secure-storage/secure-storage.service';
// import { ContactSyncService } from 'src/app/services/contact-sync.service';
// // import { decodeBase64 } from '../utils/decodeBase64.util';
// import { v4 as uuidv4 } from 'uuid';
// import { Message } from 'src/types';
// import { AuthService } from 'src/app/auth/auth.service';

// @Component({
//   selector: 'app-forwardmessage',
//   templateUrl: './forwardmessage.page.html',
//   styleUrls: ['./forwardmessage.page.scss'],
//   standalone: true,
//   imports: [IonicModule, CommonModule, FormsModule],
// })
// export class ForwardmessagePage implements OnInit, OnDestroy {
//   searchText = '';
//   selectedFilter = 'all';
//   currUserId: string | null = null;
//   senderUserId: string | null = null;

//   scannedText = '';
//   capturedImage = '';
//   chatList: any[] = [];
//   toggleGroupCreator = false;
//   newGroupName = '';
//   unreadSubs: Subscription[] = [];
//   selectedImage: string | null = null;
//   showPopup = false;
//   matchedContacts: any[] = [];
//   filteredContacts: any[] = [];
//   isLoadingContacts = true;

//   selectedContacts: any[] = [];
//   selectedUserDetails: any[] = [];
//   forwardedMessage: any;

//   sender_name: string | null = null;
//   sender_phone: string | null = null;


//   constructor(
//     private router: Router,
//     private popoverCtrl: PopoverController,
//     private service: ApiService,
//     private firebaseChatService: FirebaseChatService,
//     private encryptionService: EncryptionService,
//     private secureStorage: SecureStorageService,
//     private navCtrl: NavController,
//     private contactSyncService: ContactSyncService,
//     private authService: AuthService
//   ) { }

//   statusList = [
//     { name: 'My status', subtitle: 'My contacts', avatar: 'assets/images/user.jfif' },
//     { name: 'Meta AI', subtitle: 'Ask me anything', avatar: 'assets/images/user.jfif' }
//   ];

//   // frequentlyContacted = [
//   //   { name: 'User 1', subtitle: 'User message', avatar: 'assets/images/user.jfif' },
//   //   { name: 'User 2 - first', subtitle: 'User message 2', avatar: 'assets/images/user.jfif' },
//   //   { name: 'User 2 - second', subtitle: 'User message 2', avatar: 'assets/images/user.jfif' }
//   // ];

//   // filteredChats you already have
//   filteredChats = [];


//   async ngOnInit() {
//     this.currUserId = await this.secureStorage.getItem('phone_number');
//     this.senderUserId = this.authService.authData?.userId || '';
//     await this.loadDeviceMatchedContacts();

//     // this.getAllUsers();
//     // this.loadUserGroups();
//   }

//   async ionViewWillEnter() {
//     const shouldRefresh = localStorage.getItem('shouldRefreshHome');
//     if (shouldRefresh === 'true') {
//       localStorage.removeItem('shouldRefreshHome');
//       this.clearChatData();
//       await this.refreshHomeData();
//     }
//   }

//   private clearChatData() {
//     this.unreadSubs.forEach((sub) => sub.unsubscribe());
//     this.unreadSubs = [];
//     this.chatList = [];
//   }

//   private async refreshHomeData() {
//     try {
//       this.currUserId = await this.secureStorage.getItem('phone_number');
//       this.senderUserId = await this.secureStorage.getItem('userId');
//       // this.getAllUsers();
//       // await this.loadUserGroups();
//     } catch (error) {
//       console.error('Error refreshing home data:', error);
//     }
//   }

//   ngOnDestroy() {
//     this.unreadSubs.forEach((sub) => sub.unsubscribe());
//   }

//   goToUserAbout() {
//     this.showPopup = false;
//     setTimeout(() => {
//       this.router.navigate(['/profile-screen']);
//     }, 100);
//   }

//   async goToUserchat() {
//     this.showPopup = false;
//     setTimeout(async () => {
//       // await this.prepareAndNavigateToChat(chat);
//     }, 100);
//   }

//   goToUsercall() {
//     this.showPopup = false;
//     setTimeout(() => {
//       this.router.navigate(['/calls-screen']);
//     }, 100);
//   }

//   goToUservideocall() {
//     this.showPopup = false;
//     setTimeout(() => {
//       this.router.navigate(['/calling-screen']);
//     }, 100);
//   }

//   goBack() {
//     this.navCtrl.back();
//   }

//   async loadDeviceMatchedContacts() {
//     this.isLoadingContacts = true;
//     try {
//       const currentUserPhone = await this.secureStorage.getItem('phone_number');
//       const currentUserId = await this.secureStorage.getItem('userId');

//       const matchedUsers = await this.contactSyncService.getMatchedUsers();

//       // Exclude current user
//       this.matchedContacts = matchedUsers.filter(
//         (u: any) => u.phone_number !== currentUserPhone
//       );

//       // Initialize with selection flag
//       this.matchedContacts = this.matchedContacts.map((u: any) => ({
//         ...u,
//         selected: false
//       }));

//       this.filteredContacts = [...this.matchedContacts];
//       //console.log('Matched contacts loaded:', this.filteredContacts);
//     } catch (error) {
//       console.error('Error loading matched contacts', error);
//     } finally {
//       this.isLoadingContacts = false;
//     }
//   }




//   async prepareAndNavigateToChat(chat: any) {
//     const receiverId = chat.receiver_Id;
//     const receiver_phone = chat.receiver_phone;
//     const receiver_name = chat.name;
//     await this.secureStorage.setItem('receiver_name', receiver_name);
//     if (chat.group) {
//       this.router.navigate(['/chatting-screen'], {
//         queryParams: { receiverId, isGroup: true },
//       });
//     } else {
//       const cleanPhone = receiverId.replace(/\D/g, '').slice(-10);
//       await this.secureStorage.setItem('receiver_phone', receiver_phone);
//       this.router.navigate(['/chatting-screen'], {
//         queryParams: { receiverId: cleanPhone, receiver_phone },
//       });
//     }
//   }


//   formatTimestamp(timestamp: string): string {
//     const date = new Date(timestamp);
//     const now = new Date();
//     if (date.toDateString() === now.toDateString()) {
//       return date.toLocaleTimeString([], {
//         hour: '2-digit',
//         minute: '2-digit',
//         hour12: true,
//       });
//     }
//     const yesterday = new Date();
//     yesterday.setDate(now.getDate() - 1);
//     if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
//     if (date.getFullYear() === now.getFullYear()) {
//       return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
//     }
//     return date.toLocaleDateString();
//   }


//   get totalUnreadCount(): number {
//     return this.chatList.reduce(
//       (sum, chat) => sum + (chat.unreadCount || 0),
//       0
//     );
//   }

//   setFilter(filter: string) {
//     this.selectedFilter = filter;
//   }


//   getRoomId(a: string, b: string): string {
//     return a < b ? `${a}_${b}` : `${b}_${a}`;
//   }

//   selectedUsers = new Set<string>();

//   get selectedNames(): string {
//     return this.matchedContacts
//       .filter(c => c.selected)
//       .map(c => c.name)
//       .join(', ');
//   }


//   toggleSelection(contact: any) {
//     contact.selected = !contact.selected;

//     if (contact.selected) {
//       this.selectedContacts.push(contact);
//     } else {
//       this.selectedContacts = this.selectedContacts.filter(
//         c => c.phone_number !== contact.phone_number
//       );
//     }

//     //console.log('Currently selected contacts:', this.selectedContacts);
//   }

//   /**
//    * Fetch details for selected contacts using API
//    */
//   async fetchSelectedUserDetails() {
//     if (this.selectedContacts.length === 0) {
//       console.warn('No contacts selected to fetch details.');
//       return;
//     }

//     try {
//       const allUsers: any = await this.service.getAllUsers().toPromise();

//       this.selectedUserDetails = this.selectedContacts.map(selectedContact => {
//         return allUsers.find(
//           (user: any) => user.phone_number === selectedContact.phone_number
//         );
//       }).filter(Boolean);

//       //console.log('Fetched details for selected contacts:', this.selectedUserDetails);
//     } catch (error) {
//       console.error('Error fetching selected user details:', error);
//     }
//   }



//   async sendForward() {
//     const forwardMessages = this.firebaseChatService.getForwardMessages();

//     if (!forwardMessages || forwardMessages.length === 0) {
//       return;
//     }

//     for (const forwardedMessage of forwardMessages) {
//       if (this.selectedContacts.length === 0) {
//         return;
//       }

//       for (const contact of this.selectedContacts) {
//         const receiverId = contact.user_id;
//         const roomId = this.getRoomId(this.senderUserId!, receiverId);

//         this.senderUserId = this.authService.authData?.userId || '';
//         this.sender_phone = this.authService.authData?.phone_number || '';
//         this.sender_name = await this.secureStorage.getItem('name') || '';

//         const message: Message = {
//           sender_id: this.senderUserId!,
//           sender_phone: this.sender_phone,
//           sender_name: this.sender_name,
//           receiver_id: receiverId,
//           receiver_phone: contact.phone_number,
//           delivered: false,
//           read: false,
//           message_id: uuidv4(),
//           timestamp: new Date().toISOString(),
//           isDeleted: false,
//           isForwarded: true,
//           replyToMessageId: forwardedMessage.replyToMessageId || "",
//           text: ""
//         };

//         if (forwardedMessage.attachment && Object.keys(forwardedMessage.attachment).length > 0) {
//           message.attachment = { ...forwardedMessage.attachment };
//           message.text = "";
//         }
//         else if (forwardedMessage.text) {
//           let textToSend = forwardedMessage.text;

//           if (!textToSend.startsWith('ENC:')) {
//             textToSend = await this.encryptionService.encrypt(textToSend);
//           }

//           message.text = textToSend;
//         }

//         // await this.firebaseChatService.sendMessage(roomId, message, 'private', this.senderUserId);
//       }
//     }

//     this.firebaseChatService.clearForwardMessages();
//     this.router.navigate(['/home-screen']);
//   }
// }



import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule, NavController, PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { MenuPopoverComponent } from '../../../components/menu-popover/menu-popover.component';
import { FormsModule } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { ApiService } from '../../../services/api/api.service';
import { FirebaseChatService } from '../../../services/firebase-chat.service';
import { Subscription } from 'rxjs';
import { EncryptionService } from '../../../services/encryption.service';
import { Capacitor } from '@capacitor/core';
import { SecureStorageService } from '../../../services/secure-storage/secure-storage.service';
import { ContactSyncService } from 'src/app/services/contact-sync.service';
import { v4 as uuidv4 } from 'uuid';
import { Message } from 'src/types';
import { AuthService } from 'src/app/auth/auth.service';
import { IMessage } from 'src/app/services/sqlite.service';

@Component({
  selector: 'app-forwardmessage',
  templateUrl: './forwardmessage.page.html',
  styleUrls: ['./forwardmessage.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ForwardmessagePage implements OnInit, OnDestroy {
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
  
  // Updated properties for device contacts
  allUsers: any[] = [];
  filteredContacts: any[] = [];
  isLoadingContacts = true;

  selectedContacts: any[] = [];
  selectedUserDetails: any[] = [];
  forwardedMessage: any;

  sender_name: string | null = null;
  sender_phone: string | null = null;

  constructor(
    private router: Router,
    private popoverCtrl: PopoverController,
    private service: ApiService,
    private firebaseChatService: FirebaseChatService,
    private encryptionService: EncryptionService,
    private secureStorage: SecureStorageService,
    private navCtrl: NavController,
    private contactSyncService: ContactSyncService,
    private authService: AuthService
  ) { }

  statusList = [
    { name: 'My status', subtitle: 'My contacts', avatar: 'assets/images/user.jfif' },
    { name: 'Meta AI', subtitle: 'Ask me anything', avatar: 'assets/images/user.jfif' }
  ];

  async ngOnInit() {
    this.currUserId = await this.secureStorage.getItem('phone_number');
    this.senderUserId = this.authService.authData?.userId || '';
    await this.loadDeviceMatchedContacts();
  }

  async ionViewWillEnter() {
    const shouldRefresh = localStorage.getItem('shouldRefreshHome');
    if (shouldRefresh === 'true') {
      localStorage.removeItem('shouldRefreshHome');
      this.clearChatData();
      await this.refreshHomeData();
    }
  }

  private clearChatData() {
    this.unreadSubs.forEach((sub) => sub.unsubscribe());
    this.unreadSubs = [];
    this.chatList = [];
  }

  private async refreshHomeData() {
    try {
      this.currUserId = await this.secureStorage.getItem('phone_number');
      this.senderUserId = await this.secureStorage.getItem('userId');
    } catch (error) {
      console.error('Error refreshing home data:', error);
    }
  }

  ngOnDestroy() {
    this.unreadSubs.forEach((sub) => sub.unsubscribe());
  }

  goToUserAbout() {
    this.showPopup = false;
    setTimeout(() => {
      this.router.navigate(['/profile-screen']);
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

  goBack() {
    this.navCtrl.back();
  }

  // Updated method - same as add-members page
  async loadDeviceMatchedContacts(): Promise<void> {
    const currentUserPhone = this.authService.authData?.phone_number;
    this.allUsers = [];
    this.isLoadingContacts = true;

    try {
      const pfUsers = this.firebaseChatService.currentUsers || [];
      const deviceContacts = this.firebaseChatService.currentDeviceContacts || [];

      // Extract platform user phone numbers for reference
      const pfUserPhones = pfUsers.map((pu: any) => String(pu.phoneNumber));

      // Optionally: find device contacts not on the platform
      const nonPfUsers = deviceContacts.filter(
        (dc: any) => !pfUserPhones.includes(String(dc.phoneNumber))
      );

      // Normalize platform users to match your HTML structure
      this.allUsers = [
        ...pfUsers.map((u: any) => ({
          user_id: String(u.userId ?? u.user_id ?? ''), // backend ID
          name: u.username ?? u.name ?? u.phoneNumber ?? 'Unknown',
          image: u.avatar ?? u.profile ?? 'assets/images/user.jfif',
          phone_number: String(u.phoneNumber ?? ''),
          isOnPlatform: true,
          selected: false,
        })),
        // Optional: Uncomment if you want to include non-platform device contacts
        // ...nonPfUsers.map((dc: any) => ({
        //   user_id: null,
        //   name: dc.username ?? dc.phoneNumber,
        //   image: dc.avatar ?? 'assets/images/user.jfif',
        //   phone_number: String(dc.phoneNumber),
        //   isOnPlatform: false,
        //   selected: false,
        // })),
      ];

      // Filter out current user
      this.allUsers = this.allUsers.filter(
        (u: any) => u.phone_number !== currentUserPhone
      );

      // Initialize filtered list for search
      this.filteredContacts = [...this.allUsers];
      console.log('Device contacts loaded:', this.filteredContacts);
    } catch (error) {
      console.error('Error loading contacts', error);
    } finally {
      this.isLoadingContacts = false;
    }
  }

  // Updated toggle selection method
  toggleSelection(contact: any) {
    contact.selected = !contact.selected;

    if (contact.selected) {
      this.selectedContacts.push(contact);
    } else {
      this.selectedContacts = this.selectedContacts.filter(
        c => c.user_id !== contact.user_id
      );
    }

    console.log('Currently selected contacts:', this.selectedContacts);
  }

  // Filter users based on search text
  filteredUsers() {
    const search = this.searchText.toLowerCase();
    return this.filteredContacts.filter(user =>
      user.name?.toLowerCase().includes(search)
    );
  }

  get selectedNames(): string {
    return this.selectedContacts
      .map(c => c.name)
      .join(', ');
  }

  getRoomId(a: string, b: string): string {
    return a < b ? `${a}_${b}` : `${b}_${a}`;
  }

  async sendForward() {
    const forwardMessages = this.firebaseChatService.getForwardMessages();
    console.log({forwardMessages})

    if (!forwardMessages || forwardMessages.length === 0) {
      return;
    }

    for (const forwardedMessage of forwardMessages) {
      if (this.selectedContacts.length === 0) {
        return;
      }

      for (const contact of this.selectedContacts) {
        const receiverId = contact.user_id;
        console.log("this selected contacts", this.selectedContacts)
        const roomId = this.getRoomId(this.senderUserId!, receiverId);
        console.log({roomId})


        const message: any = {
          ...forwardMessages,
          timestamp: new Date().toISOString(),
          // isDeleted: false,
          isForwarded: true,
          // replyToMessageId: forwardedMessage.replyToMessageId || "",
        };

        if (forwardedMessage.attachment && Object.keys(forwardedMessage.attachment).length > 0) {
          message.mediaId = { ...forwardedMessage.attachment };
          message.text = "";
        }
        else if (forwardedMessage.text) {
          let textToSend = forwardedMessage.text;

          if (!textToSend.startsWith('ENC:')) {
            textToSend = await this.encryptionService.encrypt(textToSend);
          }

          message.text = textToSend;
        }

        await this.firebaseChatService.sendMessage(message);
        console.log({message})
      }
    }

    this.firebaseChatService.clearForwardMessages();
    this.router.navigate(['/home-screen']);
  }
}