import { Injectable } from '@angular/core';
import { ApiService } from '../services/api/api.service';
import { EncryptionService } from '../services/encryption.service';
import { SecureStorageService } from '../services/secure-storage/secure-storage.service';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private api: ApiService,
    private encryptionService: EncryptionService,
    private secureStorage: SecureStorageService
  ) {}

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
        // Store login info securely
        await this.secureStorage.setItem('phone_number', fullPhone);
        await this.secureStorage.setItem('userId', res.user_id.toString());
        await this.secureStorage.setItem('loggedIn', 'true');

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

  async isLoggedIn(): Promise<boolean> {
    const loggedIn = await this.secureStorage.getItem('loggedIn');
    return loggedIn === 'true';
  }

  async logout(): Promise<void> {
    await Preferences.clear();
  }
}
