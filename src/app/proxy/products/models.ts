export interface ProductDto {
  id: string;
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
  primaryImageUrl?: string;
  imageUrls?: string[];
  isInStock?: boolean;
  isOnSale?: boolean;
  hasImages?: boolean;
  imageCount?: number;
  creationTime?: string;
  creatorId?: string;
  lastModificationTime?: string;
  lastModifierId?: string;
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
}

export interface GetProductListInput {
  filter?: string;
  shopId?: string;
  categoryId?: string;
  isActive?: boolean;
  isPublished?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sorting?: string;
  skipCount?: number;
  maxResultCount?: number;
}

export interface PagedResultDto<T> {
  items?: T[];
  totalCount?: number;
}

export interface SetPrimaryImageRequest {
  imageUrl: string;
}




