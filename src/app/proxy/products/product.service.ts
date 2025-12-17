import { RestService, Rest } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import { ProductDto, CreateUpdateProductDto, GetProductListInput, PagedResultDto, SetPrimaryImageRequest } from './models';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  apiName = 'Default';

  getList = (input: GetProductListInput, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<ProductDto>>({
      method: 'GET',
      url: '/api/app/product',
      params: {
        filter: input.filter,
        shopId: input.shopId,
        categoryId: input.categoryId,
        isActive: input.isActive,
        isPublished: input.isPublished,
        minPrice: input.minPrice,
        maxPrice: input.maxPrice,
        sorting: input.sorting,
        skipCount: input.skipCount,
        maxResultCount: input.maxResultCount,
      },
    },
    { apiName: this.apiName, ...config });

  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ProductDto>({
      method: 'GET',
      url: `/api/app/product/${id}`,
    },
    { apiName: this.apiName, ...config });

  create = (input: CreateUpdateProductDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ProductDto>({
      method: 'POST',
      url: '/api/app/product',
      body: input,
    },
    { apiName: this.apiName, ...config });

  update = (id: string, input: CreateUpdateProductDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ProductDto>({
      method: 'PUT',
      url: `/api/app/product/${id}`,
      body: input,
    },
    { apiName: this.apiName, ...config });

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/product/${id}`,
    },
    { apiName: this.apiName, ...config });

  activate = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ProductDto>({
      method: 'POST',
      url: `/api/app/product/${id}/activate`,
    },
    { apiName: this.apiName, ...config });

  deactivate = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ProductDto>({
      method: 'POST',
      url: `/api/app/product/${id}/deactivate`,
    },
    { apiName: this.apiName, ...config });

  publish = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ProductDto>({
      method: 'POST',
      url: `/api/app/product/${id}/publish`,
    },
    { apiName: this.apiName, ...config });

  unpublish = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ProductDto>({
      method: 'POST',
      url: `/api/app/product/${id}/unpublish`,
    },
    { apiName: this.apiName, ...config });

  increaseStock = (id: string, quantity: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ProductDto>({
      method: 'POST',
      url: `/api/app/product/${id}/increase-stock`,
      params: { quantity },
    },
    { apiName: this.apiName, ...config });

  decreaseStock = (id: string, quantity: number, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ProductDto>({
      method: 'POST',
      url: `/api/app/product/${id}/decrease-stock`,
      params: { quantity },
    },
    { apiName: this.apiName, ...config });

  // Image management methods
  uploadImage = (id: string, file: File, isPrimary: boolean = false, config?: Partial<Rest.Config>) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.restService.request<any, string>({
      method: 'POST',
      url: `/api/app/product/${id}/images`,
      body: formData,
      params: { isPrimary },
    },
    { apiName: this.apiName, ...config });
  };

  deleteImage = (id: string, imageUrl: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/product/${id}/images/${encodeURIComponent(imageUrl)}`,
    },
    { apiName: this.apiName, ...config });

  setPrimaryImage = (id: string, input: SetPrimaryImageRequest, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'PUT',
      url: `/api/app/product/${id}/images/primary`,
      body: input,
    },
    { apiName: this.apiName, ...config });

  getImages = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, string[]>({
      method: 'GET',
      url: `/api/app/product/${id}/images`,
    },
    { apiName: this.apiName, ...config });

  getImageUrl = (id: string, blobName: string): string => {
    return `/api/app/product/${id}/images/${blobName}`;
  };

  constructor(private restService: RestService) {}
}




