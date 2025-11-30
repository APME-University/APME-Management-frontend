import { mapEnumToOptions } from '@abp/ng.core';

export enum MaintenanceRequestPriority {
  Normal = 0,
  Urgent = 1,
  Known = 2,
}

export const maintenanceRequestPriorityOptions = mapEnumToOptions(MaintenanceRequestPriority);
