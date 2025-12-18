import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { 
  ProductAttributeService, 
  ProductAttributeDto, 
  CreateUpdateProductAttributeDto,
  GetProductAttributeListInput,
  ProductAttributeDataType
} from '../../../proxy/products';
import { CreateUpdateProductAttributeComponent } from '../create-update-product-attribute/create-update-product-attribute.component';
import { ShopContextService } from '../../../core/services/shop-context.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-product-attributes-list',
  standalone: false,
  templateUrl: './product-attributes-list.component.html',
  styleUrls: ['./product-attributes-list.component.scss'],
})
export class ProductAttributesListComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  @ViewChild('createUpdateProductAttribute') createUpdateProductAttributeComponent!: CreateUpdateProductAttributeComponent;

  productAttributes: ProductAttributeDto[] = [];
  selectedProductAttributes: ProductAttributeDto[] = [];
  productAttribute: ProductAttributeDto = {} as ProductAttributeDto;
  productAttributeDialog: boolean = false;
  deleteProductAttributeDialog: boolean = false;
  isEditMode: boolean = false;
  loading: boolean = false;
  submitted: boolean = false;
  filterValue: string = '';
  totalRecords: number = 0;
  skipCount: number = 0;
  maxResultCount: number = 10;
  sortField: string = '';
  sortOrder: number = 1;
  dataTypeFilter: ProductAttributeDataType | null = null;
  shopId: string | null = null;
  
  dataTypeFilterOptions = [
    { label: 'All Types', value: null },
    { label: 'Text', value: ProductAttributeDataType.Text },
    { label: 'Number', value: ProductAttributeDataType.Number },
    { label: 'Boolean', value: ProductAttributeDataType.Boolean },
    { label: 'Date', value: ProductAttributeDataType.Date },
  ];

  ProductAttributeDataType = ProductAttributeDataType;

  constructor(
    private productAttributeService: ProductAttributeService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private shopContextService: ShopContextService
  ) {}

  ngOnInit() {
    this.loadShopId();
  }

  loadShopId() {
    this.shopContextService.getCurrentShop().pipe(take(1)).subscribe(shop => {
      if (shop?.id) {
        this.shopId = shop.id;
        this.loadProductAttributes();
      } else {
        this.messageService.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'No shop selected. Please select a shop first.',
          life: 3000,
        });
      }
    });
  }

  loadProductAttributes() {
    if (!this.shopId) {
      return;
    }

    this.loading = true;
    const input: GetProductAttributeListInput = {
      filter: this.filterValue,
      shopId: this.shopId,
      dataType: this.dataTypeFilter !== null ? this.dataTypeFilter : undefined,
      sorting: this.sortField ? `${this.sortField} ${this.sortOrder === 1 ? 'asc' : 'desc'}` : undefined,
      skipCount: this.skipCount,
      maxResultCount: this.maxResultCount,
    };

    this.productAttributeService.getList(input).subscribe({
      next: (result) => {
        this.productAttributes = (result.items || []).sort((a, b) => 
          (a.displayOrder || 0) - (b.displayOrder || 0)
        );
        this.totalRecords = result.totalCount || 0;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading product attributes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load product attributes',
          life: 3000,
        });
        this.loading = false;
      },
    });
  }

  openNew() {
    this.productAttribute = {} as ProductAttributeDto;
    this.productAttribute.isRequired = false;
    this.productAttribute.displayOrder = 0;
    this.productAttribute.dataType = ProductAttributeDataType.Text;
    this.submitted = false;
    this.productAttributeDialog = true;
    this.isEditMode = false;
  }

  editProductAttribute(productAttribute: ProductAttributeDto) {
    this.loading = true;
    this.productAttributeService.get(productAttribute.id).subscribe({
      next: (fetchedProductAttribute) => {
        this.productAttribute = fetchedProductAttribute;
        this.productAttributeDialog = true;
        this.isEditMode = true;
        this.loading = false;
        setTimeout(() => {
          this.createUpdateProductAttributeComponent.populateFormPublic();
        }, 100);
      },
      error: (error) => {
        console.error('Error loading product attribute:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load product attribute details',
          life: 3000,
        });
        this.loading = false;
      },
    });
  }

  deleteProductAttribute(productAttribute: ProductAttributeDto) {
    this.productAttribute = { ...productAttribute };
    this.confirmDeleteProductAttribute(productAttribute);
  }

  confirmDeleteProductAttribute(productAttribute: ProductAttributeDto) {
    this.productAttribute = { ...productAttribute };
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${productAttribute.displayName || productAttribute.name}"? This action cannot be undone.`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.performDelete();
      }
    });
  }

  performDelete() {
    if (!this.productAttribute?.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Product attribute ID is missing',
        life: 3000,
      });
      return;
    }

    this.loading = true;
    this.productAttributeService.delete(this.productAttribute.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Product attribute "${this.productAttribute.displayName || this.productAttribute.name}" deleted successfully`,
          life: 3000,
        });
        this.productAttribute = {} as ProductAttributeDto;
        this.loadProductAttributes();
      },
      error: (error) => {
        console.error('Error deleting product attribute:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.error?.message || 'Failed to delete product attribute',
          life: 3000,
        });
        this.loading = false;
      },
    });
  }

  onPageChange(event: any) {
    this.skipCount = event.first;
    this.maxResultCount = event.rows;
    this.loadProductAttributes();
  }

  onSort(event: any) {
    this.sortField = event.field;
    this.sortOrder = event.order === 1 ? 1 : -1;
    this.loadProductAttributes();
  }

  onGlobalFilter(event: any) {
    this.filterValue = event.target.value;
    this.skipCount = 0;
    this.dt.filterGlobal(event.target.value, 'contains');
    this.loadProductAttributes();
  }

  onDataTypeFilterChange() {
    this.skipCount = 0;
    this.loadProductAttributes();
  }

  getDataTypeLabel(dataType: ProductAttributeDataType | undefined): string {
    switch (dataType) {
      case ProductAttributeDataType.Text:
        return 'Text';
      case ProductAttributeDataType.Number:
        return 'Number';
      case ProductAttributeDataType.Boolean:
        return 'Boolean';
      case ProductAttributeDataType.Date:
        return 'Date';
      default:
        return 'Unknown';
    }
  }

  getDataTypeSeverity(dataType: ProductAttributeDataType | undefined): string {
    switch (dataType) {
      case ProductAttributeDataType.Text:
        return 'info';
      case ProductAttributeDataType.Number:
        return 'warning';
      case ProductAttributeDataType.Boolean:
        return 'success';
      case ProductAttributeDataType.Date:
        return 'secondary';
      default:
        return '';
    }
  }

  onSave(event: { productAttribute: CreateUpdateProductAttributeDto; isEditMode: boolean }) {
    this.productAttributeDialog = false;
    this.loadProductAttributes();
  }

  hideDialog() {
    this.productAttributeDialog = false;
    this.submitted = false;
  }
}
