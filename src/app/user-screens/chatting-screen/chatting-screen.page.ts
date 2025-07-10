// import { CommonModule } from '@angular/common';
// import { Component, OnInit } from '@angular/core';
// import { IonicModule } from '@ionic/angular';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-chatting-screen',
//   templateUrl: './chatting-screen.page.html',
//   styleUrls: ['./chatting-screen.page.scss'],
//   imports: [IonicModule, CommonModule]
// })
// export class ChattingScreenPage implements OnInit {

//   constructor(private router: Router) { }

//   goToCallingScreen() {
//     this.router.navigate(['/calling-screen']);
//   }

//   ngOnInit() {
//   }

// }



// import { Component, OnInit, OnDestroy, inject } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { IonicModule } from '@ionic/angular';
// import { SocketService } from '../../services/socket.service';
// import { Subscription } from 'rxjs';

// @Component({
//   selector: 'app-chatting-screen',
//   standalone: true,
//   imports: [CommonModule, FormsModule, IonicModule],
//   templateUrl: './chatting-screen.page.html',
//   styleUrls: ['./chatting-screen.page.scss']
// })
// export class ChattingScreenPage implements OnInit, OnDestroy {
//   messages: any[] = [];
//   messageText: string = '';
//   receiverId: string = '';
//   senderId: string = '';
//   private messageSub: Subscription | undefined;

//   private socketService = inject(SocketService);
//   private route = inject(ActivatedRoute);
//   private router = inject(Router);

//   ngOnInit() {
//     // this.senderId = localStorage.getItem('userId') || '';
//     // this.receiverId = this.route.snapshot.queryParamMap.get('receiverId') || '';
//     // console.log(this.senderId);
//     // console.log(this.receiverId);
//     // this.loadFromLocalStorage();

//     // this.messageSub = this.socketService.onMessage().subscribe((msg: any) => {
//     //   const isCurrentChat =
//     //     (msg.sender_id === this.receiverId && msg.receiver_id === this.senderId) ||
//     //     (msg.sender_id === this.senderId && msg.receiver_id === this.receiverId);

//     //   if (isCurrentChat) {
//     //     this.messages.push(msg);
//     //     this.saveToLocalStorage();
//     //   }
//     // });
//   }


//   ngAfterViewInit() {
//   setTimeout(() => {
//     this.senderId = localStorage.getItem('userId') || '';
//     this.receiverId = this.route.snapshot.queryParamMap.get('receiverId') || '';
//     console.log(this.senderId);
//     console.log(this.receiverId);
//     this.loadFromLocalStorage();

//     this.messageSub = this.socketService.onMessage().subscribe((msg: any) => {
//       const isCurrentChat =
//         (msg.sender_id === this.receiverId && msg.receiver_id === this.senderId) ||
//         (msg.sender_id === this.senderId && msg.receiver_id === this.receiverId);

//       if (isCurrentChat) {
//         this.messages.push(msg);
//         this.saveToLocalStorage();
//       }
//     });
//   });
// }


//   saveToLocalStorage() {
//     localStorage.setItem(this.receiverId, JSON.stringify(this.messages));
//   }
//   loadFromLocalStorage() {
//     this.messages = JSON.parse(localStorage.getItem(this.receiverId) as unknown as string) || []
//   }

//   goToCallingScreen() {
//     console.log('Navigating to calling screen...');
//      this.router.navigate(['/calling-screen']);
//    }

//   sendMessage() {
//     if (!this.messageText.trim()) return;

//     const message = {
//       type: "private",
//       sender_id: this.senderId,
//       receiver_id: this.receiverId,
//       text: this.messageText,
//       timestamp: new Date().toLocaleTimeString()
//     };

//     // this.messages.push(message);
//     this.socketService.sendMessage(message);
//     this.messageText = '';
//   }

//   ngOnDestroy() {
//     this.messageSub?.unsubscribe();
//   }
// }




// import { Component, OnInit, OnDestroy, AfterViewInit, inject, ViewChild, ElementRef } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { IonicModule } from '@ionic/angular';
// import { SocketService } from '../../services/socket.service';
// import { firstValueFrom, Subscription } from 'rxjs';
// import { EncryptionService } from 'src/app/services/encryption.service';
// import { ApiService } from 'src/app/services/api/api.service';

// @Component({
//   selector: 'app-chatting-screen',
//   standalone: true,
//   imports: [CommonModule, FormsModule, IonicModule],
//   templateUrl: './chatting-screen.page.html',
//   styleUrls: ['./chatting-screen.page.scss']
// })
// export class ChattingScreenPage implements OnInit, AfterViewInit, OnDestroy {
//   messages: any[] = [];
//   messageText: string = '';
//   receiverId: string = '';
//   senderId: string = '';
//   receiverPublicKeyHex: string = '';
//   private messageSub: Subscription | undefined;

//   private socketService = inject(SocketService);
//   private route = inject(ActivatedRoute);
//   private router = inject(Router);

//   // receiverPhoneNumber: string = '+919138152160'; // static
//   receiverPhoneNumber: string = '';


//   constructor(private encryptionService: EncryptionService,private apiService:ApiService) { }

//   @ViewChild('scrollContainer') private scrollContainer: ElementRef | undefined;

//   ngOnInit() {
//     this.senderId = localStorage.getItem('userId') || '';
//     // this.receiverId = this.route.snapshot.queryParamMap.get('receiverId') || '';
//     // this.receiverPhoneNumber = this.route.snapshot.paramMap.get('receiverId') || '';

//     this.route.queryParamMap.subscribe(params => {
//   this.receiverPhoneNumber = params.get('receiverId') || '';
// });
//     // this.receiverId = this.route.snapshot.queryParamMap.get('receiverId') || '';
//     // console.log(this.receiverId);

// // if (this.receiverId) {
// //   this.apiService.get<{ phone_number: string }>(`/api/users/profile?user_id=${this.receiverId}`)
// //     .subscribe({
// //       next: (res) => {
// //         this.receiverPhoneNumber = res.phone_number;
// //         console.log('Receiver phone:', this.receiverPhoneNumber);
// //       },
// //       error: (err) => {
// //         console.error('Failed to fetch receiver phone number', err);
// //       }
// //     });
// // }

