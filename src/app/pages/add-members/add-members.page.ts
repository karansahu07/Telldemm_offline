import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { ContactSyncService } from 'src/app/services/contact-sync.service'; // adjust if path differs
import { get, child, getDatabase, ref as dbRef, update, ref } from 'firebase/database';
import { ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/auth/auth.service';
import { ApiService } from 'src/app/services/api/api.service';
import { FirebaseChatService } from 'src/app/services/firebase-chat.service';

@Component({
  selector: 'app-add-members',
  templateUrl: './add-members.page.html',
  styleUrls: ['./add-members.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class AddMembersPage implements OnInit {
  searchText = '';
  allUsers: any[] = [];
  filteredContacts: any[] = [];
  isLoading = false;
  groupId: string = '';

  constructor(
    private navCtrl: NavController,
    private contactSyncService: ContactSyncService,
    private route: ActivatedRoute,
    private toastCtrl: ToastController,
    private authService: AuthService,
    private service : ApiService,
    private firebaseChatService : FirebaseChatService
  ) {}

  ngOnInit() {
    this.loadDeviceMatchedContacts();
    this.groupId = this.route.snapshot.queryParamMap.get('groupId') || '';
    // //console.log("load device contacts",this.loadDeviceMatchedContacts);
  }

  async showToast(message: string, color: 'success' | 'danger' = 'success') {
  const toast = await this.toastCtrl.create({
    message,
    duration: 2000,
    color,
    position: 'bottom'
  });
  toast.present();
}

async loadDeviceMatchedContacts(): Promise<void> {
  const currentUserPhone = this.authService.authData?.phone_number;
  this.allUsers = [];
  this.isLoading = true;

  try {
    const pfUsers = this.firebaseChatService.currentUsers || [];
    const deviceContacts = this.firebaseChatService.currentDeviceContacts || [];

    // Extract platform user phone numbers for reference
    const pfUserPhones = pfUsers.map((pu: any) => String(pu.phoneNumber));

    // Optionally: find device contacts not on the platform
    const nonPfUsers = deviceContacts.filter(
      (dc: any) => !pfUserPhones.includes(String(dc.phoneNumber))
    );

    // Normalize platform users to match your HTML structure
    this.allUsers = [
      ...pfUsers.map((u: any) => ({
        user_id: String(u.userId ?? u.user_id ?? ''), // backend ID
        name: u.username ?? u.name ?? u.phoneNumber ?? 'Unknown',
        image: u.avatar ?? u.profile ?? 'assets/images/user.jfif',
        phone_number: String(u.phoneNumber ?? ''),
        isOnPlatform: true,
        selected: false,
      })),
      // Optional: Uncomment if you want to include non-platform device contacts
      // ...nonPfUsers.map((dc: any) => ({
      //   user_id: null,
      //   name: dc.username ?? dc.phoneNumber,
      //   image: dc.avatar ?? 'assets/images/user.jfif',
      //   phone_number: String(dc.phoneNumber),
      //   isOnPlatform: false,
      //   selected: false,
      // })),
    ];

    // Initialize filtered list for search
    this.filteredContacts = [...this.allUsers];
  } catch (error) {
    console.error('Error loading contacts', error);
  } finally {
    this.isLoading = false;
  }
}


//pfUsers

  get selectedUsers() {
    return this.allUsers.filter(user => user.selected);
  }

  toggleSelect(user: any) {
    user.selected = !user.selected;
  }

  filteredUsers() {
    const search = this.searchText.toLowerCase();
    return this.filteredContacts.filter(user =>
      user.name?.toLowerCase().includes(search)
    );
  }

// async addSelectedMembers() {
//   if (!this.groupId) {
//     this.showToast('Group ID not found', 'danger');
//     return;
//   }

//   const selected = this.selectedUsers.map(u => ({
//     user_id: u.user_id,
//     name: u.name,
//     phone_number: u.phone_number
//   }));

//   if (selected.length === 0) {
//     this.showToast('No members selected', 'danger');
//     return;
//   }

//   const db = getDatabase();
//   const updates: any = {};

//   selected.forEach(member => {
//     // Add to group members in Firebase
//     updates[`groups/${this.groupId}/members/${member.user_id}`] = {
//       name: member.name,
//       phone_number: member.phone_number,
//       status: 'active',
//       role: 'member'
//     };

//     // Remove from pastmembers if exists
//     updates[`groups/${this.groupId}/pastmembers/${member.user_id}`] = null;
//   });

//   try {
//     // Update Firebase
//     await update(ref(db), updates);

//     // Get backendGroupId from Firebase
//     const backendGroupIdSnap = await get(ref(db, `groups/${this.groupId}/backendGroupId`));
//     const backendGroupId = backendGroupIdSnap.val();

//     if (!backendGroupId) {
//       this.showToast("Backend group ID missing", "danger");
//       return;
//     }

//     // Sync each member to backend
//     selected.forEach(member => {
//       this.service.addGroupMember(
//         Number(backendGroupId), // backend group_id
//         Number(member.user_id), // user_id
//         2 // role_id (2 = member, 1 = admin etc.)
//       ).subscribe({
//         next: () => {},
//         error: () => {
//           this.showToast(`Failed to sync member ${member.name}`, 'danger');
//         }
//       });
//     });

//     this.showToast('Members added successfully 🎉', 'success');
//     this.navCtrl.back();

//   } catch {
//     this.showToast('Error adding members', 'danger');
//   }
// }

async addSelectedMembers() {
  if (!this.groupId) {
    this.showToast('Group ID not found', 'danger');
    return;
  }

  // collect selected user ids (normalize whether it's user_id or user_id)
  const selected = this.selectedUsers;
  if (!selected || selected.length === 0) {
    this.showToast('No members selected', 'danger');
    return;
  }

  // Normalize user ids to strings (firebase user ids)
  const userIds: string[] = selected
    .map((u: any) => u.user_id ?? u.userId ?? u.userId) // try common keys
    .filter(Boolean)
    .map((id: any) => String(id));

  if (userIds.length === 0) {
    this.showToast('No valid user ids found', 'danger');
    return;
  }

  this.isLoading = true;
  try {
    // 1) Update Firebase members via the shared service function
    await this.firebaseChatService.addMembersToGroup(this.groupId, userIds);

    // 2) Read backendGroupId from Firebase (if you still want to sync to backend)
    const db = getDatabase();
    const backendGroupIdSnap = await get(ref(db, `groups/${this.groupId}/backendGroupId`));
    const backendGroupId = backendGroupIdSnap.val();

    if (!backendGroupId) {
      // still OK: show success but warn backend sync didn't happen
      this.showToast('Members added in Firebase (backend id missing)', 'success');
      this.navCtrl.back();
      return;
    }

    // 3) Map userIds to numeric user IDs expected by your API if possible.
    //    Try to find matching platform user info from firebaseChatService.currentUsers
    const platformUsers = this.firebaseChatService.currentUsers || [];

    // Build an array of numeric ids (or fallback to Number(userId))
    const backendCalls = userIds.map((uid) => {
      // try to find the matching user object
      const found = platformUsers.find(
        (p: any) => String(p.userId) === String(uid) || String(p.user_id) === String(uid)
      );
      const numericUserId = Number(found?.userId ?? found?.userId ?? uid);
      const userIdForApi = Number.isFinite(numericUserId) ? numericUserId : Number(uid);

      // call backend api
      return new Promise<void>((resolve, reject) => {
        this.service
          .addGroupMember(Number(backendGroupId), Number(userIdForApi), 2)
          .subscribe({
            next: () => resolve(),
            error: (err) => {
              console.error('Failed to sync member to backend', uid, err);
              // still resolve so single failure doesn't block everyone
              // but show toast for this failure afterwards
              resolve();
            },
          });
      });
    });

    // wait for all backend sync promises to finish
    await Promise.all(backendCalls);

    this.showToast('Members added successfully 🎉', 'success');
    this.navCtrl.back();
  } catch (err) {
    console.error('Error adding members', err);
    this.showToast('Error adding members', 'danger');
  } finally {
    this.isLoading = false;
  }
}



  checkboxChanged(user: any) {
    user.selected = !user.selected;
  }
}