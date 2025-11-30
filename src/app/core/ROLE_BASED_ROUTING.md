# Role-Based Routing System

## Overview
This system provides dynamic, maintainable role-based route visibility in the Angular application. Routes are automatically filtered based on the current user's roles without hardcoding logic.

## Architecture

### Core Components

1. **RoleBasedRouteService** (`/shared/services/role-based-route.service.ts`)
   - Central service for role-based filtering
   - Handles role matching and route filtering logic
   - Provides observable streams for reactive updates

2. **Route Role Configuration** (`/core/route-role.config.ts`)
   - Centralized configuration file
   - Maps routes to required roles
   - Easily extendable without code changes

3. **Menu Component Integration** (`/shared/components/hafez-menu/`)
   - Automatically subscribes to filtered routes
   - Updates menu dynamically based on user roles

## How It Works

### Role Matching Rules
- **Admin Override**: Users with roles containing "admin" see all routes
- **Pattern Matching**: Role names are matched using case-insensitive partial matching
- **Multiple Roles**: Users can have multiple roles; any matching role grants access
- **Default Visibility**: Routes without configuration are visible to all users

### Configuration Structure
```typescript
{
  routeNamePatterns: string[],      // Route names to control
  requiredRolePatterns: string[],   // Role patterns that can access
  isExclusive?: boolean             // Optional exclusive access flag
}
```

## Usage Examples

### Adding New Route Configurations

```typescript
// In route-role.config.ts
import { addCustomRouteConfig } from './route-role.config';

// Add configuration for new feature
addCustomRouteConfig({
  routeNamePatterns: [
    '::Menu:reports',
    '::Menu:analytics'
  ],
  requiredRolePatterns: [
    'manager',
    'analyst'
  ]
});
```

### Programmatic Configuration

```typescript
// In any service or component
import { RoleBasedRouteService } from '@shared/services/role-based-route.service';

constructor(private roleService: RoleBasedRouteService) {
  // Add dynamic configuration
  this.roleService.addRouteRoleConfig({
    routeNamePatterns: ['::Menu:special-feature'],
    requiredRolePatterns: ['special-access']
  });
}
```

### Debugging Route Visibility

```typescript
// Check current user roles
this.roleService.getCurrentUserRoles().subscribe(roles => {
  console.log('Current roles:', roles);
});

// View all configurations
const configs = this.roleService.getRouteRoleConfigs();
console.log('Route configurations:', configs);
```

## Role Examples

### Scenario 1: User with "Sales" role
- **Visible Routes**:
  - Orders
  - Catalog (and children: Categories, Products)
  - Customers
  - Complaints
  - Common Issues

### Scenario 2: User with "Maintenance" role
- **Visible Routes**:
  - Maintenance Requests (and children)
  - Diagnosis
  - Technicians
  - Customers
  - Complaints
  - Common Issues

### Scenario 3: User with "Admin" role
- **Visible Routes**: All routes

### Scenario 4: User with multiple roles ["Sales", "Maintenance"]
- **Visible Routes**: Combined access from both roles

## Extending the System

### 1. Add New Role Pattern
Edit `route-role.config.ts`:
```typescript
{
  routeNamePatterns: ['::Menu:new-feature'],
  requiredRolePatterns: ['new-role', 'NewRole']
}
```

### 2. Create Role-Based Components
```typescript
@Component({
  template: `
    <div *ngIf="hasAccess$ | async">
      <!-- Protected content -->
    </div>
  `
})
export class ProtectedComponent {
  hasAccess$ = this.roleService.getCurrentUserRoles().pipe(
    map(roles => roles.some(r => r.includes('required-role')))
  );
  
  constructor(private roleService: RoleBasedRouteService) {}
}
```

### 3. Custom Filtering Logic
```typescript
// Override shouldShowRoute method for custom logic
class CustomRoleService extends RoleBasedRouteService {
  protected shouldShowRoute(routeName: string, roles: string[]): boolean {
    // Custom logic here
    return super.shouldShowRoute(routeName, roles);
  }
}
```

## Testing

### Unit Testing
```typescript
describe('RoleBasedRouteService', () => {
  it('should filter routes for maintenance role', () => {
    const routes = [/* test routes */];
    const roles = ['Maintenance'];
    
    service.filterRoutesByRoles(routes).subscribe(filtered => {
      expect(filtered).toContain(/* maintenance routes */);
      expect(filtered).not.toContain(/* sales-only routes */);
    });
  });
});
```

### Manual Testing
1. Login with different role accounts
2. Check menu visibility
3. Verify route access permissions
4. Test role combinations

## Troubleshooting

### Routes Not Showing
1. Check role configuration in `route-role.config.ts`
2. Verify user roles in browser console
3. Check route name spelling
4. Ensure ConfigStateService is properly initialized

### All Routes Visible
- Check if user has admin role
- Verify configuration is loaded
- Check if route has no configuration (defaults to visible)

## Best Practices

1. **Use Consistent Naming**: Keep route names and role patterns consistent
2. **Document Changes**: Update this documentation when adding new configurations
3. **Test Thoroughly**: Test with various role combinations
4. **Avoid Hardcoding**: Use configuration file instead of inline logic
5. **Performance**: The filtering is reactive and efficient, but avoid excessive subscriptions

## Migration Guide

### From Static Routes to Role-Based
1. Identify routes that need role-based access
2. Add configuration to `route-role.config.ts`
3. Test with different user roles
4. Remove any hardcoded role checks

## Support

For questions or issues:
1. Check this documentation
2. Review the source code comments
3. Check browser console for debugging information
4. Contact the development team
