// import {
//   Component,
//   OnInit,
//   OnDestroy,
//   inject,
//   ViewChild,
//   ElementRef,
//   AfterViewInit
// } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { IonContent, IonicModule, Platform } from '@ionic/angular';
// import { Subscription } from 'rxjs';
// import { Keyboard } from '@capacitor/keyboard';
// import { FirebaseChatService } from 'src/app/services/firebase-chat.service';
// import { EncryptionService } from 'src/app/services/encryption.service';
// import { getDatabase, ref, get } from 'firebase/database';

// @Component({
//   selector: 'app-chatting-screen',
//   standalone: true,
//   imports: [CommonModule, FormsModule, IonicModule],
//   templateUrl: './chatting-screen.page.html',
//   styleUrls: ['./chatting-screen.page.scss']
// })
// export class ChattingScreenPage implements OnInit, AfterViewInit, OnDestroy {
//   @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;
//   @ViewChild(IonContent, { static: false }) ionContent!: IonContent;

//   messages: any[] = [];
//   groupedMessages: { date: string; messages: any[] }[] = [];

//   messageText = '';
//   receiverId = '';
//   senderId = '';
//   private messageSub?: Subscription;
//   showSendButton = false;
//   private keyboardListeners: any[] = [];

//   private chatService = inject(FirebaseChatService);
//   private route = inject(ActivatedRoute);
//   private platform = inject(Platform);
//   private encryptionService = inject(EncryptionService);

//   roomId = '';
//   limit = 10;
//   page = 0;
//   isLoadingMore = false;
//   hasMoreMessages = true;
//   router: any;
//   chatType: 'private' | 'group' = 'private';
//   groupName = '';

//   async ngOnInit() {
//     Keyboard.setScroll({ isDisabled: false });
//     await this.initKeyboardListeners();

//     this.senderId = localStorage.getItem('userId') || '';
//     const rawId = this.route.snapshot.queryParamMap.get('receiverId') || '';
//     const chatTypeParam = this.route.snapshot.queryParamMap.get('isGroup');
//     this.chatType = chatTypeParam === 'true' ? 'group' : 'private';

//     if (this.chatType === 'group') {
//       this.roomId = decodeURIComponent(rawId);
//       await this.fetchGroupName(this.roomId);
//     } else {
//       this.receiverId = decodeURIComponent(rawId);
//       this.roomId = this.getRoomId(this.senderId, this.receiverId);
//     }

//     // ✅ Reset unread count
//     await this.chatService.resetUnreadCount(this.roomId, this.senderId);
//     await this.chatService.markAsRead(this.roomId, this.senderId);

//     this.loadFromLocalStorage();
//     this.listenForMessages();
//     setTimeout(() => this.scrollToBottom(), 100);
//   }

//   async fetchGroupName(groupId: string) {
//     try {
//       const db = getDatabase();
//       const groupRef = ref(db, `groups/${groupId}`);
//       const snapshot = await get(groupRef);

//       this.groupName = snapshot.exists() ? snapshot.val().name || 'Group' : 'Group';
//     } catch (error) {
//       console.error('Error fetching group name:', error);
//       this.groupName = 'Group';
//     }
//   }

//   ngAfterViewInit() {
//     if (this.ionContent) {
//       this.ionContent.ionScroll.subscribe(async (event: any) => {
//         if (event.detail.scrollTop < 50 && this.hasMoreMessages && !this.isLoadingMore) {
//           this.page += 1;
//           this.loadMessagesFromFirebase(true);
//         }
//       });
//     }
//   }

//   getRoomId(userA: string, userB: string): string {
//     return userA < userB ? `${userA}_${userB}` : `${userB}_${userA}`;
//   }

//   async listenForMessages() {
//     this.messageSub = this.chatService.listenForMessages(this.roomId).subscribe(async (data) => {
//       const decryptedMessages = [];
//       for (const msg of data) {
//         const decryptedText = await this.encryptionService.decrypt(msg.text);
//         decryptedMessages.push({ ...msg, text: decryptedText });
//       }
//       this.messages = decryptedMessages;
//       this.groupedMessages = this.groupMessagesByDate(decryptedMessages);
//       this.saveToLocalStorage();
//       setTimeout(() => this.scrollToBottom(), 100);
//     });
//   }

//   groupMessagesByDate(messages: any[]) {
//     const grouped: { [date: string]: any[] } = {};
//     const today = new Date();
//     const yesterday = new Date(today);
//     yesterday.setDate(today.getDate() - 1);

//     messages.forEach(msg => {
//       const datePart = msg.timestamp?.split(', ')[0];
//       const [dd, mm, yyyy] = datePart.split('/').map(Number);
//       const msgDate = new Date(yyyy, mm - 1, dd);

//       let label = datePart;
//       if (msgDate.toDateString() === today.toDateString()) {
//         label = 'Today';
//       } else if (msgDate.toDateString() === yesterday.toDateString()) {
//         label = 'Yesterday';
//       }

//       if (!grouped[label]) grouped[label] = [];
//       grouped[label].push(msg);
//     });

//     return Object.keys(grouped).map(date => ({
//       date,
//       messages: grouped[date]
//     }));
//   }

//   async loadFromLocalStorage() {
//     const cached = localStorage.getItem(this.roomId);
//     const rawMessages = cached ? JSON.parse(cached) : [];
//     const decryptedMessages = [];

//     for (const msg of rawMessages) {
//       const decryptedText = await this.encryptionService.decrypt(msg.text);
//       decryptedMessages.push({ ...msg, text: decryptedText });
//     }

//     this.messages = decryptedMessages;
//     this.groupedMessages = this.groupMessagesByDate(decryptedMessages);
//   }

//   async sendMessage() {
//     if (!this.messageText.trim()) return;

//     const date = new Date();
//     const plainText = this.messageText.trim();
//     const encryptedText = await this.encryptionService.encrypt(plainText);

