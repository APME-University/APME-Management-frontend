import { RestService, Rest } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FackService {
  apiName = 'Default';
  

  returnNull = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'POST',
      url: '/api/app/fack/return-null',
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
