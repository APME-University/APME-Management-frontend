import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';

// import { AuthService } from '../../proxy/auth.service';
import { CreateUpdateUserComponent } from '../create-update-user/create-update-user.component';
import { IdentityUserCreateDto, IdentityUserDto, IdentityUserService, IdentityUserUpdateDto } from '@abp/ng.identity/proxy';

@Component({
  selector: 'app-users-list',
  standalone: false,
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  @ViewChild('createUpdateUser') createUpdateUserComponent!: CreateUpdateUserComponent;

  users: IdentityUserDto[] = [];
  selectedUsers: IdentityUserDto[] = [];
  user: IdentityUserDto = {} as IdentityUserDto;
  userDialog: boolean = false;
  deleteUserDialog: boolean = false;
  resetPasswordDialog: boolean = false;
  isEditMode: boolean = false;
  loading: boolean = false;
  submitted: boolean = false;
  filterValue: string = '';
  totalRecords: number = 0;
  skipCount: number = 0;
  maxResultCount: number = 10;
  sortField: string = '';
  sortOrder: number = 1;

  // Reset password form
  resetPasswordForm = {
    newPassword: '',
    confirmPassword: ''
  };

  constructor(
    private identityUserService: IdentityUserService,
    // private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    const input = {
      filter: this.filterValue,
      sorting: this.sortField,
      skipCount: this.skipCount,
      maxResultCount: this.maxResultCount
    };

    this.identityUserService.getList(input).subscribe({
      next: (result) => {
        this.users = result.items || [];
        this.totalRecords = result.totalCount || 0;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load users',
          life: 3000
        });
        this.loading = false;
      }
    });
  }

  openNew() {
    this.user = {} as IdentityUserDto;
    this.user.isActive = true;
    this.user.lockoutEnabled = false;
    this.submitted = false;
    this.userDialog = true;
    this.isEditMode = false;
  }

  editUser(user: IdentityUserDto) {
    this.loading = true;
    
    this.identityUserService.get(user.id).subscribe({
      next: (fetchedUser) => {
        console.log('User details fetched successfully:', fetchedUser);
        this.user = fetchedUser;
        this.userDialog = true;
        this.isEditMode = true;
        this.loading = false;
        
        // Manually trigger form population after a short delay to ensure the dialog is rendered
        setTimeout(() => {
          this.ensureFormPopulated();
        }, 100);
      },
      error: (error) => {
        console.error('Error fetching user details:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch user details',
          life: 3000
        });
        this.loading = false;
        
        // Fallback to using the user data from the list
        this.user = { ...user };
        this.userDialog = true;
        this.isEditMode = true;
        
        // Manually trigger form population after a short delay to ensure the dialog is rendered
        setTimeout(() => {
          this.ensureFormPopulated();
        }, 100);
      }
    });
  }

  deleteUser(user: IdentityUserDto) {
    this.deleteUserDialog = true;
    this.user = { ...user };
  }

  confirmDelete() {
    if (this.user.id) {
      this.identityUserService.delete(this.user.id).subscribe({
        next: () => {
          this.deleteUserDialog = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'User Deleted',
            life: 3000
          });
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete user',
            life: 3000
          });
        }
      });
    }
  }

  hideDialog() {
    this.userDialog = false;
    this.submitted = false;
  }

  onDialogVisibilityChange(visible: boolean) {
    if (visible && this.isEditMode && this.user) {
      // When dialog becomes visible in edit mode, ensure form is populated
      setTimeout(() => {
        this.ensureFormPopulated();
      }, 100);
    }
  }

  onUserDataChange() {
    if (this.userDialog && this.isEditMode && this.user) {
      // When user data changes in edit mode, ensure form is populated
      setTimeout(() => {
        this.ensureFormPopulated();
      }, 100);
    }
  }

  onEditModeChange() {
    if (this.userDialog && this.isEditMode && this.user) {
      // When edit mode changes to true, ensure form is populated
      setTimeout(() => {
        this.ensureFormPopulated();
      }, 100);
    }
  }

  // Method to manually ensure form is populated
  ensureFormPopulated() {
    if (this.createUpdateUserComponent && this.isEditMode && this.user) {
      console.log('Manually ensuring form is populated');
      this.createUpdateUserComponent.populateForm();
    }
  }

  // Method to test cities functionality

  // Method to manually test save operation
  testSaveOperation() {
    if (this.createUpdateUserComponent) {
      console.log('Testing save operation');
      // This will trigger the onSave method in the create-update-user component
      this.createUpdateUserComponent.onSave();
    }
  }

  onUserSave(event: { user: any, isEditMode: boolean }) {
    console.log('onUserSave called with event:', event);
    
    if (event.isEditMode) {
      // Update user
      const updateDto = event.user as IdentityUserUpdateDto;
      console.log('Update DTO before processing:', updateDto);
      
      // Ensure cities is properly set
 
      if (this.user.id) {
        this.identityUserService.update(this.user.id, updateDto).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'User Updated',
              life: 3000
            });
            this.hideDialog();
            this.loadUsers();
          },
          error: (error) => {
            console.error('Error updating user:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update user',
              life: 3000
            });
          }
        });
      }
    } else {
      // Create user
      const createDto = event.user as IdentityUserCreateDto;
      
      // Ensure cities is properly set

      this.identityUserService.create(createDto).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'User Created Successfully',
            life: 3000
          });
          this.hideDialog();
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error creating user:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create user',
            life: 3000
          });
        }
      });
    }
  }



  openResetPasswordDialog(user: IdentityUserDto) {
    this.user = { ...user };
    this.resetPasswordForm = {
      newPassword: '',
      confirmPassword: ''
    };
    this.resetPasswordDialog = true;
  }

  resetPassword() {
    if (this.resetPasswordForm.newPassword !== this.resetPasswordForm.confirmPassword) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Passwords do not match',
        life: 3000
      });
      return;
    }

    if (this.resetPasswordForm.newPassword.length < 6) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Password must be at least 6 characters long',
        life: 3000
      });
      return;
    }

    // For now, we'll use the update method to change password
    // In a real scenario, you might have a dedicated reset password endpoint
    if (this.user.id) {
             const updateDto: IdentityUserUpdateDto = {
         userName: this.user.userName,
         name: this.user.name,
         surname: this.user.surname,
         email: this.user.email,
         phoneNumber: this.user.phoneNumber,
         isActive: this.user.isActive,
         lockoutEnabled: this.user.lockoutEnabled,
         roleNames: [], // Empty array for now
         password: this.resetPasswordForm.newPassword,
         concurrencyStamp: this.user.concurrencyStamp
       };

      this.identityUserService.update(this.user.id, updateDto).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Password Reset Successfully',
            life: 3000
          });
          this.resetPasswordDialog = false;
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error resetting password:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to reset password',
            life: 3000
          });
        }
      });
    }
  }

  hideResetPasswordDialog() {
    this.resetPasswordDialog = false;
    this.resetPasswordForm = {
      newPassword: '',
      confirmPassword: ''
    };
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  onPageChange(event: any) {
    this.skipCount = event.first;
    this.maxResultCount = event.rows;
    this.loadUsers();
  }

  getSeverity(status: boolean): string {
    return status ? 'success' : 'danger';
  }

  getStatusLabel(status: boolean): string {
    return status ? '::Active' : '::Inactive';
  }

}
