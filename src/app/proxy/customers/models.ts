import type { FullAuditedEntityDto, PagedAndSortedResultRequestDto } from '@abp/ng.core';

export interface CreateUpdateCustomerDto {
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  isActive: boolean;
}

export interface CustomerDto extends FullAuditedEntityDto<string> {
  userId?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  isActive: boolean;
  fullName?: string;
}

export interface GetCustomerListInput extends PagedAndSortedResultRequestDto {
  filter?: string;
  userId?: string;
  isActive?: boolean;
}
