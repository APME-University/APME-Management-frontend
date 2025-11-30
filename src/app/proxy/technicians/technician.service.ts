import type { CreateUpdateTechnicianDto, GetListTechnicianInputDto, GetTechnicianLookInputDto, TechnicianDto, TechnicianLookupDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TechnicianService {
  apiName = 'Default';
  

  create = (input: CreateUpdateTechnicianDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, TechnicianDto>({
      method: 'POST',
      url: '/api/app/technician',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/technician/${id}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, TechnicianDto>({
      method: 'GET',
      url: `/api/app/technician/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getList = (input: GetListTechnicianInputDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<TechnicianDto>>({
      method: 'GET',
      url: '/api/app/technician',
      params: { name: input.name, sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getTechniciaLookupDtoByInput = (input: GetTechnicianLookInputDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<TechnicianLookupDto>>({
      method: 'GET',
      url: '/api/app/technician/technicia-lookup-dto',
      params: { name: input.name, dayFilter: input.dayFilter, sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  update = (id: string, input: CreateUpdateTechnicianDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, TechnicianDto>({
      method: 'PUT',
      url: `/api/app/technician/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
