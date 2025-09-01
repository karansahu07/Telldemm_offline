// import { Injectable } from '@angular/core';
// import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
// import { getDatabase, ref, set } from 'firebase/database';
// import { getAuth } from 'firebase/auth';

// @Injectable({
//   providedIn: 'root'
// })
// export class FcmService {
  
//   constructor() { }

//   async initializePushNotifications() {
//     // Request permission
//     const result = await PushNotifications.requestPermissions();
    
//     if (result.receive === 'granted') {
//       // Register for push notifications
//       await PushNotifications.register();
      
//       // Get FCM token
//       PushNotifications.addListener('registration', (token: Token) => {
//         console.log('FCM Token:', token.value);
//         this.saveFcmTokenToDatabase(token.value);
//       });
      
//       // Handle notification received
//       PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
//         console.log('Push received: ', notification);
//       });
      
//       // Handle notification click
//       PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
//         console.log('Push action performed: ', notification);
//         // Navigate to specific chat
//         const chatId = notification.notification.data?.chatId;
//         if (chatId) {
//           // Router navigation logic yahan add kariye
//         }
//       });
//     }
//   }
  
//   private saveFcmTokenToDatabase(token: string) {
//     const auth = getAuth();
//     const user = auth.currentUser;
    
//     if (user) {
//       const db = getDatabase();
//       const userRef = ref(db, `users/${user.uid}/fcmToken`);
//       set(userRef, token);
//     }
//   }
// }



// import { Injectable } from '@angular/core';
// import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
// import { getDatabase, ref, set } from 'firebase/database';
// import { Router } from '@angular/router';
// import { ApiService } from './api/api.service';

// @Injectable({
//   providedIn: 'root'
// })
// export class FcmService {
//   private fcmToken: string = '';
  
//   constructor(
//     private router: Router,
//     private service : ApiService
//   ) { }

//   async initializePushNotifications() {
//     try {
//       // Request permission
//       const result = await PushNotifications.requestPermissions();
      
//       if (result.receive === 'granted') {
//         // Register for push notifications
//         await PushNotifications.register();
        
//         // Get FCM token
//         PushNotifications.addListener('registration', (token: Token) => {
//           console.log('FCM Token:', token.value);
//           this.fcmToken = token.value;
//           // Token ko temporarily store kar liye, profile setup ke baad save karenge
//         });
        
//         // Handle notification received (when app is open)
//         PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
//           console.log('Push received: ', notification);
//           // Optional: Show in-app notification or update badge
//         });
        
//         // Handle notification click (when app is closed/background)
//         PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
//           console.log('Push action performed: ', notification);
//           const roomId = notification.notification.data?.roomId;
//           const senderId = notification.notification.data?.senderId;
          
//           if (roomId && senderId) {
//             // Navigate to specific chat
//             this.router.navigate(['/chat', roomId, senderId]);
//           }
//         });
        
//         return true;
//       } else {
//         console.log('Push notification permission denied');
//         return false;
//       }
//     } catch (error) {
//       console.error('Error initializing push notifications:', error);
//       return false;
//     }
//   }
  
//   // Profile setup ke baad ye function call ho rha hai
//   async saveFcmTokenToDatabase(userId: string, userName: string, userPhone: string) {
//     try {
//       if (!this.fcmToken) {
//         // console.log("fcm token is", this.fcmToken);
//         console.log('FCM Token not available yet, retrying...');
//         // Retry after 2 seconds
//         setTimeout(() => {
//           if (this.fcmToken) {
//             this.saveFcmTokenToDatabase(userId, userName, userPhone);
//           }
//         }, 2000);
//         return;
//       }
       
//       const db = getDatabase();
//       const userRef = ref(db, `users/${userId}`);
      
//       const userData = {
//         name: userName,
//         phone: userPhone,
//         fcmToken: this.fcmToken,
//         lastActive: new Date().toISOString(),
//         isOnline: true
//       };
      
//       await set(userRef, userData);
//       console.log('User data and FCM token saved successfully');

//       this.service.pushFcmToAdmin(Number(userId), this.fcmToken).subscribe({
//         next: (res : any) => console.log('✅ Token saved in backend:', res),
//         error: (err : any) => console.error('❌ Error saving token in backend:', err),
//       });
      
//     } catch (error) {
//       console.error('Error saving FCM token:', error);
//     }
//   }
  
//   async updateFcmToken(userId: string) {
//     try {
//       if (this.fcmToken && userId) {
//         const db = getDatabase();
//         const tokenRef = ref(db, `users/${userId}/fcmToken`);
//         await set(tokenRef, this.fcmToken);
//         console.log('FCM Token updated successfully');
//       }
//     } catch (error) {
//       console.error('Error updating FCM token:', error);
//     }
//   }
  
//   // Get current FCM token
//   getFcmToken(): string {
//     return this.fcmToken;
//   }
  
//   // User offline karne ke liye (optional)
//   async setUserOffline(userId: string) {
//     try {
//       const db = getDatabase();
//       const userRef = ref(db, `users/${userId}/isOnline`);
//       await set(userRef, false);
//     } catch (error) {
//       console.error('Error setting user offline:', error);
//     }
//   }
// }



