// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { from, Observable } from 'rxjs';
// import { environment } from 'src/environments/environment';

// @Injectable({
//   providedIn: 'root'
// })
// export class ApiService {
//   private baseUrl = environment.apiBaseUrl;

//   constructor(private http: HttpClient) {}

 
//   post<T>(url: string, payload: any): Observable<T> {
//   return this.http.post<T>(`${this.baseUrl}${url}`, payload);
// }

// put(url: string, payload: any): Observable<any> {
//   return this.http.put(`${this.baseUrl}${url}`, payload);
// }

//   get<T>(url: string, params?: any): Observable<T> {
//   return this.http.get<T>(`${this.baseUrl}${url}`, { params });
// }

//   /**
//    * Send OTP to user
//    * @param phone_number 
//    * @param email 
//    */
//   sendOtp(phone_number: string, email: string): Observable<any> {
//     return this.post('/api/auth/send-otp', { phone_number, email });
//   }

//   /**
//    * Verify OTP
//    * @param phone_number 
//    * @param otp_code 
//    */
//   verifyOtp(phone_number: string, otp_code: string): Observable<any> {
//     return this.post('/verify-otp', { phone_number, otp_code });
//   }

// /**
//    * Get public key for a user using phone_number (POST)
//    * @param phone_number 
//    */
// //   getUserProfile(phone_number: string): Observable<{ publicKeyHex: string }> {
// //    // console.log(phone_number);
// //   return this.post<{ publicKeyHex: string }>('/api/users/profile', { phone_number });
// // }

// getUserProfile(phone_number: string): Observable<{
//   user_id: any
// }> {
//     return this.http.post<{ user_id: string }>(`${this.baseUrl}/api/users/profile_by_mb`, { phone_number });

//   }
// getUserProfilebyId(user_id: string): Observable<{ publicKeyHex: string }> {
//     return this.http.post<{ publicKeyHex: string }>(`${this.baseUrl}/api/users/profile_by_userid`, { user_id });

//   }

// getAllUsers(): Observable<any[]> {
//   return this.get<any[]>('/api/users');
// }

// /**
//  * Create a new group
//  * @param group_name - Name of the group
//  * @param created_by - User ID of the creator
//  * @param firebase_group_id - Unique Firebase group ID
//  * @param members - Array of member user IDs
//  */
// createGroup(
//   group_name: string,
//   created_by: number,
//   firebase_group_id: string,
//   members: number[]
// ): Observable<any> {
//   const payload = {
//     group_name,
//     created_by,
//     firebase_group_id,
//     members
//   };
//   return this.post('/api/groups/create', payload);
// }

// /**
//  * Get groups for a specific user with pagination
//  */
// getUserGroups(user_id: number, page: number = 1, limit: number = 10): Observable<{
//   message: string;
//   groups: {
//     group_id: number;
//     group_name: string;
//     firebase_group_id: string;
//     created_at: string;
//     members: any[];
//   }[];
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

// /**
//  * Add a member to a group
//  */
// addGroupMember(group_id: number, user_id: number, role_id: number): Observable<any> {
//   return this.post('/api/groups/members/add', {
//     group_id,
//     user_id,
//     role_id
//   });
// }

// /**
//  * Update member status in group
//  * @param group_id - Backend group ID
//  * @param user_id - User ID to update
//  * @param is_active - Active status (true/false)
//  */
// updateMemberStatus(group_id: number, user_id: number, is_active: boolean): Observable<any> {
//   const payload = {
//     group_id,
//     user_id,
//     is_active
//   };
//   return this.put('/api/groups/members/status', payload);
// }

// }



import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable } from 'rxjs';
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

  put(url: string, payload: any): Observable<any> {
    return this.http.put(`${this.baseUrl}${url}`, payload);
  }

  get<T>(url: string, params?: any): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${url}`, { params });
  }

  // ----------------- 🔐 AUTH APIs -----------------

  sendOtp(phone_number: string, email: string): Observable<any> {
    return this.post('/api/auth/send-otp', { phone_number, email });
  }

  verifyOtp(phone_number: string, otp_code: string): Observable<any> {
    return this.post('/verify-otp', { phone_number, otp_code });
  }

  getUserProfile(phone_number: string): Observable<{ user_id: any }> {
    return this.http.post<{ user_id: string }>(
      `${this.baseUrl}/api/users/profile_by_mb`,
      { phone_number }
    );
  }

  getUserProfilebyId(user_id: string): Observable<{ publicKeyHex: string }> {
    return this.http.post<{ publicKeyHex: string }>(
      `${this.baseUrl}/api/users/profile_by_userid`,
      { user_id }
    );
  }

  getAllUsers(): Observable<any[]> {
    return this.get<any[]>('/api/users');
  }

  // ----------------- 👥 GROUP APIs -----------------

  createGroup(
    group_name: string,
    created_by: number,
    firebase_group_id: string,
    members: number[]
  ): Observable<any> {
    const payload = {
      group_name,
      created_by,
      firebase_group_id,
      members
    };
    return this.post('/api/groups/create', payload);
  }

  getUserGroups(
    user_id: number,
    page: number = 1,
    limit: number = 10
  ): Observable<{
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

  addGroupMember(group_id: number, user_id: number, role_id: number): Observable<any> {
    return this.post('/api/groups/members/add', {
      group_id,
      user_id,
      role_id
    });
  }

  updateMemberStatus(group_id: number, user_id: number, is_active: boolean): Observable<any> {
    const payload = { group_id, user_id, is_active };
    return this.put('/api/groups/members/status', payload);
  }

  // ----------------- 📎 MEDIA APIs -----------------

  /**
   * Get upload URL + media_id for a file
   */
  getUploadUrl(
    sender_id: number,
    media_type: string,
    file_size: number,
    content_type: string,
    metadata: any
  ): Observable<{
    status: boolean;
    media_id: string;
    upload_url: string;
  }> {
    return this.post('/api/media/upload-url', {
      sender_id,
      media_type,
      file_size,
      content_type,
      metadata
    });
  }

  /**
   * Upload file directly to S3 using presigned URL
   * (use raw Blob, not base64)
   */
  uploadToS3(uploadUrl: string, file: Blob): Observable<any> {
    return from(
      fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      })
    );
  }

  /**
   * Get a download URL for a media_id
   */
  getDownloadUrl(media_id: string): Observable<{
    status: boolean;
    downloadUrl: string;
  }> {
    return this.get(`/api/media/download-url/${media_id}`);
  }
}
