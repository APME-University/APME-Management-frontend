import type { EntityDto, PagedAndSortedResultRequestDto } from '@abp/ng.core';
import type { ProductDto } from '../catalog/products/models';

export interface CreateUpdateDiagnosisDto extends EntityDto {
  code: string;
  description: string;
  solution: string;
  productId: string;
  requireTechnician: boolean;
}

export interface DiagnosisDto extends EntityDto<string> {
  code?: string;
  description?: string;
  solution?: string;
  product: ProductDto;
  requireTechnician: boolean;
}

export interface DiagnosisLookupDto extends EntityDto {
  code?: string;
  description?: string;
  solution?: string;
  requireTechnician: boolean;
  product: ProductDto;
}

export interface GetDiagnosisInputLookupDto extends EntityDto {
  categoryId: string;
  productId?: string;
  code?: string;
}

export interface GetDiagnosisListInputDto extends PagedAndSortedResultRequestDto {
  code?: string;
}

export interface GetLookupDiagnosisInputDto extends EntityDto {
  categoryId: string;
  productId?: string;
  code: string;
}
