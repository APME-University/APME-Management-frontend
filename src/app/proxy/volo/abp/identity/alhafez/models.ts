import type { EntityDto } from '@abp/ng.core';

export interface CityDto extends EntityDto<string> {
  name?: string;
}
