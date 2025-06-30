import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
// import { IonTabBar } from '@ionic/angular/standalone';
import { IonTabBar, IonBadge } from '@ionic/angular/standalone';

@Component({
  selector: 'app-footer-tabs',
  templateUrl: './footer-tabs.component.html',
  styleUrls: ['./footer-tabs.component.scss'],
  imports: [IonTabBar, CommonModule, IonBadge],
})

export class FooterTabsComponent {

  @Input() totalUnreadCount: number = 0;  

  activePath: string = '/home-screen';

  constructor(private router: Router) {
    // Update activePath when route changes
    this.router.events.subscribe(() => {
      this.activePath = this.router.url;
    });
  }

  navigateTohomescreen() {
    this.router.navigate(['/home-screen']);
    this.activePath = '/home-screen';
  }

  navigateTocallingscreen() {
    this.router.navigate(['/status-screen']);
    this.activePath = '/status-screen';
  }

  navigateTocommunityscreen() {
    this.router.navigate(['/community-screen']);
    this.activePath = '/community-screen';
  }

  navigateTocallsscreen() {
    this.router.navigate(['/calls-screen']);
    this.activePath = '/calls-screen';
  }

  isActive(paths: string[]): boolean {
    return paths.includes(this.router.url);
  }
//   isActive(paths: string[]): boolean {
//   return paths.some(path => this.router.url.startsWith(path));
// }
}


