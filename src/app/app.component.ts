import { Component } from '@angular/core';
import { register } from 'swiper/element/bundle';

register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor() {}
}


// import { Component } from '@angular/core';
// import { register } from 'swiper/element/bundle';
// import { Router } from '@angular/router';
// import { AuthService } from './auth/auth.service';

// register();

// @Component({
//   selector: 'app-root',
//   templateUrl: 'app.component.html',
//   styleUrls: ['app.component.scss'],
//   standalone: false,
// })
// export class AppComponent {
//   constructor(
//     private router: Router,
//     private authService: AuthService
//   ) {
//     this.checkLoginStatus();
//   }

//   async checkLoginStatus() {
//     const isLoggedIn = await this.authService.isLoggedIn();
//     if (isLoggedIn) {
//       this.router.navigateByUrl('/home-screen');
//     } else {
//       this.router.navigateByUrl('/welcome-screen');
//     }
//   }
// }
