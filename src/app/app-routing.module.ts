// import { NgModule } from '@angular/core';
// import { PreloadAllModules, RouterModule, Routes } from '@angular/router';


// const routes: Routes = [
//   {
//     path: 'home',
//     loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
//   },
//   {
//     path: '',
//     redirectTo: 'home',
//     pathMatch: 'full'
//   },
//   {
//     path: 'welcome-screen',
//     loadChildren: () => import('./welcome-screen/welcome-screen.module').then( m => m.WelcomeScreenPageModule)
//   },
//   {
//     path: 'login-screen',
//     loadChildren: () => import('./auth/login/login-screen/login-screen.module').then( m => m.LoginScreenPageModule)
//   },
//   {
//     path: 'home-screen',
//     loadChildren: () => import('./home-screen/home-screen.module').then( m => m.HomeScreenPageModule)
//   },
//   {
//     path: 'chatting-screen',
//     loadChildren: () => import('./user-screens/chatting-screen/chatting-screen.module').then( m => m.ChattingScreenPageModule)
//   },
//   {
//     path: 'calling-screen',
//     loadChildren: () => import('./user-screens/voice-call/calling-screen/calling-screen.module').then( m => m.CallingScreenPageModule)
//   },
//   {
//     path: 'calls-screen',
//     loadChildren: () => import('./user-screens/voice-call/calls-screen/calls-screen.module').then(m => m.CallsScreenPageModule)
//   },
//   {
//     path: 'status-screen',
//     loadChildren: () => import('./status-screens/status-screen/status-screen.module').then( m => m.StatusScreenPageModule)
//   },
//   {
//     path: 'setting-screen',
//     loadChildren: () => import('./setting-screen/setting-screen.module').then( m => m.SettingScreenPageModule)
//   },
//   {
//     path: 'see-status-screen',
//     loadChildren: () => import('./status-screens/see-status-screen/see-status-screen.module').then( m => m.SeeStatusScreenPageModule)
//   },
//   {
//   path: 'profile-setup',
//   loadComponent: () => import('./components/profile-setup/profile-setup.page').then(m => m.ProfileSetupPage)
// }

// ];

// @NgModule({
//   imports: [
//     RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
//   ],
//   exports: [RouterModule]
// })
// export class AppRoutingModule { } 



import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginRedirectGuard } from './guards/login-redirect.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    // canActivate: [AuthGuard],
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'welcome-screen',
    canActivate: [LoginRedirectGuard],
    loadChildren: () => import('./welcome-screen/welcome-screen.module').then(m => m.WelcomeScreenPageModule)
  },
  {
    path: 'login-screen',
    canActivate: [LoginRedirectGuard],
    loadChildren: () => import('./auth/login/login-screen/login-screen.module').then(m => m.LoginScreenPageModule)
  },
  {
    path: 'home-screen',
    canActivate: [AuthGuard],
    loadChildren: () => import('./home-screen/home-screen.module').then(m => m.HomeScreenPageModule)
  },
  {
    path: 'chatting-screen',
    canActivate: [AuthGuard],
    loadChildren: () => import('./user-screens/chatting-screen/chatting-screen.module').then(m => m.ChattingScreenPageModule)
  },
  {
    path: 'calling-screen',
    // canActivate: [AuthGuard],
    loadChildren: () => import('./user-screens/voice-call/calling-screen/calling-screen.module').then(m => m.CallingScreenPageModule)
  },
  {
    path: 'calls-screen',
    canActivate: [AuthGuard],
    loadChildren: () => import('./user-screens/voice-call/calls-screen/calls-screen.module').then(m => m.CallsScreenPageModule)
  },
  {
    path: 'status-screen',
    canActivate: [AuthGuard],
    loadChildren: () => import('./status-screens/status-screen/status-screen.module').then(m => m.StatusScreenPageModule)
  },
  {
    path: 'setting-screen',
    canActivate: [AuthGuard],
    loadChildren: () => import('./setting-screen/setting-screen.module').then(m => m.SettingScreenPageModule)
  },
  {
    path: 'see-status-screen',
    canActivate: [AuthGuard],
    loadChildren: () => import('./status-screens/see-status-screen/see-status-screen.module').then(m => m.SeeStatusScreenPageModule)
  },
  {
    path: 'profile-setup',
    canActivate: [AuthGuard],
    loadComponent: () => import('./components/profile-setup/profile-setup.page').then(m => m.ProfileSetupPage)
  },
  {
    path: 'contact-screen',
    canActivate: [AuthGuard],
    loadComponent: () => import('./contact-screen/contacts.page').then(m => m.ContactsPage)
  },
  {
    path: 'community-screen',
    canActivate: [AuthGuard],  
    loadComponent: () => import('./community-screen/community.page').then(m => m.CommunityPage)
  },
  {
    path: 'profile-screen',
    canActivate: [AuthGuard],
    loadComponent: () => import('./profile-screen/userabout.page').then(m => m.UseraboutPage)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
