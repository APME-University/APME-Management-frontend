import { mapEnumToOptions } from '@abp/ng.core';

export enum CategoryType {
  Home = 0,
  Commercial = 1,
}

export const categoryTypeOptions = mapEnumToOptions(CategoryType);
