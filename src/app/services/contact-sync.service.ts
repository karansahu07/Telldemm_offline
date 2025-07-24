// import { Injectable } from '@angular/core';
// import { Contacts } from '@ionic-native/contacts/ngx';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root',
// })
// export class ContactSyncService {
//   private apiUrl = 'https://telldemm-backend.onrender.com/api/users';

//   constructor(private contacts: Contacts, private http: HttpClient) {}

//   async getPhoneNumbers(): Promise<string[]> {
//     const deviceContacts = await this.contacts.find(['displayName', 'phoneNumbers'], {
//       multiple: true,
//     });

//     const numbers: string[] = [];

//     deviceContacts.forEach((contact: { phoneNumbers: any[]; }) => {
//       contact.phoneNumbers?.forEach((p) => {
//         let num = p.value.replace(/\D/g, ''); // Remove +, -, spaces etc.
//         if (num.length >= 10) {
//           num = num.slice(-10); // Last 10 digits only
//           numbers.push(num);
//         }
//       });
//     });

//     return numbers;
//   }

//   matchContacts(phoneNumbers: string[]): Observable<any[]> {
//     return this.http.post<any[]>(`${this.apiUrl}/match-contacts`, { contacts: phoneNumbers });
//   }
// }



// import { Injectable } from '@angular/core';
// import { Contacts } from '@ionic-native/contacts/ngx';
// import { ApiService } from './api/api.service';

// @Injectable({
//   providedIn: 'root',
// })
// export class ContactSyncService {
//   constructor(private contacts: Contacts, private apiService: ApiService) {}

//   /**
//    * Get normalized phone numbers from device (last 10 digits only)
//    */
//   async getDevicePhoneNumbers(): Promise<string[]> {
//     const deviceContacts = await this.contacts.find(['displayName', 'phoneNumbers'], {
//       multiple: true,
//     });

//     const numbers: Set<string> = new Set();

//     deviceContacts.forEach((contact: { phoneNumbers: any[]; }) => {
//       contact.phoneNumbers?.forEach((p) => {
//   if (p.value) {
//     let num = p.value.replace(/\D/g, ''); // remove non-digits
//     if (num.length >= 10) {
//       num = num.slice(-10); // take last 10 digits
//       numbers.add(num);
//     }
//   }
// });
//     });

//     return Array.from(numbers);
//   }

//   /**
//    * Local matching: fetch all users from API and match with device numbers
//    */
//   async getMatchedContacts(): Promise<any[]> {
//     const deviceNumbers = await this.getDevicePhoneNumbers();

//     return new Promise((resolve, reject) => {
//       this.apiService.getAllUsers().subscribe({
//         next: (users) => {
//           const matched = users.filter((user: any) => {
//             const userNum = user.phone_number?.replace(/\D/g, '').slice(-10);
//             return deviceNumbers.includes(userNum);
//           });
//           resolve(matched);
//         },
//         error: (err) => reject(err),
//       });
//     });
//   }
// }



// import { Injectable } from '@angular/core';
// import { Contacts } from '@capacitor-community/contacts';
// import { ApiService } from './api/api.service';

// @Injectable({
//   providedIn: 'root',
// })
// export class ContactSyncService {
//   constructor(private apiService: ApiService) {}

//   async getDevicePhoneNumbers(): Promise<string[]> {
//     const permissionResult = await Contacts.requestPermissions();
//     if (permissionResult.contacts !== 'granted') {
//       console.warn('Contacts permission denied');
//       return [];
//     }

//     const { contacts } = await Contacts.getContacts({ projection: 'full' });

//     const numbers: Set<string> = new Set();

//     contacts.forEach((contact: any) => {
//       const phoneList = contact.phoneNumbers || [];

//       phoneList.forEach((p: any) => {
//         if (p.number) {
//           let num = p.number.replace(/\D/g, '');
//           if (num.length >= 10) {
//             num = num.slice(-10);
//             numbers.add(`+91${num}`);
//           }
//         }
//       });
//     });

//     return Array.from(numbers);
//   }

//   async getMatchedUsers(): Promise<any[]> {
//     const deviceNumbers = await this.getDevicePhoneNumbers();

//     return new Promise((resolve, reject) => {
//       this.apiService.getAllUsers().subscribe({
//         next: (users) => {
//           const matched = users.filter((user: any) => {
//             const num = user.phone_number?.replace(/\D/g, '').slice(-10);
//             return deviceNumbers.includes(`+91${num}`);
//           });
//           resolve(matched);
//         },
//         error: (err) => reject(err),
//       });
//     });
//   }
// }



