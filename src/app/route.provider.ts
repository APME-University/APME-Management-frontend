import { ConfigStateService, RoutesService, eLayoutType } from '@abp/ng.core';
import { inject, provideAppInitializer } from '@angular/core';
import { PrimeIcons } from 'primeng/api';
import { RoleBasedRouteService } from './shared/services/role-based-route.service';

/**
 * APP_ROUTE_PROVIDER - Configures application routes
 * 
 * Icon Usage:
 * 
 * 1. PrimeIcons (from primeng/api):
 *    iconClass: PrimeIcons.HOME
 *    iconClass: PrimeIcons.USER
 * 
 * 2. Material Icons (Google):
 *    Format: 'material-icons|icon_name' or 'material-icons-variant|icon_name'
 *    
 *    Variants:
 *    - material-icons (Filled - default)
 *    - material-icons-outlined
 *    - material-icons-round
 *    - material-icons-sharp
 *    - material-icons-two-tone
 *    
 *    Examples:
 *    iconClass: 'material-icons|home'
 *    iconClass: 'material-icons-outlined|dashboard'
 *    iconClass: 'material-icons-round|settings'
 *    
 *    Find icons at: https://fonts.google.com/icons
 */
export const APP_ROUTE_PROVIDER = [
  provideAppInitializer(() => {
    configureRoutes();
  }),
];

function configureRoutes() {
  const routes = inject(RoutesService);
  const roleBasedRouteService = inject(RoleBasedRouteService);
  const configState = inject(ConfigStateService);
  
  routes.removeByParam({name : 'AbpUiNavigation::Menu:Administration'});
  routes.add([
          {
        path: '/tenant/dashboard',
        name: '::Menu:TenantDashboard',
        iconClass: 'material-icons-outlined|dashboard',
        layout: eLayoutType.application,
        order: 1,
        isTenant: true
      } as any,
      {
        path: '/',
        name: '::Menu:Catalog',
        // Using Material Icons - Outlined variant
        iconClass: 'material-icons-outlined|inventory_2',
        order: 2,
        layout: eLayoutType.application,
        isTenant: true
      } as any,
      {
        path: '/tenant/categories',
        name : "::Menu:Categories",
        // Using Material Icons - Round variant
        iconClass: 'material-icons-round|category',
        layout : eLayoutType.application,
        order : 3,
        parentName :'::Menu:Catalog',
        isTenant: true
      } as any,
      {
        path: '/tenant/products',
        name : "::Menu:Products",
        // Using PrimeIcons (traditional way)
        iconClass : PrimeIcons.OBJECTS_COLUMN,
        layout : eLayoutType.application,
        order : 4,
        parentName :'::Menu:Catalog',
        isTenant: true
      } as any,
           {
        path: '/tenant/product-attributes',
        name : "::Menu:ProductAttributes",
        // Using PrimeIcons (traditional way)
        iconClass : PrimeIcons.OBJECTS_COLUMN,
        layout : eLayoutType.application,
        order : 5,
        parentName :'::Menu:Catalog',
        isTenant: true
      } as any,
      {
        path: '/users',
        name : "::Menu:user",
        // Using Material Icons - Sharp
        iconClass : 'material-icons-sharp|admin_panel_settings',
        layout : eLayoutType.application,
        order : 14,
        requiredPolicy : 'AbpIdentity.Users'
      },
      {
        path: '/shops',
        name : "::Menu:Shops",
        // Using Material Icons - Outlined
        iconClass : 'material-icons-outlined|store',
        layout : eLayoutType.application,
        order : 15,
        invisible : false,
        isTenant: false  // HOST admin only
      } as any,
      // HOST Admin Routes
      {
        path: '/host/dashboard',
        name: '::Menu:HostDashboard',
        iconClass: 'material-icons-outlined|dashboard',
        layout: eLayoutType.application,
        order: 1,
        isTenant: false
      } as any,
      {
        path: '/host/promo-codes',
        name: '::Menu:PromoCodes',
        iconClass: 'material-icons-outlined|local_offer',
        layout: eLayoutType.application,
        order: 16,
        isTenant: false
      } as any,
      {
        path: '/host/addresses',
        name: '::Menu:Addresses',
        iconClass: 'material-icons-outlined|location_on',
        layout: eLayoutType.application,
        order: 17,
        isTenant: false
      } as any,
      {
        path: '/host/payments',
        name: '::Menu:Payments',
        iconClass: 'material-icons-outlined|payment',
        layout: eLayoutType.application,
        order: 18,
        isTenant: false
      } as any,
      // Tenant Admin Routes

      // {
      //   path: '/tenant/categories',
      //   name: '::Menu:TenantCategories',
      //   iconClass: 'material-icons-round|category',
      //   layout: eLayoutType.application,
      //   order: 2,
      //   isTenant: true,
      //   parentName: '::Menu:TenantCatalog'
      // } as any,
      // {
      //   path: '/tenant/products',
      //   name: '::Menu:TenantProducts',
      //   iconClass: PrimeIcons.OBJECTS_COLUMN,
      //   layout: eLayoutType.application,
      //   order: 3,
      //   isTenant: true,
      //   parentName: '::Menu:TenantCatalog'
      // } as any,
      // {
      //   path: '/tenant/orders',
      //   name: '::Menu:TenantOrders',
      //   iconClass: 'material-icons-round|shopping_cart',
      //   layout: eLayoutType.application,
      //   order: 4,
      //   isTenant: true
      // } as any,
      {
        path: '/tenant/customers',
        name: '::Menu:TenantCustomers',
        iconClass: 'material-icons-round|people',
        layout: eLayoutType.application,
        order: 5,
        isTenant: true
      } as any,
      {
        path: '/tenant/settings',
        name: '::Menu:TenantSettings',
        iconClass: 'material-icons-outlined|settings',
        layout: eLayoutType.application,
        order: 6,
        isTenant: true
      } as any,
      // {
      //   path: '/tenant',
      //   name: '::Menu:TenantCatalog',
      //   iconClass: 'material-icons-outlined|inventory_2',
      //   layout: eLayoutType.application,
      //   order: 2,
      //   isTenant: true
      // } as any
  ]);
}
