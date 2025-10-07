import { Injectable } from '@angular/core';
import { Contacts, GetContactsOptions } from '@capacitor-community/contacts';
import { ApiService } from './api/api.service';
import { IDeviceContact, IUser } from 'src/types';
 
@Injectable({
  providedIn: 'root',
})
export class ContactSyncService {
  contacts: any;
  constructor(private apiService: ApiService) {}

  async getDevicePhoneNumbers(): Promise<IDeviceContact[]> {
  try {
    const permission = await Contacts.requestPermissions();

    if (permission.contacts === 'granted') {
      const options: GetContactsOptions = {
        projection: {
          name: true,
          phones: true,
        },
      };

      const result = await Contacts.getContacts(options);
      const rawContacts = result.contacts || [];

      const formattedContacts: IDeviceContact[] = [];
      const uniqueNumbers = new Set<string>();

      rawContacts.forEach((contact) => {
        const fullName = [
          contact.name?.given || '',
          contact.name?.middle || '',
          contact.name?.family || '',
        ]
          .join(' ')
          .trim() || 'Unknown';

        (contact.phones || []).forEach((p: any) => {
          const number = (p.number || '').trim();
          const digits = number.replace(/\D/g, '');

          // ✅ Only keep valid 10+ digit numbers and avoid duplicates
          if (digits.length >= 10 && !uniqueNumbers.has(digits)) {
            uniqueNumbers.add(digits);
            formattedContacts.push({
              name: fullName,
              phoneNumber: number,
            });
          }
        });
      });

      console.log('Flattened Contacts:', formattedContacts);
      return formattedContacts; // ✅ return flattened array
    } else {
      console.warn('Permission not granted for contacts');
      return [];
    }
  } catch (error) {
    console.error('Error loading contacts', error);
    return [];
  }
}

async getMatchedUsers(): Promise<IUser[]> {
  const formattedContacts = await this.getDevicePhoneNumbers();

  const deviceNumbersMap = new Map<string, string>(); // phone => deviceName
  const nameNumberMap = formattedContacts.reduce((map, contact)=>{
    map.set(contact.phoneNumber.slice(-10), contact.name)
    return map; 
  },new Map<string, string>())
  // formattedContacts.forEach(contact => {
  //   (contact.phoneNumbers || []).forEach((number: string) => {
  //     let cleaned = number.replace(/\D/g, '');
  //     if (cleaned.length >= 10) {
  //       const last10 = cleaned.slice(-10);
  //       const formatted = '+91' + last10;
  //       deviceNumbersMap.set(formatted, contact.name); // save device name
  //     }
  //   });
  // });

  return new Promise((resolve, reject) => {
    this.apiService.getAllUsers().subscribe({
      next: (users) => {
        const matched = (users || []).map((user : IUser) => {
          const cleanedUserNumber = user.phone_number.replace(/\D/g, '');
          if (cleanedUserNumber.length >= 10) {
            const userLast10 = cleanedUserNumber.slice(-10);
            const formattedUser = '+91' + userLast10;

            if (nameNumberMap.has(userLast10)) {
              return {
                ...user,
                phone_number: formattedUser,
                name: nameNumberMap.get(userLast10) as string, // ✅ override backend name
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