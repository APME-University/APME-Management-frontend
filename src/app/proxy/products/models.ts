import type { ProductAttributeDataType } from './product-attribute-data-type.enum';
import type { IRemoteStreamContent } from '../volo/abp/content/models';
import type { FullAuditedEntityDto, PagedAndSortedResultRequestDto } from '@abp/ng.core';

export interface CreateUpdateProductAttributeDto {
  shopId: string;
  name: string;
  displayName: string;
  dataType: ProductAttributeDataType;
  isRequired: boolean;
  displayOrder: number;
}

export interface CreateUpdateProductDto {
  shopId: string;
  categoryId?: string;
  name: string;
  slug: string;
  description?: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  isActive: boolean;
  isPublished: boolean;
  attributes?: string;
  image: IRemoteStreamContent;
}

export interface GetProductAttributeListInput extends PagedAndSortedResultRequestDto {
  filter?: string;
  shopId?: string;
  dataType?: ProductAttributeDataType;
}

export interface GetProductListInput extends PagedAndSortedResultRequestDto {
  filter?: string;
  shopId?: string;
  categoryId?: string;
  isActive?: boolean;
  isPublished?: boolean;
  inStock?: boolean;
}

export interface ProductAttributeDto extends FullAuditedEntityDto<string> {
  shopId?: string;
  name?: string;
  displayName?: string;
  dataType?: ProductAttributeDataType;
  isRequired: boolean;
  displayOrder: number;
}

export interface ProductDto extends FullAuditedEntityDto<string> {
  shopId?: string;
  categoryId?: string;
  name?: string;
  slug?: string;
  description?: string;
  sku?: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  isActive: boolean;
  isPublished: boolean;
  attributes?: string;
  primaryImageUrl?: string;
  imageUrls: string[];
  isInStock: boolean;
  isOnSale: boolean;
  hasImages: boolean;
  imageCount: number;
}
