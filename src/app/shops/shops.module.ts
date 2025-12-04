import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CoreModule } from '@abp/ng.core';
import { CardModule } from '@abp/ng.theme.shared';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TagModule } from 'primeng/tag';
import { RippleModule } from 'primeng/ripple';
import { SkeletonModule } from 'primeng/skeleton';
import { DropdownModule } from 'primeng/dropdown';
import { Textarea } from 'primeng/inputtextarea';
import { ShopsRoutingModule } from './shops-routing.module';
import { ShopsListComponent } from './shops-list/shops-list.component';
import { CreateUpdateShopComponent } from './create-update-shop/create-update-shop.component';
import { ConfirmationService } from 'primeng/api';

@NgModule({
  declarations: [
    ShopsListComponent,
    CreateUpdateShopComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CoreModule,
    CardModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule,
    ToolbarModule,
    DialogModule,
    InputSwitchModule,
    TagModule,
    RippleModule,
    SkeletonModule,
    DropdownModule,
    Textarea,
    ShopsRoutingModule,
  ],
  providers: [
    ConfirmationService,
  ],
})
export class ShopsModule {}

