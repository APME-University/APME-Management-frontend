import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { CategoryService, CategoryDto, CreateUpdateCategoryDto, GetCategoryListInput } from '../../../proxy/categories';
import { CreateUpdateCategoryComponent } from '../create-update-category/create-update-category.component';

@Component({
  selector: 'app-categories-list',
  standalone: false,
  templateUrl: './categories-list.component.html',
  styleUrls: ['./categories-list.component.scss'],
})
export class CategoriesListComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  @ViewChild('createUpdateCategory') createUpdateCategoryComponent!: CreateUpdateCategoryComponent;

  categories: CategoryDto[] = [];
  selectedCategories: CategoryDto[] = [];
  category: CategoryDto = {} as CategoryDto;
  categoryDialog: boolean = false;
  deleteCategoryDialog: boolean = false;
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
  parentFilter: string | null = null;
  
  statusFilterOptions = [
    { label: 'All', value: null },
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
  ];

  constructor(
    private categoryService: CategoryService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading = true;
    const input: GetCategoryListInput = {
      filter: this.filterValue,
      isActive: this.isActiveFilter !== null ? this.isActiveFilter : undefined,
      parentId: this.parentFilter || undefined,
      sorting: this.sortField ? `${this.sortField} ${this.sortOrder === 1 ? 'asc' : 'desc'}` : undefined,
      skipCount: this.skipCount,
      maxResultCount: this.maxResultCount,
    };

    this.categoryService.getList(input).subscribe({
      next: (result) => {
        this.categories = result.items || [];
        this.totalRecords = result.totalCount || 0;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load categories',
          life: 3000,
        });
        this.loading = false;
      },
    });
  }

  openNew() {
    this.category = {} as CategoryDto;
    this.category.isActive = true;
    this.category.displayOrder = 0;
    this.submitted = false;
    this.categoryDialog = true;
    this.isEditMode = false;
  }

  editCategory(category: CategoryDto) {
    this.loading = true;
    this.categoryService.get(category.id).subscribe({
      next: (fetchedCategory) => {
        this.category = fetchedCategory;
        this.categoryDialog = true;
        this.isEditMode = true;
        this.loading = false;
        setTimeout(() => {
          this.createUpdateCategoryComponent.populateFormPublic();
        }, 100);
      },
      error: (error) => {
        console.error('Error loading category:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load category details',
          life: 3000,
        });
        this.loading = false;
      },
    });
  }


  deleteCategory(category: CategoryDto) {
    this.category = { ...category };
    this.confirmDeleteCategory(category);
  }

  confirmDeleteCategory(category: CategoryDto) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.performDelete();
      }
    });
  }

  performDelete() {
    this.loading = true;
    this.categoryService.delete(this.category.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Category "${this.category.name}" deleted successfully`,
          life: 3000,
        });
        this.category = {} as CategoryDto;
        this.loadCategories();
      },
      error: (error) => {
        console.error('Error deleting category:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.error?.message || 'Failed to delete category',
          life: 3000,
        });
        this.loading = false;
      },
    });
  }

  bulkActivate() {
    if (this.selectedCategories.length === 0) return;
    
    this.confirmationService.confirm({
      message: `Are you sure you want to activate ${this.selectedCategories.length} selected category(ies)?`,
      header: 'Confirm Activation',
      icon: 'pi pi-check-circle',
      accept: () => {
        this.selectedCategories.forEach(cat => {
          if (!cat.isActive) {
            this.toggleActive(cat);
          }
        });
        this.selectedCategories = [];
      }
    });
  }

  bulkDeactivate() {
    if (this.selectedCategories.length === 0) return;
    
    this.confirmationService.confirm({
      message: `Are you sure you want to deactivate ${this.selectedCategories.length} selected category(ies)?`,
      header: 'Confirm Deactivation',
      icon: 'pi pi-times-circle',
      accept: () => {
        this.selectedCategories.forEach(cat => {
          if (cat.isActive) {
            this.toggleActive(cat);
          }
        });
        this.selectedCategories = [];
      }
    });
  }

  onStatusFilterChange() {
    this.skipCount = 0;
    this.loadCategories();
  }

  toggleActive(category: CategoryDto) {
    this.loading = true;
    const updateDto: CreateUpdateCategoryDto = {
      shopId: category.shopId,
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId,
      displayOrder: category.displayOrder,
      isActive: !category.isActive,
      imageUrl: category.imageUrl,
    };

    this.categoryService.update(category.id, updateDto).subscribe({
      next: (updatedCategory) => {
        const index = this.categories.findIndex((c) => c.id === updatedCategory.id);
        if (index !== -1) {
          this.categories[index] = updatedCategory;
        }
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Category ${updatedCategory.isActive ? 'activated' : 'deactivated'} successfully`,
          life: 3000,
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error updating category:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update category status',
          life: 3000,
        });
        this.loading = false;
      },
    });
  }

  onCategorySave(event: { category: CreateUpdateCategoryDto; isEditMode: boolean }) {
    this.submitted = true;
    this.loading = true;

    const imageFile = this.createUpdateCategoryComponent.imageFile;

    if (event.isEditMode) {
      // Update category - for now, keep the existing flow (update then upload image separately)
      // TODO: Update UpdateAsync to support [FromForm] if needed
      this.categoryService.update(this.category.id, event.category).subscribe({
        next: (updatedCategory) => {
          // Upload image if provided
          if (imageFile) {
            this.uploadCategoryImage(updatedCategory.id, imageFile);
          } else {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Category updated successfully',
              life: 3000,
            });
            this.categoryDialog = false;
            this.category = {} as CategoryDto;
            this.loadCategories();
          }
        },
        error: (error) => {
          console.error('Error updating category:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.error?.message || 'Failed to update category',
            life: 3000,
          });
          this.loading = false;
        },
      });
    } else {
      // Create category with image in single request using FormData
      const formData = new FormData();
      
      // Append all category properties to FormData
      formData.append('shopId', event.category.shopId);
      formData.append('name', event.category.name);
      formData.append('slug', event.category.slug);
      if (event.category.description) {
        formData.append('description', event.category.description);
      }
      if (event.category.parentId) {
        formData.append('parentId', event.category.parentId);
      }
      formData.append('displayOrder', event.category.displayOrder.toString());
      formData.append('isActive', event.category.isActive.toString());
      
      // Append image file if provided
      if (imageFile) {
        formData.append('image', imageFile, imageFile.name);
      }
      
      this.categoryService.create(formData).subscribe({
        next: (createdCategory) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Category created successfully',
            life: 3000,
          });
          this.categoryDialog = false;
          this.category = {} as CategoryDto;
          this.loadCategories();
        },
        error: (error) => {
          console.error('Error creating category:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.error?.message || 'Failed to create category',
            life: 3000,
          });
          this.loading = false;
        },
      });
    }
  }

  uploadCategoryImage(categoryId: string, file: File) {
    this.categoryService.uploadImage(categoryId, file).subscribe({
      next: (imageUrl) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Category ${this.isEditMode ? 'updated' : 'created'} successfully`,
          life: 3000,
        });
        this.categoryDialog = false;
        this.category = {} as CategoryDto;
        this.loadCategories();
      },
      error: (error) => {
        console.error('Error uploading image:', error);
        this.messageService.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Category saved but image upload failed. You can upload the image later.',
          life: 5000,
        });
        this.categoryDialog = false;
        this.category = {} as CategoryDto;
        this.loadCategories();
      },
    });
  }

  hideDialog() {
    this.categoryDialog = false;
    this.submitted = false;
    this.category = {} as CategoryDto;
    this.isEditMode = false;
  }

  onGlobalFilter(event: Event) {
    const target = event.target as HTMLInputElement;
    this.filterValue = target.value;
    this.skipCount = 0;
    this.loadCategories();
  }

  onPageChange(event: any) {
    this.skipCount = event.first;
    this.maxResultCount = event.rows;
    this.loadCategories();
  }

  onSort(event: any) {
    this.sortField = event.field;
    this.sortOrder = event.order === 1 ? 1 : -1;
    this.loadCategories();
  }

  getParentName(parentId?: string): string {
    if (!parentId) return '-';
    const parent = this.categories.find((c) => c.id === parentId);
    return parent ? parent.name : '-';
  }

  getImageUrl(imageUrl?: string): string {
    if (!imageUrl) return 'assets/images/placeholder.png';
    // Extract blob name from URL and construct proper image URL
    const blobName = this.extractBlobNameFromUrl(imageUrl);
    if (blobName && imageUrl.includes('/category/')) {
      const categoryId = imageUrl.split('/category/')[1]?.split('/')[0];
      if (categoryId) {
        // Use the get image endpoint
        return `/api/app/category/${categoryId}/get-category-image/${blobName}`;
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

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/placeholder.png';
  }
}

