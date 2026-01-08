import type { CreateUpdateShopDto, GetShopListInput, ShopDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ShopService {
  apiName = 'Default';
  

  activate = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ShopDto>({
      method: 'POST',
      url: `/api/app/shop/${id}/activate`,
    },
    { apiName: this.apiName,...config });
  

  create = (input: CreateUpdateShopDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ShopDto>({
      method: 'POST',
      url: '/api/app/shop',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  deactivate = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ShopDto>({
      method: 'POST',
      url: `/api/app/shop/${id}/deactivate`,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/shop/${id}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ShopDto>({
      method: 'GET',
      url: `/api/app/shop/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getList = (input: GetShopListInput, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<ShopDto>>({
      method: 'GET',
      url: '/api/app/shop',
      params: { filter: input.filter, isActive: input.isActive, sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  update = (id: string, input: CreateUpdateShopDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ShopDto>({
      method: 'PUT',
      url: `/api/app/shop/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