//     const message: any = {
//       sender_id: this.senderId,
//       text: encryptedText,
//       timestamp: `${date.toLocaleDateString('en-IN')}, ${date.toLocaleTimeString([], {
//         hour: '2-digit',
//         minute: '2-digit',
//         hour12: true
//       })}`
//     };

//     if (this.chatType === 'private') {
//       message.receiver_id = this.receiverId;
//     }

//     await this.chatService.sendMessage(this.roomId, message);

//     // ✅ Increment unread count for receiver(s)
//     if (this.chatType === 'private') {
//       await this.chatService.incrementUnreadCount(this.roomId, this.receiverId);
//     } else {
//       const groupInfo = await this.chatService.getGroupInfo(this.roomId);
//       for (const userId of Object.keys(groupInfo.members)) {
//         if (userId !== this.senderId) {
//           await this.chatService.incrementUnreadCount(this.roomId, userId);
//         }
//       }
//     }

//     this.messageText = '';
//     this.showSendButton = false;
//     this.scrollToBottom();
//   }

//   loadMessagesFromFirebase(isPagination = false) {}

//   saveToLocalStorage() {
//     localStorage.setItem(this.roomId, JSON.stringify(this.messages));
//   }

//   scrollToBottom() {
//     if (this.ionContent) {
//       setTimeout(() => {
//         this.ionContent.scrollToBottom(300);
//       }, 100);
//     }
//   }

//   onInputChange() {
//     this.showSendButton = this.messageText?.trim().length > 0;
//   }

//   onInputFocus() {
//     setTimeout(() => {
//       this.adjustFooterPosition();
//       this.scrollToBottom();
//     }, 300);
//   }

//   onInputBlur() {
//     setTimeout(() => {
//       this.resetFooterPosition();
//     }, 300);
//   }

//   goToCallingScreen() {
//     this.router.navigate(['/calling-screen']);
//   }

//   async initKeyboardListeners() {
//     if (this.platform.is('capacitor')) {
//       try {
//         const showListener = await Keyboard.addListener('keyboardWillShow', (info) => {
//           this.handleKeyboardShow(info.keyboardHeight);
//         });

//         const hideListener = await Keyboard.addListener('keyboardWillHide', () => {
//           this.handleKeyboardHide();
//         });

//         this.keyboardListeners.push(showListener, hideListener);
//       } catch (error) {
//         this.setupFallbackKeyboardDetection();
//       }
//     } else {
//       this.setupFallbackKeyboardDetection();
//     }
//   }

//   ngOnDestroy() {
//     this.keyboardListeners.forEach(listener => listener?.remove());
//     this.messageSub?.unsubscribe();
//   }

//   private handleKeyboardShow(keyboardHeight: number) {
//     const footer = document.querySelector('.footer-fixed') as HTMLElement;
//     const chatMessages = document.querySelector('.chat-messages') as HTMLElement;
//     const ionContent = document.querySelector('ion-content') as HTMLElement;

//     if (footer) footer.style.bottom = `${keyboardHeight}px`;
//     if (chatMessages) chatMessages.style.paddingBottom = `${keyboardHeight + 80}px`;
//     if (ionContent) ionContent.style.paddingBottom = `${keyboardHeight}px`;

//     setTimeout(() => this.scrollToBottom(), 350);
//   }

//   private handleKeyboardHide() {
//     const footer = document.querySelector('.footer-fixed') as HTMLElement;
//     const chatMessages = document.querySelector('.chat-messages') as HTMLElement;
//     const ionContent = document.querySelector('ion-content') as HTMLElement;

//     if (footer) footer.style.bottom = '0px';
//     if (chatMessages) chatMessages.style.paddingBottom = '80px';
//     if (ionContent) ionContent.style.paddingBottom = '0px';
//   }

//   private setupFallbackKeyboardDetection() {
//     const initialViewportHeight = window.visualViewport?.height || window.innerHeight;
//     const initialChatPadding = 80;

//     const handleViewportChange = () => {
//       const currentHeight = window.visualViewport?.height || window.innerHeight;
//       const heightDifference = initialViewportHeight - currentHeight;

//       const footer = document.querySelector('.footer-fixed') as HTMLElement;
//       const chatMessages = document.querySelector('.chat-messages') as HTMLElement;
//       const ionContent = document.querySelector('ion-content') as HTMLElement;

//       if (heightDifference > 150) {
//         if (footer) footer.style.bottom = `${heightDifference}px`;
//         if (chatMessages) chatMessages.style.paddingBottom = `${heightDifference + initialChatPadding}px`;
//         if (ionContent) ionContent.style.paddingBottom = `${heightDifference}px`;
//         setTimeout(() => this.scrollToBottom(), 350);
//       } else {
//         if (footer) footer.style.bottom = '0px';
//         if (chatMessages) chatMessages.style.paddingBottom = `${initialChatPadding}px`;
//         if (ionContent) ionContent.style.paddingBottom = '0px';
//       }
//     };

//     if (window.visualViewport) {
//       window.visualViewport.addEventListener('resize', handleViewportChange);
//     } else {
//       window.addEventListener('resize', handleViewportChange);
//     }
//   }

//   private adjustFooterPosition() {
//     const footer = document.querySelector('.footer-fixed') as HTMLElement;
//     const chatMessages = document.querySelector('.chat-messages') as HTMLElement;
//     if (footer) footer.classList.add('keyboard-active');
//     if (chatMessages) chatMessages.classList.add('keyboard-active');
//   }

//   private resetFooterPosition() {
//     const footer = document.querySelector('.footer-fixed') as HTMLElement;
//     const chatMessages = document.querySelector('.chat-messages') as HTMLElement;
//     if (footer) footer.classList.remove('keyboard-active');
//     if (chatMessages) chatMessages.classList.remove('keyboard-active');
//   }
// }