//     //  this.receiverPhoneNumber = '+919138152160';//----khusha-----------from getting url append +91 or + as created problem while getting with + 

//     console.log('Sender:', this.senderId);
//     console.log('receiverPhoneNumber:', this.receiverId);
//     console.log('Phone:', this.receiverPhoneNumber);
//     this.loadFromLocalStorage();

//     // this.messageSub = this.socketService.onMessage().subscribe((msg: any) => {
//     //   const isCurrentChat =
//     //     (msg.sender_id === this.receiverId && msg.receiver_id === this.senderId) ||
//     //     (msg.sender_id === this.senderId && msg.receiver_id === this.receiverId);

//     //   if (isCurrentChat) {
//     //     this.messages.push(msg);
//     //     this.saveToLocalStorage();
//     //     this.scrollToBottom();
//     //   }
//     // });
//   }

//   ngAfterViewInit(): void {
//     setTimeout(() => this.scrollToBottom(), 300);
//   }

//   // sendMessage() {
//   //   if (!this.messageText.trim()) return;

//   //   const message = {
//   //     type: 'private',
//   //     sender_id: this.senderId,
//   //     receiver_id: this.receiverId,
//   //     text: this.messageText.trim(),
//   //     timestamp: new Date().toLocaleTimeString()
//   //   };

//   //   // Push sent message locally for immediate UI response
//   //   this.messages.push(message);
//   //   this.saveToLocalStorage();
//   //   this.scrollToBottom();

//   //   // Send to server
//   //   this.socketService.sendMessage(message);

//   //   // Clear input
//   //   this.messageText = '';
//   // }
//   userID:String="";
//   lastMessageResponse:String="";
// async sendMessage() {
//   //  this.userID = "28";
//   this.userID = localStorage.getItem('userId') || '';
//   // Step 1: Get receiver's public key using ApiService
//   if (!this.receiverPublicKeyHex) {
//     const response = await firstValueFrom(
//       this.apiService.get<{ publicKeyHex: string }>(
//         `/api/users/profile?user_id=${this.userID}`
//       )
//     );
//     this.receiverPublicKeyHex = response.publicKeyHex;
//   }

//   // Step 2: Build encrypted payload
//   const payload = await this.encryptionService.buildEncryptedPayload(
//     this.messageText,
//     this.receiverPhoneNumber,
//     this.receiverPublicKeyHex
//   );

//   console.log('Encrypted Payload:', payload);

// //   {
// //     "senderId": 28,
// //     "receiverPhoneNumber": "+911234567890",
// //     "encryptedMessage": {
// //         "iv": "7f12b085a95dc196290c6ba6a75ed201",
// //         "encryptedText": "baa377dc851af7627e7c165233aa87df"
// //     },
// //     "messageType": "text"
// // }

//   // Step 3: Send encrypted payload (via WebSocket or HTTP)
//   // Example:
//   // this.socketService.emit('sendMessage', payload);
//   // this.socketService.emitMessage(payload); // <- EMIT METHOD CALLED HERE

//    // Emit with callback to receive response from server
//  try {
//   const result = await this.socketService.emitMessage(payload);
//   console.log('Message sent, server returned:', result);

// //   {
// //     "status": "success",
// //     "message": "Message stored and delivered",
// //     "data": {
// //         "messageId": 21,
// // senderId
// // : 
// // 28

// //         "timestamp": "2025-05-31T04:58:00.776Z",
// //         "encryptedMessage": {
// //             "iv": "2298a79cec001adf5b3eec420054508c",
// //             "encryptedText": "a79e81e679bd76a66983bc09f2c62c09"
// //         }
// //     }
// // }
//   //decrypt above payload
//   this.lastMessageResponse = result;
//           const encryptedMessage = result.data ? result.data.encryptedMessage : result.encryptedMessage;
//           const encryptedHex = encryptedMessage.encryptedText;
//           const ivHex = encryptedMessage.iv;

//           const response = await firstValueFrom(
//             this.apiService.get<{ publicKeyHex: string }>(
//               `/api/users/profile?user_id=${result.data.senderId}`
//             )
//           );

//           const senderPublicKeyHex = response.publicKeyHex;

//   this.messageText = await this.encryptionService.decryptMessage(
//   encryptedHex,
//   ivHex,
//   senderPublicKeyHex
// );

// console.log("Decrypted message", this.messageText);
// } catch (err) {
//   console.error('Failed to send message:', err);
// }



// }







//   saveToLocalStorage() {
//     localStorage.setItem(this.receiverId, JSON.stringify(this.messages));
//   }

//   loadFromLocalStorage() {
//     this.messages = JSON.parse(localStorage.getItem(this.receiverId) || '[]');
//   }

//   scrollToBottom() {
//     try {
//       setTimeout(() => {
//         if (this.scrollContainer) {
//           this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
//         }
//       }, 100);
//     } catch (err) {
//       console.warn('Scroll error:', err);
//     }
//   }

//   goToCallingScreen() {
//     this.router.navigate(['/calling-screen']);
//   }

//   ngOnDestroy(): void {
//     this.messageSub?.unsubscribe();
//   }
// }


///////12-june 2025 
// import {
//   Component,
//   OnInit,
//   OnDestroy,
//   AfterViewInit,
//   inject,
//   ViewChild,
//   ElementRef,
// } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { IonicModule } from '@ionic/angular';
// import { SocketService } from '../../services/socket.service';
// import { firstValueFrom, Subscription } from 'rxjs';
// import { EncryptionService } from 'src/app/services/encryption.service';
// import { ApiService } from 'src/app/services/api/api.service';

// @Component({
//   selector: 'app-chatting-screen',
//   standalone: true,
//   imports: [CommonModule, FormsModule, IonicModule],
//   templateUrl: './chatting-screen.page.html',
//   styleUrls: ['./chatting-screen.page.scss'],
// })
// export class ChattingScreenPage implements OnInit, AfterViewInit, OnDestroy {
//   messages: any[] = [];
//   messageText: string = '';
//   receiver_Id: string = '';
//   senderId: string = '';
//   receiverPublicKeyHex: string = '';
//   private messageSub: Subscription | undefined;

