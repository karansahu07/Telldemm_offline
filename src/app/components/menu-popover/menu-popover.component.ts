import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-popover',
  standalone: true,
  templateUrl: './menu-popover.component.html',
  styleUrls: ['./menu-popover.component.scss'],
  imports: [IonicModule],
})
export class MenuPopoverComponent implements OnInit {

  constructor(
    private popoverCtrl: PopoverController,
    private router: Router
  ) {}

  ngOnInit() {}

  selectOption(option: string) {
    this.popoverCtrl.dismiss();

    if (option === 'Setting') {
      this.router.navigate(['/setting-screen']);
    }

    // Add more options if needed
  }

}