import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ViewChild,
  ElementRef,
  AfterViewInit,
  QueryList
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonicModule, ModalController, Platform, PopoverController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Keyboard } from '@capacitor/keyboard';
import { FirebaseChatService } from 'src/app/services/firebase-chat.service';
import { EncryptionService } from 'src/app/services/encryption.service';
import { getDatabase, ref, get, update, set, remove } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';
import { SecureStorageService } from '../../services/secure-storage/secure-storage.service';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FileUploadService } from '../../services/file-upload/file-upload.service';
import { ChatOptionsPopoverComponent } from 'src/app/components/chat-options-popover/chat-options-popover.component';
import { IonDatetime } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { NavController } from '@ionic/angular';
import { FilePicker, PickedFile } from '@capawesome/capacitor-file-picker';
import { FileSystemService } from 'src/app/services/file-system.service';
import imageCompression from 'browser-image-compression';
import { AttachmentPreviewModalComponent } from '../../components/attachment-preview-modal/attachment-preview-modal.component';
import { MessageMorePopoverComponent } from '../../components/message-more-popover/message-more-popover.component';
// import { Clipboard } from '@angular/cdk/clipboard';
import { Clipboard } from '@capacitor/clipboard';


// import { ToastController } from '@ionic/angular';


// interface Message{
//   attachment?: { type: ''; filePath: ''; };
//   key?: any;
//   message_id : string;
//   sender_id : string;
//   sender_phone : string;
//   sender_name : string;
//   receiver_id? : string;
//   receiver_phone? : string;
//   type? : "text" | "audio" | "video" | "image";
//   text? : string;
//   url? : string;
//   delivered : boolean;
//   read : boolean;
//   timestamp : string;
//   time? : string;
// }

interface Message {
  sender_id: string;
  key?: any;
  text: string | null;
  timestamp: string;
  sender_phone: string;
  sender_name: string;
  receiver_id: string;
  receiver_phone: string;
  delivered: boolean;
  read: boolean;
  isDeleted?: boolean;
  message_id: string;
  time?: string;
  type?: string;
  attachment?: {
    type: 'image' | 'video' | 'audio' | 'file';
    fileName?: string;           // Optional, used for downloads
    mimeType?: string;           // Helps identify the type
    base64Data: string;          // Full data URI, e.g., data:image/png;base64,...Fpickattc
    filePath?: string;           // Optional original file path or local cache
    caption?: string;            // Optional caption text for images/videos
  };

  replyToMessageId?: string;
  reactions?: {
    [userId: string]: string; 
  }

}