//   private socketService = inject(SocketService);
//   private route = inject(ActivatedRoute);
//   private router = inject(Router);

//   receiverPhoneNumber: string = '';
//   phone_number: string = '';
//   sender_Id: string = '';
//   receiver_id: string = '';

//   constructor(
//     private encryptionService: EncryptionService,
//     private apiService: ApiService
//   ) { }

//   @ViewChild('scrollContainer') private scrollContainer:
//     | ElementRef
//     | undefined;

//   //   ngOnInit() {
//   //     this.sender_Id = localStorage.getItem('userId') || '';

//   //     this.route.queryParamMap.subscribe((params) => {
//   //       this.receiverPhoneNumber = params.get('receiverId') || '';
//   //       this.receiver_Id = this.receiverPhoneNumber;
//   //     });

//   //     console.log('Sender:', this.sender_Id);
//   //     console.log('receiverPhoneNumber:', this.receiver_Id);
//   //     console.log('Phone:', this.receiverPhoneNumber);
//   //     this.phone_number = this.receiver_Id;

//   //     this.loadFromLocalStorage();


//   //     this.messageSub = this.socketService.onMessage().subscribe(async (msg: any) => {

//   //     this.apiService.getUserProfile(this.receiver_Id).subscribe({
//   //       next: (res) => {
//   //         console.log('reciever_id again:', res.user_id);
//   //         // console.log('result dfdfsgdf:', res);
//   //         this.receiver_id = res.user_id; 
//   //       },
//   //       error: (err) => {
//   //         console.error('Error fetching user_id:', err);
//   //       },
//   //     });
//   //   //     const isCurrentChat =
//   //   // (msg.senderId === this.sender_Id && msg.receiverId === this.receiver_Id) ||
//   //   // (msg.senderId === this.receiver_Id && msg.receiverId === this.sender_Id);

//   //   console.log('Debugging isCurrentChat condition:');
//   // console.log('msg.senderId:', msg.senderId);
//   // console.log('msg.receiverId:', msg.receiverId);
//   // console.log('this.sender_Id:', this.sender_Id);
//   // console.log('this.receiver_Id:', this.receiver_id);

//   // const isCurrentChat =
//   //   (msg.senderId === this.sender_Id && msg.receiverId === this.receiver_Id) ||
//   //   (msg.senderId === this.receiver_Id && msg.receiverId === this.sender_Id);

//   // console.log('isCurrentChat:', isCurrentChat);


//   //       if (isCurrentChat && msg.encryptedMessage) {
//   //         const encryptedHex = msg.encryptedMessage.encryptedText;
//   //         const ivHex = msg.encryptedMessage.iv;

//   //         // Get sender's public key
//   //         const response = await firstValueFrom(
//   //           this.apiService.get<{ publicKeyHex: string }>(
//   //             `/api/users/profile?user_id=${msg.sender_id}`
//   //           )
//   //         );

//   //         const senderPublicKeyHex = response.publicKeyHex;
//   //         const receiverPrivateKeyHex = localStorage.getItem('ecc_private_key');

//   //         if (!receiverPrivateKeyHex) {
//   //           console.error('Receiver private key not found');
//   //           return;
//   //         }

//   //         const decryptedText = await this.encryptionService.decryptMessage(
//   //           encryptedHex,
//   //           ivHex,
//   //           senderPublicKeyHex

//   //         );
//   //         console.log("decrypted text:",decryptedText)

//   //         this.messages.push({
//   //           ...msg,
//   //           text: decryptedText,
//   //         });

//   //         this.saveToLocalStorage();
//   //         this.scrollToBottom();
//   //       }
//   //     });
//   //   }


//   async ngOnInit() {
//     this.sender_Id = localStorage.getItem('userId') || '';

//     this.route.queryParamMap.subscribe(async (params) => {
//       this.receiverPhoneNumber = params.get('receiverId') || '';
//       this.receiver_Id = this.receiverPhoneNumber;
//       this.phone_number = this.receiver_Id;

//       console.log('Sender:', this.sender_Id);
//       console.log('receiverPhoneNumber:', this.receiver_Id);
//       console.log('Phone:', this.receiverPhoneNumber);

//       // ✅ Ensure you load receiver's user ID from backend before using it
//       try {
//         const res = await firstValueFrom(this.apiService.getUserProfile(this.receiver_Id));
//         this.receiver_id = res.user_id;
//         console.log('receiver_id again:', this.receiver_id);

//         this.loadFromLocalStorage();

//         // ✅ Now that receiver_id is fetched, setup the message listener
//         this.messageSub = this.socketService.onMessage().subscribe(async (msg: any) => {
//           console.log('Debugging isCurrentChat condition:');
//           console.log('msg.senderId:', msg.senderId);
//           console.log('msg.receiverId:', msg.receiverId);
//           console.log('this.sender_Id:', this.sender_Id);
//           console.log('this.receiver_Id:', this.receiver_id);

//           const isCurrentChat =
//             (msg.senderId == this.sender_Id && msg.receiverId == this.receiver_id) ||
//             (msg.senderId == this.receiver_id && msg.receiverId == this.sender_Id);

//           console.log('isCurrentChat:', isCurrentChat);

//           if (isCurrentChat && msg.encryptedMessage) {
//             const encryptedHex = msg.encryptedMessage.encryptedText;
//             const ivHex = msg.encryptedMessage.iv;

//             try {
//               const response = await firstValueFrom(
//                 this.apiService.get<{ publicKeyHex: string }>(
//                   `/api/users/profile?user_id=${this.sender_Id}`
//                 )
//               );

//               const senderPublicKeyHex = response.publicKeyHex;
//               const receiverPrivateKeyHex = localStorage.getItem('ecc_private_key');

//               if (!receiverPrivateKeyHex) {
//                 console.error('Receiver private key not found');
//                 return;
//               }
//               console.log("encryptedHexinit", encryptedHex);
//               console.log("ivHexinit", ivHex);



