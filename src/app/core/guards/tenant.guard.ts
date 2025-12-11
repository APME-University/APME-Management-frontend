import { SessionStateService } from '@abp/ng.core';
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { adminGuard } from './role-based.guard';

/**
 * Tenant-aware guard that checks route.data['isTenant'] to determine access
 * Returns true/false only - no redirects (let Angular router handle navigation)
 * 
 * Following athletes-hub-frontend pattern:
 * - If route.data['isTenant'] is true: requires tenant context
 * - If route.data['isTenant'] is false: requires HOST context (no tenant)
 */
export const tenantGuard: CanActivateFn = (route, state) => {
  const sessionStateService = inject(SessionStateService);
  const isTenant: boolean = Boolean(route.data['isTenant']);
  
  if (
    (isTenant && sessionStateService.getTenant()?.id) ||
    (!isTenant && !sessionStateService.getTenant()?.isAvailable)
  ) {
    return true;
  } else {
    return false;
  }
};

/**
 * Guard that combines tenant guard with admin guard
 * Only allows admin users with correct tenant context
 */
export const tenantAdminGuard: CanActivateFn = (route, state) => {
  // First check tenant context
  const tenantCheck = tenantGuard(route, state);
  if (!tenantCheck) {
    return false;
  }
  
  // Then check if user is admin
  return adminGuard(route, state);
};


