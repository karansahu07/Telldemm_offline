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
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { environment } from '../environments/environment';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideDatabase, getDatabase } from '@angular/fire/database';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,

    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideDatabase(() => getDatabase())
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
