import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { Share } from '@capacitor/share'; // for system share sheet

@Component({
  selector: 'app-invite-friend',
  templateUrl: './invite-friend.page.html',
  styleUrls: ['./invite-friend.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class InviteFriendPage implements OnInit {

    constructor(private toastCtrl: ToastController) {}

  ngOnInit() {
  }



  async shareLink() {
    await Share.share({
      title: 'Join me on this app!',
      text: 'Check out this awesome app. Download it here:',
      url: 'https://example.com/download',
      dialogTitle: 'Share App Link'
    });
  }

  openContacts() {
    // later: integrate Capacitor Contacts plugin or custom service
    this.showToast('Opening contacts...');
  }

  searchContacts() {
    this.showToast('Search contacts tapped.');
  }

  invite(phone: string) {
    this.showToast(`Invitation sent to ${phone}`);
  }

  private async showToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 1500,
      position: 'bottom'
    });
    await toast.present();
  }

}
