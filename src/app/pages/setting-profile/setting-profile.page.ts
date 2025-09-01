// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { IonicModule} from '@ionic/angular';

// @Component({
//   selector: 'app-setting-profile',
//   templateUrl: './setting-profile.page.html',
//   styleUrls: ['./setting-profile.page.scss'],
//   standalone: true,
//   imports: [IonicModule, CommonModule],
// })
// export class SettingProfilePage implements OnInit {

//   profileImageUrl = 'assets/images/user.jfif';

//   user = {
//     name: 'KARAN',
//     about: '.',
//     phone: '+91 91381 52160',
//   };

//   constructor() {}

//   editProfileImage() {
//     console.log('Edit profile image clicked');
//     // logic to open file picker / camera
//   }

//   addLinks() {
//     console.log('Add links clicked');
//     // logic to add user links
//   }

//   ngOnInit() {
//   }

// }



import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../auth/auth.service';
import { ApiService } from 'src/app/services/api/api.service';

@Component({
  selector: 'app-setting-profile',
  templateUrl: './setting-profile.page.html',
  styleUrls: ['./setting-profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class SettingProfilePage implements OnInit {
  profileImageUrl = 'assets/images/user.jfif';
  isLoadingProfile = false;
  
  user = {
    name: '',
    about: '',
    phone: ''
  };

  constructor(
    private authService: AuthService,
    private service : ApiService
  ) {}

  async ngOnInit() {
    // Make sure auth is hydrated (if app just started)
    await this.authService.hydrateAuth();
    
    if (this.authService.authData) {
      const auth = this.authService.authData;
      this.user = {
        name: auth.name || '',
        about: '.',
        phone: auth.phone_number || ''
      };
      
      // Load profile image
      await this.loadUserProfile();
    }
  }

  async loadUserProfile() {
    try {
      const userId = this.authService.authData?.userId;
      
      if (userId) {
        this.isLoadingProfile = true;
        
        this.service.getUserProfilebyId(userId).subscribe({
          next: (response: any) => {
            console.log('Profile response:', response);
            if (response.profile || response.image_url || response.publicKeyHex) {
              this.profileImageUrl = response.profile || response.image_url || response.publicKeyHex;
            }
            this.isLoadingProfile = false;
          },
          error: (error: any) => {
            console.error('Error loading profile:', error);
            this.isLoadingProfile = false;
          }
        });
      } else {
        console.warn('No user ID found');
        this.isLoadingProfile = false;
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      this.isLoadingProfile = false;
    }
  }

  onImageError() {
    // Fallback to default image if profile image fails to load
    this.profileImageUrl = 'assets/images/user.jfif';
  }

  editProfileImage() {
    console.log('Edit profile image clicked');
  }

  addLinks() {
    console.log('Add links clicked');
  }
}