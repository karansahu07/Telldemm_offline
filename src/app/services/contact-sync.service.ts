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