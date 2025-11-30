import { inject } from '@angular/core';
import { ConfigStateService } from '@abp/ng.core';
import { Observable, map } from 'rxjs';

/**
 * Utility functions for role-based operations
 * These helpers can be used throughout the application
 */

/**
 * Check if current user has a specific role
 * @param roleName Role name or pattern to check
 * @returns Observable<boolean> indicating if user has the role
 */
export function hasRole(roleName: string): Observable<boolean> {
  const configState = inject(ConfigStateService);
  
  return configState.getOne$('currentUser').pipe(
    map(user => {
      const roles = user?.roles || [];
      return roles.some(role => 
        role.toLowerCase().includes(roleName.toLowerCase())
      );
    })
  );
}

/**
 * Check if current user has any of the specified roles
 * @param roleNames Array of role names or patterns
 * @returns Observable<boolean> indicating if user has any of the roles
 */
export function hasAnyRole(roleNames: string[]): Observable<boolean> {
  const configState = inject(ConfigStateService);
  
  return configState.getOne$('currentUser').pipe(
    map(user => {
      const userRoles = user?.roles || [];
      return roleNames.some(roleName =>
        userRoles.some(userRole =>
          userRole.toLowerCase().includes(roleName.toLowerCase())
        )
      );
    })
  );
}

/**
 * Check if current user has all of the specified roles
 * @param roleNames Array of role names or patterns
 * @returns Observable<boolean> indicating if user has all roles
 */
export function hasAllRoles(roleNames: string[]): Observable<boolean> {
  const configState = inject(ConfigStateService);
  
  return configState.getOne$('currentUser').pipe(
    map(user => {
      const userRoles = user?.roles || [];
      return roleNames.every(roleName =>
        userRoles.some(userRole =>
          userRole.toLowerCase().includes(roleName.toLowerCase())
        )
      );
    })
  );
}

/**
 * Check if current user is an admin
 * @returns Observable<boolean> indicating if user is admin
 */
export function isAdmin(): Observable<boolean> {
  return hasRole('admin');
}

/**
 * Get all roles for current user
 * @returns Observable<string[]> with user roles
 */
export function getUserRoles(): Observable<string[]> {
  const configState = inject(ConfigStateService);
  
  return configState.getOne$('currentUser').pipe(
    map(user => user?.roles || [])
  );
}

/**
 * Role-based visibility helper for templates
 * Usage: *ngIf="canAccess(['sales', 'admin']) | async"
 */
export function canAccess(requiredRoles: string[]): Observable<boolean> {
  return hasAnyRole(requiredRoles);
}

/**
 * Create a role guard function for route protection
 * @param requiredRoles Roles required to access the route
 * @returns Guard function
 */
export function createRoleGuard(requiredRoles: string[]) {
  return () => hasAnyRole(requiredRoles);
}
