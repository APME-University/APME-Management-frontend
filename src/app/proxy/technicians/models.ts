import type { EntityDto, PagedAndSortedResultRequestDto } from '@abp/ng.core';

export interface CreateUpdateTechnicianDto extends EntityDto {
  name: string;
  surname: string;
  phoneNumber: string;
}

export interface GetListTechnicianInputDto extends PagedAndSortedResultRequestDto {
  name?: string;
}

export interface GetTechnicianLookInputDto extends PagedAndSortedResultRequestDto {
  name?: string;
  dayFilter?: string;
}

export interface TechnicianDto extends EntityDto<string> {
  userName: string;
  email?: string;
  name?: string;
  surname?: string;
  isActive: boolean;
  phoneNumber?: string;
}

export interface TechnicianLookupDto extends EntityDto<string> {
  name?: string;
  totalRequest: number;
}
