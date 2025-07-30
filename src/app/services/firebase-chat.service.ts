// import { Injectable } from '@angular/core';
// import { Database, ref, push, onValue } from '@angular/fire/database';
// import { Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class FirebaseChatService {
//   constructor(private db: Database) {}

//   // Send message
//   sendMessage(roomId: string, message: any) {
//     const messagesRef = ref(this.db, `chats/${roomId}`);
//     return push(messagesRef, message);
//   }

//   // Listen for new messages
//   listenForMessages(roomId: string): Observable<any[]> {
//     return new Observable((observer) => {
//       const messagesRef = ref(this.db, `chats/${roomId}`);
//       onValue(messagesRef, (snapshot) => {
//         const data = snapshot.val();
//         const messages = data ? Object.entries(data).map(([key, val]) => ({ key, ...(val as any) })) : [];
//         observer.next(messages);
//       });
//     });
//   }
//}



// import { Injectable } from '@angular/core';
// import {
//   Database,
//   ref,
//   push,
//   onValue,
//   set,
//   get,
//   child
// } from '@angular/fire/database';
// import { Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class FirebaseChatService {
//   constructor(private db: Database) {}

//   /** 🔹 Send message to a chat room (group or 1:1) */
//   sendMessage(roomId: string, message: any) {
//     const messagesRef = ref(this.db, `chats/${roomId}`);
//     return push(messagesRef, message);
//   }

//   /** 🔹 Listen to all messages in a room (group or 1:1) */
//   listenForMessages(roomId: string): Observable<any[]> {
//     return new Observable((observer) => {
//       const messagesRef = ref(this.db, `chats/${roomId}`);
//       onValue(messagesRef, (snapshot) => {
//         const data = snapshot.val();
//         const messages = data
//           ? Object.entries(data).map(([key, val]) => ({
//               key,
//               ...(val as any)
//             }))
//           : [];
//         observer.next(messages);
//       });
//     });
//   }

//   /** ✅ Create a new group */
//   async createGroup(groupId: string, groupName: string, members: string[]): Promise<void> {
//     const groupRef = ref(this.db, `groups/${groupId}`);
//     const memberMap = members.reduce((acc, id) => {
//       acc[id] = true;
//       return acc;
//     }, {} as Record<string, boolean>);

//     await set(groupRef, {
//       name: groupName,
//       members: memberMap
//     });
//   }

//   /** 🔍 Get group metadata */
//   async getGroupInfo(groupId: string): Promise<any> {
//     const snapshot = await get(child(ref(this.db), `groups/${groupId}`));
//     return snapshot.exists() ? snapshot.val() : null;
//   }

//   /** 🔍 Get all groups user belongs to */
//   async getGroupsForUser(userId: string): Promise<string[]> {
//     const snapshot = await get(child(ref(this.db), 'groups'));
//     const allGroups = snapshot.val();
//     const userGroups: string[] = [];

//     if (allGroups) {
//       Object.entries(allGroups).forEach(([groupId, groupData]: any) => {
//         if (groupData.members?.[userId]) {
//           userGroups.push(groupId);
//         }
//       });
//     }

//     return userGroups;
//   }

  
// }



// import { Injectable } from '@angular/core';
// import {
//   Database,
//   ref,
//   push,
//   onValue,
//   set,
//   get,
//   child,
//   runTransaction
// } from '@angular/fire/database';
// import { Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class FirebaseChatService {
//   constructor(private db: Database) {}

//   /** 🔹 Send message to a chat room (group or 1:1) */
//   sendMessage(roomId: string, message: any) {
//     const messagesRef = ref(this.db, `chats/${roomId}/messages`);
//     return push(messagesRef, message);
//   }

//   /** 🔹 Listen to all messages in a room (group or 1:1) */
//   listenForMessages(roomId: string): Observable<any[]> {
//     return new Observable((observer) => {
//       const messagesRef = ref(this.db, `chats/${roomId}/messages`);
//       onValue(messagesRef, (snapshot) => {
//         const data = snapshot.val();
//         const messages = data
//           ? Object.entries(data).map(([key, val]) => ({
//               key,
//               ...(val as any)
//             }))
//           : [];
//         observer.next(messages);
//       });
//     });
//   }

