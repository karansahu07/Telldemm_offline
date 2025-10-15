// import { Injectable } from '@angular/core';
// import { Storage } from '@capacitor/storage';
// import { Filesystem, Directory } from '@capacitor/filesystem';
// // import { App } from '@capacitor/app';

// // For SQLite (community plugin)
// import { CapacitorSQLite } from '@capacitor-community/sqlite';

// @Injectable({
//   providedIn: 'root'
// })
// export class Resetapp {

//   constructor() {}

//   /** Clear LocalStorage */
//   private clearLocalStorage() {
//     try {
//       localStorage.clear();
//     } catch (err) {
//       console.warn('LocalStorage clear failed', err);
//     }
//   }

//   /** Clear Capacitor Storage */
//   private async clearCapacitorStorage() {
//     try {
//       await Storage.clear();
//     } catch (err) {
//       console.warn('Capacitor Storage clear failed', err);
//     }
//   }

//   /** Clear SQLite databases (using community plugin) */
//   private async clearSQLite() {
//     // try {
//     //   const isAvailable = (await CapacitorSQLite.isAvailable()).result;
//     //   if (isAvailable) {
//     //     const { databases } = await CapacitorSQLite.getDatabases();
//     //     for (const db of databases) {
//     //       await CapacitorSQLite.deleteDatabase({ database: db.name });
//     //     }
//     //   }
//     // } catch (err) {
//     //   console.warn('SQLite clear failed', err);
//     // }
//   }

//   /** Clear app documents directory (local files) */
//   private async clearFileSystem() {
//     try {
//       await Filesystem.rmdir({
//         path: 'ChatMedia',
//         directory: Directory.Documents,
//         recursive: true
//       });
//     } catch (err) {
//       console.warn('FileSystem clear failed', err);
//     }
//   }

//   /** Reload app */
//   private reloadApp() {
//     // reload webview
//     window.location.href = '/';
//     // or you can use App.exitApp() and relaunch manually on native
//   }

//   /** Reset everything */
//   async resetApp() {
//     this.clearLocalStorage();
//     await this.clearCapacitorStorage();
//     await this.clearSQLite();
//     await this.clearFileSystem();

//     this.reloadApp();
//   }
// }

// import { Injectable } from '@angular/core';
// import { Preferences } from '@capacitor/preferences';
// import { Filesystem, Directory } from '@capacitor/filesystem';
// // import { App } from '@capacitor/app';
// // import { CapacitorSQLite } from '@capacitor-community/sqlite';

// @Injectable({
//   providedIn: 'root'
// })
// export class Resetapp {

//   constructor() {}

//   /** Clear LocalStorage */
//   private clearLocalStorage() {
//     try {
//       localStorage.clear();
//     } catch (err) {
//       console.warn('LocalStorage clear failed', err);
//     }
//   }

//   /** Clear Capacitor Preferences (instead of old Storage API) */
//   private async clearCapacitorStorage() {
//     try {
//       await Preferences.clear();
//     } catch (err) {
//       console.warn('Preferences clear failed', err);
//     }
//   }

//   /** Clear SQLite (optional, needs plugin setup) */
//   private async clearSQLite() {
//     // Uncomment if you are using SQLite
//     // try {
//     //   const isAvailable = (await CapacitorSQLite.isAvailable()).result;
//     //   if (isAvailable) {
//     //     const { databases } = await CapacitorSQLite.getDatabases();
//     //     for (const db of databases) {
//     //       await CapacitorSQLite.deleteDatabase({ database: db.name });
//     //     }
//     //   }
//     // } catch (err) {
//     //   console.warn('SQLite clear failed', err);
//     // }
//   }

//   /** Clear app files (Documents sub-folder only) */
//   private async clearFileSystem() {
//     try {
//       // ⚠️ Do not delete root dir, instead remove your app-specific folder
//       await Filesystem.rmdir({
//         path: 'ChatMedia', // 👈 create/remove a subfolder
//         directory: Directory.Documents,
//         recursive: true
//       });
//     } catch (err) {
//       console.warn('FileSystem clear failed', err);
//     }
//   }

//   /** Reload app */
//   private reloadApp() {
//     if (typeof window !== 'undefined') {
//       window.location.href = '/';
//     }
//     // Or on native you can use:
//     // App.exitApp(); (then relaunch manually)
//   }

//   /** Reset everything */
//   async resetApp() {
//     this.clearLocalStorage();
//     await this.clearCapacitorStorage();
//     await this.clearSQLite();
//     await this.clearFileSystem();

//     this.reloadApp();
//   }
// }

import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { AuthService } from '../auth/auth.service';
import { FcmService } from './fcm-service';
import { SqliteService } from './sqlite.service';
// import { App } from '@capacitor/app';
// import { CapacitorSQLite } from '@capacitor-community/sqlite';

@Injectable({
  providedIn: 'root',
})
export class Resetapp {
  constructor(
    private authService: AuthService,
    private fcmService: FcmService,
    private sqliteService: SqliteService
  ) {}

  /** Clear LocalStorage */
  private clearLocalStorage() {
    try {
      localStorage.clear();
    } catch (err) {
      console.warn('LocalStorage clear failed', err);
    }
  }

  /** Clear Capacitor Preferences */
  private async clearCapacitorStorage() {
    try {
      await Preferences.clear();
    } catch (err) {
      console.warn('Preferences clear failed', err);
    }
  }

  /** Clear Secure Storage */
  private async clearSecureStorage() {
    try {
      await SecureStoragePlugin.clear();
    } catch (err) {
      console.warn('SecureStorage clear failed', err);
    }
  }

  /** Clear SQLite (optional) */
  private async clearSQLite() {
    // Same as before...
  }

  /** Clear app files (sub-folder only) */
  private async clearFileSystem() {
    try {
      await Filesystem.rmdir({
        path: 'appdata',
        directory: Directory.Documents,
        recursive: true,
      });
    } catch (err) {
      console.warn('FileSystem clear failed', err);
    }
  }

  /** Reload app */
  private reloadApp() {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }

  /** Reset everything */
  async resetApp() {
    const userId = await this.authService.authData?.userId;

    if (userId) {
      try {
        await this.fcmService.deleteFcmToken(userId);
      } catch (err) {
        console.warn('Failed to delete FCM token', err);
      }
      try {
        await this.fcmService.setUserOffline(userId);
      } catch (err) {
        console.warn('Failed to set user offline', err);
      }
    } else {
      //console.log('No userId found before reset; skipping FCM token delete');
    }

    this.clearLocalStorage();
    await this.clearCapacitorStorage();
    await this.clearSecureStorage();
    await this.clearSQLite();
    await this.clearFileSystem();
    await this.sqliteService.resetDB();

    this.reloadApp();
  }
}
