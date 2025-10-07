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
// import { firstValueFrom, Observable } from 'rxjs';
// import { getDatabase, remove, update } from 'firebase/database';
// // import { getStorage, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { Message, PinnedMessage } from 'src/types';
// import { CLOSING } from 'ws';
// import { ApiService } from './api/api.service';

// @Injectable({ providedIn: 'root' })
// export class FirebaseChatService {

//   private forwardMessages: any[] = [];

//   constructor(
//     private db: Database,
//     private service : ApiService
//   ) { }

//   getRoomId(senderId: string, arg1: string): string {
//     throw new Error('Method not implemented.');
//   }

//   async sendMessage(roomId: string, message: Message, chatType: string, senderId: string) {
//     const messagesRef = ref(this.db, `chats/${roomId}`);
//     await push(messagesRef, message);
//     console.log("messages is forwards id ", message);
//     if (chatType === 'private') {
//       // Increment unread for receiver only
//       const receiverId = message.receiver_id;
//       if (receiverId && receiverId !== senderId) {
//         this.incrementUnreadCount(roomId, receiverId);
//       }
//     } else if (chatType === 'group') {
//       // Increment unread for all members except sender
//       const groupSnapshot = await get(ref(this.db, `groups/${roomId}/members`));
//       const members = groupSnapshot.val();
//       if (members) {
//         Object.keys(members).forEach(memberId => {
//           if (memberId !== senderId) {
//             this.incrementUnreadCount(roomId, memberId);
//           }
//         });
//       }
//     }
//   }

//   listenForMessages(roomId: string): Observable<any[]> {
//     return new Observable(observer => {
//       const messagesRef = ref(this.db, `chats/${roomId}`);
//       onValue(messagesRef, snapshot => {
//         const data = snapshot.val();
//         const messages = data ? Object.entries(data).map(([key, val]) => ({ key, ...(val as any) })) : [];
//         observer.next(messages);
//       });
//     });
//   }

//   async pinMessage(message: PinnedMessage) {
//     console.log("messages dsgsd", message);
//     const key = message.roomId; // Always roomId, since scope is always global
//     const pinRef = ref(this.db, `pinnedMessages/${key}`);
//     const snapshot = await get(pinRef);

//     const pinData = {
//       key: message.key,
//       roomId: message.roomId,
//       messageId: message.messageId,
//       pinnedBy: message.pinnedBy,
//       pinnedAt: Date.now(),
//       scope: 'global'
//     };

//     if (snapshot.exists()) {
//       await update(pinRef, pinData);
//     } else {
//       await set(pinRef, pinData);
//     }
//   }

//   async getPinnedMessage(roomId: string): Promise<PinnedMessage | null> {
//     try {
//       const pinRef = ref(this.db, `pinnedMessages/${roomId}`);
//       const snapshot = await get(pinRef);

//       if (snapshot.exists()) {
//         return snapshot.val() as PinnedMessage;
//       }
//       return null;
//     } catch (error) {
//       console.error('Error getting pinned message:', error);
//       return null;
//     }
//   }

//   listenToPinnedMessage(roomId: string, callback: (pinnedMessage: PinnedMessage | null) => void) {
//     const pinRef = ref(this.db, `pinnedMessages/${roomId}`);

//     return onValue(pinRef, (snapshot) => {
//       if (snapshot.exists()) {
//         callback(snapshot.val() as PinnedMessage);
//       } else {
//         callback(null);
//       }
//     });
//   }

//   async unpinMessage(roomId: string) {
//     try {
//       const pinRef = ref(this.db, `pinnedMessages/${roomId}`);
//       await remove(pinRef);
//       console.log("Message unpinned");
//     } catch (error) {
//       console.error('Error unpinning message:', error);
//     }
//   }


//   async createGroup(groupId: string, groupName: string, members: any[], currentUserId: string) {  //make interface of this group
//     const db = getDatabase();
//     const groupRef = ref(db, `groups/${groupId}`);

//     // Find current user's name from the members array
//     const currentUser = members.find(m => m.user_id === currentUserId);
//     const currentUserName = currentUser?.name || 'Unknown';

//     console.log("currentUser", currentUserName);

