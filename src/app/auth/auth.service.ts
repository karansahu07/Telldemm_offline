// import { Injectable } from '@angular/core';
// import { ApiService } from '../services/api/api.service';
// import { EncryptionService } from '../services/encryption.service';
// import { SecureStorageService } from '../services/secure-storage/secure-storage.service';
// import { Preferences } from '@capacitor/preferences';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {

//   constructor(
//     private api: ApiService,
//     private encryptionService: EncryptionService,
//     private secureStorage: SecureStorageService
//   ) {}

//   sendOtp(payload: { phone_number: string; email: string }): Promise<any> {
//     return this.api.post('/api/auth/send-otp', payload).toPromise();
//   }

//   async verifyOtp(fullPhone: string, otp: string): Promise<{ success: boolean; userId?: number; message?: string }> {
//     const payload = { phone_number: fullPhone, otp_code: otp };

//     try {
//       const res: any = await this.api.post('/api/auth/verify-otp', payload).toPromise();
//       if (res.status) {
        
//         localStorage.setItem("phone_number", fullPhone);
//         localStorage.setItem("userId", res.user_id.toString());
//         localStorage.setItem("loggedIn", "true");
//         // Store login info securely
//         await this.secureStorage.setItem('phone_number', fullPhone);
//         await this.secureStorage.setItem('userId', res.user_id.toString());
//         await this.secureStorage.setItem('loggedIn', 'true');

//         // Generate and upload public key
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
//     const loggedIn = await this.secureStorage.getItem('loggedIn');
//     return loggedIn === 'true';
//   }

//   async logout(): Promise<void> {
//     await Preferences.clear();
//   }
// }


// import { Injectable } from '@angular/core';
// import { ApiService } from '../services/api/api.service';
// import { EncryptionService } from '../services/encryption.service';
// import { SecureStorageService } from '../services/secure-storage/secure-storage.service';
// import { Preferences } from '@capacitor/preferences';

// interface AuthData {
//   loggedIn: boolean;
//   phone_number: string;
//   userId: string;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   private _isAuthenticated = false;
//   private _authData: AuthData | null = null;

//   constructor(
//     private api: ApiService,
//     private encryptionService: EncryptionService,
//     private secureStorage: SecureStorageService
//   ) {}

//   /** Getter for components to check authentication state */
//   get isAuthenticated(): boolean {
//     return this._isAuthenticated;
//   }

//   /** Getter for auth data if needed */
//   get authData(): AuthData | null {
//     return this._authData;
//   }

//   /** Send OTP */
//   // sendOtp(payload: { phone_number: string; email: string }): Promise<any> {
//   //   return this.api.post('/api/auth/send-otp', payload).toPromise();
//   // }

//   /** Send OTP */
// sendOtp(payload: { phone_number: string; country_code: string }): Promise<any> {
//   return this.api.post('/api/auth/send-otp_mb', payload).toPromise();
// }
// sendOtpDev(payload: { phone_number: string; country_code: string }): Promise<any> {
//   return this.api.post('/api/auth/send-otp_mb_dev', payload).toPromise();
// }

//   /** Verify OTP & store in secure storage */
//   // async verifyOtp(fullPhone: string, otp: string): Promise<{ success: boolean; userId?: number; message?: string }> {
//   //   try {
//   //     const res: any = await this.api.post('/api/auth/verify-otp', { phone_number: fullPhone, otp_code: otp }).toPromise();

//   //     if (res.status) {
//   //       const authData: AuthData = {
//   //         loggedIn: true,
//   //         phone_number: fullPhone,
//   //         userId: res.user_id.toString()
//   //       };

//   //       // Store whole object in SecureStorage under "AUTH"
//   //       await this.secureStorage.setItem('AUTH', JSON.stringify(authData));

//   //       // In-memory state
//   //       this._authData = authData;
//   //       this._isAuthenticated = true;

//   //       // Generate and upload public key
//   //       const publicKeyHex = await this.encryptionService.generateAndStoreECCKeys();
//   //       await this.api.post('/api/users/update-public-key', {
//   //         user_id: res.user_id,
//   //         public_key: publicKeyHex
//   //       }).toPromise();

//   //       return { success: true, userId: res.user_id };
//   //     } else {
//   //       return { success: false, message: res.message || 'Invalid OTP' };
//   //     }
//   //   } catch (error) {
//   //     console.error('OTP verification failed:', error);
//   //     return { success: false, message: 'OTP verification failed' };
//   //   }
//   // }

//   /** Verify OTP & store in secure storage */
// async verifyOtp(payload: { country_code: string; phone_number: string; otp_code: string }): Promise<{ success: boolean; userId?: number; message?: string }> {
//   try {
//     const res: any = await this.api.post('/api/auth/verify-otp_mb', payload).toPromise();

//     if (res.status) {
//       const senderPhone = `${payload.country_code}${payload.phone_number}`;
//       const authData: AuthData = {
//         loggedIn: true,
//         phone_number: senderPhone,
//         userId: res.user_id.toString()
//       };

//       // Store whole object in SecureStorage under "AUTH"
//       await this.secureStorage.setItem('AUTH', JSON.stringify(authData));

//       // In-memory state
//       this._authData = authData;
//       this._isAuthenticated = true;