//               if (msg.senderId == this.receiver_id && msg.receiverId == this.sender_Id) {

// const senderPublicKeyHexx = `3059301306072a8648ce3d020106082a8648ce3d03010703420004686219224391c8511065ca35b1c8ed936f62d4d9c3800d1e4bbc7e3b4810724b63d416b93226e930c8fe26ab74c4aa6b1cafc8c334cd5a5fcb269151e2e47877`;

//  console.log("senderPublicKeyHexinit", senderPublicKeyHexx);
//                 console.log("reciver sss");

//                 const decryptedText = await this.encryptionService.decryptMessage(
//                   encryptedHex,
//                   ivHex,
//                   senderPublicKeyHexx
//                 );



//                 console.log('decrypted text:', decryptedText);

//                   this.messages.push({
//                 ...msg,
//                 text: decryptedText,
//                   });
//               } else {
//                 const decryptedText = await this.encryptionService.decryptMessage(
//                   encryptedHex,
//                   ivHex,
//                   senderPublicKeyHex
//                 );



//                 console.log('decrypted text:', decryptedText);

//                   this.messages.push({
//                 ...msg,
//                 text: decryptedText,
//               });

//               }

//               // const decryptedText = await this.encryptionService.decryptMessage(
//               //   encryptedHex,
//               //   ivHex,
//               //   senderPublicKeyHex
//               // );



//               // console.log('decrypted text:', decryptedText);

//               // this.messages.push({
//               //   ...msg,
//               //   text: decryptedText,
//               // });

//               this.saveToLocalStorage();
//               this.scrollToBottom();
//             } catch (err) {
//               console.error('Error decrypting message:', err);
//             }
//           }
//         });

//       } catch (err) {
//         console.error('Error fetching user_id:', err);
//       }
//     });
//   }

//   ngAfterViewInit(): void {
//     setTimeout(() => this.scrollToBottom(), 300);
//   }

//   userID: string = '';
//   lastMessageResponse: string = '';

//   async sendMessage() {
//     this.userID = localStorage.getItem('userId') || '';

//     if (!this.receiverPublicKeyHex) {
//       const response = await firstValueFrom(
//         this.apiService.get<{ publicKeyHex: string }>(
//           `/api/users/profile?user_id=${this.userID}`
//         )
//       );
//       this.receiverPublicKeyHex = response.publicKeyHex;
//     }

//     const payload = await this.encryptionService.buildEncryptedPayload(
//       this.messageText,
//       this.receiverPhoneNumber,
//       this.receiverPublicKeyHex
//     );

//     console.log('Encrypted Payload:', payload);

//     try {
//       const result = await this.socketService.emitMessage(payload);
//       console.log('Message sent, server returned:', result);

//       const encryptedMessage = result.data?.encryptedMessage || result.encryptedMessage;
//       const encryptedHex = encryptedMessage.encryptedText;
//       const ivHex = encryptedMessage.iv;

//       const response = await firstValueFrom(
//         this.apiService.get<{ publicKeyHex: string }>(
//           `/api/users/profile?user_id=${result.data.senderId}`
//         )
//       );

//       const senderPublicKeyHex = response.publicKeyHex;
//       const receiverPrivateKeyHex = localStorage.getItem('ecc_private_key');

//       if (!receiverPrivateKeyHex) {
//         console.error('Receiver private key not found');
//         return;
//       }


//       console.log("encryptedHex", encryptedHex);
//       console.log("ivHex", ivHex);

//       console.log("senderPublicKeyHex", senderPublicKeyHex);

//       const decryptedText = await this.encryptionService.decryptMessage(
//         encryptedHex,
//         ivHex,
//         senderPublicKeyHex,

//       );

//       console.log('Decrypted message:', decryptedText);

//       this.messages.push({
//         ...result.data,
//         text: decryptedText,
//       });

//       this.saveToLocalStorage();
//       this.scrollToBottom();
//       this.messageText = '';
//     } catch (err) {
//       console.error('Failed to send message:', err);
//     }
//   }

//   scrollToBottom() {
//     try {
//       setTimeout(() => {
//         if (this.scrollContainer) {
//           this.scrollContainer.nativeElement.scrollTop =
//             this.scrollContainer.nativeElement.scrollHeight;
//         }
//       }, 100);
//     } catch (err) {
//       console.error('Scroll error:', err);
//     }
//   }

//   saveToLocalStorage() {
//     const key = `chat_${this.senderId}_${this.receiverPhoneNumber}`;
//     localStorage.setItem(key, JSON.stringify(this.messages));
//   }

//   loadFromLocalStorage() {
//     const key = `chat_${this.senderId}_${this.receiverPhoneNumber}`;
//     const data = localStorage.getItem(key);
//     if (data) {
//       this.messages = JSON.parse(data);
//     }
//   }

//   goToCallingScreen() {
//     this.router.navigate(['/calling-screen']);
//   }

//   ngOnDestroy(): void {
//     this.messageSub?.unsubscribe();
//   }
// }
/////12-june above


// import {
//   Component,
//   OnInit,
//   ViewChild,
//   ElementRef,
//   AfterViewInit,
// } from '@angular/core';
// import { SocketService } from '../../services/socket.service';
// import { EncryptionService } from '../../services/encryption.service';
// import { CommonModule } from '@angular/common';
// import { IonicModule } from '@ionic/angular';
// import { FormsModule } from '@angular/forms';

// @Component({
//   selector: 'app-chatting-screen',
//   templateUrl: './chatting-screen.page.html',
//   imports: [
//     IonicModule,
//     CommonModule,
//     FormsModule,],
//   styleUrls: ['./chatting-screen.page.scss'],
// })
// export class ChattingScreenPage implements OnInit, AfterViewInit {
//   @ViewChild('chatContainer') chatContainer!: ElementRef;

//   public messages: any[] = [];
//   public newMessage: string = '';
//   public receiverPhoneNumber = '+919123456789'; // 🔁 Replace with actual receiver's number
//   public receiverPublicKeyHex = ''; // 👈 Load from API or shared previously
//   public senderId = localStorage.getItem('userId');

