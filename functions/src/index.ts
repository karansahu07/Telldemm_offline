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
import { webcrypto } from 'crypto';

const { subtle } = webcrypto;

admin.initializeApp();

/**
 * AES Decrypt (same logic as frontend service)
 */
const secretKey = 'YourSuperSecretPassphrase';
let aesKey: CryptoKey | null = null;

// derive AES key
async function importAESKey(passphrase: string): Promise<void> {
  const enc = new TextEncoder();
  const keyMaterial = await subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  aesKey = await subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode('your_salt_value'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function decryptText(cipherText: string): Promise<string> {
  if (!aesKey) {
    await importAESKey(secretKey);
  }

  if (!cipherText) return '';

  try {
    const data = Uint8Array.from(atob(cipherText), c => c.charCodeAt(0));

    if (data.length <= 12) {
      return cipherText; // fallback (maybe plain text)
    }

    const iv = data.slice(0, 12);
    const encrypted = data.slice(12);

    const decrypted = await subtle.decrypt(
      { name: 'AES-GCM', iv },
      aesKey!,
      encrypted
    );

    return new TextDecoder().decode(decrypted);
  } catch (err) {
    console.error('❌ Decryption failed:', err);
    return cipherText;
  }
}

export const sendNotificationOnNewMessage = functions.database
  .ref('/chats/{roomId}/{messageId}')
  .onCreate(async (snapshot: functions.database.DataSnapshot, context: functions.EventContext) => {
    const messageData = snapshot.val();
    const roomId = context.params.roomId;
    const messageId = context.params.messageId;

    try {
      // ✅ Get receiver FCM token
      const receiverTokenSnapshot = await admin.database()
        .ref(`/users/${messageData.receiver_id}/fcmToken`)
        .once('value');

      const receiverToken = receiverTokenSnapshot.val();

      if (!receiverToken) {
        console.log('Receiver FCM token not found for:', messageData.receiver_id);
        return;
      }

      // ✅ Avoid self notification
      if (messageData.sender_id === messageData.receiver_id) {
        console.log('Self message, notification not sent');
        return;
      }

      // ✅ Prepare message body
      let messageBody = 'New message';

      if (messageData.text) {
        // 🔑 Decrypt text before sending notification
        messageBody = await decryptText(messageData.text);
      }

      if (messageData.attachment) {
        switch (messageData.attachment.type) {
          case 'image': messageBody = '📷 Image'; break;
          case 'video': messageBody = '🎥 Video'; break;
          case 'audio': messageBody = '🎵 Audio'; break;
          case 'document': messageBody = '📄 Document'; break;
          default: messageBody = '📎 Attachment';
        }
      }

      // ✅ Send notification (new format)
      const response = await admin.messaging().send({
        token: receiverToken,
        notification: {
          title: messageData.sender_name || 'New Message',
          body: messageBody,
        },
        android: {
          notification: {
            sound: 'default',
            clickAction: 'FCM_PLUGIN_ACTIVITY',
            icon: 'assets/icon/favicon.ico',
          },
        },
        data: {
          roomId: roomId,
          senderId: messageData.sender_id,
          receiverId: messageData.receiver_id,
          messageId: messageId,
          chatType: 'private',
          timestamp: messageData.timestamp.toString()
        }
      });

      console.log('✅ Notification sent successfully:', response);

      // (Optional) delivered mark
      // await admin.database()
      //   .ref(`/chats/${roomId}/messages/${messageId}/delivered`)
      //   .set(true);

    } catch (error) {
      console.error('❌ Error sending notification:', error);
    }
  });