//   /** ✅ Create a new group */
//   async createGroup(groupId: string, groupName: string, members: string[]): Promise<void> {
//     const groupRef = ref(this.db, `groups/${groupId}`);
//     const memberMap = members.reduce((acc, id) => {
//       acc[id] = true;
//       return acc;
//     }, {} as Record<string, boolean>);

//     await set(groupRef, {
//       name: groupName,
//       members: memberMap
//     });
//   }

//   /** 🔍 Get group metadata */
//   async getGroupInfo(groupId: string): Promise<any> {
//     const snapshot = await get(child(ref(this.db), `groups/${groupId}`));
//     return snapshot.exists() ? snapshot.val() : null;
//   }

//   /** 🔍 Get all groups user belongs to */
//   async getGroupsForUser(userId: string): Promise<string[]> {
//     const snapshot = await get(child(ref(this.db), 'groups'));
//     const allGroups = snapshot.val();
//     const userGroups: string[] = [];

//     if (allGroups) {
//       Object.entries(allGroups).forEach(([groupId, groupData]: any) => {
//         if (groupData.members?.[userId]) {
//           userGroups.push(groupId);
//         }
//       });
//     }

//     return userGroups;
//   }

//   /** ✅ Generate consistent chat ID for 1:1 chat */
//   generateChatId(user1: string, user2: string): string {
//     return [user1, user2].sort().join('_');
//   }

//   /** ✅ Get unread count for a user in chat/group */
//   getUnreadCount(roomId: string, userId: string): Promise<number> {
//   return get(child(ref(this.db), `unreadCounts/${roomId}/${userId}`)).then(snapshot =>
//     snapshot.exists() ? snapshot.val() : 0
//   );
// }

// markAsRead(roomId: string, userId: string): Promise<void> {
//   const countRef = ref(this.db, `unreadCounts/${roomId}/${userId}`);
//   return set(countRef, 0);
// }

//   /** ✅ Increment unread count for a user */
//   async incrementUnreadCount(roomId: string, userId: string): Promise<void> {
//     const countRef = ref(this.db, `chats/${roomId}/unreadCounts/${userId}`);
//     await runTransaction(countRef, (currentCount) => {
//       return (currentCount || 0) + 1;
//     });
//   }

//   /** ✅ Reset unread count to 0 when user views chat */
//   async resetUnreadCount(roomId: string, userId: string): Promise<void> {
//     const countRef = ref(this.db, `chats/${roomId}/unreadCounts/${userId}`);
//     await set(countRef, 0);
//   }
// }





import { Injectable } from '@angular/core';
import {
  Database,
  ref,
  push,
  onValue,
  set,
  get,
  child,
  runTransaction
} from '@angular/fire/database';
import { Observable } from 'rxjs';
import { getDatabase, update } from 'firebase/database';
import { getStorage, uploadBytes, getDownloadURL } from 'firebase/storage';