//   constructor(
//     private socketService: SocketService,
//     private encryptionService: EncryptionService
//   ) {}

//   async ngOnInit() {
//     await this.ensureECCKeyGenerated();

//     // Replace this with actual logic to get receiver’s public key
//     this.receiverPublicKeyHex = await this.fetchReceiverPublicKey(this.receiverPhoneNumber);

//     this.socketService.onMessageReceived(async (msg) => {
//       // Decrypt received message
//       if (msg.receiverPhoneNumber === localStorage.getItem('phoneNumber')) {
//         const decryptedText = await this.encryptionService.decryptMessage(
//           msg.encryptedMessage.encryptedText,
//           msg.encryptedMessage.iv,
//           msg.senderPublicKeyHex
//         );

//         this.messages.push({
//           text: decryptedText,
//           sender: 'them',
//         });

//         this.scrollToBottom();
//       }
//     });
//   }

//   async ensureECCKeyGenerated() {
//     const existing = localStorage.getItem('ecc_private_key');
//     if (!existing) {
//       await this.encryptionService.generateAndStoreECCKeys();
//     }
//   }

//   async fetchReceiverPublicKey(phoneNumber: string): Promise<string> {
//     // Replace with actual HTTP call to backend API
//     const userPublicKeyHex = '...'; // Get receiver's publicKeyHex from backend
//     return userPublicKeyHex;
//   }

//   async sendMessage() {
//     if (!this.newMessage.trim()) return;

//     const payload = await this.encryptionService.buildEncryptedPayload(
//       this.newMessage,
//       this.receiverPhoneNumber,
//       this.receiverPublicKeyHex
//     );

//     // Include your public key so receiver can derive the AES key
//     payload.senderPublicKeyHex = await this.encryptionService.generateAndStoreECCKeys(); // Or store it once and reuse
//     await this.socketService.emitMessage(payload);

//     this.messages.push({
//       text: this.newMessage,
//       sender: 'me',
//     });

//     this.newMessage = '';
//     this.scrollToBottom();
//   }

//   ngAfterViewInit(): void {
//     this.scrollToBottom();
//   }

//   scrollToBottom(): void {
//     setTimeout(() => {
//       const container = this.chatContainer.nativeElement;
//       container.scrollTop = container.scrollHeight;
//     }, 100);
//   }
// }




// import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { IonicModule } from '@ionic/angular';
// import { SocketService } from '../../services/socket.service';
// import { Subscription } from 'rxjs';
// import { Keyboard } from '@capacitor/keyboard';

// @Component({
//   selector: 'app-chatting-screen',
//   standalone: true,
//   imports: [CommonModule, FormsModule, IonicModule],
//   templateUrl: './chatting-screen.page.html',
//   styleUrls: ['./chatting-screen.page.scss']
// })
// export class ChattingScreenPage implements OnInit, OnDestroy {
//   @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;

//   messages: any[] = [];
//   messageText: string = '';
//   receiverId: string = '';
//   senderId: string = '';
//   private messageSub: Subscription | undefined;
//   showSendButton = false;

//   private socketService = inject(SocketService);
//   private route = inject(ActivatedRoute);
//   router: any;

//   ngOnInit() {
//      Keyboard.setScroll({ isDisabled: false });
//     this.senderId = localStorage.getItem('userId') || '';
//     const rawId = this.route.snapshot.queryParamMap.get('receiverId') || '';
//     this.receiverId = decodeURIComponent(rawId);
//     console.log("sender_id", this.senderId);
//     console.log(this.receiverId);
//     this.loadFromLocalStorage();

//     this.messageSub = this.socketService.onMessage().subscribe((msg: any) => {
//       const isCurrentChat =
//         (msg.sender_id === this.receiverId && msg.receiver_id === this.senderId) ||
//         (msg.sender_id === this.senderId && msg.receiver_id === this.receiverId);

//       if (isCurrentChat) {
//         this.messages.push(msg);
//         this.saveToLocalStorage();
//         this.scrollToBottom();
//       }
//     });

//     // Auto scroll to bottom on init
//     setTimeout(() => {
//       this.scrollToBottom();
//     }, 100);
//   }

//   saveToLocalStorage() {
//     localStorage.setItem(this.receiverId, JSON.stringify(this.messages));
//   }

//   loadFromLocalStorage() {
//     this.messages = JSON.parse(localStorage.getItem(this.receiverId) as unknown as string) || []
//   }

//   goToCallingScreen() {
//     this.router.navigate(['/calling-screen']);
//   }

//   onInputChange() {
//     this.showSendButton = this.messageText?.trim().length > 0;
//   }

//   onInputFocus() {
//     // Simple scroll to bottom when input is focused
//     setTimeout(() => {
//       this.scrollToBottom();
//     }, 300);
//   }

//   onInputBlur() {
//     // Optional: Handle input blur if needed
//   }

//   scrollToBottom() {
//     if (this.scrollContainer) {
//       setTimeout(() => {
//         this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
//       }, 100);
//     }
//   }

//   sendMessage() {
//     if (!this.messageText.trim()) return;

//     const message = {
//       type: "private",
//       sender_id: this.senderId,
//       receiver_id: this.receiverId,
//       text: this.messageText,
//       timestamp: new Date().toLocaleTimeString([], {
//         hour: '2-digit',
//         minute: '2-digit',
//         hour12: true
//       })
//     };

//     this.socketService.sendMessage(message);
//     this.messageText = '';
//     this.showSendButton = false;
//     this.scrollToBottom();
//   }

//   ngOnDestroy() {
//     this.messageSub?.unsubscribe();
//   }
// }




//import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { IonContent, IonicModule, Platform } from '@ionic/angular';
// import { SocketService } from '../../services/socket.service';
// import { Subscription } from 'rxjs';
// import { Keyboard } from '@capacitor/keyboard';
// import { ApiService } from 'src/app/services/api/api.service';

