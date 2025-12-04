/**
 * Centralized configuration for route guards
 * Maps route paths to their corresponding guards
 */

import { 
  maintenanceGuard, 
  salesGuard, 
  customerServiceGuard, 
  adminGuard,
  requireRoles
} from './role-based.guard';

/**
 * Route-to-guard mapping configuration
 * This configuration is used to automatically apply guards to routes
 */
export const ROUTE_GUARD_CONFIG = {
  // Maintenance routes
  'maintenance-requests': maintenanceGuard,
  'maintenance-requests-list': maintenanceGuard,
  'maintenance-requests/scheduled': maintenanceGuard,
  'diagnoses': maintenanceGuard,
  
  // Sales routes
  'orders': salesGuard,
  'categories': salesGuard,
  'products': salesGuard,
  
  // Customer service routes (multiple roles)
  'customers': customerServiceGuard,
  'complaints': customerServiceGuard,
  'common-issues': customerServiceGuard,
  
  // Admin routes
  'users': adminGuard,
  'shops': adminGuard,
  'technicians': adminGuard,
  'advertisements': adminGuard,
  'identity': adminGuard,
  'tenant-management': adminGuard,
  'setting-management': adminGuard
};

/**
 * Get guard for a specific route path
 * @param path Route path
 * @returns Guard function or null
 */
export function getGuardForRoute(path: string) {
  return ROUTE_GUARD_CONFIG[path] || null;
}

/**
 * Route data configuration for menu name mapping
 * This helps the guard identify which menu item corresponds to which route
 */
export const ROUTE_DATA_CONFIG = {
  'maintenance-requests': { 
    menuName: '::Menu:maintenance-requests',
    requiredRoles: ['maintenance', 'Maintenance']
  },
  'maintenance-requests-list': { 
    menuName: '::Menu:maintenance-requests-list',
    requiredRoles: ['maintenance', 'Maintenance']
  },
  'diagnoses': { 
    menuName: '::Menu:diagnosis',
    requiredRoles: ['maintenance', 'Maintenance']
  },
  'technicians': { 
    menuName: '::Menu:Technicians',
    requiredRoles: ['admin', 'Admin']
  },
  'orders': { 
    menuName: '::Menu:orders',
    requiredRoles: ['sales', 'Sales']
  },
  'categories': { 
    menuName: '::Menu:Categories',
    requiredRoles: ['sales', 'Sales']
  },
  'products': { 
    menuName: '::Menu:Products',
    requiredRoles: ['sales', 'Sales']
  },
  'customers': { 
    menuName: '::Menu:Customers',
    requiredRoles: ['sales', 'Sales', 'maintenance', 'Maintenance', 'support']
  },
  'complaints': { 
    menuName: '::Menu:Complaints',
    requiredRoles: ['sales', 'Sales', 'maintenance', 'Maintenance', 'support']
  },
  'common-issues': { 
    menuName: '::Menu:CommonIssues',
    requiredRoles: ['maintenance', 'Maintenance', 'support']
  },
  'users': { 
    menuName: '::Menu:user',
    requiredRoles: ['admin', 'Admin']
  },
  'shops': { 
    menuName: '::Menu:Shops',
    requiredRoles: ['admin', 'Admin']
  },
  'advertisements': { 
    menuName: '::Menu:Advertisements',
    requiredRoles: ['admin', 'Admin']
  }
};

/**
 * Get route data for a specific path
 * @param path Route path
 * @returns Route data object or empty object
 */
export function getRouteData(path: string) {
  return ROUTE_DATA_CONFIG[path] || {};
}
