import type { EntityDto, FullAuditedEntityDto, PagedAndSortedResultRequestDto } from '@abp/ng.core';
import type { OrderStatus } from './order-status.enum';
import type { AddressDto } from '../customers/addresses/models';
import type { CustomerDto } from '../customers/models';
import type { ProductColorDto, ProductDto } from '../catalog/products/models';

export interface AcceptOrderDto extends EntityDto<string> {
  driverName?: string;
  driverPhoneNumber?: string;
  isFreeDelivery: boolean;
  freeDeliveryReason?: string;
  deliveryFees?: number;
  startTime?: string;
  endTime?: string;
  day?: string;
}

export interface CancelOrderInputDto extends EntityDto<string> {
  reasonForCancellation?: string;
}

export interface CreateOrderDto extends EntityDto {
  addressId?: string;
  orderItems: CreateOrderItemDto[];
}

export interface CreateOrderItemDto extends EntityDto {
  productId?: string;
  productColorId?: string;
  quantity: number;
}

export interface GetListOrderInputDto extends PagedAndSortedResultRequestDto {
  requestGeneratedId?: string;
  phoneNumber?: string;
  customerId?: string;
  status?: OrderStatus;
  from?: string;
  to?: string;
}

export interface OrderDto extends FullAuditedEntityDto<string> {
  requestGeneratedId?: string;
  address: AddressDto;
  customer: CustomerDto;
  orderItems: OrderItemDto[];
  total: number;
  driverName?: string;
  isFreeDelivery: boolean;
  driverPhoneNumber?: string;
  freeDeliveryReason?: string;
  deliveryFees?: number;
  status?: OrderStatus;
  reasonForCancellation?: string;
  startTime?: string;
  endTime?: string;
  day?: string;
}

export interface OrderItemDto extends EntityDto<string> {
  product: ProductDto;
  productColor: ProductColorDto;
  quantity: number;
  total: number;
}

export interface OrderLogDto extends EntityDto<string> {
  status?: OrderStatus;
}

export interface RescheduleOrderInputDto extends EntityDto<string> {
  reason?: string;
}