//     const groupData = {
//       name: groupName,
//       groupId,
//       description: 'Hey I am using Telldemm',
//       createdBy: currentUserId,
//       createdByName: currentUserName,
//       // createdAt: new Date().toISOString(),
//       createdAt: new Date().toLocaleString(),
//       members: members.reduce((acc, member) => {
//         acc[member.user_id] = {
//           name: member.name,
//           phone_number: member.phone_number,
//           status: "active",
//           role: member.user_id === currentUserId ? "admin" : "member"
//         };
//         return acc;
//       }, {})
//     };

//     await set(groupRef, groupData);
//   }

//   async updateBackendGroupId(groupId: string, backendGroupId: string) {
//     const db = getDatabase();
//     const groupRef = ref(db, `groups/${groupId}/backendGroupId`);
//     await set(groupRef, backendGroupId);
//   }



//   async getGroupInfo(groupId: string): Promise<any> {
//     const snapshot = await get(child(ref(this.db), `groups/${groupId}`));
//     return snapshot.exists() ? snapshot.val() : null;
//   }


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

//   // ✅ Create a community
//   async createCommunity(communityId: string, name: string, description: string, createdBy: string): Promise<void> {
//     const communityRef = ref(this.db, `communities/${communityId}`);
//     await set(communityRef, {
//       name,
//       description,
//       createdBy,
//       groups: {}
//     });
//   }

//   async fetchGroupWithProfiles(groupId: string): Promise<{ groupName: string; groupMembers: any[] }> {
//     try {
//       const db = getDatabase();
//       const groupRef = ref(db, `groups/${groupId}`);
//       const snapshot = await get(groupRef);

//       if (!snapshot.exists()) {
//         return { groupName: 'Group', groupMembers: [] };
//       }

//       const groupData = snapshot.val();
//       const groupName = groupData.name || 'Group';

//       // Build members array from RTDB node
//       const rawMembers = groupData.members || {};
//       const members: any[] = Object.entries(rawMembers).map(([userId, userData]: [string, any]) => ({
//         user_id: userId,
//         phone_number: userData?.phone_number,
//         ...userData
//       }));

//       // Enrich members by calling API in parallel
//       const membersWithProfiles = await Promise.all(members.map(async (m) => {
//         try {
//           const res: any = await firstValueFrom(this.service.getUserProfilebyId(String(m.user_id)));
//           // API response example:
//           // { name, profile, publicKeyHex, phone_number }

//           m.avatar = res?.profile || m.avatar || 'assets/images/default-avatar.png';
//           m.name = m.name || res?.name || `User ${m.user_id}`;
//           m.publicKeyHex = res?.publicKeyHex || m.publicKeyHex || null;
//           m.phone_number = m.phone_number || res?.phone_number || m.phone_number;
//         } catch (err) {
//           console.warn(`fetchGroupWithProfiles: failed to fetch profile for ${m.user_id}`, err);
//           m.avatar = m.avatar || 'assets/images/default-avatar.png';
//           m.name = m.name || `User ${m.user_id}`;
//         }
//         return m;
//       }));

//       return { groupName, groupMembers: membersWithProfiles };
//     } catch (err) {
//       console.error('fetchGroupWithProfiles error', err);
//       return { groupName: 'Group', groupMembers: [] };
//     }
//   }

//   // ✅ Add user to community
//   async addUserToCommunity(userId: string, communityId: string): Promise<void> {
//     const userRef = ref(this.db, `usersInCommunity/${userId}/joinedCommunities/${communityId}`);
//     await set(userRef, true);
//   }

//   // 🔍 Get all groups inside a community
//   async getGroupsInCommunity(communityId: string): Promise<string[]> {
//     const snapshot = await get(child(ref(this.db), `communities/${communityId}/groups`));
//     const groups = snapshot.val();
//     return groups ? Object.keys(groups) : [];
//   }

//   // 🔍 Get all communities user has joined
//   async getUserCommunities(userId: string): Promise<string[]> {
//     const snapshot = await get(
//       child(ref(this.db), `usersInCommunity/${userId}/joinedCommunities`)
//     );
//     const communities = snapshot.val();
//     return communities ? Object.keys(communities) : [];
//   }


//   incrementUnreadCount(roomId: string, receiverId: string) {
//     const unreadRef = ref(this.db, `unreadCounts/${roomId}/${receiverId}`);
//     return runTransaction(unreadRef, count => (count || 0) + 1);
//   }

