import { RestService, Rest } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import { CategoryDto, CreateUpdateCategoryDto, GetCategoryListInput, PagedResultDto } from './models';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  apiName = 'Default';

  getList = (input: GetCategoryListInput, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<CategoryDto>>({
      method: 'GET',
      url: '/api/app/category',
      params: {
        filter: input.filter,
        shopId: input.shopId,
        parentId: input.parentId,
        isActive: input.isActive,
        sorting: input.sorting,
        skipCount: input.skipCount,
        maxResultCount: input.maxResultCount,
      },
    },
    { apiName: this.apiName, ...config });

  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, CategoryDto>({
      method: 'GET',
      url: `/api/app/category/${id}`,
    },
    { apiName: this.apiName, ...config });

  create = (input: CreateUpdateCategoryDto | FormData, config?: Partial<Rest.Config>) =>
    this.restService.request<any, CategoryDto>({
      method: 'POST',
      url: '/api/app/category',
      body: input,
    },
    { apiName: this.apiName, ...config });

  update = (id: string, input: CreateUpdateCategoryDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, CategoryDto>({
      method: 'PUT',
      url: `/api/app/category/${id}`,
      body: input,
    },
    { apiName: this.apiName, ...config });

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/category/${id}`,
    },
    { apiName: this.apiName, ...config });

  // Image management methods
  uploadImage = (id: string, file: File, config?: Partial<Rest.Config>) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.restService.request<any, string>({
      method: 'POST',
      url: `/api/app/category/${id}/image`,
      body: formData,
    },
    { apiName: this.apiName, ...config });
  };

  deleteImage = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/category/${id}/image`,
    },
    { apiName: this.apiName, ...config });

  getImageUrl = (id: string, blobName: string): string => {
    return `/api/app/category/${id}/image/${blobName}`;
  };

  constructor(private restService: RestService) {}
}




