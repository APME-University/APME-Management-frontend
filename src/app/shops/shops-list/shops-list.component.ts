import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { ShopService, ShopDto, CreateUpdateShopDto, GetShopListInput } from '../../proxy/shops';
import { CreateUpdateShopComponent } from '../create-update-shop/create-update-shop.component';

@Component({
  selector: 'app-shops-list',
  standalone: false,
  templateUrl: './shops-list.component.html',
  styleUrls: ['./shops-list.component.scss'],
})
export class ShopsListComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  @ViewChild('createUpdateShop') createUpdateShopComponent!: CreateUpdateShopComponent;

  shops: ShopDto[] = [];
  selectedShops: ShopDto[] = [];
  shop: ShopDto = {} as ShopDto;
  shopDialog: boolean = false;
  deleteShopDialog: boolean = false;
  credentialsDialog: boolean = false;
  createdCredentials: { tenantName: string; adminEmail: string; adminPassword: string } | null = null;
  isEditMode: boolean = false;
  loading: boolean = false;
  submitted: boolean = false;
  filterValue: string = '';
  totalRecords: number = 0;
  skipCount: number = 0;
  maxResultCount: number = 10;
  sortField: string = '';
  sortOrder: number = 1;
  isActiveFilter: boolean | null = null;
  statusFilterOptions = [
    { label: 'All', value: null },
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
  ];

  constructor(
    private shopService: ShopService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadShops();
  }

  loadShops() {
    this.loading = true;
    const input: GetShopListInput = {
      filter: this.filterValue,
      isActive: this.isActiveFilter !== null ? this.isActiveFilter : undefined,
      sorting: this.sortField ? `${this.sortField} ${this.sortOrder === 1 ? 'asc' : 'desc'}` : undefined,
      skipCount: this.skipCount,
      maxResultCount: this.maxResultCount,
    };

    this.shopService.getList(input).subscribe({
      next: (result) => {
        this.shops = result.items || [];
        this.totalRecords = result.totalCount || 0;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading shops:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load shops',
          life: 3000,
        });
        this.loading = false;
      },
    });
  }

  openNew() {
    this.shop = {} as ShopDto;
    this.shop.isActive = true;
    this.submitted = false;
    this.shopDialog = true;
    this.isEditMode = false;
  }

  editShop(shop: ShopDto) {
    this.loading = true;
    this.shopService.get(shop.id).subscribe({
      next: (fetchedShop) => {
        this.shop = fetchedShop;
        this.shopDialog = true;
        this.isEditMode = true;
        this.loading = false;
        setTimeout(() => {
          this.ensureFormPopulated();
        }, 100);
      },
      error: (error) => {
        console.error('Error fetching shop details:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch shop details',
          life: 3000,
        });
        this.loading = false;
        this.shop = { ...shop };
        this.shopDialog = true;
        this.isEditMode = true;
        setTimeout(() => {
          this.ensureFormPopulated();
        }, 100);
      },
    });
  }

  deleteShop(shop: ShopDto) {
    this.deleteShopDialog = true;
    this.shop = { ...shop };
  }

  confirmDelete() {
    if (this.shop.id) {
      this.shopService.delete(this.shop.id).subscribe({
        next: () => {
          this.deleteShopDialog = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Shop Deleted',
            life: 3000,
          });
          this.loadShops();
        },
        error: (error) => {
          console.error('Error deleting shop:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete shop',
            life: 3000,
          });
        },
      });
    }
  }

  activateShop(shop: ShopDto) {
    this.confirmationService.confirm({
      message: `Are you sure you want to activate "${shop.name}"?`,
      header: 'Confirm Activation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.shopService.activate(shop.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Shop Activated',
              life: 3000,
            });
            this.loadShops();
          },
          error: (error) => {
            console.error('Error activating shop:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to activate shop',
              life: 3000,
            });
          },
        });
      },
    });
  }

  deactivateShop(shop: ShopDto) {
    this.confirmationService.confirm({
      message: `Are you sure you want to deactivate "${shop.name}"?`,
      header: 'Confirm Deactivation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.shopService.deactivate(shop.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Shop Deactivated',
              life: 3000,
            });
            this.loadShops();
          },
          error: (error) => {
            console.error('Error deactivating shop:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to deactivate shop',
              life: 3000,
            });
          },
        });
      },
    });
  }

  bulkActivate() {
    if (this.selectedShops.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select at least one shop',
        life: 3000,
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to activate ${this.selectedShops.length} shop(s)?`,
      header: 'Confirm Bulk Activation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        let completed = 0;
        let failed = 0;
        this.selectedShops.forEach((shop) => {
          this.shopService.activate(shop.id).subscribe({
            next: () => {
              completed++;
              if (completed + failed === this.selectedShops.length) {
                this.messageService.add({
                  severity: completed === this.selectedShops.length ? 'success' : 'warn',
                  summary: 'Bulk Operation',
                  detail: `${completed} shop(s) activated${failed > 0 ? `, ${failed} failed` : ''}`,
                  life: 3000,
                });
                this.selectedShops = [];
                this.loadShops();
              }
            },
            error: () => {
              failed++;
              if (completed + failed === this.selectedShops.length) {
                this.messageService.add({
                  severity: 'warn',
                  summary: 'Bulk Operation',
                  detail: `${completed} shop(s) activated${failed > 0 ? `, ${failed} failed` : ''}`,
                  life: 3000,
                });
                this.selectedShops = [];
                this.loadShops();
              }
            },
          });
        });
      },
    });
  }

  bulkDeactivate() {
    if (this.selectedShops.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select at least one shop',
        life: 3000,
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to deactivate ${this.selectedShops.length} shop(s)?`,
      header: 'Confirm Bulk Deactivation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        let completed = 0;
        let failed = 0;
        this.selectedShops.forEach((shop) => {
          this.shopService.deactivate(shop.id).subscribe({
            next: () => {
              completed++;
              if (completed + failed === this.selectedShops.length) {
                this.messageService.add({
                  severity: completed === this.selectedShops.length ? 'success' : 'warn',
                  summary: 'Bulk Operation',
                  detail: `${completed} shop(s) deactivated${failed > 0 ? `, ${failed} failed` : ''}`,
                  life: 3000,
                });
                this.selectedShops = [];
                this.loadShops();
              }
            },
            error: () => {
              failed++;
              if (completed + failed === this.selectedShops.length) {
                this.messageService.add({
                  severity: 'warn',
                  summary: 'Bulk Operation',
                  detail: `${completed} shop(s) deactivated${failed > 0 ? `, ${failed} failed` : ''}`,
                  life: 3000,
                });
                this.selectedShops = [];
                this.loadShops();
              }
            },
          });
        });
      },
    });
  }

  hideDialog() {
    this.shopDialog = false;
    this.submitted = false;
  }

  onDialogVisibilityChange(visible: boolean) {
    if (visible && this.isEditMode && this.shop) {
      setTimeout(() => {
        this.ensureFormPopulated();
      }, 100);
    }
  }

  ensureFormPopulated() {
    if (this.createUpdateShopComponent && this.isEditMode && this.shop) {
      this.createUpdateShopComponent.populateForm();
    }
  }

  onShopSave(event: { shop: CreateUpdateShopDto; isEditMode: boolean }) {
    if (event.isEditMode) {
      const updateDto = event.shop as CreateUpdateShopDto;
      if (this.shop.id) {
        this.shopService.update(this.shop.id, updateDto).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Shop Updated',
              life: 3000,
            });
            this.hideDialog();
            this.loadShops();
          },
          error: (error) => {
            console.error('Error updating shop:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update shop',
              life: 3000,
            });
          },
        });
      }
    } else {
      const createDto = event.shop as CreateUpdateShopDto;
      this.shopService.create(createDto).subscribe({
        next: (createdShop) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Shop Created Successfully',
            life: 3000,
          });
          this.hideDialog();
          
          // Show credentials dialog
          if (createDto.tenantName && createDto.adminEmail && createDto.adminPassword) {
            this.createdCredentials = {
              tenantName: createDto.tenantName,
              adminEmail: createDto.adminEmail,
              adminPassword: createDto.adminPassword
            };
            this.credentialsDialog = true;
          }
          
          this.loadShops();
        },
        error: (error) => {
          console.error('Error creating shop:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.error?.message || 'Failed to create shop',
            life: 5000,
          });
        },
      });
    }
  }

  onGlobalFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.filterValue = value;
    this.skipCount = 0;
    this.loadShops();
  }

  onPageChange(event: any) {
    this.skipCount = event.first;
    this.maxResultCount = event.rows;
    if (event.sortField) {
      this.sortField = event.sortField;
      this.sortOrder = event.sortOrder;
    }
    this.loadShops();
  }

  onStatusFilterChange() {
    this.skipCount = 0;
    this.loadShops();
  }

  getSeverity(status: boolean): string {
    return status ? 'success' : 'danger';
  }

  getStatusLabel(status: boolean): string {
    return status ? 'Active' : 'Inactive';
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Copied',
        detail: 'Copied to clipboard',
        life: 2000,
      });
    });
  }

  downloadCredentials() {
    if (!this.createdCredentials) return;
    
    const content = `Shop Tenant Credentials\n\n` +
      `Tenant Name: ${this.createdCredentials.tenantName}\n` +
      `Admin Email: ${this.createdCredentials.adminEmail}\n` +
      `Admin Password: ${this.createdCredentials.adminPassword}\n\n` +
      `Please save these credentials securely. You will need them to log in as the shop admin.`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shop-credentials-${this.createdCredentials.tenantName}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}

