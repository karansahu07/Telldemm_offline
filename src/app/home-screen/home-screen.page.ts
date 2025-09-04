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
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';
import { onValue, ref } from '@angular/fire/database';
import { Database } from '@angular/fire/database';
import { ContactSyncService } from '../services/contact-sync.service';

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
  sender_name: string | undefined;

  constructor(
    private router: Router,
    private popoverCtrl: PopoverController,
    private service: ApiService,
    private firebaseChatService: FirebaseChatService,
    private encryptionService: EncryptionService,
    private secureStorage: SecureStorageService,
    private authService: AuthService,
    private db: Database,
    private contactSyncService : ContactSyncService
  ) { }

  // async ngOnInit() {
  //   this.currUserId = this.authService.authData?.phone_number || '';
  //   this.senderUserId = this.authService.authData?.userId || '';

  //   this.getAllUsers();
  //   this.loadUserGroups();
  // }

  private avatarErrorIds = new Set<string>();

  isLoading: boolean = true;

  async ngOnInit() {
  this.currUserId = this.authService.authData?.phone_number || '';
  this.senderUserId = this.authService.authData?.userId || '';

  await this.loadData(); // ✅ loader ke saath load
}

  // ✅ Check for refresh flag when entering page
  // async ionViewWillEnter() {

  //   const shouldRefresh = localStorage.getItem('shouldRefreshHome');

  //   if (shouldRefresh === 'true') {
  //     console.log('Refreshing home page after group creation...');

  //     // Clear the flag
  //     localStorage.removeItem('shouldRefreshHome');

  //     // Clear existing chat data to prevent duplicates
  //     this.clearChatData();

  //     // Reload data
  //     await this.refreshHomeData();
  //   }
  // }

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

    // ✅ User profile reloadl
    await this.loadData();
    this.sender_name = this.authService.authData?.name || '';
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
  // private async refreshHomeData() {
  //   try {
  //     // Reload user IDs
  //     // this.currUserId = await this.secureStorage.getItem('phone_number');
  //     // this.currUserId = await this.secureStorage.getItem('phone_number');
  //     // this.senderUserId = await this.secureStorage.getItem('userId');
  //     this.currUserId = this.authService.authData?.phone_number || '';
  //     this.senderUserId = this.authService.authData?.userId || '';

  //     // Reload users and groups
  //     this.getAllUsers();
  //     await this.loadUserGroups();

  //     console.log('Home page refreshed successfully');
  //   } catch (error) {
  //     console.error('Error refreshing home data:', error);
  //   }
  // }

  // ✅ Refresh home page data with sorting