import { Injectable } from '@angular/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { getDatabase, ref, set } from 'firebase/database';
import { Router } from '@angular/router';
import { Platform, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class FcmService {
  private fcmToken: string = '';

  constructor(
    private router: Router,
    private platform: Platform,
    private toastController: ToastController // Inject ToastController
  ) {}

  async initializePushNotifications(): Promise<boolean> {
    try {
      // Request push notification permissions
      const result = await PushNotifications.requestPermissions();

      if (result.receive === 'granted') {
        // Register for push notifications
        await PushNotifications.register();

        // Request local notification permissions
        const localPermResult = await LocalNotifications.requestPermissions();
        if (localPermResult.display !== 'granted') {
          console.warn('Local notification permission not granted');
        }

        // Handle FCM token registration
        PushNotifications.addListener('registration', (token: Token) => {
          console.log('FCM Token:', token.value);
          this.fcmToken = token.value;
        });

        // Handle registration errors
        PushNotifications.addListener('registrationError', (error: any) => {
          console.error('FCM registration error:', error);
        });

        // Handle notification received (foreground)
        PushNotifications.addListener('pushNotificationReceived', async (notification: PushNotificationSchema) => {
          console.log('Push received (foreground):', notification);

          // Display OS-level notification and toast when app is in foreground
          if (this.platform.is('ios') || this.platform.is('android')) {
            await this.showLocalNotification(notification);
          }
        });

        // Handle notification click (background/foreground)
        PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
          console.log('Push action performed:', notification);
          const data = notification.notification.data;
          const roomId = data?.roomId;
          const senderId = data?.senderId;

          if (roomId && senderId) {
            // Navigate to specific chat
            this.router.navigate(['/home-screen', roomId, senderId]);
          }
        });

        // Handle local notification click
        LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
          console.log('Local notification action performed:', notification);
          const data = notification.notification.extra || {};
          const roomId = data?.roomId;
          const senderId = data?.senderId;

          if (roomId && senderId) {
            // Navigate to specific chat
            this.router.navigate(['/home-screen', roomId, senderId]);
          }
        });

        return true;
      } else {
        console.log('Push notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return false;
    }
  }

  // Display local notification and toast for foreground
  private async showLocalNotification(notification: PushNotificationSchema) {
    try {
      // Schedule OS-level notification
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Math.random() * 1000000), // Unique ID for each notification
            title: notification.title || 'New Message',
            body: notification.body || 'You have a new message',
            extra: notification.data, // Use 'extra' for custom data
            sound: 'default', // Use default notification sound
            smallIcon: 'assets/icon/favicon.ico', // Ensure this icon exists in Android resources
            schedule: { at: new Date(Date.now() + 1000) }, // Show immediately (slight delay)
          }
        ]
      });
      console.log('Local notification scheduled for foreground');

      // Show toast notification
      const toast = await this.toastController.create({
        message: notification.body || 'You have a new message',
        duration: 3000, // Display for 3 seconds
        position: 'top', // Display at the top to mimic WhatsApp
        cssClass: 'custom-toast', // Custom class for styling
        buttons: [
          {
            text: 'View',
            handler: () => {
              const data = notification.data || {};
              const roomId = data.roomId;
              const senderId = data.senderId;
              if (roomId && senderId) {
                this.router.navigate(['/home-screen', roomId, senderId]);
              }
            }
          }
        ]
      });
      await toast.present();
      console.log('Toast notification displayed');
    } catch (error) {
      console.error('Error scheduling local notification or toast:', error);
    }
  }

  // Save FCM token and user data to Firebase
  async saveFcmTokenToDatabase(userId: string, userName: string, userPhone: string) {
    try {
      if (!this.fcmToken) {
        console.log('FCM Token not available yet, retrying...');
        // Retry after 2 seconds
        setTimeout(() => {
          if (this.fcmToken) {
            this.saveFcmTokenToDatabase(userId, userName, userPhone);
          }
        }, 2000);
        return;
      }

      const db = getDatabase();
      const userRef = ref(db, `users/${userId}`);

      const userData = {
        name: userName,
        phone: userPhone,
        fcmToken: this.fcmToken,
        lastActive: new Date().toISOString(),
        isOnline: true
      };

      await set(userRef, userData);
      console.log('User data and FCM token saved successfully');
    } catch (error) {
      console.error('Error saving FCM token:', error);
    }
  }

  // Update FCM token
  async updateFcmToken(userId: string) {
    try {
      if (this.fcmToken && userId) {
        const db = getDatabase();
        const tokenRef = ref(db, `users/${userId}/fcmToken`);
        await set(tokenRef, this.fcmToken);
        console.log('FCM Token updated successfully');
      }
    } catch (error) {
      console.error('Error updating FCM token:', error);
    }
  }

  // Get current FCM token
  getFcmToken(): string {
    return this.fcmToken;
  }

  // Set user offline
  async setUserOffline(userId: string) {
    try {
      const db = getDatabase();
      const userRef = ref(db, `users/${userId}/isOnline`);
      await set(userRef, false);
    } catch (error) {
      console.error('Error setting user offline:', error);
    }
  }
}