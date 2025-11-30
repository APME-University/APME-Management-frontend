import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SideBarService {
  private _isVisible = signal<boolean>(false);

  get isVisible(): boolean {
    return this._isVisible();
  }

  setIsVisible(value: boolean): void {
    this._isVisible.set(value);
  }

  toggleVisibility(): void {
    this._isVisible.set(!this._isVisible());
  }

  private menuItems = [
    {
      label: 'drawer.dashboard',
      icon: 'pi pi-box',
      subItems: [
        {
          label: 'drawer.home',
          path: 'home',
          icon: 'pi pi-home',
        },
      ],
    },
    {
      label: 'drawer.generalGuide',
      icon: 'pi pi-box',
      subItems: [
        {
          label: 'drawer.users',
          path: 'users',
          icon: 'pi pi-user',
          permission: 'Petra.SystemUsers.ViewList',
        },
        {
          label: 'drawer.roles',
          path: 'roles',
          icon: 'pi pi-slack',
          permission: 'Petra.Roles.ViewList',
        },
        {
          label: 'drawer.products',
          path: 'products',
          icon: 'pi pi-box',
          permission: 'Petra.Products.ViewList',
        },
        {
          label: 'drawer.productUnit',
          path: 'product-unit',
          icon: 'pi pi-objects-column',
          permission: 'Petra.ProductUnits.ViewList',
        },
        {
          label: 'drawer.stations',
          path: 'stations',
          icon: 'pi pi-truck',
          permission: 'Petra.Stations.ViewList',
        },
        {
          label: 'drawer.terminals',
          path: 'terminals',
          icon: 'pi pi-key',
          permission: 'Petra.Terminals.ViewList',
        },
      ],
    },
    {
      label: 'drawer.customerGuide',
      icon: 'pi pi-box',
      subItems: [
        {
          label: 'drawer.clients',
          path: 'clients',
          icon: 'pi pi-users',
          permission: 'Petra.Clients.ViewList',
        },
        {
          label: 'drawer.clientsCategory',
          path: 'clients-category',
          icon: 'pi pi-bars',
          permission: 'Petra.ClientCategories.ViewList',
        },
        {
          label: 'drawer.clientUsers',
          path: 'client-users',
          icon: 'pi pi-user-plus',
          permission: 'Petra.ClientUsers.ViewList',
        },
      ],
    },
    {
      label: 'drawer.label.customerInformationManagement',
      icon: 'pi pi-box',

      subItems: [
        {
          label: 'drawer.vehicles',
          path: 'vehicles',
          icon: 'pi pi-car',
          permission: 'Petra.Vehicles.ViewList',
        },
        {
          label: 'drawer.agents',
          path: 'agents',
          icon: 'pi pi-user-plus',
          permission: 'Petra.Agents.ViewList',
        },
        {
          label: 'drawer.cards',
          path: 'cards',
          icon: 'pi pi-credit-card',
          permission: 'Petra.Cards.ViewList',
        },
        {
          label: 'drawer.walletChargeRequest',
          path: 'wallet-charge-request',
          icon: 'pi pi-wallet',
          permission: 'Petra.Clients.WalletChargeRequest',
        },
        {
          label: 'drawer.currency',
          path: 'currency',
          icon: 'pi pi-dollar',
          permission: 'Petra.Currencies.Edit',
        },

        // { label: 'items', path: 'items/categories', icon: 'pi pi-truck' },
        //     { label: 'Sizes', path: 'sizes', icon: 'pi pi-tag' },
        //     { label: 'Colors', path: 'colors', icon: 'pi pi-palette' },
        //     { label: 'Comments', path: 'comments', icon: 'pi pi-comments' },
        //     { label: 'Ads', path: 'ads', icon: 'pi pi-bullseye' },
        //     {
        //       label: 'Reports',
        //       icon: 'pi pi-chart-line',
        //       subItems: [
        //         {
        //           label: 'Revenue',
        //           icon: 'pi pi-chart-line',
        //           subItems: [
        //             { label: 'View', icon: 'pi pi-table' },
        //             { label: 'Search', icon: 'pi pi-search' },
        //           ],
        //         },
        //         { label: 'Expenses', icon: 'pi pi-chart-line' },
        //       ],
        //     },
        //     { label: 'Team', icon: 'pi pi-users' },
        //     { label: 'Messages', icon: 'pi pi-comments', badge: 3 },
        //     { label: 'Calendar', icon: 'pi pi-calendar' },
      ],
    },
    {
      label: 'Reports',
      icon: 'pi pi-chart-line',
      subItems: [
        {
          label: 'drawer.shiftReport',
          path: 'shift-report',
          icon: 'pi pi-home',
          permission: 'Petra.Reports.Shifts',
        },
        {
          label: 'drawer.sellingReport',
          path: 'selling-report',
          icon: 'pi pi-home',
          permission: 'Petra.Reports.Sellings',
        },
      ],
    },

    // },
    // {
    //   label: 'Settings',
    //   icon: 'pi pi-cog',
    //   subItems: [
    //     { label: 'Shipping', path: 'settings/shipping', icon: 'pi pi-inbox' },
    //     {
    //       label: 'Currency',
    //       path: 'settings/currency',
    //       icon: 'pi pi-money-bill',
    //     },
    //   ],
    // },
    // {
    //   label: 'OTHER',
    //   icon: 'pi pi-folder',
    //   subItems: [
    //     {
    //       label: 'Change Password',
    //       path: 'settings/changePassword',
    //       icon: 'pi pi-lock',
    //     },
    //     { label: 'Performance', icon: 'pi pi-chart-bar' },
    //     { label: 'Settings', icon: 'pi pi-cog' },
    //     { label: 'currencies'   , icon: 'pi pi-cog' },
    //   ],
  ];

  getMenuItems() {
    return this.menuItems;
  }
}
