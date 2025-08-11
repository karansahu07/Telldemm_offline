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

        // ✅ Skip duplicate chats
        const existingChat = this.chatList.find(chat =>
          chat.receiver_Id === receiverId && !chat.group
        );
        if (existingChat) {
          console.log('Chat already exists for user:', receiverId);
          return;
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

        // 🔔 Listen to last message
        this.firebaseChatService.listenForMessages(roomId).subscribe(async (messages) => {
          if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            // console.log("attachment type",lastMsg.attachment.type);
            // ✅ Mark as delivered if needed
            if (lastMsg.receiver_id === currentSenderId && !lastMsg.delivered) {
              this.firebaseChatService.markDelivered(roomId, lastMsg.key);
            }
            // console.log("typeeeeeeee",lastMsg.type);
            // 🔐 Show "deleted" or decrypt message or show attachment type
            if (lastMsg.isDeleted) {
              chat.message = 'This message was deleted';
            } else if (lastMsg.attachment?.type && lastMsg.attachment.type !== 'text') {
              // Show type for attachments
              switch (lastMsg.attachment.type) {
                case 'image':
                  chat.message = '📷 Photo';
                  break;
                case 'video':
                  chat.message = '🎥 Video';
                  break;
                case 'audio':
                  chat.message = '🎵 Audio';
                  break;
                case 'file':
                  chat.message = '📎 Attachment';
                  break;
                default:
                  chat.message = '[Media]';
              }
            } else {
              // Decrypt text
              try {
                const decryptedText = await this.encryptionService.decrypt(lastMsg.text);
                chat.message = decryptedText;
              } catch (e) {
                chat.message = '[Encrypted]';
              }
            }

            // 🕒 Set time
            if (lastMsg.timestamp) {
              chat.time = this.formatTimestamp(lastMsg.timestamp);
            }
          }
        });

        // 🔔 Listen to unread message count
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

  for (const groupId of groupIds) {
    // ✅ Skip duplicate group chats
    const existingGroup = this.chatList.find(chat =>
      chat.receiver_Id === groupId && chat.group
    );
    if (existingGroup) {
      console.log('Group already exists:', groupId);
      continue;
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

    // ✅ Listen for latest message in group
    this.firebaseChatService.listenForMessages(groupId).subscribe(async (messages) => {
      if (messages.length > 0) {
        const lastMsg = messages[messages.length - 1];

        if (lastMsg.isDeleted) {
          groupChat.message = 'This message was deleted';
        } else if (lastMsg.attachment?.type && lastMsg.attachment.type !== 'text') {
          // Show appropriate icon for attachment
          switch (lastMsg.attachment.type) {
            case 'image':
              groupChat.message = '📷 Photo';
              break;
            case 'video':
              groupChat.message = '🎥 Video';
              break;
            case 'audio':
              groupChat.message = '🎵 Audio';
              break;
            case 'file':
              groupChat.message = '📎 Attachment';
              break;
            default:
              groupChat.message = '[Media]';
          }
        } else {
          // Decrypt normal text message
          try {
            const decryptedText = await this.encryptionService.decrypt(lastMsg.text);
            groupChat.message = decryptedText;
          } catch (e) {
            groupChat.message = '[Encrypted]';
          }
        }

        // Format time
        if (lastMsg.timestamp) {
          groupChat.time = this.formatTimestamp(lastMsg.timestamp);
        }
      }
    });

    // ✅ Listen for unread messages
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