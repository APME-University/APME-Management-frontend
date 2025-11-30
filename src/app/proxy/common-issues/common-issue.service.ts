import type { CommonIssueDto, CreateUpdateCommonIssueDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { PagedAndSortedResultRequestDto, PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CommonIssueService {
  apiName = 'Default';
  

  create = (input: CreateUpdateCommonIssueDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, CommonIssueDto>({
      method: 'POST',
      url: '/api/app/common-issue',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/common-issue/${id}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, CommonIssueDto>({
      method: 'GET',
      url: `/api/app/common-issue/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getList = (input: PagedAndSortedResultRequestDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<CommonIssueDto>>({
      method: 'GET',
      url: '/api/app/common-issue',
      params: { sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  update = (id: string, input: CreateUpdateCommonIssueDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, CommonIssueDto>({
      method: 'PUT',
      url: `/api/app/common-issue/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
