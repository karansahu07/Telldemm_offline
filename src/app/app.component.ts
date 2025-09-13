// import { Component, OnInit } from '@angular/core';
// import { ToastController } from '@ionic/angular';
// import { NetworkService } from './services/network-connection/network.service';
// import { distinctUntilChanged, filter } from 'rxjs/operators';
// import { register } from 'swiper/element/bundle';
// import { FirebasePushService } from './services/push_notification/firebase-push.service';
// // import {AttachmentService} from './services/attachment-file/attachment.service'
// import { Filesystem, Directory } from '@capacitor/filesystem';
// import {FileSystemService} from './services/file-system.service'
// import { AuthService } from './auth/auth.service';
// import { NavigationEnd, Router } from '@angular/router';
// import { Platform } from '@ionic/angular';
// import { FcmService } from './services/fcm-service';
// import { SqliteService } from './services/sqlite.service';
// import { StatusBar, Style } from '@capacitor/status-bar';
// import { VersionCheck } from './services/version-check';

// register();

// @Component({
//   selector: 'app-root',
//   templateUrl: 'app.component.html',
//   styleUrls: ['app.component.scss'],
//   standalone: false,
// })
// export class AppComponent implements OnInit{
//   constructor(
//     private networkService: NetworkService,
//     private toastController: ToastController,
//     private FirebasePushService:FirebasePushService,
//     // private AttachmentService : AttachmentService,
//     private FileSystemService : FileSystemService,
//      private authService: AuthService,
//     private router: Router,
//     private platform: Platform,
//     private fcmService: FcmService,
//     private sqliteService : SqliteService,
//     private versionService: VersionCheck
//   ) {
//     // this.listenToNetwork();
//     this.initializeApp();
//   }

//   async ngOnInit() {
//     await this.fcmService.initializePushNotifications();
//     // await this.FirebasePushService.initPush();
//     await this.sqliteService.init();
//     await this.FileSystemService.init();
 
//     await this.platform.ready();
   
   
//     await this.authService.hydrateAuth();
//       this.trackRouteChanges(); // 👈 listen to route changes
 
//    // ----------------------------
//     let fromNotification = false;
 
//     const navigation = this.router.getCurrentNavigation();
//     if (navigation?.extras?.state?.['fromNotification']) {
//       fromNotification = true;
//     } else if (localStorage.getItem('fromNotification') === 'true') {
//       fromNotification = true;
//     }
 
//     console.log("fromNotification (AppComponent):", fromNotification);
 
//     if (this.authService.isAuthenticated) {
//       if (fromNotification) {
//         console.log("✅ Opened via notification, skipping welcome redirect");
//         return; // 🚫 Skip, splash will handle clearing
//       } else {
//         console.log("🟢 Normal launch → go home");
//         this.router.navigateByUrl('/home-screen', { replaceUrl: true });
//       }
//     } else {
//       console.log("🔒 Not authenticated → go welcome");
//       this.router.navigateByUrl('/welcome-screen', { replaceUrl: true });
//     }
//     // ----------------------------
 
   
//     // if (this.authService.isAuthenticated) {
//     //   this.router.navigateByUrl('/home-screen', { replaceUrl: true });
//     // } else {
//     //   this.router.navigateByUrl('/welcome-screen', { replaceUrl: true });
//     // }
 
//     }

//     async initializeApp() {
//       //for status bar code
//     await this.platform.ready();
   
//     if (this.platform.is('capacitor')) {
//       await StatusBar.setBackgroundColor({ color: '#ffffff' });
 
//       await StatusBar.setStyle({ style: Style.Light });
//     }
//   }

//    private trackRouteChanges() {
//     this.router.events
//       .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
//       .subscribe((event: NavigationEnd) => {
//         console.log('➡️ Current route:', event.urlAfterRedirects);

//         if (event.urlAfterRedirects === '/home-screen') {
//           console.log('🔍 Running version check only on home-screen');
//           this.versionService.checkVersion();
//         }
//       });
//   }

