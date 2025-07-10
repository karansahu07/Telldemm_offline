// import { NgModule } from '@angular/core';
// import { BrowserModule } from '@angular/platform-browser';
// import { RouteReuseStrategy } from '@angular/router';

// import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
// import { HttpClientModule } from '@angular/common/http';

// import { AppComponent } from './app.component';
// import { AppRoutingModule } from './app-routing.module';

// @NgModule({
//   declarations: [AppComponent],
//   imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule],
//   providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
//   bootstrap: [AppComponent],
// })
// export class AppModule {}



// import { NgModule } from '@angular/core';
// import { BrowserModule } from '@angular/platform-browser';
// import { RouteReuseStrategy } from '@angular/router';

// import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
// import { HttpClientModule } from '@angular/common/http';

// import { AppComponent } from './app.component';
// import { AppRoutingModule } from './app-routing.module';

// import { environment } from '../environments/environment';

// // ✅ Modular Firebase imports
// import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
// import { provideDatabase, getDatabase } from '@angular/fire/database';

// @NgModule({
//   declarations: [AppComponent],
//   imports: [
//     BrowserModule,
//     IonicModule.forRoot(),
//     AppRoutingModule,
//     HttpClientModule,

//     // ✅ Modular Firebase setup
//     provideFirebaseApp(() => initializeApp(environment.firebase)),
//     provideDatabase(() => getDatabase())
//   ],
//   providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
//   bootstrap: [AppComponent],
// })
// export class AppModule {}


import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { environment } from '../environments/environment';

// ✅ Modular Firebase imports
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideDatabase, getDatabase } from '@angular/fire/database';

// ✅ Custom imports
import { ServerErrorInterceptor } from './interceptors/http-error.interceptor'
@NgModule({
  declarations: [AppComponent],

  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,


    // ✅ Modular Firebase setup
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideDatabase(() => getDatabase())
  ],

  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ServerErrorInterceptor,
      multi: true,
    }
  ],

  bootstrap: [AppComponent],
})
export class AppModule {}



// import { NgModule } from '@angular/core';
// import { BrowserModule } from '@angular/platform-browser';
// import { RouteReuseStrategy } from '@angular/router';

// import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
// import { HttpClientModule } from '@angular/common/http';

// import { AppComponent } from './app.component';
// import { AppRoutingModule } from './app-routing.module';
// import { environment } from '../environments/environment';

// import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
// import { provideDatabase, getDatabase } from '@angular/fire/database';

// import { Contacts } from '@ionic-native/contacts/ngx';

// import { FirebaseX } from '@ionic-native/firebase-x/ngx';
// import { FirebasePushService } from './services/push_notification/firebase-push.service';

// @NgModule({
//   declarations: [AppComponent],
//   imports: [
//     BrowserModule,
//     IonicModule.forRoot(),
//     AppRoutingModule,
//     HttpClientModule,

//     // Firebase initialization
//     provideFirebaseApp(() => initializeApp(environment.firebase)),
//     provideDatabase(() => getDatabase())
//   ],
//   providers: [
//     FirebaseX,       
//     FirebasePushService,
//     { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
//     Contacts
//   ],
//   bootstrap: [AppComponent],
// })
// export class AppModule {}