import { Injectable } from '@angular/core';
import { Contacts, GetContactsOptions } from '@capacitor-community/contacts';
import { ApiService } from './api/api.service';
 
@Injectable({
  providedIn: 'root',
})
export class ContactSyncService {
  contacts: any;
  constructor(private apiService: ApiService) {}

async getDevicePhoneNumbers(): Promise<any[]> {
  try {
    const permission = await Contacts.requestPermissions();

    if (permission.contacts === 'granted') {
      const options: GetContactsOptions = {
        projection: {
          name: true,
          phones: true,
          emails: true,
        },
      };

      const result = await Contacts.getContacts(options);
      const rawContacts = result.contacts || [];

      const formattedContacts: any[] = [];

      const uniqueNumbers = new Set<string>();

      rawContacts.forEach((contact) => {
        const fullName = [
          contact.name?.given || '',
          contact.name?.middle || '',
          contact.name?.family || '',
        ]
          .join(' ')
          .trim();

        const numbers = (contact.phones || [])
          .map((p: any) => p.number.trim())
          .filter((num: string) => {
            // Remove duplicates based on cleaned 10-digit number
            const digits = num.replace(/\D/g, '');
            if (!digits || digits.length < 10 || uniqueNumbers.has(digits)) return false;
            uniqueNumbers.add(digits);
            return true;
          });

        const emails = (contact.emails || []).map((e: any) => e.address);

        if (numbers.length > 0) {
          formattedContacts.push({
            name: fullName || 'Unknown',
            phoneNumbers: numbers,
            emails: emails,
          });
        }
      });

      this.contacts = formattedContacts;
      console.log('Formatted Contacts:', this.contacts);
      return formattedContacts; // ✅ RETURN here
    } else {
      console.warn('Permission not granted for contacts');
      return []; // ⛔️ return empty array if denied
    }
  } catch (error) {
    console.error('Error loading contacts', error);
    return []; // ⛔️ also return empty array on failure
  }
}


//   async getMatchedUsers(): Promise<any[]> {
//   const formattedContacts = await this.getDevicePhoneNumbers();

//   const deviceNumbersSet = new Set<string>();

//   formattedContacts.forEach(contact => {
//     (contact.phoneNumbers || []).forEach((number: string) => {
//       let cleaned = number.replace(/\D/g, ''); // remove non-digits

//       // Keep only last 10 digits (Indian number)
//       if (cleaned.length >= 10) {
//         const last10 = cleaned.slice(-10);
//         const finalNumber = '+91' + last10;
//         deviceNumbersSet.add(finalNumber);
//       }
//     });
//   });

//   return new Promise((resolve, reject) => {
//     this.apiService.getAllUsers().subscribe({
//       next: (users) => {
//         // console.log("users all : ", users);
//         const matched = (users || []).filter((user: any) => {
//           if (!user.phone_number) return false;
//           const cleanedUserNumber = user.phone_number.replace(/\D/g, '');
//           if (cleanedUserNumber.length >= 10) {
//             const userLast10 = cleanedUserNumber.slice(-10);
//             const formattedUser = '+91' + userLast10;
//             return deviceNumbersSet.has(formattedUser);
//           }
//           return false;
//         });

//         resolve(matched);
//       },
//       error: (err) => {
//         console.error('Error fetching users:', err);
//         reject(err);
//       },
//     });
//   });
// }

async getMatchedUsers(): Promise<any[]> {
  const formattedContacts = await this.getDevicePhoneNumbers();

  const deviceNumbersMap = new Map<string, string>(); // phone => deviceName
  formattedContacts.forEach(contact => {
    (contact.phoneNumbers || []).forEach((number: string) => {
      let cleaned = number.replace(/\D/g, '');
      if (cleaned.length >= 10) {
        const last10 = cleaned.slice(-10);
        const formatted = '+91' + last10;
        deviceNumbersMap.set(formatted, contact.name); // save device name
      }
    });
  });

  return new Promise((resolve, reject) => {
    this.apiService.getAllUsers().subscribe({
      next: (users) => {
        const matched = (users || []).map((user: any) => {
          const cleanedUserNumber = user.phone_number.replace(/\D/g, '');
          if (cleanedUserNumber.length >= 10) {
            const userLast10 = cleanedUserNumber.slice(-10);
            const formattedUser = '+91' + userLast10;

            if (deviceNumbersMap.has(formattedUser)) {
              return {
                ...user,
                name: deviceNumbersMap.get(formattedUser), // ✅ override backend name
              };
            }
          }
          return null;
        }).filter(user => user !== null);

        resolve(matched);
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        reject(err);
      },
    });
  });
}


}