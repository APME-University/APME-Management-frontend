import { RestService, Rest } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import { FindTenantResultDto } from './models';

@Injectable({
  providedIn: 'root',
})
export class AbpTenantService {
  apiName = 'abp';

  findTenantByName = (name: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, FindTenantResultDto>(
      {
        method: 'GET',
        url: `/api/abp/multi-tenancy/tenants/by-name/${name}`,
      },
      { apiName: this.apiName, ...config }
    );

  findTenantById = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, FindTenantResultDto>(
      {
        method: 'GET',
        url: `/api/abp/multi-tenancy/tenants/by-id/${id}`,
      },
      { apiName: this.apiName, ...config }
    );

  constructor(private restService: RestService) {}
}

