// import { Component, Input } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { IonicModule, PopoverController } from '@ionic/angular';

// export type HomeMenuAction =
//   | 'markRead'
//   | 'selectAll'
//   | 'lockChats'
//   | 'favorite'
//   | 'addToList';

// @Component({
//   selector: 'app-menu-home-popover',
//   standalone: true,
//   imports: [CommonModule, IonicModule],
//   templateUrl: './menu-home-popover.component.html',
//   styleUrls: ['./menu-home-popover.component.scss']
// })
// export class MenuHomePopoverComponent {
//   /** optional state you want to control item visibility/enabled */
//   @Input() canLock = true;
//   @Input() allSelected = false;

//   constructor(private popover: PopoverController) {}

//   choose(action: HomeMenuAction) {
//     this.popover.dismiss({ action });
//   }

//   close() {
//     this.popover.dismiss();
//   }
// }



// components/menu-home-popover/menu-home-popover.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, PopoverController } from '@ionic/angular';

export type HomeMenuAction =
  | 'addShortcut' | 'viewContact' | 'markUnread' | 'markRead' | 'selectAll'
  | 'lockChat' | 'lockChats' | 'favorite' | 'addToList' | 'block'
  | 'exitGroup' | 'exitGroups' | 'groupInfo'
  | 'exitCommunity' | 'communityInfo';

@Component({
  selector: 'app-menu-home-popover',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './menu-home-popover.component.html',
  styleUrls: ['./menu-home-popover.component.scss']
})
export class MenuHomePopoverComponent {
  // common helpers
  @Input() canLock = true;
  @Input() allSelected = false;

  // selection buckets (exactly one of these should be true)
  @Input() isSingleUser = false;
  @Input() isMultiUsers = false;
  @Input() isSingleGroup = false;
  @Input() isMultiGroups = false;
  @Input() isSingleCommunity = false;

  constructor(private popover: PopoverController) {}

  choose(action: HomeMenuAction) {
    this.popover.dismiss({ action });
  }
  close() { this.popover.dismiss(); }
}
