import type { AuditedEntityDto, EntityDto, PagedAndSortedResultRequestDto } from '@abp/ng.core';
import type { IRemoteStreamContent } from '../../volo/abp/content/models';
import type { CategoryDto } from '../categories/models';

export interface CreateUpdateProductColorDto extends EntityDto<string> {
  nameEn: string;
  nameAr: string;
  price: number;
  inStock: boolean;
  image: IRemoteStreamContent;
}

export interface CreateUpdateProductDto extends EntityDto {
  name: string;
  image: IRemoteStreamContent;
  code: string;
  price: number;
  categoryId: string;
  markedAsNew: boolean;
  inStock: boolean;
  productColors: CreateUpdateProductColorDto[];
  features: string[];
  file: IRemoteStreamContent;
  productSepcifications: CreateUpdateProductSepecificationDto[];
}

export interface CreateUpdateProductSepecificationDto extends EntityDto<string> {
  keyEn?: string;
  keyAr?: string;
  valueEn?: string;
  valueAr?: string;
}

export interface GetProductListInputDto extends PagedAndSortedResultRequestDto {
  name?: string;
  markedAsNew?: boolean;
  inStock?: boolean;
  categoryId?: string;
}

export interface GetProductLookupInputDto extends EntityDto {
  rootCategoryId: string;
  name?: string;
}

export interface ProductColorDto extends AuditedEntityDto<string> {
  nameEn?: string;
  nameAr?: string;
  price: number;
  inStock: boolean;
  image?: string;
}

export interface ProductDto extends AuditedEntityDto<string> {
  name?: string;
  image?: string;
  price: number;
  code?: string;
  category: CategoryDto;
  markedAsNew: boolean;
  inStock: boolean;
  productColors: ProductColorDto[];
  features: string[];
  file?: string;
  productSepcifications: ProductSpecificationDto[];
}

export interface ProductSpecificationDto extends EntityDto<string> {
  keyEn?: string;
  keyAr?: string;
  valueEn?: string;
  valueAr?: string;
}
