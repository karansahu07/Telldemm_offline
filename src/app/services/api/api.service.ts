import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

 
  post<T>(url: string, payload: any): Observable<T> {
  return this.http.post<T>(`${this.baseUrl}${url}`, payload);
}

  // /**
  //  * Send OTP to user
  //  * @param phone_number 
  //  */
  // sendOtp(phone_number: string): Observable<any> {
  //   return this.post('/send-otp', { phone_number });
  // }


  /**
   * Send OTP to user
   * @param phone_number 
   * @param email 
   */
  sendOtp(phone_number: string, email: string): Observable<any> {
    return this.post('/api/auth/send-otp', { phone_number, email });
  }

  /**
   * Verify OTP
   * @param phone_number 
   * @param otp_code 
   */
  verifyOtp(phone_number: string, otp_code: string): Observable<any> {
    return this.post('/verify-otp', { phone_number, otp_code });
  }
  

  get<T>(url: string, params?: any): Observable<T> {
  return this.http.get<T>(`${this.baseUrl}${url}`, { params });
}

/**
   * Get public key for a user using phone_number (POST)
   * @param phone_number 
   */
//   getUserProfile(phone_number: string): Observable<{ publicKeyHex: string }> {
//    // console.log(phone_number);
//   return this.post<{ publicKeyHex: string }>('/api/users/profile', { phone_number });
// }

getUserProfile(phone_number: string): Observable<{
  user_id: any
}> {
    return this.http.post<{ user_id: string }>(`${this.baseUrl}/api/users/profile_by_mb`, { phone_number });

  }
getUserProfilebyId(user_id: string): Observable<{ publicKeyHex: string }> {
    return this.http.post<{ publicKeyHex: string }>(`${this.baseUrl}/api/users/profile_by_userid`, { user_id });

  }

getAllUsers(): Observable<any[]> {
  return this.get<any[]>('/api/users');
}

  

}
