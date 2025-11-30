import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { ConfigStateService } from '@abp/ng.core';
import { Observable, map, take } from 'rxjs';
import { RoleBasedRouteService } from '../../shared/services/role-based-route.service';
import { ROUTE_ROLE_CONFIGURATIONS } from '../route-role.config';

/**
 * Role-based route guard
 * Prevents navigation to routes that user doesn't have access to
 */
export const roleBasedGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> => {
  
  const configState = inject(ConfigStateService);
  const router = inject(Router);
  const roleService = inject(RoleBasedRouteService);
  
  return configState.getOne$('currentUser').pipe(
    take(1),
    map(currentUser => {
      const userRoles = currentUser?.roles || [];
      
      // Check if user is admin (admins can access everything)
      if (isAdmin(userRoles)) {
        return true;
      }
      
      // Get required roles from route data or check configuration
      const requiredRoles = getRequiredRoles(route);
      
      // If no roles required, allow access
      if (!requiredRoles || requiredRoles.length === 0) {
        return true;
      }
      
      // Check if user has any of the required roles
      const hasAccess = hasMatchingRole(userRoles, requiredRoles);
      
      if (!hasAccess) {
        console.warn(`Access denied to route: ${state.url}. User roles: ${userRoles.join(', ')}`);
        
        // Redirect to unauthorized page with details
        return router.createUrlTree(['/unauthorized'], {
          queryParams: { 
            returnUrl: state.url,
            reason: 'unauthorized',
            requiredRoles: requiredRoles.join(',')
          }
        });
      }
      
      return true;
    })
  );
};

/**
 * Function guard factory for specific roles
 * Usage: canActivate: [requireRoles(['sales', 'manager'])]
 */
export function requireRoles(roles: string[]): CanActivateFn {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const configState = inject(ConfigStateService);
    const router = inject(Router);
    
    return configState.getOne$('currentUser').pipe(
      take(1),
      map(currentUser => {
        const userRoles = currentUser?.roles || [];
        
        // Admin bypass
        if (isAdmin(userRoles)) {
          return true;
        }
        
        // Check if user has any required role
        const hasAccess = hasMatchingRole(userRoles, roles);
        
        if (!hasAccess) {
          console.warn(`Access denied. Required roles: ${roles.join(', ')}, User roles: ${userRoles.join(', ')}`);
          return router.createUrlTree(['/unauthorized'], {
            queryParams: {
              returnUrl: state.url,
              reason: 'unauthorized',
              requiredRoles: roles.join(',')
            }
          });
        }
        
        return true;
      })
    );
  };
}

/**
 * Guard for admin-only routes
 */
export const adminGuard: CanActivateFn = requireRoles(['admin', 'Admin']);

/**
 * Guard for maintenance routes
 */
export const maintenanceGuard: CanActivateFn = requireRoles(['maintenance', 'Maintenance', 'technician']);

/**
 * Guard for sales routes
 */
export const salesGuard: CanActivateFn = requireRoles(['sales', 'Sales']);

/**
 * Guard for customer service routes
 */
export const customerServiceGuard: CanActivateFn = requireRoles([
  'sales', 'Sales',
  'maintenance', 'Maintenance', 
  'support', 'Support',
  'customer-service'
]);

/**
 * Combined guard - user must have ALL specified roles
 */
export function requireAllRoles(roles: string[]): CanActivateFn {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const configState = inject(ConfigStateService);
    const router = inject(Router);
    
    return configState.getOne$('currentUser').pipe(
      take(1),
      map(currentUser => {
        const userRoles = currentUser?.roles || [];
        
        // Admin bypass
        if (isAdmin(userRoles)) {
          return true;
        }
        
        // Check if user has ALL required roles
        const hasAllRoles = roles.every(role =>
          userRoles.some(userRole =>
            userRole.toLowerCase().includes(role.toLowerCase())
          )
        );
        
        if (!hasAllRoles) {
          console.warn(`Access denied. User must have all roles: ${roles.join(', ')}`);
          return router.createUrlTree(['/unauthorized'], {
            queryParams: {
              returnUrl: state.url,
              reason: 'unauthorized',
              requiredRoles: roles.join(',')
            }
          });
        }
        
        return true;
      })
    );
  };
}

// Helper functions

function isAdmin(roles: string[]): boolean {
  return roles.some(role => 
    role.toLowerCase().includes('admin') || 
    role.toLowerCase() === 'administrator'
  );
}

function hasMatchingRole(userRoles: string[], requiredPatterns: string[]): boolean {
  return requiredPatterns.some(pattern =>
    userRoles.some(role =>
      role.toLowerCase().includes(pattern.toLowerCase())
    )
  );
}

function getRequiredRoles(route: ActivatedRouteSnapshot): string[] {
  // First check if route has explicit role requirements in data
  if (route.data['requiredRoles']) {
    return route.data['requiredRoles'];
  }
  
  // Check if route has a menu name that matches configuration
  const routeName = route.data['menuName'] || route.data['name'];
  if (routeName) {
    const config = ROUTE_ROLE_CONFIGURATIONS.find(cfg =>
      cfg.routeNamePatterns.includes(routeName)
    );
    
    if (config) {
      return config.requiredRolePatterns;
    }
  }
  
  // No specific requirements found
  return [];
}
