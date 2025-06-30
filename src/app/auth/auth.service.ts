// import { Injectable } from '@angular/core';
// import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

// @Injectable({
//   providedIn: 'root',
// })
// export class AuthService {
//   private auth = getAuth();
//   private recaptchaVerifier!: RecaptchaVerifier;
//   private confirmationResult!: ConfirmationResult;

//   initRecaptcha(containerId: string): Promise<void> {
//     return new Promise((resolve, reject) => {
//       if (!this.recaptchaVerifier) {
//         this.recaptchaVerifier = new RecaptchaVerifier(this.auth, containerId, {
//           size: 'invisible',
//           callback: (response: any) => {
//             console.log('reCAPTCHA solved');
//             resolve();
//           }
//         });
//       } else {
//         resolve();
//       }
//     });
//   }

//   sendOTP(phone: string): Promise<void> {
//     if (!this.recaptchaVerifier) {
//       return Promise.reject(new Error('Recaptcha not initialized'));
//     }
//     return signInWithPhoneNumber(this.auth, phone, this.recaptchaVerifier)
//       .then(confirmationResult => {
//         this.confirmationResult = confirmationResult;
//         console.log('OTP sent successfully');
//       })
//       .catch(err => {
//         console.error('Firebase OTP error:', err);
//         throw err;
//       });
//   }

//   verifyOTP(code: string) {
//     return this.confirmationResult.confirm(code);
//   }
// }




import { Injectable } from '@angular/core';
import { ApiService } from '../services/api/api.service';
import { EncryptionService } from '../services/encryption.service';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private api: ApiService,
    private encryptionService: EncryptionService
  ) {}

  // sendOtp(fullPhone: string): Promise<any> {
  //   return this.api.post('/api/auth/send-otp', { phone_number: fullPhone }).toPromise();
  // }

    // Send OTP using phone_number + email
  sendOtp(payload: { phone_number: string; email: string }): Promise<any> {
  return this.api.post('/api/auth/send-otp', payload).toPromise();
}

  async verifyOtp(fullPhone: string, otp: string): Promise<{ success: boolean; userId?: number; message?: string }> {
    const payload = { phone_number: fullPhone, otp_code: otp };

    try {
      const res: any = await this.api.post('/api/auth/verify-otp', payload).toPromise();
      if (res.status) {
        localStorage.setItem("phone_number", fullPhone);
        localStorage.setItem("userId", res.user_id.toString());
        localStorage.setItem("loggedIn", "true");

        // Save values using Capacitor Preferences
        await Preferences.set({ key: "phone_number", value: fullPhone });
        await Preferences.set({ key: "userId", value: res.user_id.toString() });
        await Preferences.set({ key: "loggedIn", value: "true" });

//         const [phoneRes, userIdRes, loggedInRes] = await Promise.all([
//   Preferences.get({ key: 'CapacitorStorage.phone_number' }),
//   Preferences.get({ key: 'CapacitorStorage.userId' }),
//   Preferences.get({ key: 'CapacitorStorage.loggedIn' })
// ]);

// await Promise.all([
//   phoneRes.value && Preferences.set({ key: 'phone_number', value: phoneRes.value }),
//   userIdRes.value && Preferences.set({ key: 'userId', value: userIdRes.value }),
//   loggedInRes.value && Preferences.set({ key: 'loggedIn', value: loggedInRes.value }),

//   Preferences.remove({ key: 'CapacitorStorage.phone_number' }),
//   Preferences.remove({ key: 'CapacitorStorage.userId' }),
//   Preferences.remove({ key: 'CapacitorStorage.loggedIn' })
// ]);


         
        const publicKeyHex = await this.encryptionService.generateAndStoreECCKeys();

        await this.api.post('/api/users/update-public-key', { 
          user_id: res.user_id,
          public_key: publicKeyHex
        }).toPromise();

        return { success: true, userId: res.user_id };
      } else {
        return { success: false, message: res.message || 'Invalid OTP' };
      }
    } catch (error) {
      console.error('OTP verification failed:', error);
      return { success: false, message: 'OTP verification failed' };
    }
  }

  // isLoggedIn(): boolean {
  //   return !!localStorage.getItem('loggedIn');
  // }

  // logout(): void {
  //   localStorage.clear();
  // }


    async isLoggedIn(): Promise<boolean> {
    const { value } = await Preferences.get({ key: 'loggedIn' });
    return value === 'true';
  }

  async logout(): Promise<void> {
    await Preferences.clear();
  }
}



// import { Injectable } from '@angular/core';
// import { ApiService } from '../services/api/api.service';
// import { EncryptionService } from '../services/encryption.service';
// import { Preferences } from '@capacitor/preferences';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {

//   constructor(
//     private api: ApiService,
//     private encryptionService: EncryptionService
//   ) {}

//   sendOtp(fullPhone: string): Promise<any> {
//     return this.api.post('/api/auth/send-otp', { phone_number: fullPhone }).toPromise();
//   }

//   async verifyOtp(fullPhone: string, otp: string): Promise<{ success: boolean; userId?: number; message?: string }> {
//     const payload = { phone_number: fullPhone, otp_code: otp };

//     try {
//       const res: any = await this.api.post('/api/auth/verify-otp', payload).toPromise();
//       if (res.status) {
//         // Save values using Capacitor Preferences
//         await Preferences.set({ key: "phone_number", value: fullPhone });
//         await Preferences.set({ key: "userId", value: res.user_id.toString() });
//         await Preferences.set({ key: "loggedIn", value: "true" });

//         const publicKeyHex = await this.encryptionService.generateAndStoreECCKeys();

//         await this.api.post('/api/users/update-public-key', {
//           user_id: res.user_id,
//           public_key: publicKeyHex
//         }).toPromise();

//         return { success: true, userId: res.user_id };
//       } else {
//         return { success: false, message: res.message || 'Invalid OTP' };
//       }
//     } catch (error) {
//       console.error('OTP verification failed:', error);
//       return { success: false, message: 'OTP verification failed' };
//     }
//   }

//   async isLoggedIn(): Promise<boolean> {
//     const { value } = await Preferences.get({ key: 'loggedIn' });
//     return value === 'true';
//   }

//   async logout(): Promise<void> {
//     await Preferences.clear();
//   }
// }
