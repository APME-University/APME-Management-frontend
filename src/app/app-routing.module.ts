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
