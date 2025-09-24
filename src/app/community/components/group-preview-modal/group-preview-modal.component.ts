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
    const cb = (this.group?.createdByName || this.group?.created_by) ?? '';       
    return cb ? `Created by ${cb}` : '';
  }

  close(): void {
    this.modalCtrl.dismiss();
  }

  join(): void {
    this.modalCtrl.dismiss({ action: 'join', groupId: this.group?.id });
  }
}
