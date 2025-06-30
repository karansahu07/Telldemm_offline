import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule, PopoverController } from '@ionic/angular';
import { MenuPopoverComponent } from '../components/menu-popover/menu-popover.component';

@Component({
  selector: 'app-setting-screen',
  templateUrl: './setting-screen.page.html',
  styleUrls: ['./setting-screen.page.scss'],
  imports: [IonicModule, CommonModule]
})
export class SettingScreenPage implements OnInit {

  constructor(private popoverCtrl: PopoverController) { }

  ngOnInit() {
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverCtrl.create({
      component: MenuPopoverComponent,
      event: ev,
      translucent: true,
    });
    await popover.present();
  }

}
