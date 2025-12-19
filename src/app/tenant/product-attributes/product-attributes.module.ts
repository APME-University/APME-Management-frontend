import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductAttributesRoutingModule } from './product-attributes-routing.module';
import { ProductAttributesListComponent } from './product-attributes-list/product-attributes-list.component';
import { CreateUpdateProductAttributeComponent } from './create-update-product-attribute/create-update-product-attribute.component';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';

@NgModule({
  declarations: [
    ProductAttributesListComponent,
    CreateUpdateProductAttributeComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ProductAttributesRoutingModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputSwitchModule,
    DropdownModule,
    InputNumberModule,
    DialogModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
  ],
  providers: [
    MessageService,
    ConfirmationService,
  ],
})
export class ProductAttributesModule {}
