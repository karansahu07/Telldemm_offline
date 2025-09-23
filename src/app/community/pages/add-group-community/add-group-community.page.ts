import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertController, IonicModule, NavController, ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { FirebaseChatService } from 'src/app/services/firebase-chat.service';

@Component({
  selector: 'app-add-group-community',
  templateUrl: './add-group-community.page.html',
  styleUrls: ['./add-group-community.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class AddGroupCommunityPage implements OnInit {
  communityId: string | null = null;
  communityName = '';
  groupsInCommunity: Array<{ id: string; name: string; type?: string; membersCount?: number }> = [];
  loading = false;
  // toastCtrl: any;

  constructor(
    private route: ActivatedRoute,
    private firebaseService: FirebaseChatService,
    private navCtrl: NavController,
    private toastCtrl : ToastController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    // read communityId from query params
    this.route.queryParams.subscribe(params => {
      const cid = params['communityId'] || params['id'];
      if (cid) {
        this.communityId = cid;
        this.loadGroupsForCommunity();
      }
    });
  }

    goToCreateNewGroup() {
    const communityId = this.communityId;
    this.navCtrl.navigateForward(['/create-new-group'], {
      queryParams: { communityId, communityName: this.communityName }
    });
  }

  async loadGroupsForCommunity() {
    if (!this.communityId) return;
    this.loading = true;
    this.groupsInCommunity = [];

    try {
      // optional: fetch community meta to show name if you want
      // const comm = await this.firebaseService.getCommunityInfo?.(this.communityId as string).catch(() => null);
      // if (comm) {
      //   this.communityName = comm.name || '';
      // }

      // get group ids under community
      const groupIds = await this.firebaseService.getGroupsInCommunity(this.communityId);
      if (!groupIds || groupIds.length === 0) {
        this.loading = false;
        return;
      }

      // fetch each group's details
      for (const gid of groupIds) {
        const g = await this.firebaseService.getGroupInfo(gid);
        if (!g) continue;
        this.groupsInCommunity.push({
          id: gid,
          name: g.name || 'Unnamed group',
          type: g.type || 'normal',
          membersCount: g.membersCount || (g.members ? Object.keys(g.members).length : 0)
        });
      }
    } catch (err) {
      console.error('loadGroupsForCommunity error', err);
    } finally {
      this.loading = false;
    }
  }

  // placeholder for remove / leave button
// async removeGroupFromCommunity(groupId: string) {
//   if (!this.communityId || !groupId) return;

//   // show Ionic alert with checkbox
//   const alert = await this.alertCtrl.create({
//     header: 'Remove group from community',
//     message: 'Do you want to remove this group from the community? The group will remain but will no longer belong to the community.',
//     inputs: [
//       {
//         name: 'removeMembers',
//         type: 'checkbox',
//         label: 'Also remove members who will no longer belong to community',
//         value: 'removeMembers',
//         checked: false
//       }
//     ],
//     buttons: [
//       {
//         text: 'Cancel',
//         role: 'cancel'
//       },
//       {
//         text: 'Remove',
//         handler: (data) => {
//           // data is array of checked values (['removeMembers'] if checked)
//         }
//       }
//     ]
//   });

//   await alert.present();

//   // wait for dismissal and get whether checkbox checked
//   const { role, data } = await alert.onDidDismiss();
//   if (role === 'cancel') return;

//   // data from alert: data.values is array of checked values for alert in some Ionic versions,
//   // or data?.data?.values — normalize:
//   let checked = false;
//   try {
//     // Ionic may return different shapes across versions
//     if (Array.isArray((data as any).values)) {
//       checked = (data as any).values.includes('removeMembers');
//     } else if (Array.isArray((data as any).data)) {
//       checked = (data as any).data.includes('removeMembers');
//     } else if (Array.isArray(data)) {
//       checked = data.includes('removeMembers');
//     } else {
//       // fallback: check the presented inputs snapshot
//       checked = !!((data as any).removeMembers);
//     }
//   } catch (e) {
//     checked = false;
//   }

//   this.loading = true;

//   try {
//     const updates: any = {};

//     // unlink group from community and clear group's communityId
//     updates[`/communities/${this.communityId}/groups/${groupId}`] = null;
//     updates[`/groups/${groupId}/communityId`] = null;

//     // get current groups under community and compute remaining after removal
//     const currentGroupIds: string[] = await this.firebaseService.getGroupsInCommunity(this.communityId) || [];
//     const remainingGroupIds = currentGroupIds.filter(gid => gid !== groupId);

//     // collect members from remaining groups
//     const remainingMemberSet = new Set<string>();
//     for (const gid of remainingGroupIds) {
//       try {
//         const g = await this.firebaseService.getGroupInfo(gid);
//         if (g && g.members) {
//           Object.keys(g.members).forEach(uid => { if (uid) remainingMemberSet.add(uid); });
//         }
//       } catch (err) {
//         console.warn('Failed to load group members for', gid, err);
//       }
//     }

//     // fetch members of the group being removed
//     let removedGroupMembersSet = new Set<string>();
//     try {
//       const removedGroup = await this.firebaseService.getGroupInfo(groupId);
//       if (removedGroup && removedGroup.members) {
//         Object.keys(removedGroup.members).forEach(uid => { if (uid) removedGroupMembersSet.add(uid); });
//       }
//     } catch (err) {
//       console.warn('Failed to load removed group members', err);
//     }

//     if (checked) {
//       // The user asked to "also remove members" — remove only those members who are not part of remaining groups.
//       removedGroupMembersSet.forEach(uid => {
//         if (!remainingMemberSet.has(uid)) {
//           // remove user from community membership and usersInCommunity index
//           updates[`/communities/${this.communityId}/members/${uid}`] = null;
//           updates[`/usersInCommunity/${uid}/joinedCommunities/${this.communityId}`] = null;
//         } else {
//           // If the member exists in remaining groups, keep them (already handled by remainingMemberSet logic)
//         }
//       });
//     }

//     // Ensure remaining members are present in community & usersInCommunity index
//     Array.from(remainingMemberSet).forEach(uid => {
//       updates[`/communities/${this.communityId}/members/${uid}`] = true;
//       updates[`/usersInCommunity/${uid}/joinedCommunities/${this.communityId}`] = true;
//     });

//     // update membersCount (size of members that will remain in community)
//     // If checked: remainingMemberSet already excludes exclusively-removed members
//     // If not checked: we should keep existing members set intact. We'll fetch existing community members to compute accurate count.
//     let finalMembersCount = remainingMemberSet.size;
//     if (!checked) {
//       // preserve existing members who are not in remainingMemberSet (they may be direct members)
//       try {
//         const comm = await this.firebaseService.getCommunityInfo(this.communityId);
//         const existingMembersObj = comm?.members || {};
//         Object.keys(existingMembersObj).forEach(uid => {
//           if (uid && !remainingMemberSet.has(uid)) {
//             // keep them
//             finalMembersCount++;
//             // ensure they are present in updates (no-op true)
//             updates[`/communities/${this.communityId}/members/${uid}`] = true;
//             updates[`/usersInCommunity/${uid}/joinedCommunities/${this.communityId}`] = true;
//           }
//         });
//       } catch (err) {
//         console.warn('Failed to fetch community info when preserving members count', err);
//       }
//     }

//     updates[`/communities/${this.communityId}/membersCount`] = finalMembersCount;

//     // commit updates (use bulkUpdate helper if available)
//     if (typeof (this.firebaseService as any).bulkUpdate === 'function') {
//       await (this.firebaseService as any).bulkUpdate(updates);
//     } else if (typeof (this.firebaseService as any).setPath === 'function') {
//       const promises = Object.keys(updates).map(p => (this.firebaseService as any).setPath(p, updates[p]));
//       await Promise.all(promises);
//     } else {
//       throw new Error('bulkUpdate or setPath helper not found on FirebaseChatService');
//     }

//     const successToast = await this.toastCtrl.create({
//       message: 'Group removed from community',
//       duration: 2000,
//       color: 'success'
//     });
//     await successToast.present();

//     // refresh UI
//     await this.loadGroupsForCommunity();

//   } catch (err) {
//     console.error('removeGroupFromCommunity failed', err);
//     const errToast = await this.toastCtrl.create({
//       message: 'Failed to remove group. Try again.',
//       duration: 3000,
//       color: 'danger'
//     });
//     await errToast.present();
//   } finally {
//     this.loading = false;
//   }
// }

// async removeGroupFromCommunity(groupId: string) {
//   if (!this.communityId || !groupId) return;

//   // show Ionic alert with checkbox
//   const alert = await this.alertCtrl.create({
//     header: 'Remove group from community',
//     message: 'Do you want to remove this group from the community? The group will remain but will no longer belong to the community.',
//     inputs: [
//       {
//         name: 'removeMembers',
//         type: 'checkbox',
//         label: 'Also remove members of this group from the community',
//         value: 'removeMembers',
//         checked: false
//       }
//     ],
//     buttons: [
//       { text: 'Cancel', role: 'cancel' },
//       { text: 'Remove', role: 'ok' }
//     ]
//   });
//   await alert.present();

//   const res = await alert.onDidDismiss();
//   if (res.role === 'cancel') return;

//   // normalize whether checkbox was checked
//   let checked = false;
//   try {
//     const data = res?.data;
//     if (Array.isArray((data as any)?.values)) {
//       checked = (data as any).values.includes('removeMembers');
//     } else if (Array.isArray((data as any)?.data)) {
//       checked = (data as any).data.includes('removeMembers');
//     } else if (Array.isArray(data)) {
//       checked = data.includes('removeMembers');
//     } else {
//       checked = !!((data as any).removeMembers);
//     }
//   } catch (e) {
//     checked = false;
//   }

//   this.loading = true;

//   try {
//     const updates: any = {};

//     // 1) unlink group from community and clear group's communityId
//     updates[`/communities/${this.communityId}/groups/${groupId}`] = null;
//     updates[`/groups/${groupId}/communityId`] = null;

//     // 2) fetch current groups under community (before removal) and compute remaining after removal
//     const currentGroupIds: string[] = await this.firebaseService.getGroupsInCommunity(this.communityId) || [];
//     const remainingGroupIds = currentGroupIds.filter(gid => gid !== groupId);

//     // 3) collect members that will remain because of remaining groups
//     const remainingMembersFromGroups = new Set<string>();
//     for (const gid of remainingGroupIds) {
//       try {
//         const g = await this.firebaseService.getGroupInfo(gid);
//         if (g && g.members) {
//           Object.keys(g.members).forEach(uid => { if (uid) remainingMembersFromGroups.add(uid); });
//         }
//       } catch (err) {
//         console.warn('Failed to load group members for', gid, err);
//       }
//     }

//     // 4) fetch members of the group being removed
//     const removedGroupMembers = new Set<string>();
//     try {
//       const removedGroup = await this.firebaseService.getGroupInfo(groupId);
//       if (removedGroup && removedGroup.members) {
//         Object.keys(removedGroup.members).forEach(uid => { if (uid) removedGroupMembers.add(uid); });
//       }
//     } catch (err) {
//       console.warn('Failed to load removed group members', err);
//     }

//     // 5) fetch current community members (so we can preserve direct members if needed)
//     let existingCommMembersObj: Record<string, any> = {};
//     try {
//       const comm = await this.firebaseService.getCommunityInfo(this.communityId);
//       existingCommMembersObj = comm?.members || {};
//     } catch (err) {
//       console.warn('Failed to load community info', err);
//     }

//     // 6) compute finalMembersSet depending on checkbox choice
//     const finalMembersSet = new Set<string>();

//     if (checked) {
//       // REMOVE ALL members of the removed group from the community (even if they are in other groups)
//       // final = union of remainingMembersFromGroups minus removedGroupMembers
//       remainingMembersFromGroups.forEach(uid => finalMembersSet.add(uid));
//       // Also ensure we remove removedGroupMembers even if they exist in remainingMembersFromGroups:
//       removedGroupMembers.forEach(uid => {
//         // if a removedGroup member is present in remainingMembersFromGroups, we still remove them because user asked to remove all members of this group
//         if (finalMembersSet.has(uid)) finalMembersSet.delete(uid);
//       });

//       // Note: if you want to remove them even if they are also in remaining groups (force remove),
//       // above deletion ensures that.
//     } else {
//       // SAFE: preserve existing community membership and keep anyone still present in remaining groups
//       Object.keys(existingCommMembersObj || {}).forEach(uid => {
//         if (uid) finalMembersSet.add(uid);
//       });
//       remainingMembersFromGroups.forEach(uid => finalMembersSet.add(uid));
//       // removedGroupMembers will naturally drop out if they are not in remainingGroups and not in existingCommMembers
//     }

//     // 7) Build updates to set true for uids in finalMembersSet, and null for those currently in community but not in finalSet
//     const existingMemberIds = Object.keys(existingCommMembersObj || {});

//     // ensure final members are set true and usersInCommunity index exists
//     finalMembersSet.forEach(uid => {
//       updates[`/communities/${this.communityId}/members/${uid}`] = true;
//       updates[`/usersInCommunity/${uid}/joinedCommunities/${this.communityId}`] = true;
//     });

//     // remove any existing community members that are not in finalMembersSet
//     existingMemberIds.forEach(uid => {
//       if (!finalMembersSet.has(uid)) {
//         updates[`/communities/${this.communityId}/members/${uid}`] = null;
//         updates[`/usersInCommunity/${uid}/joinedCommunities/${this.communityId}`] = null;
//       }
//     });

//     // 8) update membersCount to final set size
//     updates[`/communities/${this.communityId}/membersCount`] = finalMembersSet.size;

//     // 9) commit updates (atomic if bulkUpdate is present)
//     if (typeof (this.firebaseService as any).bulkUpdate === 'function') {
//       await (this.firebaseService as any).bulkUpdate(updates);
//     } else if (typeof (this.firebaseService as any).setPath === 'function') {
//       const promises = Object.keys(updates).map(p => (this.firebaseService as any).setPath(p, updates[p]));
//       await Promise.all(promises);
//     } else {
//       throw new Error('bulkUpdate or setPath helper not found on FirebaseChatService');
//     }

//     const successToast = await this.toastCtrl.create({
//       message: 'Group removed from community and members updated',
//       duration: 2000,
//       color: 'success'
//     });
//     await successToast.present();

//     // refresh UI list
//     await this.loadGroupsForCommunity();
//   } catch (err) {
//     console.error('removeGroupFromCommunity failed', err);
//     const errToast = await this.toastCtrl.create({
//       message: 'Failed to remove group. Try again.',
//       duration: 3000,
//       color: 'danger'
//     });
//     await errToast.present();
//   } finally {
//     this.loading = false;
//   }
// }


// async removeGroupFromCommunity(groupId: string) {
//   if (!this.communityId || !groupId) return;

//   const alert = await this.alertCtrl.create({
//     header: 'Remove group from community',
//     message: 'Do you want to remove this group from the community? The group will remain but will no longer belong to the community.',
//     inputs: [
//       {
//         name: 'removeMembers',
//         type: 'checkbox',
//         label: 'Also remove members of this group from the community and from the group',
//         value: 'removeMembers',
//         checked: false
//       }
//     ],
//     buttons: [
//       { text: 'Cancel', role: 'cancel' },
//       { text: 'Remove', role: 'ok' }
//     ]
//   });
//   await alert.present();

//   const res = await alert.onDidDismiss();
//   if (res.role === 'cancel') return;

//   // normalize checkbox result
//   let checked = false;
//   try {
//     const data = res?.data;
//     if (Array.isArray((data as any)?.values)) {
//       checked = (data as any).values.includes('removeMembers');
//     } else if (Array.isArray((data as any)?.data)) {
//       checked = (data as any).data.includes('removeMembers');
//     } else if (Array.isArray(data)) {
//       checked = data.includes('removeMembers');
//     } else {
//       checked = !!((data as any).removeMembers);
//     }
//   } catch (e) {
//     checked = false;
//   }

//   this.loading = true;

//   try {
//     const updates: any = {};

//     // unlink group from community and clear group's communityId
//     updates[`/communities/${this.communityId}/groups/${groupId}`] = null;
//     updates[`/groups/${groupId}/communityId`] = null;

//     // current groups under community and remaining after removal
//     const currentGroupIds: string[] = await this.firebaseService.getGroupsInCommunity(this.communityId) || [];
//     const remainingGroupIds = currentGroupIds.filter(gid => gid !== groupId);

//     // members that remain because they are in remaining groups
//     const remainingMembersFromGroups = new Set<string>();
//     for (const gid of remainingGroupIds) {
//       try {
//         const g = await this.firebaseService.getGroupInfo(gid);
//         if (g && g.members) {
//           Object.keys(g.members).forEach(uid => { if (uid) remainingMembersFromGroups.add(uid); });
//         }
//       } catch (err) {
//         console.warn('Failed to load group members for', gid, err);
//       }
//     }

//     // members of the group being removed
//     const removedGroupMembers = new Set<string>();
//     let removedGroupMembersCount = 0;
//     let removedGroupMembersObj: Record<string, any> = {};
//     let removedGroupCurrentCount = 0;
//     try {
//       const removedGroup = await this.firebaseService.getGroupInfo(groupId);
//       if (removedGroup) {
//         removedGroupMembersObj = removedGroup.members || {};
//         Object.keys(removedGroupMembersObj).forEach(uid => { if (uid) removedGroupMembers.add(uid); });
//         removedGroupMembersCount = removedGroupMembers.size;
//         removedGroupCurrentCount = removedGroup.membersCount || Object.keys(removedGroupMembersObj || {}).length || 0;
//       }
//     } catch (err) {
//       console.warn('Failed to load removed group members', err);
//     }

//     // existing community members
//     let existingCommMembersObj: Record<string, any> = {};
//     try {
//       const comm = await this.firebaseService.getCommunityInfo(this.communityId);
//       existingCommMembersObj = comm?.members || {};
//     } catch (err) {
//       console.warn('Failed to load community info', err);
//     }

//     // compute final members set depending on checkbox
//     const finalMembersSet = new Set<string>();

//     if (checked) {
//       // user wants to remove members of the removed group from community as well
//       // start with members that remain due to other groups
//       remainingMembersFromGroups.forEach(uid => finalMembersSet.add(uid));
//       // remove any removedGroupMembers from final set (force-remove)
//       removedGroupMembers.forEach(uid => {
//         if (finalMembersSet.has(uid)) finalMembersSet.delete(uid);
//       });
//       // finalMembersSet now contains who should remain in community
//     } else {
//       // safe: union of existing community members and members present in remaining groups
//       Object.keys(existingCommMembersObj || {}).forEach(uid => { if (uid) finalMembersSet.add(uid); });
//       remainingMembersFromGroups.forEach(uid => finalMembersSet.add(uid));
//       // removedGroupMembers will only be removed if they are neither in existingCommMembers nor remaining groups
//     }

//     // Build updates to set true for finalMembersSet and null for members no longer present
//     const existingMemberIds = Object.keys(existingCommMembersObj || {});

//     finalMembersSet.forEach(uid => {
//       updates[`/communities/${this.communityId}/members/${uid}`] = true;
//       updates[`/usersInCommunity/${uid}/joinedCommunities/${this.communityId}`] = true;
//     });

//     existingMemberIds.forEach(uid => {
//       if (!finalMembersSet.has(uid)) {
//         updates[`/communities/${this.communityId}/members/${uid}`] = null;
//         updates[`/usersInCommunity/${uid}/joinedCommunities/${this.communityId}`] = null;
//       }
//     });

//     // update membersCount
//     updates[`/communities/${this.communityId}/membersCount`] = finalMembersSet.size;

//     // --- NEW: if checkbox checked, also remove those members from the group's members node and adjust group's membersCount ---
//     if (checked) {
//       // calculate which uids to remove from the group node: it's intersection of removedGroupMembers and (members that we removed from community)
//       const removedFromCommunitySet = new Set<string>();
//       existingMemberIds.forEach(uid => { if (!finalMembersSet.has(uid)) removedFromCommunitySet.add(uid); });

//       // members to delete from the specific group's members node = intersection(removedGroupMembers, removedFromCommunitySet)
//       const toRemoveFromGroup: string[] = [];
//       removedGroupMembers.forEach(uid => {
//         if (removedFromCommunitySet.has(uid)) toRemoveFromGroup.push(uid);
//       });

//       // mark each group member entry for deletion
//       toRemoveFromGroup.forEach(uid => {
//         console.log("user ids",uid);
//         updates[`/groups/${groupId}/members/${uid}`] = null;
//         updates[`/users/${uid}/groups/${groupId}`] = null; // also remove user's group index if you keep that index
//       });

//       // adjust group's membersCount (subtract removedFromGroup count, ensure >= 0)
//       const decrement = toRemoveFromGroup.length;
//       const newGroupCount = Math.max(0, (removedGroupCurrentCount || 0) - decrement);
//       updates[`/groups/${groupId}/membersCount`] = newGroupCount;
//     }

//     // commit updates atomically (use helper if available)
//     if (typeof (this.firebaseService as any).bulkUpdate === 'function') {
//       await (this.firebaseService as any).bulkUpdate(updates);
//     } else if (typeof (this.firebaseService as any).setPath === 'function') {
//       // fallback non-atomic
//       const promises = Object.keys(updates).map(p => (this.firebaseService as any).setPath(p, updates[p]));
//       await Promise.all(promises);
//     } else {
//       throw new Error('bulkUpdate or setPath helper not found on FirebaseChatService');
//     }

//     const successToast = await this.toastCtrl.create({
//       message: 'Group removed from community and members updated',
//       duration: 2000,
//       color: 'success'
//     });
//     await successToast.present();

//     // refresh UI
//     await this.loadGroupsForCommunity();
//   } catch (err) {
//     console.error('removeGroupFromCommunity failed', err);
//     const errToast = await this.toastCtrl.create({
//       message: 'Failed to remove group. Try again.',
//       duration: 3000,
//       color: 'danger'
//     });
//     await errToast.present();
//   } finally {
//     this.loading = false;
//   }
// }


async removeGroupFromCommunity(groupId: string) {
  if (!this.communityId || !groupId) return;

  // show confirmation with checkbox
  const alert = await this.alertCtrl.create({
    header: 'Remove group from community',
    message: 'Do you want to remove this group from the community? The group will remain but will no longer belong to the community.',
    inputs: [
      {
        name: 'removeMembers',
        type: 'checkbox',
        label: 'Also remove members of this group from the community and from the group',
        value: 'removeMembers',
        checked: false
      }
    ],
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      { text: 'Remove', role: 'ok' }
    ]
  });
  await alert.present();

  const res = await alert.onDidDismiss();
  if (res.role === 'cancel') return;

  // normalize checkbox result
  let checked = false;
  try {
    const data = res?.data;
    if (Array.isArray((data as any)?.values)) {
      checked = (data as any).values.includes('removeMembers');
    } else if (Array.isArray((data as any)?.data)) {
      checked = (data as any).data.includes('removeMembers');
    } else if (Array.isArray(data)) {
      checked = data.includes('removeMembers');
    } else {
      checked = !!((data as any).removeMembers);
    }
  } catch (e) {
    checked = false;
  }

  this.loading = true;

  try {
    const updates: any = {};

    // unlink group from community and clear group's communityId
    updates[`/communities/${this.communityId}/groups/${groupId}`] = null;
    updates[`/groups/${groupId}/communityId`] = null;

    // fetch community info to know creator (so we don't remove them)
    let commInfo: any = null;
    try {
      commInfo = await this.firebaseService.getCommunityInfo(this.communityId);
    } catch (err) {
      console.warn('Failed to fetch community info', err);
    }
    const commCreatedBy = commInfo?.createdBy ?? null;

    // current groups under community and remaining after removal
    const currentGroupIds: string[] = await this.firebaseService.getGroupsInCommunity(this.communityId) || [];
    const remainingGroupIds = currentGroupIds.filter(gid => gid !== groupId);

    // members that remain because they are in remaining groups
    const remainingMembersFromGroups = new Set<string>();
    for (const gid of remainingGroupIds) {
      try {
        const g = await this.firebaseService.getGroupInfo(gid);
        if (g && g.members) {
          Object.keys(g.members).forEach(uid => { if (uid) remainingMembersFromGroups.add(uid); });
        }
      } catch (err) {
        console.warn('Failed to load group members for', gid, err);
      }
    }

    // members of the group being removed
    const removedGroupMembers = new Set<string>();
    let removedGroupCurrentCount = 0;
    let removedGroupMembersObj: Record<string, any> = {};
    try {
      const removedGroup = await this.firebaseService.getGroupInfo(groupId);
      if (removedGroup) {
        removedGroupMembersObj = removedGroup.members || {};
        Object.keys(removedGroupMembersObj).forEach(uid => { if (uid) removedGroupMembers.add(uid); });
        removedGroupCurrentCount = removedGroup.membersCount || Object.keys(removedGroupMembersObj || {}).length || 0;
      }
    } catch (err) {
      console.warn('Failed to load removed group members', err);
    }

    // existing community members
    let existingCommMembersObj: Record<string, any> = {};
    try {
      const comm = commInfo ?? await this.firebaseService.getCommunityInfo(this.communityId);
      existingCommMembersObj = comm?.members || {};
    } catch (err) {
      console.warn('Failed to load community info', err);
    }

    // compute final members set depending on checkbox choice
    const finalMembersSet = new Set<string>();

    if (checked) {
      // user wants to remove members of the removed group from community as well
      // start with members that remain due to other groups
      remainingMembersFromGroups.forEach(uid => finalMembersSet.add(uid));
      // remove any removedGroupMembers from final set (force-remove)
      removedGroupMembers.forEach(uid => {
        if (finalMembersSet.has(uid)) finalMembersSet.delete(uid);
      });
      // Ensure community creator always stays in final set
      if (commCreatedBy) finalMembersSet.add(commCreatedBy);
    } else {
      // safe: union of existing community members and members present in remaining groups
      Object.keys(existingCommMembersObj || {}).forEach(uid => { if (uid) finalMembersSet.add(uid); });
      remainingMembersFromGroups.forEach(uid => finalMembersSet.add(uid));
      // ensure community creator present
      if (commCreatedBy) finalMembersSet.add(commCreatedBy);
    }

    // Build updates to set true for finalMembersSet and null for members no longer present
    const existingMemberIds = Object.keys(existingCommMembersObj || {});

    finalMembersSet.forEach(uid => {
      // never remove community creator - set true always
      updates[`/communities/${this.communityId}/members/${uid}`] = true;
      updates[`/usersInCommunity/${uid}/joinedCommunities/${this.communityId}`] = true;
    });

    existingMemberIds.forEach(uid => {
      if (!finalMembersSet.has(uid)) {
        // do not remove community creator
        if (uid === commCreatedBy) return;
        updates[`/communities/${this.communityId}/members/${uid}`] = null;
        updates[`/usersInCommunity/${uid}/joinedCommunities/${this.communityId}`] = null;
      }
    });

    // update membersCount to final set size
    updates[`/communities/${this.communityId}/membersCount`] = finalMembersSet.size;

    // --- NEW: if checkbox checked, also remove those members from the group's members node and adjust group's membersCount ---
    if (checked) {
      // which uids were removed from community (excluding creator)
      const removedFromCommunitySet = new Set<string>();
      existingMemberIds.forEach(uid => {
        if (!finalMembersSet.has(uid) && uid !== commCreatedBy) removedFromCommunitySet.add(uid);
      });

      // members to delete from the specific group's members node = intersection(removedGroupMembers, removedFromCommunitySet)
      const toRemoveFromGroup: string[] = [];
      removedGroupMembers.forEach(uid => {
        if (removedFromCommunitySet.has(uid) && uid !== commCreatedBy) toRemoveFromGroup.push(uid);
      });

      // mark each group member entry for deletion & remove user's group index
      // toRemoveFromGroup.forEach(uid => {
      //   // updates[`/groups/${groupId}/members/${uid}`] = null;
      //   updates[`/users/${uid}/groups/${groupId}`] = null;
      //   // updates[`/groups/`]
      // });

      // --- find announcement group id for this community (if any) ---
let announcementGroupId: string | null = null;
try {
  const groupIdsInCommunity = await this.firebaseService.getGroupsInCommunity(this.communityId);
  if (Array.isArray(groupIdsInCommunity)) {
    for (const gid of groupIdsInCommunity) {
      try {
        const ginfo = await this.firebaseService.getGroupInfo(gid);
        if (ginfo && ginfo.type === 'announcement') {
          announcementGroupId = gid;
          break;
        }
      } catch (e) {
        console.warn('Failed to load group info while searching announcement group', gid, e);
      }
    }
  }
} catch (e) {
  console.warn('Failed to fetch groups for community to find announcement group', e);
}

// --- Determine which members must be removed from the specific group (toRemoveFromGroup computed earlier) ---
// (Assume toRemoveFromGroup: string[] already computed)
toRemoveFromGroup.forEach(uid => {
  // 1) remove user from this group's members node
  // updates[`/groups/${groupId}/members/${uid}`] = null;

  // 2) remove user's index for this group
  updates[`/users/${uid}/groups/${groupId}`] = null;

  // 3) Also remove from announcement group (if announcementGroupId exists)
  if (announcementGroupId) {
    updates[`/groups/${announcementGroupId}/members/${uid}`] = null;
    updates[`/users/${uid}/groups/${announcementGroupId}`] = null;
  }
});

// --- adjust announcement group's membersCount if we removed people from it ---
if (announcementGroupId && toRemoveFromGroup.length > 0) {
  try {
    const annInfo = await this.firebaseService.getGroupInfo(announcementGroupId);
    const annCurrentCount = annInfo?.membersCount || (annInfo?.members ? Object.keys(annInfo.members).length : 0);
    // compute how many of `toRemoveFromGroup` were actually present in announcement group
    let actuallyRemovedFromAnn = 0;
    if (annInfo && annInfo.members) {
      for (const uid of toRemoveFromGroup) {
        if (annInfo.members[uid]) actuallyRemovedFromAnn++;
      }
    } else {
      // fallback: assume all removed from group might have been in announcement group
      actuallyRemovedFromAnn = toRemoveFromGroup.length;
    }
    const newAnnCount = Math.max(0, annCurrentCount - actuallyRemovedFromAnn);
    updates[`/groups/${announcementGroupId}/membersCount`] = newAnnCount;
  } catch (e) {
    console.warn('Failed to update announcement group count', e);
  }
}
      // adjust group's membersCount (subtract removedFromGroup count, ensure >= 0)
      const decrement = toRemoveFromGroup.length;
      const newGroupCount = Math.max(0, (removedGroupCurrentCount || 0) - decrement);
      // updates[`/groups/${groupId}/membersCount`] = newGroupCount;
    }

    // commit updates atomically (use helper if available)
    if (typeof (this.firebaseService as any).bulkUpdate === 'function') {
      await (this.firebaseService as any).bulkUpdate(updates);
    } else if (typeof (this.firebaseService as any).setPath === 'function') {
      // fallback non-atomic
      const promises = Object.keys(updates).map(p => (this.firebaseService as any).setPath(p, updates[p]));
      await Promise.all(promises);
    } else {
      throw new Error('bulkUpdate or setPath helper not found on FirebaseChatService');
    }

    const successToast = await this.toastCtrl.create({
      message: 'Group removed from community and members updated',
      duration: 2000,
      color: 'success'
    });
    await successToast.present();

    // refresh UI
    await this.loadGroupsForCommunity();
  } catch (err) {
    console.error('removeGroupFromCommunity failed', err);
    const errToast = await this.toastCtrl.create({
      message: 'Failed to remove group. Try again.',
      duration: 3000,
      color: 'danger'
    });
    await errToast.present();
  } finally {
    this.loading = false;
  }
}





  goToAddExistingGroups() {
  // get communityId if available
  const communityId = this.route.snapshot.queryParamMap.get('communityId');

  // navigate to add-existing-groups page and pass communityId
  this.navCtrl.navigateForward(['/add-existing-groups'], {
    queryParams: { communityId }
  });
}
}
