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
import { distinctUntilChanged } from 'rxjs/operators';
import { register } from 'swiper/element/bundle';
import { FirebasePushService } from './services/push_notification/firebase-push.service';
// import {AttachmentService} from './services/attachment-file/attachment.service'
import { Filesystem, Directory } from '@capacitor/filesystem';
import {FileSystemService} from './services/file-system.service'
import { AuthService } from './auth/auth.service';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { FcmService } from './services/fcm-service';
import { SqliteService } from './services/sqlite.service';
import { StatusBar, Style } from '@capacitor/status-bar';

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
    private sqliteService : SqliteService
  ) {
    // this.listenToNetwork();
    this.initializeApp();
  }
  async ngOnInit() {
    await this.fcmService.initializePushNotifications();
    // await this.FirebasePushService.initPush();
    await this.sqliteService.init();
    await this.FileSystemService.init();

    await this.platform.ready();
    
    
    await this.authService.hydrateAuth();

    
    if (this.authService.isAuthenticated) {
      this.router.navigateByUrl('/home-screen', { replaceUrl: true });
    } else {
      this.router.navigateByUrl('/welcome-screen', { replaceUrl: true });
    }

    }

    async initializeApp() {
    await this.platform.ready();
   
    if (this.platform.is('capacitor')) {
      await StatusBar.setBackgroundColor({ color: '#ffffff' });
 
      // await StatusBar.setStyle({ style: Style.Dark }); // For light text
      // await StatusBar.setStyle({ style: Style.Custom, color: '#333333' });
 
      await StatusBar.setStyle({ style: Style.Light });
 
      // / Set the status bar text color based on the platform
      // if (this.platform.is('ios')) {
      //   // On iOS, set the style to light content (dark text)
      //   await StatusBar.setStyle({ style: Style.Dark });
      // } else {
      //   // On Android, the text color will automatically adjust based on the background color
      // }
    }
  }

}
