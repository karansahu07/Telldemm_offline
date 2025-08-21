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
import { IonicModule, PopoverController } from '@ionic/angular';
import { MenuPopoverComponent } from '../components/menu-popover/menu-popover.component';
import { ApiService } from '../services/api/api.service';
import { AuthService } from '../auth/auth.service';
import { SecureStorageService } from '../services/secure-storage/secure-storage.service';
import { Router } from '@angular/router';


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
  
  constructor(
    private popoverCtrl: PopoverController,
    private service: ApiService,
    private authService: AuthService,
    private secureStorage : SecureStorageService,
    private router : Router
  ) { }

  async ngOnInit() {
    this.loadUserProfile();
    this.sender_name = this.authService.authData?.name || '';
  }

  goToProfile() {
  this.router.navigateByUrl('/setting-profile');
}

  async loadUserProfile() {
    try {
      const userId = this.authService.authData?.userId;
      
      if (userId) {
        this.service.getUserProfilebyId(userId).subscribe({
          next: (response : any) => {
            console.log('Profile response:', response);
            if (response.profile || response.image_url) {
              this.profileImageUrl = response.profile || response.image_url;
            }
            this.isLoading = false;
          },
          error: (error : any) => {
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
}