// }


// import { Component, OnInit } from '@angular/core';
// import { ToastController, Platform, ModalController, PopoverController, ActionSheetController, AlertController } from '@ionic/angular';
// import { NetworkService } from './services/network-connection/network.service';
// import { FirebasePushService } from './services/push_notification/firebase-push.service';
// import { FileSystemService } from './services/file-system.service';
// import { AuthService } from './auth/auth.service';
// import { NavigationEnd, Router } from '@angular/router';
// import { FcmService } from './services/fcm-service';
// import { SqliteService } from './services/sqlite.service';
// import { StatusBar, Style } from '@capacitor/status-bar';
// import { VersionCheck } from './services/version-check';
// import { register } from 'swiper/element/bundle';
// import { Filesystem, Directory } from '@capacitor/filesystem';
// import { App as CapacitorApp } from '@capacitor/app';
// import { filter } from 'rxjs/operators';

// register();

// @Component({
//   selector: 'app-root',
//   templateUrl: 'app.component.html',
//   styleUrls: ['app.component.scss'],
//   standalone: false,
// })
// export class AppComponent implements OnInit {
//   // Update this list if your home route path differs
//   private homeRoutes = ['/home-screen', '/home'];

//   constructor(
//     private networkService: NetworkService,
//     private toastController: ToastController,
//     private FirebasePushService: FirebasePushService,
//     private FileSystemService: FileSystemService,
//     private authService: AuthService,
//     private router: Router,
//     private platform: Platform,
//     private fcmService: FcmService,
//     private sqliteService: SqliteService,
//     private versionService: VersionCheck,
//     private modalCtrl: ModalController,
//     private popoverCtrl: PopoverController,
//     private actionSheetCtrl: ActionSheetController,
//     private alertCtrl: AlertController
//   ) {
//     this.initializeApp();
//   }

//   async ngOnInit() {
//     await this.fcmService.initializePushNotifications();
//     // await this.FirebasePushService.initPush();
//     await this.sqliteService.init();
//     await this.FileSystemService.init();

//     await this.platform.ready();

//     await this.authService.hydrateAuth();
//     this.trackRouteChanges(); // 👈 listen to route changes

//     // ----------------------------
//     let fromNotification = false;

//     const navigation = this.router.getCurrentNavigation();
//     if (navigation?.extras?.state?.['fromNotification']) {
//       fromNotification = true;
//     } else if (localStorage.getItem('fromNotification') === 'true') {
//       fromNotification = true;
//     }

//     console.log('fromNotification (AppComponent):', fromNotification);

//     if (this.authService.isAuthenticated) {
//       if (fromNotification) {
//         console.log('✅ Opened via notification, skipping welcome redirect');
//         return; // 🚫 Skip, splash will handle clearing
//       } else {
//         console.log('🟢 Normal launch → go home');
//         this.router.navigateByUrl('/home-screen', { replaceUrl: true });
//       }
//     } else {
//       console.log('🔒 Not authenticated → go welcome');
//       this.router.navigateByUrl('/welcome-screen', { replaceUrl: true });
//     }
//     // ----------------------------
//   }

//   async initializeApp() {
//     //for status bar code
//     await this.platform.ready();

//     if (this.platform.is('capacitor')) {
//       await StatusBar.setBackgroundColor({ color: '#ffffff' });
//       await StatusBar.setStyle({ style: Style.Light });
//     }

//     // Back button handling: single press on home route exits app (Android only)
//     this.platform.backButton.subscribeWithPriority(10, async () => {
//       // Only handle on Android — iOS should not exit
//       if (!this.platform.is('android')) {
//         return;
//       }

//       const currentUrl = this.router.url.split('?')[0];

//       // If not on home route: perform normal back navigation
//       if (!this.isHomeRoute(currentUrl)) {
//         if (window.history.length > 1) {
//           window.history.back();
//         } else {
//           // fallback: go to home so a subsequent back would exit if desired
//           this.router.navigate(['/home-screen']);
//         }
//         return;
//       }

