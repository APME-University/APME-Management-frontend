import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { ProductService, ProductDto, CreateUpdateProductDto, GetProductListInput } from '../../../proxy/products';
import { CreateUpdateProductComponent } from '../create-update-product/create-update-product.component';
import { ShopContextService } from '../../../core/services/shop-context.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-products-list',
  standalone: false,
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss'],
})
export class ProductsListComponent implements OnInit, OnDestroy {
  @ViewChild('dt') dt!: Table;
  @ViewChild('createUpdateProduct') createUpdateProductComponent!: CreateUpdateProductComponent;

  products: ProductDto[] = [];
  selectedProducts: ProductDto[] = [];
  product: ProductDto = {} as ProductDto;
  productDialog: boolean = false;
  deleteProductDialog: boolean = false;
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
  isPublishedFilter: boolean | null = null;
  categoryFilter: string | null = null;
  
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  statusFilterOptions = [
    { label: 'All', value: null },
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
  ];

  publishedFilterOptions = [
    { label: 'All', value: null },
    { label: 'Published', value: true },
    { label: 'Unpublished', value: false },
  ];

  constructor(
    private productService: ProductService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private shopContextService: ShopContextService
  ) {}

  ngOnInit() {
    // Setup debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchValue => {
      this.filterValue = searchValue;
      this.skipCount = 0;
      this.loadProducts();
    });
    
    this.loadProducts();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProducts() {
    this.loading = true;
    const shopId = this.shopContextService.getCurrentShopId();
    
    // Build input object following ABP.IO practices - only include defined values
    const input: GetProductListInput = {
      skipCount: this.skipCount,
      maxResultCount: this.maxResultCount,
    };

    // Add filter if provided
    if (this.filterValue && this.filterValue.trim()) {
      input.filter = this.filterValue.trim();
    }

    // Add shopId if available
    if (shopId) {
      input.shopId = shopId;
    }

    // Add category filter if set
    if (this.categoryFilter) {
      input.categoryId = this.categoryFilter;
    }

    // Add status filters only if explicitly set (not null)
    if (this.isActiveFilter !== null && this.isActiveFilter !== undefined) {
      input.isActive = this.isActiveFilter;
    }

    if (this.isPublishedFilter !== null && this.isPublishedFilter !== undefined) {
      input.isPublished = this.isPublishedFilter;
    }

    // Add sorting if field is specified (ABP.IO format: "fieldName" or "fieldName asc/desc")
    if (this.sortField) {
      input.sorting = this.sortOrder === 1 ? `${this.sortField} asc` : `${this.sortField} desc`;
    }

    this.productService.getList(input).subscribe({
      next: (result) => {
        this.products = result.items || [];
        this.totalRecords = result.totalCount || 0;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load products',
          life: 3000,
        });
        this.loading = false;
      },
    });
  }

  openNew() {
    this.product = {} as ProductDto;
    this.product.isActive = true;
    this.product.isPublished = false;
    this.product.stockQuantity = 0;
    this.product.price = 0;
    this.submitted = false;
    this.productDialog = true;
    this.isEditMode = false;
  }

  editProduct(product: ProductDto) {
    this.loading = true;
    this.productService.get(product.id).subscribe({
      next: (fetchedProduct) => {
        this.product = fetchedProduct;
        this.productDialog = true;
        this.isEditMode = true;
        this.loading = false;
        setTimeout(() => {
          this.createUpdateProductComponent.populateFormPublic();
        }, 100);
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load product details',
          life: 3000,
        });
        this.loading = false;
      },
    });
  }

  deleteProduct(product: ProductDto) {
    this.product = { ...product };
    this.confirmDeleteProduct(product);
  }

  confirmDeleteProduct(product: ProductDto) {
    this.product = { ...product };
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.performDelete();
      }
    });
  }

  performDelete() {
    if (!this.product?.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Product ID is missing',
        life: 3000,
      });
      return;
    }

    this.loading = true;
    this.productService.delete(this.product.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Product "${this.product.name}" deleted successfully`,
          life: 3000,
        });
        this.product = {} as ProductDto;
        this.loadProducts();
      },
      error: (error) => {
        console.error('Error deleting product:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.error?.message || 'Failed to delete product',
          life: 3000,
        });
        this.loading = false;
      },
    });
  }

  bulkPublish() {
    if (this.selectedProducts.length === 0) return;
    
    this.confirmationService.confirm({
      message: `Are you sure you want to publish ${this.selectedProducts.length} selected product(s)?`,
      header: 'Confirm Publish',
      icon: 'pi pi-check-circle',
      accept: () => {
        this.selectedProducts.forEach(prod => {
          if (!prod.isPublished) {
            this.togglePublished(prod);
          }
        });
        this.selectedProducts = [];
      }
    });
  }

  bulkUnpublish() {
    if (this.selectedProducts.length === 0) return;
    
    this.confirmationService.confirm({
      message: `Are you sure you want to unpublish ${this.selectedProducts.length} selected product(s)?`,
      header: 'Confirm Unpublish',
      icon: 'pi pi-times-circle',
      accept: () => {
        this.selectedProducts.forEach(prod => {
          if (prod.isPublished) {
            this.togglePublished(prod);
          }
        });
        this.selectedProducts = [];
      }
    });
  }

  onFilterChange() {
    this.skipCount = 0;
    this.loadProducts();
  }

  getStockClass(quantity: number): string {
    if (quantity === 0) return 'stock-out';
    if (quantity < 10) return 'stock-low';
    return 'stock-ok';
  }

  getStockIcon(quantity: number): string {
    if (quantity === 0) return 'pi pi-times-circle';
    if (quantity < 10) return 'pi pi-exclamation-triangle';
    return 'pi pi-check-circle';
  }

  toggleActive(product: ProductDto) {
    const updateDto = {
      shopId: product.shopId,
      categoryId: product.categoryId,
      name: product.name,
      slug: product.slug,
      description: product.description,
      sku: product.sku,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      stockQuantity: product.stockQuantity,
      isActive: !product.isActive,
      isPublished: product.isPublished,
      attributes: product.attributes,
    } as CreateUpdateProductDto;

    this.productService.update(product.id, updateDto).subscribe({
      next: (updatedProduct) => {
        const index = this.products.findIndex((p) => p.id === updatedProduct.id);
        if (index !== -1) {
          this.products[index] = updatedProduct;
        }
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Product ${updatedProduct.isActive ? 'activated' : 'deactivated'} successfully`,
          life: 3000,
        });
      },
      error: (error) => {
        console.error('Error updating product:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update product status',
          life: 3000,
        });
      },
    });
  }

  togglePublished(product: ProductDto) {
    const updateDto = {
      shopId: product.shopId,
      categoryId: product.categoryId,
      name: product.name,
      slug: product.slug,
      description: product.description,
      sku: product.sku,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      stockQuantity: product.stockQuantity,
      isActive: product.isActive,
      isPublished: !product.isPublished,
      attributes: product.attributes,
    } as CreateUpdateProductDto;

    this.productService.update(product.id, updateDto).subscribe({
      next: (updatedProduct) => {
        const index = this.products.findIndex((p) => p.id === updatedProduct.id);
        if (index !== -1) {
          this.products[index] = updatedProduct;
        }
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Product ${updatedProduct.isPublished ? 'published' : 'unpublished'} successfully`,
          life: 3000,
        });
      },
      error: (error) => {
        console.error('Error updating product:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update product publish status',
          life: 3000,
        });
      },
    });
  }

  onProductSave(event: { product: CreateUpdateProductDto; isEditMode: boolean; imageFiles: Array<File | string> }) {
    this.submitted = true;
    this.loading = true;

    if (event.isEditMode) {
      // Update product - handle image updates following Court pattern
      this.handleProductUpdate(event.product, event.imageFiles);
    } else {
      // Create product with images in single request using FormData
      this.handleProductCreate(event.product, event.imageFiles);
    }
  }

  /**
   * Handle product creation (following Court pattern)
   */
  private handleProductCreate(productDto: CreateUpdateProductDto, imageFiles: Array<File | string>) {
    const formData = new FormData();
    
    // Append all product properties to FormData
    formData.append('shopId', productDto.shopId);
    if (productDto.categoryId) {
      formData.append('categoryId', productDto.categoryId);
    }
    formData.append('name', productDto.name);
    formData.append('slug', productDto.slug);
    formData.append('sku', productDto.sku);
    formData.append('price', productDto.price.toString());
    if (productDto.compareAtPrice) {
      formData.append('compareAtPrice', productDto.compareAtPrice.toString());
    }
    formData.append('stockQuantity', productDto.stockQuantity.toString());
    formData.append('isActive', productDto.isActive.toString());
    formData.append('isPublished', productDto.isPublished.toString());
    if (productDto.description) {
      formData.append('description', productDto.description);
    }
    if (productDto.attributes) {
      formData.append('attributes', productDto.attributes);
    }
    
    // Append image files (only File objects, not strings) - following Court pattern
    // Send as "images" array to match backend IList<IRemoteStreamContent>? Images
    imageFiles.forEach((item) => {
      if (item instanceof File) {
        formData.append('images', item, item.name);
      }
    });
    
    this.productService.create(formData).subscribe({
      next: (createdProduct) => {
        // Upload additional images if provided (skip first one as it's already uploaded)
        const additionalImages = imageFiles.filter((item, index) => 
          item instanceof File && index > 0
        ) as File[];
        
        if (additionalImages.length > 0) {
          this.uploadProductImages(createdProduct.id, additionalImages);
        } else {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Product created successfully',
            life: 3000,
          });
          this.productDialog = false;
          this.product = {} as ProductDto;
          this.loadProducts();
        }
      },
      error: (error) => {
        console.error('Error creating product:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.error?.message || 'Failed to create product',
          life: 3000,
        });
        this.loading = false;
      },
    });
  }

  /**
   * Handle product update - images are handled separately via APIs
   */
  private handleProductUpdate(productDto: CreateUpdateProductDto, imageFiles: Array<File | string>) {
    // Create FormData for update (NO images - they're handled by separate APIs)
    const formData = new FormData();
    
    // Append all product properties to FormData
    formData.append('shopId', productDto.shopId);
    if (productDto.categoryId) {
      formData.append('categoryId', productDto.categoryId);
    }
    formData.append('name', productDto.name);
    formData.append('slug', productDto.slug);
    formData.append('sku', productDto.sku);
    formData.append('price', productDto.price.toString());
    if (productDto.compareAtPrice) {
      formData.append('compareAtPrice', productDto.compareAtPrice.toString());
    }
    formData.append('stockQuantity', productDto.stockQuantity.toString());
    formData.append('isActive', productDto.isActive.toString());
    formData.append('isPublished', productDto.isPublished.toString());
    if (productDto.description) {
      formData.append('description', productDto.description);
    }
    if (productDto.attributes) {
      formData.append('attributes', productDto.attributes);
    }
    
    // Note: Images are NOT included here - they're handled by separate APIs:
    // - uploadProductImage: called immediately when user adds image
    // - deleteProductImage: called immediately when user removes image
    // - setPrimaryImage: called immediately when user sets primary image
    
    this.productService.update(this.product.id, formData).subscribe({
      next: (updatedProduct) => {
        // Update complete - images were already handled separately
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Product updated successfully',
          life: 3000,
        });
        this.productDialog = false;
        this.product = {} as ProductDto;
        this.loadProducts();
      },
      error: (error) => {
        console.error('Error updating product:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.error?.message || 'Failed to update product',
          life: 3000,
        });
        this.loading = false;
      },
    });
  }

  /**
   * Delete removed images from backend (following Court pattern)
   */
  private deleteRemovedImages(productId: string, imageUrls: string[]) {
    let deleteCount = 0;
    const totalDeletes = imageUrls.length;

    imageUrls.forEach(imageUrl => {
      this.productService.deleteProductImage(productId, imageUrl).subscribe({
        next: () => {
          deleteCount++;
          if (deleteCount === totalDeletes) {
            // All deletions complete
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Product updated successfully',
              life: 3000,
            });
            this.productDialog = false;
            this.product = {} as ProductDto;
            this.loadProducts();
          }
        },
        error: (error) => {
          console.error('Error deleting image:', error);
          deleteCount++;
          // Continue even if one deletion fails
          if (deleteCount === totalDeletes) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Product updated successfully (some images may not have been removed)',
              life: 3000,
            });
            this.productDialog = false;
            this.product = {} as ProductDto;
            this.loadProducts();
          }
        },
      });
    });
  }

  uploadProductImages(productId: string, files: File[]) {
    let uploadCount = 0;
    const totalFiles = files.length;

    files.forEach((file, index) => {
      this.productService.uploadProductImage(productId, file as any, index === 0).subscribe({
        next: () => {
          uploadCount++;
          if (uploadCount === totalFiles) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: `Product ${this.isEditMode ? 'updated' : 'created'} successfully`,
              life: 3000,
            });
            this.productDialog = false;
            this.product = {} as ProductDto;
            this.loadProducts();
          }
        },
        error: (error) => {
          console.error('Error uploading image:', error);
          uploadCount++;
          if (uploadCount === totalFiles) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Warning',
              detail: 'Product saved but some images failed to upload. You can upload them later.',
              life: 5000,
            });
            this.productDialog = false;
            this.product = {} as ProductDto;
            this.loadProducts();
          }
        },
      });
    });
  }

  hideDialog() {
    this.productDialog = false;
    this.submitted = false;
    this.product = {} as ProductDto;
    this.isEditMode = false;
  }

  onGlobalFilter(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }

  clearAllFilters() {
    this.filterValue = '';
    this.isActiveFilter = null;
    this.isPublishedFilter = null;
    this.categoryFilter = null;
    this.skipCount = 0;
    this.sortField = '';
    this.sortOrder = 1;
    this.loadProducts();
  }

  onPageChange(event: any) {
    this.skipCount = event.first;
    this.maxResultCount = event.rows;
    this.loadProducts();
  }

  onSort(event: any) {
    this.sortField = event.field || '';
    this.sortOrder = event.order === 1 ? 1 : -1;
    this.skipCount = 0; // Reset to first page when sorting changes
    this.loadProducts();
  }

  getImageUrl(imageUrl?: string): string {
    if (!imageUrl) return 'assets/images/placeholder.png';
    // Extract blob name from URL and construct proper image URL
    const blobName = this.extractBlobNameFromUrl(imageUrl);
    if (blobName && imageUrl.includes('/product/')) {
      const productId = imageUrl.split('/product/')[1]?.split('/')[0];
      if (productId) {
        // Use the get image endpoint
        return `/api/app/product/${productId}/get-product-image/${blobName}`;
      }
    }
    return imageUrl;
  }

  private extractBlobNameFromUrl(url: string): string | null {
    if (!url) return null;
    const parts = url.split('/');
    const imageIndex = parts.indexOf('image');
    if (imageIndex >= 0 && imageIndex < parts.length - 1) {
      return parts[imageIndex + 1];
    }
    return null;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/placeholder.png';
  }

  hasActiveFilters(): boolean {
    return !!(
      this.filterValue ||
      this.isActiveFilter !== null ||
      this.isPublishedFilter !== null ||
      this.categoryFilter
    );
  }
}

