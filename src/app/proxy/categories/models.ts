import type { FullAuditedEntityDto, PagedAndSortedResultRequestDto } from '@abp/ng.core';
import type { IRemoteStreamContent } from '../volo/abp/content/models';

export interface CategoryDto extends FullAuditedEntityDto<string> {
  shopId?: string;
  name?: string;
  slug?: string;
  description?: string;
  parentId?: string;
  displayOrder: number;
  isActive: boolean;
  imageUrl?: string;
}

export interface CreateUpdateCategoryDto {
  shopId: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  displayOrder: number;
  isActive: boolean;
  image: IRemoteStreamContent;
}

export interface GetCategoryListInput extends PagedAndSortedResultRequestDto {
  filter?: string;
  shopId?: string;
  parentId?: string;
  isActive?: boolean;
}
