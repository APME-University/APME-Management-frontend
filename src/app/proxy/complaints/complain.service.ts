import type { ComplainDto, CreateUpdateComplainDto, GetListComplainInputDto, ReplyComplainDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ComplainService {
  apiName = 'Default';
  

  create = (input: CreateUpdateComplainDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ComplainDto>({
      method: 'POST',
      url: '/api/app/complain',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/complain/${id}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ComplainDto>({
      method: 'GET',
      url: `/api/app/complain/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getList = (input: GetListComplainInputDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<ComplainDto>>({
      method: 'GET',
      url: '/api/app/complain',
      params: { name: input.name, status: input.status, phoneNumber: input.phoneNumber, filter: input.filter, sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  replyByInput = (input: ReplyComplainDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ComplainDto>({
      method: 'PATCH',
      url: '/api/app/complain/reply',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  update = (id: string, input: CreateUpdateComplainDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ComplainDto>({
      method: 'PUT',
      url: `/api/app/complain/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
