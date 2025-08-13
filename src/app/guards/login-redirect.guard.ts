import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginRedirectGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

//   canActivate(): boolean {
//     if (this.authService.isLoggedIn()) {
//       this.router.navigate(['/home-screen']); 
//       return false;
//     }
//     return true;
//   }

canActivate(): boolean {
  // const isLoggedIn = !!localStorage.getItem('userId');
  if (this.authService.isAuthenticated) {
    this.router.navigate(['/home-screen']);
    return false;
  }
  return true;
}

}
