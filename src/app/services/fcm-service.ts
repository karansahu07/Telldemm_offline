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



import { Injectable } from '@angular/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { getDatabase, ref, set } from 'firebase/database';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class FcmService {
  private fcmToken: string = '';
  
  constructor(private router: Router) { }

  async initializePushNotifications() {
    try {
      // Request permission
      const result = await PushNotifications.requestPermissions();
      
      if (result.receive === 'granted') {
        // Register for push notifications
        await PushNotifications.register();
        
        // Get FCM token
        PushNotifications.addListener('registration', (token: Token) => {
          console.log('FCM Token:', token.value);
          this.fcmToken = token.value;
          // Token ko temporarily store kar liye, profile setup ke baad save karenge
        });
        
        // Handle notification received (when app is open)
        PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
          console.log('Push received: ', notification);
          // Optional: Show in-app notification or update badge
        });
        
        // Handle notification click (when app is closed/background)
        PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
          console.log('Push action performed: ', notification);
          const roomId = notification.notification.data?.roomId;
          const senderId = notification.notification.data?.senderId;
          
          if (roomId && senderId) {
            // Navigate to specific chat
            this.router.navigate(['/chat', roomId, senderId]);
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
  
  // Profile setup ke baad ye function call kariye
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
  
  // Token refresh handle karne ke liye
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
  
  // User offline karne ke liye (optional)
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