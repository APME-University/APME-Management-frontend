import {
  ABP,
  AuthService,
  ConfigStateService,
  CoreModule,
  RoutesService,
  SessionStateService,
  TreeNode,
} from '@abp/ng.core';
import { Router } from '@angular/router';
import { Component, inject, linkedSignal, OnInit, TrackByFunction, ViewChild, OnDestroy } from '@angular/core';
import { SideBarService } from '../../services/side-bar.service';
import { RoleBasedRouteService } from '../../services/role-based-route.service';
import { AbpLanguageService } from '@abp/ng.theme.lepton-x';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { Ripple } from 'primeng/ripple';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { Drawer, DrawerModule } from 'primeng/drawer';

import { StyleClass } from 'primeng/styleclass';
@Component({
  selector: 'app-hafez-menu',
  standalone: true,
  imports: [
    CommonModule,
    CoreModule,
    DrawerModule,
    ButtonModule,
    RippleModule,
    ButtonModule,
    AvatarModule,
    ScrollPanelModule,
    Ripple,
    StyleClass,
  ],
  templateUrl: './hafez-menu.component.html',
  styleUrl: './hafez-menu.component.scss',
})
export class HafezMenuComponent implements OnInit, OnDestroy {
  @ViewChild('drawerRef') drawerRef!: Drawer;
  languageService = inject(AbpLanguageService);
  sessionStateService = inject(SessionStateService);
  sideBarService = inject(SideBarService);
  configState = inject(ConfigStateService);
  roleBasedRouteService = inject(RoleBasedRouteService);
  router = inject(Router);
  routes: TreeNode<ABP.Route>[] = [];
  menuItems: any[] = [];
  currentUserRoles: string[] = [];
  private destroy$ = new Subject<void>();

  isVisible = linkedSignal<boolean>(() => this.sideBarService.isVisible);

  ngOnInit(): void {
    this.routesService.removeByParam({name : 'AbpUiNavigation::Menu:Administration'});
    
    // Subscribe to user roles and filter routes dynamically
    combineLatest([
      this.routesService.visible$,
      this.configState.getOne$('currentUser')
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(([routes, currentUser]) => {
      this.currentUserRoles = currentUser?.roles || [];
      
      // Apply role-based filtering
      this.roleBasedRouteService.filterRoutesByRoles(routes).pipe(
        takeUntil(this.destroy$)
      ).subscribe(filteredRoutes => {
        this.routes = filteredRoutes;
        this.menuItems = filteredRoutes;
        
        // Log for debugging (remove in production)
        console.log('User roles:', this.currentUserRoles);
        console.log('Filtered routes:', filteredRoutes);
      });
    });

    // Language subscription
    this.sessionStateService.getLanguage$().pipe(
      takeUntil(this.destroy$)
    ).subscribe(lang => {
      if (lang === 'en') this.dir = 'ltr';
      if (lang === 'ar') this.dir = 'rtl';
    });
  }
  dir!: string;

  closeCallback(e: any): void {
    this.drawerRef.close(e);
    this.sideBarService.setIsVisible(false);
  }

  isMobile: boolean = false;
  isDark: boolean = false;

  trackByFn: TrackByFunction<TreeNode<ABP.Route>> = (_, item) => item.name;
  side_bar_data: Array<any> = [];
  public toggleSidebar(): void {}
  constructor(
    public routesService: RoutesService,
    private auth: AuthService
  ) {
    routesService.visible$;
  }

  public miniSideBarMouseHover(position: string): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  public logOut(): void {
    this.auth.logout();
  }
  public navigateAuth(menuValue: string): void {
    //navigate to login page once authenticated
  }

  onResize() {
    this.checkScreenSize();
  }
  checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
  }
  onShow(): void {
    this.sideBarService.setIsVisible(true);
  }
  onHide(): void {
    this.sideBarService.setIsVisible(false);
  }
  getCurrentUser(): string {
    return this.configState.getOne('currentUser').name;
  }

  navigateToChangePassword(): void {
    this.router.navigate(['/change-password']);
    // Close the sidebar on mobile after navigation
    if (this.isMobile) {
      this.sideBarService.setIsVisible(false);
    }
  }

  /**
   * Determines if the icon is a Material Icon
   * @param iconClass - The icon class string
   * @returns true if it's a Material Icon, false if it's a PrimeIcon
   */
  isMaterialIcon(iconClass: string): boolean {
    if (!iconClass) return false;
    return iconClass.startsWith('material-icons');
  }

  /**
   * Gets the Material Icon variant class (e.g., 'material-icons-outlined')
   * @param iconClass - The full icon class string
   * @returns The Material Icon variant class
   */
  getMaterialIconClass(iconClass: string): string {
    const parts = iconClass.split('|');
    return parts[0] || 'material-icons';
  }

  /**
   * Gets the Material Icon name (e.g., 'home', 'settings')
   * @param iconClass - The full icon class string
   * @returns The Material Icon name
   */
  getMaterialIconName(iconClass: string): string {
    const parts = iconClass.split('|');
    return parts[1] || '';
  }

  /**
   * Gets the PrimeIcon classes
   * @param iconClass - The full icon class string
   * @returns The PrimeIcon classes
   */
  getPrimeIconClass(iconClass: string): string {
    return iconClass;
  }
}
