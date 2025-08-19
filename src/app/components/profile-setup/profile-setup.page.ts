// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { IonicModule, ToastController } from '@ionic/angular';
// import { Router } from '@angular/router';
// import { HttpClient, HttpClientModule } from '@angular/common/http';
// import { environment } from '../../../environments/environment'; // adjust path as needed
// import { Preferences } from '@capacitor/preferences';
// import { SecureStorageService } from '../../services/secure-storage/secure-storage.service';
// import { Database } from '@angular/fire/database';
// import { Observable } from 'rxjs';
// import { onValue, ref } from '@angular/fire/database';
// import { AuthService } from 'src/app/auth/auth.service';

// @Component({
//   selector: 'app-profile-setup',
//   standalone: true,
//   imports: [CommonModule, FormsModule, IonicModule, HttpClientModule],
//   templateUrl: './profile-setup.page.html',
//   styleUrls: ['./profile-setup.page.scss'],
// })
// export class ProfileSetupPage implements OnInit {
//   name: string = '';
//   imageData: string | ArrayBuffer | null = null;
//   phoneNumber: string = '';

//   maxLength = 25;
//   inputText = '';
//   remainingCount = this.maxLength;
//   isSubmitting: boolean = false;
//   userID: string = '';

//   constructor(
//     private toastController: ToastController,
//     private router: Router,
//     private http: HttpClient,
//     private secureStorage: SecureStorageService,
//     private db: Database,
//     private authService: AuthService
//   ) {}



// async ngOnInit() {
//   // const storedPhone = await this.secureStorage.getItem('userId');
//   const storedPhone = this.authService.authData?.userId;
// console.log('Stored Phone:', storedPhone);

//   if (storedPhone) {
//     this.userID = storedPhone;
//   } else {
//     this.showToast('Phone number is missing, please login again.', 'danger');
//     this.router.navigateByUrl('/login-screen');
//   }
// }


//   onImageSelected(event: any) {
//     const file = event.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = () => {
//         this.imageData = reader.result;
//       };
//       reader.readAsDataURL(file);
//     }
//   }

//   onInputChange(event: any) {
//     const value = event.target.value;
//     this.inputText = value.length > this.maxLength ? value.slice(0, this.maxLength) : value;
//     this.remainingCount = this.maxLength - this.inputText.length;
//   }

//   async showToast(message: string, color: 'danger' | 'success' | 'dark' = 'dark') {
//     const toast = await this.toastController.create({
//       message,
//       duration: 2000,
//       color,
//     });
//     toast.present();
//   }

//   async onSubmit() {
//   if (!this.name.trim()) {
//     this.showToast('Please enter your name', 'danger');
//     return;
//   }

//   this.isSubmitting = true; 

//   const payload = {
//     user_id: this.userID,
//     name: this.name,
//     profile_picture: this.imageData ? this.imageData.toString() : null,
//   };

//   this.http.post(`${environment.apiBaseUrl}/api/users`, payload).subscribe({
//   next: async () => {
//     // await Preferences.set({ key: 'name', value: this.name });
//     localStorage.setItem('name', this.name);
//     await this.secureStorage.setItem('name', this.name);
//     if (this.imageData) {
//       await this.secureStorage.setItem('profile_url', this.imageData.toString());
//     }

//     // this.showToast('Profile saved successfully!', 'success');
//     this.router.navigateByUrl('/home-screen', { replaceUrl: true });
//   },
//   error: async (err) => {
//     console.error(err);
//     // this.showToast('Failed to save profile. Please try again.', 'danger');
//   },
//   complete: () => {
//     this.isSubmitting = false; 
//   }
// });
// }

// }


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment'; // adjust path as needed
import { Preferences } from '@capacitor/preferences';
import { SecureStorageService } from '../../services/secure-storage/secure-storage.service';
import { Database } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { onValue, ref } from '@angular/fire/database';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-profile-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, HttpClientModule],
  templateUrl: './profile-setup.page.html',
  styleUrls: ['./profile-setup.page.scss'],
})
export class ProfileSetupPage implements OnInit {
  name: string = '';
  imageData: string | ArrayBuffer | null = null;
  selectedFile: File | null = null; // Store the actual file
  phoneNumber: string = '';
  maxLength = 25;
  inputText = '';
  remainingCount = this.maxLength;
  isSubmitting: boolean = false;
  userID: string = '';

  constructor(
    private toastController: ToastController,
    private router: Router,
    private http: HttpClient,
    private secureStorage: SecureStorageService,
    private db: Database,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    const storedPhone = this.authService.authData?.userId;
    console.log('Stored Phone:', storedPhone);
    if (storedPhone) {
      this.userID = storedPhone;
    } else {
      this.showToast('Phone number is missing, please login again.', 'danger');
      this.router.navigateByUrl('/login-screen');
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file; // Store the actual file
      
      // For preview purposes, still create base64
      const reader = new FileReader();
      reader.onload = () => {
        this.imageData = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onInputChange(event: any) {
    const value = event.target.value;
    this.inputText = value.length > this.maxLength ? value.slice(0, this.maxLength) : value;
    this.remainingCount = this.maxLength - this.inputText.length;
  }

  async showToast(message: string, color: 'danger' | 'success' | 'dark' = 'dark') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
    });
    toast.present();
  }

  async onSubmit() {
    if (!this.name.trim()) {
      this.showToast('Please enter your name', 'danger');
      return;
    }

    this.isSubmitting = true;

    // Create FormData
    const formData = new FormData();
    formData.append('user_id', this.userID);
    formData.append('name', this.name);
    
    // Append image file if selected
    if (this.selectedFile) {
      formData.append('profile_picture', this.selectedFile, this.selectedFile.name);
    }

    // Debug: Log FormData contents
    console.log('FormData contents:');
    formData.forEach((value, key) => {
      console.log(key, value);
    });

    this.http.post(`${environment.apiBaseUrl}/api/users`, formData).subscribe({
      next: async () => {
        localStorage.setItem('name', this.name);
        await this.secureStorage.setItem('name', this.name);
        
        // Store the base64 version for local use
        if (this.imageData) {
          await this.secureStorage.setItem('profile_url', this.imageData.toString());
        }
        
        this.router.navigateByUrl('/home-screen', { replaceUrl: true });
      },
      error: async (err) => {
        console.error('Error submitting profile:', err);
        this.showToast('Failed to save profile. Please try again.', 'danger');
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }
}