private async refreshHomeData() {
  try {
    // Reload user IDs
    this.currUserId = this.authService.authData?.phone_number || '';
    this.senderUserId = this.authService.authData?.userId || '';

    this.chatList = [];

    // Reload users and groups
    await Promise.all([
      this.getAllUsers(),
      this.loadUserGroups()
    ]);

    // ✅ Sort chats by latest timestamp (always latest first)
    this.chatList.sort((a, b) => {
      const timeA = new Date(a.time ? a.time : 0).getTime();
      const timeB = new Date(b.time ? b.time : 0).getTime();
      return timeB - timeA;
    });

    console.log('Home page refreshed successfully');
  } catch (error) {
    console.error('Error refreshing home data:', error);
  }
}


  async loadData() {
  try {
    this.isLoading = true;

    await Promise.all([
      this.getAllUsers(),
      this.loadUserGroups()
    ]);

    this.isLoading = false;
  } catch (err) {
    console.error('Error loading home data:', err);
    this.isLoading = false;
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

  openImagePopup(profile_picture_url : string) {
    this.selectedImage = profile_picture_url;
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

private normalizePhone(num?: string): string {
  if (!num) return '';
  return num.replace(/\D/g, '').slice(-10);
}


  // getAllUsers() {
  //   const currentSenderId = this.senderUserId;
  //   console.log("current sender id:", currentSenderId);
  //   if (!currentSenderId) return;

  //   this.service.getAllUsers().subscribe((users: any[]) => {
  //     users.forEach(user => {
  //       const receiverId = user.user_id.toString();

  //       if (receiverId === currentSenderId) return;

  //       this.checkUserInRooms(receiverId).subscribe((hasChat: boolean) => {
  //         if (!hasChat) return;

  //         let receiver_phone = user.phone_number.toString();
  //         // receiver_phone = receiver_phone.replace(/^(\+91|91)/, '');

  //         const roomId = this.getRoomId(currentSenderId, receiverId);
  //         // console.log("fdkgdfkgdfgkdfgjfkgf",user.profile_picture_url);
  //         // Skip duplicate
  //         const existingChat = this.chatList.find(chat =>
  //           chat.receiver_Id === receiverId && !chat.group
  //         );
  //         if (existingChat) return;

  //         const chat = {
  //           ...user,
  //           name: user.name,
  //           receiver_Id: receiverId,
  //           profile_picture_url : user.profile_picture_url,
  //           receiver_phone: receiver_phone,
  //           group: false,
  //           message: '',
  //           time: '',
  //           unreadCount: 0,
  //           unread: false
  //         };

  //         this.chatList.push(chat);

  //         // 🔔 Listen to last message
  //         this.firebaseChatService.listenForMessages(roomId).subscribe(async (messages) => {
  //           if (messages.length > 0) {
  //             const lastMsg = messages[messages.length - 1];

  //             if (lastMsg.receiver_id === currentSenderId && !lastMsg.delivered) {
  //               this.firebaseChatService.markDelivered(roomId, lastMsg.key);
  //             }

  //             if (lastMsg.isDeleted) {
  //               chat.message = 'This message was deleted';
  //             } else if (lastMsg.attachment?.type && lastMsg.attachment.type !== 'text') {
  //               switch (lastMsg.attachment.type) {
  //                 case 'image': chat.message = '📷 Photo'; break;
  //                 case 'video': chat.message = '🎥 Video'; break;
  //                 case 'audio': chat.message = '🎵 Audio'; break;
  //                 case 'file': chat.message = '📎 Attachment'; break;
  //                 default: chat.message = '[Media]';
  //               }
  //             } else {
  //               try {
  //                 const decryptedText = await this.encryptionService.decrypt(lastMsg.text);
  //                 chat.message = decryptedText;
  //               } catch (e) {
  //                 chat.message = '[Encrypted]';
  //               }
  //             }

  //             if (lastMsg.timestamp) {
  //               chat.time = this.formatTimestamp(lastMsg.timestamp);
  //             }
  //           }
  //         });

  //         // 🔔 Listen to unread count
  //         const sub = this.firebaseChatService
  //           .listenToUnreadCount(roomId, currentSenderId)
  //           .subscribe((count: number) => {
  //             chat.unreadCount = count;
  //             chat.unread = count > 0;
  //           });

  //         this.unreadSubs.push(sub);
  //       });
  //     });
  //   });
  // }

  getAllUsers() {
  const currentSenderId = this.senderUserId;
  console.log("current sender id:", currentSenderId);
  if (!currentSenderId) return;

  // Build a map of phone(last10)
  // We do this once before looping users
  this.contactSyncService.getMatchedUsers().then((matched) => {
    const deviceNameMap = new Map<string, string>();
    (matched || []).forEach((m: any) => {
      const key = this.normalizePhone(m.phone_number);
      if (key && m.name) deviceNameMap.set(key, m.name);
    });

    //Fetch all backend users (as you already do)
    this.service.getAllUsers().subscribe((users: any[]) => {
      users.forEach((user) => {
        const receiverId = user.user_id?.toString();
        if (!receiverId || receiverId === currentSenderId) return;

        //normalize phone number
        const phoneKey = this.normalizePhone(user.phone_number?.toString());
        const displayName = deviceNameMap.get(phoneKey) || user.name || 'Unknown';

        // Check existing 1:1 room with this user
        this.checkUserInRooms(receiverId).subscribe((hasChat: boolean) => {
          if (!hasChat) return;

          // Avoid duplicates
          const existingChat = this.chatList.find(
            (c: any) => c.receiver_Id === receiverId && !c.group
          );
          if (existingChat) return;

          // Create chat list item (name uses device name if available)
          const chat: any = {
            ...user,
            name: displayName,
            receiver_Id: receiverId,
            profile_picture_url: user.profile_picture_url || null,
            receiver_phone: phoneKey,
            group: false,
            message: '',
            time: '',
            unreadCount: 0,
            unread: false,
          };

          this.chatList.push(chat);

          // Listen to last message
          const roomId = this.getRoomId(currentSenderId, receiverId);
          this.firebaseChatService.listenForMessages(roomId).subscribe(async (messages) => {
            if (messages.length > 0) {
              const lastMsg = messages[messages.length - 1];

              if (lastMsg.receiver_id === currentSenderId && !lastMsg.delivered) {
                this.firebaseChatService.markDelivered(roomId, lastMsg.key);
              }

              if (lastMsg.isDeleted) {
                chat.message = 'This message was deleted';
              } else if (lastMsg.attachment?.type && lastMsg.attachment.type !== 'text') {
                switch (lastMsg.attachment.type) {
                  case 'image': chat.message = '📷 Photo'; break;
                  case 'video': chat.message = '🎥 Video'; break;
                  case 'audio': chat.message = '🎵 Audio'; break;
                  case 'file': chat.message = '📎 Attachment'; break;
                  default: chat.message = '[Media]';
                }
              } else {
                try {
                  const decryptedText = await this.encryptionService.decrypt(lastMsg.text);
                  chat.message = decryptedText;
                } catch {
                  chat.message = '[Encrypted]';
                }
              }

              if (lastMsg.timestamp) {
                chat.time = this.formatTimestamp(lastMsg.timestamp);
              }

              this.chatList.sort((a: any, b: any) => {
                const ta = a.time ? new Date(a.time).getTime() : 0;
                const tb = b.time ? new Date(b.time).getTime() : 0;
                return tb - ta;
              });
            }
          });

          // Listen to unread count
          const sub = this.firebaseChatService
            .listenToUnreadCount(roomId, currentSenderId)
            .subscribe((count: number) => {
              chat.unreadCount = count;
              chat.unread = count > 0;
            });
          this.unreadSubs.push(sub);
        });
      });
    });
  });
}

getChatAvatarUrl(chat: any): string | null {
  const id = chat.group ? chat.receiver_Id : chat.receiver_Id;
  if (id && this.avatarErrorIds.has(String(id))) return null;

  const url = chat.group
    ? (chat.dp || null)
    : (chat.profile_picture_url || null);

  return url && String(url).trim() ? url : null;
}

getChatAlt(chat: any): string {
  const name = chat.group ? (chat.group_name || chat.name) : chat.name;
  return name || 'Profile';
}

getChatInitial(chat: any): string {
  const name = (chat.group ? (chat.group_name || chat.name) : chat.name) || '';
  const letter = name.trim().charAt(0);
  return letter ? letter.toUpperCase() : '?';
}

onAvatarError(chat: any): void {
  const id = chat.group ? chat.receiver_Id : chat.receiver_Id;
  if (id) this.avatarErrorIds.add(String(id));
}

  checkUserInRooms(userId: string): Observable<boolean> {
    return new Observable(observer => {
      const chatsRef = ref(this.db, 'chats');

      // Firebase listener
      onValue(chatsRef, (snapshot: any) => {
        const data = snapshot.val();
        let userFound = false;

        if (data) {
          // Sirf roomId me current logged in user + given user ki presence check karo
          Object.keys(data).some((roomId: string) => {
            const userIds = roomId.split('_');
            if (userIds.includes(this.senderUserId as string) && userIds.includes(userId)) {
              userFound = true;
              return true;
            }
            return false;
          });
        }

        observer.next(userFound);
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

    // ✅ Default DP
    let groupDp = 'assets/images/user.jfif';


          this.service.getGroupDp(groupId).subscribe({
        next: (res: any) => {
          if (res?.group_dp_url) {
            const targetGroup = this.chatList.find(chat => chat.receiver_Id === groupId);
            if (targetGroup) {
              targetGroup.dp = res.group_dp_url;
            }
          }
        },
        error: (err: any) => {
          console.error('❌ Failed to fetch group DP:', err);
        }
      });

    const groupChat: any = {
      name: groupName,
      receiver_Id: groupId,
      group: true,
      message: '',
      time: '',
      unread: false,
      unreadCount: 0,
      dp: groupDp
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
      const cleanPhone = receiverId;
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