import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ConfigStateService } from '@abp/ng.core';
import { of } from 'rxjs';
import { 
  roleBasedGuard, 
  requireRoles, 
  adminGuard,
  maintenanceGuard,
  salesGuard
} from './role-based.guard';

describe('RoleBasedGuard', () => {
  let router: jasmine.SpyObj<Router>;
  let configStateService: jasmine.SpyObj<ConfigStateService>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);
    const configSpy = jasmine.createSpyObj('ConfigStateService', ['getOne$']);
    
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ConfigStateService, useValue: configSpy }
      ]
    });
    
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    configStateService = TestBed.inject(ConfigStateService) as jasmine.SpyObj<ConfigStateService>;
    
    mockRoute = { data: {} } as ActivatedRouteSnapshot;
    mockState = { url: '/test-route' } as RouterStateSnapshot;
  });

  describe('roleBasedGuard', () => {
    it('should allow access for admin users', (done) => {
      configStateService.getOne$.and.returnValue(of({
        roles: ['Admin']
      }));

      TestBed.runInInjectionContext(() => {
        const result = roleBasedGuard(mockRoute, mockState);
        
        if (result instanceof Observable) {
          result.subscribe(canActivate => {
            expect(canActivate).toBe(true);
            done();
          });
        }
      });
    });

    it('should deny access and redirect when user lacks required roles', (done) => {
      mockRoute.data = { requiredRoles: ['maintenance'] };
      configStateService.getOne$.and.returnValue(of({
        roles: ['Sales']
      }));
      
      const mockUrlTree = {} as any;
      router.createUrlTree.and.returnValue(mockUrlTree);

      TestBed.runInInjectionContext(() => {
        const result = roleBasedGuard(mockRoute, mockState);
        
        if (result instanceof Observable) {
          result.subscribe(canActivate => {
            expect(canActivate).toBe(mockUrlTree);
            expect(router.createUrlTree).toHaveBeenCalledWith(
              ['/unauthorized'],
              jasmine.objectContaining({
                queryParams: jasmine.objectContaining({
                  returnUrl: '/test-route',
                  reason: 'unauthorized'
                })
              })
            );
            done();
          });
        }
      });
    });

    it('should allow access when user has required role', (done) => {
      mockRoute.data = { requiredRoles: ['maintenance'] };
      configStateService.getOne$.and.returnValue(of({
        roles: ['Maintenance']
      }));

      TestBed.runInInjectionContext(() => {
        const result = roleBasedGuard(mockRoute, mockState);
        
        if (result instanceof Observable) {
          result.subscribe(canActivate => {
            expect(canActivate).toBe(true);
            done();
          });
        }
      });
    });

    it('should handle case-insensitive role matching', (done) => {
      mockRoute.data = { requiredRoles: ['maintenance'] };
      configStateService.getOne$.and.returnValue(of({
        roles: ['MAINTENANCE']
      }));

      TestBed.runInInjectionContext(() => {
        const result = roleBasedGuard(mockRoute, mockState);
        
        if (result instanceof Observable) {
          result.subscribe(canActivate => {
            expect(canActivate).toBe(true);
            done();
          });
        }
      });
    });

    it('should allow access when no roles are required', (done) => {
      configStateService.getOne$.and.returnValue(of({
        roles: []
      }));

      TestBed.runInInjectionContext(() => {
        const result = roleBasedGuard(mockRoute, mockState);
        
        if (result instanceof Observable) {
          result.subscribe(canActivate => {
            expect(canActivate).toBe(true);
            done();
          });
        }
      });
    });
  });

  describe('requireRoles', () => {
    it('should create a guard that checks for specific roles', (done) => {
      const guard = requireRoles(['sales', 'manager']);
      
      configStateService.getOne$.and.returnValue(of({
        roles: ['Sales']
      }));

      TestBed.runInInjectionContext(() => {
        const result = guard(mockRoute, mockState);
        
        if (result instanceof Observable) {
          result.subscribe(canActivate => {
            expect(canActivate).toBe(true);
            done();
          });
        }
      });
    });

    it('should deny access when user lacks all required roles', (done) => {
      const guard = requireRoles(['sales', 'manager']);
      
      configStateService.getOne$.and.returnValue(of({
        roles: ['Maintenance']
      }));
      
      const mockUrlTree = {} as any;
      router.createUrlTree.and.returnValue(mockUrlTree);

      TestBed.runInInjectionContext(() => {
        const result = guard(mockRoute, mockState);
        
        if (result instanceof Observable) {
          result.subscribe(canActivate => {
            expect(canActivate).toBe(mockUrlTree);
            done();
          });
        }
      });
    });
  });

  describe('Specific role guards', () => {
    it('adminGuard should only allow admin users', (done) => {
      configStateService.getOne$.and.returnValue(of({
        roles: ['Admin']
      }));

      TestBed.runInInjectionContext(() => {
        const result = adminGuard(mockRoute, mockState);
        
        if (result instanceof Observable) {
          result.subscribe(canActivate => {
            expect(canActivate).toBe(true);
            done();
          });
        }
      });
    });

    it('maintenanceGuard should allow maintenance roles', (done) => {
      configStateService.getOne$.and.returnValue(of({
        roles: ['Maintenance']
      }));

      TestBed.runInInjectionContext(() => {
        const result = maintenanceGuard(mockRoute, mockState);
        
        if (result instanceof Observable) {
          result.subscribe(canActivate => {
            expect(canActivate).toBe(true);
            done();
          });
        }
      });
    });

    it('salesGuard should allow sales roles', (done) => {
      configStateService.getOne$.and.returnValue(of({
        roles: ['Sales']
      }));

      TestBed.runInInjectionContext(() => {
        const result = salesGuard(mockRoute, mockState);
        
        if (result instanceof Observable) {
          result.subscribe(canActivate => {
            expect(canActivate).toBe(true);
            done();
          });
        }
      });
    });
  });

  describe('Multiple roles', () => {
    it('should allow access when user has multiple matching roles', (done) => {
      mockRoute.data = { requiredRoles: ['sales', 'maintenance'] };
      configStateService.getOne$.and.returnValue(of({
        roles: ['Sales', 'Maintenance', 'Support']
      }));

      TestBed.runInInjectionContext(() => {
        const result = roleBasedGuard(mockRoute, mockState);
        
        if (result instanceof Observable) {
          result.subscribe(canActivate => {
            expect(canActivate).toBe(true);
            done();
          });
        }
      });
    });

    it('should allow access when user has at least one required role', (done) => {
      mockRoute.data = { requiredRoles: ['sales', 'maintenance'] };
      configStateService.getOne$.and.returnValue(of({
        roles: ['Maintenance']
      }));

      TestBed.runInInjectionContext(() => {
        const result = roleBasedGuard(mockRoute, mockState);
        
        if (result instanceof Observable) {
          result.subscribe(canActivate => {
            expect(canActivate).toBe(true);
            done();
          });
        }
      });
    });
  });

  describe('Error handling', () => {
    it('should handle null user gracefully', (done) => {
      configStateService.getOne$.and.returnValue(of(null));

      TestBed.runInInjectionContext(() => {
        const result = roleBasedGuard(mockRoute, mockState);
        
        if (result instanceof Observable) {
          result.subscribe(canActivate => {
            expect(canActivate).toBe(true); // No roles required, should allow
            done();
          });
        }
      });
    });

    it('should handle undefined roles array', (done) => {
      configStateService.getOne$.and.returnValue(of({ roles: undefined }));

      TestBed.runInInjectionContext(() => {
        const result = roleBasedGuard(mockRoute, mockState);
        
        if (result instanceof Observable) {
          result.subscribe(canActivate => {
            expect(canActivate).toBe(true); // No roles required, should allow
            done();
          });
        }
      });
    });
  });
});
