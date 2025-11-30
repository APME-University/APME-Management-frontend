import type { EntityDto, PagedAndSortedResultRequestDto } from '@abp/ng.core';

export interface AddressDto extends EntityDto<string> {
  name: string;
  longitude?: string;
  latitude?: string;
  region: string;
  street: string;
  details?: string;
  telephoneNumber: string;
  phoneNumber?: string;
  latitudeDelta?: string;
  longitudeDelta?: string;
}

export interface CreateUpdateAddressDto extends EntityDto {
  name: string;
  longitude?: string;
  latitude?: string;
  cityId: string;
  region: string;
  details?: string;
  phoneNumber?: string;
  latitudeDelta?: string;
  longitudeDelta?: string;
}

export interface GetListAddressInputDto extends PagedAndSortedResultRequestDto {
  customerId?: string;
}

export interface GetNeighborhoodDto {
  stateId: string;
  name?: string;
}

export interface GetStatesDto {
  regionId: string;
  name?: string;
}
