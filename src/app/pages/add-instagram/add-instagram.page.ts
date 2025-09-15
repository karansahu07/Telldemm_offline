// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { IonicModule, NavController, ToastController, LoadingController } from '@ionic/angular';
// import { Router } from '@angular/router';
// import { FormsModule } from '@angular/forms';
// import { ApiService } from 'src/app/services/api/api.service';
// import { AuthService } from 'src/app/auth/auth.service';

// @Component({
//   selector: 'app-add-instagram',
//   standalone: true,
//   imports: [IonicModule, CommonModule, FormsModule],
//   templateUrl: './add-instagram.page.html',
//   styleUrls: ['./add-instagram.page.scss']
// })
// export class AddInstagramPage {
//   username: string = '';

//   constructor(
//     private router: Router,
//     private navCtrl: NavController,
//     private toastCtrl: ToastController,
//     private loadingCtrl: LoadingController,
//     private apiService: ApiService,
//     private authService: AuthService
//   ) {}

//   async save() {
//     const trimmed = (this.username || '').trim();
//     if (!trimmed) {
//       const t = await this.toastCtrl.create({
//         message: 'Please enter your Instagram username',
//         duration: 1600,
//         color: 'danger'
//       });
//       await t.present();
//       return;
//     }

//     if (/\s/.test(trimmed) || trimmed.length > 30) {
//       const t = await this.toastCtrl.create({
//         message: 'Enter a valid username (no spaces)',
//         duration: 1600,
//         color: 'danger'
//       });
//       await t.present();
//       return;
//     }

//     // 👇 build full profile url
//     const profileUrl = `https://instagram.com/${trimmed}`;

//     const loading = await this.loadingCtrl.create({
//       message: 'Saving...',
//       backdropDismiss: false
//     });
//     await loading.present();

//     try {
//       const userId = Number(this.authService.authData?.userId || 0);
//       if (!userId) {
//         throw new Error('User ID not found');
//       }

//       // 1 = Instagram (social_media_id)
//       await this.apiService.updateSocialMedia(userId, 1, profileUrl).toPromise();

//       await loading.dismiss();
//       const t = await this.toastCtrl.create({
//         message: 'Instagram saved successfully!',
//         duration: 1500,
//         color: 'success'
//       });
//       await t.present();

//       this.navCtrl.back();
//     } catch (err) {
//       console.error('Failed to save Instagram', err);
//       await loading.dismiss();
//       const t = await this.toastCtrl.create({
//         message: 'Failed to update Instagram link. Try again.',
//         duration: 2000,
//         color: 'danger'
//       });
//       await t.present();
//     }
//   }

//   cancel() {
//     this.navCtrl.back();
//   }
// }



import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, ToastController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api/api.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-add-instagram',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './add-instagram.page.html',
  styleUrls: ['./add-instagram.page.scss']
})
export class AddInstagramPage implements OnInit {
  username: string = '';

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    await this.loadInstagramUsername();
  }

  private async loadInstagramUsername() {
    const userId = Number(this.authService.authData?.userId || 0);
    if (!userId) return;

    try {
      const loading = await this.loadingCtrl.create({
        message: 'Loading...',
        backdropDismiss: false
      });
      await loading.present();

      this.apiService.getSocialMedia(userId).subscribe({
        next: async (res) => {
          await loading.dismiss();
          if (res?.success && Array.isArray(res.data)) {
            const insta = res.data.find(
              (item) => item.platform?.toLowerCase() === 'instagram'
            );
            if (insta?.profile_url) {
              // remove prefix https://instagram.com/
              this.username = insta.profile_url.replace(
                /^https?:\/\/(www\.)?instagram\.com\//,
                ''
              ).replace(/\/$/, ''); // remove trailing slash if any
            }
          }
        },
        error: async (err) => {
          await loading.dismiss();
          console.error('Failed to load social media', err);
          const t = await this.toastCtrl.create({
            message: 'Failed to fetch Instagram link',
            duration: 2000,
            color: 'danger'
          });
          await t.present();
        }
      });
    } catch (err) {
      console.error('Error in loadInstagramUsername', err);
    }
  }

  async save() {
    const trimmed = (this.username || '').trim();
    if (!trimmed) {
      const t = await this.toastCtrl.create({
        message: 'Please enter your Instagram username',
        duration: 1600,
        color: 'danger'
      });
      await t.present();
      return;
    }

    if (/\s/.test(trimmed) || trimmed.length > 30) {
      const t = await this.toastCtrl.create({
        message: 'Enter a valid username (no spaces)',
        duration: 1600,
        color: 'danger'
      });
      await t.present();
      return;
    }

    // 👇 build full profile url
    const profileUrl = `https://instagram.com/${trimmed}`;

    const loading = await this.loadingCtrl.create({
      message: 'Saving...',
      backdropDismiss: false
    });
    await loading.present();

    try {
      const userId = Number(this.authService.authData?.userId || 0);
      if (!userId) {
        throw new Error('User ID not found');
      }

      // 1 = Instagram (social_media_id)
      await this.apiService.updateSocialMedia(userId, 1, profileUrl).toPromise();

      await loading.dismiss();
      const t = await this.toastCtrl.create({
        message: 'Instagram saved successfully!',
        duration: 1500,
        color: 'success'
      });
      await t.present();

      this.navCtrl.back();
    } catch (err) {
      console.error('Failed to save Instagram', err);
      await loading.dismiss();
      const t = await this.toastCtrl.create({
        message: 'Failed to update Instagram link. Try again.',
        duration: 2000,
        color: 'danger'
      });
      await t.present();
    }
  }

  cancel() {
    this.navCtrl.back();
  }
}
