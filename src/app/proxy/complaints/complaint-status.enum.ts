import { mapEnumToOptions } from '@abp/ng.core';

export enum ComplaintStatus {
  UnderReview = 0,
  Replied = 1,
}

export const complaintStatusOptions = mapEnumToOptions(ComplaintStatus);
