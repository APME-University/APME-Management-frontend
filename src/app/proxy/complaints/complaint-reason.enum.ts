import { mapEnumToOptions } from '@abp/ng.core';

export enum ComplaintReason {
  PreviousVisit = 0,
  Product = 1,
  CustomerService = 2,
  Other = 3,
}

export const complaintReasonOptions = mapEnumToOptions(ComplaintReason);
