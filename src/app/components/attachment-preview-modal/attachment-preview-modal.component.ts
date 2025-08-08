// import { CommonModule } from '@angular/common';
// import { Component, Input } from '@angular/core';
// import { IonicModule, ModalController } from '@ionic/angular';

// @Component({
//   selector: 'app-attachment-preview-modal',
//   templateUrl: './attachment-preview-modal.component.html',
//   styleUrls: ['./attachment-preview-modal.component.scss'],
//   standalone: true,
//   imports: [CommonModule, IonicModule],
// })
// export class AttachmentPreviewModalComponent {
//   @Input() attachment: any;

//   showUI: boolean = true;

//   constructor(private modalCtrl: ModalController) {}

//   closeModal() {
//     this.modalCtrl.dismiss();
//   }

//   toggleUI() {
//     this.showUI = !this.showUI;
//   }

// }


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
  @Input() message: any;

  showUI: boolean = true;

  constructor(private modalCtrl: ModalController) {}

  closeModal() {
    this.modalCtrl.dismiss();
  }

  toggleUI() {
    this.showUI = !this.showUI;
  }

 
  onReply() {
    this.modalCtrl.dismiss({
      action: 'reply',
      message: this.message
    });
  }
}