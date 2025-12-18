import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductAttributesListComponent } from './product-attributes-list/product-attributes-list.component';

const routes: Routes = [
  {
    path: '',
    component: ProductAttributesListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductAttributesRoutingModule {}
