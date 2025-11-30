import { mapEnumToOptions } from '@abp/ng.core';

export enum OrderStatus {
  New = 0,
  InProgress = 1,
  InDevlivery = 2,
  Canceled = 3,
  Done = 4,
  Reschedule = 5,
}

export const orderStatusOptions = mapEnumToOptions(OrderStatus);
