import { Directive, Input, TemplateRef, ViewContainerRef, inject, OnDestroy, OnInit } from '@angular/core';
import { ConfigStateService } from '@abp/ng.core';
import { Subject, takeUntil } from 'rxjs';

/**
 * Structural directive for role-based visibility
 * Usage: <div *hasRole="'admin'">Admin content</div>
 *        <div *hasRole="['sales', 'manager']">Sales or Manager content</div>
 */
@Directive({
  selector: '[hasRole]',
  standalone: true
})
export class HasRoleDirective implements OnInit, OnDestroy {
  private configState = inject(ConfigStateService);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private destroy$ = new Subject<void>();
  
  @Input() hasRole: string | string[] = [];
  @Input() hasRoleElse?: TemplateRef<any>;
  
  ngOnInit(): void {
    this.configState.getOne$('currentUser')
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        const userRoles = user?.roles || [];
        const requiredRoles = Array.isArray(this.hasRole) ? this.hasRole : [this.hasRole];
        
        const hasAccess = this.checkAccess(userRoles, requiredRoles);
        
        this.viewContainer.clear();
        
        if (hasAccess) {
          this.viewContainer.createEmbeddedView(this.templateRef);
        } else if (this.hasRoleElse) {
          this.viewContainer.createEmbeddedView(this.hasRoleElse);
        }
      });
  }
  
  private checkAccess(userRoles: string[], requiredRoles: string[]): boolean {
    // Admin always has access
    if (userRoles.some(role => role.toLowerCase().includes('admin'))) {
      return true;
    }
    
    // Check if user has any of the required roles
    return requiredRoles.some(required =>
      userRoles.some(userRole =>
        userRole.toLowerCase().includes(required.toLowerCase())
      )
    );
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
