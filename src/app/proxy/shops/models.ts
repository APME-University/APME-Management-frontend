import type { FullAuditedEntityDto, PagedAndSortedResultRequestDto } from '@abp/ng.core';

export interface CreateUpdateShopDto {
  name: string;
  description?: string;
  slug: string;
  isActive: boolean;
  logoUrl?: string;
  settings?: string;
  tenantName?: string;
  adminEmail?: string;
  adminPassword?: string;
  adminUserName?: string;
  adminFirstName?: string;
  adminLastName?: string;
}

export interface GetShopListInput extends PagedAndSortedResultRequestDto {
  filter?: string;
  isActive?: boolean;
}

export interface ShopDto extends FullAuditedEntityDto<string> {
  name?: string;
  description?: string;
  slug?: string;
  isActive: boolean;
  logoUrl?: string;
  settings?: string;
  tenantId?: string;
  tenantName?: string;
}
