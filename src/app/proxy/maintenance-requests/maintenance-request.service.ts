import type { AssignTechnicianDto, CancelRequestDto, ChangeAddressDto, CreateMaintenanceRequestDto, DoneRepairInputDto, GetListMaintenanceRequestInputDto, GetRatesByTechnicianInputDto, MaintenanceRequestDto, MaintenanceRequestLogDto, OnTheWayRequestInputDto, RateMaintenanceRequestDto, RejectMaintenanceRequest, RequireInHoursInputDto, RescheduleInputDto, UnableToRepairInputDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import type { ListResultDto, PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { RateDto } from '../ratings/models';

@Injectable({
  providedIn: 'root',
})
export class MaintenanceRequestService {
  apiName = 'Default';
  

  assignTechnicianByInput = (input: AssignTechnicianDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MaintenanceRequestDto>({
      method: 'PATCH',
      url: '/api/app/maintenance-request/assign-technician',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  cancelByInput = (input: CancelRequestDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'POST',
      url: '/api/app/maintenance-request/cancel',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  changeAddressByInput = (input: ChangeAddressDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MaintenanceRequestDto>({
      method: 'POST',
      url: '/api/app/maintenance-request/change-address',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  create = (input: CreateMaintenanceRequestDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MaintenanceRequestDto>({
      method: 'POST',
      url: '/api/app/maintenance-request',
      body: input.mediaFile,
    },
    { apiName: this.apiName,...config });
  

  doneByInput = (input: DoneRepairInputDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MaintenanceRequestDto>({
      method: 'PATCH',
      url: '/api/app/maintenance-request/done',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MaintenanceRequestDto>({
      method: 'GET',
      url: `/api/app/maintenance-request/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getCustomerRequestsByInput = (input: GetListMaintenanceRequestInputDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<MaintenanceRequestDto>>({
      method: 'GET',
      url: '/api/app/maintenance-request/customer-requests',
      params: { status: input.status, customerId: input.customerId, phoneNumber: input.phoneNumber, from: input.from, to: input.to, technicianId: input.technicianId, requestGeneratedId: input.requestGeneratedId, sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getList = (input: GetListMaintenanceRequestInputDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<MaintenanceRequestDto>>({
      method: 'GET',
      url: '/api/app/maintenance-request',
      params: { status: input.status, customerId: input.customerId, phoneNumber: input.phoneNumber, from: input.from, to: input.to, technicianId: input.technicianId, requestGeneratedId: input.requestGeneratedId, sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getLogsById = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ListResultDto<MaintenanceRequestLogDto>>({
      method: 'GET',
      url: `/api/app/maintenance-request/${id}/logs`,
    },
    { apiName: this.apiName,...config });
  

  getNewMaintenanceRequestByInput = (input: GetListMaintenanceRequestInputDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<MaintenanceRequestDto>>({
      method: 'GET',
      url: '/api/app/maintenance-request/new-maintenance-request',
      params: { status: input.status, customerId: input.customerId, phoneNumber: input.phoneNumber, from: input.from, to: input.to, technicianId: input.technicianId, requestGeneratedId: input.requestGeneratedId, sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getRatesByTechnicianByInput = (input: GetRatesByTechnicianInputDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<RateDto>>({
      method: 'GET',
      url: '/api/app/maintenance-request/rates-by-technician',
      params: { id: input.id, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  getSechduledMantenanceRequestByInput = (input: GetListMaintenanceRequestInputDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<MaintenanceRequestDto>>({
      method: 'GET',
      url: '/api/app/maintenance-request/sechduled-mantenance-request',
      params: { status: input.status, customerId: input.customerId, phoneNumber: input.phoneNumber, from: input.from, to: input.to, technicianId: input.technicianId, requestGeneratedId: input.requestGeneratedId, sorting: input.sorting, skipCount: input.skipCount, maxResultCount: input.maxResultCount },
    },
    { apiName: this.apiName,...config });
  

  onTheWayByInput = (input: OnTheWayRequestInputDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MaintenanceRequestDto>({
      method: 'PATCH',
      url: '/api/app/maintenance-request/on-the-way',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  rateByInput = (input: RateMaintenanceRequestDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'POST',
      url: '/api/app/maintenance-request/rate',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  rejectByInput = (input: RejectMaintenanceRequest, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MaintenanceRequestDto>({
      method: 'PATCH',
      url: '/api/app/maintenance-request/reject',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  requireInHouseByInput = (input: RequireInHoursInputDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MaintenanceRequestDto>({
      method: 'PATCH',
      url: '/api/app/maintenance-request/require-in-house',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  rescheduleByInput = (input: RescheduleInputDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MaintenanceRequestDto>({
      method: 'POST',
      url: '/api/app/maintenance-request/reschedule',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  unableToRepairByInput = (input: UnableToRepairInputDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MaintenanceRequestDto>({
      method: 'PATCH',
      url: '/api/app/maintenance-request/unable-to-repair',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  underRepairById = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MaintenanceRequestDto>({
      method: 'PATCH',
      url: `/api/app/maintenance-request/${id}/under-repair`,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
