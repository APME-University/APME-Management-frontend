import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryDto, CreateUpdateCategoryDto, CategoryService } from '../../../proxy/categories';
import { MessageService } from 'primeng/api';
import { ShopContextService } from '../../../core/services/shop-context.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-create-update-category',
  standalone: false,
  templateUrl: './create-update-category.component.html',
  styleUrls: ['./create-update-category.component.scss'],
})
export class CreateUpdateCategoryComponent implements OnInit {
  private _visible: boolean = false;
  private _category: CategoryDto = {} as CategoryDto;
  private _isEditMode: boolean = false;

  @Input()
  set visible(value: boolean) {
    this._visible = value;
    if (value) {
      this.loadShopIdAndHandleChanges();
    }
  }
  get visible(): boolean {
    return this._visible;
  }

  @Input()
  set category(value: CategoryDto) {
    this._category = value;
    this.categoryChange.emit(value);
    if (this.visible && value) {
      this.handleInputChanges();
    }
  }
  get category(): CategoryDto {
    return this._category;
  }

  @Input()
  set isEditMode(value: boolean) {
    this._isEditMode = value;
    this.isEditModeChange.emit(value);
    if (this.visible && this.category && value) {
      this.handleInputChanges();
    }
  }
  get isEditMode(): boolean {
    return this._isEditMode;
  }

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<{ category: CreateUpdateCategoryDto; isEditMode: boolean }>();
  @Output() categoryChange = new EventEmitter<CategoryDto>();
  @Output() isEditModeChange = new EventEmitter<boolean>();

