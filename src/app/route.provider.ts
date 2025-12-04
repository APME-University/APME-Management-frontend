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
        path: '/',
        name: '::Menu:Catalog',
        // Using Material Icons - Outlined variant
        iconClass: 'material-icons-outlined|inventory_2',
        order: 1,
        layout: eLayoutType.application,
      },
      {
        path: '/categories',
        name : "::Menu:Categories",
        // Using Material Icons - Round variant
        iconClass: 'material-icons-round|category',
        layout : eLayoutType.application,
        order : 2,
        parentName :'::Menu:Catalog',
      },
      {
        path: '/products',
        name : "::Menu:Products",
        // Using PrimeIcons (traditional way)
        iconClass : PrimeIcons.OBJECTS_COLUMN,
        layout : eLayoutType.application,
        order : 3,
        parentName :'::Menu:Catalog'
      },
      {
        path: '/maintenance-requests-list',
        name : "::Menu:maintenance-requests-list",
        // Using Material Icons - Outlined
        iconClass : 'material-icons-outlined|build',
        layout : eLayoutType.application,
        order : 4,
        parentName :'::Menu:maintenance-requests'
      },
      {
        path: '/maintenance-requests/scheduled',
        name : "::Menu:maintenance-requests-scheduled",
        // Using Material Icons - Round
        iconClass : 'material-icons-round|schedule',
        layout : eLayoutType.application,
        order : 5,
        parentName :'::Menu:maintenance-requests'
      },
      {
        path: '/maintenance-requests',
        name : "::Menu:maintenance-requests",
        // Using Material Icons - Filled (default)
        iconClass : 'material-icons|construction',
        layout : eLayoutType.application,
        order : 6
      },
      {
        path: '/diagnoses',
        name : "::Menu:diagnosis",
        // Using Material Icons - Sharp
        iconClass : 'material-icons-sharp|medical_services',
        layout : eLayoutType.application,
        order : 11
      },
      {
        path: '/technicians',
        name : "::Menu:Technicians",
        // Using Material Icons - Outlined
        iconClass : 'material-icons-outlined|engineering',
        layout : eLayoutType.application,
        order : 8
      },
      {
        path: '/customers',
        name : "::Menu:Customers",
        // Using Material Icons - Round
        iconClass : 'material-icons-round|people',
        layout : eLayoutType.application,
        order : 9
      },
      {
        path: '/common-issues',
        name : "::Menu:CommonIssues",
        // Using Material Icons - Outlined
        iconClass : 'material-icons-outlined|help_outline',
        layout : eLayoutType.application,
        order : 10
      },
      {
        path: '/complaints',
        name : "::Menu:Complaints",
        // Using Material Icons - Filled
        iconClass : 'material-icons|report_problem',
        layout : eLayoutType.application,
        order : 7,
      },
      {
        path: '/orders',
        name : "::Menu:orders",
        // Using Material Icons - Round
        iconClass : 'material-icons-round|shopping_cart',
        layout : eLayoutType.application,
        order : 12,
        invisible : false
      },
      {
        path: '/advertisements',
        name : "::Menu:advertisements",
        // Using Material Icons - Outlined
        iconClass : 'material-icons-outlined|campaign',
        layout : eLayoutType.application,
        order : 13,
        invisible : false
      },
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
        invisible : false
      }
  ]);
}
