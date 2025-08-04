import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-attachment-preview-modal',
  templateUrl: './attachment-preview-modal.component.html',
  styleUrls: ['./attachment-preview-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class AttachmentPreviewModalComponent {
  @Input() attachment: any;

  constructor(private modalCtrl: ModalController) {}

  closeModal() {
    this.modalCtrl.dismiss();
  }
}