  categoryForm!: FormGroup;
  submitted: boolean = false;
  loading: boolean = false;
  imagePreview: string | null = null;
  imageFile: File | null = null;
  autoGenerateSlug: boolean = true;
  descriptionMaxLength: number = 2000;
  descriptionLength: number = 0;
  parentCategories: CategoryDto[] = [];
  uploadingImage: boolean = false;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private messageService: MessageService,
    private shopContextService: ShopContextService
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadParentCategories();
    if (this.isEditMode && this.category) {
      setTimeout(() => {
        this.populateForm();
      }, 100);
    }
  }

  private loadShopIdAndHandleChanges() {
    // First, ensure shopId is loaded for new categories
    if (!this.isEditMode) {
      // Check if shopId is already available synchronously
      const cachedShopId = this.shopContextService.getCurrentShopId();
      if (cachedShopId && this.categoryForm) {
        this.categoryForm.patchValue({ shopId: cachedShopId }, { emitEvent: false });
        this.handleInputChanges();
      } else {
        // Load shop asynchronously if not cached
        this.shopContextService.getCurrentShop().pipe(take(1)).subscribe(shop => {
          if (shop && this.categoryForm) {
            this.categoryForm.patchValue({ shopId: shop.id }, { emitEvent: false });
          }
          this.handleInputChanges();
        });
      }
    } else {
      this.handleInputChanges();
    }
  }

  private handleInputChanges() {
    if (!this.visible) {
      return;
    }

    if (this.isEditMode && this.category) {
      setTimeout(() => {
        this.populateForm();
      }, 100);
    } else {
      this.resetForm();
    }
  }

  initForm() {
    // Initialize shopId as null - it will be set when dialog opens
    this.categoryForm = this.fb.group({
      shopId: [null, Validators.required],
      name: ['', [Validators.required, Validators.maxLength(256)]],
      slug: ['', [Validators.required, Validators.maxLength(256)]],
      description: ['', Validators.maxLength(this.descriptionMaxLength)],
      parentId: [null],
      displayOrder: [0, [Validators.required, Validators.min(0)]],
      isActive: [true],
      imageUrl: [null],
    });

    // Auto-generate slug from name
    this.categoryForm.get('name')?.valueChanges.subscribe((name) => {
      if (this.autoGenerateSlug && name) {
        const slug = this.generateSlug(name);
        this.categoryForm.patchValue({ slug }, { emitEvent: false });
      }
    });

    // Track description length
    this.categoryForm.get('description')?.valueChanges.subscribe((desc) => {
      this.descriptionLength = desc?.length || 0;
    });
  }

  populateForm() {
    if (this.category && this.categoryForm) {
      // Ensure shopId is not empty - use category's shopId or load from context
      const shopId = this.category.shopId || null;
      if (!shopId) {
        // If category doesn't have shopId, try to get it from context
        this.shopContextService.getCurrentShop().pipe(take(1)).subscribe(shop => {
          if (shop && this.categoryForm) {
            this.categoryForm.patchValue({
              shopId: shop.id,
              name: this.category.name || '',
              slug: this.category.slug || '',
              description: this.category.description || '',
              parentId: this.category.parentId || null,
              displayOrder: this.category.displayOrder || 0,
              isActive: this.category.isActive !== undefined ? this.category.isActive : true,
              imageUrl: this.category.imageUrl || null,
            });
          }
        });
      } else {
        this.categoryForm.patchValue({
          shopId: shopId,
          name: this.category.name || '',
          slug: this.category.slug || '',
          description: this.category.description || '',
          parentId: this.category.parentId || null,
          displayOrder: this.category.displayOrder || 0,
          isActive: this.category.isActive !== undefined ? this.category.isActive : true,
          imageUrl: this.category.imageUrl || null,
        });
      }
      
      this.descriptionLength = this.category.description?.length || 0;
      
      if (this.category.imageUrl) {
        this.imagePreview = this.category.imageUrl;
      }
      
      this.autoGenerateSlug = false;
    }
  }

  resetForm() {
    // Get shop ID synchronously if available, otherwise it should already be set
    const shopId = this.shopContextService.getCurrentShopId();
    
    this.categoryForm.reset({
      shopId: shopId || null,
      name: '',
      slug: '',
      description: '',
      parentId: null,
      displayOrder: 0,
      isActive: true,
      imageUrl: null,
    });
    this.imagePreview = null;
    this.imageFile = null;
    this.descriptionLength = 0;
    this.submitted = false;
    this.autoGenerateSlug = true;
  }

  loadParentCategories() {
    // Load categories to use as parent options
    this.categoryService.getList({ maxResultCount: 1000 }).subscribe({
      next: (result) => {
        // Filter out current category if editing
        this.parentCategories = (result.items || []).filter(
          (cat) => !this.isEditMode || cat.id !== this.category.id
        );
      },
      error: (error) => {
        console.error('Error loading parent categories:', error);
      },
    });
  }

  generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  toggleSlugAutoGeneration() {
    this.autoGenerateSlug = !this.autoGenerateSlug;
    if (this.autoGenerateSlug) {
      const name = this.categoryForm.get('name')?.value;
      if (name) {
        const slug = this.generateSlug(name);
        this.categoryForm.patchValue({ slug });
      }
    }
  }

  onImageSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.handleFileSelection(file);
  }

  onFileSelect(event: any) {
    const file = event.files?.[0];
    this.handleFileSelection(file);
  }

  private handleFileSelection(file: File | undefined) {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid File Type',
        detail: 'Please select a valid image file (JPG, PNG, WebP, or GIF)',
        life: 3000,
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.messageService.add({
        severity: 'error',
        summary: 'File Too Large',
        detail: 'Image size must be less than 5MB',
        life: 3000,
      });
      return;
    }

    this.imageFile = file;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.imageFile = null;
    this.imagePreview = null;
    this.categoryForm.patchValue({ imageUrl: null });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.categoryForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  getFieldError(fieldName: string): string {
    const field = this.categoryForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
      if (field.errors['maxlength']) {
        return `${fieldName} exceeds maximum length`;
      }
      if (field.errors['min']) {
        return `${fieldName} must be greater than or equal to 0`;
      }
    }
    return '';
  }

  hideDialog() {
    this.visibleChange.emit(false);
    this.resetForm();
  }

  async onSave() {
    this.submitted = true;

    if (this.categoryForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields correctly',
        life: 3000,
      });
      return;
    }

    this.loading = true;

    const formValue = this.categoryForm.value;
    // Note: image property is handled separately via FormData in parent component
    // Using type assertion since image is optional in practice but required in generated DTO
    const categoryDto = {
      shopId: formValue.shopId,
      name: formValue.name,
      slug: formValue.slug,
      description: formValue.description || undefined,
      parentId: formValue.parentId || undefined,
      displayOrder: formValue.displayOrder,
      isActive: formValue.isActive,
    } as CreateUpdateCategoryDto;

    // Note: Image upload will be handled after category creation/update in the parent component
    // For edit mode, if image file is selected, it will be uploaded separately

    // Emit save event
    this.save.emit({
      category: categoryDto,
      isEditMode: this.isEditMode,
    });
  }

  // Public method to be called from parent component
  public populateFormPublic() {
    this.populateForm();
  }
}

