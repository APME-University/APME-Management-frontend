import type { CategoryDto, CategoryFilterInputDto, CategoryLookupDto, CategoryLookupInputDto, CreateUpdateCategoryDto, GetListCategoryInputDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { ListResultDto, PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  apiName = 'Default';
  

  create = (input: CreateUpdateCategoryDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, CategoryDto>({
      method: 'POST',
      url: '/api/app/category',
      body: input.image,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/category/${id}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, CategoryDto>({
      method: 'GET',
      url: `/api/app/category/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getCategoriesLookupByInput = (input: CategoryLookupInputDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<CategoryLookupDto>>({
      method: 'GET',
      url: '/api/app/category/categories-lookup',
      params: { nameEn: input.nameEn, nameAr: input.nameAr, exceptId: input.exceptId },
    },
    { apiName: this.apiName,...config });
  

  getLeafCategoriesByInput = (input: CategoryFilterInputDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<CategoryDto>>({
      method: 'GET',
      url: '/api/app/category/leaf-categories',
      params: { nameEn: input.nameEn, nameAr: input.nameAr, type: input.type },
    },
    { apiName: this.apiName,...config });
  

  getList = (input: GetListCategoryInputDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<CategoryDto>>({
      method: 'GET',
      url: '/api/app/category',
      params: { name: input.name, parentId: input.parentId, type: input.type, sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getRootCategoriesByInput = (input: CategoryFilterInputDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<CategoryDto>>({
      method: 'GET',
      url: '/api/app/category/root-categories',
      params: { nameEn: input.nameEn, nameAr: input.nameAr, type: input.type },
    },
    { apiName: this.apiName,...config });
  

  getSubCategoriesById = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<CategoryDto>>({
      method: 'GET',
      url: `/api/app/category/${id}/sub-categories`,
    },
    { apiName: this.apiName,...config });
  

  update = (id: string, input: CreateUpdateCategoryDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, CategoryDto>({
      method: 'PUT',
      url: `/api/app/category/${id}`,
      body: input.image,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
