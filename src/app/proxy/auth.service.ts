import type { VerifyOtpRequestDto } from './auth/models';
import type { IActionResult } from './microsoft/asp-net-core/mvc/models';
import { RestService, Rest } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  apiName = 'Default';
  

  requestOTPByPhoneNumber = (phoneNumber: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, IActionResult>({
      method: 'POST',
      url: '/api/app/auth/request-otp',
      body: phoneNumber,
    },
    { apiName: this.apiName,...config });
  

  updateFCMTokenByToken = (token: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, IActionResult>({
      method: 'PATCH',
      url: '/api/app/auth/update-fcm-token',
      body: token,
    },
    { apiName: this.apiName,...config });
  

  verifyOTPCodeByInput = (input: VerifyOtpRequestDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, IActionResult>({
      method: 'POST',
      url: '/api/app/auth/verify-otp',
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
