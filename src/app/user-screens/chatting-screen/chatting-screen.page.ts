import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  QueryList,
  Renderer2,
  NgZone,
} from '@angular/core';
import {
  query,
  orderByKey,
  endBefore,
  limitToLast,
  getDatabase,
  ref,
  get,
  update,
  set,
  remove,
  off,
} from 'firebase/database';
import { ref as dbRef, onValue, onDisconnect } from 'firebase/database';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AlertController,
  IonContent,
  IonicModule,
  ModalController,
  Platform,
  PopoverController,
  ToastController,
  IonDatetime,
  ActionSheetController,
} from '@ionic/angular';
import { firstValueFrom, Subscription, timer } from 'rxjs';
import { Keyboard } from '@capacitor/keyboard';
import { FirebaseChatService } from 'src/app/services/firebase-chat.service';
import { EncryptionService } from 'src/app/services/encryption.service';
import { v4 as uuidv4 } from 'uuid';
import { SecureStorageService } from '../../services/secure-storage/secure-storage.service';
import { FileUploadService } from '../../services/file-upload/file-upload.service';
import { ChatOptionsPopoverComponent } from 'src/app/components/chat-options-popover/chat-options-popover.component';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { NavController } from '@ionic/angular';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { FileSystemService } from 'src/app/services/file-system.service';
import imageCompression from 'browser-image-compression';
import { AttachmentPreviewModalComponent } from '../../components/attachment-preview-modal/attachment-preview-modal.component';
import { MessageMorePopoverComponent } from '../../components/message-more-popover/message-more-popover.component';
import { Clipboard } from '@capacitor/clipboard';
import { Message, PinnedMessage } from 'src/types';
import { AuthService } from 'src/app/auth/auth.service';
import { ApiService } from 'src/app/services/api/api.service';
import {
  IAttachment,
  IConversation,
  IMessage,
  SqliteService,
} from 'src/app/services/sqlite.service';
import { TypingService } from 'src/app/services/typing.service';
import { Subject, Subscription as RxSub } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { PresenceService } from 'src/app/services/presence.service';
import { switchMap } from 'rxjs/operators';
import { resolve } from 'path';

