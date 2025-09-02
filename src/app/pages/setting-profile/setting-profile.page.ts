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
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

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
 currentUserId: number | null = null;

  constructor(
    private authService: AuthService,
    private service : ApiService
  ) {}

  async ngOnInit() {
    // Make sure auth is hydrated (if app just started)
    await this.authService.hydrateAuth();

    // this.currentUserId = await this.authService.authData?.userId;

     const id = this.authService.authData?.userId;
    if (id) {
      this.currentUserId = Number(id);
    }
    
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

  // editProfileImage() {
  //   console.log('Edit profile image clicked');
  // }

async editProfileImage() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
      });

      if (image && image.webPath) {
        this.profileImageUrl = image.webPath;

        // ✅ File create karo
        const response = await fetch(image.webPath);
        const blob = await response.blob();
        const file = new File([blob], 'profile.jpg', { type: blob.type });

        if (this.currentUserId) {
          this.service.updateUserDp(this.currentUserId, file).subscribe({
            next: (res) => console.log('Profile updated successfully:', res),
            error: (err) => console.error('Error updating profile picture:', err),
          });
        } else {
          console.error('No userId found');
        }
      }
    } catch (error) {
      console.error('Error selecting image:', error);
    }
  }

  addLinks() {
    console.log('Add links clicked');
  }
}