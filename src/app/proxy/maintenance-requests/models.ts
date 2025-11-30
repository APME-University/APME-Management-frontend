import type { AuditedEntityDto, EntityDto, PagedAndSortedResultRequestDto, PagedResultRequestDto } from '@abp/ng.core';
import type { MaintenanceRequestPriority } from './maintenance-request-priority.enum';
import type { MaintenanceRequestFees } from './maintenance-request-fees.enum';
import type { WarrantyStatus } from './warranty-status.enum';
import type { IRemoteStreamContent } from '../volo/abp/content/models';
import type { MaintenanceRequestStatus } from './maintenance-request-status.enum';
import type { CustomerDto } from '../customers/models';
import type { ProductDto } from '../catalog/products/models';
import type { CategoryDto } from '../catalog/categories/models';
import type { AddressDto } from '../customers/addresses/models';
import type { TechnicianDto } from '../technicians/models';
import type { RateDto } from '../ratings/models';

export interface AssignTechnicianDto extends EntityDto<string> {
  technicianId?: string;
  time?: string;
  maintenanceRequestPriority?: MaintenanceRequestPriority;
  priorityReason?: string;
  feesStatus?: MaintenanceRequestFees;
  feesReason?: string;
}

export interface CancelRequestDto extends EntityDto<string> {
  reason: string;
}

export interface ChangeAddressDto extends EntityDto<string> {
  addressId: string;
}

export interface CreateMaintenanceRequestDto extends EntityDto {
  productId?: string;
  categoryId: string;
  warrantyStatus: WarrantyStatus;
  description: string;
  asap?: boolean;
  visitTime?: string;
  addressId?: string;
  mediaFile: IRemoteStreamContent;
}

export interface DoneRepairInputDto extends EntityDto<string> {
  summary: string;
}

export interface GetListMaintenanceRequestInputDto extends PagedAndSortedResultRequestDto {
  status?: MaintenanceRequestStatus;
  customerId?: string;
  phoneNumber?: string;
  from?: string;
  to?: string;
  technicianId?: string;
  requestGeneratedId?: string;
}

export interface GetRatesByTechnicianInputDto extends PagedResultRequestDto {
  id?: string;
}

export interface MaintenanceRequestDto extends AuditedEntityDto<string> {
  requestGeneratedId: number;
  description: string;
  mediaUrl?: string;
  customer: CustomerDto;
  product: ProductDto;
  category: CategoryDto;
  address: AddressDto;
  asap: boolean;
  visitTime?: string;
  actualVisitTime?: string;
  warrantyStatus?: WarrantyStatus;
  status?: MaintenanceRequestStatus;
  reasonForCancellation?: string;
  technician: TechnicianDto;
  maintenanceRequestPriority?: MaintenanceRequestPriority;
  priorityReason?: string;
  feesStatus?: MaintenanceRequestFees;
  feesReason?: string;
  estimatedDelivery?: string;
  receivedDate?: string;
  summary?: string;
  rate: RateDto;
}

export interface MaintenanceRequestLogDto extends AuditedEntityDto<string> {
  status?: MaintenanceRequestStatus;
}

export interface OnTheWayRequestInputDto extends EntityDto<string> {
  minutes: number;
}

export interface RateMaintenanceRequestDto extends EntityDto<string> {
  value: number;
  comment?: string;
}

export interface RejectMaintenanceRequest extends EntityDto<string> {
  reason?: string;
}

export interface RequireInHoursInputDto extends EntityDto<string> {
  summary: string;
}

export interface RescheduleInputDto extends EntityDto<string> {
  reason: string;
}

export interface UnableToRepairInputDto extends EntityDto<string> {
  summary?: string;
}
