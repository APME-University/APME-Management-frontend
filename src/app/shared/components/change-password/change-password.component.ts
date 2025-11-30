import { LocalizationService, CoreModule } from '@abp/ng.core';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ProfileService }  from '@abp/ng.account.core/proxy'
import { MenuModule } from 'primeng/menu';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CoreModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    MenuModule,
  ],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
  providers: [MessageService]
})
export class ChangePasswordComponent implements OnInit {
  form!: FormGroup;
  fb = inject(FormBuilder);
  messageService = inject(MessageService);
  localizationService = inject(LocalizationService);
  router = inject(Router);
  profileService = inject(ProfileService);
  isSubmitLoading = false;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  async ngOnInit(): Promise<void> {
    this.buildForm();
    
  }

  buildForm(): void {
    this.form = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): {[key: string]: any} | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control?.invalid && control.touched);
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    
    if (control?.errors?.['required']) {
      return this.localizationService.instant('::ThisFieldIsRequired');
    }
    
    if (control?.errors?.['minlength']) {
      return this.localizationService.instant('::PasswordMinLength', '6');
    }
    
    if (controlName === 'confirmPassword' && this.form.errors?.['passwordMismatch']) {
      return this.localizationService.instant('::PasswordsDoNotMatch');
    }
    
    return '';
  }

  togglePasswordVisibility(field: string): void {
    switch (field) {
      case 'current':
        this.showCurrentPassword = !this.showCurrentPassword;
        break;
      case 'new':
        this.showNewPassword = !this.showNewPassword;
        break;
      case 'confirm':
        this.showConfirmPassword = !this.showConfirmPassword;
        break;
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitLoading = true;

    const changePasswordInput = {
      currentPassword: this.form.get('currentPassword')?.value,
      newPassword: this.form.get('newPassword')?.value
    };

    if (this.profileService) {
      // Use the actual ProfileService
      this.profileService.changePassword(changePasswordInput).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: this.localizationService.instant('::Success'),
            detail: this.localizationService.instant('::PasswordChangedSuccessfully'),
            life: 3000
          });
          this.form.reset();
          this.isSubmitLoading = false;
          
          // Navigate back to home or previous page
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 2000);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: this.localizationService.instant('::Error'),
            detail: this.localizationService.instant('::ErrorChangingPassword'),
            life: 5000
          });
          this.isSubmitLoading = false;
        }
      });
    } else {
      // Fallback - service not available
      this.messageService.add({
        severity: 'warn',
        summary: this.localizationService.instant('::Warning'),
        detail: 'ProfileService not available. Please contact administrator.',
        life: 5000
      });
      this.isSubmitLoading = false;
    }
  }

  cancel(): void {
    this.router.navigate(['/']);
  }
}
