import type { AcceptOrderDto, CancelOrderInputDto, CreateOrderDto, GetListOrderInputDto, OrderDto, OrderLogDto, RescheduleOrderInputDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { ListResultDto, PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  apiName = 'Default';
  

  acceptByInput = (input: AcceptOrderDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, OrderDto>({
      method: 'POST',
      url: '/api/app/order/accept',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  cancelByInput = (input: CancelOrderInputDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, OrderDto>({
      method: 'PATCH',
      url: '/api/app/order/cancel',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  create = (input: CreateOrderDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, OrderDto>({
      method: 'POST',
      url: '/api/app/order',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  doneById = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, OrderDto>({
      method: 'PATCH',
      url: `/api/app/order/${id}/done`,
    },
    { apiName: this.apiName,...config });
  

  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, OrderDto>({
      method: 'GET',
      url: `/api/app/order/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getCustomerOrdersByInput = (input: GetListOrderInputDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<OrderDto>>({
      method: 'GET',
      url: '/api/app/order/customer-orders',
      params: { requestGeneratedId: input.requestGeneratedId, phoneNumber: input.phoneNumber, customerId: input.customerId, status: input.status, from: input.from, to: input.to, sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getList = (input: GetListOrderInputDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<OrderDto>>({
      method: 'GET',
      url: '/api/app/order',
      params: { requestGeneratedId: input.requestGeneratedId, phoneNumber: input.phoneNumber, customerId: input.customerId, status: input.status, from: input.from, to: input.to, sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getOrderLogsById = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<OrderLogDto>>({
      method: 'GET',
      url: `/api/app/order/${id}/order-logs`,
    },
    { apiName: this.apiName,...config });
  

  inDeliveryById = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, OrderDto>({
      method: 'PATCH',
      url: `/api/app/order/${id}/in-delivery`,
    },
    { apiName: this.apiName,...config });
  

  rescheduleByInput = (input: RescheduleOrderInputDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, OrderDto>({
      method: 'PUT',
      url: '/api/app/order/reschedule',
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