@Injectable({ providedIn: 'root' })
export class FirebaseChatService {
  //   /** 🔍 Get group metadata */
  //   async getGroupInfo(groupId: string): Promise<any> {
  //     const snapshot = await get(child(ref(this.db), `groups/${groupId}`));
  //     return snapshot.exists() ? snapshot.val() : null;
  //   }
  //   /** 🔍 Get all groups user belongs to */
  //   async getGroupsForUser(userId: string): Promise<string[]> {
  //     const snapshot = await get(child(ref(this.db), 'groups'));
  //     const allGroups = snapshot.val();
  //     const userGroups: string[] = [];
  //     if (allGroups) {
  //       Object.entries(allGroups).forEach(([groupId, groupData]: any) => {
  //         if (groupData.members?.[userId]) {
  //           userGroups.push(groupId);
  //         }
  //       });
  //     }
  //     return userGroups;
  //   }
  //   /** ✅ Generate consistent chat ID for 1:1 chat */
  //   generateChatId(user1: string, user2: string): string {
  //     return [user1, user2].sort().join('_');
  //   }
  //   /** ✅ Get unread count for a user in chat/group */
  //   getUnreadCount(roomId: string, userId: string): Promise<number> {
  //   return get(child(ref(this.db), `unreadCounts/${roomId}/${userId}`)).then(snapshot =>
  //     snapshot.exists() ? snapshot.val() : 0
  //   );
  // }
  // markAsRead(roomId: string, userId: string): Promise<void> {
  //   const countRef = ref(this.db, `unreadCounts/${roomId}/${userId}`);
  //   return set(countRef, 0);
  // }
  //   /** ✅ Increment unread count for a user */
  //   async incrementUnreadCount(roomId: string, userId: string): Promise<void> {
  //     const countRef = ref(this.db, `chats/${roomId}/unreadCounts/${userId}`);
  //     await runTransaction(countRef, (currentCount) => {
  //       return (currentCount || 0) + 1;
  //     });
  //   }
  //   /** ✅ Reset unread count to 0 when user views chat */
  //   async resetUnreadCount(roomId: string, userId: string): Promise<void> {
  //     const countRef = ref(this.db, `chats/${roomId}/unreadCounts/${userId}`);
  //     await set(countRef, 0);
  //   }
  // }
  getRoomId(senderId: string, arg1: string): string {
    throw new Error('Method not implemented.');
  }
  constructor(private db: Database) {}

  async sendMessage(roomId: string, message: any, chatType: string, senderId: string) {
    const messagesRef = ref(this.db, `chats/${roomId}`);
    await push(messagesRef, message);

    if (chatType === 'private') {
      // Increment unread for receiver only
      const receiverId = message.receiver_id;
      if (receiverId && receiverId !== senderId) {
        this.incrementUnreadCount(roomId, receiverId);
      }
    } else if (chatType === 'group') {
      // Increment unread for all members except sender
      const groupSnapshot = await get(ref(this.db, `groups/${roomId}/members`));
      const members = groupSnapshot.val();
      if (members) {
        Object.keys(members).forEach(memberId => {
          if (memberId !== senderId) {
            this.incrementUnreadCount(roomId, memberId);
          }
        });
      }
    }
  }

  listenForMessages(roomId: string): Observable<any[]> {
    return new Observable(observer => {
      const messagesRef = ref(this.db, `chats/${roomId}`);
      onValue(messagesRef, snapshot => {
        const data = snapshot.val();
        const messages = data ? Object.entries(data).map(([key, val]) => ({ key, ...(val as any) })) : [];
        observer.next(messages);
      });
    });
  }



// async createGroup(groupId: string, groupName: string, members: any[], currentUserId: string) {
//   const db = getDatabase();
//   const groupRef = ref(db, `groups/${groupId}`);

//   const groupData = {
//     name: groupName,
//     groupId,
//     members: members.reduce((acc, member) => {
//       acc[member.user_id] = {
//         name: member.name,
//         phone_number: member.phone_number,
//         status: "active",
//         role: member.user_id === currentUserId ? "admin" : "member"
//       };
//       return acc;
//     }, {}),
//     createdAt: String(new Date()),
//   };

//   await set(groupRef, groupData);
// }


async createGroup(groupId: string, groupName: string, members: any[], currentUserId: string) {
  const db = getDatabase();
  const groupRef = ref(db, `groups/${groupId}`);

  // Find current user's name from the members array
  const currentUser = members.find(m => m.user_id === currentUserId);
  const currentUserName = currentUser?.name || 'Unknown';

  console.log("currentUser",currentUserName);

  const groupData = {
    name: groupName,
    groupId,
    description: 'Hey I am using Telldemm',
    createdBy: currentUserId,
    createdByName: currentUserName,                 
    // createdAt: new Date().toISOString(),
    createdAt: new Date().toLocaleString(), 
    members: members.reduce((acc, member) => {
      acc[member.user_id] = {
        name: member.name,
        phone_number: member.phone_number,
        status: "active",
        role: member.user_id === currentUserId ? "admin" : "member"
      };
      return acc;
    }, {})
  };

  await set(groupRef, groupData);
}





