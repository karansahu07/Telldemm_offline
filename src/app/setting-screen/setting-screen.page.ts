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
      

  //     // 1. Clear Ionic Storage
  //     await this.clearStorage();

  //     // 2. Clear Capacitor Preferences
  //     await this.clearPreferences();

  //     // 3. Clear Filesystem cache and data
  //     await this.clearFilesystem();

  //     // 4. Clear any other app-specific data
  //     await this.clearAppSpecificData();

  //     // 5. Clear browser storage (if running in browser)
  //     this.clearBrowserStorage();

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
  //   } catch (error) {
  //     console.error('Error during logout:', error);
      
  //     const errorAlert = await this.alertController.create({
  //       header: 'Error',
  //       message: 'Failed to clear some app data. Please try again.',
  //       buttons: ['OK']
  //     });
  //     await errorAlert.present();
  //   }
  // }

  // // Clear Ionic Storage
  // async clearStorage() {
  //   try {
  //     await this.storage.clear();
  //     console.log('Ionic Storage cleared successfully');
  //   } catch (error) {
  //     console.error('Error clearing Ionic storage:', error);
  //   }
  // }

  // // Clear Capacitor Preferences (replaces native storage)
  // async clearPreferences() {
  //   try {
  //     await Preferences.clear();
  //     console.log('Capacitor Preferences cleared successfully');
  //   } catch (error) {
  //     console.error('Error clearing Capacitor preferences:', error);
  //   }
  // }

  // // Clear Filesystem data and cache
  // async clearFilesystem() {
  //   try {
  //     // Clear Documents directory
  //     await this.clearDirectory(Directory.Documents);
      
  //     // Clear Data directory
  //     await this.clearDirectory(Directory.Data);
      
  //     // Clear Cache directory
  //     await this.clearDirectory(Directory.Cache);

  //     // Clear External directory (Android only)
  //     if (this.platform.is('android')) {
  //       await this.clearDirectory(Directory.External);
  //       await this.clearDirectory(Directory.ExternalStorage);
  //     }

  //     console.log('Filesystem cleared successfully');
  //   } catch (error) {
  //     console.error('Error clearing filesystem:', error);
  //   }
  // }

  // // Helper method to clear a specific directory
  // async clearDirectory(directory: Directory) {
  //   try {
  //     const result = await Filesystem.readdir({
  //       path: '',
  //       directory: directory
  //     });

  //     // Delete all files and folders in the directory
  //     for (const item of result.files) {
  //       try {
  //         if (item.type === 'file') {
  //           await Filesystem.deleteFile({
  //             path: item.name,
  //             directory: directory
  //           });
  //         } else {
  //           // For directories, we need to recursively delete
  //           await this.deleteDirectoryRecursive(item.name, directory);
  //         }
  //       } catch (deleteError) {
  //         console.log(`Could not delete ${item.name}:`, deleteError);
  //       }
  //     }
      
  //     console.log(`${directory} directory cleared`);
  //   } catch (error) {
  //     console.log(`${directory} directory already empty or error:`, error);
  //   }
  // }

  // // Recursive directory deletion helper
  // async deleteDirectoryRecursive(path: string, directory: Directory) {
  //   try {
  //     const result = await Filesystem.readdir({
  //       path: path,
  //       directory: directory
  //     });

  //     for (const item of result.files) {
  //       const itemPath = `${path}/${item.name}`;
        
  //       if (item.type === 'file') {
  //         await Filesystem.deleteFile({
  //           path: itemPath,
  //           directory: directory
  //         });
  //       } else {
  //         await this.deleteDirectoryRecursive(itemPath, directory);
  //       }
  //     }

  //     // Delete the directory itself after clearing its contents
  //     await Filesystem.rmdir({
  //       path: path,
  //       directory: directory,
  //       recursive: true
  //     });
      
  //   } catch (error) {
  //     console.log(`Error deleting directory ${path}:`, error);
  //   }
  // }

  // // Clear any other app-specific data
  // async clearAppSpecificData() {
  //   try {
  //     // Clear specific storage keys from Ionic Storage
  //     const keysToRemove = [
  //       'user_token',
  //       'user_data',
  //       'app_settings',
  //       'cached_data',
  //       'conversation_history',
  //       'media_cache',
  //       'auth_token',
  //       'refresh_token',
  //       'user_preferences',
  //       'app_config',
  //       // Add other keys your app uses
  //     ];

  //     for (const key of keysToRemove) {
  //       await this.storage['remove'](key);
  //     }

  //     // Clear specific preferences
  //     const preferencesToRemove = [
  //       'hasSeenIntro',
  //       'isLoggedIn',
  //       'userSettings',
  //       'appTheme',
  //       'language',
  //       'notifications',
  //       // Add other preference keys your app uses
  //     ];

  //     for (const key of preferencesToRemove) {
  //       await Preferences.remove({ key: key });
  //     }

  //     console.log('App-specific data cleared');
  //   } catch (error) {
  //     console.error('Error clearing app-specific data:', error);
  //   }
  // }

  // // Clear browser storage (localStorage, sessionStorage, IndexedDB)
  // clearBrowserStorage() {
  //   try {
  //     if (typeof(Storage) !== "undefined") {
  //       localStorage.clear();
  //       sessionStorage.clear();
  //       console.log('Browser storage cleared');
  //     }

  //     // Clear IndexedDB databases (if your app uses any)
  //     if ('indexedDB' in window) {
  //       this.clearIndexedDB();
  //     }
  //   } catch (error) {
  //     console.error('Error clearing browser storage:', error);
  //   }
  // }

  // // Clear IndexedDB databases
  // async clearIndexedDB() {
  //   try {
  //     if ('databases' in indexedDB) {
  //       const databases = await indexedDB.databases();
        
  //       for (const database of databases) {
  //         if (database.name) {
  //           const deleteRequest = indexedDB.deleteDatabase(database.name);
  //           deleteRequest.onsuccess = () => {
  //             console.log(`IndexedDB ${database.name} deleted`);
  //           };
  //           deleteRequest.onerror = () => {
  //             console.log(`Error deleting IndexedDB ${database.name}`);
  //           };
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error clearing IndexedDB:', error);
  //   }
  // }

  // // Restart the app
  // // async restartApp() {
  // //   try {
  // //     if (this.platform.is('capacitor')) {
  // //       // For Capacitor apps, we can navigate to root and reload
  // //       this.navCtrl.navigateRoot('/login'); // Change to your login/intro route
        
  // //       // Force reload the app
  // //       if (this.platform.is('android') || this.platform.is('ios')) {
  // //         // On mobile, we can use App plugin to minimize and restore
  // //         await App.minimizeApp();
  // //         // Note: There's no direct restart method, but minimizing often helps
  // //       } else {
  // //         // In browser, reload the page
  // //         window.location.reload();
  // //       }
  // //     } else {
  // //       // Fallback for browser/PWA
  // //       window.location.reload();
  // //     }
  // //   } catch (error) {
  // //     console.error('Error restarting app:', error);
  // //     // Fallback navigation
  // //     this.navCtrl.navigateRoot('/login');
  // //   }
  // // }

  // // Alternative method for complete app reset
  // async showAppResetInstructions() {
  //   const alert = await this.alertController.create({
  //     header: 'Complete Reset',
  //     message: 'For a complete app reset, you can:<br><br>1. Close the app completely<br>2. Clear app cache from device settings<br>3. Reopen the app<br><br>Or uninstall and reinstall the app for a fresh start.',
  //     buttons: ['Got it']
  //   });

  //   await alert.present();
  // }

  // Get device info for debugging
  // async getDeviceInfo() {
  //   try {
  //     const info = await Device.getInfo();
  //     console.log('Device Info:', info);
  //     return info;
  //   } catch (error) {
  //     console.error('Error getting device info:', error);
  //     return null;
  //   }
  // }


}