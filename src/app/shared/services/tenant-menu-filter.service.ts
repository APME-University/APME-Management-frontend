import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { TreeNode, ABP } from '@abp/ng.core';
import { TenantContextService } from '../../core/services/tenant-context.service';

/**
 * Service to filter menu routes based on tenant context
 * Hides HOST-only routes for tenant users and vice versa
 */
@Injectable({
  providedIn: 'root'
})
export class TenantMenuFilterService {
  private tenantContext = inject(TenantContextService);

  /**
   * Filter routes based on tenant context
   * Removes routes that don't match current tenant context
   */
  filterRoutesByTenant(routes: TreeNode<ABP.Route>[]): Observable<TreeNode<ABP.Route>[]> {
    return this.tenantContext.isHostUser$().pipe(
      map(isHost => {
        return this.filterRoutes(routes, isHost);
      })
    );
  }

  /**
   * Synchronous filtering method
   */
  filterRoutesSync(routes: TreeNode<ABP.Route>[]): TreeNode<ABP.Route>[] {
    const isHost = this.tenantContext.isHostUser();
    return this.filterRoutes(routes, isHost);
  }

  /**
   * Internal filtering logic
   */
  private filterRoutes(routes: TreeNode<ABP.Route>[], isHost: boolean): TreeNode<ABP.Route>[] {
    return routes
      .map(route => this.filterRoute(route, isHost))
      .filter(route => route !== null) as TreeNode<ABP.Route>[];
  }

  /**
   * Filter a single route and its children recursively
   * Checks route.isTenant property (from ABP route provider)
   */
  private filterRoute(route: TreeNode<ABP.Route>, isHost: boolean): TreeNode<ABP.Route> | null {
    // Check if route has tenant context metadata
    // ABP routes have isTenant property directly on the route object (set in route.provider.ts)
    const routeWithTenant = route as any;
    const isTenantRoute = routeWithTenant.isTenant === true;
    const isHostRoute = routeWithTenant.isTenant === false;

    // If route requires tenant context and user is HOST, exclude it
    if (isTenantRoute && isHost) {
      return null;
    }

    // If route requires HOST context and user is tenant, exclude it
    if (isHostRoute && !isHost) {
      return null;
    }

    // Filter children recursively
    if (route.children && route.children.length > 0) {
      const filteredChildren = route.children
        .map(child => this.filterRoute(child, isHost))
        .filter(child => child !== null) as TreeNode<ABP.Route>[];

      return {
        ...route,
        children: filteredChildren
      };
    }

    return route;
  }
}

