import { Injectable, inject } from '@angular/core';
import { SessionStateService, ConfigStateService } from '@abp/ng.core';
import { Observable, map, of } from 'rxjs';
import { getTenantId } from '../interceptors/tenant.interceptor';

/**
 * Service to determine tenant context (HOST vs Tenant user)
 * Uses ABP's SessionStateService and ConfigStateService when available
 * Falls back to sessionStorage tenant ID from our interceptor
 */
@Injectable({
  providedIn: 'root'
})
export class TenantContextService {
  private sessionStateService = inject(SessionStateService);
  private configState = inject(ConfigStateService);

  /**
   * Check if current user is a HOST user (no tenant context)
   */
  isHostUser(): boolean {
    // Try ABP's SessionStateService first
    const tenant = this.sessionStateService.getTenant();
    if (tenant) {
      return !tenant.id || !tenant.isAvailable;
    }

    // Fallback to our sessionStorage tenant ID
    const tenantId = getTenantId();
    return !tenantId || tenantId === 'null' || tenantId === '';
  }

  /**
   * Check if current user is a tenant user (has tenant context)
   */
  isTenantUser(): boolean {
    return !this.isHostUser();
  }

  /**
   * Get current tenant ID synchronously
   */
  getTenantId(): string | null {
    // Try ABP's SessionStateService first
    const tenant = this.sessionStateService.getTenant();
    if (tenant?.id) {
      return tenant.id.toString();
    }

    // Fallback to our sessionStorage tenant ID
    return getTenantId();
  }

  /**
   * Get current tenant ID as Observable
   */
  getTenantId$(): Observable<string | null> {
    // Try to get from ConfigStateService
    try {
      return this.configState.getOne$('currentTenant').pipe(
        map((currentTenant: any) => {
          if (currentTenant?.id) {
            return currentTenant.id.toString();
          }
          return this.getTenantId();
        })
      );
    } catch (error) {
      // Fallback to synchronous method
      return of(this.getTenantId());
    }
  }

  /**
   * Get tenant name if available
   */
  getTenantName(): string | null {
    const tenant = this.sessionStateService.getTenant();
    return tenant?.name || null;
  }

  /**
   * Observable to watch tenant context changes
   */
  isHostUser$(): Observable<boolean> {
    return this.getTenantId$().pipe(
      map(tenantId => !tenantId || tenantId === 'null' || tenantId === '')
    );
  }

  /**
   * Observable to watch tenant user status
   */
  isTenantUser$(): Observable<boolean> {
    return this.isHostUser$().pipe(
      map(isHost => !isHost)
    );
  }
}


