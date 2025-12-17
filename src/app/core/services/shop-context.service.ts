import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ShopService, ShopDto } from '../../proxy/shops';
import { TenantContextService } from './tenant-context.service';

@Injectable({
  providedIn: 'root'
})
export class ShopContextService {
  private shopService = inject(ShopService);
  private tenantContext = inject(TenantContextService);
  private cachedShop: ShopDto | null = null;

  /**
   * Get current shop for tenant user
   * Returns null for HOST users
   */
  getCurrentShop(): Observable<ShopDto | null> {
    if (this.tenantContext.isHostUser()) {
      return of(null);
    }

    // Return cached shop if available
    if (this.cachedShop) {
      return of(this.cachedShop);
    }

    // Get shop by tenant ID
    const tenantId = this.tenantContext.getTenantId();
    if (!tenantId) {
      return of(null);
    }

    // Fetch shop list and find shop with matching tenantId
    return this.shopService.getList({ maxResultCount: 1000 }).pipe(
      map(result => {
        const shop = result.items?.find(s => s.tenantId === tenantId) || null;
        if (shop) {
          this.cachedShop = shop;
        }
        return shop;
      }),
      catchError(() => of(null))
    );
  }

  /**
   * Get current shop ID synchronously (from cache)
   */
  getCurrentShopId(): string | null {
    return this.cachedShop?.id || null;
  }

  /**
   * Clear cached shop
   */
  clearCache(): void {
    this.cachedShop = null;
  }

  /**
   * Refresh shop cache
   */
  refreshShop(): Observable<ShopDto | null> {
    this.clearCache();
    return this.getCurrentShop();
  }
}




