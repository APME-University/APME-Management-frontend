import { AuthService, SessionStateService } from '@abp/ng.core';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  private sessionStateService = inject(SessionStateService);

  get hasLoggedIn(): boolean {
    return this.authService.isAuthenticated
  }

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // If user is authenticated, redirect to appropriate dashboard based on tenant context
    if (this.hasLoggedIn) {
      const tenant = this.sessionStateService.getTenant();
      if (tenant?.id && tenant?.isAvailable) {
        // Tenant user - redirect to tenant dashboard
        this.router.navigate(['/tenant/dashboard']);
      } else {
        // HOST user - redirect to HOST dashboard
        this.router.navigate(['/host/dashboard']);
      }
    }
  }

  login() {
    this.authService.navigateToLogin();
  }
}