  async getGroupInfo(groupId: string): Promise<any> {
    const snapshot = await get(child(ref(this.db), `groups/${groupId}`));
    return snapshot.exists() ? snapshot.val() : null;
  }

//   async getGroupInfo(groupId: string): Promise<any> {
//   const groupRef = ref(this.db, `groups/${groupId}`);
//   const snapshot = await get(groupRef);
//   return snapshot.exists() ? snapshot.val() : null;
// }


  async getGroupsForUser(userId: string): Promise<string[]> {
    const snapshot = await get(child(ref(this.db), 'groups'));
    const allGroups = snapshot.val();
    const userGroups: string[] = [];

    if (allGroups) {
      Object.entries(allGroups).forEach(([groupId, groupData]: any) => {
        if (groupData.members?.[userId]) {
          userGroups.push(groupId);
        }
      });
    }

    return userGroups;
  }

//   async getGroupsForUser(userId: string): Promise<string[]> {
//   const snapshot = await get(child(ref(this.db), 'groups'));
//   const allGroups = snapshot.val();
//   const userGroups: string[] = [];

//   if (allGroups) {
//     Object.entries(allGroups).forEach(([groupId, groupData]: [string, any]) => {
//       if (groupData.members?.[userId]) {
//         userGroups.push(groupId);
//       }
//     });
//   }

//   return userGroups;
// }

 // ✅ Create a community
  async createCommunity(communityId: string, name: string, description: string, createdBy: string): Promise<void> {
    const communityRef = ref(this.db, `communities/${communityId}`);
    await set(communityRef, {
      name,
      description,
      createdBy,
      groups: {}
    });
  }

  // ✅ Add user to community
  async addUserToCommunity(userId: string, communityId: string): Promise<void> {
    const userRef = ref(this.db, `users/${userId}/joinedCommunities/${communityId}`);
    await set(userRef, true);
  }

  // 🔍 Get all groups inside a community
  async getGroupsInCommunity(communityId: string): Promise<string[]> {
    const snapshot = await get(child(ref(this.db), `communities/${communityId}/groups`));
    const groups = snapshot.val();
    return groups ? Object.keys(groups) : [];
  }

  // 🔍 Get all communities user has joined
  async getUserCommunities(userId: string): Promise<string[]> {
    const snapshot = await get(child(ref(this.db), `users/${userId}/joinedCommunities`));
    const communities = snapshot.val();
    return communities ? Object.keys(communities) : [];
  }


  incrementUnreadCount(roomId: string, receiverId: string) {
    const unreadRef = ref(this.db, `unreadCounts/${roomId}/${receiverId}`);
    return runTransaction(unreadRef, count => (count || 0) + 1);
  }

  resetUnreadCount(roomId: string, userId: string) {
    const unreadRef = ref(this.db, `unreadCounts/${roomId}/${userId}`);
    return set(unreadRef, 0);
  }

  listenToUnreadCount(roomId: string, userId: string): Observable<number> {
    return new Observable(observer => {
      const unreadRef = ref(this.db, `unreadCounts/${roomId}/${userId}`);
      onValue(unreadRef, snapshot => {
        const val = snapshot.val();
        observer.next(val || 0);
      });
    });
  }

  async getGroupMembers(groupId: string): Promise<string[]> {
    const snapshot = await get(ref(this.db, `groups/${groupId}/members`));
    const membersObj = snapshot.val();
    return membersObj ? Object.keys(membersObj) : [];
  }

 // 👇 Call when message arrives on receiver's device
  markDelivered(roomId: string, messageKey: string) {
    const messageRef = ref(this.db, `chats/${roomId}/${messageKey}`);
    // console.log("sdffsdd",messageRef);
    update(messageRef, { delivered: true });
  }

  // 👇 Call only when message is visibly seen
  markRead(roomId: string, messageKey: string) {
    const messageRef = ref(this.db, `chats/${roomId}/${messageKey}`);
    update(messageRef, { read: true });
  }
}
