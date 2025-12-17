import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductDto, CreateUpdateProductDto, ProductService } from '../../../proxy/products';
import { CategoryService, CategoryDto } from '../../../proxy/categories';
import { MessageService } from 'primeng/api';
import { ShopContextService } from '../../../core/services/shop-context.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-create-update-product',
  standalone: false,
  templateUrl: './create-update-product.component.html',
  styleUrls: ['./create-update-product.component.scss'],
})
export class CreateUpdateProductComponent implements OnInit {
  private _visible: boolean = false;
  private _product: ProductDto = {} as ProductDto;
  private _isEditMode: boolean = false;

  @Input()
  set visible(value: boolean) {
    this._visible = value;
    if (value) {
      this.handleInputChanges();
    }
  }
  get visible(): boolean {
    return this._visible;
  }

  @Input()
  set product(value: ProductDto) {
    this._product = value;
    this.productChange.emit(value);
    if (this.visible && value) {
      this.handleInputChanges();
    }
  }
  get product(): ProductDto {
    return this._product;
  }

  @Input()
  set isEditMode(value: boolean) {
    this._isEditMode = value;
    this.isEditModeChange.emit(value);
    if (this.visible && this.product && value) {
      this.handleInputChanges();
    }
  }
  get isEditMode(): boolean {
    return this._isEditMode;
  }

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<{ product: CreateUpdateProductDto; isEditMode: boolean }>();
  @Output() productChange = new EventEmitter<ProductDto>();
  @Output() isEditModeChange = new EventEmitter<boolean>();

