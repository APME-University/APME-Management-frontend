export interface CategoryDto {
  id: string;
  shopId: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  displayOrder: number;
  isActive: boolean;
  imageUrl?: string;
  creationTime?: string;
  creatorId?: string;
  lastModificationTime?: string;
  lastModifierId?: string;
}

export interface CreateUpdateCategoryDto {
  shopId: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  displayOrder: number;
  isActive: boolean;
  imageUrl?: string;
}

export interface GetCategoryListInput {
  filter?: string;
  shopId?: string;
  parentId?: string;
  isActive?: boolean;
  sorting?: string;
  skipCount?: number;
  maxResultCount?: number;
}

export interface PagedResultDto<T> {
  items?: T[];
  totalCount?: number;
}




