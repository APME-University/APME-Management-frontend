import type { AdvertismentDto, CreateUpdateAdvertismentDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { PagedAndSortedResultRequestDto, PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AdvertismentService {
  apiName = 'Default';
  

  create = (input: CreateUpdateAdvertismentDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, AdvertismentDto>({
      method: 'POST',
      url: '/api/app/advertisment',
      body: input.image,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/advertisment/${id}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, AdvertismentDto>({
      method: 'GET',
      url: `/api/app/advertisment/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getList = (input: PagedAndSortedResultRequestDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<AdvertismentDto>>({
      method: 'GET',
      url: '/api/app/advertisment',
      params: { sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  update = (id: string, input: CreateUpdateAdvertismentDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, AdvertismentDto>({
      method: 'PUT',
      url: `/api/app/advertisment/${id}`,
      body: input.image,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
