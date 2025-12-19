import { mapEnumToOptions } from '@abp/ng.core';

export enum ProductAttributeDataType {
  Text = 0,
  Number = 1,
  Boolean = 2,
  Date = 3,
}

export const productAttributeDataTypeOptions = mapEnumToOptions(ProductAttributeDataType);