//   resetUnreadCount(roomId: string, userId: string) {
//     const unreadRef = ref(this.db, `unreadCounts/${roomId}/${userId}`);
//     return set(unreadRef, 0);
//   }

//   listenToUnreadCount(roomId: string, userId: string): Observable<number> {
//     return new Observable(observer => {
//       const unreadRef = ref(this.db, `unreadCounts/${roomId}/${userId}`);
//       onValue(unreadRef, snapshot => {
//         const val = snapshot.val();
//         observer.next(val || 0);
//       });
//     });
//   }

//   async getGroupMembers(groupId: string): Promise<string[]> {
//     const snapshot = await get(ref(this.db, `groups/${groupId}/members`));
//     const membersObj = snapshot.val();
//     return membersObj ? Object.keys(membersObj) : [];
//   }

//   // 👇 Call when message arrives on receiver's device
//   markDelivered(roomId: string, messageKey: string) {
//     const messageRef = ref(this.db, `chats/${roomId}/${messageKey}`);
//     // console.log("sdffsdd",messageRef);
//     update(messageRef, { delivered: true });
//   }

//   // 👇 Call only when message is visibly seen
//   markRead(roomId: string, messageKey: string) {
//     const messageRef = ref(this.db, `chats/${roomId}/${messageKey}`);
//     update(messageRef, { read: true });
//   }

//   //delete msg
//   deleteMessage(roomId: string, messageKey: string) {
//     const messageRef = ref(this.db, `chats/${roomId}/${messageKey}`);
//     update(messageRef, { isDeleted: true });
//   }

//   setForwardMessages(messages: any[]) {
//     this.forwardMessages = messages;
//   }

//   getForwardMessages() {
//     return this.forwardMessages;
//   }

//   clearForwardMessages() {
//     this.forwardMessages = [];
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
import { ref as rtdbRef, update as rtdbUpdate, set as rtdbSet, get as rtdbGet } from 'firebase/database';
import { runTransaction as rtdbRunTransaction } from 'firebase/database';
import { firstValueFrom, Observable, take } from 'rxjs';
import { getDatabase, remove, update } from 'firebase/database';
// import { getStorage, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Message, PinnedMessage } from 'src/types';
import { CLOSING } from 'ws';
import { ApiService } from './api/api.service';

@Injectable({ providedIn: 'root' })
export class FirebaseChatService {

  private forwardMessages: any[] = [];
  private _selectedMessageInfo: any = null;

  constructor(
    private db: Database,
    private service : ApiService
  ) { }

  getRoomId(senderId: string, arg1: string): string {
    throw new Error('Method not implemented.');
  }

  // async sendMessage(roomId: string, message: Message, chatType: string, senderId: string) {
  //   console.log("message from chat screen",message);
  //   const messagesRef = ref(this.db, `chats/${roomId}`);
  //   await push(messagesRef, message);
  //   console.log("messages is forwards id ", message);
  //   if (chatType === 'private') {
  //     // Increment unread for receiver only
  //     const receiverId = message.receiver_id;
  //     if (receiverId && receiverId !== senderId) {
  //       this.incrementUnreadCount(roomId, receiverId);
  //     }
  //   } else if (chatType === 'group') {
  //     // Increment unread for all members except sender
  //     const groupSnapshot = await get(ref(this.db, `groups/${roomId}/members`));
  //     const members = groupSnapshot.val();
  //     if (members) {
  //       Object.keys(members).forEach(memberId => {
  //         if (memberId !== senderId) {
  //           this.incrementUnreadCount(roomId, memberId);
  //         }
  //       });
  //     }
  //   }
  // }

