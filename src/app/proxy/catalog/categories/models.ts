import type { EntityDto, PagedAndSortedResultRequestDto } from '@abp/ng.core';
import type { CategoryType } from './category-type.enum';
import type { IRemoteStreamContent } from '../../volo/abp/content/models';

export interface CategoryDto extends EntityDto<string> {
  nameEn?: string;
  nameAr?: string;
  image?: string;
  parentId?: string;
  type?: CategoryType;
  parent: CategoryDto;
  hasChildren: boolean;
}

export interface CategoryFilterInputDto extends EntityDto {
  nameEn?: string;
  nameAr?: string;
  type?: CategoryType;
}

export interface CategoryLookupDto extends EntityDto<string> {
  nameEn?: string;
  nameAr?: string;
  image?: string;
}

export interface CategoryLookupInputDto extends EntityDto {
  nameEn?: string;
  nameAr?: string;
  exceptId?: string;
}

export interface CreateUpdateCategoryDto extends EntityDto {
  nameEn: string;
  nameAr: string;
  parentId?: string;
  type?: CategoryType;
  image: IRemoteStreamContent;
}

export interface GetListCategoryInputDto extends PagedAndSortedResultRequestDto {
  name?: string;
  parentId?: string;
  type?: CategoryType;
}
