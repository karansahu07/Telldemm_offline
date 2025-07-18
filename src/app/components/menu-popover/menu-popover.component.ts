import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu-popover',
  standalone: true,
  templateUrl: './menu-popover.component.html',
  styleUrls: ['./menu-popover.component.scss'],
  imports: [IonicModule, CommonModule],
})
export class MenuPopoverComponent implements OnInit {
  currentUrl: string = '';
  menuOptions: { label: string, route?: string }[] = [];

  constructor(
    private popoverCtrl: PopoverController,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUrl = this.router.url;

    if (this.currentUrl.includes('/home-screen')) {
      this.menuOptions = [
        { label: 'Advertise' },
        { label: 'New group' },
        { label: 'New broadcast' },
        { label: 'Labels' },
        { label: 'Starred' },
        { label: 'Setting', route: '/setting-screen' }
      ];
    } else if (this.currentUrl.includes('/status')) {
      this.menuOptions = [
        { label: 'Create channels' },
        { label: 'Status Privacy' },
        { label: 'Starred' },
        { label: 'Setting', route: '/setting-screen' }
      ];
    } else if (this.currentUrl.includes('/community-screen')) {
      this.menuOptions = [
        { label: 'Setting', route: '/setting-screen' }
      ];
    } else if (this.currentUrl.includes('/calls-screen')) {
      this.menuOptions = [
        { label: 'Clear call logs' },
        { label: 'Setting', route: '/setting-screen' }
      ];
    }
  }

  selectOption(option: any) {
    this.popoverCtrl.dismiss();

    if (option.route) {
      this.router.navigate([option.route]);
    }

    // You can add more actions here if needed
  }
}
