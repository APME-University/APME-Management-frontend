import type { AuditedEntityDto, EntityDto } from '@abp/ng.core';
import type { CategoryDto } from '../catalog/categories/models';

export interface CommonIssueDto extends AuditedEntityDto<string> {
  category: CategoryDto;
  commonIssueItems: CommonIssueItemDto[];
}

export interface CommonIssueItemDto extends EntityDto<string> {
  title?: string;
  description?: string;
}

export interface CreateUpdateCommonIssueDto extends EntityDto {
  categoryId?: string;
  items: CreateUpdateCommonIssueItemDto[];
}

export interface CreateUpdateCommonIssueItemDto extends EntityDto<string> {
  title: string;
  description: string;
}
