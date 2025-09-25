// import { Component, Input } from '@angular/core';
// import { IonicModule, ModalController } from '@ionic/angular';
// import { CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-group-preview-modal',
//   templateUrl: './group-preview-modal.component.html',
//   styleUrls: ['./group-preview-modal.component.scss'],
//   standalone: true,
//   imports: [IonicModule, CommonModule]
// })
// export class GroupPreviewModalComponent {
//   @Input() group: any;
//   @Input() communityName = '';
//   @Input() currentUserId = '';
//   @Input() currentUserName = '';
//   @Input() currentUserPhone = '';

//   constructor(private modalCtrl: ModalController) {}

//   get memberKeys(): string[] {
//     if (!this.group || !this.group.rawMembers) return [];
//     return Object.keys(this.group.rawMembers);
//   }

//   memberObj(key: string): any {
//     return this.group && this.group.rawMembers ? this.group.rawMembers[key] : null;
//   }

//   initialsFor(mem: any): string {
//     const n: string = mem?.name || '';
//     if (!n) return mem?.phone_number ? String(mem.phone_number).slice(-2) : 'U';

//     // explicit types for callbacks to satisfy noImplicitAny
//     const initials = n
//       .split(' ')
//       .map((s: string) => (s && s.length > 0 ? s[0] : ''))
//       .filter((ch: string) => !!ch)
//       .slice(0, 2)
//       .join('')
//       .toUpperCase();

//     return initials || 'U';
//   }

//   get createdByText(): string {
//     console.log("createdBy",this.group.createdBy, this.group.createdByName);
//     const cb = (this.group?.createdBy || this.group?.created_by) ?? '';
//     return cb ? `Created by ${cb}` : '';
//   }

//   close(): void {
//     this.modalCtrl.dismiss();
//   }

//   join(): void {
//     this.modalCtrl.dismiss({ action: 'join', groupId: this.group?.id });
//   }
// }


import { Component, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-group-preview-modal',
  templateUrl: './group-preview-modal.component.html',
  styleUrls: ['./group-preview-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class GroupPreviewModalComponent {
  @Input() group: any;
  @Input() communityName = '';
  @Input() currentUserId = '';
  @Input() currentUserName = '';
  @Input() currentUserPhone = '';

  constructor(private modalCtrl: ModalController) {}

  get memberKeys(): string[] {
    if (!this.group || !this.group.rawMembers) return [];
    return Object.keys(this.group.rawMembers);
  }

  memberObj(key: string): any {
    return this.group && this.group.rawMembers ? this.group.rawMembers[key] : null;
  }

  initialsFor(mem: any): string {
    const n: string = mem?.name || '';
    if (!n) return mem?.phone_number ? String(mem.phone_number).slice(-2) : 'U';

    // explicit types for callbacks to satisfy noImplicitAny
    const initials = n
      .split(' ')
      .map((s: string) => (s && s.length > 0 ? s[0] : ''))
      .filter((ch: string) => !!ch)
      .slice(0, 2)
      .join('')
      .toUpperCase();

    return initials || 'U';
  }

  get createdByText(): string {
    // if group.createdByName exists use it, otherwise fall back to createdBy id
    const name = this.group?.createdByName || this.group?.createdBy || this.group?.created_by || '';
    if (!name) return '';
    // if createdAt exists you can format it here; keeping simple as before
    const createdAt = this.group?.createdAt ? `, ${new Date(this.group.createdAt).toLocaleDateString()}` : '';
    return `Created by ${name}${createdAt}`;
  }

  close(): void {
    this.modalCtrl.dismiss();
  }

  join(): void {
    this.modalCtrl.dismiss({ action: 'join', groupId: this.group?.id });
  }

  setDefaultAvatar(event: Event) {
    try {
      const img = event?.target as HTMLImageElement | null;
      if (!img) return;
      img.onerror = null; // avoid infinite loop if fallback missing
      img.src = this.avatarFallbackUrl();
    } catch (e) {
      // swallow errors - this is non-critical
      console.warn('setDefaultAvatar error', e);
    }
  }

  /**
   * Provide a fallback image path (change to your asset if needed).
   */
  avatarFallbackUrl(): string {
    return 'assets/images/user.jfif';
  }
}