// @Component({
//   selector: 'app-chatting-screen',
//   standalone: true,
//   imports: [CommonModule, FormsModule, IonicModule],
//   templateUrl: './chatting-screen.page.html',
//   styleUrls: ['./chatting-screen.page.scss']
// })
// export class ChattingScreenPage implements OnInit, OnDestroy {
//   @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;
//   @ViewChild(IonContent, { static: false }) ionContent!: IonContent;

//   messages: any[] = [];
//   messageText: string = '';
//   receiverId: string = '';
//   senderId: string = '';
//   private messageSub: Subscription | undefined;
//   showSendButton = false;
//   private keyboardListeners: any[] = [];

//   private socketService = inject(SocketService);
//   private route = inject(ActivatedRoute);
//   private platform = inject(Platform);
//   private apiService = inject(ApiService);
//   router: any;

//   // async ngOnInit() {
//   //   Keyboard.setScroll({ isDisabled: false });

//   //   // Initialize keyboard listeners
//   //   await this.initKeyboardListeners();

//   //   this.senderId = localStorage.getItem('userId') || '';
//   //   const rawId = this.route.snapshot.queryParamMap.get('receiverId') || '';
//   //   this.receiverId = decodeURIComponent(rawId);
//   //   console.log("sender_id", this.senderId);
//   //   console.log(this.receiverId);
//   //   this.loadFromLocalStorage();

//   //   this.messageSub = this.socketService.onMessage().subscribe((msg: any) => {
//   //     const isCurrentChat =
//   //       (msg.sender_id === this.receiverId && msg.receiver_id === this.senderId) ||
//   //       (msg.sender_id === this.senderId && msg.receiver_id === this.receiverId);

//   //     if (isCurrentChat) {
//   //       this.messages.push(msg);
//   //       this.saveToLocalStorage();
//   //       this.scrollToBottom();
//   //     }
//   //   });

//   //   // Auto scroll to bottom on init
//   //   setTimeout(() => {
//   //     this.scrollToBottom();
//   //   }, 100);
//   // }

//   async ngOnInit() {
//   Keyboard.setScroll({ isDisabled: false });
//   await this.initKeyboardListeners();

//   this.senderId = localStorage.getItem('userId') || '';
//   const rawId = this.route.snapshot.queryParamMap.get('receiverId') || '';
//   this.receiverId = decodeURIComponent(rawId);
//   console.log("sender_id", this.senderId);
//   console.log("receiver_id", this.receiverId);

//   this.loadFromLocalStorage(); // Load cached messages
//   this.loadMessagesFromServer(); // ✅ Load from backend API

//   this.messageSub = this.socketService.onMessage().subscribe((msg: any) => {
//     const isCurrentChat =
//       (msg.sender_id === this.receiverId && msg.receiver_id === this.senderId) ||
//       (msg.sender_id === this.senderId && msg.receiver_id === this.receiverId);

//     if (isCurrentChat) {
//       this.messages.push(msg);
//       this.saveToLocalStorage();
//       this.scrollToBottom();
//     }
//   });

//   // Auto scroll to bottom on init
//   setTimeout(() => {
//     this.scrollToBottom();
//   }, 100);
// }

//   private async initKeyboardListeners() {
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
//         console.log('Keyboard plugin not available, using fallback');
//         this.setupFallbackKeyboardDetection();
//       }
//     } else {
//       this.setupFallbackKeyboardDetection();
//     }
//   }

//   saveToLocalStorage() {
//     localStorage.setItem(this.receiverId, JSON.stringify(this.messages));
//   }

//   loadFromLocalStorage() {
//     this.messages = JSON.parse(localStorage.getItem(this.receiverId) as unknown as string) || []
//   }

//   loadMessagesFromServer(): void {
//   const payload = {
//     senderId: this.senderId,
//     receiverId: this.receiverId,
//     limit: 10, // you can make this dynamic for pagination
//     offset: 0
//   };

//   this.apiService.post('/api/chats/prototype-messages', payload).subscribe({
//     next: (res: any) => {
//       this.messages = res.messages || [];
//       this.saveToLocalStorage();
//       this.scrollToBottom();
//     },
//     error: (err) => {
//       console.error('Failed to load messages from server:', err);
//     }
//   });
// }


//   goToCallingScreen() {
//     this.router.navigate(['/calling-screen']);
//   }

//   ngOnDestroy() {
//     // Clean up listeners
//     this.keyboardListeners.forEach(listener => listener?.remove());
//     this.messageSub?.unsubscribe();
//   }

//   onInputChange() {
//     this.showSendButton = this.messageText?.trim().length > 0;
//   }

//   onInputFocus() {
//     // Add slight delay to ensure keyboard is detected and scroll to bottom
//     setTimeout(() => {
//       this.adjustFooterPosition();
//       this.scrollToBottom();
//     }, 300);
//   }

//   onInputBlur() {
//     // Reset footer when input loses focus
//     setTimeout(() => {
//       this.resetFooterPosition();
//     }, 300);
//   }

//   scrollToBottom() {
//     if (this.ionContent) {
//       setTimeout(() => {
//         this.ionContent.scrollToBottom(300);
//       }, 100);
//     }
//   }



//   sendMessage() {
//     if (!this.messageText.trim()) return;

//     const message = {
//       type: "private",
//       sender_id: this.senderId,
//       receiver_id: this.receiverId,
//       text: this.messageText,
//       date: new Date().toLocaleDateString('en-IN'),
//       timestamp: new Date().toLocaleTimeString([], {
//         // year: 'numeric',
//         // month: '2-digit',
//         // day: '2-digit',
//         hour: '2-digit',
//         minute: '2-digit',
//         hour12: true
//       })
//     };

//     this.socketService.sendMessage(message);
//     this.messageText = '';
//     this.showSendButton = false;
//     this.scrollToBottom();
//   }

//   private handleKeyboardShow(keyboardHeight: number) {
//     const footer = document.querySelector('.footer-fixed') as HTMLElement;
//     const chatMessages = document.querySelector('.chat-messages') as HTMLElement;
//     const ionContent = document.querySelector('ion-content') as HTMLElement;

//     if (footer) {
//       footer.style.bottom = `${keyboardHeight}px`;
//       footer.style.transition = 'bottom 0.3s ease-in-out';
//     }

