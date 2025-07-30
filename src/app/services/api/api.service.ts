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

  /**
 * Create a new group
 * @param group_name - Name of the group
 * @param created_by - User ID of the creator
 * @param firebase_group_id - Unique Firebase group ID
 */
createGroup(group_name: string, created_by: number, firebase_group_id: string): Observable<any> {
  const payload = {
    group_name,
    created_by,
    firebase_group_id
  };
  return this.post('/api/groups/create', payload);
}

// /**
//  * Add a member to a group
//  * @param group_id - Numeric group ID (from your backend, not Firebase ID)
//  * @param user_id - User's ID to add
//  * @param role_id - Role of the user in the group (e.g., 2 for member)
//  */
// addGroupMember(group_id: number, user_id: number, role_id: number): Observable<any> {
//   const payload = {
//     group_id,
//     user_id,
//     role_id
//   };
//   return this.post('/api/groups/members/add', payload);
// }


// /**
//  * Get groups for a specific user with pagination
//  * @param user_id - ID of the user
//  * @param page - Page number
//  * @param limit - Number of groups per page
//  */
// getUserGroups(user_id: number, page: number = 1, limit: number = 5): Observable<{
//   message: string;
//   groups: any[];
//   pagination: {
//     totalCount: number;
//     totalPages: number;
//     currentPage: number;
//   };
// }> {
//   const params = {
//     user_id: user_id.toString(),
//     page: page.toString(),
//     limit: limit.toString()
//   };

//   return this.get('/api/groups', params);
// }


/**
 * Get groups for a specific user with pagination
 */
getUserGroups(user_id: number, page: number = 1, limit: number = 10): Observable<{
  message: string;
  groups: {
    group_id: number;
    group_name: string;
    firebase_group_id: string;
    created_at: string;
    members: any[];
  }[];
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
  };
}> {
  const params = {
    user_id: user_id.toString(),
    page: page.toString(),
    limit: limit.toString()
  };

  return this.get('/api/groups', params);
}

/**
 * Add a member to a group
 */
addGroupMember(group_id: number, user_id: number, role_id: number): Observable<any> {
  return this.post('/api/groups/members/add', {
    group_id,
    user_id,
    role_id
  });
}

}
