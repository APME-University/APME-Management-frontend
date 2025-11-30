# Route Guards Documentation

## Overview
This system provides comprehensive route protection based on user roles, preventing unauthorized access to protected routes.

## Architecture

### Core Components

1. **Role-Based Guard** (`/core/guards/role-based.guard.ts`)
   - Main guard function for role-based access control
   - Helper functions for creating specific role guards
   - Pre-configured guards for common scenarios

2. **Guard Configuration** (`/core/guards/route-guard.config.ts`)
   - Centralized mapping of routes to guards
   - Route data configuration for menu mapping
   - Easy to extend and maintain

3. **Unauthorized Component** (`/shared/components/unauthorized/`)
   - User-friendly unauthorized access page
   - Shows required roles and current user roles
   - Provides navigation options

## How Guards Work

### Guard Flow
1. User attempts to navigate to a route
2. Guard checks user's roles from `ConfigStateService`
3. Guard compares with required roles
4. If authorized: Navigation proceeds
5. If unauthorized: Redirects to `/unauthorized` page

### Role Matching Rules
- **Admin Override**: Admin users bypass all checks
- **Case-Insensitive**: Role matching ignores case
- **Partial Matching**: "maintenance" matches "MaintenanceManager"
- **Any Role**: User needs at least ONE of the required roles
- **All Roles**: Special guard for requiring ALL roles

## Implementation

### Applied Guards

```typescript
// Maintenance Routes
'maintenance-requests': maintenanceGuard
'maintenance-requests-list': maintenanceGuard
'diagnoses': maintenanceGuard

// Sales Routes
'orders': salesGuard
'categories': salesGuard
'products': salesGuard

// Customer Service Routes
'customers': customerServiceGuard
'complaints': customerServiceGuard
'common-issues': customerServiceGuard

// Admin-Only Routes
'users': adminGuard
'technicians': adminGuard  // Admin-only access
'identity': adminGuard
'tenant-management': adminGuard
'setting-management': adminGuard
```

## Usage Examples

### Basic Guard Usage
```typescript
{
  path: 'admin-panel',
  component: AdminComponent,
  canActivate: [authGuard, adminGuard]
}
```

### Custom Role Guard
```typescript
{
  path: 'special-feature',
  component: SpecialComponent,
  canActivate: [authGuard, requireRoles(['special-role', 'manager'])]
}
```

### Guard with Route Data
```typescript
{
  path: 'protected-route',
  component: ProtectedComponent,
  canActivate: [authGuard, roleBasedGuard],
  data: {
    menuName: '::Menu:Protected',
    requiredRoles: ['role1', 'role2']
  }
}
```

### Require All Roles
```typescript
{
  path: 'super-protected',
  component: SuperProtectedComponent,
  canActivate: [authGuard, requireAllRoles(['manager', 'finance'])]
}
```

## Creating Custom Guards

### Simple Role Guard
```typescript
export const customGuard: CanActivateFn = requireRoles(['custom-role']);
```

### Complex Guard Logic
```typescript
export const complexGuard: CanActivateFn = (route, state) => {
  const configState = inject(ConfigStateService);
  const router = inject(Router);
  
  return configState.getOne$('currentUser').pipe(
    map(user => {
      // Custom logic here
      if (customCondition(user)) {
        return true;
      }
      return router.createUrlTree(['/unauthorized']);
    })
  );
};
```

## Unauthorized Access Handling

When access is denied, users are redirected to `/unauthorized` with:
- **returnUrl**: The attempted URL
- **reason**: Why access was denied
- **requiredRoles**: Roles needed for access

The unauthorized page shows:
- Clear access denied message
- User's current roles
- Required roles for the route
- Navigation options (Go Back, Home, Contact Admin)

## Testing Guards

### Unit Testing
```typescript
describe('CustomGuard', () => {
  it('should allow access with correct role', (done) => {
    configStateService.getOne$.and.returnValue(of({
      roles: ['RequiredRole']
    }));
    
    TestBed.runInInjectionContext(() => {
      const result = customGuard(mockRoute, mockState);
      result.subscribe(canActivate => {
        expect(canActivate).toBe(true);
        done();
      });
    });
  });
});
```

### Manual Testing
1. **Test with different roles**:
   - Login as Sales user → Try accessing maintenance routes
   - Login as Maintenance user → Try accessing sales routes
   - Login as Admin → Verify all routes accessible

2. **Test unauthorized redirect**:
   - Navigate directly to protected URL
   - Verify redirect to unauthorized page
   - Check query parameters are correct

3. **Test navigation from unauthorized page**:
   - Use "Go Back" button
   - Use "Go Home" button
   - Test "Contact Admin" functionality

## Security Considerations

1. **Client-Side Only**: Guards are client-side protection
2. **Backend Validation**: Always validate on backend APIs
3. **Role Changes**: Guards check roles on each navigation
4. **Token Expiry**: Combine with auth guards
5. **Deep Linking**: Protected routes redirect when accessed directly

## Troubleshooting

### Routes Not Protected
- Check guard is added to route configuration
- Verify guard is imported correctly
- Check route data configuration

### Always Denied Access
- Verify user roles in ConfigStateService
- Check role name spelling and case
- Confirm required roles configuration

### Redirect Loop
- Check unauthorized route isn't protected
- Verify guard logic doesn't create loops
- Check returnUrl handling

## Best Practices

1. **Always combine with authGuard**: Ensure user is authenticated first
2. **Use specific guards**: Create named guards for clarity
3. **Document requirements**: Add comments about required roles
4. **Test thoroughly**: Test all role combinations
5. **Handle edge cases**: Null users, empty roles, etc.

## Migration Guide

### Adding Guards to Existing Routes
1. Import necessary guards
2. Add to canActivate array
3. Add route data if needed
4. Test the route protection

### Example Migration
```typescript
// Before
{
  path: 'orders',
  loadChildren: () => import('./orders/orders.module'),
  canActivate: [authGuard]
}

// After
{
  path: 'orders',
  loadChildren: () => import('./orders/orders.module'),
  canActivate: [authGuard, salesGuard],
  data: ROUTE_DATA_CONFIG['orders']
}
```

## API Reference

### Guards
- `roleBasedGuard`: Main configurable guard
- `adminGuard`: Admin-only access
- `maintenanceGuard`: Maintenance team access
- `salesGuard`: Sales team access
- `customerServiceGuard`: Customer service access

### Functions
- `requireRoles(roles: string[])`: Create guard for specific roles
- `requireAllRoles(roles: string[])`: Require all specified roles
- `getGuardForRoute(path: string)`: Get guard for a route path
- `getRouteData(path: string)`: Get route data configuration
