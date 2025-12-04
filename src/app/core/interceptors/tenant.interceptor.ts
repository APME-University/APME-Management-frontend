import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

const TENANT_HEADER_NAME = '__tenant';
const TENANT_STORAGE_KEY = 'abp_tenant_id';

@Injectable()
export class TenantInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get tenant ID from session storage
    const tenantId = sessionStorage.getItem(TENANT_STORAGE_KEY);
    
    // If tenant ID exists, add it to the request header
    if (tenantId) {
      const clonedRequest = req.clone({
        setHeaders: {
          [TENANT_HEADER_NAME]: tenantId
        }
      });
      return next.handle(clonedRequest);
    }
    
    return next.handle(req);
  }
}

// Helper function to set tenant ID
export function setTenantId(tenantId: string | null): void {
  if (tenantId) {
    sessionStorage.setItem(TENANT_STORAGE_KEY, tenantId);
  } else {
    sessionStorage.removeItem(TENANT_STORAGE_KEY);
  }
}

// Helper function to get tenant ID
export function getTenantId(): string | null {
  return sessionStorage.getItem(TENANT_STORAGE_KEY);
}

// Helper function to clear tenant ID
export function clearTenantId(): void {
  sessionStorage.removeItem(TENANT_STORAGE_KEY);
}

