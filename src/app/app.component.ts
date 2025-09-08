// import { Component } from '@angular/core';
// import { register } from 'swiper/element/bundle';

// register();

// @Component({
//   selector: 'app-root',
//   templateUrl: 'app.component.html',
//   styleUrls: ['app.component.scss'],
//   standalone: false,
// })
// export class AppComponent {
//   constructor() {}
// }


import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { NetworkService } from './services/network-connection/network.service';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { register } from 'swiper/element/bundle';
import { FirebasePushService } from './services/push_notification/firebase-push.service';
// import {AttachmentService} from './services/attachment-file/attachment.service'
import { Filesystem, Directory } from '@capacitor/filesystem';
import {FileSystemService} from './services/file-system.service'
import { AuthService } from './auth/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { FcmService } from './services/fcm-service';
import { SqliteService } from './services/sqlite.service';
import { StatusBar, Style } from '@capacitor/status-bar';
import { VersionCheck } from './services/version-check';

register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit{
  constructor(
    private networkService: NetworkService,
    private toastController: ToastController,
    private FirebasePushService:FirebasePushService,
    // private AttachmentService : AttachmentService,
    private FileSystemService : FileSystemService,
     private authService: AuthService,
    private router: Router,
    private platform: Platform,
    private fcmService: FcmService,
    private sqliteService : SqliteService,
    private versionService: VersionCheck // 👈 inject here
  ) {
    // this.listenToNetwork();
    this.initializeApp();
  }
  // async ngOnInit() {
  //   await this.fcmService.initializePushNotifications();
  //   // await this.FirebasePushService.initPush();
  //   await this.sqliteService.init();
  //   await this.FileSystemService.init();

  //   await this.platform.ready();
    
    
  //   await this.authService.hydrateAuth();

    
  //   if (this.authService.isAuthenticated) {
  //     this.router.navigateByUrl('/home-screen', { replaceUrl: true });
  //   } else {
  //     this.router.navigateByUrl('/welcome-screen', { replaceUrl: true });
  //   }

  //   }

  async ngOnInit() {
    await this.fcmService.initializePushNotifications();
    // await this.FirebasePushService.initPush();
    await this.sqliteService.init();
    await this.FileSystemService.init();
 
    await this.platform.ready();
   
   
    await this.authService.hydrateAuth();
      this.trackRouteChanges(); // 👈 listen to route changes
 
   // ----------------------------
    let fromNotification = false;
 
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['fromNotification']) {
      fromNotification = true;
    } else if (localStorage.getItem('fromNotification') === 'true') {
      fromNotification = true;
    }
 
    console.log("fromNotification (AppComponent):", fromNotification);
 
    if (this.authService.isAuthenticated) {
      if (fromNotification) {
        console.log("✅ Opened via notification, skipping welcome redirect");
        return; // 🚫 Skip, splash will handle clearing
      } else {
        console.log("🟢 Normal launch → go home");
        this.router.navigateByUrl('/home-screen', { replaceUrl: true });
      }
    } else {
      console.log("🔒 Not authenticated → go welcome");
      this.router.navigateByUrl('/welcome-screen', { replaceUrl: true });
    }
    // ----------------------------
 
   
    // if (this.authService.isAuthenticated) {
    //   this.router.navigateByUrl('/home-screen', { replaceUrl: true });
    // } else {
    //   this.router.navigateByUrl('/welcome-screen', { replaceUrl: true });
    // }
 
    }

    async initializeApp() {
      //for status bar code
    await this.platform.ready();
   
    if (this.platform.is('capacitor')) {
      await StatusBar.setBackgroundColor({ color: '#ffffff' });
 
      await StatusBar.setStyle({ style: Style.Light });
    }
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

}
