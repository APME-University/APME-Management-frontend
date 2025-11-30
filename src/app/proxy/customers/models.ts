import type { EntityDto, PagedAndSortedResultRequestDto } from '@abp/ng.core';

export interface CreateUpdateCustomerDto extends EntityDto {
  phoneNumber: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

export interface CustomerDto extends EntityDto<string> {
  name?: string;
  surName?: string;
  phoneNumber?: string;
  isActive: boolean;
  totalRequest: number;
}

export interface CustomerGetListInputDto extends PagedAndSortedResultRequestDto {
  name?: string;
  surName?: string;
  phoneNumber?: string;
}

export interface CustomerLookupDto extends EntityDto<string> {
  name?: string;
  phoneNumber?: string;
}
