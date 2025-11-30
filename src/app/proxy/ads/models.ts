import type { EntityDto, FullAuditedEntityDto } from '@abp/ng.core';
import type { IRemoteStreamContent } from '../volo/abp/content/models';

export interface AdvertismentDto extends FullAuditedEntityDto<string> {
  image?: string;
}

export interface CreateUpdateAdvertismentDto extends EntityDto {
  image: IRemoteStreamContent;
}