//       // If on home route — check for overlays and dismiss those first
//       const topModal = await this.modalCtrl.getTop();
//       if (topModal) {
//         await topModal.dismiss();
//         return;
//       }
//       const topPopover = await this.popoverCtrl.getTop();
//       if (topPopover) {
//         await topPopover.dismiss();
//         return;
//       }
//       const topAction = await this.actionSheetCtrl.getTop();
//       if (topAction) {
//         await topAction.dismiss();
//         return;
//       }
//       const topAlert = await this.alertCtrl.getTop();
//       if (topAlert) {
//         await topAlert.dismiss();
//         return;
//       }

//       // No overlays — exit immediately
//       try {
//         await CapacitorApp.exitApp();
//       } catch (e) {
//         console.error('exitApp failed', e);
//       }
//     });
//   }

//   private trackRouteChanges() {
//     this.router.events
//       .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
//       .subscribe((event: NavigationEnd) => {
//         console.log('➡️ Current route:', event.urlAfterRedirects);

//         if (event.urlAfterRedirects === '/home-screen') {
//           console.log('🔍 Running version check only on home-screen');
//           this.versionService.checkVersion();
//         }
//       });
//   }

//   private isHomeRoute(url: string): boolean {
//     return this.homeRoutes.includes(url);
//   }
// }




import { Component, OnInit } from '@angular/core';
import { ToastController, Platform, ModalController, PopoverController, ActionSheetController, AlertController } from '@ionic/angular';
import { NetworkService } from './services/network-connection/network.service';
import { FirebasePushService } from './services/push_notification/firebase-push.service';
import { FileSystemService } from './services/file-system.service';
import { AuthService } from './auth/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { FcmService } from './services/fcm-service';
import { SqliteService } from './services/sqlite.service';
import { StatusBar, Style } from '@capacitor/status-bar';
import { VersionCheck } from './services/version-check';
import { register } from 'swiper/element/bundle';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { App as CapacitorApp } from '@capacitor/app';
import { filter } from 'rxjs/operators';

import { PresenceService } from './services/presence.service'; // <-- added
import { Subscription } from 'rxjs';