//     // Adjust chat messages container
//     if (chatMessages) {
//       chatMessages.style.paddingBottom = `${keyboardHeight + 80}px`; // keyboard height + footer height
//       chatMessages.style.transition = 'padding-bottom 0.3s ease-in-out';
//     }

//     // Adjust ion-content if needed
//     if (ionContent) {
//       ionContent.style.paddingBottom = `${keyboardHeight}px`;
//       ionContent.style.transition = 'padding-bottom 0.3s ease-in-out';
//     }

//     // Scroll to bottom when keyboard opens
//     setTimeout(() => {
//       this.scrollToBottom();
//     }, 350);
//   }

//   private handleKeyboardHide() {
//     const footer = document.querySelector('.footer-fixed') as HTMLElement;
//     const chatMessages = document.querySelector('.chat-messages') as HTMLElement;
//     const ionContent = document.querySelector('ion-content') as HTMLElement;

//     if (footer) {
//       footer.style.bottom = '0px';
//       footer.style.transition = 'bottom 0.3s ease-in-out';
//     }

//     // Reset chat messages container
//     if (chatMessages) {
//       chatMessages.style.paddingBottom = '80px'; // Reset to original footer height
//       chatMessages.style.transition = 'padding-bottom 0.3s ease-in-out';
//     }

//     // Reset ion-content
//     if (ionContent) {
//       ionContent.style.paddingBottom = '0px';
//       ionContent.style.transition = 'padding-bottom 0.3s ease-in-out';
//     }
//   }

//   private setupFallbackKeyboardDetection() {
//     // Fallback for web or when keyboard plugin is not available
//     let initialViewportHeight = window.visualViewport?.height || window.innerHeight;
//     let initialChatPadding = 80; // Initial padding bottom

//     const handleViewportChange = () => {
//       const currentHeight = window.visualViewport?.height || window.innerHeight;
//       const heightDifference = initialViewportHeight - currentHeight;

//       const footer = document.querySelector('.footer-fixed') as HTMLElement;
//       const chatMessages = document.querySelector('.chat-messages') as HTMLElement;
//       const ionContent = document.querySelector('ion-content') as HTMLElement;

//       if (heightDifference > 150) { // Keyboard is likely open
//         if (footer) {
//           footer.style.bottom = `${heightDifference}px`;
//           footer.style.transition = 'bottom 0.3s ease-in-out';
//         }
//         if (chatMessages) {
//           chatMessages.style.paddingBottom = `${heightDifference + initialChatPadding}px`;
//           chatMessages.style.transition = 'padding-bottom 0.3s ease-in-out';
//         }
//         if (ionContent) {
//           ionContent.style.paddingBottom = `${heightDifference}px`;
//           ionContent.style.transition = 'padding-bottom 0.3s ease-in-out';
//         }
//         // Auto scroll when keyboard opens
//         setTimeout(() => {
//           this.scrollToBottom();
//         }, 350);
//       } else {
//         // Reset all elements
//         if (footer) {
//           footer.style.bottom = '0px';
//           footer.style.transition = 'bottom 0.3s ease-in-out';
//         }
//         if (chatMessages) {
//           chatMessages.style.paddingBottom = `${initialChatPadding}px`;
//           chatMessages.style.transition = 'padding-bottom 0.3s ease-in-out';
//         }
//         if (ionContent) {
//           ionContent.style.paddingBottom = '0px';
//           ionContent.style.transition = 'padding-bottom 0.3s ease-in-out';
//         }
//       }
//     };

//     if (window.visualViewport) {
//       window.visualViewport.addEventListener('resize', handleViewportChange);
//     } else {
//       window.addEventListener('resize', handleViewportChange);
//     }
//   }

//   private adjustFooterPosition() {
//     // Additional method for manual adjustment
//     if (this.platform.is('mobile')) {
//       const footer = document.querySelector('.footer-fixed') as HTMLElement;
//       const chatMessages = document.querySelector('.chat-messages') as HTMLElement;

//       if (footer) {
//         footer.classList.add('keyboard-active');
//       }
//       if (chatMessages) {
//         chatMessages.classList.add('keyboard-active');
//       }
//     }
//   }

//   private resetFooterPosition() {
//     const footer = document.querySelector('.footer-fixed') as HTMLElement;
//     const chatMessages = document.querySelector('.chat-messages') as HTMLElement;

//     if (footer) {
//       footer.classList.remove('keyboard-active');
//     }
//     if (chatMessages) {
//       chatMessages.classList.remove('keyboard-active');
//     }
//   }
// }


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
//   chatType: 'private' | 'group' = 'private'; // default to private
//   groupName = '';// add this today

//   async ngOnInit() {
//     Keyboard.setScroll({ isDisabled: false });
//     await this.initKeyboardListeners();

//     this.senderId = localStorage.getItem('userId') || '';
//     const rawId = this.route.snapshot.queryParamMap.get('receiverId') || '';
//     const chatTypeParam = this.route.snapshot.queryParamMap.get('isGroup');

//     this.chatType = chatTypeParam === 'true' ? 'group' : 'private';

//     if (this.chatType === 'group') {
//       this.roomId = decodeURIComponent(rawId); // group id is the roomId
//     } else {
//       this.receiverId = decodeURIComponent(rawId);
//       this.roomId = this.getRoomId(this.senderId, this.receiverId);
//     }

//     this.loadFromLocalStorage();
//     this.listenForMessages();
//     setTimeout(() => this.scrollToBottom(), 100);
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
//       this.saveToLocalStorage();
//       setTimeout(() => this.scrollToBottom(), 100);
//     });
//   }

//   loadMessagesFromFirebase(isPagination = false) {
//     // Optional: Pagination logic using Firebase `limitToLast`, `endAt`, etc.
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

//     this.chatService.sendMessage(this.roomId, message);

//     this.messageText = '';
//     this.showSendButton = false;
//     this.scrollToBottom();
//   }

//   saveToLocalStorage() {
//     localStorage.setItem(this.roomId, JSON.stringify(this.messages));
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

//   goToCallingScreen() {
//     this.router.navigate(['/calling-screen']);
//   }

