import type { EntityDto } from '@abp/ng.core';

export interface RateDto extends EntityDto<string> {
  value: number;
  comment?: string;
}
