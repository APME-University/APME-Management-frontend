import { mapEnumToOptions } from '@abp/ng.core';

export enum MaintenanceRequestStatus {
  New = 0,
  InProgress = 1,
  Canceled = 2,
  OnTheWay = 3,
  UnderRepair = 4,
  RequireInHouse = 5,
  Done = 6,
  Rejected = 7,
  UnableToRepair = 8,
  Reschedule = 9,
}

export const maintenanceRequestStatusOptions = mapEnumToOptions(MaintenanceRequestStatus);
