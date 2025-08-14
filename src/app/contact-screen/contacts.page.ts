// import { CommonModule } from '@angular/common';
// import { Component, OnInit, ViewChild } from '@angular/core';
// import { IonicModule, IonInput, PopoverController } from '@ionic/angular';
// import { MenuPopoverComponent } from '../components/menu-popover/menu-popover.component';
// import { ContactMenuComponent } from '../components/contact-menu/contact-menu.component';
// import { ActionSheetController } from '@ionic/angular';
// import { Router } from '@angular/router';
// import { FormsModule } from '@angular/forms';
// import { FirebaseChatService } from '../services/firebase-chat.service';
// import { ContactSyncService } from '../services/contact-sync.service';
// import { SecureStorageService } from '../services/secure-storage/secure-storage.service';
// import { ApiService } from '../services/api/api.service';
// import { AuthService } from '../auth/auth.service';

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

//   isLoading = true; // ✅ loader flag

//   constructor(
//     private router: Router,
//     private popoverControl: PopoverController,
//     private actionSheetCtrl: ActionSheetController,
//     private firebaseChatService: FirebaseChatService,
//     private contactSyncService: ContactSyncService,
//     private secureStorage: SecureStorageService,
//     private api: ApiService,
//     private authService: AuthService
//   ) {}

//   ngOnInit() {
//     this.loadDeviceMatchedContacts();
//     const currentUserName = localStorage.getItem('name');
//     console.log("username",currentUserName);
//   }

//   /**
//    * ✅ Loads contacts from device that match backend users
//    */
//   async loadDeviceMatchedContacts() {
//     // const currentUserPhone = localStorage.getItem('phone_number');
//     const currentUserPhone = this.authService.authData?.phone_number;
//     this.allUsers = [];
//     this.isLoading = true; // show loader

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
//     } finally {
//       this.isLoading = false;
//     }
//   }

//   startGroupCreation() {
//     this.creatingGroup = true;
//   }

// async createGroup() {
//   const selectedUsers = this.allUsers.filter(user => user.selected);
//   // const currentUserId = localStorage.getItem('userId')!;
//   const currentUserId = this.authService.authData?.userId || '';
//   const currentUserPhone = this.authService.authData?.phone_number
//   const currentUserName = await this.secureStorage.getItem('name');
// console.log("Current User Name:", currentUserName);

//   console.log("username",currentUserName);

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

//   try {
//     // Create group in Firebase
//     await this.firebaseChatService.createGroup(groupId, this.newGroupName, members, currentUserId);
    
//     // Sync to backend
//     this.api.createGroup(this.newGroupName, Number(currentUserId), groupId).subscribe({
//       next: () => {
//         console.log('Group synced to backend.');
//       },
//       error: (err: any) => {
//         console.error('Failed to sync group to backend:', err);
//       }
//     });

//     // Reset form
//     this.creatingGroup = false;
//     this.newGroupName = '';
//     this.allUsers.forEach(u => (u.selected = false));
    
//     // Show success message
//     alert('Group created successfully');
    
//     // ✅ Set refresh flag and navigate to home
//     localStorage.setItem('shouldRefreshHome', 'true');
//     this.router.navigate(['/home-screen']);
    
//   } catch (error) {
//     console.error('Error creating group:', error);
//     alert('Failed to create group');
//   }
// }

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
import { SecureStorageService } from '../services/secure-storage/secure-storage.service';
import { ApiService } from '../services/api/api.service';
import { AuthService } from '../auth/auth.service';

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
    private contactSyncService: ContactSyncService,
    private secureStorage: SecureStorageService,
    private api: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadDeviceMatchedContacts();
    const currentUserName = localStorage.getItem('name');
    console.log("username",currentUserName);
  }

  /**
   * ✅ Loads contacts from device that match backend users
   */
  async loadDeviceMatchedContacts() {
    // const currentUserPhone = localStorage.getItem('phone_number');
    const currentUserPhone = this.authService.authData?.phone_number;
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
      this.isLoading = false;
    }
  }

  // ✅ NEW METHOD: Open chat with selected contact
  async openContactChat(contact: any) {
    try {
      const receiverId = contact.user_id?.toString() || contact.receiver_Id;
      let receiver_phone = contact.phone_number?.toString() || contact.receiver_Id;
      const receiver_name = contact.name;

      // Clean phone number (remove country codes)
      receiver_phone = receiver_phone.replace(/^(\+91|91)/, '');

      // Store receiver details in secure storage
      await this.secureStorage.setItem('receiver_name', receiver_name);
      await this.secureStorage.setItem('receiver_phone', receiver_phone);

      // Clean phone for navigation (last 10 digits)
      const cleanPhone = receiverId.replace(/\D/g, '').slice(-10);

      console.log('Navigating to chat with:', {
        receiverId: cleanPhone,
        receiver_phone,
        receiver_name
      });

      // Navigate to chatting screen
      this.router.navigate(['/chatting-screen'], {
        queryParams: { 
          receiverId: cleanPhone, 
          receiver_phone: receiver_phone 
        }
      });

    } catch (error) {
      console.error('Error opening chat:', error);
      alert('Failed to open chat. Please try again.');
    }
  }

  startGroupCreation() {
    this.creatingGroup = true;
  }

async createGroup() {
  const selectedUsers = this.allUsers.filter(user => user.selected);
  // const currentUserId = localStorage.getItem('userId')!;
  const currentUserId = this.authService.authData?.userId || '';
  const currentUserPhone = this.authService.authData?.phone_number
  const currentUserName = await this.secureStorage.getItem('name');
console.log("Current User Name:", currentUserName);

  console.log("username",currentUserName);

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

  try {
    // Create group in Firebase
    await this.firebaseChatService.createGroup(groupId, this.newGroupName, members, currentUserId);
    
    // Sync to backend
    this.api.createGroup(this.newGroupName, Number(currentUserId), groupId).subscribe({
      next: () => {
        console.log('Group synced to backend.');
      },
      error: (err: any) => {
        console.error('Failed to sync group to backend:', err);
      }
    });

    // Reset form
    this.creatingGroup = false;
    this.newGroupName = '';
    this.allUsers.forEach(u => (u.selected = false));
    
    // Show success message
    alert('Group created successfully');
    
    // ✅ Set refresh flag and navigate to home
    localStorage.setItem('shouldRefreshHome', 'true');
    this.router.navigate(['/home-screen']);
    
  } catch (error) {
    console.error('Error creating group:', error);
    alert('Failed to create group');
  }
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

  // ✅ Helper method to get room ID (same as home screen)
  getRoomId(a: string, b: string): string {
    return a < b ? `${a}_${b}` : `${b}_${a}`;
  }
}