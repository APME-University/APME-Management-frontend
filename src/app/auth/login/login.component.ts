import { Component, inject, OnInit } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { AutoFocusModule } from 'primeng/autofocus';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { DarkModeSwitcherComponent } from 'src/app/shared/components/dark-mode-switcher/dark-mode-switcher.component';
import { AuthService, CoreModule, LocalizationService, SessionStateService, ConfigStateService } from '@abp/ng.core';
import { Router } from '@angular/router';
import { AbpTenantService } from '../../proxy/abp-tenant';
import { setTenantId, clearTenantId } from '../../core/interceptors/tenant.interceptor';
@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    MessageModule,
    CardModule,
    ButtonModule,
    PasswordModule,
    InputTextModule,
    SelectModule,
    AutoFocusModule,
    ToastModule,
    CoreModule
  ],
  standalone : true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers:[
    MessageService
  ]
})
export class LoginComponent implements OnInit {
  isLoading: boolean = false;
  isDark: boolean = false;
  messageService = inject(MessageService);
  UnReadMessageService = inject(MessageService);
  authService = inject(AuthService);
  localization = inject(LocalizationService);
  readonly _router = inject(Router);
  tenantService = inject(AbpTenantService);
  sessionStateService = inject(SessionStateService);
  configState = inject(ConfigStateService);
  isInvalidLogin: boolean = false;
  tenantNotFound: boolean = false;
  tenantNameError: string = '';

  ngOnInit(): void {
    // Clear any existing tenant context on login page load
    clearTenantId();
  }

  onSubmit(loginForm: NgForm): void {
    this.isLoading = true;
    this.isInvalidLogin = false;
    this.tenantNotFound = false;
    this.tenantNameError = '';

    const { tenantName, username, password } = loginForm.value;
    
    // Determine redirect URL based on tenant context (like athletes-hub)
    const redirectUrl = tenantName?.trim() ? 'tenant/dashboard' : 'host/dashboard';

    // Clear tenant context first
    this.sessionStateService.setTenant(null);
    clearTenantId();

    // If tenant name is provided, resolve tenant first
    if (tenantName && tenantName.trim()) {
      this.tenantService.findTenantByName(tenantName.trim()).subscribe({
        next: (result) => {
          if (result.success && result.tenantId) {
            // Set tenant context using SessionStateService (like athletes-hub)
            this.sessionStateService.setTenant({
              isAvailable: true,
              id: result.tenantId,
              name: result.name || tenantName.trim(),
            });
            // Refresh app state after setting tenant (like athletes-hub)
            this.configState.refreshAppState();
            // Set tenant ID for interceptor
            setTenantId(result.tenantId);
            // Proceed with login using redirectUrl
            this.performLogin(username, password, redirectUrl);
          } else {
            // Tenant not found
            this.tenantNotFound = true;
            this.tenantNameError = `Tenant '${tenantName.trim()}' not found. Please check the tenant name.`;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: this.tenantNameError,
            });
            this.isLoading = false;
          }
        },
        error: (error) => {
          this.tenantNotFound = true;
          this.tenantNameError = 'Unable to verify tenant. Please try again.';
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: this.tenantNameError,
          });
          this.isLoading = false;
        }
      });
    } else {
      // No tenant name provided, login to HOST
      clearTenantId();
      this.performLogin(username, password, redirectUrl);
    }
  }

  private performLogin(username: string, password: string, redirectUrl: string): void {
    // Use redirectUrl in login params (like athletes-hub)
    this.authService.login({
      username: username,
      password: password,
      redirectUrl: redirectUrl,
    }).subscribe({
      next: (response) => {
        this.isInvalidLogin = false;
        this.isLoading = false;
        // ABP will handle the redirect automatically via redirectUrl
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.localization.instant('Somethingwentwrong!') || 'Invalid username or password.',
        });
        this.isInvalidLogin = true;
        this.isLoading = false;
      }
    });
  }
}
