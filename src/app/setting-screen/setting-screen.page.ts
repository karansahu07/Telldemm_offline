// import { CommonModule } from '@angular/common';
// import { Component, OnInit } from '@angular/core';
// import { IonicModule, PopoverController } from '@ionic/angular';
// import { MenuPopoverComponent } from '../components/menu-popover/menu-popover.component';

// @Component({
//   selector: 'app-setting-screen',
//   templateUrl: './setting-screen.page.html',
//   styleUrls: ['./setting-screen.page.scss'],
//   imports: [IonicModule, CommonModule]
// })
// export class SettingScreenPage implements OnInit {

//   constructor(private popoverCtrl: PopoverController) { }

//   ngOnInit() {
//   }

//   async presentPopover(ev: any) {
//     const popover = await this.popoverCtrl.create({
//       component: MenuPopoverComponent,
//       event: ev,
//       translucent: true,
//     });
//     await popover.present();
//   }
// }



import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AlertController, IonicModule, NavController, Platform, PopoverController } from '@ionic/angular';
import { MenuPopoverComponent } from '../components/menu-popover/menu-popover.component';
import { ApiService } from '../services/api/api.service';
import { AuthService } from '../auth/auth.service';
import { SecureStorageService } from '../services/secure-storage/secure-storage.service';
import { Router } from '@angular/router';
import { Resetapp } from '../services/resetapp';
// import { Preferences } from '@capacitor/preferences';
// import { Directory, Filesystem } from '@capacitor/filesystem';
// import { App } from '@capacitor/app';


@Component({
  selector: 'app-setting-screen',
  templateUrl: './setting-screen.page.html',
  styleUrls: ['./setting-screen.page.scss'],
  imports: [IonicModule, CommonModule]
})
export class SettingScreenPage implements OnInit {
  profileImageUrl: string = 'assets/images/user.jfif';
  isLoading: boolean = true;
   sender_name = '';
   dpStatus: string = 'Hey there! I am using telldemm';
  
  constructor(
    private popoverCtrl: PopoverController,
    private service: ApiService,
    private authService: AuthService,
    private secureStorage : SecureStorageService,
    private router : Router,
    private alertController: AlertController,
    private navCtrl: NavController,
    private resetapp : Resetapp
  ) { }

  async ngOnInit() {
    this.loadUserProfile();
    this.sender_name = this.authService.authData?.name || '';
  }

  ionViewWillEnter() {
  this.loadUserProfile();
  this.sender_name = this.authService.authData?.name || '';
}

  goToProfile() {
  this.router.navigateByUrl('/setting-profile');
}



 // Sections
goToAccount() {
  this.router.navigateByUrl('account');
}

goToPrivacy() {
  this.router.navigateByUrl('privacy');
}

goToAvatar() {
  this.router.navigateByUrl('avatar');
}

goToChats() {
  this.router.navigateByUrl('chats');
}

goToAccessibility() {
  this.router.navigateByUrl('accessibility');
}

goToNotifications() {
  this.router.navigateByUrl('notification');
}

goToStorageData() {
  this.router.navigateByUrl('storage-data');
}

goToAppLanguage() {
  this.router.navigateByUrl('app-language');
}

goToHelpFeedback() {
  this.router.navigateByUrl('help-feedback');
}

goToAppUpdates() {
  this.router.navigateByUrl('app-updates');
}

goToInviteFriend() {
  this.router.navigateByUrl('invite-friend');
}

  async loadUserProfile() {
  try {
    const userId = this.authService.authData?.userId;

    if (userId) {
      this.service.getUserProfilebyId(userId).subscribe({
        next: (response: any) => {
          console.log('Profile response:', response);

          if (response.profile || response.image_url) {
            this.profileImageUrl = response.profile || response.image_url;
          }
          
          this.dpStatus = response.dp_status || "Hey there! I am using telldemm";

          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading profile:', error);
          this.isLoading = false;
        }
      });
    } else {
      console.warn('No user ID found');
      this.isLoading = false;
    }
  } catch (error) {
    console.error('Error in loadUserProfile:', error);
    this.isLoading = false;
  }
}


  async presentPopover(ev: any) {
    const popover = await this.popoverCtrl.create({
      component: MenuPopoverComponent,
      event: ev,
      translucent: true,
    });
    await popover.present();
  }

  // Handle image load error
  onImageError(event: any) {
    console.warn('Failed to load profile image, using default');
    event.target.src = 'assets/images/user.jfif';
  }

   async logout() {
    const alert = await this.alertController.create({
      header: 'Confirm Logout',
      message: 'Are you sure you want to log out? This will clear all app data and reset the application.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Log Out',
          cssClass: 'danger',
          handler: () => {
            this.performLogout();
          }
        }
      ]
    });

    await alert.present();
  }

  async performLogout() {
      // Show loading
      const loadingAlert = await this.alertController.create({
        header: 'Logging out...',
        message: 'Clearing app data and resetting application.',
        backdropDismiss: false
      });
      await loadingAlert.present();

  //     // Close loading
      await loadingAlert.dismiss();

  //     // Show success message and restart app
      const successAlert = await this.alertController.create({
        header: 'Logout Successful',
        message: 'App data cleared successfully. The app will restart.',
        buttons: [
          {
            text: 'OK',
            handler: () => {
              // this.restartApp();
              this.resetapp.resetApp();
            }
          }
        ]
      });
      await successAlert.present();
    }
}