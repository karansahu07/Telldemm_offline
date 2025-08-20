/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
// import {onRequest} from "firebase-functions/https";
// import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


// import * as functions from 'firebase-functions/v1';
// import * as admin from 'firebase-admin';

// admin.initializeApp();

// export const sendNotificationOnNewMessage = functions.database
//   .ref('/chats/{chatId}/messages/{messageId}')
//   .onCreate(async (snapshot, context) => {
//     const messageData = snapshot.val();
//     const chatId = context.params.chatId;

//     try {
//       // Receiver ka FCM token get kariye
//       const receiverTokenSnapshot = await admin.database()
//         .ref(`/users/${messageData.receiverId}/fcmToken`)
//         .once('value');

//       const receiverToken = receiverTokenSnapshot.val();

//       if (!receiverToken) {
//         console.log('Receiver FCM token not found');
//         return;
//       }

//       // Sender ka name get kariye
//       const senderSnapshot = await admin.database()
//         .ref(`/users/${messageData.senderId}/name`)
//         .once('value');

//       const senderName = senderSnapshot.val() || 'Unknown';

//       // Notification payload
//       const payload = {
//         notification: {
//           title: senderName,
//           body: messageData.message,
//           icon: 'assets/icon/favicon.ico',
//           click_action: 'FCM_PLUGIN_ACTIVITY',
//         },
//         data: {
//           chatId: chatId,
//           senderId: messageData.senderId,
//           messageId: context.params.messageId,
//         },
//       };

//       // Send notification
//       const response = await admin.messaging().sendToDevice(receiverToken, payload);
//       console.log('Notification sent successfully:', response);

//     } catch (error) {
//       console.error('Error sending notification:', error);
//     }
//   });



import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const sendNotificationOnNewMessage = functions.database
  .ref('/chats/{roomId}/{messageId}')
  .onCreate(async (snapshot: functions.database.DataSnapshot, context: functions.EventContext) => {
    const messageData = snapshot.val();
    const roomId = context.params.roomId;
    const messageId = context.params.messageId;
    
    try {
      // Receiver ka FCM token get kariye (aapke structure ke according)
      const receiverTokenSnapshot = await admin.database()
        .ref(`/users/${messageData.receiver_id}/fcmToken`)
        .once('value');
      
      const receiverToken = receiverTokenSnapshot.val();
      
      if (!receiverToken) {
        console.log('Receiver FCM token not found for:', messageData.receiver_id);
        return;
      }
      
      // Check if sender is not same as receiver (avoid self-notification)
      if (messageData.sender_id === messageData.receiver_id) {
        console.log('Self message, notification not sent');
        return;
      }
      
      // Message body prepare kariye - encrypted text ko decrypt karna hoga ya direct show
      let messageBody = 'New message'; // Default text
      
      // Agar text message hai
      if (messageData.text) {
        // Agar aap encrypted text decrypt karna chahte hain notification me
        messageBody = 'You received a message'; // Generic message for privacy
        // OR direct encrypted text show kar sakte hain (not recommended)
        // messageBody = messageData.text;
      }
      

      if (messageData.attachment) {
        switch (messageData.attachment.type) {
          case 'image':
            messageBody = '📷 Image';
            break;
          case 'video':
            messageBody = '🎥 Video';
            break;
          case 'audio':
            messageBody = '🎵 Audio';
            break;
          case 'document':
            messageBody = '📄 Document';
            break;
          default:
            messageBody = '📎 Attachment';
        }
      }
      
      // Notification payload
      const payload = {
        notification: {
          title: messageData.sender_name || 'New Message',
          body: messageBody,
          icon: 'assets/icon/favicon.ico',
          click_action: 'FCM_PLUGIN_ACTIVITY',
          sound: 'default'
        },
        data: {
          roomId: roomId,
          senderId: messageData.sender_id,
          receiverId: messageData.receiver_id,
          messageId: messageId,
          chatType: 'private', // aapke according set kariye
          timestamp: messageData.timestamp
        }
      };
      
      // Send notification
      const response = await admin.messaging().sendToDevice(receiverToken, payload);
      console.log('Notification sent successfully:', response);
      
      // Optional: Message ko delivered mark kar sakte hain
      await admin.database()
        .ref(`/chats/${roomId}/messages/${messageId}/delivered`)
        .set(true);
      
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  });