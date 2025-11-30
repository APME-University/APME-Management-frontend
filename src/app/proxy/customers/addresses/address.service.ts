import type { AddressDto, CreateUpdateAddressDto, GetListAddressInputDto, GetNeighborhoodDto, GetStatesDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { ListResultDto, PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { LookupDto } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  apiName = 'Default';
  

  create = (input: CreateUpdateAddressDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, AddressDto>({
      method: 'POST',
      url: '/api/app/address',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/address/${id}`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, AddressDto>({
      method: 'GET',
      url: `/api/app/address/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getCititesLookupBySearch = (search?: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<LookupDto<string>>>({
      method: 'GET',
      url: '/api/app/address/citites-lookup',
      params: { search },
    },
    { apiName: this.apiName,...config });
  

  getCustomerAddresses = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<AddressDto>>({
      method: 'GET',
      url: '/api/app/address/customer-addresses',
    },
    { apiName: this.apiName,...config });
  

  getList = (input: GetListAddressInputDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<AddressDto>>({
      method: 'GET',
      url: '/api/app/address',
      params: { customerId: input.customerId, sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getNeighborhoodByInput = (input: GetNeighborhoodDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<LookupDto<string>>>({
      method: 'GET',
      url: '/api/app/address/neighborhood',
      params: { stateId: input.stateId, name: input.name },
    },
    { apiName: this.apiName,...config });
  

  getRegionsByName = (name?: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<LookupDto<string>>>({
      method: 'GET',
      url: '/api/app/address/regions',
      params: { name },
    },
    { apiName: this.apiName,...config });
  

  getStatesByInput = (input: GetStatesDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<LookupDto<string>>>({
      method: 'GET',
      url: '/api/app/address/states',
      params: { regionId: input.regionId, name: input.name },
    },
    { apiName: this.apiName,...config });
  

  update = (id: string, input: CreateUpdateAddressDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, AddressDto>({
      method: 'PUT',
      url: `/api/app/address/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
