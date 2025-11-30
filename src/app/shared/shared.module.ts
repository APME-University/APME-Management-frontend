import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Fixed: RouterModule instead of RouterOutlet
import { FormsModule } from '@angular/forms';

import { CoreModule, PermissionDirective } from '@abp/ng.core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxValidateCoreModule } from '@ngx-validate/core';
import { HafezMenuComponent } from './components/hafez-menu/hafez-menu.component';
import { HafezLayoutComponent } from './components/hafez-layout/hafez-layout.component';
import { HafezHeaderComponent } from './components/hafez-header/hafez-header.component';
import { DarkModeSwitcherComponent } from './components/dark-mode-switcher/dark-mode-switcher.component';
import { NotificationBannerComponent } from './components/notification-banner/notification-banner.component';
import { ConnectionStatusComponent } from './components/connection-status/connection-status.component';

import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar'; // Fixed: ToolbarModule instead of Toolbar
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { ScrollTopModule } from 'primeng/scrolltop';
import { DrawerModule } from 'primeng/drawer';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';

 @NgModule({
  declarations: [
    HafezLayoutComponent,
    HafezHeaderComponent,
    DarkModeSwitcherComponent
  ],
  imports: [
    CommonModule,
    RouterModule, // Provides router-outlet
    FormsModule,
    CoreModule,
    HafezMenuComponent, // Ensure this is correct (likely should be a module or removed if standalone)
    ScrollTopModule, // Provides p-scroll-top
    ToolbarModule, // Provides p-toolbar
    AvatarModule,
    ButtonModule,
    MenuModule,
    PermissionDirective,
    DrawerModule,
    NgbDropdownModule,
    NgxValidateCoreModule,
    CardModule,
    TooltipModule,
    NotificationBannerComponent,
    ConnectionStatusComponent
  ],
  exports: [
    CoreModule,
    HafezLayoutComponent,
    NgbDropdownModule,
    NgxValidateCoreModule,
    NotificationBannerComponent,
    ConnectionStatusComponent
  ],
  providers: [],
})
export class SharedModule { }
