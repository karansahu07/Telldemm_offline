import { Component, OnInit } from '@angular/core';
import { IonicModule, LoadingController, NavController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseChatService } from 'src/app/services/firebase-chat.service';
import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-community-form',
  templateUrl: './new-community-form.page.html',
  styleUrls: ['./new-community-form.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class NewCommunityFormPage implements OnInit {
communityName: string = '';
  communityDescription: string =
    'Hi everyone! This community is for members to chat in topic-based groups and get important announcements.';

  // You can also get userId from AuthService (adapt if your auth interface differs)
  userId: string | null = null;

  constructor(
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private firebaseService: FirebaseChatService,
    private authService: AuthService,
    private router : Router
  ) {}

  ngOnInit() {
    this.userId = this.authService?.authData?.userId ?? null;
  }

 async createCommunity() {
  if (!this.communityName || !this.communityName.trim()) {
    const t = await this.toastCtrl.create({
      message: 'Please enter a community name.',
      duration: 2000,
      color: 'warning',
    });
    await t.present();
    return;
  }

  if (!this.userId) {
    const t = await this.toastCtrl.create({
      message: 'User not authenticated. userId missing.',
      duration: 3000,
      color: 'danger',
    });
    await t.present();
    console.error('createCommunity aborted: userId is null/undefined');
    return;
  }

  const loading = await this.loadingCtrl.create({
    message: 'Creating community...',
  });
  await loading.present();

  try {
    const communityId = `community_${Date.now()}`;

    // create community
    await this.firebaseService.createCommunity(
      communityId,
      this.communityName.trim(),
      this.communityDescription || '',
      this.userId
    );

    // add user to community (auto-joins General)
    await this.firebaseService.addUserToCommunity(this.userId, communityId, true);

    await loading.dismiss();

    const toast = await this.toastCtrl.create({
      message: 'Community created successfully',
      duration: 2000,
      color: 'success',
    });
    await toast.present();

    // NAVIGATE to community detail and pass the id
    this.router.navigate(['/community-detail'], { queryParams: { communityId } });

  } catch (err: any) {
    await loading.dismiss();

    const msg = (err && (err.message || err.code)) ? `${err.message || err.code}` : JSON.stringify(err);
    console.error('createCommunity failed:', err);

    const t = await this.toastCtrl.create({
      message: `Failed to create community: ${msg}`,
      duration: 6000,
      color: 'danger',
    });
    await t.present();
  }
}


  // Trigger photo change (can be extended to camera/gallery)
  changePhoto() {
    // keep simple placeholder for now — integrate Camera/Picker later
    this.toastCtrl
      .create({
        message: 'Change photo clicked! (Integrate Camera/Gallery here)',
        duration: 2000,
        color: 'primary',
      })
      .then(t => t.present());
  }
}
