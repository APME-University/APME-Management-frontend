import { AuthService, LocalizationService, SessionStateService } from '@abp/ng.core';
import { Component, ElementRef, inject, linkedSignal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MenuItem } from 'primeng/api';

import { SideBarService } from '../../services/side-bar.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hafez-header',
  standalone: false,
  templateUrl: './hafez-header.component.html',
  styleUrl: './hafez-header.component.scss',
})
export class HafezHeaderComponent {
  @ViewChild('toolbar') toolbar?: ElementRef;

  private readonly sessionStateService: SessionStateService = inject(SessionStateService);
  private readonly sideBarService: SideBarService = inject(SideBarService);
  authService = inject(AuthService);
  isVisible = linkedSignal<boolean>(() => this.sideBarService.isVisible);
  router = inject(Router);
  localizationService = inject(LocalizationService);
  constructor() {}

  // Method to toggle the drawer
  toggleDrawer(): void {
    this.sideBarService.toggleVisibility();
  }

  isMobile: boolean = false;
  onResize() {
    this.checkScreenSize();
  }
  checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
  }
  items: MenuItem[] | undefined;
  ngOnInit(): void {
    this.items = [
      {
        label: this.localizationService.instant('::signOut'),
        icon: 'pi pi-sign-out',
        command: () => this.logout(),
      },
    ];
  }

  logout(): void {
     this.authService.logout().subscribe(result => {
      this.router.navigate(['/account/login',{returnUrl : '/'}]);
     });
  }
  toggleLang(): void {
    if (this.sessionStateService.getLanguage()==="ar") {
      this.sessionStateService.setLanguage('en');
      return;
    }
    this.sessionStateService.setLanguage('ar');
  }
}