//   onInputBlur() {
//     setTimeout(() => {
//       this.resetFooterPosition();
//     }, 300);
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
//   Keyboard.setScroll({ isDisabled: false });
//   await this.initKeyboardListeners();

//   this.senderId = localStorage.getItem('userId') || '';
//   const rawId = this.route.snapshot.queryParamMap.get('receiverId') || '';
//   const chatTypeParam = this.route.snapshot.queryParamMap.get('isGroup');

//   this.chatType = chatTypeParam === 'true' ? 'group' : 'private';

//   if (this.chatType === 'group') {
//     this.roomId = decodeURIComponent(rawId);
//     await this.fetchGroupName(this.roomId);
//   } else {
//     this.receiverId = decodeURIComponent(rawId);
//     this.roomId = this.getRoomId(this.senderId, this.receiverId);
//   }

//   this.loadFromLocalStorage();
//   this.listenForMessages();
//   setTimeout(() => this.scrollToBottom(), 100);
// }

// async fetchGroupName(groupId: string) {
//   try {
//     const db = getDatabase();
//     const groupRef = ref(db, `groups/${groupId}`);
//     const snapshot = await get(groupRef);

//     if (snapshot.exists()) {
//       const groupData = snapshot.val();
//       this.groupName = groupData.name || 'Group';
//     } else {
//       this.groupName = 'Group';
//     }
//   } catch (error) {
//     console.error('Error fetching group name:', error);
//     this.groupName = 'Group';
//   }
// }


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
//       if (
//         msgDate.getDate() === today.getDate() &&
//         msgDate.getMonth() === today.getMonth() &&
//         msgDate.getFullYear() === today.getFullYear()
//       ) {
//         label = 'Today';
//       } else if (
//         msgDate.getDate() === yesterday.getDate() &&
//         msgDate.getMonth() === yesterday.getMonth() &&
//         msgDate.getFullYear() === yesterday.getFullYear()
//       ) {
//         label = 'Yesterday';
//       }

//       if (!grouped[label]) {
//         grouped[label] = [];
//       }
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

//     this.chatService.sendMessage(this.roomId, message);

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
  AfterViewInit
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonicModule, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Keyboard } from '@capacitor/keyboard';
import { FirebaseChatService } from 'src/app/services/firebase-chat.service';
import { EncryptionService } from 'src/app/services/encryption.service';
import { getDatabase, ref, get } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';

interface Message{
  key?: any;
  message_id : string;
  sender_id : string;
  sender_phone : string;
  receiver_id? : string;
  receiver_phone? : string;
  type? : "text" | "audio" | "video" | "image";
  text? : string;
  url? : string;
  delivered : boolean;
  read : boolean;
  timestamp : string;
  time? : string;
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

  private chatService = inject(FirebaseChatService);
  private route = inject(ActivatedRoute);
  private platform = inject(Platform);
  private encryptionService = inject(EncryptionService);
  private router = inject(Router);

  roomId = '';
  limit = 10;
  page = 0;
  isLoadingMore = false;
  hasMoreMessages = true;
  chatType: 'private' | 'group' = 'private';
  groupName = '';
  isGroup: any;
  receiver_name = '';

  async ngOnInit() {
  // Enable proper keyboard scrolling
  Keyboard.setScroll({ isDisabled: false });
  await this.initKeyboardListeners();

  // Load sender (current user) details
  this.senderId = localStorage.getItem('userId') || '';
  this.sender_phone = localStorage.getItem('phone_number') || '';
  this.receiver_name = localStorage.getItem('receiver_name') || '';

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


  private async markMessagesAsRead() {
    const lastMessage = this.messages[this.messages.length - 1];
    if (lastMessage && lastMessage.sender_id !== this.senderId) {
      await this.chatService.resetUnreadCount(this.roomId, this.senderId);
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

  ngAfterViewInit() {
    if (this.ionContent) {
      this.ionContent.ionScroll.subscribe(async (event: any) => {
        if (event.detail.scrollTop < 50 && this.hasMoreMessages && !this.isLoadingMore) {
          this.page += 1;
          this.loadMessagesFromFirebase(true);
        }
      });
    }
  }

  getRoomId(userA: string, userB: string): string {
    return userA < userB ? `${userA}_${userB}` : `${userB}_${userA}`;
  }


  async listenForMessages() {
  this.messageSub = this.chatService.listenForMessages(this.roomId).subscribe(async (data) => {
    const decryptedMessages: Message[] = [];

    for (const msg of data) {
      const decryptedText = await this.encryptionService.decrypt(msg.text);
      decryptedMessages.push({ ...msg, text: decryptedText });

      // ✅ Mark as delivered if current user is the receiver and not already delivered
      console.log(msg);
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
      this.observeVisibleMessages(); // 👁️ Call visibility tracking after messages rendered
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

  async sendMessage() {
    if (!this.messageText.trim()) return;
    console.log(this.sender_phone);
    console.log("fdgsg", this.senderId);
    const date = new Date();
    const plainText = this.messageText.trim();
    const encryptedText = await this.encryptionService.encrypt(plainText);

    const message: Message = {
      sender_id: this.senderId,
      text: encryptedText,
      timestamp: String(new Date()),
      sender_phone: this.sender_phone,
      receiver_id: '',
      receiver_phone: this.receiver_phone,
      delivered: false,
      read: false,
      message_id: uuidv4()
    };

    console.log(message);

    if (this.chatType === 'private') {
      message.receiver_id = this.receiverId;
    }

    this.chatService.sendMessage(this.roomId, message, this.chatType, this.senderId);

    this.messageText = '';
    this.showSendButton = false;
    this.scrollToBottom();
  }

  loadMessagesFromFirebase(isPagination = false) {}

  goToProfile() {
  const queryParams: any = {
    receiverId: this.chatType === 'group' ? this.roomId : this.receiverId,
    receiver_phone: this.receiver_phone,
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
    const initialViewportHeight = window.visualViewport?.height || window.innerHeight;
    const initialChatPadding = 80;

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
        setTimeout(() => this.scrollToBottom(), 350);
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