//       // Generate and upload public key
//       const publicKeyHex = await this.encryptionService.generateAndStoreECCKeys();
//       await this.api.post('/api/users/update-public-key', {
//         user_id: res.user_id,
//         public_key: publicKeyHex
//       }).toPromise();

//       return { success: true, userId: res.user_id };
//     } else {
//       return { success: false, message: res.message || 'Invalid OTP' };
//     }
//   } catch (error) {
//     console.error('OTP verification failed:', error);
//     return { success: false, message: 'OTP verification failed' };
//   }
// }


//   /** Hydrate auth data on app start */
//   async hydrateAuth(): Promise<void> {
//     try {
//       const stored = await this.secureStorage.getItem('AUTH');
//       if (stored) {
//         const parsed: AuthData = JSON.parse(stored);

//         // Validate data integrity
//         if (parsed.loggedIn && parsed.phone_number && parsed.userId) {
//           this._authData = parsed;
//           this._isAuthenticated = true;
//           return;
//         }
//       }
//       // If invalid or missing → clear
//       await this.clearAuth();
//     } catch (err) {
//       console.warn('Auth hydration failed:', err);
//       await this.clearAuth();
//     }
//   }

//   /** Logout & clear everything */
//   async logout(): Promise<void> {
//     await this.clearAuth();
//   }

//   /** Internal: Clear both secure storage & memory */
//   private async clearAuth(): Promise<void> {
//     await Preferences.clear();
//     this._authData = null;
//     this._isAuthenticated = false;
//   }
// }



import { Injectable } from '@angular/core';
import { ApiService } from '../services/api/api.service';
import { EncryptionService } from '../services/encryption.service';
import { SecureStorageService } from '../services/secure-storage/secure-storage.service';
import { Preferences } from '@capacitor/preferences';

interface AuthData {
  loggedIn: boolean;
  phone_number: string;
  userId: string;
  name?: string; // Optional field for name
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isAuthenticated = false;
  private _authData: AuthData | null = null;

  constructor(
    private api: ApiService,
    private encryptionService: EncryptionService,
    private secureStorage: SecureStorageService
  ) {}

  /** Getter for components to check authentication state */
  get isAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  /** Getter for auth data if needed */
  get authData(): AuthData | null {
    return this._authData;
  }

  /** Send OTP */
  sendOtp(payload: { phone_number: string; country_code: string }): Promise<any> {
    return this.api.post('/api/auth/send-otp_mb', payload).toPromise();
  }
  
  sendOtpDev(payload: { phone_number: string; country_code: string }): Promise<any> {
    return this.api.post('/api/auth/send-otp_mb_dev', payload).toPromise();
  }

  /** Verify OTP & store in secure storage */
  async verifyOtp(payload: { country_code: string; phone_number: string; otp_code: string }): Promise<{ success: boolean; userId?: number; message?: string }> {
    try {
      const res: any = await this.api.post('/api/auth/verify-otp_mb', payload).toPromise();

      if (res.status) {
        const senderPhone = `${payload.country_code}${payload.phone_number}`;
        const authData: AuthData = {
          loggedIn: true,
          phone_number: senderPhone,
          userId: res.user_id.toString(),
          name: res.name || undefined // If API returns name, store it
        };

        // Store whole object in SecureStorage under "AUTH"
        await this.secureStorage.setItem('AUTH', JSON.stringify(authData));

        // In-memory state
        this._authData = authData;
        this._isAuthenticated = true;

        // Generate and upload public key
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

  /** Update user name in auth data */
  async updateUserName(name: string): Promise<void> {
    if (this._authData) {
      const updatedAuthData: AuthData = {
        ...this._authData,
        name: name
      };

      // Update secure storage
      await this.secureStorage.setItem('AUTH', JSON.stringify(updatedAuthData));
      
      // Update in-memory state
      this._authData = updatedAuthData;
    }
  }

  /** Update complete auth data (useful for profile setup) */
  async updateAuthData(updates: Partial<AuthData>): Promise<void> {
    if (this._authData) {
      const updatedAuthData: AuthData = {
        ...this._authData,
        ...updates
      };

      // Update secure storage
      await this.secureStorage.setItem('AUTH', JSON.stringify(updatedAuthData));
      
      // Update in-memory state
      this._authData = updatedAuthData;
    }
  }

  /** Get user name */
  getUserName(): string | undefined {
    return this._authData?.name;
  }

  /** Hydrate auth data on app start */
  async hydrateAuth(): Promise<void> {
    try {
      const stored = await this.secureStorage.getItem('AUTH');
      if (stored) {
        const parsed: AuthData = JSON.parse(stored);

        // Validate data integrity
        if (parsed.loggedIn && parsed.phone_number && parsed.userId) {
          this._authData = parsed;
          this._isAuthenticated = true;
          return;
        }
      }
      // If invalid or missing → clear
      await this.clearAuth();
    } catch (err) {
      console.warn('Auth hydration failed:', err);
      await this.clearAuth();
    }
  }

  /** Logout & clear everything */
  async logout(): Promise<void> {
    await this.clearAuth();
  }

  /** Internal: Clear both secure storage & memory */
  private async clearAuth(): Promise<void> {
    await Preferences.clear();
    this._authData = null;
    this._isAuthenticated = false;
  }
}