  productForm!: FormGroup;
  submitted: boolean = false;
  loading: boolean = false;
  imageFiles: File[] = [];
  imagePreviews: string[] = [];
  autoGenerateSlug: boolean = true;
  autoGenerateSku: boolean = true;
  descriptionMaxLength: number = 4000;
  descriptionLength: number = 0;
  categories: CategoryDto[] = [];
  uploadingImages: boolean = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private messageService: MessageService,
    private shopContextService: ShopContextService
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadCategories();
    if (this.isEditMode && this.product) {
      setTimeout(() => {
        this.populateForm();
      }, 100);
    }
  }

  private handleInputChanges() {
    if (!this.visible || !this.product) {
      return;
    }

    if (this.isEditMode) {
      setTimeout(() => {
        this.populateForm();
      }, 100);
    } else {
      this.resetForm();
    }
  }

  initForm() {
    // Get shop ID from context for new products
    const shopId = this.shopContextService.getCurrentShopId() || '';
    
    this.productForm = this.fb.group({
      shopId: [shopId, Validators.required],
      categoryId: [null],
      name: ['', [Validators.required, Validators.maxLength(256)]],
      slug: ['', [Validators.required, Validators.maxLength(256)]],
      description: ['', Validators.maxLength(this.descriptionMaxLength)],
      sku: ['', [Validators.required, Validators.maxLength(128)]],
      price: [0, [Validators.required, Validators.min(0)]],
      compareAtPrice: [null, Validators.min(0)],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      isActive: [true],
      isPublished: [false],
      attributes: [null],
    });

    // Auto-generate slug from name
    this.productForm.get('name')?.valueChanges.subscribe((name) => {
      if (this.autoGenerateSlug && name) {
        const slug = this.generateSlug(name);
        this.productForm.patchValue({ slug }, { emitEvent: false });
      }
    });

    // Auto-generate SKU from name
    this.productForm.get('name')?.valueChanges.subscribe((name) => {
      if (this.autoGenerateSku && name) {
        const sku = this.generateSku(name);
        this.productForm.patchValue({ sku }, { emitEvent: false });
      }
    });

    // Track description length
    this.productForm.get('description')?.valueChanges.subscribe((desc) => {
      this.descriptionLength = desc?.length || 0;
    });
  }

  populateForm() {
    if (this.product && this.productForm) {
      const shopId = this.product.shopId || '';
      
      this.productForm.patchValue({
        shopId: shopId,
        categoryId: this.product.categoryId || null,
        name: this.product.name || '',
        slug: this.product.slug || '',
        description: this.product.description || '',
        sku: this.product.sku || '',
        price: this.product.price || 0,
        compareAtPrice: this.product.compareAtPrice || null,
        stockQuantity: this.product.stockQuantity || 0,
        isActive: this.product.isActive !== undefined ? this.product.isActive : true,
        isPublished: this.product.isPublished !== undefined ? this.product.isPublished : false,
        attributes: this.product.attributes || null,
      });
      
      this.descriptionLength = this.product.description?.length || 0;
      
      if (this.product.imageUrls && this.product.imageUrls.length > 0) {
        this.imagePreviews = [...this.product.imageUrls];
      }
      
      this.autoGenerateSlug = false;
      this.autoGenerateSku = false;
    } else if (!this.isEditMode) {
      // For new products, get shop ID from context
      this.shopContextService.getCurrentShop().pipe(take(1)).subscribe(shop => {
        if (shop && this.productForm) {
          this.productForm.patchValue({ shopId: shop.id });
        }
      });
    }
  }

  resetForm() {
    this.productForm.reset({
      shopId: '',
      categoryId: null,
      name: '',
      slug: '',
      description: '',
      sku: '',
      price: 0,
      compareAtPrice: null,
      stockQuantity: 0,
      isActive: true,
      isPublished: false,
      attributes: null,
    });
    this.imagePreviews = [];
    this.imageFiles = [];
    this.descriptionLength = 0;
    this.submitted = false;
    this.autoGenerateSlug = true;
    this.autoGenerateSku = true;
  }

  loadCategories() {
    this.categoryService.getList({ maxResultCount: 1000 }).subscribe({
      next: (result) => {
        this.categories = result.items || [];
      },
      error: (error) => {
        console.error('Error loading categories:', error);
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

  generateSku(text: string): string {
    return text
      .toUpperCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 20);
  }

  toggleSlugAutoGeneration() {
    this.autoGenerateSlug = !this.autoGenerateSlug;
    if (this.autoGenerateSlug) {
      const name = this.productForm.get('name')?.value;
      if (name) {
        const slug = this.generateSlug(name);
        this.productForm.patchValue({ slug });
      }
    }
  }

  toggleSkuAutoGeneration() {
    this.autoGenerateSku = !this.autoGenerateSku;
    if (this.autoGenerateSku) {
      const name = this.productForm.get('name')?.value;
      if (name) {
        const sku = this.generateSku(name);
        this.productForm.patchValue({ sku });
      }
    }
  }

  onImagesSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files) {
      Array.from(files).forEach(file => this.handleFileSelection(file));
    }
  }

  onFileSelect(event: any) {
    const files = event.files || [];
    files.forEach((file: File) => this.handleFileSelection(file));
  }

  private handleFileSelection(file: File) {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid File Type',
        detail: `${file.name} is not a valid image file`,
        life: 3000,
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.messageService.add({
        severity: 'error',
        summary: 'File Too Large',
        detail: `${file.name} exceeds 5MB limit`,
        life: 3000,
      });
      return;
    }

    this.imageFiles.push(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreviews.push(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  setPrimaryImage(index: number) {
    if (index >= 0 && index < this.imagePreviews.length) {
      // Move to first position
      const preview = this.imagePreviews.splice(index, 1)[0];
      const file = this.imageFiles.splice(index, 1)[0];
      this.imagePreviews.unshift(preview);
      this.imageFiles.unshift(file);
    }
  }

  removeImage(index: number) {
    this.imagePreviews.splice(index, 1);
    this.imageFiles.splice(index, 1);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
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

  onSave() {
    this.submitted = true;

    if (this.productForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields correctly',
        life: 3000,
      });
      return;
    }

    this.loading = true;

    const formValue = this.productForm.value;
    const productDto: CreateUpdateProductDto = {
      shopId: formValue.shopId,
      categoryId: formValue.categoryId || undefined,
      name: formValue.name,
      slug: formValue.slug,
      description: formValue.description || undefined,
      sku: formValue.sku,
      price: formValue.price,
      compareAtPrice: formValue.compareAtPrice || undefined,
      stockQuantity: formValue.stockQuantity,
      isActive: formValue.isActive,
      isPublished: formValue.isPublished,
      attributes: formValue.attributes || undefined,
    };

    // Emit save event - images will be uploaded separately
    this.save.emit({
      product: productDto,
      isEditMode: this.isEditMode,
    });
  }

  public populateFormPublic() {
    this.populateForm();
  }
}

