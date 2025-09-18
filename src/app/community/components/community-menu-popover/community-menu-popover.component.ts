import { Component } from '@angular/core';
import { IonicModule, PopoverController } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-community-menu-popover',
  templateUrl: './community-menu-popover.component.html',  // 👈 now using HTML file
  styleUrls: ['./community-menu-popover.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class CommunityMenuPopoverComponent {
  constructor(private popoverCtrl: PopoverController) {}

  select(action: 'info' | 'invite' | 'settings') {
    this.popoverCtrl.dismiss({ action });
  }
}
