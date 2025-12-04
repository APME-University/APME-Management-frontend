export interface ShopDto {
  id: string;
  name: string;
  description?: string;
  slug: string;
  isActive: boolean;
  logoUrl?: string;
  settings?: string;
  tenantId?: string;
  tenantName?: string;
  creationTime?: string;
  creatorId?: string;
  lastModificationTime?: string;
  lastModifierId?: string;
}

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

export interface GetShopListInput {
  filter?: string;
  isActive?: boolean;
  sorting?: string;
  skipCount?: number;
  maxResultCount?: number;
}

export interface PagedResultDto<T> {
  items?: T[];
  totalCount?: number;
}

