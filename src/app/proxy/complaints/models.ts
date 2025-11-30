import type { AuditedEntityDto, EntityDto, PagedAndSortedResultRequestDto } from '@abp/ng.core';
import type { ComplaintStatus } from './complaint-status.enum';
import type { ComplaintReason } from './complaint-reason.enum';
import type { CustomerDto } from '../customers/models';

export interface ComplainDto extends AuditedEntityDto<string> {
  status?: ComplaintStatus;
  reason?: ComplaintReason;
  description: string;
  repliedDescription?: string;
  customer: CustomerDto;
}

export interface CreateUpdateComplainDto extends EntityDto {
  reason?: ComplaintReason;
  description: string;
}

export interface GetListComplainInputDto extends PagedAndSortedResultRequestDto {
  name?: string;
  status?: ComplaintStatus;
  phoneNumber?: string;
  filter?: string;
}

export interface ReplyComplainDto extends EntityDto<string> {
  repliedDescription: string;
}
