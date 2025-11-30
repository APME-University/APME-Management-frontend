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
import { AuthService, CoreModule, LocalizationService } from '@abp/ng.core';
import { Router } from '@angular/router';
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
  isInvalidLogin: boolean = false;
  ngOnInit(): void {
  }

  onSubmit(loginForm: NgForm):void {
    this.isLoading = true;
    const { username, password } = loginForm.value;
    this.authService.login({
     username : username,
    password : password, 
    }).subscribe({
      next: (response ) => {
        this.isInvalidLogin = true;
        this.isLoading = false;
        this._router.navigate(['/']);
      },
      error: (error) => {
         this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.localization.instant('Somethingwentwrong!'),
        });
         this.isInvalidLogin = true;
        this.isLoading = false;
      }
    })
  }
}