register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  // Update this list if your home route path differs
  private homeRoutes = ['/home-screen', '/home'];

  // store listener handles if you want to remove them later (optional)
  private appStateListener: any = null;
  private beforeUnloadHandler: any = null;
  private presenceSub?: Subscription;

  constructor(
    private networkService: NetworkService,
    private toastController: ToastController,
    private FirebasePushService: FirebasePushService,
    private FileSystemService: FileSystemService,
    private authService: AuthService,
    private router: Router,
    private platform: Platform,
    private fcmService: FcmService,
    private sqliteService: SqliteService,
    private versionService: VersionCheck,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private presence: PresenceService // <-- injected
  ) {
    this.initializeApp();
  }

  async ngOnInit() {
    await this.fcmService.initializePushNotifications();
    // await this.FirebasePushService.initPush();
    await this.sqliteService.init();
    await this.FileSystemService.init();

    await this.platform.ready();

    await this.authService.hydrateAuth();
    this.trackRouteChanges();

    // ----------------------------
    let fromNotification = false;

    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['fromNotification']) {
      fromNotification = true;
    } else if (localStorage.getItem('fromNotification') === 'true') {
      fromNotification = true;
    }

    console.log('fromNotification (AppComponent):', fromNotification);

    if (this.authService.isAuthenticated) {
      if (fromNotification) {
        console.log('✅ Opened via notification, skipping welcome redirect');
        // still initialize presence even if opened via notification
      } else {
        console.log('🟢 Normal launch → go home');
        this.router.navigateByUrl('/home-screen', { replaceUrl: true });
      }

      // ---------- PRESENCE: mark user online and wire lifecycle ----------
      const userId = Number(this.authService.authData?.userId);
      if (userId) {
        // mark online on startup (best-effort)
        this.presence.setOnline(userId).subscribe({
          next: () => console.log('Presence: marked online'),
          error: (e) => console.warn('Presence: markOnline error', e)
        });

        // Capacitor app state changes (resume / pause)
        try {
          this.appStateListener = CapacitorApp.addListener('appStateChange', (state: any) => {
            if (state.isActive) {
              this.presence.setOnline(userId).subscribe();
            } else {
              this.presence.setOffline(userId).subscribe();
            }
          });
        } catch (e) {
          console.warn('Presence: failed to add appStateChange listener', e);
        }

        // beforeunload for web (best-effort)
        this.beforeUnloadHandler = () => {
          try {
            // use sendBeacon for browser unload (non-blocking)
            if (navigator && typeof navigator.sendBeacon === 'function') {
              const url = (this.presence as any).api?.baseUrl
                ? `${(this.presence as any).api.baseUrl}/api/users/markuser_offline`
                : null;
              if (url) {
                navigator.sendBeacon(url, JSON.stringify({ user_id: userId }));
              }
            }
          } catch (e) {
            // ignore
          } finally {
            // fire-and-forget HTTP fallback
            this.presence.setOffline(userId).subscribe();
          }
        };
        window.addEventListener('beforeunload', this.beforeUnloadHandler);
      }
    } else {
      console.log('🔒 Not authenticated → go welcome');
      this.router.navigateByUrl('/welcome-screen', { replaceUrl: true });
    }
    // ----------------------------
  }

  async initializeApp() {
    //for status bar code
    await this.platform.ready();

    if (this.platform.is('capacitor')) {
      await StatusBar.setBackgroundColor({ color: '#ffffff' });
      await StatusBar.setStyle({ style: Style.Light });
    }

    // Back button handling: single press on home route exits app (Android only)
    this.platform.backButton.subscribeWithPriority(10, async () => {
      // Only handle on Android — iOS should not exit
      if (!this.platform.is('android')) {
        return;
      }

      const currentUrl = this.router.url.split('?')[0];

      // If not on home route: perform normal back navigation
      if (!this.isHomeRoute(currentUrl)) {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          // fallback: go to home so a subsequent back would exit if desired
          this.router.navigate(['/home-screen']);
        }
        return;
      }

      // If on home route — check for overlays and dismiss those first
      const topModal = await this.modalCtrl.getTop();
      if (topModal) {
        await topModal.dismiss();
        return;
      }
      const topPopover = await this.popoverCtrl.getTop();
      if (topPopover) {
        await topPopover.dismiss();
        return;
      }
      const topAction = await this.actionSheetCtrl.getTop();
      if (topAction) {
        await topAction.dismiss();
        return;
      }
      const topAlert = await this.alertCtrl.getTop();
      if (topAlert) {
        await topAlert.dismiss();
        return;
      }

      // No overlays — exit immediately
      try {
        await CapacitorApp.exitApp();
      } catch (e) {
        console.error('exitApp failed', e);
      }
    });
  }

  private trackRouteChanges() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        console.log('➡️ Current route:', event.urlAfterRedirects);

        if (event.urlAfterRedirects === '/home-screen') {
          console.log('🔍 Running version check only on home-screen');
          this.versionService.checkVersion();
        }
      });
  }

  private isHomeRoute(url: string): boolean {
    return this.homeRoutes.includes(url);
  }

  // optional cleanup if ever needed
  ngOnDestroy() {
    try {
      if (this.appStateListener && typeof this.appStateListener.remove === 'function') {
        this.appStateListener.remove();
      } else if (this.appStateListener && typeof (this.appStateListener as any).cancel === 'function') {
        (this.appStateListener as any).cancel();
      }
    } catch (e) { /* ignore */ }

    if (this.beforeUnloadHandler) {
      window.removeEventListener('beforeunload', this.beforeUnloadHandler);
    }

    this.presenceSub?.unsubscribe();
  }
}
