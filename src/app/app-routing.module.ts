import { authGuard, permissionGuard } from '@abp/ng.core';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { 
  maintenanceGuard, 
  salesGuard, 
  customerServiceGuard, 
  adminGuard,
  roleBasedGuard
} from './core/guards/role-based.guard';
import { tenantGuard, tenantAdminGuard } from './core/guards/tenant.guard';
import { ROUTE_DATA_CONFIG } from './core/guards/route-guard.config';

const routes: Routes = [
  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/components/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: '',
    pathMatch: 'full',
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule),
    canActivate: [authGuard]
  },
  {
    path: 'account',
    loadChildren: () => import('@abp/ng.account').then(m => m.AccountModule.forLazy()),
  },
  {
    path: 'identity',
    loadChildren: () => import('@abp/ng.identity').then(m => m.IdentityModule.forLazy()),
    canActivate: [authGuard, adminGuard],
    data: { menuName: '::Menu:Identity', requiredRoles: ['admin'] }
  },
  {
    path: 'tenant-management',
    loadChildren: () =>
      import('@abp/ng.tenant-management').then(m => m.TenantManagementModule.forLazy()),
    canActivate: [authGuard, adminGuard],
    data: { menuName: '::Menu:TenantManagement', requiredRoles: ['admin'] }
  },
  {
    path: 'setting-management',
    loadChildren: () =>
      import('@abp/ng.setting-management').then(m => m.SettingManagementModule.forLazy()),
    canActivate: [authGuard, adminGuard],
    data: { menuName: '::Menu:SettingManagement', requiredRoles: ['admin'] }
  },
  {
    path : 'users',
    loadChildren:() => import('./users/users.module').then(m => m.UsersModule),
    canActivate : [authGuard, adminGuard],
    data: ROUTE_DATA_CONFIG['users']
  },
  {
    path: 'shops',
    loadChildren: () => import('./shops/shops.module').then(m => m.ShopsModule),
    canActivate: [authGuard, tenantGuard, adminGuard],
    data: { ...ROUTE_DATA_CONFIG['shops'], isTenant: false }
  },
  // HOST Admin Routes
  {
    path: 'host',
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./host/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard, tenantGuard, adminGuard],
        data: { menuName: '::Menu:HostDashboard', isTenant: false }
      },
      {
        path: 'promo-codes',
        loadComponent: () => import('./host/promo-codes/promo-codes.component').then(m => m.PromoCodesComponent),
        canActivate: [authGuard, tenantGuard, adminGuard],
        data: { menuName: '::Menu:PromoCodes', isTenant: false }
      },
      {
        path: 'addresses',
        loadComponent: () => import('./host/addresses/addresses.component').then(m => m.AddressesComponent),
        canActivate: [authGuard, tenantGuard, adminGuard],
        data: { menuName: '::Menu:Addresses', isTenant: false }
      },
      {
        path: 'payments',
        loadComponent: () => import('./host/payments/payments.component').then(m => m.PaymentsComponent),
        canActivate: [authGuard, tenantGuard, adminGuard],
        data: { menuName: '::Menu:Payments', isTenant: false }
      }
    ]
  },
  // Tenant Admin Routes
  {
    path: 'tenant',
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./tenant/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard, tenantGuard, adminGuard],
        data: { menuName: '::Menu:TenantDashboard', isTenant: true }
      },
      {
        path: 'categories',
        loadChildren: () => import('./tenant/categories/categories.module').then(m => m.CategoriesModule),
        canActivate: [authGuard, tenantGuard, adminGuard],
        data: { menuName: '::Menu:Categories', isTenant: true }
      },
      {
        path: 'products',
        loadChildren: () => import('./tenant/products/products.module').then(m => m.ProductsModule),
        canActivate: [authGuard, tenantGuard, adminGuard],
        data: { menuName: '::Menu:Products', isTenant: true }
      },
      {
        path: 'orders',
        loadComponent: () => import('./tenant/orders/orders.component').then(m => m.OrdersComponent),
        canActivate: [authGuard, tenantGuard, adminGuard],
        data: { menuName: '::Menu:TenantOrders', isTenant: true }
      },
      {
        path: 'customers',
        loadComponent: () => import('./tenant/customers/customers.component').then(m => m.CustomersComponent),
        canActivate: [authGuard, tenantGuard, adminGuard],
        data: { menuName: '::Menu:TenantCustomers', isTenant: true }
      },
      {
        path: 'settings',
        loadComponent: () => import('./tenant/settings/settings.component').then(m => m.SettingsComponent),
        canActivate: [authGuard, tenantGuard, adminGuard],
        data: { menuName: '::Menu:TenantSettings', isTenant: true }
      }
    ]
  },
  {
    path: 'change-password',
    loadComponent: () => import('./shared/components/change-password/change-password.component').then(m => m.ChangePasswordComponent),
    canActivate: [authGuard]
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule],
})
export class AppRoutingModule {}
