import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
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

import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TagModule } from 'primeng/tag';
import { RippleModule } from 'primeng/ripple';
import { MultiSelectModule } from 'primeng/multiselect';
import { Textarea } from 'primeng/inputtextarea';
import { UsersRoutingModule } from './users-routing.module';
import { UsersListComponent } from './users-list/users-list.component';
import { CreateUpdateUserComponent } from './create-update-user/create-update-user.component';
import { ConfirmationService } from 'primeng/api';

@NgModule({
  declarations: [UsersListComponent, CreateUpdateUserComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
    CheckboxModule,
    DropdownModule,
    CalendarModule,
    InputSwitchModule,
    TagModule,
    RippleModule,
    MultiSelectModule,
    Textarea,
    UsersRoutingModule,
  ],
  providers: [
    ConfirmationService
  ]
})
export class UsersModule { }
