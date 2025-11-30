import { RouteRoleConfig } from '../shared/services/role-based-route.service';

/**
 * Centralized route-role configuration
 * This file contains all route-to-role mappings for the application
 * 
 * Configuration Structure:
 * - routeNamePatterns: Array of route names that should be controlled
 * - requiredRolePatterns: Array of role patterns (partial matches) that can access these routes
 * - isExclusive: Optional flag to make routes exclusive to specified roles
 * 
 * Special Rules:
 * - Admin roles (containing 'admin') always have full access
 * - Routes without configuration are visible to all users
 * - Role matching is case-insensitive
 */

export const ROUTE_ROLE_CONFIGURATIONS: RouteRoleConfig[] = [
  // Maintenance-related routes
  {
    routeNamePatterns: [
      '::Menu:maintenance-requests',
      '::Menu:maintenance-requests-scheduled',
      '::Menu:maintenance-requests-list',
      '::Menu:diagnosis'
    ],
    requiredRolePatterns: ['maintenance', 'Maintenance', 'technician', 'Technician']
  },
  
  // Sales-related routes
  {
    routeNamePatterns: [
      '::Menu:orders',
      '::Menu:Catalog',
      '::Menu:Categories',
      '::Menu:Products'
    ],
    requiredRolePatterns: ['sales', 'Sales', 'commerce', 'Commerce']
  },
  
  // Customer service routes (accessible by multiple roles)
  {
    routeNamePatterns: [
      '::Menu:Customers',
      '::Menu:Complaints',
      '::Menu:CommonIssues'
    ],
    requiredRolePatterns: [
      'sales', 'Sales',
      'maintenance', 'Maintenance',
      'support', 'Support',
      'customer-service', 'CustomerService'
    ]
  },
  
  // Admin-only routes
  {
    routeNamePatterns: [
      '::Menu:user',
      '::Menu:Technicians'
    ],
    requiredRolePatterns: ['admin', 'Admin']
  }
];

/**
 * Helper function to add custom route configurations dynamically
 * @param config New configuration to add
 */
export function addCustomRouteConfig(config: RouteRoleConfig): void {
  ROUTE_ROLE_CONFIGURATIONS.push(config);
}

/**
 * Helper function to find configuration for a specific route
 * @param routeName The route name to search for
 */
export function findRouteConfig(routeName: string): RouteRoleConfig | undefined {
  return ROUTE_ROLE_CONFIGURATIONS.find(config =>
    config.routeNamePatterns.includes(routeName)
  );
}

/**
 * Example of how to extend configurations for new features
 * Uncomment and modify as needed:
 * 
 * addCustomRouteConfig({
 *   routeNamePatterns: ['::Menu:reports', '::Menu:analytics'],
 *   requiredRolePatterns: ['manager', 'analyst', 'executive']
 * });
 */
