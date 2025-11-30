import { Injectable, inject } from '@angular/core';
import { ConfigStateService, TreeNode, ABP } from '@abp/ng.core';
import { Observable, map } from 'rxjs';
import { ROUTE_ROLE_CONFIGURATIONS } from '../../core/route-role.config';

/**
 * Configuration for role-based route access
 * Maps route patterns to required role patterns
 */
export interface RouteRoleConfig {
  routeNamePatterns: string[];
  requiredRolePatterns: string[];
  isExclusive?: boolean; // If true, only these roles can see it
}

/**
 * Service for managing role-based route visibility
 * Provides dynamic filtering based on user roles
 */
@Injectable({
  providedIn: 'root'
})
export class RoleBasedRouteService {
  private readonly configState = inject(ConfigStateService);

  /**
   * Dynamic route-role configuration
   * Loaded from centralized configuration file
   */
  private routeRoleConfigs: RouteRoleConfig[] = [...ROUTE_ROLE_CONFIGURATIONS];

  /**
   * Get current user's roles
   */
  getCurrentUserRoles(): Observable<string[]> {
    return this.configState.getOne$('currentUser').pipe(
      map(currentUser => currentUser?.roles || [])
    );
  }

  /**
   * Check if user has admin role
   */
  private isAdmin(roles: string[]): boolean {
    return roles.some(role => 
      role.toLowerCase().includes('admin') || 
      role.toLowerCase() === 'administrator'
    );
  }

  /**
   * Check if user role matches any of the required patterns
   */
  private hasMatchingRole(userRoles: string[], requiredPatterns: string[]): boolean {
    return userRoles.some(role => 
      requiredPatterns.some(pattern => 
        role.toLowerCase().includes(pattern.toLowerCase())
      )
    );
  }

  /**
   * Check if a route should be visible based on user roles
   */
  private shouldShowRoute(routeName: string, userRoles: string[]): boolean {
    // Admin can see everything
    if (this.isAdmin(userRoles)) {
      return true;
    }

    // Find matching configuration for this route
    const config = this.routeRoleConfigs.find(cfg =>
      cfg.routeNamePatterns.includes(routeName)
    );

    // If no configuration found, route is visible to all
    if (!config) {
      return true;
    }

    // Check if user has required role
    return this.hasMatchingRole(userRoles, config.requiredRolePatterns);
  }

  /**
   * Filter routes based on user roles
   */
  filterRoutesByRoles(routes: TreeNode<ABP.Route>[]): Observable<TreeNode<ABP.Route>[]> {
    return this.getCurrentUserRoles().pipe(
      map(userRoles => this.filterRoutesRecursive(routes, userRoles))
    );
  }

  /**
   * Recursively filter routes and their children
   */
  private filterRoutesRecursive(
    routes: TreeNode<ABP.Route>[], 
    userRoles: string[]
  ): TreeNode<ABP.Route>[] {
    return routes
      .filter(route => this.shouldShowRoute(route.name, userRoles))
      .map(route => {
        if (route.children && route.children.length > 0) {
          return {
            ...route,
            children: this.filterRoutesRecursive(route.children, userRoles)
          };
        }
        return route;
      })
      .filter(route => {
        // Remove parent routes that have no visible children
        if (route.children && route.children.length === 0 && !route.path) {
          return false;
        }
        return true;
      });
  }

  /**
   * Add new route-role configuration dynamically
   */
  addRouteRoleConfig(config: RouteRoleConfig): void {
    this.routeRoleConfigs.push(config);
  }

  /**
   * Update existing configuration
   */
  updateRouteRoleConfig(index: number, config: RouteRoleConfig): void {
    if (index >= 0 && index < this.routeRoleConfigs.length) {
      this.routeRoleConfigs[index] = config;
    }
  }

  /**
   * Get all configurations (for debugging/management)
   */
  getRouteRoleConfigs(): RouteRoleConfig[] {
    return [...this.routeRoleConfigs];
  }

  /**
   * Clear and reset configurations
   */
  resetConfigs(configs: RouteRoleConfig[]): void {
    this.routeRoleConfigs = [...configs];
  }
}
