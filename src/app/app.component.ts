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
    private FirebasePushService:FirebasePushService
  ) {
    // this.listenToNetwork();
  }
  async ngOnInit() {
    await this.FirebasePushService.initPush();
  }

  // listenToNetwork() {
  //   this.networkService.isOnline$
  //     .pipe(distinctUntilChanged())
  //     .subscribe(async (isOnline: any) => {
  //       const toast = await this.toastController.create({      // this is for verify network available or not
  //         message: isOnline
  //           ? '✅ Back Online'
  //           : '❌ No Internet Connection',
  //         duration: 3000,
  //         color: isOnline ? 'success' : 'danger',
  //         position: 'bottom',
  //       });
  //       toast.present();
  //     });
  // }
}


// import { Component } from '@angular/core';
// import { register } from 'swiper/element/bundle';
// import { FirebasePushService } from './services/push_notification/firebase-push.service';

// register();

// @Component({
//   selector: 'app-root',
//   templateUrl: 'app.component.html',
//   styleUrls: ['app.component.scss'],
//   standalone: false,
// })
// export class AppComponent {
//   constructor(private firebasePush: FirebasePushService) {
//     this.initializeApp();
//   }

//   initializeApp() {
//     this.firebasePush.initFCM();
//   }
// }

