import { mapEnumToOptions } from '@abp/ng.core';

export enum WarrantyStatus {
  Out = 0,
  In = 1,
}

export const warrantyStatusOptions = mapEnumToOptions(WarrantyStatus);
