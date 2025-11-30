import { RestService, Rest } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  apiName = 'Default';
  

  sendForCustomer = (id: string, title: string, body: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'POST',
      url: `/api/app/firebase/${id}/send-for-customer`,
      params: { title, body },
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
