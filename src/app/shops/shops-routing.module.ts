import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShopsListComponent } from './shops-list/shops-list.component';

const routes: Routes = [
  {
    path: '',
    component: ShopsListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShopsRoutingModule {}

