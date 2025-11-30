import { TestBed } from '@angular/core/testing';
import { ConfigStateService, TreeNode, ABP } from '@abp/ng.core';
import { of } from 'rxjs';
import { RoleBasedRouteService } from './role-based-route.service';

describe('RoleBasedRouteService', () => {
  let service: RoleBasedRouteService;
  let configStateService: jasmine.SpyObj<ConfigStateService>;

  const mockRoutes: TreeNode<ABP.Route>[] = [
    {
      name: '::Menu:maintenance-requests',
      path: '/maintenance-requests',
      children: [
        {
          name: '::Menu:maintenance-requests-list',
          path: '/maintenance-requests-list'
        },
        {
          name: '::Menu:maintenance-requests-scheduled',
          path: '/maintenance-requests/scheduled'
        }
      ]
    },
    {
      name: '::Menu:orders',
      path: '/orders'
    },
    {
      name: '::Menu:Catalog',
      path: '/',
      children: [
        {
          name: '::Menu:Categories',
          path: '/categories'
        },
        {
          name: '::Menu:Products',
          path: '/products'
        }
      ]
    },
    {
      name: '::Menu:Customers',
      path: '/customers'
    },
    {
      name: '::Menu:user',
      path: '/users'
    }
  ];

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ConfigStateService', ['getOne$']);
    
    TestBed.configureTestingModule({
      providers: [
        RoleBasedRouteService,
        { provide: ConfigStateService, useValue: spy }
      ]
    });
    
    service = TestBed.inject(RoleBasedRouteService);
    configStateService = TestBed.inject(ConfigStateService) as jasmine.SpyObj<ConfigStateService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Role-based filtering', () => {
    it('should show all routes for admin users', (done) => {
      configStateService.getOne$.and.returnValue(of({
        roles: ['Admin']
      }));

      service.filterRoutesByRoles(mockRoutes).subscribe(filtered => {
        expect(filtered.length).toBe(mockRoutes.length);
        expect(filtered).toEqual(mockRoutes);
        done();
      });
    });

    it('should filter routes for maintenance role', (done) => {
      configStateService.getOne$.and.returnValue(of({
        roles: ['Maintenance']
      }));

      service.filterRoutesByRoles(mockRoutes).subscribe(filtered => {
        const routeNames = filtered.map(r => r.name);
        expect(routeNames).toContain('::Menu:maintenance-requests');
        expect(routeNames).toContain('::Menu:Customers');
        expect(routeNames).not.toContain('::Menu:orders');
        expect(routeNames).not.toContain('::Menu:Catalog');
        done();
      });
    });

    it('should filter routes for sales role', (done) => {
      configStateService.getOne$.and.returnValue(of({
        roles: ['Sales']
      }));

      service.filterRoutesByRoles(mockRoutes).subscribe(filtered => {
        const routeNames = filtered.map(r => r.name);
        expect(routeNames).toContain('::Menu:orders');
        expect(routeNames).toContain('::Menu:Catalog');
        expect(routeNames).toContain('::Menu:Customers');
        expect(routeNames).not.toContain('::Menu:maintenance-requests');
        done();
      });
    });

    it('should combine access for multiple roles', (done) => {
      configStateService.getOne$.and.returnValue(of({
        roles: ['Sales', 'Maintenance']
      }));

      service.filterRoutesByRoles(mockRoutes).subscribe(filtered => {
        const routeNames = filtered.map(r => r.name);
        expect(routeNames).toContain('::Menu:maintenance-requests');
        expect(routeNames).toContain('::Menu:orders');
        expect(routeNames).toContain('::Menu:Catalog');
        expect(routeNames).toContain('::Menu:Customers');
        done();
      });
    });

    it('should handle empty roles array', (done) => {
      configStateService.getOne$.and.returnValue(of({
        roles: []
      }));

      service.filterRoutesByRoles(mockRoutes).subscribe(filtered => {
        // Should only show routes without configuration
        expect(filtered.length).toBeGreaterThan(0);
        done();
      });
    });

    it('should handle null user', (done) => {
      configStateService.getOne$.and.returnValue(of(null));

      service.filterRoutesByRoles(mockRoutes).subscribe(filtered => {
        expect(filtered.length).toBeGreaterThan(0);
        done();
      });
    });

    it('should preserve route hierarchy', (done) => {
      configStateService.getOne$.and.returnValue(of({
        roles: ['Maintenance']
      }));

      service.filterRoutesByRoles(mockRoutes).subscribe(filtered => {
        const maintenanceRoute = filtered.find(r => r.name === '::Menu:maintenance-requests');
        expect(maintenanceRoute?.children?.length).toBe(2);
        expect(maintenanceRoute?.children?.[0].name).toBe('::Menu:maintenance-requests-list');
        done();
      });
    });
  });

  describe('Configuration management', () => {
    it('should add new route configuration', () => {
      const initialLength = service.getRouteRoleConfigs().length;
      
      service.addRouteRoleConfig({
        routeNamePatterns: ['::Menu:test'],
        requiredRolePatterns: ['test-role']
      });
      
      const configs = service.getRouteRoleConfigs();
      expect(configs.length).toBe(initialLength + 1);
      expect(configs[configs.length - 1].routeNamePatterns).toContain('::Menu:test');
    });

    it('should update existing configuration', () => {
      const newConfig = {
        routeNamePatterns: ['::Menu:updated'],
        requiredRolePatterns: ['updated-role']
      };
      
      service.updateRouteRoleConfig(0, newConfig);
      
      const configs = service.getRouteRoleConfigs();
      expect(configs[0]).toEqual(newConfig);
    });

    it('should reset configurations', () => {
      const newConfigs = [
        {
          routeNamePatterns: ['::Menu:new1'],
          requiredRolePatterns: ['role1']
        },
        {
          routeNamePatterns: ['::Menu:new2'],
          requiredRolePatterns: ['role2']
        }
      ];
      
      service.resetConfigs(newConfigs);
      
      const configs = service.getRouteRoleConfigs();
      expect(configs).toEqual(newConfigs);
    });
  });

  describe('Role matching', () => {
    it('should match case-insensitive role patterns', (done) => {
      configStateService.getOne$.and.returnValue(of({
        roles: ['MAINTENANCE']
      }));

      service.filterRoutesByRoles(mockRoutes).subscribe(filtered => {
        const routeNames = filtered.map(r => r.name);
        expect(routeNames).toContain('::Menu:maintenance-requests');
        done();
      });
    });

    it('should match partial role names', (done) => {
      configStateService.getOne$.and.returnValue(of({
        roles: ['MaintenanceManager']
      }));

      service.filterRoutesByRoles(mockRoutes).subscribe(filtered => {
        const routeNames = filtered.map(r => r.name);
        expect(routeNames).toContain('::Menu:maintenance-requests');
        done();
      });
    });

    it('should recognize admin variations', (done) => {
      const adminVariations = ['administrator', 'Admin', 'ADMIN', 'SystemAdmin'];
      
      adminVariations.forEach(role => {
        configStateService.getOne$.and.returnValue(of({
          roles: [role]
        }));

        service.filterRoutesByRoles(mockRoutes).subscribe(filtered => {
          expect(filtered.length).toBe(mockRoutes.length);
        });
      });
      
      done();
    });
  });
});