@Component({
  selector: 'app-chatting-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './chatting-screen.page.html',
  styleUrls: ['./chatting-screen.page.scss'],
})
export class ChattingScreenPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;
  @ViewChild(IonContent, { static: false }) ionContent!: IonContent;
  @ViewChild('fileInput', { static: false })
  fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('datePicker', { static: false }) datePicker!: IonDatetime;
  @ViewChild('longPressEl') messageElements!: QueryList<ElementRef>;

  messages: Message[] = [];
  groupedMessages: {
    date: string;
    messages: (Message & { isMe: boolean })[];
  }[] = [];

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

  private resizeHandler = () => this.setDynamicPadding();
  private intersectionObserver?: IntersectionObserver;

  roomId = '';
  chatType: 'private' | 'group' = 'private';
  groupName = '';
  isGroup: any;
  receiver_name = '';
  sender_name = '';
  groupMembers: {
    user_id: string;
    name?: string;
    phone?: string;
    avatar?: string;
    role?: string;
    phone_number?: string;
    publicKeyHex?: string | null;
  }[] = [];
  attachments: any[] = [];
  selectedAttachment: any = null;
  showPreviewModal: boolean = false;
  attachmentPath: string = '';
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
  allMessages: (IMessage & { attachment?: IAttachment; fadeOut: boolean })[] =
    []; // Store all messages
  displayedMessages: Message[] = []; // Messages currently shown
  private lastMessageKey: string | null = null;

  receiverProfile: string | null = null;
  chatTitle: string | null = null;

  pfUsers: Array<{
    userId?: string | number;
    username?: string;
    phoneNumber?: string;
    avatar?: string | null;
    isOnPlatform?: boolean;
  }> = [];

  currentConv: IConversation | null = null;

  private pfUsersSub?: Subscription;

  // block state flags
  iBlocked = false;
  theyBlocked = false;

  // UI bubbles
  showBlockBubble = false;
  showUnblockBubble = false;
  private blockBubbleTimeout: any = null;

  // refs for listeners (so we can off them)
  private iBlockedRef: any = null;
  private theyBlockedRef: any = null;
  private _iBlockedLoaded = false;
  private _theyBlockedLoaded = false;

  // Typing indicator related
  private typingInput$ = new Subject<void>();
  private typingRxSubs: RxSub[] = [];
  typingCount = 0;
  typingFrom: string | null = null;
  private localTypingTimer: any = null;
  private typingUnsubscribe: (() => void) | null = null;
  typingUsers: {
    userId: string;
    name: string | null;
    avatar: string | null;
  }[] = [];

  private statusPollSub?: Subscription;
  public receiverOnline = false;
  public receiverLastSeen: string | null = null;

  // store unsubscribes for firebase onValue
  private onValueUnsubs: Array<() => void> = [];
  private emojiTargetMsg: Message | null = null;

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
    private typingService: TypingService,
    private renderer: Renderer2,
    private el: ElementRef,
    private zone: NgZone,
    private presence: PresenceService,
    private actionSheetCtrl: ActionSheetController // private toastCtrl: ToastController, // private modalCtrl: ModalController, // private firebaseChatService : FirebaseChatService
  ) {}

  async ngOnInit() {
    Keyboard.setScroll({ isDisabled: false });

    this.senderId = this.authService.authData?.userId || '';
    this.sender_phone = this.authService.authData?.phone_number || '';
    this.sender_name = this.authService.authData?.name || '';

    const nameFromQuery =
      this.route.snapshot.queryParamMap.get('receiver_name');
    this.receiver_name =
      nameFromQuery ||
      (await this.secureStorage.getItem('receiver_name')) ||
      '';

    const rawId = this.route.snapshot.queryParamMap.get('receiverId') || '';
    const chatTypeParam = this.route.snapshot.queryParamMap.get('isGroup');
    const phoneFromQuery =
      this.route.snapshot.queryParamMap.get('receiver_phone');

    this.chatType = chatTypeParam === 'true' ? 'group' : 'private';

    // if (this.chatType === 'group') {
    //   this.roomId = decodeURIComponent(rawId);

    //   try {
    //     const res = await this.chatService.fetchGroupWithProfiles(this.roomId);
    //     if (!res) return;
    //     const { groupName, groupMembers } = res;
    //     this.groupName = groupName;
    //     this.groupMembers = groupMembers;
    //   } catch (err) {
    //     console.warn('Failed to fetch group with profiles', err);
    //     this.groupName = 'Group';
    //     this.groupMembers = [];
    //   }
    // } else {
    //   this.receiverId = decodeURIComponent(rawId);
    //   this.roomId = this.getRoomId(this.senderId, this.receiverId);
    //   this.receiver_phone =
    //     phoneFromQuery || localStorage.getItem('receiver_phone') || '';
    //   localStorage.setItem('receiver_phone', this.receiver_phone);
    // }

    // this.setupTypingListener();

    // await this.chatService.resetUnreadCount(this.roomId, this.senderId);
    // await this.markMessagesAsRead();

    // try {
    //   const db = getDatabase();
    //   try {
    //     const myTypingRef = dbRef(db, `typing/${this.roomId}/${this.senderId}`);
    //     onDisconnect(myTypingRef).remove();
    //   } catch (err) {
    //     console.warn('onDisconnect setup failed', err);
    //   }

    //   const tsub = this.typingInput$
    //     .pipe(throttleTime(1200, undefined, { leading: true, trailing: true }))
    //     .subscribe(() => {
    //       this.sendTypingSignal();
    //     });
    //   this.typingRxSubs.push(tsub);
    // } catch (err) {
    //   console.warn('Typing setup error', err);
    // }

    // await this.loadFromLocalStorage();
    // this.listenForMessages();
    // this.setupPinnedMessageListener();
    // this.checkMobileView();
    // setTimeout(() => this.scrollToBottom(), 100);
    // await this.loadInitialMessages();
    // this.loadReceiverProfile();
    // await this.checkIfBlocked();
    // this.startReceiverStatusPoll();
  }

  onInputTyping() {
    this.onInputChange();
    this.typingInput$.next();
    if (this.localTypingTimer) {
      clearTimeout(this.localTypingTimer);
    }
    this.localTypingTimer = setTimeout(() => {
      this.stopTypingSignal();
    }, 2500);
  }

  onInputBlurTyping() {
    this.stopTypingSignal();
  }

  private async sendTypingSignal() {
    try {
      await this.typingService.startTyping(this.roomId, this.senderId);
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

  // async ionViewWillEnter() {
  //   // console.log({chatTitle})
  //   // if (currentChat) {}
  //   //    try {
  //   //   this.pfUsersSub = this.chatService.platformUsers$.subscribe((users) => {
  //   //     // Normalize fields to be consistent with what ContactsPage does
  //   //     this.pfUsers = (users || []).map((u: any) => ({
  //   //       userId: u.userId ?? u.user_id ?? u.id ?? null,
  //   //       username: u.username ?? u.name ?? u.displayName ?? '',
  //   //       phoneNumber: u.phoneNumber ?? u.phone_number ?? '',
  //   //       avatar: u.avatar ?? u.profile ?? null,
  //   //       // isOnPlatform: !!u.isOnPlatform ?? true,
  //   //     }));
  //   //     console.log("this.pfUsers",this.pfUsers)
  //   //     // optional debug
  //   //     // console.log('pfUsers updated', this.pfUsers);
  //   //   });
  //   // } catch (err) {
  //   //   console.warn('Failed to subscribe to platform users', err);
  //   // }
  //   // const nameFromQuery =
  //   //   this.route.snapshot.queryParamMap.get('receiver_name');
  //   // this.receiver_name =
  //   //   nameFromQuery ||
  //   //   (await this.secureStorage.getItem('receiver_name')) ||
  //   //   '';
  //   // const rawId = this.route.snapshot.queryParamMap.get('receiverId') || '';
  //   // const chatTypeParam = this.route.snapshot.queryParamMap.get('isGroup');
  //   // const phoneFromQuery =
  //   //   this.route.snapshot.queryParamMap.get('receiver_phone');
  //   // this.chatType = chatTypeParam === 'true' ? 'group' : 'private';
  //   // if (this.chatType === 'group') {
  //   //   this.roomId = decodeURIComponent(rawId);
  //   //   try {
  //   //     const res = await this.chatService.fetchGroupWithProfiles(this.roomId);
  //   //     if (!res) return;
  //   //     const { groupName, groupMembers } = res;
  //   //     this.groupName = groupName;
  //   //     this.groupMembers = groupMembers;
  //   //   } catch (err) {
  //   //     console.warn('Failed to fetch group with profiles', err);
  //   //     this.groupName = 'Group';
  //   //     this.groupMembers = [];
  //   //   }
  //   //   this.setupTypingListener();
  //   // } else {
  //   //   this.receiverId = decodeURIComponent(rawId);
  //   //   this.roomId = this.getRoomId(this.senderId, this.receiverId);
  //   //   this.receiver_phone =
  //   //     phoneFromQuery || localStorage.getItem('receiver_phone') || '';
  //   //   localStorage.setItem('receiver_phone', this.receiver_phone);
  //   // }
  //   // await this.chatService.resetUnreadCount(this.roomId, this.senderId);
  //   // await this.markMessagesAsRead();
  //   // // await this.loadFromLocalStorage();
  //   // // this.listenForMessages();
  //   // const nav = this.router.getCurrentNavigation();
  //   // const state = nav?.extras?.state;
  //   // if (state && state['imageToSend']) {
  //   //   this.attachmentPath = state['imageToSend'];
  //   // }
  //   // this.loadReceiverProfile();
  // }

  async ionViewWillEnter() {
    await this.chatService.loadMessages();
    this.chatService.syncMessagesWithServer();
    this.chatService.getMessages().subscribe(async (msgs) => {
      console.log('Received for ui->', msgs);
      this.groupedMessages = (await this.groupMessagesByDate(
        msgs as any[]
      )) as any[];
    });
    this.currentConv = this.chatService.currentChat;
    Keyboard.setScroll({ isDisabled: false });
    this.senderId = this.authService.authData?.userId || '';
    this.sender_phone = this.authService.authData?.phone_number || '';
    this.sender_name = this.authService.authData?.name || '';
    const currentChat = this.chatService.currentChat;
    this.receiverProfile =
      (currentChat as any).avatar || (currentChat as any).groupAvatar || null;
    this.chatTitle = currentChat?.title || null;
  }

  async ionViewWillLeave() {
    try {
      this.chatService.closeChat();
      console.log('Chat is closed');
    } catch (error) {
      console.error('error in closing chat', error);
    }
  }

  loadReceiverProfile() {
    this.receiverId = this.route.snapshot.queryParamMap.get('receiverId') || '';
    if (!this.receiverId) return;

    if (this.chatType === 'group') {
      this.service.getGroupDp(this.receiverId).subscribe({
        next: (res: any) => {
          this.receiverProfile = res?.group_dp_url || null;
        },
        error: (err) => {
          console.error('❌ Error loading group profile:', err);
          this.receiverProfile = null;
        },
      });
    } else {
      this.service.getUserProfilebyId(this.receiverId).subscribe({
        next: (res: any) => {
          this.receiverProfile = res?.profile || null;
        },
        error: (err) => {
          console.error('❌ Error loading user profile:', err);
          this.receiverProfile = null;
        },
      });
    }
  }

  setDefaultAvatar(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/images/user.jfif';
  }

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
    if (option === 'Search') {
      this.showSearchBar = true;
      setTimeout(() => {
        const input = document.querySelector('ion-input');
        (input as HTMLIonInputElement)?.setFocus();
      }, 100);
      return;
    }

    if (option === 'View Contact') {
      const queryParams: any = {
        receiverId: this.receiverId,
        receiver_phone: this.receiver_phone,
        receiver_name: this.receiver_name,
        isGroup: false,
      };
      this.router.navigate(['/profile-screen'], { queryParams });
      return;
    }

    // ✅ NEW: Clear Chat Option
    if (option === 'clear chat') {
      //console.log("clear chat calls");
      await this.handleClearChat();
      return;
    }

    const groupId = this.receiverId;
    const userId = await this.secureStorage.getItem('userId');

    if (option === 'Group Info') {
      const queryParams: any = {
        receiverId: this.chatType === 'group' ? this.roomId : this.receiverId,
        receiver_phone: this.receiver_phone,
        receiver_name: this.receiver_name,
        isGroup: this.chatType === 'group',
      };
      this.router.navigate(['/profile-screen'], { queryParams });
    } else if (option === 'Add Members') {
      const memberPhones = this.groupMembers.map((member) => member.phone);
      this.router.navigate(['/add-members'], {
        queryParams: {
          groupId: groupId,
          members: JSON.stringify(memberPhones),
        },
      });
    } else if (option === 'Exit Group') {
      if (!this.roomId || !this.senderId) {
        console.error('Missing groupId or userId');
        return;
      }

      const db = getDatabase();
      const groupId = this.roomId;
      const userId = this.senderId;

      // 🟢 Confirmation Alert
      const alert = await this.alertCtrl.create({
        header: 'Exit Group',
        message: 'Are you sure you want to exit this group?',
        buttons: [
          { text: 'Cancel', role: 'cancel' },
          {
            text: 'Exit',
            handler: async () => {
              try {
                const memberPath = `groups/${groupId}/members/${userId}`;
                const pastMemberPath = `groups/${groupId}/pastmembers/${userId}`;

                const memberSnap = await get(ref(db, memberPath));
                if (!memberSnap.exists()) {
                  console.error('Member data not found');
                  return;
                }

                const memberData = memberSnap.val();
                const wasAdmin = memberData.role === 'admin';

                // ✅ Step 1: Move user to pastmembers
                const updatedMemberData = {
                  ...memberData,
                  status: 'inactive',
                  removedAt: new Date().toISOString(),
                };

                await set(ref(db, pastMemberPath), updatedMemberData);
                await remove(ref(db, memberPath));

                // ✅ Step 2: If user was admin, assign a new random admin
                if (wasAdmin) {
                  const membersSnap = await get(
                    ref(db, `groups/${groupId}/members`)
                  );
                  if (membersSnap.exists()) {
                    const members = membersSnap.val();
                    const memberIds = Object.keys(members);

                    if (memberIds.length > 0) {
                      const randomId =
                        memberIds[Math.floor(Math.random() * memberIds.length)];
                      await update(
                        ref(db, `groups/${groupId}/members/${randomId}`),
                        {
                          role: 'admin',
                        }
                      );
                      //console.log(`👑 New admin assigned: ${randomId}`);
                    }
                  }
                }

                // ✅ Toast + navigate
                const toast = await this.toastCtrl.create({
                  message: 'You exited the group',
                  duration: 2000,
                  color: 'medium',
                });
                toast.present();

                this.router.navigate(['/home-screen']);
              } catch (error) {
                console.error('Error exiting group:', error);
                const toast = await this.toastCtrl.create({
                  message: 'Failed to exit group',
                  duration: 2000,
                  color: 'danger',
                });
                toast.present();
              }
            },
          },
        ],
      });

      await alert.present();
    }
  }

  private async handleClearChat() {
    try {
      const userId = await this.authService.authData?.userId;
      //console.log("userID sdsdfgsdgsdfgertgryrtytr", userId);
      if (!userId) return;

      // Show confirmation alert
      const alert = await this.alertCtrl.create({
        header: 'Clear Chat',
        message:
          'Are you sure you want to clear all messages? This cannot be undone.',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Clear',
            handler: async () => {
              await this.clearChatMessages(userId);
            },
          },
        ],
      });

      await alert.present();
    } catch (error) {
      console.error('Error in handleClearChat:', error);
    }
  }

  // ✅ Clear Chat Implementation (Soft Delete)
  private async clearChatMessages(userId: string) {
    try {
      const roomId =
        this.chatType === 'group'
          ? this.receiverId
          : this.getRoomId(userId, this.receiverId);

      if (!roomId) {
        console.error('Room ID not found');
        return;
      }

      await this.chatService.deleteChatForUser(roomId, userId);

      // Clear local messages array (UI ko refresh karne ke liye)
      this.messages = [];

      // Show success toast
      const toast = await this.toastCtrl.create({
        message: 'Chat cleared successfully',
        duration: 2000,
        color: 'success',
      });
      await toast.present();

      //console.log('✅ Chat cleared for user:', userId);
    } catch (error) {
      console.error('❌ Error clearing chat:', error);

      const toast = await this.toastCtrl.create({
        message: 'Failed to clear chat',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
    }
  }

  async checkIfBlocked() {
    this.senderId = this.authService.authData?.userId || this.senderId;
    if (!this.senderId || !this.receiverId) return;

    const db = getDatabase();

    try {
      if (this.iBlockedRef) off(this.iBlockedRef);
      if (this.theyBlockedRef) off(this.theyBlockedRef);
    } catch (e) {
      /* ignore */
    }

    this.iBlockedRef = ref(
      db,
      `blockedContacts/${this.senderId}/${this.receiverId}`
    );
    this.theyBlockedRef = ref(
      db,
      `blockedContacts/${this.receiverId}/${this.senderId}`
    );

    const unsubA = onValue(this.iBlockedRef, (snap) => {
      const exists = snap.exists();
      this.zone.run(() => {
        if (this._iBlockedLoaded && exists !== this.iBlocked) {
          if (exists) {
            clearTimeout(this.blockBubbleTimeout);
            this.showBlockBubble = true;
            this.showUnblockBubble = false;
            setTimeout(() => this.scrollToBottom(), 120);
          } else {
            this.showBlockBubble = false;
            this.showUnblockBubble = true;
            clearTimeout(this.blockBubbleTimeout);
            this.blockBubbleTimeout = setTimeout(() => {
              this.showUnblockBubble = false;
            }, 3000);
          }
        }
        this.iBlocked = exists;
        this._iBlockedLoaded = true;
      });
    });

    const unsubB = onValue(this.theyBlockedRef, (snap) => {
      const exists = snap.exists();
      this.zone.run(() => {
        this.theyBlocked = exists;
        this._theyBlockedLoaded = true;
      });
    });

    this.onValueUnsubs.push(() => {
      try {
        unsubA();
      } catch (e) {}
    });
    this.onValueUnsubs.push(() => {
      try {
        unsubB();
      } catch (e) {}
    });
  }

  async unblockFromChat() {
    try {
      const db = getDatabase();
      await remove(
        ref(db, `blockedContacts/${this.senderId}/${this.receiverId}`)
      );
      this.showBlockBubble = false;
      this.showUnblockBubble = true;
      clearTimeout(this.blockBubbleTimeout);
      this.blockBubbleTimeout = setTimeout(() => {
        this.showUnblockBubble = false;
      }, 3000);
    } catch (err) {
      console.error('Unblock failed', err);
      const t = await this.toastCtrl.create({
        message: 'Failed to unblock',
        duration: 2000,
        color: 'danger',
      });
      t.present();
    }
  }

  async deleteChat() {
    try {
      const db = getDatabase();
      await remove(ref(db, `chats/${this.roomId}`));
      localStorage.removeItem(this.roomId);
      const t = await this.toastCtrl.create({
        message: 'Chat deleted',
        duration: 1500,
        color: 'danger',
      });
      t.present();
      setTimeout(() => this.router.navigate(['/home-screen']), 800);
    } catch (err) {
      console.error('deleteChat failed', err);
      const t = await this.toastCtrl.create({
        message: 'Failed to delete chat',
        duration: 2000,
        color: 'danger',
      });
      t.present();
    }
  }

  onSearchInput() {
    const elements = Array.from(
      document.querySelectorAll('.message-text')
    ) as HTMLElement[];

    elements.forEach((el) => {
      el.innerHTML = el.textContent || '';
      el.style.backgroundColor = 'transparent';
    });

    if (!this.searchText.trim()) {
      this.matchedMessages = [];
      this.currentSearchIndex = -1;
      return;
    }

    const regex = new RegExp(`(${this.escapeRegExp(this.searchText)})`, 'gi');

    this.matchedMessages = [];

    elements.forEach((el) => {
      const originalText = el.textContent || '';
      if (regex.test(originalText)) {
        const highlightedText = originalText.replace(
          regex,
          `<mark style="background: yellow;">$1</mark>`
        );
        el.innerHTML = highlightedText;
        this.matchedMessages.push(el);
      }
    });

    this.currentSearchIndex = this.matchedMessages.length ? 0 : -1;

    if (this.currentSearchIndex >= 0) {
      this.matchedMessages[this.currentSearchIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }

  navigateSearch(direction: 'up' | 'down') {
    if (!this.matchedMessages.length) return;
    if (direction === 'up') {
      this.currentSearchIndex =
        (this.currentSearchIndex - 1 + this.matchedMessages.length) %
        this.matchedMessages.length;
    } else {
      this.currentSearchIndex =
        (this.currentSearchIndex + 1) % this.matchedMessages.length;
    }
    this.highlightMessage(this.currentSearchIndex);
  }

  highlightMessage(index: number) {
    this.matchedMessages.forEach((el) => {
      const originalText = el.textContent || '';
      el.innerHTML = originalText;
      el.style.backgroundColor = 'transparent';
    });

    if (!this.searchText.trim()) return;

    const regex = new RegExp(`(${this.escapeRegExp(this.searchText)})`, 'gi');

    this.matchedMessages.forEach((el) => {
      const originalText = el.textContent || '';
      const highlightedText = originalText.replace(
        regex,
        `<mark style="background: yellow;">$1</mark>`
      );
      el.innerHTML = highlightedText;
    });

    const target = this.matchedMessages[index];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  cancelSearch() {
    this.searchText = '';
    this.showSearchBar = false;
    this.matchedMessages.forEach((el) => {
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

    const formattedDate = `${day}/${month}/${year}`;

    this.selectedDate = event.detail.value;
    this.showPopover = false;
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

  openDatePicker() {
    this.showDateModal = true;
    //console.log('Opening calendar modal...');
  }

  onMessagePress(message: any) {
    const index = this.selectedMessages.findIndex((m) => m.key === message.key);
    if (index > -1) {
      this.selectedMessages.splice(index, 1);
    } else {
      this.selectedMessages.push(message);
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

  startLongPress(msg: any) {
    this.longPressTimeout = setTimeout(() => {
      this.onLongPress(msg);
    }, 1000);
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
    const index = this.selectedMessages.findIndex(
      (m) => m.message_id === msg.message_id
    );
    if (index > -1) {
      this.selectedMessages.splice(index, 1);
    } else {
      this.selectedMessages.push(msg);
    }

    this.lastPressedMessage = msg;
  }

  isSelected(msg: any) {
    return this.selectedMessages.some((m) => m.message_id === msg.message_id);
  }

  isQuickReactionOpen(msg: any) {
    return (
      this.selectedMessages.some((m) => m.message_id === msg.message_id) &&
      this.selectedMessages.length === 1
    );
  }

  isOnlyOneTextMessage(): boolean {
    return (
      this.selectedMessages.length === 1 &&
      this.selectedMessages[0].type === 'text'
    );
  }

  isMultipleTextMessages(): boolean {
    return (
      this.selectedMessages.length > 1 &&
      this.selectedMessages.every((msg) => msg.type === 'text')
    );
  }

  isOnlyOneAttachment(): boolean {
    return (
      this.selectedMessages.length === 1 &&
      this.selectedMessages[0].type !== 'text'
    );
  }

  isMultipleAttachments(): boolean {
    return (
      this.selectedMessages.length > 1 &&
      this.selectedMessages.every((msg) => msg.type !== 'text')
    );
  }

  isMixedSelection(): boolean {
    const types = this.selectedMessages.map((msg) => msg.type);
    return types.includes('text') && types.some((t) => t !== 'text');
  }

  async copySelectedMessages() {
    if (this.lastPressedMessage?.text) {
      await Clipboard.write({ string: this.lastPressedMessage.text });
      //console.log('Text copied to clipboard:', this.lastPressedMessage.text);
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
    this.selectedMessages = [];
    this.lastPressedMessage = null;

    setTimeout(() => {
      const inputElement = document.querySelector(
        'ion-textarea'
      ) as HTMLIonTextareaElement;
      if (inputElement) {
        inputElement.setFocus();
      }
    }, 100);
  }

  cancelReply() {
    this.replyToMessage = null;
  }

  getRepliedMessage(
    replyToMessageId: string
  ): (IMessage & { attachment?: IAttachment; fadeOut: boolean }) | null {
    const msg =
      this.allMessages.find((msg) => {
        return msg.msgId == replyToMessageId;
      }) || null;
    return msg;
  }

  getReplyPreviewText(message: any): string {
    if (message.text) {
      return message.text.length > 50
        ? message.text.substring(0, 50) + '...'
        : message.text;
    } else if (message.attachment) {
      const type = (message.attachment as any).type;
      switch (type) {
        case 'image':
          return '📷 Photo';
        case 'video':
          return '🎥 Video';
        case 'audio':
          return '🎵 Audio';
        case 'file':
          return '📄 Document';
        default:
          return '📎 Attachment';
      }
    }
    return 'Message';
  }

  scrollToRepliedMessage(replyToMessageId: string) {
    let targetElement: HTMLElement | any;

    const messageElements = document.querySelectorAll('[data-msg-key]');

    this.allMessages.forEach((msg) => {
      if (msg.msgId === replyToMessageId) {
        const element = Array.from(messageElements).find(
          (el) => el.getAttribute('data-msg-key') === msg.msgId
        );
        if (element && element instanceof HTMLElement) {
          targetElement = element;
        }
      }
    });

    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      targetElement.classList.add('highlight-message');
      setTimeout(() => {
        targetElement?.classList.remove('highlight-message');
      }, 2000);
    }
  }

  async deleteSelectedMessages() {
    if (!this.selectedMessages || this.selectedMessages.length === 0) {
      return;
    }

    const currentUserId = this.senderId;
    const count = this.selectedMessages.length;

    // Build preview text
    let preview = '';
    if (count === 1) {
      const m = this.selectedMessages[0];
      if (m.text && m.text.trim())
        preview =
          m.text.length > 120 ? m.text.substring(0, 120) + '...' : m.text;
      else preview = this.getAttachmentPreview(m.attachment || {});
    } else {
      preview = `${count} messages`;
    }

    // Always offer both options. Default to 'Delete for me'
    const inputs: any[] = [
      {
        name: 'choice',
        type: 'radio',
        label: 'Delete for me',
        value: 'forMe',
        checked: true,
      },
      {
        name: 'choice',
        type: 'radio',
        label: 'Delete for everyone',
        value: 'forEveryone',
        checked: false,
      },
    ];

    const alert = await this.alertCtrl.create({
      header: 'Delete messages?',
      cssClass: 'delete-confirm-alert',
      inputs,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'OK',
          handler: async (selectedValue: any) => {
            let choice: string = '';
            if (typeof selectedValue === 'string') {
              choice = selectedValue;
            } else if (
              Array.isArray(selectedValue) &&
              selectedValue.length > 0
            ) {
              choice = selectedValue[0];
            } else if (selectedValue && typeof selectedValue === 'object') {
              const keys = Object.keys(selectedValue).filter(
                (k) => selectedValue[k]
              );
              choice = keys[0] || '';
            }

            const doForMe = choice === 'forMe';
            const doForEveryone = choice === 'forEveryone';

            if (!doForMe && !doForEveryone) return;

            try {
              const db = getDatabase();

              // trigger fade-out on UI messages
              this.selectedMessages.forEach((msg) => (msg.fadeOut = true));

              // dismiss the alert first, then wait for fade-out duration before removing from arrays
              try {
                await alert.dismiss();
              } catch (e) {
                // ignore
              }

              await new Promise<void>((resolve) => {
                setTimeout(async () => {
                  try {
                    this.allMessages = this.allMessages.filter(
                      (m) => !m.fadeOut
                    );
                    this.displayedMessages = this.displayedMessages.filter(
                      (m) => !m.fadeOut
                    );
                    this.groupedMessages = await this.groupMessagesByDate(
                      this.displayedMessages
                    );
                    this.saveToLocalStorage();
                  } catch (e) {
                    console.error('fade-out removal failed', e);
                  } finally {
                    resolve();
                  }
                }, 1100); // match CSS transition duration
              });

              // Now apply deletions to server/db for each selected message
              for (const msg of [...this.selectedMessages]) {
                const key = msg.key;
                if (!key) continue;

                // DELETE FOR ME: mark deleted for this user
                if (doForMe) {
                  try {
                    if (this.chatService.deleteMessageForMe) {
                      await this.chatService.deleteMessageForMe(
                        this.roomId,
                        key,
                        currentUserId
                      );
                    } else {
                      const updates: any = {};
                      updates[
                        `/chats/${this.roomId}/${key}/deletedFor/${currentUserId}`
                      ] = true;
                      await update(ref(db), updates);
                    }
                  } catch (err) {
                    console.warn('deleteForMe failed for key', key, err);
                  }
                }

                // DELETE FOR EVERYONE: attempt for all messages (not restricted to sender)
                if (doForEveryone) {
                  try {
                    if (this.chatService.deleteMessageForEveryone) {
                      // try service method (best)
                      await this.chatService.deleteMessageForEveryone(
                        this.roomId,
                        key,
                        currentUserId,
                        this.chatType === 'group'
                          ? this.groupMembers.map((g) => String(g.user_id))
                          : [this.receiverId, this.senderId]
                      );
                    } else {
                      // fallback: set convenience flags in DB so clients hide the message
                      const updates: any = {};
                      updates[
                        `/chats/${this.roomId}/${key}/deletedForEveryone`
                      ] = true;
                      updates[`/chats/${this.roomId}/${key}/deletedBy`] =
                        currentUserId;
                      updates[`/chats/${this.roomId}/${key}/deletedAt`] =
                        Date.now();
                      // optionally clear content:
                      // updates[`/chats/${this.roomId}/${key}/text`] = '';
                      // updates[`/chats/${this.roomId}/${key}/attachment`] = null;
                      await update(ref(db), updates);
                    }
                  } catch (err) {
                    console.warn('deleteForEveryone failed for key', key, err);
                  }
                }
              }

              const toast = await this.toastCtrl.create({
                message: doForEveryone
                  ? 'Deleted for everyone'
                  : 'Deleted for you',
                duration: 1600,
                color: 'medium',
              });
              await toast.present();

              this.selectedMessages = [];
              this.lastPressedMessage = null;
            } catch (e) {
              console.error('deleteSelectedMessages handler err', e);
              const t = await this.toastCtrl.create({
                message: 'Failed to delete messages',
                duration: 2000,
                color: 'danger',
              });
              t.present();
            }
          },
        },
      ],
    });

    await alert.present();
  }

  private applyDeletionFilters(dm: Message): boolean {
    try {
      // deletedForEveryone shortcut
      if (dm.deletedForEveryone) return true;

      // per-user deletion
      if (
        dm.deletedFor &&
        this.senderId &&
        dm.deletedFor[String(this.senderId)]
      ) {
        return true;
      }

      // optional: if isDeleted flag you might want to show placeholder instead of hiding
      // if you prefer placeholder, return false here and handle `isDeleted` in template.
      return false;
    } catch (e) {
      console.warn('applyDeletionFilters error', e);
      return false;
    }
  }

  onForward() {
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
        message: this.lastPressedMessage,
        currentUserId: this.senderId,
      },
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
        this.messageInfo();
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

  async messageInfo() {
    // pick the message: prefer lastPressedMessage then fallback to first selectedMessages
    const msg =
      this.lastPressedMessage ||
      (this.selectedMessages && this.selectedMessages[0]);
    if (!msg) {
      const t = await this.toastCtrl.create({
        message: 'No message selected',
        duration: 1500,
        color: 'medium',
      });
      await t.present();
      return;
    }

    try {
      // store selected message in the chat service (mirror of forward behaviour)
      // Implement setSelectedMessageInfo in FirebaseChatService (see snippet below)
      this.chatService.setSelectedMessageInfo(msg);

      // clear UI selection state
      this.selectedMessages = [];
      this.lastPressedMessage = null;

      // navigate to message-info page — you can choose queryParams or router state.
      // I'll use the same approach you used for forward (route path), but pass the messageId/key
      // so message-info page can fetch or read from chatService.
      this.router.navigate(['/message-info'], {
        queryParams: {
          // pass a small identifier; page can request the full object from chatService
          messageKey: msg.key || msg.message_id || '',
        },
      });
    } catch (err) {
      console.error('messageInfo error', err);
      const t = await this.toastCtrl.create({
        message: 'Failed to open message info',
        duration: 1500,
        color: 'danger',
      });
      await t.present();
    }
  }

  async editMessage(message: Message) {
    const alert = await this.alertCtrl.create({
      header: 'Edit Message',
      inputs: [
        {
          name: 'text',
          type: 'text',
          value: message.text,
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Save',
          handler: async (data: any) => {
            if (data.text && data.text.trim() !== '') {
              const encryptedText = await this.encryptionService.encrypt(
                data.text.trim()
              );

              const db = getDatabase();
              const msgRef = ref(db, `chats/${this.roomId}/${message.key}`);

              await update(msgRef, {
                text: encryptedText,
                isEdit: true,
              });

              message.text = data.text.trim();
              message.isEdit = true;

              this.lastPressedMessage = { ...message };
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async copyMessage() {
    if (this.lastPressedMessage?.text) {
      await Clipboard.write({ string: this.lastPressedMessage.text });
      this.selectedMessages = [];
      this.lastPressedMessage = null;
    }
  }

  shareMessage() {
    //console.log('Share clicked for attachment:', this.lastPressedMessage);
  }

  pinMessage() {
    const pin: PinnedMessage = {
      messageId: this.lastPressedMessage?.message_id as string,
      key: this.lastPressedMessage?.key,
      pinnedAt: Date.now(),
      pinnedBy: this.senderId,
      roomId: this.roomId,
      scope: 'global',
    };
    this.chatService.pinMessage(pin);
    this.selectedMessages = [];
    this.lastPressedMessage = null;
  }

  setupPinnedMessageListener() {
    this.pinnedMessageSubscription = this.chatService.listenToPinnedMessage(
      this.roomId,
      (pinnedMessage) => {
        this.pinnedMessage = pinnedMessage;
        if (pinnedMessage) {
          this.findPinnedMessageDetails(pinnedMessage.key);
        } else {
          this.pinnedMessageDetails = null;
        }
      }
    );
  }

  findPinnedMessageDetails(messageId: string) {
    for (const group of this.groupedMessages) {
      const foundMessage = group.messages.find(
        (msg) => msg.message_id === messageId
      );
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
      const element = document.querySelector(
        `[data-msg-key="${this.pinnedMessageDetails.key}"]`
      );
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('highlighted');
        setTimeout(() => element.classList.remove('highlighted'), 2000);
      }
    }
  }

  checkMobileView() {
    this.showMobilePinnedBanner = window.innerWidth < 480;
  }

  openChatInfo() {
    //console.log('Opening chat info');
  }

  async loadInitialMessages() {
    this.isLoadingMore = true;
    try {
      await this.loadFromLocalStorage();
      await this.loadMessagesFromFirebase(false);
    } catch (error) {
      console.error('Error loading initial messages:', error);
    } finally {
      this.isLoadingMore = false;
    }
  }

  getAttachmentIcon(type: string): string {
    switch (type) {
      case 'image':
        return 'image-outline';
      case 'video':
        return 'videocam-outline';
      case 'audio':
        return 'musical-note-outline';
      case 'file':
        return 'document-outline';
      default:
        return 'attach-outline';
    }
  }

  private setupTypingListener() {
    try {
      const db = getDatabase();

      try {
        if (this.typingUnsubscribe) this.typingUnsubscribe();
      } catch (e) {}

      const unsubscribe = onValue(
        dbRef(db, `typing/${this.roomId}`),
        (snap) => {
          const val = snap.val() || {};
          const now = Date.now();

          const entries = Object.keys(val).map((k) => ({
            userId: k,
            typing: val[k]?.typing ?? false,
            lastUpdated: val[k]?.lastUpdated ?? 0,
            name: val[k]?.name ?? null,
          }));

          const recent = entries.filter(
            (e) =>
              e.userId !== this.senderId &&
              e.typing &&
              now - (e.lastUpdated || 0) < 10000
          );

          this.typingCount = recent.length;

          if (this.chatType === 'private') {
            if (recent.length === 0) {
              this.typingUsers = [];
              this.typingFrom = null;
              return;
            }
            const other = recent[0];
            this.typingUsers = [
              {
                userId: other.userId,
                name: other.name || `User ${other.userId}`,
                avatar: 'assets/images/default-avatar.png',
              },
            ];
            this.typingFrom = this.typingUsers[0].name || null;
            return;
          }

          const usersForDisplay: {
            userId: string;
            name: string | null;
            avatar: string | null;
          }[] = [];

          recent.forEach((e) => {
            let member = this.groupMembers.find(
              (m) => String(m.user_id) === String(e.userId)
            );
            if (!member) {
              member = this.groupMembers.find(
                (m) =>
                  m.phone_number && String(m.phone_number) === String(e.userId)
              );
            }

            const avatar = member?.avatar || null;
            const displayName = member?.name || e.name || e.userId;

            usersForDisplay.push({
              userId: e.userId,
              name: displayName,
              avatar: avatar || 'assets/images/default-avatar.png',
            });
          });

          const uniq: { [k: string]: boolean } = {};
          this.typingUsers = usersForDisplay.filter((u) => {
            if (uniq[u.userId]) return false;
            uniq[u.userId] = true;
            return true;
          });

          this.typingFrom = this.typingUsers.length
            ? this.typingUsers[0].name
            : null;
        }
      );

      this.typingUnsubscribe = () => {
        try {
          unsubscribe();
        } catch (e) {}
      };
      this.onValueUnsubs.push(this.typingUnsubscribe);
    } catch (err) {
      console.warn('setupTypingListener error', err);
    }
  }

  //for minimal rerendering
  trackByMessageId(index: number, message: any): string {
    return message.msgId;
  }

  async ngAfterViewInit() {
    if (this.ionContent) {
      this.ionContent.ionScroll.subscribe(async (event: any) => {
        if (
          event.detail.scrollTop < 20 &&
          this.chatService.hasMoreMessages &&
          !this.isLoadingMore
        ) {
          await this.chatService.loadMessages();
          // await this.loadMoreMessages();
        } else {
          console.log('Not more messages');
        }
      });
    }

    this.setDynamicPadding();
    window.addEventListener('resize', this.resizeHandler);

    const footer = this.el.nativeElement.querySelector(
      '.footer-fixed'
    ) as HTMLElement;
    if (footer && 'ResizeObserver' in window) {
      const ro = new (window as any).ResizeObserver(() =>
        this.setDynamicPadding()
      );
      ro.observe(footer);
      (this as any)._ro = ro;
    }
  }

  async loadMoreMessages() {
    if (this.isLoadingMore || !this.hasMoreMessages) {
      return;
    }

    this.isLoadingMore = true;
    const currentScrollHeight =
      this.scrollContainer?.nativeElement?.scrollHeight || 0;

    try {
      await this.loadMessagesFromFirebase(true);

      setTimeout(() => {
        if (this.scrollContainer?.nativeElement) {
          const newScrollHeight =
            this.scrollContainer.nativeElement.scrollHeight;
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
    // this.messageSub?.unsubscribe();
    // this.messageSub = this.chatService
    //   .getMessages()
    //   .subscribe(async (newMessages: any) => {
    //     if (!Array.isArray(newMessages)) return;
    //     const decryptPromises = newMessages.map((msg) =>
    //       this.encryptionService
    //         .decrypt(msg.text || '')
    //         .then((dt) => ({ msg, decryptedText: dt }))
    //         .catch((err) => {
    //           console.warn('decrypt msg.text failed for key', msg.key, err);
    //           return { msg, decryptedText: '' };
    //         })
    //     );
    //     const decryptedPairs = await Promise.all(decryptPromises);
    //     const existingById: Record<string, number> = {};
    //     this.allMessages.forEach((m, i) => {
    //       if (m.msgId) existingById[String(m.msgId)] = i;
    //     });
    //     for (const pair of decryptedPairs) {
    //       const msg = pair.msg;
    //       const serverKey = msg.key || null;
    //       const messageId = msg.message_id || uuidv4();
    //       const dm: Message = {
    //         ...msg,
    //         key: serverKey,
    //         message_id: messageId,
    //         text: pair.decryptedText,
    //         reactions: msg.reactions || {}, // ✅ Ensure reactions are included
    //       };
    //       if (dm.attachment && (dm.attachment as any).caption) {
    //         try {
    //           const encCap = (dm.attachment as any).caption;
    //           if (encCap && typeof encCap === 'string') {
    //             const captionPlain = await this.encryptionService.decrypt(
    //               encCap
    //             );
    //             (dm.attachment as any).caption = captionPlain;
    //           }
    //         } catch (err) {
    //           console.warn(
    //             'Failed to decrypt attachment.caption for message_id',
    //             messageId,
    //             err
    //           );
    //         }
    //       }
    //       if (this.applyDeletionFilters(dm)) {
    //         if (existingById[String(messageId)] !== undefined) {
    //           const idx = existingById[String(messageId)];
    //           this.allMessages[idx] = { ...this.allMessages[idx], ...dm };
    //         }
    //         continue;
    //       }
    //       const existingIndex = existingById[String(messageId)];
    //       if (existingIndex !== undefined) {
    //         const old = this.allMessages[existingIndex];
    //         const merged: Message = {
    //           ...old,
    //           ...dm,
    //           key: dm.key || old.key,
    //           reactions: dm.reactions || old.reactions || {}, // ✅ Merge reactions
    //         };
    //         if ((old as any).localOnly !== undefined)
    //           (merged as any).localOnly = (old as any).localOnly;
    //         if ((old as any).isLocallyEdited !== undefined)
    //           (merged as any).isLocallyEdited = (old as any).isLocallyEdited;
    //         this.allMessages[existingIndex] = merged;
    //       } else {
    //         this.allMessages.push(dm);
    //         existingById[String(messageId)] = this.allMessages.length - 1;
    //       }
    //       if (dm.receiver_id === this.senderId && !dm.read) {
    //         try {
    //           await this.chatService.markRead(this.roomId, dm.key);
    //           await this.chatService.resetUnreadCount(
    //             this.roomId,
    //             this.senderId
    //           );
    //         } catch (err) {
    //           console.warn('markRead/resetUnreadCount failed', err);
    //         }
    //       }
    //     }
    //     const seenIds: Record<string, boolean> = {};
    //     this.allMessages = this.allMessages.filter((m) => {
    //       const id = String(m.message_id || '');
    //       if (!id) return true;
    //       if (seenIds[id]) return false;
    //       seenIds[id] = true;
    //       return true;
    //     });
    //     this.allMessages.sort((a, b) => {
    //       const ta =
    //         Number(a.timestamp) || new Date(a.timestamp || 0).getTime();
    //       const tb =
    //         Number(b.timestamp) || new Date(b.timestamp || 0).getTime();
    //       return ta - tb;
    //     });
    //     const visibleAllMessages = this.allMessages.filter(
    //       (m) => !this.applyDeletionFilters(m)
    //     );
    //     const keepCount = Math.max(
    //       this.limit || 50,
    //       this.displayedMessages?.length || 0
    //     );
    //     const startIdx = Math.max(0, visibleAllMessages.length - keepCount);
    //     this.displayedMessages = visibleAllMessages.slice(startIdx);
    //     this.groupedMessages = await this.groupMessagesByDate(
    //       this.displayedMessages
    //     );
    //     this.saveToLocalStorage();
    //     if (this.pinnedMessage) {
    //       this.findPinnedMessageDetails(this.pinnedMessage.key);
    //     }
    //     await Promise.resolve();
    //     this.scrollToBottom();
    //     this.observeVisibleMessages();
    //   });
  }

  private async markDisplayedMessagesAsRead() {
    const unreadMessages = this.displayedMessages.filter(
      (msg) => !msg.read && msg.receiver_id === this.senderId
    );

    for (const msg of unreadMessages) {
      await this.chatService.markRead(this.roomId, msg.key);
    }
  }

  observeVisibleMessages() {
    const allMessageElements = document.querySelectorAll('[data-msg-key]');

    allMessageElements.forEach((el: any) => {
      const msgKey = el.getAttribute('data-msg-key');
      const msgIndex = this.displayedMessages.findIndex(
        (m) => m.key === msgKey
      );
      if (msgIndex === -1) return;

      const msg = this.displayedMessages[msgIndex];

      if (!msg.read && msg.receiver_id === this.senderId) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                this.chatService.markRead(this.roomId, msgKey);
                observer.unobserve(entry.target);
              }
            });
          },
          {
            threshold: 1.0,
          }
        );

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

      const hours = timestamp.getHours();
      const minutes = timestamp.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
      (msg as any).time = `${formattedHours}:${formattedMinutes} ${ampm}`;

      if (msg.attachment) {
        const currentUserId = this.authService.authData?.userId;
        const receiverId = msg.receiver_id;

        if (receiverId === currentUserId) {
          (async () => {
            try {
              const apiResponse = await firstValueFrom(
                this.service.getDownloadUrl(
                  (msg.attachment as any).mediaId as string
                )
              );

              if (apiResponse.status && apiResponse.downloadUrl) {
                const response = await fetch(apiResponse.downloadUrl);
                const blob = await response.blob();
                const extension =
                  (msg.attachment as any).fileName?.split('.').pop() || 'dat';
                const filename = `${
                  (msg.attachment as any).mediaId
                }.${extension}`;
                const file_Path = await this.FileService.saveFileToReceived(
                  filename,
                  blob
                );
                // await this.sqliteService.saveAttachment(
                //   this.roomId,
                //   (msg.attachment as any).type,
                //   file_Path,
                //   (msg.attachment as any).mediaId as string
                // );
              }
            } catch (error) {
              console.error('Error handling received attachment:', error);
            }
          })();
        }

        // (msg.attachment as any).previewUrl = await this.sqliteService.getAttachmentPreview(
        //   (msg.attachment as any).mediaId as string
        // );
      }

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

    return Object.keys(grouped).map((date) => ({
      date,
      messages: grouped[date],
    }));
  }

  isLoadingIndicatorVisible(): boolean {
    return this.isLoadingMore;
  }

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
      const recentMessages = rawMessages.slice(-this.limit * 3);

      const decryptedMessages = await Promise.all(
        recentMessages.map(async (msg: any) => {
          let decryptedText = '';
          try {
            decryptedText = await this.encryptionService.decrypt(
              msg.text || ''
            );
          } catch (e) {
            console.warn('decrypt cached message.text failed', e);
            decryptedText = '';
          }

          // decrypt cached attachment caption if present
          if (msg.attachment && msg.attachment.caption) {
            try {
              const captionPlain = await this.encryptionService.decrypt(
                msg.attachment.caption
              );
              msg.attachment.caption = captionPlain; // overwrite with plaintext
            } catch (e) {
              console.warn('decrypt cached attachment caption failed', e);
            }
          }

          return { ...msg, text: decryptedText } as Message;
        })
      );

      // Filter out messages that are deleted for this user (or globally)
      const visibleMessages = decryptedMessages.filter(
        (m) => !this.applyDeletionFilters(m)
      );

      this.allMessages = visibleMessages;
      this.displayedMessages = visibleMessages.slice(-this.limit);
      this.groupedMessages = await this.groupMessagesByDate(
        this.displayedMessages
      );

      if (visibleMessages.length > 0) {
        this.lastMessageKey = visibleMessages[0].key;
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
    if (this.isSending) return;

    this.isSending = true;

    try {
      const plainText = this.messageText.trim();
      const localMessage: Partial<IMessage & { attachment?: IAttachment }> = {
        sender: this.senderId,
        text: plainText,
        timestamp: Date.now(),
        msgId: uuidv4(),
        replyToMsgId: this.replyToMessage?.message_id || '',
        isEdit: false,
        type: 'text',
        reactions: [],
      };

      if (this.selectedAttachment) {
        try {
          const mediaId = await this.uploadAttachmentToS3(
            this.selectedAttachment
          );

          localMessage.attachment = {
            type: this.selectedAttachment.type,
            mediaId: mediaId,
            fileName: this.selectedAttachment.fileName,
            mimeType: this.selectedAttachment.mimeType,
            fileSize: this.selectedAttachment.fileSize,
            caption: plainText, // send encrypted caption
          };

          const file_path = await this.FileService.saveFileToSent(
            this.selectedAttachment.fileName,
            this.selectedAttachment.blob
          );
        } catch (error) {
          console.error('Failed to upload attachment:', error);
          const toast = await this.toastCtrl.create({
            message: 'Failed to upload attachment. Please try again.',
            duration: 3000,
            color: 'danger',
          });
          await toast.present();
          return;
        }
      }

      await this.chatService.sendMessage(localMessage);
      // clear UI state
      this.messageText = '';
      this.selectedAttachment = null;
      this.showPreviewModal = false;
      this.replyToMessage = null;
      await this.stopTypingSignal();
      this.scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      const toast = await this.toastCtrl.create({
        message: 'Failed to send message. Please try again.',
        duration: 3000,
        color: 'danger',
      });
      await toast.present();
    } finally {
      this.isSending = false;
    }
  }

  //user online or offline logic
  startReceiverStatusPoll(pollIntervalMs = 30000) {
    if (!this.receiverId) return;

    // immediate fetch, then periodic
    this.presence
      .getStatus(Number(this.receiverId))
      .subscribe((res) => this.handleStatusResponse(res));
    // Start polling while view is active:
    this.statusPollSub = timer(pollIntervalMs, pollIntervalMs)
      .pipe(switchMap(() => this.presence.getStatus(Number(this.receiverId))))
      .subscribe((res) => this.handleStatusResponse(res));
  }

  handleStatusResponse(res: any) {
    if (!res || !res.data) {
      this.receiverOnline = false;
      this.receiverLastSeen = null;
      return;
    }
    this.receiverOnline = Number(res.data.is_online) === 1;
    this.receiverLastSeen = res.data.last_seen
      ? this.formatLastSeen(res.data.last_seen)
      : null;
  }

  formatLastSeen(ts: string | null) {
    if (!ts) return '';
    const d = new Date(ts); // make sure server returns parseable ISO or 'YYYY-MM-DD hh:mm:ss'
    // simple formatting — adjust to locale
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    if (sameDay) {
      return `Today at, ${d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    }
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    }
    return d.toLocaleString([], {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
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
            fileName: attachment.fileName,
          }
        )
      );

      if (!uploadResponse?.status || !uploadResponse.upload_url) {
        throw new Error('Failed to get upload URL');
      }

      const uploadResult = await firstValueFrom(
        this.service.uploadToS3(
          uploadResponse.upload_url,
          this.blobToFile(
            attachment.blob,
            attachment.fileName,
            attachment.mimeType
          )
        )
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
      const localUrl = await this.FileService.getFilePreview(
        `${msg.sender_id === this.senderId ? 'sent' : 'received'}/${
          msg.attachment.fileName
        }`
      );

      if (localUrl) {
        attachmentUrl = localUrl;
      } else {
        const downloadResponse = await firstValueFrom(
          this.service.getDownloadUrl(msg.attachment.mediaId)
        );

        if (downloadResponse?.status && downloadResponse.downloadUrl) {
          attachmentUrl = downloadResponse.downloadUrl;

          if (msg.sender_id !== this.senderId) {
            this.downloadAndSaveLocally(
              downloadResponse.downloadUrl,
              msg.attachment.fileName
            );
          }
        }
      }

      const modal = await this.modalCtrl.create({
        component: AttachmentPreviewModalComponent,
        componentProps: {
          attachment: {
            ...msg.attachment,
            url: attachmentUrl,
          },
          message: msg,
        },
        cssClass: 'attachment-modal',
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
        color: 'danger',
      });
      await toast.present();
    }
  }

  private async downloadAndSaveLocally(url: string, fileName: string) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      await this.FileService.saveFileToReceived(fileName, blob);
    } catch (error) {
      console.warn('Failed to save file locally:', error);
    }
  }

  getAttachmentPreview(attachment: any): string {
    if (attachment.caption) {
      return attachment.caption.length > 30
        ? attachment.caption.substring(0, 30) + '...'
        : attachment.caption;
    }

    switch (attachment.type) {
      case 'image':
        return '📷 Photo';
      case 'video':
        return '🎥 Video';
      case 'audio':
        return '🎵 Audio';
      case 'file':
        return attachment.fileName || '📄 File';
      default:
        return '📎 Attachment';
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
          },
        },
        {
          text: 'Send',
          handler: () => {
            this.sendMessage();
          },
        },
      ],
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

  getMimeTypeFromName(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'pdf':
        return 'application/pdf';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      default:
        return '';
    }
  }

  async loadMessagesFromFirebase(loadMore = false) {
    // try {
    //   const db = getDatabase();
    //   const messagesRef = ref(db, `chats/${this.roomId}`);
    //   let qry;
    //   if (loadMore && this.lastMessageKey) {
    //     qry = query(
    //       messagesRef,
    //       orderByKey(),
    //       endBefore(this.lastMessageKey),
    //       limitToLast(this.limit)
    //     );
    //   } else {
    //     qry = query(messagesRef, orderByKey(), limitToLast(this.limit));
    //   }
    //   const snapshot = await get(qry);
    //   if (snapshot.exists()) {
    //     const messagesData = snapshot.val();
    //     const messageKeys = Object.keys(messagesData).sort();
    //     const decryptTasks = messageKeys.map(async (key) => {
    //       const msg = messagesData[key];
    //       // decrypt text
    //       let decryptedText = '';
    //       try {
    //         decryptedText = await this.encryptionService.decrypt(
    //           msg.text || ''
    //         );
    //       } catch (e) {
    //         console.warn('decrypt text failed for key', key, e);
    //         decryptedText = '';
    //       }
    //       // decrypt attachment.caption if present
    //       if (msg.attachment && msg.attachment.caption) {
    //         try {
    //           const decryptedCaption = await this.encryptionService.decrypt(
    //             msg.attachment.caption
    //           );
    //           msg.attachment.caption = decryptedCaption; // overwrite with plaintext
    //           // OR: msg.attachment.captionPlain = decryptedCaption;
    //         } catch (e) {
    //           console.warn('decrypt attachment caption failed for key', key, e);
    //         }
    //       }
    //       return {
    //         ...msg,
    //         key: key,
    //         text: decryptedText,
    //       } as Message;
    //     });
    //     const results = await Promise.all(decryptTasks);
    //     // -----------------------
    //     // FILTER OUT MESSAGES HIDDEN FOR THIS USER (deletedFor / deletedForEveryone)
    //     // -----------------------
    //     const filteredResults = results.filter((msg: Message) => {
    //       // if applyDeletionFilters returns true -> message should be hidden for current user
    //       try {
    //         return !this.applyDeletionFilters(msg);
    //       } catch (e) {
    //         // fail open (show message) if filter crashes
    //         console.warn(
    //           'applyDeletionFilters error while loading firebase messages',
    //           e
    //         );
    //         return true;
    //       }
    //     });
    //     // Merge into allMessages / displayedMessages keeping chronological order
    //     if (loadMore) {
    //       // older messages prepended (results are sorted ascending by key/name)
    //       this.allMessages = [...filteredResults, ...this.allMessages];
    //       this.displayedMessages = [
    //         ...filteredResults,
    //         ...this.displayedMessages,
    //       ];
    //     } else {
    //       this.allMessages = filteredResults;
    //       this.displayedMessages = filteredResults;
    //     }
    //     // Keep lastMessageKey based on raw results (so pagination works even when some were filtered out)
    //     if (results.length > 0 && results[0]?.key) {
    //       this.lastMessageKey = results[0].key;
    //     }
    //     // hasMoreMessages should be true if the query returned 'limit' keys (raw)
    //     this.hasMoreMessages = messageKeys.length === this.limit;
    //     this.groupedMessages = await this.groupMessagesByDate(
    //       this.displayedMessages
    //     );
    //     this.saveToLocalStorage();
    //     await this.markDisplayedMessagesAsRead();
    //   } else {
    //     this.hasMoreMessages = false;
    //   }
    // } catch (error) {
    //   console.error('Error loading messages from Firebase:', error);
    // }
    // this.chatService.getMessages().subscribe((messages) => {
    //   console.log('message', messages);
    // });
  }

  async addReaction(msg: IMessage, emoji: string) {
    // const userId = this.senderId;
    // const current = msg.reactions?.findIndex(r=>r.userId == userId) || null;
    // const newVal = current?.emoji === emoji ? null : emoji;
    // // 1) Optimistic UI update
    // msg.reactions = { ...(msg.reactions || {}) };
    // if (newVal) msg.reactions[userId] = newVal;
    // else delete msg.reactions[userId];
    // // If you maintain grouped/displayed arrays, ensure they reflect the change:
    // try {
    //   // update the message inside displayed/all arrays if present
    //   const idxAll = this.allMessages.findIndex((m) => m.msgId === msg.key);
    //   if (idxAll !== -1) {
    //     this.allMessages[idxAll] = { ...this.allMessages[idxAll], ...msg };
    //   }
    //   const idxDisp = this.displayedMessages.findIndex(
    //     (m) => m.key === msg.key
    //   );
    //   if (idxDisp !== -1) {
    //     this.displayedMessages[idxDisp] = {
    //       ...this.displayedMessages[idxDisp],
    //       ...msg,
    //     };
    //   }
    //   // refresh grouped view (optional, expensive if called very often)
    //   this.groupedMessages = await this.groupMessagesByDate(
    //     this.displayedMessages
    //   );
    //   // persist a small cache
    //   this.saveToLocalStorage();
    // } catch (e) {
    //   console.warn('update local arrays failed', e);
    // }
    // 2) Persist to Firebase
    // try {
    //   const db = getDatabase();
    //   const path = `chats/${this.roomId}/${msg.key}/reactions/${userId}`;
    //   if (newVal) {
    //     await set(ref(db, path), newVal);
    //     //console.log('✅ Reaction saved:', newVal);
    //   } else {
    //     await remove(ref(db, path));
    //     //console.log('✅ Reaction removed');
    //   }
    //   // 3) After successful write -> exit selection mode
    //   this.selectedMessages = [];
    //   this.lastPressedMessage = null;
    //   // if you have UI flags for selection, reset them too:
    //   // e.g. this.showSelectionToolbar = false; (replace with your actual flag)
    //   // Also ensure any CSS 'selected' classes will update because selectedMessages empty
    // } catch (err) {
    //   console.error('❌ Reaction save/remove error:', err);
    //   // Optionally rollback optimistic UI on error:
    //   try {
    //     // revert local change by refetching msg from allMessages (if exists) or clear reaction
    //     const idx = this.allMessages.findIndex((m) => m.key === msg.key);
    //     if (idx !== -1) {
    //       // re-sync from stored version if you have one; fallback: remove current user's reaction
    //       delete this.allMessages[idx].reactions?.[userId];
    //       delete msg.reactions?.[userId];
    //     }
    //     // this.displayedMessages = this.displayedMessages.map(m => m.key === msg.key ? { ...this.displayedMessages.find(x => x.key === msg.key) } : m);
    //     this.displayedMessages = this.displayedMessages.map((m) =>
    //       m.key === msg.key
    //         ? {
    //             ...(this.displayedMessages.find((x) => x.key === msg.key) ||
    //               ({} as Message)),
    //           }
    //         : m
    //     );
    //     this.groupedMessages = await this.groupMessagesByDate(
    //       this.displayedMessages
    //     );
    //     this.saveToLocalStorage();
    //   } catch (e) {
    //     /* ignore rollback errors */
    //   }
    //   // keep UI selection cleared? you can choose to keep selection if error:
    //   this.selectedMessages = [];
    //   this.lastPressedMessage = null;
    //   const t = await this.toastCtrl.create({
    //     message: 'Failed to update reaction',
    //     duration: 1600,
    //     color: 'danger',
    //   });
    //   await t.present();
    // }
  }

  openEmojiKeyboard(msg: Message) {
    this.emojiTargetMsg = msg;
    // focus hidden input to pop OS emoji keyboard
    const el = (document.querySelector('#chatting-screen') || document) // adjust root if needed
      .querySelector('ion-input[ng-reflect-name="emojiKeyboard"]') as any;

    // better: use @ViewChild('emojiKeyboard') emojiInput!: IonInput;
    // then: this.emojiInput.setFocus();
    const inputEl = document.querySelector(
      'ion-input + input'
    ) as HTMLInputElement; // Ionic renders native <input> after shadow
    if (this.datePicker) {
      /* just to keep reference lint happy */
    }
  }

  onEmojiPicked(ev: CustomEvent) {
    const val = (ev.detail as any)?.value || '';
    const emoji = val?.trim();
    if (!emoji || !this.emojiTargetMsg) return;
    // this.addReaction(this.emojiTargetMsg, emoji);

    // clear input so next pick fires change again
    const native = (ev.target as any)?.querySelector?.(
      'input'
    ) as HTMLInputElement;
    if (native) native.value = '';
    this.emojiTargetMsg = null;
  }

  /** Summary already exists; re-use it to build compact badges */
  getReactionSummary(
    msg: Message
  ): Array<{ emoji: string; count: number; mine: boolean }> {
    const map = msg.reactions || {};
    const byEmoji: Record<string, number> = {};
    Object.values(map).forEach((e: any) => {
      const em = String(e || '');
      if (!em) return;
      byEmoji[em] = (byEmoji[em] || 0) + 1;
    });
    return Object.keys(byEmoji)
      .map((emoji) => ({
        emoji,
        count: byEmoji[emoji],
        mine: map[this.senderId] === emoji,
      }))
      .sort((a, b) => b.count - a.count);
  }

  /** Return max 3 badges; prefer user's reaction first */
  getReactionBadges(
    msg: Message
  ): Array<{ emoji: string; count: number; mine: boolean }> {
    const list = this.getReactionSummary(msg);
    // Put "mine" first if exists
    const mineIdx = list.findIndex((x) => x.mine);
    if (mineIdx > 0) {
      const mine = list.splice(mineIdx, 1)[0];
      list.unshift(mine);
    }
    return list.slice(0, 3);
  }

  async onReactionBadgeClick(
    ev: Event,
    msg: Message,
    badge: { emoji: string; count: number; mine: boolean }
  ) {
    ev.stopPropagation();

    // Build header text: "1 reaction" / "3 reactions"
    const header =
      badge.count === 1 ? '1 reaction' : `${badge.count} reactions`;

    // If badge.mine === true, show the remove option; else show only view
    const buttons: any[] = [];

    // Show the emoji/count as a disabled info row
    buttons.push({
      text: `${badge.emoji}  ${badge.count}`,
      icon: undefined,
      role: undefined,
      handler: () => {
        /* noop - disabled by setting css or no-op here */
      },
      cssClass: 'reaction-info-button',
    });

    // If the current user reacted with this emoji, show "Tap to remove"
    if (badge.mine) {
      buttons.push({
        text: 'Tap to remove',
        icon: 'trash',
        handler: async () => {
          // call existing addReaction which toggles/remove when same emoji present
          // await this.addReaction(msg, badge.emoji);
        },
      });
    } else {
      // Optionally allow user to react with this same emoji (i.e., add their reaction)
      buttons.push({
        text: `React with ${badge.emoji}`,
        icon: undefined,
        handler: async () => {
          // await this.addReaction(msg, badge.emoji);
        },
      });
    }

    // Cancel button
    buttons.push({ text: 'Cancel', role: 'cancel' });

    const sheet = await this.actionSheetCtrl.create({
      header,
      buttons,
      cssClass: 'reaction-action-sheet',
    });

    await sheet.present();
  }

  goToProfile() {
    const queryParams: any = {
      receiverId: this.chatType === 'group' ? this.roomId : this.receiverId,
      receiver_phone: this.receiver_phone,
      receiver_name: this.receiver_name,
      isGroup: this.chatType === 'group',
    };

    this.router.navigate(['/profile-screen'], { queryParams });
  }

  saveToLocalStorage() {
    try {
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
    this.setDynamicPadding();
  }

  onInputBlur() {
    this.onInputBlurTyping();
    this.setDynamicPadding();
  }

  goToCallingScreen() {
    this.router.navigate(['/calling-screen']);
  }

  async openCamera() {
    try {
      const image = await Camera.getPhoto({
        source: CameraSource.Camera,
        quality: 90,
        resultType: CameraResultType.Uri,
      });
      this.capturedImage = image.webPath!;
    } catch (error) {
      console.error('Camera error:', error);
    }
  }

  openKeyboard() {
    setTimeout(() => {
      const textareaElement = document.querySelector(
        'ion-textarea'
      ) as HTMLIonTextareaElement;
      if (textareaElement) {
        textareaElement.setFocus();
      }
    }, 100);
  }

  ngOnDestroy() {
    this.keyboardListeners.forEach((listener) => listener?.remove());
    this.messageSub?.unsubscribe();
    if (this.pinnedMessageSubscription) {
      try {
        this.pinnedMessageSubscription();
      } catch (e) {}
    }
    this.typingRxSubs.forEach((s) => s.unsubscribe());
    try {
      if (this.typingUnsubscribe) this.typingUnsubscribe();
    } catch (e) {}
    this.stopTypingSignal();

    window.removeEventListener('resize', this.resizeHandler);
    if ((this as any)._ro) {
      (this as any)._ro.disconnect();
    }

    try {
      if (this.iBlockedRef) off(this.iBlockedRef);
      if (this.theyBlockedRef) off(this.theyBlockedRef);
      clearTimeout(this.blockBubbleTimeout);
    } catch (e) {}

    this.onValueUnsubs.forEach((fn) => {
      try {
        fn();
      } catch (e) {}
    });
    this.onValueUnsubs = [];
    this.statusPollSub?.unsubscribe();
  }

  private isGestureNavigation(): boolean {
    const screenHeight = window.screen.height || 0;
    const innerHeight = window.innerHeight || 0;
    const diff = screenHeight - innerHeight;
    return diff < 40;
  }

  private isTransparentButtonNav(): boolean {
    const screenHeight = window.screen.height || 0;
    const innerHeight = window.innerHeight || 0;
    const diff = screenHeight - innerHeight;
    return diff < 5;
  }

  setDynamicPadding() {
    const footerEl = this.el.nativeElement.querySelector(
      '.footer-fixed'
    ) as HTMLElement;
    if (!footerEl) return;

    if (this.platform.is('ios')) {
      const safeAreaBottom =
        parseInt(
          getComputedStyle(document.documentElement).getPropertyValue(
            '--ion-safe-area-bottom'
          )
        ) || 0;

      if (safeAreaBottom > 0) {
        this.renderer.setStyle(footerEl, 'padding-bottom', '16px');
      } else {
        this.renderer.setStyle(footerEl, 'padding-bottom', '6px');
      }
    } else {
      if (this.isGestureNavigation()) {
        this.renderer.setStyle(footerEl, 'padding-bottom', '35px');
      } else if (this.isTransparentButtonNav()) {
        this.renderer.setStyle(footerEl, 'padding-bottom', '35px');
      } else {
        this.renderer.setStyle(footerEl, 'padding-bottom', '6px');
      }
    }
  }

  onKeyboardOrInputChange() {
    this.setDynamicPadding();
  }

  // ---------- small helpers ----------
  private escapeRegExp(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
