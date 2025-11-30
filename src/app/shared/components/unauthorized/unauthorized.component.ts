import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { ConfigStateService, CoreModule } from '@abp/ng.core';
import { Observable, map } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [
    CommonModule,
    CoreModule,
    ButtonModule,
    CardModule,
    MessageModule,
    TagModule
  ],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  template: `
    <div class="unauthorized-container flex items-center justify-center min-h-screen">
      <div @fadeIn class="w-full max-w-2xl px-4">
        <!-- Friendly Icon and Title -->
        <div class="text-center mb-8">
          <div class="relative inline-flex items-center justify-center">
            <div class="absolute inset-0 rounded-full blur-2xl opacity-30 animate-pulse unauthorized-icon-glow"></div>
            <div class="relative rounded-full p-8 unauthorized-icon-bg">
              <i class="pi pi-shield text-6xl text-primary"></i>
            </div>
          </div>
          
          <h1 class="text-3xl font-bold mt-6 text-color">
            {{ 'AbpAccount::403Message' | abpLocalization }}
          </h1>
          
          <p class="text-lg text-color-secondary mt-2">
            {{ 'AbpAccount::DefaultErrorMessage403' | abpLocalization }}
          </p>
        </div>

        <!-- Main Card -->
        <p-card styleClass="unauthorized-card shadow-xl border-0">
          <div class="space-y-6">
            <!-- Friendly Message -->
            <div class="surface-100 rounded-lg p-4">
              <div class="flex items-start gap-3">
                <i class="pi pi-info-circle text-2xl text-blue-500 mt-1"></i>
                <div class="flex-1">
                  <p class="text-color">
                    {{ 'AbpAccount::DefaultErrorMessage403Detail' | abpLocalization }}
                  </p>
                  <p class="text-sm text-color-secondary mt-2" *ngIf="attemptedUrl">
                    <span class="font-medium">{{ 'AbpUi::PagerSearch' | abpLocalization }}:</span>
                    <code class="ml-2 px-2 py-1 surface-200 rounded text-xs">{{ attemptedUrl }}</code>
                  </p>
                </div>
              </div>
            </div>

            <!-- User Roles Section -->
            <div *ngIf="currentUserRoles$ | async as roles" class="space-y-3">
              <div class="flex items-center gap-2">
                <i class="pi pi-user text-color-secondary"></i>
                <span class="text-sm font-medium text-color">
                  {{ 'AbpIdentity::Roles' | abpLocalization }}
                </span>
              </div>
              <div class="flex flex-wrap gap-2">
                <p-tag 
                  *ngFor="let role of roles" 
                  [value]="('::Role:' + role) | abpLocalization" 
                  severity="info"
                  styleClass="px-3 py-1">
                </p-tag>
                <p-tag 
                  *ngIf="roles.length === 0" 
                  [value]="'AbpUi::NoDataAvailableInDatatable' | abpLocalization"
                  severity="secondary"
                  styleClass="px-3 py-1">
                </p-tag>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <ng-template pTemplate="footer">
            <div class="flex justify-center gap-3 pt-2">
              <p-button 
                [label]="'AbpUi::Back' | abpLocalization"
                icon="pi pi-arrow-left"
                severity="secondary"
                styleClass="px-6"
                (onClick)="goBack()">
              </p-button>
              
              <p-button 
                [label]="'::Menu:Home' | abpLocalization"
                icon="pi pi-home"
                styleClass="px-6"
                (onClick)="goHome()">
              </p-button>
            </div>
          </ng-template>
        </p-card>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    
    /* Container background adapts to theme */
    .unauthorized-container {
      background: linear-gradient(135deg, 
        var(--primary-50) 0%, 
        var(--primary-100) 100%);
    }
    
    /* Icon glow effect */
    .unauthorized-icon-glow {
      background: var(--primary-200);
    }
    
    /* Icon background */
    .unauthorized-icon-bg {
      background: linear-gradient(135deg,
        var(--primary-50),
        var(--primary-100));
      border: 1px solid var(--primary-200);
    }
    
    /* Card styling with theme support */
    ::ng-deep .unauthorized-card {
      background: var(--surface-card);
      backdrop-filter: blur(10px);
      border-radius: var(--border-radius);
      border: 1px solid var(--surface-border);
    }
    
    ::ng-deep .unauthorized-card .p-card-content {
      padding: 2rem;
    }
    
    ::ng-deep .unauthorized-card .p-card-footer {
      background: var(--surface-50);
      border-top: 1px solid var(--surface-border);
    }
    
    /* Surface colors for info boxes */
    .surface-100 {
      background-color: var(--surface-100);
      border: 1px solid var(--surface-200);
    }
    
    .surface-200 {
      background-color: var(--surface-200);
    }
    
    /* Text colors */
    .text-color {
      color: var(--text-color);
    }
    
    .text-color-secondary {
      color: var(--text-color-secondary);
    }
    
    .text-primary {
      color: var(--primary-color);
    }
    
    /* Tag styling */
    ::ng-deep .p-tag {
      font-weight: 500;
    }
    
    /* Button hover effects */
    ::ng-deep .p-button:hover {
      transform: translateY(-2px);
      transition: all 0.2s ease;
    }
    
    /* Responsive adjustments */
    @media (max-width: 640px) {
      ::ng-deep .unauthorized-card .p-card-content {
        padding: 1.5rem;
      }
    }
  `]
})
export class UnauthorizedComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private configState = inject(ConfigStateService);
  
  attemptedUrl: string = '';
  requiredRoles: string[] = [];
  currentUserRoles$: Observable<string[]>;
  
  constructor() {
    this.currentUserRoles$ = this.configState.getOne$('currentUser').pipe(
      map(user => user?.roles || [])
    );
  }
  
  ngOnInit(): void {
    // Get the URL that was attempted
    this.route.queryParams.subscribe(params => {
      this.attemptedUrl = params['returnUrl'] || '';
      
      if (params['requiredRoles']) {
        this.requiredRoles = params['requiredRoles'].split(',');
      }
    });
  }
  
  goBack(): void {
    window.history.back();
  }
  
  goHome(): void {
    this.router.navigate(['/']);
  }
  
  // Removed contact admin functionality to simplify actions
}
