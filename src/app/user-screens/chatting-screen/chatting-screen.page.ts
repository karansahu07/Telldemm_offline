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
import {
  query,
  orderByKey,
  endBefore,
  limitToLast,
  startAfter
} from 'firebase/database';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, IonContent, IonicModule, ModalController, Platform, PopoverController, ToastController } from '@ionic/angular';
import { firstValueFrom, Subscription } from 'rxjs';
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
import { Clipboard } from '@capacitor/clipboard';
import { Message, PinnedMessage } from 'src/types';
import { AuthService } from 'src/app/auth/auth.service';
import { ApiService } from 'src/app/services/api/api.service';
import { SqliteService } from 'src/app/services/sqlite.service';
import { TypingService } from 'src/app/services/typing.service';
import { Subject, Subscription as RxSub } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { ref as dbRef, onValue, onDisconnect } from 'firebase/database';


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
  // alertCtrl: any;


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
    private clipboard: Clipboard,
    private authService: AuthService,
    private service: ApiService,
    private sqliteService: SqliteService,
    private alertCtrl: AlertController,
    // private alertCtrl: AlertController,
    private typingService: TypingService,
  ) { }

  roomId = '';
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
  replyToMessage: Message | null = null;
  capturedImage = '';
  pinnedMessage: PinnedMessage | null = null;
  pinnedMessageDetails: any = null;
  private pinnedMessageSubscription: any;
  showMobilePinnedBanner: boolean = false;
  chatName: string = '';
  onlineCount: number = 0;

  showPopover = false;
  popoverEvent: any;
  isSending = false;

  limit = 15; // Load 15 messages at a time
  page = 0;
  isLoadingMore = false;
  hasMoreMessages = true;
  allMessages: Message[] = []; // Store all messages
  displayedMessages: Message[] = []; // Messages currently shown
  private lastMessageKey: string | null = null;

  receiverProfile: string | null = null;

  // --- Typing indicator related ---
  private typingInput$ = new Subject<void>();
  private typingRxSubs: RxSub[] = [];   // rx subscriptions for typing throttling
  typingCount = 0;                      // number of other users typing
  typingFrom: string | null = null;     // single user name who is typing
  private localTypingTimer: any = null; // inactivity timer to auto stop typing
  private typingUnsubscribe: (() => void) | null = null; // to stop onValue listener

  async ngOnInit() {
    // Enable proper keyboard scrolling
    Keyboard.setScroll({ isDisabled: false });
    await this.initKeyboardListeners();

    // Load sender (current user) details
    this.senderId = this.authService.authData?.userId || '';
    this.sender_phone = this.authService.authData?.phone_number || '';
    this.sender_name = this.authService.authData?.name || '';

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

    try {
      const db = getDatabase();

      // Setup onDisconnect removal for safety
      try {
        const myTypingRef = dbRef(db, `typing/${this.roomId}/${this.senderId}`);
        onDisconnect(myTypingRef).remove();
      } catch (err) {
        // ignore if not supported
        console.warn('onDisconnect setup failed', err);
      }

      // Listen to typing nodes in this room
            this.typingUnsubscribe = onValue(dbRef(db, `typing/${this.roomId}`), (snap) => {
        const val = snap.val() || {};
        const now = Date.now();
        const entries = Object.keys(val).map(k => ({
          userId: k,
          typing: val[k]?.typing ?? false,
          lastUpdated: val[k]?.lastUpdated ?? 0
        }));

        // remove expired (>10s old)
        const recent = entries.filter(e =>
          e.userId !== this.senderId &&
          e.typing &&
          (now - (e.lastUpdated || 0)) < 10000
        );

        this.typingCount = recent.length;
      });
 
      //dont delete this block
      // this.typingUnsubscribe = onValue(dbRef(db, `typing/${this.roomId}`), (snap) => {
      //   const val = snap.val() || {};
      //   const now = Date.now();

      //   const entries = Object.keys(val).map(k => ({
      //     userId: k,
      //     typing: val[k]?.typing ?? false,
      //     lastUpdated: val[k]?.lastUpdated ?? 0
      //   }));

      //   const recent = entries.filter(e =>
      //     e.userId !== this.senderId &&
      //     e.typing &&
      //     (now - (e.lastUpdated || 0)) < 10000
      //   );

      //   this.typingCount = recent.length;

      //   if (this.chatType === 'group' && this.typingCount === 1) {
      //     const uid = recent[0].userId;
      //     const member = this.groupMembers.find(m => m.user_id === uid);
      //     this.typingFrom = member?.name || uid;
      //   } else {
      //     this.typingFrom = null;
      //   }
      // });


      // Outgoing typing: throttle DB writes
      const tsub = this.typingInput$.pipe(
        throttleTime(1200, undefined, { leading: true, trailing: true })
      ).subscribe(() => {
        this.sendTypingSignal();
      });
      this.typingRxSubs.push(tsub);
    } catch (err) {
      console.warn('Typing setup error', err);
    }

    // Load and render messages
    this.loadFromLocalStorage();
    this.listenForMessages();
    this.setupPinnedMessageListener();

    this.checkMobileView();

    // Scroll to bottom after short delay
    setTimeout(() => this.scrollToBottom(), 100);

    await this.loadInitialMessages();
    this.loadReceiverProfile();
  }

  onInputTyping() {
    // keep existing showSendButton logic
    this.onInputChange();

    // notify subject to throttle outgoing typing updates
    this.typingInput$.next();

    // reset local timer
    if (this.localTypingTimer) {
      clearTimeout(this.localTypingTimer);
    }
    this.localTypingTimer = setTimeout(() => {
      this.stopTypingSignal();
    }, 2500);
  }

  // call on blur to ensure immediate stop
  onInputBlurTyping() {
    this.stopTypingSignal();
  }

  private async sendTypingSignal() {
    try {
      await this.typingService.startTyping(this.roomId, this.senderId);
      // schedule a safety stop after inactivity
      if (this.localTypingTimer) clearTimeout(this.localTypingTimer);
      this.localTypingTimer = setTimeout(() => {
        this.stopTypingSignal();
      }, 2500);
    } catch (err) {
      console.warn('startTyping failed', err);
    }
  }

  private async stopTypingSignal() {
    try {
      if (this.localTypingTimer) {
        clearTimeout(this.localTypingTimer);
        this.localTypingTimer = null;
      }
      await this.typingService.stopTyping(this.roomId, this.senderId);
    } catch (err) {
      console.warn('stopTyping failed', err);
    }
  }

  async ionViewWillEnter() {
    // Enable proper keyboard scrolling
    Keyboard.setScroll({ isDisabled: false });
    await this.initKeyboardListeners();

    // Load sender (current user) details
    this.senderId = this.authService.authData?.userId || '';
    this.sender_phone = this.authService.authData?.phone_number || '';
    this.sender_name = this.authService.authData?.name || '';

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
      this.attachmentPath = state['imageToSend'];
    }

    console.log("this.attachmentPath", this.attachmentPath);

    this.loadReceiverProfile();
  }

  //   loadReceiverProfile() {
  //   if (!this.receiverId) return;

  //   this.service.getUserProfilebyId(this.receiverId).subscribe({
  //     next: (res: any) => {
  //       this.receiverProfile = res?.profile || null;
  //     },
  //     error: (err) => {
  //       console.error("Error loading receiver profile:", err);
  //       this.receiverProfile = null;
  //     }
  //   });
  // }

  loadReceiverProfile() {
    this.receiverId = this.route.snapshot.queryParamMap.get('receiverId') || '';
    //  console.log("this group",this.chatType);
    //   console.log("this receiver",this.receiverId);
    if (!this.receiverId) return;

    if (this.chatType === 'group') {
      // console.log("this group",this.isGroup);
      // console.log("this group",this.receiverId);
      // 👇 Group DP fetch with receiverId (as groupId)
      this.service.getGroupDp(this.receiverId).subscribe({
        next: (res: any) => {
          this.receiverProfile = res?.group_dp_url || null;
        },
        error: (err) => {
          console.error("❌ Error loading group profile:", err);
          this.receiverProfile = null;
        }
      });
    } else {
      // 👇 User DP fetch
      this.service.getUserProfilebyId(this.receiverId).subscribe({
        next: (res: any) => {
          this.receiverProfile = res?.profile || null;
        },
        error: (err) => {
          console.error("❌ Error loading user profile:", err);
          this.receiverProfile = null;
        }
      });
    }
  }

  setDefaultAvatar(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/images/user.jfif';
  }


  // setDefaultAvatar(event: Event) {
  //   (event.target as HTMLImageElement).src = 'assets/images/user.jfif';
  // }

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
      el.innerHTML = originalText;
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
      el.innerHTML = el.textContent || '';
      el.style.backgroundColor = 'transparent';
    });
    this.matchedMessages = [];
  }

  openPopover(ev: any) {
    this.popoverEvent = ev;
    this.showPopover = true;
  }


  onDateSelected(event: any) {
    const selectedDateObj = new Date(event.detail.value);

    const day = String(selectedDateObj.getDate()).padStart(2, '0');
    const month = String(selectedDateObj.getMonth() + 1).padStart(2, '0');
    const year = selectedDateObj.getFullYear();

    const formattedDate = `${day}/${month}/${year}`; // Example: "11/07/2025"

    this.selectedDate = event.detail.value; // Original ISO format
    this.showPopover = false; // Close the popover
    this.showDateModal = false; // In case you're also using modal variant

    // Smooth scroll to that date's section
    setTimeout(() => {
      const el = document.getElementById('date-group-' + formattedDate);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        console.warn('No messages found for selected date:', formattedDate);
      }
    }, 300);
  }

  openDatePicker() {
    this.showDateModal = true;
    console.log('Opening calendar modal...');
  }

  onMessagePress(message: any) {
    const index = this.selectedMessages.findIndex(m => m.key === message.key);
    if (index > -1) {
      this.selectedMessages.splice(index, 1); // Unselect if already selected
    } else {
      this.selectedMessages.push(message); // Select
    }
  }

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
    this.selectedMessages = [msg];
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

  isOnlyOneTextMessage(): boolean {
    return this.selectedMessages.length === 1 && this.selectedMessages[0].type === 'text';
  }

  isMultipleTextMessages(): boolean {
    return this.selectedMessages.length > 1 && this.selectedMessages.every(msg => msg.type === 'text');
  }

  isOnlyOneAttachment(): boolean {
    return this.selectedMessages.length === 1 && this.selectedMessages[0].type !== 'text';
  }

  isMultipleAttachments(): boolean {
    return this.selectedMessages.length > 1 && this.selectedMessages.every(msg => msg.type !== 'text');
  }

  isMixedSelection(): boolean {
    const types = this.selectedMessages.map(msg => msg.type);
    return types.includes('text') && types.some(t => t !== 'text');
  }

  async copySelectedMessages() {
    if (this.lastPressedMessage?.text) {
      await Clipboard.write({ string: this.lastPressedMessage.text });
      console.log('Text copied to clipboard:', this.lastPressedMessage.text);
      this.selectedMessages = [];
      this.lastPressedMessage = null;
    }
  }

  replyToMessages() {
    if (this.selectedMessages.length === 1) {
      const messageToReply = this.selectedMessages[0];
      this.setReplyToMessage(messageToReply);
    }
  }

  setReplyToMessage(message: Message) {
    this.replyToMessage = message;

    // Clear selection after setting reply
    this.selectedMessages = [];
    this.lastPressedMessage = null;

    // Focus on input field after a short delay
    setTimeout(() => {
      const inputElement = document.querySelector('ion-textarea') as HTMLIonTextareaElement;
      if (inputElement) {
        inputElement.setFocus();
      }
    }, 100);
  }

  cancelReply() {
    this.replyToMessage = null;
  }

  getRepliedMessage(replyToMessageId: string): Message | null {
    const msg = this.allMessages.find(msg => {
      // console.log(msg.message_id, msg.message_id == replyToMessageId);
      return msg.message_id == replyToMessageId;
    }) || null;
    // console.log("messages fron get reply", msg);
    return msg;
  }

  getReplyPreviewText(message: Message): string {
    // console.log("messaedsfd",message);
    if (message.text) {
      // Limit reply preview to 50 characters
      return message.text.length > 50 ?
        message.text.substring(0, 50) + '...' :
        message.text;
    } else if (message.attachment) {
      // Show attachment type in reply preview
      const type = message.attachment.type;
      switch (type) {
        case 'image': return '📷 Photo';
        case 'video': return '🎥 Video';
        case 'audio': return '🎵 Audio';
        case 'file': return '📄 Document';
        default: return '📎 Attachment';
      }
    }
    return 'Message';
  }

  scrollToRepliedMessage(replyToMessageId: string) {

    let targetElement: HTMLElement | any;

    const messageElements = document.querySelectorAll('[data-msg-key]');

    // Loop through messages and find the matching DOM element
    this.allMessages.forEach((msg) => {
      if (msg.message_id === replyToMessageId) {
        const element = Array.from(messageElements).find(el =>
          el.getAttribute('data-msg-key') === msg.key
        );
        if (element && element instanceof HTMLElement) {
          targetElement = element;
        }
      }
    });

    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      targetElement.classList.add('highlight-message');
      setTimeout(() => {
        targetElement?.classList.remove('highlight-message');
      }, 2000);
    }
  }

  deleteSelectedMessages() {
    console.log("selectedMessages", this.selectedMessages);
    this.selectedMessages.forEach(msg => {
      this.chatService.deleteMessage(this.roomId, msg.key);
    });
    this.selectedMessages = [];
  }

  onForward() {
    console.log('Forwarding:', this.selectedMessages);

    this.chatService.setForwardMessages(this.selectedMessages);

    this.selectedMessages = [];

    this.router.navigate(['/forwardmessage']);
  }

  async onMore(ev?: Event) {
    const hasText = !!this.lastPressedMessage?.text;
    const hasAttachment = !!(
      this.lastPressedMessage?.attachment ||
      this.lastPressedMessage?.file ||
      this.lastPressedMessage?.image ||
      this.lastPressedMessage?.media
    );

    const isPinned = this.pinnedMessage?.key === this.lastPressedMessage?.key;

    const popover = await this.popoverController.create({
      component: MessageMorePopoverComponent,
      event: ev,
      translucent: true,
      showBackdrop: true,
      componentProps: {
        hasText: hasText,
        hasAttachment: hasAttachment,
        isPinned: isPinned,
        message: this.lastPressedMessage,   // ✅ pass current message
        currentUserId: this.senderId        // ✅ pass logged-in user
      }
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
        this.copyMessage();
        break;
      case 'share':
        this.shareMessage();
        break;
      case 'pin':
        this.pinMessage();
        break;
      case 'unpin':
        this.unpinMessage();
        break;
      case 'edit':
        this.editMessage(this.lastPressedMessage);
        break;
    }
  }

  async editMessage(message: Message) {
    // console.log("last message pressed", this.lastPressedMessage);

    const alert = await this.alertCtrl.create({
      header: 'Edit Message',
      inputs: [
        {
          name: 'text',
          type: 'text',
          value: message.text,
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: async (data: any) => {
            if (data.text && data.text.trim() !== '') {
              const encryptedText = await this.encryptionService.encrypt(data.text.trim());

              const db = getDatabase();
              const msgRef = ref(db, `chats/${this.roomId}/${message.key}`);

              await update(msgRef, {
                text: encryptedText,
                isEdit: true
              });

              message.text = data.text.trim();
              message.isEdit = true;

              this.lastPressedMessage = { ...message };
            }
          }
        }
      ]
    });

    await alert.present();
  }




  async copyMessage() {
    if (this.lastPressedMessage?.text) {
      await Clipboard.write({ string: this.lastPressedMessage.text });
      console.log('Text copied to clipboard:', this.lastPressedMessage.text);
      this.selectedMessages = [];
      this.lastPressedMessage = null;
    }
  }

  shareMessage() {
    // if (this.lastPressedMessage?.attachment ||
    //   this.lastPressedMessage?.file ||
    //   this.lastPressedMessage?.image ||
    //   this.lastPressedMessage?.media) {
    console.log('Share clicked for attachment:', this.lastPressedMessage);
    //   // Add your share logic here
    //   this.selectedMessages = [];
    //   this.lastPressedMessage = null;
    // }
    //Todo implement this
  }

  pinMessage() {
    const pin: PinnedMessage = {
      messageId: this.lastPressedMessage?.message_id as string,
      key: this.lastPressedMessage?.key,
      pinnedAt: Date.now(),
      pinnedBy: this.senderId,
      roomId: this.roomId,
      scope: 'global' // Always global now
    };
    this.chatService.pinMessage(pin);

    console.log("Message pinned", pin.messageId);
    this.selectedMessages = [];
    this.lastPressedMessage = null;
  }

  setupPinnedMessageListener() {
    this.pinnedMessageSubscription = this.chatService.listenToPinnedMessage(
      this.roomId,
      (pinnedMessage) => {
        this.pinnedMessage = pinnedMessage;
        if (pinnedMessage) {
          // Find the actual message details from your messages array
          this.findPinnedMessageDetails(pinnedMessage.key);
        } else {
          this.pinnedMessageDetails = null;
        }
      }
    );
  }

  findPinnedMessageDetails(messageId: string) {
    // Search through all grouped messages to find the pinned message
    for (const group of this.groupedMessages) {
      const foundMessage = group.messages.find(msg => msg.message_id === messageId);
      if (foundMessage) {
        this.pinnedMessageDetails = foundMessage;
        break;
      }
    }
  }

  unpinMessage() {
    if (this.pinnedMessage) {
      this.chatService.unpinMessage(this.roomId);
      this.selectedMessages = [];
      this.lastPressedMessage = null;
    }
  }

  scrollToPinnedMessage() {
    if (this.pinnedMessageDetails) {
      const element = document.querySelector(`[data-msg-key="${this.pinnedMessageDetails.key}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Optional: Add highlight effect
        element.classList.add('highlighted');
        setTimeout(() => element.classList.remove('highlighted'), 2000);
      }
    }
  }

  checkMobileView() {
    this.showMobilePinnedBanner = window.innerWidth < 480;
  }

  openChatInfo() {
    // Implement your chat info functionality
    console.log('Opening chat info');
  }

  async loadInitialMessages() {
    this.isLoadingMore = true;
    try {
      // Load from localStorage first for quick display
      await this.loadFromLocalStorage();

      // Then load latest messages from Firebase
      await this.loadMessagesFromFirebase(false);

    } catch (error) {
      console.error('Error loading initial messages:', error);
    } finally {
      this.isLoadingMore = false;
    }
  }

  getAttachmentIcon(type: string): string {
    switch (type) {
      case 'image': return 'image-outline';
      case 'video': return 'videocam-outline';
      case 'audio': return 'musical-note-outline';
      case 'file': return 'document-outline';
      default: return 'attach-outline';
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
        // Check if user scrolled to top (for loading older messages)
        if (event.detail.scrollTop < 100 && this.hasMoreMessages && !this.isLoadingMore) {
          await this.loadMoreMessages();
        }
      });
    }
  }

  async loadMoreMessages() {
    if (this.isLoadingMore || !this.hasMoreMessages) {
      return;
    }

    this.isLoadingMore = true;
    const currentScrollHeight = this.scrollContainer?.nativeElement?.scrollHeight || 0;

    try {
      // Load next batch of messages
      await this.loadMessagesFromFirebase(true);

      // Maintain scroll position after loading new messages
      setTimeout(() => {
        if (this.scrollContainer?.nativeElement) {
          const newScrollHeight = this.scrollContainer.nativeElement.scrollHeight;
          const scrollDiff = newScrollHeight - currentScrollHeight;
          this.scrollContainer.nativeElement.scrollTop = scrollDiff;
        }
      }, 100);

    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      this.isLoadingMore = false;
    }
  }

  getRoomId(userA: string, userB: string): string {
    return userA < userB ? `${userA}_${userB}` : `${userB}_${userA}`;
  }


  async listenForMessages() {
    this.messageSub = this.chatService.listenForMessages(this.roomId).subscribe(async (newMessages) => {
      const decryptedMessages: Message[] = [];

      for (const msg of newMessages) {
        const decryptedText = await this.encryptionService.decrypt(msg.text || '');
        const processedMessage = { ...msg, text: decryptedText };
        decryptedMessages.push(processedMessage);

        // Mark as delivered if current user is receiver
        if (msg.receiver_id === this.senderId && !msg.delivered) {
          this.chatService.markDelivered(this.roomId, msg.key);
        }
      }

      // Check if we have new messages that aren't in our current display
      const newestDisplayedTimestamp = this.displayedMessages.length > 0
        ? new Date(this.displayedMessages[this.displayedMessages.length - 1].timestamp).getTime()
        : 0;

      const newIncomingMessages = decryptedMessages.filter(msg =>
        new Date(msg.timestamp).getTime() > newestDisplayedTimestamp
      );

      if (newIncomingMessages.length > 0) {
        // Add new messages to our arrays
        this.allMessages = [...this.allMessages, ...newIncomingMessages];
        this.displayedMessages = [...this.displayedMessages, ...newIncomingMessages];

        // Re-group messages
        this.groupedMessages = await this.groupMessagesByDate(this.displayedMessages);

        // Save to localStorage
        this.saveToLocalStorage();

        // Scroll to bottom for new messages
        setTimeout(() => {
          this.scrollToBottom();
          this.observeVisibleMessages();
        }, 100);
      }
    });
  }

  private async markDisplayedMessagesAsRead() {
    const unreadMessages = this.displayedMessages.filter(msg =>
      !msg.read && msg.receiver_id === this.senderId
    );

    for (const msg of unreadMessages) {
      await this.chatService.markRead(this.roomId, msg.key);
    }
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
              observer.unobserve(entry.target);
            }
          });
        }, {
          threshold: 1.0
        });

        observer.observe(el);
      }
    });
  }

  async groupMessagesByDate(messages: Message[]) {
    const grouped: { [date: string]: any[] } = {};
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    for (const msg of messages) {
      const timestamp = new Date(msg.timestamp);

      // Format time
      const hours = timestamp.getHours();
      const minutes = timestamp.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
      msg.time = `${formattedHours}:${formattedMinutes} ${ampm}`;

      // Handle attachments
      if (msg.attachment) {
        const currentUserId = this.authService.authData?.userId;
        const receiverId = msg.receiver_id;

        if (receiverId === currentUserId) {
          try {
            const apiResponse = await firstValueFrom(
              this.service.getDownloadUrl(msg.attachment.mediaId as string)
            );

            if (apiResponse.status && apiResponse.downloadUrl) {
              const response = await fetch(apiResponse.downloadUrl);
              const blob = await response.blob();
              const extension = msg.attachment.fileName?.split('.').pop() || 'dat';
              const filename = `${msg.attachment.mediaId}.${extension}`;
              const file_Path = await this.FileService.saveFileToReceived(filename, blob);
              await this.sqliteService.saveAttachment(
                this.roomId,
                msg.attachment.type,
                file_Path,
                msg.attachment.mediaId as string
              );
            }
          } catch (error) {
            console.error("Error handling received attachment:", error);
          }
        }

        msg.attachment.previewUrl = await this.sqliteService.getAttachmentPreview(
          msg.attachment.mediaId as string
        );
      }

      // Date labeling logic
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
        const dd = timestamp.getDate().toString().padStart(2, '0');
        const mm = (timestamp.getMonth() + 1).toString().padStart(2, '0');
        const yyyy = timestamp.getFullYear();
        label = `${dd}/${mm}/${yyyy}`;
      }

      if (!grouped[label]) {
        grouped[label] = [];
      }
      grouped[label].push(msg);
    }

    return Object.keys(grouped).map(date => ({
      date,
      messages: grouped[date]
    }));
  }

  isLoadingIndicatorVisible(): boolean {
    return this.isLoadingMore;
  }

  // Method to refresh messages (pull to refresh)
  async refreshMessages(event?: any) {
    try {
      this.page = 0;
      this.hasMoreMessages = true;
      this.lastMessageKey = null;
      this.allMessages = [];
      this.displayedMessages = [];

      await this.loadInitialMessages();

      if (event) {
        event.target.complete();
      }
    } catch (error) {
      console.error('Error refreshing messages:', error);
      if (event) {
        event.target.complete();
      }
    }
  }

  async loadFromLocalStorage() {
    const cached = localStorage.getItem(this.roomId);
    if (!cached) return;

    try {
      const rawMessages = JSON.parse(cached);
      const decryptedMessages = [];

      // Load only the latest messages from cache (limit to recent ones)
      const recentMessages = rawMessages.slice(-this.limit * 3); // Keep 3 pages worth in memory

      for (const msg of recentMessages) {
        const decryptedText = await this.encryptionService.decrypt(msg.text || '');
        decryptedMessages.push({ ...msg, text: decryptedText });
      }

      this.allMessages = decryptedMessages;
      this.displayedMessages = decryptedMessages.slice(-this.limit); // Show only latest batch
      this.groupedMessages = await this.groupMessagesByDate(this.displayedMessages);

      if (decryptedMessages.length > 0) {
        this.lastMessageKey = decryptedMessages[0].key;
      }

    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }

  blobToFile(blob: Blob, fileName: string, mimeType?: string): File {
    return new File([blob], fileName, {
      type: mimeType || blob.type,
      lastModified: Date.now(),
    });
  }

  async pickAttachment() {
    const result = await FilePicker.pickFiles({ readData: true });

    console.log("files result of pick", result);
    if (result?.files?.length) {
      const file = result.files[0];
      const mimeType = file.mimeType;
      const type = mimeType?.startsWith('image')
        ? 'image'
        : mimeType?.startsWith('video')
          ? 'video'
          : 'file';

      let blob = file.blob as Blob;

      if (!blob && file.data) {
        blob = this.FileService.convertToBlob(
          `data:${mimeType};base64,${file.data}`,
          mimeType
        );
      }

      console.log("blob object is ::::", blob);

      // ✅ Create preview URL
      const previewUrl = URL.createObjectURL(blob);

      this.selectedAttachment = {
        type,
        blob,
        fileName: `${Date.now()}.${this.getFileExtension(file.name)}`,
        mimeType,
        fileSize: blob.size,
        previewUrl,
      };

      this.showPreviewModal = true;
    }
  }

  getFileExtension(fileName: string): string {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
  }


  private async compressImage(blob: Blob): Promise<Blob> {
    if (!blob.type.startsWith('image/')) {
      return blob;
    }

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };

    try {
      return await imageCompression(blob as any, options);
    } catch (err) {
      console.warn('Image compression failed:', err);
      return blob;
    }
  }


  cancelAttachment() {
    this.selectedAttachment = null;
    this.showPreviewModal = false;
    this.messageText = '';
  }

  setReplyTo(message: Message) {
    this.replyToMessage = message;
  }

  async sendMessage() {

    if (this.isSending) {
      return;
    }

    this.isSending = true;

    try {
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
        replyToMessageId: this.replyToMessage?.message_id || '',
        isEdit: false,
      };

      // Handle attachment with S3 upload
      if (this.selectedAttachment) {
        try {
          const mediaId = await this.uploadAttachmentToS3(this.selectedAttachment);
          console.log("media id is dfksdfgs", mediaId);

          message.attachment = {
            type: this.selectedAttachment.type,
            mediaId: mediaId,
            fileName: this.selectedAttachment.fileName,
            mimeType: this.selectedAttachment.mimeType,
            fileSize: this.selectedAttachment.fileSize,
            caption: plainText
          };

          // Also save locally for quick access
          const file_path = await this.FileService.saveFileToSent(this.selectedAttachment.fileName, this.selectedAttachment.blob);

          await this.sqliteService.saveAttachment(this.roomId, this.selectedAttachment.type, file_path, mediaId);

        } catch (error) {
          console.error('Failed to upload attachment:', error);
          // Show error toast
          const toast = await this.toastCtrl.create({
            message: 'Failed to upload attachment. Please try again.',
            duration: 3000,
            color: 'danger'
          });
          await toast.present();
          return; // Don't send message if attachment upload fails
        }
      }

      await this.chatService.sendMessage(this.roomId, message, this.chatType, this.senderId);

      // Clear everything after sending
      this.messageText = '';
      this.selectedAttachment = null;
      this.showPreviewModal = false;
      this.replyToMessage = null;
      await this.stopTypingSignal();

      this.scrollToBottom();

    } catch (error) {
      console.error('Error sending message:', error);
      // Show error toast
      const toast = await this.toastCtrl.create({
        message: 'Failed to send message. Please try again.',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      // Always reset sending state
      this.isSending = false;
    }
  }

  private async uploadAttachmentToS3(attachment: any): Promise<string> {
    try {
      const uploadResponse = await firstValueFrom(
        this.service.getUploadUrl(
          parseInt(this.senderId),
          attachment.type,
          attachment.fileSize,
          attachment.mimeType,
          {
            caption: this.messageText.trim(),
            fileName: attachment.fileName
          }
        )
      );

      if (!uploadResponse?.status || !uploadResponse.upload_url) {
        throw new Error('Failed to get upload URL');
      }


      const uploadResult = await firstValueFrom(
        this.service.uploadToS3(uploadResponse.upload_url, this.blobToFile(attachment.blob, attachment.fileName, attachment.mimeType))
      );

      return uploadResponse.media_id;

    } catch (error) {
      console.error('S3 upload error:', error);
      throw error;
    }
  }


  async openAttachmentModal(msg: any) {
    if (!msg.attachment) return;

    let attachmentUrl = '';

    try {
      // First try to get from local storage for quick access
      const localUrl = await this.FileService.getFilePreview(
        `${msg.sender_id === this.senderId ? 'sent' : 'received'}/${msg.attachment.fileName}`
      );

      if (localUrl) {
        attachmentUrl = localUrl;
      } else {
        // If not available locally, get download URL from S3
        const downloadResponse = await this.service.getDownloadUrl(msg.attachment.mediaId).toPromise();

        if (downloadResponse?.status && downloadResponse.downloadUrl) {
          attachmentUrl = downloadResponse.downloadUrl;

          // Optionally save to local storage for future use
          if (msg.sender_id !== this.senderId) {
            this.downloadAndSaveLocally(downloadResponse.downloadUrl, msg.attachment.fileName);
          }
        }
      }

      const modal = await this.modalCtrl.create({
        component: AttachmentPreviewModalComponent,
        componentProps: {
          attachment: {
            ...msg.attachment,
            url: attachmentUrl // Pass the URL to modal
          },
          message: msg
        },
        cssClass: 'attachment-modal'
      });

      await modal.present();
      const { data } = await modal.onDidDismiss();

      if (data && data.action === 'reply') {
        this.setReplyToMessage(data.message);
      }

    } catch (error) {
      console.error('Failed to load attachment:', error);
      const toast = await this.toastCtrl.create({
        message: 'Failed to load attachment',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  // 6. Helper method to download and save files locally
  private async downloadAndSaveLocally(url: string, fileName: string) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      await this.FileService.saveFileToReceived(fileName, blob);
    } catch (error) {
      console.warn('Failed to save file locally:', error);
    }
  }

  // 7. Updated attachment preview in chat (for thumbnails)
  getAttachmentPreview(attachment: any): string {
    if (attachment.caption) {
      return attachment.caption.length > 30 ?
        attachment.caption.substring(0, 30) + '...' :
        attachment.caption;
    }

    switch (attachment.type) {
      case 'image': return '📷 Photo';
      case 'video': return '🎥 Video';
      case 'audio': return '🎵 Audio';
      case 'file': return attachment.fileName || '📄 File';
      default: return '📎 Attachment';
    }
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

  async loadMessagesFromFirebase(loadMore = false) {
    try {
      const db = getDatabase();
      const messagesRef = ref(db, `chats/${this.roomId}`);

      let qry;

      if (loadMore && this.lastMessageKey) {
        // Load older messages using pagination
        qry = query(
          messagesRef,
          orderByKey(),
          endBefore(this.lastMessageKey),
          limitToLast(this.limit)
        );
      } else {
        // Load latest messages
        qry = query(
          messagesRef,
          orderByKey(),
          limitToLast(this.limit)
        );
      }

      const snapshot = await get(qry);

      if (snapshot.exists()) {
        const newMessages: Message[] = [];
        const messagesData = snapshot.val();

        // Convert to array and sort by timestamp
        const messageKeys = Object.keys(messagesData).sort();

        for (const key of messageKeys) {
          const msg = messagesData[key];
          const decryptedText = await this.encryptionService.decrypt(msg.text || '');

          newMessages.push({
            ...msg,
            key: key,
            text: decryptedText
          });
        }

        if (loadMore) {
          // Prepend older messages to the beginning
          this.allMessages = [...newMessages, ...this.allMessages];
          this.displayedMessages = [...newMessages, ...this.displayedMessages];
        } else {
          // Replace with latest messages
          this.allMessages = newMessages;
          this.displayedMessages = newMessages;
        }

        // Update pagination tracking
        if (newMessages.length > 0) {
          if (loadMore) {
            this.lastMessageKey = newMessages[0].key;
          } else {
            this.lastMessageKey = newMessages[0].key;
          }
        }

        // Check if we have more messages to load
        this.hasMoreMessages = newMessages.length === this.limit;

        // Group messages by date
        this.groupedMessages = await this.groupMessagesByDate(this.displayedMessages);

        // Save to localStorage
        this.saveToLocalStorage();

        // Mark messages as read
        await this.markDisplayedMessagesAsRead();

      } else {
        this.hasMoreMessages = false;
      }

    } catch (error) {
      console.error('Error loading messages from Firebase:', error);
    }
  }

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
    try {
      // Save all messages but limit to recent ones to prevent localStorage bloat
      const messagesToSave = this.allMessages.slice(-100);
      localStorage.setItem(this.roomId, JSON.stringify(messagesToSave));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
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
    this.onInputBlurTyping();
  }

  goToCallingScreen() {
    this.router.navigate(['/calling-screen']);
  }

  async openCamera() {
    try {
      const image = await Camera.getPhoto({
        source: CameraSource.Camera,
        quality: 90,
        resultType: CameraResultType.Uri
      });
      this.capturedImage = image.webPath!;
      // console.log("camera checking:",this.capturedImage);
    } catch (error) {
      console.error('Camera error:', error);
    }
  }

  openKeyboard() {
    setTimeout(() => {
      const textareaElement = document.querySelector('ion-textarea') as HTMLIonTextareaElement;
      if (textareaElement) {
        textareaElement.setFocus();
      }
    }, 100);
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
    if (this.pinnedMessageSubscription) {
      this.pinnedMessageSubscription();
    }
    this.typingRxSubs.forEach(s => s.unsubscribe());
    try {
      if (this.typingUnsubscribe) this.typingUnsubscribe();
    } catch (e) { /* ignore */ }
    // ensure typing node removed
    this.stopTypingSignal();
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