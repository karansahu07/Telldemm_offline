import { Component } from '@angular/core';
import { IonicModule, PopoverController } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-message-more-popover',
  templateUrl: './message-more-popover.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class MessageMorePopoverComponent {
  constructor(private popoverCtrl: PopoverController) {}

  selectOption(action: string) {
    this.popoverCtrl.dismiss(action);
  }
}