 async sendMessage(roomId: string, message: Message, chatType: string, senderId: string) {
  try {
    const db = getDatabase();

    try {
      const idxSnap = await rtdbGet(rtdbRef(db, `roomIds/${roomId}`));
      if (!idxSnap.exists()) {
        // create a small metadata object; you can use `true` if you prefer
        await rtdbSet(rtdbRef(db, `roomIds/${roomId}`), { createdAt: Date.now() });
        console.log('✅ roomId registered in roomIds:', roomId);
      }
    } catch (err) {
      // non-fatal: continue to push the message even if index write/check fails
      console.warn('Could not verify/write roomIds entry (continuing):', err);
    }

    // --- Push the message (this will create chats/{roomId} if required) ---
    const messagesRef = ref(this.db, `chats/${roomId}`);
    await push(messagesRef, message);
    console.log('✅ Message pushed to', roomId, message);

    // --- Existing unread logic ---
    if (chatType === 'private') {
      const receiverId = message.receiver_id;
      if (receiverId && receiverId !== senderId) {
        this.incrementUnreadCount(roomId, receiverId);
      }
    } else if (chatType === 'group') {
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
  } catch (err) {
    console.error('sendMessage error:', err);
    throw err;
  }
}



  listenForMessages(roomId: string): Observable<any[]> {
    return new Observable(observer => {
      const messagesRef = ref(this.db, `chats/${roomId}`);
      onValue(messagesRef, snapshot => {
        const data = snapshot.val();
        const messages = data ? Object.entries(data).map(([key, val]) => ({ key, ...(val as any) })) : [];
        console.log("messages dsgsd", messages);
        observer.next(messages);
      });
    });
  }

  async pinMessage(message: PinnedMessage) {
    // console.log("messages dsgsd", message);
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


  async createGroup(groupId: string, groupName: string, members: any[], currentUserId: string) {  //make interface of this group
    const db = getDatabase();
    const groupRef = ref(db, `groups/${groupId}`);

    // Find current user's name from the members array
    const currentUser = members.find(m => m.user_id === currentUserId);
    const currentUserName = currentUser?.name || 'Unknown';

    console.log("currentUser", currentUserName);

    const groupData = {
      name: groupName,
      groupId,
      description: 'Hey I am using Telldemm',
      createdBy: currentUserId,
      createdByName: currentUserName,
      createdAt: Date.now(),
      members: members.reduce((acc, member) => {
        acc[member.user_id] = {
          name: member.name,
          phone_number: member.phone_number,
          status: "active",
          role: member.user_id === currentUserId ? "admin" : "member"
        };
        return acc;
      }, {}),
      membersCount: members.length
    };

    await set(groupRef, groupData);
  }

  async updateBackendGroupId(groupId: string, backendGroupId: string) {
    const db = getDatabase();
    const groupRef = ref(db, `groups/${groupId}/backendGroupId`);
    await set(groupRef, backendGroupId);
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

async createCommunity(communityId: string, name: string, description: string, createdBy: string): Promise<void> {
  try {
    const rawDb = getDatabase();
    const now = Date.now();
    const annGroupId = `comm_group_${now}_ann`;
    const generalGroupId = `comm_group_${now}_gen`;

    // Try to fetch creator details from /users/<createdBy> (best-effort)
    let creatorProfile: { name?: string; phone_number?: string } = {};
    try {
      const userSnap = await get(ref(rawDb, `users/${createdBy}`));
      if (userSnap.exists()) {
        const u = userSnap.val();
        creatorProfile.name = u.name || u.fullName || u.displayName || '';
        creatorProfile.phone_number = u.phone_number || u.mobile || u.phone || '';
      }
    } catch (err) {
      console.warn('Failed to fetch creator profile, proceeding with fallback values', err);
    }

    // Build member object with details (creator will be an ADMIN)
    const memberDetails = {
      name: creatorProfile.name || '',
      phone_number: creatorProfile.phone_number || '',
      role: 'admin',    // <-- creator is admin by default
      status: 'active',
      joinedAt: now
    };

    // Build community object including child nodes (groups, members) — members now store objects not booleans
    const communityObj: any = {
      id: communityId,
      name,
      description: description || '',
      icon: '',
      createdBy,
      createdByName : creatorProfile.name,
      createdAt: now,
      privacy: 'invite_only',
      settings: {
        whoCanCreateGroups: 'admins',
        announcementPosting: 'adminsOnly'
      },
      // admins map (quick lookup)
      admins: { [createdBy]: true },
      membersCount: 0, // creator included
      groups: {
        [annGroupId]: true,
        [generalGroupId]: true
      },
      // store detailed member object under members/<uid>
      members: {
        [createdBy]: memberDetails
      }
    };

    // Build group objects that already contain their members (so we don't add child paths separately)
    const annGroupObj = {
      id: annGroupId,
      name: 'Announcements',
      type: 'announcement',
      communityId: communityId,
      createdBy,
      createdByName : creatorProfile.name,
      createdAt: now,
      admins: { [createdBy]: true },
      members: {
        [createdBy]: memberDetails
      },
      membersCount: 0
    };
    console.log("memberDetails",memberDetails);
    const genGroupObj = {
      id: generalGroupId,
      name: 'General',
      type: 'general',
      communityId: communityId,
      createdBy,
      createdByName : creatorProfile.name,
      createdAt: now,
      admins: { [createdBy]: true },
      members: {
        [createdBy]: memberDetails
      },
      membersCount: 0
    };

    // Prepare updates (atomic multi-path update)
    const updates: any = {};
    updates[`/communities/${communityId}`] = communityObj;
    updates[`/groups/${annGroupId}`] = annGroupObj;
    updates[`/groups/${generalGroupId}`] = genGroupObj;

    // Index paths for quick lookups
    updates[`/usersInCommunity/${createdBy}/joinedCommunities/${communityId}`] = true;

    await update(ref(rawDb), updates);
  } catch (err) {
    console.error('createCommunity error', err);
    throw err;
  }
}


  async fetchGroupWithProfiles(groupId: string): Promise<{ groupName: string; groupMembers: any[] }> {
    try {
      const db = getDatabase();
      const groupRef = ref(db, `groups/${groupId}`);
      const snapshot = await get(groupRef);

      if (!snapshot.exists()) {
        return { groupName: 'Group', groupMembers: [] };
      }

      const groupData = snapshot.val();
      const groupName = groupData.name || 'Group';

      // Build members array from RTDB node
      const rawMembers = groupData.members || {};
      const members: any[] = Object.entries(rawMembers).map(([userId, userData]: [string, any]) => ({
        user_id: userId,
        phone_number: userData?.phone_number,
        ...userData
      }));

      // Enrich members by calling API in parallel
      const membersWithProfiles = await Promise.all(members.map(async (m) => {
        try {
          const res: any = await firstValueFrom(this.service.getUserProfilebyId(String(m.user_id)));
          // API response example:
          // { name, profile, publicKeyHex, phone_number }

          m.avatar = res?.profile || m.avatar || 'assets/images/default-avatar.png';
          m.name = m.name || res?.name || `User ${m.user_id}`;
          m.publicKeyHex = res?.publicKeyHex || m.publicKeyHex || null;
          m.phone_number = m.phone_number || res?.phone_number || m.phone_number;
        } catch (err) {
          console.warn(`fetchGroupWithProfiles: failed to fetch profile for ${m.user_id}`, err);
          m.avatar = m.avatar || 'assets/images/default-avatar.png';
          m.name = m.name || `User ${m.user_id}`;
        }
        return m;
      }));

      return { groupName, groupMembers: membersWithProfiles };
    } catch (err) {
      console.error('fetchGroupWithProfiles error', err);
      return { groupName: 'Group', groupMembers: [] };
    }
  }

  // ✅ Add user to community (atomic) and optionally auto-join the General group
  async addUserToCommunity(userId: string, communityId: string, autoJoinGeneral = true): Promise<void> {
    try {
      // Add user->community mapping + community->members mapping via multi-path update
      const rawDb = getDatabase();
      const userInCommunityPath = `/usersInCommunity/${userId}/joinedCommunities/${communityId}`;
      const communityMemberPath = `/communities/${communityId}/members/${userId}`;
      const userCommunitiesRef = ref(this.db, `usersInCommunity/${userId}/joinedCommunities/${communityId}`);
      const updates: any = {};
      updates[userInCommunityPath] = true;
      updates[communityMemberPath] = true;

      // commit the join mapping first
      await update(ref(rawDb), updates);

      // increment membersCount safely using transaction on community membersCount
      const communityCountRef = ref(this.db, `communities/${communityId}/membersCount`);
      await runTransaction(communityCountRef, curr => (curr || 0) + 1);

      if (autoJoinGeneral) {
        // Find general group for community
        const groupsSnap = await get(child(ref(this.db), `communities/${communityId}/groups`));
        const groupsObj = groupsSnap.val();
        if (groupsObj) {
          // try to find a group with type 'general'
          const groupIds = Object.keys(groupsObj);
          let generalGroupId: string | null = null;
          for (const gid of groupIds) {
            const gSnap = await get(child(ref(this.db), `groups/${gid}`));
            if (gSnap.exists()) {
              const g = gSnap.val();
              if (g.type === 'general') {
                generalGroupId = gid;
                break;
              }
            }
          }

          if (generalGroupId) {
            // add user to general group members and increment membersCount
            const userGroupPath = `/groups/${generalGroupId}/members/${userId}`;
            const userGroupsIndexPath = `/users/${userId}/groups/${generalGroupId}`;
            const updates2: any = {};
            updates2[userGroupPath] = true;
            updates2[userGroupsIndexPath] = true;
            await update(ref(rawDb), updates2);

            const groupCountRef = ref(this.db, `groups/${generalGroupId}/membersCount`);
            await runTransaction(groupCountRef, curr => (curr || 0) + 1);
          }
        }
      }
    } catch (err) {
      console.error('addUserToCommunity error', err);
      throw err;
    }
  }

  // 🔍 Get all groups inside a community (existing)
  async getGroupsInCommunity(communityId: string): Promise<string[]> {
    const snapshot = await get(child(ref(this.db), `communities/${communityId}/groups`));
    const groups = snapshot.val();
    return groups ? Object.keys(groups) : [];
  }

  // 🔍 New: get groups for community with detailed info (populated)
  async getGroupsInCommunityWithInfo(communityId: string): Promise<any[]> {
    const groupIds = await this.getGroupsInCommunity(communityId);
    const result: any[] = [];

    for (const gid of groupIds) {
      const gSnap = await get(child(ref(this.db), `groups/${gid}`));
      if (gSnap.exists()) {
        const g = gSnap.val();
        result.push({
          id: gid,
          name: g.name,
          type: g.type || 'normal',
          createdBy: g.createdBy,
          createdAt: g.createdAt,
          membersCount: g.membersCount || (g.members ? Object.keys(g.members).length : 0)
        });
      }
    }

    return result;
  }

  // 🔍 Get all communities user has joined
  async getUserCommunities(userId: string): Promise<string[]> {
    const snapshot = await get(
      child(ref(this.db), `usersInCommunity/${userId}/joinedCommunities`)
    );
    const communities = snapshot.val();
    return communities ? Object.keys(communities) : [];
  }

  // this is optional use
  async getCommunityInfo(communityId: string) {
  const snap = await get(child(ref(this.db), `communities/${communityId}`));
  return snap.exists() ? snap.val() : null;
}

async bulkUpdate(updates: any) {
  const db = getDatabase();
  await rtdbUpdate(rtdbRef(db, '/'), updates);
}

// or simple single path set helper
async setPath(path: string, value: any) {
  const db = getDatabase();
  await rtdbSet(rtdbRef(db, path), value);
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

  getUnreadCountOnce(roomId: string, userId: string): Promise<number> {
  return firstValueFrom(this.listenToUnreadCount(roomId, userId).pipe(take(1)));
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
    update(messageRef, { delivered: true, deliveredAt : Date.now() });
  }

  // 👇 Call only when message is visibly seen
  markRead(roomId: string, messageKey: string) {
    const messageRef = ref(this.db, `chats/${roomId}/${messageKey}`);
    update(messageRef, { read: true, readAt : Date.now() });
  }

  /** this use in home screen mark as read feature
   * Mark all messages addressed TO `userId` in a room as read.
   * Returns how many messages were flipped.
   */
  async markRoomAsRead(roomId: string, userId: string): Promise<number> {
    const db = getDatabase();
    const snap = await get(rtdbRef(db, `chats/${roomId}`));
    if (!snap.exists()) {
      // still reset unread counter even if messages missing
      try { await update(rtdbRef(db, `/unreadCounts/${roomId}`), { [userId]: 0 }); } catch {}
      return 0;
    }

    const now = Date.now();
    const msgs = snap.val() || {};
    const multi: Record<string, any> = {};
    let changed = 0;

    Object.entries(msgs).forEach(([key, m]: any) => {
      // only messages that were sent TO me
      const isForMe = String(m?.receiver_id) === String(userId);
      const alreadyRead = !!m?.read || (m?.readBy && m.readBy[userId]);

      if (isForMe && !alreadyRead) {
        multi[`chats/${roomId}/${key}/read`] = true;
        multi[`chats/${roomId}/${key}/readAt`] = now;
        // if you also track per-user read in groups, keep it in sync
        multi[`chats/${roomId}/${key}/readBy/${userId}`] = now;
        changed++;
      }
    });

    // zero the unread counter for me in this room
    multi[`unreadCounts/${roomId}/${userId}`] = 0;

    if (Object.keys(multi).length) {
      await update(rtdbRef(db, '/'), multi);
    }
    return changed;
  }

  /**
   * Bulk for many rooms. Returns total number of messages flipped.
   */
  async markManyRoomsAsRead(roomIds: string[], userId: string): Promise<number> {
    let total = 0;
    for (const rid of roomIds) {
      try { total += await this.markRoomAsRead(rid, userId); } catch {}
    }
    return total;
  }

  async markRoomAsUnread(roomId: string, userId: string, minCount: number = 1): Promise<void> {
    const db = getDatabase();

    // read current unread count
    let current = 0;
    try {
      const snap = await get(rtdbRef(db, `unreadCounts/${roomId}/${userId}`));
      current = snap.exists() ? Number(snap.val() || 0) : 0;
    } catch { /* ignore */ }

    const updates: Record<string, any> = {};
    updates[`unreadChats/${userId}/${roomId}`] = true;
    if (current < minCount) {
      updates[`unreadCounts/${roomId}/${userId}`] = minCount;
    }

    await update(rtdbRef(db, '/'), updates);
  }

  /**
   * Bulk: mark many rooms as unread for userId.
   */
  async markManyRoomsAsUnread(roomIds: string[], userId: string, minCount: number = 1): Promise<void> {
    const db = getDatabase();

    // optional: fetch counts first, but to keep it simple/fast we just upsert to minCount
    // (safe because setting unreadCounts to minCount won't decrease if higher already)
    const updates: Record<string, any> = {};
    const nowMin = Math.max(1, minCount);

    for (const roomId of roomIds) {
      updates[`unreadChats/${userId}/${roomId}`] = true;
      updates[`unreadCounts/${roomId}/${userId}`] = nowMin;
    }

    await update(rtdbRef(db, '/'), updates);
  }

   /** Remove the UI "unread" mark for a room (and zero the badge). */
  async removeMarkAsUnread(roomId: string, userId: string): Promise<void> {
    const db = getDatabase();
    const updates: Record<string, any> = {};
    updates[`unreadChats/${userId}/${roomId}`] = null;  // delete the flag
    updates[`unreadCounts/${roomId}/${userId}`] = 0;    // reset badge
    await update(rtdbRef(db, '/'), updates);
  }

  /** Bulk version (optional). */
  async removeManyMarksAsUnread(roomIds: string[], userId: string): Promise<void> {
    const db = getDatabase();
    const updates: Record<string, any> = {};
    for (const roomId of roomIds) {
      updates[`unreadChats/${userId}/${roomId}`] = null;
      updates[`unreadCounts/${roomId}/${userId}`] = 0;
    }
    await update(rtdbRef(db, '/'), updates);
  }

  //delete msg
  deleteMessage(roomId: string, messageKey: string) {
    const messageRef = ref(this.db, `chats/${roomId}/${messageKey}`);
    update(messageRef, { isDeleted: true });
  }

  async deleteMessageForMe(roomId: string, key: string, userId: string): Promise<void> {
  const db = getDatabase();
  const updates: any = {};
  updates[`/chats/${roomId}/${key}/deletedFor/${userId}`] = true;
  await update(ref(db), updates);
}

async deleteMessageForEveryone(roomId: string, key: string, performedBy: string, participantIds?: string[]): Promise<void> {
  const db = getDatabase();
  const updates: any = {};

  // set convenience flags
  updates[`/chats/${roomId}/${key}/deletedForEveryone`] = true;
  updates[`/chats/${roomId}/${key}/deletedBy`] = performedBy;
  updates[`/chats/${roomId}/${key}/deletedAt`] = Date.now();

  // optionally mark deletedFor for each participant
  if (Array.isArray(participantIds)) {
    for (const uid of participantIds) {
      updates[`/chats/${roomId}/${key}/deletedFor/${uid}`] = true;
    }
  }

  // OPTIONALLY: clear text/attachment if you want to remove content from DB
  // updates[`/chats/${roomId}/${key}/text`] = '';
  // updates[`/chats/${roomId}/${key}/attachment`] = null;
  // updates[`/chats/${roomId}/${key}/isDeleted`] = true;

  await update(ref(db), updates);
}

  setForwardMessages(messages: any[]) {
    this.forwardMessages = messages;
  }

  getForwardMessages() {
    return this.forwardMessages;
  }

  clearForwardMessages() {
    this.forwardMessages = [];
  }

  /**
 * Store the currently selected message for the Message Info page.
 * Accepts a message object (the same shape used elsewhere).
 */
setSelectedMessageInfo(msg: any) {
  this._selectedMessageInfo = msg;
}

/**
 * Retrieve and optionally clear the stored selected message.
 * If clearAfterRead=true, stored message is removed after reading.
 */
getSelectedMessageInfo(clearAfterRead = false): any {
  const m = this._selectedMessageInfo;
  if (clearAfterRead) this._selectedMessageInfo = null;
  return m;
}

//  async deleteChatForUser(
//     userId: string,
//     chat: { receiver_Id: string; group?: boolean; isCommunity?: boolean }
//   ): Promise<void> {
//     if (!userId || !chat?.receiver_Id) return;

//     console.log("deleted selection");
//     const db = getDatabase();
//     const isGroup = !!chat.group;
//     const roomId = isGroup
//       ? chat.receiver_Id            // group roomId is same as groupId in your app
//       : this.getRoomId(userId, chat.receiver_Id); // private chat roomId

//     const payload = {
//       roomId,
//       type: isGroup ? 'group' : 'private',
//       peerId: chat.receiver_Id,
//       deletedAt: Date.now()
//     };

//     const updates: any = {};
//     updates[`deleted/${userId}/${roomId}`] = payload;
//     updates[`chats/${roomId}/deletedFor/${userId}`] = true;

//     await update(rtdbRef(db), updates);
//   }

  // Delete chat for current user (soft delete - messages rahenge but UI se hide)
async deleteChatForUser(roomId: string, userId: string): Promise<void> {
  try {
    const db = getDatabase();
    
    // Mark all messages as deleted for this user
    const chatsRef = rtdbRef(db, `chats/${roomId}`);
    const snapshot = await get(chatsRef);
    
    if (snapshot.exists()) {
      const messages = snapshot.val();
      const updates: any = {};
      
      Object.keys(messages).forEach(messageKey => {
        updates[`chats/${roomId}/${messageKey}/deletedFor/${userId}`] = true;
      });
      
      await update(rtdbRef(db), updates);
    }
    
    // Clear unread count for this user
    await update(rtdbRef(db), {
      [`unreadCounts/${roomId}/${userId}`]: 0
    });
    
    console.log(`✅ Chat ${roomId} deleted for user ${userId}`);
  } catch (error) {
    console.error('❌ Error deleting chat:', error);
    throw error;
  }
}

// Permanently delete entire chat room (both users ke liye)
async deleteChatPermanently(roomId: string): Promise<void> {
  try {
    const db = getDatabase();
    const updates: any = {};
    
    // Delete messages
    updates[`chats/${roomId}`] = null;
    
    // Delete unread counts
    updates[`unreadCounts/${roomId}`] = null;
    
    // Delete typing indicators
    updates[`typing/${roomId}`] = null;
    
    await update(rtdbRef(db), updates);
    console.log(`✅ Chat ${roomId} permanently deleted`);
  } catch (error) {
    console.error('❌ Error permanently deleting chat:', error);
    throw error;
  }
}

// Delete group and its messages
async deleteGroup(groupId: string): Promise<void> {
  try {
    const db = getDatabase();
    const updates: any = {};
    
    // Delete group info
    updates[`groups/${groupId}`] = null;
    
    // Delete group messages
    updates[`chats/${groupId}`] = null;
    
    // Delete unread counts
    updates[`unreadCounts/${groupId}`] = null;
    
    // Delete typing indicators
    updates[`typing/${groupId}`] = null;
    
    await update(rtdbRef(db), updates);
    console.log(`✅ Group ${groupId} deleted`);
  } catch (error) {
    console.error('❌ Error deleting group:', error);
    throw error;
  }
}

}
