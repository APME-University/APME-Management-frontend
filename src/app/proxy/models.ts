import type { EntityDto } from '@abp/ng.core';

export interface LookupDto<T> extends EntityDto<T> {
  name?: string;
}
