import type { EntityDto } from '@abp/ng.core';

export interface VerifyOtpRequestDto extends EntityDto {
  phoneNumber: string;
  code: string;
}

export interface ProfileUpdateDto extends EntityDto {
  name: string;
  surName: string;
}
