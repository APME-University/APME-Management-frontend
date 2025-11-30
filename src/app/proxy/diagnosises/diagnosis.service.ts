import type { CreateUpdateDiagnosisDto, DiagnosisDto, DiagnosisLookupDto, GetDiagnosisInputLookupDto, GetDiagnosisListInputDto, GetLookupDiagnosisInputDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { ListResultDto, PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DiagnosisService {
  apiName = 'Default';
  

  create = (input: CreateUpdateDiagnosisDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, DiagnosisDto>({
      method: 'POST',
      url: '/api/app/diagnosis',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/diagnosis/${id}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, DiagnosisDto>({
      method: 'GET',
      url: `/api/app/diagnosis/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getList = (input: GetDiagnosisListInputDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<DiagnosisDto>>({
      method: 'GET',
      url: '/api/app/diagnosis',
      params: { code: input.code, sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getLookupByInput = (input: GetLookupDiagnosisInputDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<DiagnosisLookupDto>>({
      method: 'GET',
      url: '/api/app/diagnosis/lookup',
      params: { categoryId: input.categoryId, productId: input.productId, code: input.code },
    },
    { apiName: this.apiName,...config });
  

  getLookupCodsByInput = (input: GetDiagnosisInputLookupDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<string>>({
      method: 'GET',
      url: '/api/app/diagnosis/lookup-cods',
      params: { categoryId: input.categoryId, productId: input.productId, code: input.code },
    },
    { apiName: this.apiName,...config });
  

  update = (id: string, input: CreateUpdateDiagnosisDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, DiagnosisDto>({
      method: 'PUT',
      url: `/api/app/diagnosis/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