@Component({
  selector: 'app-chatting-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './chatting-screen.page.html',
  styleUrls: ['./chatting-screen.page.scss']
})
export class ChattingScreenPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;
  @ViewChild(IonContent, { static: false }) ionContent!: IonContent;
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('datePicker', { static: false }) datePicker!: IonDatetime;
  @ViewChild('longPressEl') messageElements!: QueryList<ElementRef>;

  messages: Message[] = [];

  groupedMessages: { date: string; messages: Message[] }[] = [];

  messageText = '';
  receiverId = '';
  senderId = '';
  sender_phone = '';
  receiver_phone = '';
  private messageSub?: Subscription;
  showSendButton = false;
  private keyboardListeners: any[] = [];
  searchActive = false;
  searchQuery = '';
  searchMatches: HTMLElement[] = [];
  currentMatchIndex = 0;
  showSearchBar = false;
  searchTerm = '';
  searchText = '';
  matchedMessages: HTMLElement[] = [];
  currentSearchIndex = -1;
  isDateModalOpen = false;
  selectedDate: string = '';
  isDatePickerOpen = false;
  showDateModal = false;
  selectedMessages: any[] = [];
  imageToSend: any;
  alertController: any;

  constructor(
    private chatService: FirebaseChatService,
    private route: ActivatedRoute,
    private platform: Platform,
    private encryptionService: EncryptionService,
    private router: Router,
    private secureStorage: SecureStorageService,
    private fileUploadService: FileUploadService,
    private popoverCtrl: PopoverController,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private FileService: FileSystemService,
    private modalCtrl: ModalController,
    private popoverController: PopoverController,
    private clipboard: Clipboard
  ) {}

  roomId = '';
  limit = 10;
  page = 0;
  isLoadingMore = false;
  hasMoreMessages = true;
  chatType: 'private' | 'group' = 'private';
  groupName = '';
  isGroup: any;
  receiver_name = '';
  sender_name = '';
  groupMembers: {
    user_id: string;
    name: string;
    phone: string;
    avatar?: string;
    role?: string;
    phone_number?: string;
  }[] = [];
  attachments: any[] = [];
  // attachmentPath: string | null = null;
  selectedAttachment: any = null;
  showPreviewModal: boolean = false;
  attachmentPath: string = '';
    // selectedMessages: any[] = [];
    lastPressedMessage: any = null;
  longPressTimeout: any;

  async ngOnInit() {
    // Enable proper keyboard scrolling
    Keyboard.setScroll({ isDisabled: false });
    await this.initKeyboardListeners();

    // Load sender (current user) details
    this.senderId = (await this.secureStorage.getItem('userId')) || '';
    this.sender_phone = (await this.secureStorage.getItem('phone_number')) || '';
    this.sender_name = (await this.secureStorage.getItem('name')) || '';
    // this.receiver_name = await this.secureStorage.getItem('receiver_name') || '';
    const nameFromQuery = this.route.snapshot.queryParamMap.get('receiver_name');
    this.receiver_name = nameFromQuery || await this.secureStorage.getItem('receiver_name') || '';

    // Get query parameters
    const rawId = this.route.snapshot.queryParamMap.get('receiverId') || '';
    const chatTypeParam = this.route.snapshot.queryParamMap.get('isGroup');
    const phoneFromQuery = this.route.snapshot.queryParamMap.get('receiver_phone');

    // Determine chat type
    this.chatType = chatTypeParam === 'true' ? 'group' : 'private';

    if (this.chatType === 'group') {
      // Group chat
      this.roomId = decodeURIComponent(rawId);
      await this.fetchGroupName(this.roomId);
    } else {
      // Individual chat
      this.receiverId = decodeURIComponent(rawId);
      this.roomId = this.getRoomId(this.senderId, this.receiverId);
      console.log("sadjklghdjagdfg", this.roomId)

      // Use receiver_phone from query or fallback to localStorage
      this.receiver_phone = phoneFromQuery || localStorage.getItem('receiver_phone') || '';
      // Store for reuse when navigating to profile
      localStorage.setItem('receiver_phone', this.receiver_phone);
    }

    // Reset unread count and mark messages as read
    await this.chatService.resetUnreadCount(this.roomId, this.senderId);
    await this.markMessagesAsRead();

    // Load and render messages
    this.loadFromLocalStorage();
    this.listenForMessages();

    // Scroll to bottom after short delay
    setTimeout(() => this.scrollToBottom(), 100);
  }

  // async ionViewWillEnter(){
  //   // Enable proper keyboard scrolling
  //   Keyboard.setScroll({ isDisabled: false });
  //   await this.initKeyboardListeners();

  //   // Load sender (current user) details
  //   this.senderId = (await this.secureStorage.getItem('userId')) || '';
  //   this.sender_phone = (await this.secureStorage.getItem('phone_number')) || '';
  //   this.sender_name = (await this.secureStorage.getItem('name')) || '';
  //   // this.receiver_name = await this.secureStorage.getItem('receiver_name') || '';
  //   const nameFromQuery = this.route.snapshot.queryParamMap.get('receiver_name');
  // this.receiver_name = nameFromQuery || await this.secureStorage.getItem('receiver_name') || '';

  //   // Get query parameters
  //   const rawId = this.route.snapshot.queryParamMap.get('receiverId') || '';
  //   const chatTypeParam = this.route.snapshot.queryParamMap.get('isGroup');
  //   const phoneFromQuery = this.route.snapshot.queryParamMap.get('receiver_phone');

  //   // Determine chat type
  //   this.chatType = chatTypeParam === 'true' ? 'group' : 'private';

  //   if (this.chatType === 'group') {
  //     // Group chat
  //     this.roomId = decodeURIComponent(rawId);
  //     await this.fetchGroupName(this.roomId);
  //   } else {
  //     // Individual chat
  //     this.receiverId = decodeURIComponent(rawId);
  //     this.roomId = this.getRoomId(this.senderId, this.receiverId);

  //     // Use receiver_phone from query or fallback to localStorage
  //     this.receiver_phone = phoneFromQuery || localStorage.getItem('receiver_phone') || '';
  //     // Store for reuse when navigating to profile
  //     localStorage.setItem('receiver_phone', this.receiver_phone);
  //   }

  //   // Reset unread count and mark messages as read
  //   await this.chatService.resetUnreadCount(this.roomId, this.senderId);
  //   await this.markMessagesAsRead();

  //   // Load and render messages
  //   this.loadFromLocalStorage();
  //   this.listenForMessages();

  //   // Scroll to bottom after short delay
  //   setTimeout(() => this.scrollToBottom(), 100);
  // }

  async ionViewWillEnter() {
    // Enable proper keyboard scrolling
    Keyboard.setScroll({ isDisabled: false });
    await this.initKeyboardListeners();

    // Load sender (current user) details
    this.senderId = (await this.secureStorage.getItem('userId')) || '';
    this.sender_phone = (await this.secureStorage.getItem('phone_number')) || '';
    this.sender_name = (await this.secureStorage.getItem('name')) || '';

    const nameFromQuery = this.route.snapshot.queryParamMap.get('receiver_name');
    this.receiver_name = nameFromQuery || await this.secureStorage.getItem('receiver_name') || '';

    // Get query parameters
    const rawId = this.route.snapshot.queryParamMap.get('receiverId') || '';
    const chatTypeParam = this.route.snapshot.queryParamMap.get('isGroup');
    const phoneFromQuery = this.route.snapshot.queryParamMap.get('receiver_phone');

    // Determine chat type
    this.chatType = chatTypeParam === 'true' ? 'group' : 'private';

    if (this.chatType === 'group') {
      this.roomId = decodeURIComponent(rawId);
      await this.fetchGroupName(this.roomId);
    } else {
      this.receiverId = decodeURIComponent(rawId);
      this.roomId = this.getRoomId(this.senderId, this.receiverId);
      // console.log("view after inint", this.roomId)
      this.receiver_phone = phoneFromQuery || localStorage.getItem('receiver_phone') || '';
      localStorage.setItem('receiver_phone', this.receiver_phone);
    }

    // Reset unread count and mark messages as read
    await this.chatService.resetUnreadCount(this.roomId, this.senderId);
    await this.markMessagesAsRead();

    // Load and render messages
    this.loadFromLocalStorage();
    this.listenForMessages();

    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state;

    if (state && state['imageToSend']) {
      this.attachmentPath = state['imageToSend'];  // 👈 set the attachmentPath
    }

    console.log("this.attachmentPath", this.attachmentPath);
  }

  //this is menu option in header of right side
  async openOptions(ev: any) {
    const popover = await this.popoverCtrl.create({
      component: ChatOptionsPopoverComponent,
      event: ev,
      translucent: true,
      componentProps: {
        chatType: this.chatType,
      },
    });

    await popover.present();

    const { data } = await popover.onDidDismiss();
    if (data?.selected) {
      this.handleOption(data.selected);
    }
  }

  async handleOption(option: string) {
    console.log('Selected option:', option);

    if (option === 'Search') {
      this.showSearchBar = true;
      setTimeout(() => {
        const input = document.querySelector('ion-input');
        (input as HTMLIonInputElement)?.setFocus();
      }, 100);
    }

    if (option === 'View Contact') {
      const queryParams: any = {
        receiverId: this.receiverId,
        receiver_phone: this.receiver_phone,
        receiver_name: this.receiver_name,
        isGroup: false
      };
      this.router.navigate(['/profile-screen'], { queryParams });
    }

    this.route.queryParams.subscribe(params => {
      this.receiverId = params['receiverId'] || '';
    });

    const groupId = this.receiverId;
    const userId = await this.secureStorage.getItem('userId');

    if (option === 'Group Info') {
      const queryParams: any = {
        receiverId: this.chatType === 'group' ? this.roomId : this.receiverId,
        receiver_phone: this.receiver_phone,
        receiver_name: this.receiver_name,
        isGroup: this.chatType === 'group'
      };
      this.router.navigate(['/profile-screen'], { queryParams });

    } else if (option === 'Add Members') {
      const memberPhones = this.groupMembers.map(member => member.phone);
      this.router.navigate(['/add-members'], {
        queryParams: {
          groupId: groupId,
          members: JSON.stringify(memberPhones)
        }
      });

    } else if (option === 'Exit Group') {
      if (!groupId || !userId) {
        console.error('Missing groupId or userId');
        return;
      }

      const db = getDatabase();
      const memberPath = `groups/${groupId}/members/${userId}`;
      const pastMemberPath = `groups/${groupId}/pastmembers/${userId}`;

      try {
        const memberSnap = await get(ref(db, memberPath));

        if (!memberSnap.exists()) {
          console.error('Member data not found in Firebase');
          return;
        }

        const memberData = memberSnap.val();
        const updatedMemberData = {
          ...memberData,
          status: 'inactive',
          removedAt: new Date().toLocaleString()

        };

        // First update the member's status in members path
        await update(ref(db, memberPath), { status: 'inactive' });

        // Then store full info in pastmembers
        await set(ref(db, pastMemberPath), updatedMemberData);

        // Finally remove from current members
        await remove(ref(db, memberPath));

        const toast = await this.toastCtrl.create({
          message: `You exited the group`,
          duration: 2000,
          color: 'medium'
        });
        toast.present();

        this.router.navigate(['/home-screen']);
      } catch (error) {
        console.error('Error exiting group:', error);
        const toast = await this.toastCtrl.create({
          message: `You exited the group`,
          duration: 2000,
          color: 'medium'
        });
        await toast.present();
      }
    }

  }

  onSearchInput() {
    const elements = Array.from(document.querySelectorAll('.message-text')) as HTMLElement[];

    // Clear previous highlights
    elements.forEach(el => {
      el.innerHTML = el.textContent || '';
      el.style.backgroundColor = 'transparent';
    });

    if (!this.searchText.trim()) {
      this.matchedMessages = [];
      this.currentSearchIndex = -1;
      return;
    }

    const regex = new RegExp(`(${this.searchText})`, 'gi');

    this.matchedMessages = [];

    elements.forEach(el => {
      const originalText = el.textContent || '';
      if (regex.test(originalText)) {
        const highlightedText = originalText.replace(regex, `<mark style="background: yellow;">$1</mark>`);
        el.innerHTML = highlightedText;
        this.matchedMessages.push(el);
      }
    });

    // Reset index
    this.currentSearchIndex = this.matchedMessages.length ? 0 : -1;

    // Scroll to first match (optional)
    if (this.currentSearchIndex >= 0) {
      this.matchedMessages[this.currentSearchIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  navigateSearch(direction: 'up' | 'down') {
    if (!this.matchedMessages.length) return;
    if (direction === 'up') {
      this.currentSearchIndex = (this.currentSearchIndex - 1 + this.matchedMessages.length) % this.matchedMessages.length;
    } else {
      this.currentSearchIndex = (this.currentSearchIndex + 1) % this.matchedMessages.length;
    }
    this.highlightMessage(this.currentSearchIndex);
  }

  highlightMessage(index: number) {
    // Remove existing highlights from all matched messages
    this.matchedMessages.forEach(el => {
      const originalText = el.textContent || '';
      el.innerHTML = originalText; // reset to plain text
      el.style.backgroundColor = 'transparent';
    });

    if (!this.searchText.trim()) return;

    const regex = new RegExp(`(${this.searchText})`, 'gi');

    this.matchedMessages.forEach((el, i) => {
      const originalText = el.textContent || '';
      // Wrap matched text in <mark>
      const highlightedText = originalText.replace(regex, `<mark style="background: yellow;">$1</mark>`);
      el.innerHTML = highlightedText;
    });

    // Scroll to current match
    const target = this.matchedMessages[index];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }


  cancelSearch() {
    this.searchText = '';
    this.showSearchBar = false;
    this.matchedMessages.forEach(el => {
      el.innerHTML = el.textContent || ''; // remove <mark>
      el.style.backgroundColor = 'transparent';
    });
    this.matchedMessages = [];
  }

  openDatePicker() {
    this.showDateModal = true;
    console.log('Opening calendar modal...');
  }

  onDateSelected(event: any) {
    const selectedDate = new Date(event.detail.value);

    const day = String(selectedDate.getDate()).padStart(2, '0');
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const year = selectedDate.getFullYear();

    const formattedDate = `${day}/${month}/${year}`; // example: 11/07/2025

    this.showDateModal = false;

    setTimeout(() => {
      const el = document.getElementById('date-group-' + formattedDate);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        console.warn('No messages found for selected date:', formattedDate);
      }
    }, 300);
  }

  onMessagePress(message: any) {
    const index = this.selectedMessages.findIndex(m => m.key === message.key);
    if (index > -1) {
      this.selectedMessages.splice(index, 1); // Unselect if already selected
    } else {
      this.selectedMessages.push(message); // Select
    }
  }

  // isSelected(message: any): boolean {
  //   return this.selectedMessages.some(m => m.key === message.key);
  // }

  // onMessageClick(message: any) {
  //   if (this.selectedMessages.length > 0) {
  //     this.onMessagePress(message); // toggle if already in selection mode
  //   } else {
  //     // Normal tap action here if needed
  //   }
  // }

  clearSelection() {
    this.selectedMessages = [];
  }

  private async markMessagesAsRead() {
    const lastMessage = this.messages[this.messages.length - 1];
    if (lastMessage && lastMessage.sender_id !== this.senderId) {
      await this.chatService.resetUnreadCount(this.roomId, this.senderId);
    }
  }

  //selection mode
   startLongPress(msg: any) {
    this.longPressTimeout = setTimeout(() => {
      this.onLongPress(msg);
    }, 1000); // 500ms for long press
  }

  cancelLongPress() {
    clearTimeout(this.longPressTimeout);
  }

  onLongPress(msg: any) {
  this.selectedMessages = [msg]; // Only select the long-pressed one
  this.lastPressedMessage = msg;
}

onMessageClick(msg: any) {
  if (this.selectedMessages.length > 0) {
    this.toggleSelection(msg);
    this.lastPressedMessage = msg;
  }
}

toggleSelection(msg: any) {
  const index = this.selectedMessages.findIndex((m) => m.message_id === msg.message_id);
  if (index > -1) {
    this.selectedMessages.splice(index, 1);
  } else {
    this.selectedMessages.push(msg);
  }

  // Update lastPressedMessage to last toggled one (optional)
  this.lastPressedMessage = msg;
}

isSelected(msg: any) {
  return this.selectedMessages.some((m) => m.message_id === msg.message_id);
}

  // onDelete() {
  //   this.messages = this.messages.filter(
  //     (msg) => !this.selectedMessages.includes(msg)
  //   );
  //   this.selectedMessages = [];
  // }

  deleteSelectedMessages() {
    console.log("selectedMessages",this.selectedMessages);
  this.selectedMessages.forEach(msg => {
    this.chatService.deleteMessage(this.roomId, msg.key);
  });
  this.selectedMessages = [];
}

  onForward() {
    console.log('Forwarding:', this.selectedMessages);
  }

  async onMore(ev?: Event) {
    const popover = await this.popoverController.create({
      component: MessageMorePopoverComponent,
      event: ev,
      translucent: true,
      showBackdrop: true,
    });

    await popover.present();

    const { data } = await popover.onDidDismiss();
    if (data) {
      this.handlePopoverAction(data);
    }
  }


async handlePopoverAction(action: string) {
  switch (action) {
    case 'info':
      console.log('Info clicked');
      break;
    case 'copy':
      if (this.lastPressedMessage?.text) {
        await Clipboard.write({ string: this.lastPressedMessage.text });
        console.log('Text copied to clipboard:', this.lastPressedMessage.text);
      }
      break;
    case 'pin':
      console.log('Pin clicked');
      break;
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
      } else {
        this.groupName = 'Group';
      }
    } catch (error) {
      console.error('Error fetching group name:', error);
      this.groupName = 'Group';
    }
  }

  async ngAfterViewInit() {
    if (this.ionContent) {
      this.ionContent.ionScroll.subscribe(async (event: any) => {
        if (event.detail.scrollTop < 50 && this.hasMoreMessages && !this.isLoadingMore) {
          this.page += 1;
          this.loadMessagesFromFirebase(true);
        }
      });
    }
    // this.receiver_name = await this.secureStorage.getItem('receiver_name') || '';
  }

  getRoomId(userA: string, userB: string): string {
    return userA < userB ? `${userA}_${userB}` : `${userB}_${userA}`;
  }


  // async listenForMessages() {
  //   this.messageSub = this.chatService.listenForMessages(this.roomId).subscribe(async (data) => {
  //     const decryptedMessages: Message[] = [];

  //     for (const msg of data) {
  //       // console.log("meaasGESA", msg)
  //       const decryptedText = await this.encryptionService.decrypt(msg.text);
  //       decryptedMessages.push({ ...msg, text: decryptedText });

  //       // ✅ Mark as delivered if current user is the receiver and not already delivered
  //       // console.log(msg);
  //       if (
  //         msg.receiver_id === this.senderId && !msg.delivered
  //       ) {
  //         this.chatService.markDelivered(this.roomId, msg.key);
  //       }
  //     }

  //     this.messages = decryptedMessages;
  //     this.groupedMessages = this.groupMessagesByDate(decryptedMessages);
  //     this.saveToLocalStorage();

  //     const last = decryptedMessages[decryptedMessages.length - 1];
  //     if (last) {
  //       localStorage.setItem(`lastMsg_${this.roomId}`, JSON.stringify({
  //         text: last.text,
  //         timestamp: last.timestamp
  //       }));
  //     }

  //     setTimeout(() => {
  //       this.scrollToBottom();
  //       this.observeVisibleMessages();
  //     }, 100);
  //   });
  // }


  // observeVisibleMessages() {
  //   const allMessageElements = document.querySelectorAll('[data-msg-key]');

  //   allMessageElements.forEach((el: any) => {
  //     const msgKey = el.getAttribute('data-msg-key');
  //     const msgIndex = this.messages.findIndex(m => m.key === msgKey);
  //     if (msgIndex === -1) return;

  //     const msg = this.messages[msgIndex];
  //     console.log(msg);

  //     if (!msg.read && msg.receiver_id === this.senderId) {
  //       const observer = new IntersectionObserver(entries => {
  //         entries.forEach(entry => {
  //           if (entry.isIntersecting) {
  //             // ✅ Mark as read when visible
  //             this.chatService.markRead(this.roomId, msgKey);
  //             observer.unobserve(entry.target);
  //           }
  //         });
  //       }, {
  //         threshold: 1.0
  //       });

  //       observer.observe(el);
  //     }
  //   });
  // }


  async listenForMessages() {
  this.messageSub = this.chatService.listenForMessages(this.roomId).subscribe(async (data) => {
    const decryptedMessages: Message[] = [];

    for (const msg of data) {
      const decryptedText = await this.encryptionService.decrypt(msg.text);
      decryptedMessages.push({ ...msg, text: decryptedText });

      // ✅ Mark as delivered if current user is the receiver and not already delivered
      // console.log(msg);
      if (
        msg.receiver_id === this.senderId && !msg.delivered
      ) {
        this.chatService.markDelivered(this.roomId, msg.key);
      }
    }

    this.messages = decryptedMessages;
    this.groupedMessages = this.groupMessagesByDate(decryptedMessages);
    this.saveToLocalStorage();

    const last = decryptedMessages[decryptedMessages.length - 1];
    if (last) {
      localStorage.setItem(`lastMsg_${this.roomId}`, JSON.stringify({
        text: last.text,
        timestamp: last.timestamp
      }));
    }

    setTimeout(() => {
      this.scrollToBottom();
      this.observeVisibleMessages();
    }, 100);
  });
}


observeVisibleMessages() {
  const allMessageElements = document.querySelectorAll('[data-msg-key]');

  allMessageElements.forEach((el: any) => {
    const msgKey = el.getAttribute('data-msg-key');
    const msgIndex = this.messages.findIndex(m => m.key === msgKey);
    if (msgIndex === -1) return;

    const msg = this.messages[msgIndex];
    console.log(msg);

    if (!msg.read && msg.receiver_id === this.senderId) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // ✅ Mark as read when visible
            this.chatService.markRead(this.roomId, msgKey);
            observer.unobserve(entry.target); // stop observing
          }
        });
      }, {
        threshold: 1.0
      });

      observer.observe(el);
    }
  });
}


  groupMessagesByDate(messages: Message[]) {
    const grouped: { [date: string]: any[] } = {};

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    messages.forEach(msg => {
      const timestamp = new Date(msg.timestamp); // convert to Date object

      // Format time (e.g., "6:15 PM")
      const hours = timestamp.getHours();
      const minutes = timestamp.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
      const timeStr = `${formattedHours}:${formattedMinutes} ${ampm}`;
      msg.time = timeStr;

      // Label logic
      const isToday =
        timestamp.getDate() === today.getDate() &&
        timestamp.getMonth() === today.getMonth() &&
        timestamp.getFullYear() === today.getFullYear();

      const isYesterday =
        timestamp.getDate() === yesterday.getDate() &&
        timestamp.getMonth() === yesterday.getMonth() &&
        timestamp.getFullYear() === yesterday.getFullYear();

      let label = '';
      if (isToday) {
        label = 'Today';
      } else if (isYesterday) {
        label = 'Yesterday';
      } else {
        // Format as DD/MM/YYYY
        const dd = timestamp.getDate().toString().padStart(2, '0');
        const mm = (timestamp.getMonth() + 1).toString().padStart(2, '0');
        const yyyy = timestamp.getFullYear();
        label = `${dd}/${mm}/${yyyy}`;
      }

      if (!grouped[label]) {
        grouped[label] = [];
      }
      grouped[label].push(msg);
    });

    return Object.keys(grouped).map(date => ({
      date,
      messages: grouped[date]
    }));
  }


  async loadFromLocalStorage() {
    const cached = localStorage.getItem(this.roomId);
    const rawMessages = cached ? JSON.parse(cached) : [];
    const decryptedMessages = [];

    for (const msg of rawMessages) {
      const decryptedText = await this.encryptionService.decrypt(msg.text);
      decryptedMessages.push({ ...msg, text: decryptedText });
    }

    this.messages = decryptedMessages;
    this.groupedMessages = this.groupMessagesByDate(decryptedMessages);
  }
  

  async pickAttachment() {
    const result = await FilePicker.pickFiles({ readData: true });

    console.log('pickAttachment result =>', result);
    let blob: Blob | null = null;
    let base64: string | null = null;

    if (result?.files?.length) {
      const file = result.files[0];
      const mimeType = file.mimeType;
      const type = mimeType?.startsWith('image')
        ? 'image'
        : mimeType?.startsWith('video')
          ? 'video'
          : 'file';

      blob = file.blob as Blob

      if (file.data) {
        if (typeof file.data === 'string') {
          base64 = `data:${mimeType};base64,${file.data}`;
        }
      }

      if (!base64 && blob) {
        base64 = await this.FileService.convertToBase64(blob) as string;
      }

      if (!blob) {
        blob = await this.FileService.convertToBlob(base64 as string, file.mimeType)
      }

      this.selectedAttachment = {
        type,
        base64,
        blob,
        fileName: file.name,
        mimeType,
      };

      console.log('From pickAttachment =>', this.selectedAttachment);
      this.showPreviewModal = true;
    }
  }


  cancelAttachment() {
    this.selectedAttachment = null;
    this.showPreviewModal = false;
    this.messageText = '';
  }

  async sendMessage() {
    const plainText = this.messageText.trim();
    const encryptedText = plainText ? await this.encryptionService.encrypt(plainText) : '';

    const message: Message = {
      sender_id: this.senderId,
      text: encryptedText,
      timestamp: new Date().toISOString(),
      sender_phone: this.sender_phone,
      sender_name: this.sender_name,
      receiver_id: this.chatType === 'private' ? this.receiverId : '',
      receiver_phone: this.receiver_phone,
      delivered: false,
      read: false,
      message_id: uuidv4(),
      isDeleted: false,
    };

    if (this.selectedAttachment) {
      message.attachment = {
        type: this.selectedAttachment.type,
        base64Data: this.selectedAttachment.base64,
        fileName: this.selectedAttachment.fileName,
        mimeType: this.selectedAttachment.mimeType
      };
      const url = await this.FileService.saveFileToSent(this.selectedAttachment.fileName, this.selectedAttachment.blob)
      console.log(url)
      const compressedFile = await this.FileService.getFile(url)
      message.attachment.base64Data = await this.FileService.convertToBase64(compressedFile as Blob) as string
    }

    await this.chatService.sendMessage(this.roomId, message, this.chatType, this.senderId); //

    this.messageText = '';
    this.selectedAttachment = null;
    this.showPreviewModal = false;

    this.scrollToBottom();
    // this.attachments = await this.attachmentService.getAttachments(this.roomId); //reply and reaction functionality in progress
  }

  async showAttachmentPreviewPopup() {
    const alert = await this.alertController.create({
      header: 'Send Attachment',
      message: this.getAttachmentPreviewHtml(),
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.selectedAttachment = null;
          }
        },         
        {
          text: 'Send',
          handler: () => {
            this.sendMessage();
          }
        }
      ]
    });

    await alert.present();
  }


  getAttachmentPreviewHtml(): string {
    if (!this.selectedAttachment) return '';

    const { type, base64Data, fileName } = this.selectedAttachment;

    if (type === 'image') {
      return `<img src="${base64Data}" style="max-width: 100%; border-radius: 8px;" />`;
    } else if (type === 'video') {
      return `<video controls style="max-width: 100%; border-radius: 8px;">
              <source src="${base64Data}" type="video/mp4" />
            </video>`;
    } else if (type === 'audio') {
      return `<audio controls>
              <source src="${base64Data}" type="audio/mpeg" />
            </audio>`;
    } else {
      return `<p>📎 ${fileName || 'File attached'}</p>`;
    }
  }


  // Guess mime from file name
  getMimeTypeFromName(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'png': return 'image/png';
      case 'pdf': return 'application/pdf';
      case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      // Add more if needed
      default: return '';
    }
  }

  async openAttachmentModal(msg: any) {
    // console.log("clicked here ");

    //return when no attachment in found
    if(!msg.attachment)
      return;

  const modal = await this.modalCtrl.create({
    component: AttachmentPreviewModalComponent,
    componentProps: {
      attachment: msg.attachment
    },
    cssClass: 'attachment-modal'
  });
  await modal.present();
}


  loadMessagesFromFirebase(isPagination = false) { }

  goToProfile() {
    const queryParams: any = {
      receiverId: this.chatType === 'group' ? this.roomId : this.receiverId,
      receiver_phone: this.receiver_phone,
      receiver_name: this.receiver_name,
      isGroup: this.chatType === 'group'
    };

    this.router.navigate(['/profile-screen'], { queryParams });
  }


  saveToLocalStorage() {
    localStorage.setItem(this.roomId, JSON.stringify(this.messages));
  }

  scrollToBottom() {
    if (this.ionContent) {
      setTimeout(() => {
        this.ionContent.scrollToBottom(300);
      }, 100);
    }
  }

  onInputChange() {
    this.showSendButton = this.messageText?.trim().length > 0;
  }

  onInputFocus() {
    setTimeout(() => {
      this.adjustFooterPosition();
      this.scrollToBottom();
    }, 300);
  }

  onInputBlur() {
    setTimeout(() => {
      this.resetFooterPosition();
    }, 300);
  }

  goToCallingScreen() {
    this.router.navigate(['/calling-screen']);
  }

  async initKeyboardListeners() {
    if (this.platform.is('capacitor')) {
      try {
        const showListener = await Keyboard.addListener('keyboardWillShow', (info) => {
          this.handleKeyboardShow(info.keyboardHeight);
        });

        const hideListener = await Keyboard.addListener('keyboardWillHide', () => {
          this.handleKeyboardHide();
        });

        this.keyboardListeners.push(showListener, hideListener);
      } catch (error) {
        this.setupFallbackKeyboardDetection();
      }
    } else {
      this.setupFallbackKeyboardDetection();
    }
  }

  ngOnDestroy() {
    this.keyboardListeners.forEach(listener => listener?.remove());
    this.messageSub?.unsubscribe();
  }

  // ... keyboard adjustment methods (same as your existing implementation)
  private handleKeyboardShow(keyboardHeight: number) {
    const footer = document.querySelector('.footer-fixed') as HTMLElement;
    const chatMessages = document.querySelector('.chat-messages') as HTMLElement;
    const ionContent = document.querySelector('ion-content') as HTMLElement;

    if (footer) footer.style.bottom = `${keyboardHeight}px`;
    if (chatMessages) chatMessages.style.paddingBottom = `${keyboardHeight + 80}px`;
    if (ionContent) ionContent.style.paddingBottom = `${keyboardHeight}px`;

    setTimeout(() => this.scrollToBottom(), 350);
  }

  private handleKeyboardHide() {
    const footer = document.querySelector('.footer-fixed') as HTMLElement;
    const chatMessages = document.querySelector('.chat-messages') as HTMLElement;
    const ionContent = document.querySelector('ion-content') as HTMLElement;

    if (footer) footer.style.bottom = '0px';
    if (chatMessages) chatMessages.style.paddingBottom = '80px';
    if (ionContent) ionContent.style.paddingBottom = '0px';
  }

  private setupFallbackKeyboardDetection() {
    let initialViewportHeight = window.visualViewport?.height || window.innerHeight;
    let initialChatPadding = 80;

    const handleViewportChange = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      const heightDifference = initialViewportHeight - currentHeight;

      const footer = document.querySelector('.footer-fixed') as HTMLElement;
      const chatMessages = document.querySelector('.chat-messages') as HTMLElement;
      const ionContent = document.querySelector('ion-content') as HTMLElement;

      if (heightDifference > 150) {
        if (footer) footer.style.bottom = `${heightDifference}px`;
        if (chatMessages) chatMessages.style.paddingBottom = `${heightDifference + initialChatPadding}px`;
        if (ionContent) ionContent.style.paddingBottom = `${heightDifference}px`;
        setTimeout(() => this.scrollToBottom(), 310);
      } else {
        if (footer) footer.style.bottom = '0px';
        if (chatMessages) chatMessages.style.paddingBottom = `${initialChatPadding}px`;
        if (ionContent) ionContent.style.paddingBottom = '0px';
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
    } else {
      window.addEventListener('resize', handleViewportChange);
    }
  }

  private adjustFooterPosition() {
    const footer = document.querySelector('.footer-fixed') as HTMLElement;
    const chatMessages = document.querySelector('.chat-messages') as HTMLElement;
    if (footer) footer.classList.add('keyboard-active');
    if (chatMessages) chatMessages.classList.add('keyboard-active');
  }

  private resetFooterPosition() {
    const footer = document.querySelector('.footer-fixed') as HTMLElement;
    const chatMessages = document.querySelector('.chat-messages') as HTMLElement;
    if (footer) footer.classList.remove('keyboard-active');
    if (chatMessages) chatMessages.classList.remove('keyboard-active');
  }
}
