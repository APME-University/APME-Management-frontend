import { mapEnumToOptions } from '@abp/ng.core';

export enum MaintenanceRequestFees {
  PayRequired = 0,
  Free = 1,
}

export const maintenanceRequestFeesOptions = mapEnumToOptions(MaintenanceRequestFees);
