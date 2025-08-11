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
import { getDatabase, remove, update } from 'firebase/database';
// import { getStorage, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Message, PinnedMessage } from 'src/types';

@Injectable({ providedIn: 'root' })
export class FirebaseChatService {

  constructor(private db: Database) {}

  getRoomId(senderId: string, arg1: string): string {
    throw new Error('Method not implemented.');
  }

  async sendMessage(roomId: string, message: Message, chatType: string, senderId: string) {
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

  // async pinMessage(message: PinnedMessage) {
  //   console.log("messages dsgsd", message)
  //   const { roomId, pinnedBy, scope } = message;
  //   const key = scope === 'private' ? `${roomId}_${pinnedBy}` : roomId;
  //   const pinRef = ref(this.db, `pinnedMessages/${key}`);
  //   const snapshot = await get(pinRef);

  //   if (snapshot.exists()) {
  //     await update(pinRef, {
  //       key: message.key,
  //       messageId: message.messageId,
  //       pinnedAt: Date.now(),
  //       pinnedBy: message.pinnedBy,
  //       scope: message.scope
  //     });
  //   } else {
  //     await set(pinRef, {
  //       key: message.key,
  //       roomId: message.roomId,
  //       messageId: message.messageId,
  //       pinnedBy: message.pinnedBy,
  //       pinnedAt: Date.now(),
  //       scope: message.scope
  //     });
  //   }
  // }

  async pinMessage(message: PinnedMessage) {
    console.log("messages dsgsd", message);
    const key = message.roomId; // Always roomId, since scope is always global
    const pinRef = ref(this.db, `pinnedMessages/${key}`);
    const snapshot = await get(pinRef);

    const pinData = {
        key: message.key,
        roomId: message.roomId,
        messageId: message.messageId,
        pinnedBy: message.pinnedBy,
        pinnedAt: Date.now(),
        scope: 'global'
    };

    if (snapshot.exists()) {
        await update(pinRef, pinData);
    } else {
        await set(pinRef, pinData);
    }
}

async getPinnedMessage(roomId: string): Promise<PinnedMessage | null> {
  try {
    const pinRef = ref(this.db, `pinnedMessages/${roomId}`);
    const snapshot = await get(pinRef);

    if (snapshot.exists()) {
      return snapshot.val() as PinnedMessage;
    }
    return null;
  } catch (error) {
    console.error('Error getting pinned message:', error);
    return null;
  }
}

listenToPinnedMessage(roomId: string, callback: (pinnedMessage: PinnedMessage | null) => void) {
  const pinRef = ref(this.db, `pinnedMessages/${roomId}`);

  return onValue(pinRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as PinnedMessage);
    } else {
      callback(null);
    }
  });
}

async unpinMessage(roomId: string) {
  try {
    const pinRef = ref(this.db, `pinnedMessages/${roomId}`);
    await remove(pinRef);
    console.log("Message unpinned");
  } catch (error) {
    console.error('Error unpinning message:', error);
  }
}


  // Get pinned message for current chat
// async getPinnedMessage(roomId: string, userId: string, chatType: string): Promise<PinnedMessage | null> {
//   try {
//     const scope = chatType === 'group' ? 'global' : 'private';
//     const key = scope === 'private' ? `${roomId}_${userId}` : roomId;
//     const pinRef = ref(this.db, `pinnedMessages/${key}`);
//     const snapshot = await get(pinRef);
    
//     if (snapshot.exists()) {
//       return snapshot.val() as PinnedMessage;
//     }
//     return null;
//   } catch (error) {
//     console.error('Error getting pinned message:', error);
//     return null;
//   }
// }

// // Listen to pinned message changes
// listenToPinnedMessage(roomId: string, userId: string, chatType: string, callback: (pinnedMessage: PinnedMessage | null) => void) {
//   const scope = chatType === 'group' ? 'global' : 'private';
//   const key = scope === 'private' ? `${roomId}_${userId}` : roomId;
//   const pinRef = ref(this.db, `pinnedMessages/${key}`);
  
//   return onValue(pinRef, (snapshot) => {
//     if (snapshot.exists()) {
//       callback(snapshot.val() as PinnedMessage);
//     } else {
//       callback(null);
//     }
//   });
// }

// // Unpin message
// async unpinMessage(roomId: string, userId: string, chatType: string) {
//   try {
//     const scope = chatType === 'group' ? 'global' : 'private';
//     const key = scope === 'private' ? `${roomId}_${userId}` : roomId;
//     const pinRef = ref(this.db, `pinnedMessages/${key}`);
//     await remove(pinRef);
//     console.log("Message unpinned");
//   } catch (error) {
//     console.error('Error unpinning message:', error);
//   }
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

  //delete msg
  deleteMessage(roomId: string, messageKey: string) {
  const messageRef = ref(this.db, `chats/${roomId}/${messageKey}`);
  update(messageRef, { isDeleted: true });
}
}
