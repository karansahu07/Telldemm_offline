import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, IonicModule, PopoverController } from '@ionic/angular';
import { MenuPopoverComponent } from '../components/menu-popover/menu-popover.component';
import { FooterTabsComponent } from '../components/footer-tabs/footer-tabs.component';

@Component({
  selector: 'app-community',
  templateUrl: './community.page.html',
  styleUrls: ['./community.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FooterTabsComponent],
})
export class CommunityPage implements OnInit {
  constructor(
    private router: Router,
    private popoverCtrl: PopoverController,
    private actionSheetCtrl: ActionSheetController
  ) {}

  ngOnInit() {}
  async presentPopover(ev: any) {
    const popover = await this.popoverCtrl.create({
      component: MenuPopoverComponent,
      event: ev,
      translucent: true,
    });
    await popover.present();
  }
  
}




