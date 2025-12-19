import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { 
  ProductDto, 
  CreateUpdateProductDto, 
  ProductService,
  ProductAttributeService,
  ProductAttributeDto,
  ProductAttributeDataType
} from '../../../proxy/products';

// Export enum for template use
export { ProductAttributeDataType };
import { CategoryService, CategoryDto } from '../../../proxy/categories';
import { MessageService } from 'primeng/api';
import { ShopContextService } from '../../../core/services/shop-context.service';
import { Router } from '@angular/router';
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
      this.loadShopIdAndHandleChanges();
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
  @Output() save = new EventEmitter<{ product: CreateUpdateProductDto; isEditMode: boolean; imageFiles: Array<File | string> }>();
  @Output() productChange = new EventEmitter<ProductDto>();
  @Output() isEditModeChange = new EventEmitter<boolean>();

  productForm!: FormGroup;
  submitted: boolean = false;
  loading: boolean = false;
  
  // Image handling (following Court pattern: hybrid File | string array)
  imageFiles: Array<File | string> = [];
  imagePreviews: string[] = [];
  
  autoGenerateSlug: boolean = true;
  autoGenerateSku: boolean = true;
  descriptionMaxLength: number = 4000;
  descriptionLength: number = 0;
  categories: CategoryDto[] = [];
  uploadingImages: boolean = false;
  
  // Dynamic attributes
  productAttributes: ProductAttributeDto[] = [];
  attributeFormGroup: FormGroup = this.fb.group({});
  selectedAttributes: { [key: string]: boolean } = {}; // Track which attributes are selected
  selectAll: boolean = false; // Select all checkbox state
  attributesLoading: boolean = false;
  
  // Expose enum to template
  ProductAttributeDataType = ProductAttributeDataType;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private productAttributeService: ProductAttributeService,
    private messageService: MessageService,
    private shopContextService: ShopContextService,
    private router: Router
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
  
  /**
   * Load product attributes for the current shop
   * This will be called after shopId is available
   */
  loadProductAttributes() {
    const shopId = this.productForm.get('shopId')?.value;
    if (!shopId) {
      return;
    }
    
    this.attributesLoading = true;
    
    this.productAttributeService.getList({ 
      shopId: shopId,
      maxResultCount: 1000 
    }).subscribe({
      next: (result) => {
        this.productAttributes = (result.items || []).sort((a, b) => 
          (a.displayOrder || 0) - (b.displayOrder || 0)
        );
        this.buildAttributeFormControls();
        this.attributesLoading = false;
      },
      error: (error) => {
        console.error('Error loading product attributes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load product attributes',
          life: 3000
        });
        this.attributesLoading = false;
      }
    });
  }
  
  /**
   * Build form controls dynamically based on ProductAttribute definitions
   */
  buildAttributeFormControls() {
    const attributeControls: { [key: string]: FormControl } = {};
    
    this.productAttributes.forEach(attr => {
      // Initialize selected state based on existing values or required status
      const existingValue = this.parseAttributesJson(this.product?.attributes)[attr.name];
      this.selectedAttributes[attr.name] = !!existingValue || attr.isRequired;
      
      // Conditional validators - only validate if attribute is selected
      const validators = [];
      
      // Add data type specific validators
      switch (attr.dataType) {
        case ProductAttributeDataType.Number:
          validators.push(Validators.pattern(/^-?\d*\.?\d+$/));
          break;
        case ProductAttributeDataType.Text:
          // Text validation: prevent only whitespace
          validators.push(Validators.pattern(/\S/));
          break;
        case ProductAttributeDataType.Date:
          // Date validation handled by PrimeNG Calendar
          break;
      }
      
      attributeControls[attr.name] = new FormControl(existingValue || '', validators);
      
      // Disable control if not selected
      if (!this.selectedAttributes[attr.name]) {
        attributeControls[attr.name].disable();
      }
    });
    
    this.attributeFormGroup = this.fb.group(attributeControls);
    
    // Add the attributeFormGroup to the main form
    this.productForm.setControl('attributeValues', this.attributeFormGroup);
    
    // Initialize select all state
    this.initializeSelectAllState();
  }
  
  /**
   * Toggle attribute selection
   */
  toggleAttributeSelection(attrName: string, event: any) {
    const isSelected = event.checked;
    this.selectedAttributes[attrName] = isSelected;
    
    // Update select all state
    this.updateSelectAllState();
    
    const control = this.attributeFormGroup.get(attrName);
    if (control) {
      if (isSelected) {
        control.enable();
        // Auto-focus the value input after a short delay
        setTimeout(() => {
          const inputElement = document.getElementById(`attr_value_${attrName}`);
          if (inputElement) {
            inputElement.focus();
          }
        }, 100);
      } else {
        control.setValue('');
        control.disable();
        control.markAsUntouched();
      }
    }
  }
  
  /**
   * Update select all checkbox state
   */
  updateSelectAllState() {
    const selectableAttributes = this.productAttributes.filter(attr => !attr.isRequired);
    if (selectableAttributes.length === 0) {
      this.selectAll = false;
      return;
    }
    this.selectAll = selectableAttributes.every(attr => this.selectedAttributes[attr.name]);
  }
  
  /**
   * Check if attribute is selected
   */
  isAttributeSelected(attrName: string): boolean {
    return !!this.selectedAttributes[attrName];
  }
  
  /**
   * Check if selected attribute has validation error
   */
  isSelectedAttributeInvalid(attrName: string): boolean {
    if (!this.selectedAttributes[attrName]) {
      return false;
    }
    return this.isAttributeFieldInvalid(attrName);
  }
  
  /**
   * Parse attributes JSON string and populate form controls with proper type conversion
   */
  parseAttributesJson(attributesJson: string | null | undefined): { [key: string]: any } {
    if (!attributesJson) {
      return {};
    }
    
    try {
      const parsed = JSON.parse(attributesJson);
      const typedValues: { [key: string]: any } = {};
      
      // Convert values to appropriate types based on attribute definitions
      this.productAttributes.forEach(attr => {
        const rawValue = parsed[attr.name];
        
        if (rawValue === null || rawValue === undefined) {
          return;
        }
        
        // Convert to appropriate type for form control
        switch (attr.dataType) {
          case ProductAttributeDataType.Number:
            typedValues[attr.name] = typeof rawValue === 'number' 
              ? rawValue 
              : parseFloat(rawValue) || null;
            break;
            
          case ProductAttributeDataType.Boolean:
            typedValues[attr.name] = typeof rawValue === 'boolean' 
              ? rawValue 
              : rawValue === 'true' || rawValue === '1' || rawValue === true;
            break;
            
          case ProductAttributeDataType.Date:
            // Convert ISO string to Date object for PrimeNG Calendar
            if (typeof rawValue === 'string') {
              const date = new Date(rawValue);
              typedValues[attr.name] = !isNaN(date.getTime()) ? date : null;
            } else if (rawValue instanceof Date) {
              typedValues[attr.name] = rawValue;
            } else {
              typedValues[attr.name] = null;
            }
            break;
            
          case ProductAttributeDataType.Text:
          default:
            typedValues[attr.name] = String(rawValue);
            break;
        }
      });
      
      return typedValues;
    } catch (error) {
      console.error('Error parsing attributes JSON:', error);
      return {};
    }
  }
  
  /**
   * Serialize attribute form values to JSON string with proper type preservation
   */
  serializeAttributesToJson(): string | null {
    const attributeValues = this.attributeFormGroup.value;
    
    // Build typed attribute object - only include selected attributes
    const typedAttributes: { [key: string]: any } = {};
    
    this.productAttributes.forEach(attr => {
      // Only include if attribute is selected
      if (!this.selectedAttributes[attr.name]) {
        return;
      }
      
      const value = attributeValues[attr.name];
      
      // Skip empty values
      if (value === null || value === undefined || value === '') {
        return;
      }
      
      // Preserve types based on attribute definition
      switch (attr.dataType) {
        case ProductAttributeDataType.Number:
          typedAttributes[attr.name] = typeof value === 'number' 
            ? value 
            : parseFloat(value) || 0;
          break;
          
        case ProductAttributeDataType.Boolean:
          typedAttributes[attr.name] = typeof value === 'boolean' 
            ? value 
            : value === 'true' || value === true || value === '1' || value === 1;
          break;
          
        case ProductAttributeDataType.Date:
          // Ensure ISO format (YYYY-MM-DD)
          if (value instanceof Date) {
            typedAttributes[attr.name] = this.formatDateToISO(value);
          } else if (typeof value === 'string') {
            // Validate and normalize date string
            typedAttributes[attr.name] = this.normalizeDateString(value);
          } else {
            typedAttributes[attr.name] = value;
          }
          break;
          
        case ProductAttributeDataType.Text:
        default:
          typedAttributes[attr.name] = String(value).trim();
          break;
      }
    });
    
    return Object.keys(typedAttributes).length > 0 
      ? JSON.stringify(typedAttributes) 
      : null;
  }
  
  /**
   * Format Date to ISO string (YYYY-MM-DD)
   */
  private formatDateToISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  /**
   * Normalize date string to ISO format
   */
  private normalizeDateString(dateStr: string): string {
    // Try to parse and reformat
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return this.formatDateToISO(date);
    }
    // If parsing fails, return as-is (backend will validate)
    return dateStr.trim();
  }
  
  /**
   * Check if product has attributes (non-empty JSON string)
   */
  hasProductAttributes(): boolean {
    if (!this.product?.attributes) {
      return false;
    }
    
    try {
      const attributes = JSON.parse(this.product.attributes);
      return attributes && Object.keys(attributes).length > 0;
    } catch {
      return false;
    }
  }
  
  /**
   * Navigate to product attributes management page
   */
  navigateToProductAttributes(): void {
    this.router.navigate(['/tenant/product-attributes']);
  }
  
  /**
   * Get attribute control name for template
   */
  getAttributeControlName(attributeName: string): string {
    return attributeName;
  }
  
  /**
   * Get input type based on attribute data type
   */
  getInputType(dataType: ProductAttributeDataType | undefined): string {
    switch (dataType) {
      case ProductAttributeDataType.Text: // 0
        return 'text';
      case ProductAttributeDataType.Number: // 1
        return 'number';
      case ProductAttributeDataType.Boolean: // 2
        return 'checkbox';
      case ProductAttributeDataType.Date: // 3
        return 'date';
      default:
        return 'text';
    }
  }
  
  /**
   * Get data type label for display
   */
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
        return 'Text';
    }
  }
  
  /**
   * Get icon class for attribute data type
   */
  getAttributeTypeIcon(dataType: ProductAttributeDataType | undefined): string {
    switch (dataType) {
      case ProductAttributeDataType.Text:
        return 'pi pi-font';
      case ProductAttributeDataType.Number:
        return 'pi pi-hashtag';
      case ProductAttributeDataType.Boolean:
        return 'pi pi-check-square';
      case ProductAttributeDataType.Date:
        return 'pi pi-calendar';
      default:
        return 'pi pi-tag';
    }
  }
  
  /**
   * Check if attribute field is invalid
   */
  isAttributeFieldInvalid(attributeName: string): boolean {
    const control = this.attributeFormGroup.get(attributeName);
    return !!(control && control.invalid && (control.dirty || control.touched || this.submitted));
  }
  
  /**
   * Get attribute field error message
   */
  getAttributeFieldError(attributeName: string): string {
    const control = this.attributeFormGroup.get(attributeName);
    const attr = this.productAttributes.find(a => a.name === attributeName);
    
    if (control?.errors) {
      if (control.errors['required']) {
        return `${attr?.displayName || 'This field'} is required`;
      }
      if (control.errors['pattern']) {
        if (attr?.dataType === ProductAttributeDataType.Number) {
          return 'Please enter a valid number';
        }
        if (attr?.dataType === ProductAttributeDataType.Text) {
          return 'Value cannot be empty or only whitespace';
        }
        return 'Invalid format';
      }
    }
    return '';
  }
  
  /**
   * Check if attribute form group has any errors
   */
  hasAttributeErrors(): boolean {
    if (!this.attributeFormGroup) {
      return false;
    }
    // Only check errors for selected attributes
    return Object.keys(this.selectedAttributes).some(key => {
      if (!this.selectedAttributes[key]) {
        return false; // Skip unselected attributes
      }
      const control = this.attributeFormGroup.get(key);
      return control ? control.invalid && (control.dirty || control.touched || this.submitted) : false;
    });
  }
  
  /**
   * Get attribute value input ID for auto-focus
   */
  getAttributeValueInputId(attrName: string): string {
    return `attr_value_${attrName}`;
  }
  
  /**
   * Toggle select all attributes
   */
  toggleSelectAll(event: any) {
    const isSelected = event.checked;
    this.selectAll = isSelected;
    
    this.productAttributes.forEach(attr => {
      // Don't toggle required attributes
      if (!attr.isRequired) {
        this.selectedAttributes[attr.name] = isSelected;
        const control = this.attributeFormGroup.get(attr.name);
        if (control) {
          if (isSelected) {
            control.enable();
          } else {
            control.setValue('');
            control.disable();
            control.markAsUntouched();
          }
        }
      }
    });
  }
  
  /**
   * Initialize select all state
   */
  initializeSelectAllState() {
    const selectableAttributes = this.productAttributes.filter(attr => !attr.isRequired);
    if (selectableAttributes.length === 0) {
      this.selectAll = false;
      return;
    }
    this.selectAll = selectableAttributes.every(attr => this.selectedAttributes[attr.name]);
  }
  
  /**
   * Get attribute field hint/help text
   */
  getAttributeFieldHint(attributeName: string): string {
    const attr = this.productAttributes.find(a => a.name === attributeName);
    if (!attr) {
      return '';
    }
    
    switch (attr.dataType) {
      case ProductAttributeDataType.Text:
        return attr.isRequired 
          ? `Enter a value for ${attr.displayName.toLowerCase()}`
          : `Optional: Add ${attr.displayName.toLowerCase()} if applicable`;
      case ProductAttributeDataType.Number:
        return attr.isRequired
          ? `Enter a numeric value for ${attr.displayName.toLowerCase()}`
          : `Optional: Add numeric value for ${attr.displayName.toLowerCase()}`;
      case ProductAttributeDataType.Date:
        return attr.isRequired
          ? `Select a date for ${attr.displayName.toLowerCase()}`
          : `Optional: Select date for ${attr.displayName.toLowerCase()}`;
      case ProductAttributeDataType.Boolean:
        return attr.isRequired
          ? `Enable or disable ${attr.displayName.toLowerCase()}`
          : `Optional: Toggle ${attr.displayName.toLowerCase()}`;
      default:
        return '';
    }
  }

  private loadShopIdAndHandleChanges() {
    // First, ensure shopId is loaded for new products
    if (!this.isEditMode) {
      // Check if shopId is already available synchronously
      const cachedShopId = this.shopContextService.getCurrentShopId();
      if (cachedShopId && this.productForm) {
        this.productForm.patchValue({ shopId: cachedShopId }, { emitEvent: false });
        this.loadProductAttributes();
      } else {
        // Load shop asynchronously if not cached
        this.shopContextService.getCurrentShop().pipe(take(1)).subscribe(shop => {
          if (shop && this.productForm) {
            this.productForm.patchValue({ shopId: shop.id }, { emitEvent: false });
            this.loadProductAttributes();
          }
        });
      }
    } else {
      // For edit mode, load attributes after shopId is set
      const shopId = this.product?.shopId;
      if (shopId && this.productForm) {
        this.productForm.patchValue({ shopId }, { emitEvent: false });
        this.loadProductAttributes();
      }
    }
    this.handleInputChanges();
  }

  private handleInputChanges() {
    if (!this.visible) {
      return;
    }

    if (this.isEditMode && this.product) {
      setTimeout(() => {
        this.populateForm();
      }, 100);
    } else {
      this.resetForm();
    }
  }

  initForm() {
    // Initialize shopId as null - it will be set when dialog opens
    this.productForm = this.fb.group({
      shopId: [null, Validators.required],
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
      // Ensure shopId is not empty - use product's shopId or load from context
      const shopId = this.product.shopId || null;
      if (!shopId) {
        // If product doesn't have shopId, try to get it from context
        this.shopContextService.getCurrentShop().pipe(take(1)).subscribe(shop => {
          if (shop && this.productForm) {
            this.productForm.patchValue({
              shopId: shop.id,
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
          }
        });
        return;
      }
      
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
      
      // Load product attributes and populate attribute form
      this.loadProductAttributes();
      
      // Parse and populate attribute values after attributes are loaded
      setTimeout(() => {
        const attributeValues = this.parseAttributesJson(this.product.attributes);
        if (this.attributeFormGroup && Object.keys(attributeValues).length > 0) {
          this.attributeFormGroup.patchValue(attributeValues);
        }
      }, 500);
      
      this.descriptionLength = this.product.description?.length || 0;
      
      // Load existing images (following Court pattern: store as strings)
      if (this.product.imageUrls && this.product.imageUrls.length > 0) {
        this.imageFiles = [...this.product.imageUrls]; // Store existing URLs as strings
        this.imagePreviews = [...this.product.imageUrls]; // Use URLs directly for preview
      } else {
        this.initializeImages();
      }
      
      this.autoGenerateSlug = false;
      this.autoGenerateSku = false;
    }
  }

  resetForm() {
    // Get shop ID synchronously if available
    const shopId = this.shopContextService.getCurrentShopId();
    
    this.productForm.reset({
      shopId: shopId || null,
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
    
    // Reset attribute form group and selection
    if (this.attributeFormGroup) {
      this.attributeFormGroup.reset();
    }
    this.selectedAttributes = {};
    this.selectAll = false;
    
    // Initialize images (following Court pattern)
    this.initializeImages();
    
    this.descriptionLength = 0;
    this.submitted = false;
    this.autoGenerateSlug = true;
    this.autoGenerateSku = true;
    
    // Reload attributes for the shop
    if (shopId) {
      this.loadProductAttributes();
    }
  }
  
  /**
   * Initialize images array (following Court pattern)
   */
  private initializeImages() {
    this.imageFiles = [undefined as any];
    this.imagePreviews = [undefined as any];
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
  
  /**
   * Handle image file selection - uploads immediately in edit mode
   */
  handleImageChange(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
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
      
      // If editing existing product, upload immediately
      if (this.isEditMode && this.product?.id) {
        const isPrimary = index === 0; // First image is primary
        this.uploadingImages = true;
        
        this.productService.uploadProductImage(this.product.id, file as any, isPrimary).subscribe({
          next: (imageUrl) => {
            // Update arrays with the returned URL
            this.imageFiles[index] = imageUrl;
            this.imagePreviews[index] = imageUrl;
            
            // Reload product to get updated image list
            this.productService.get(this.product.id!).subscribe({
              next: (updatedProduct) => {
                this.product = updatedProduct;
                this.productChange.emit(updatedProduct);
                this.uploadingImages = false;
              },
              error: (error) => {
                console.error('Error reloading product:', error);
                this.uploadingImages = false;
              }
            });
          },
          error: (error) => {
            console.error('Error uploading image:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.error?.message || 'Failed to upload image',
              life: 3000,
            });
            this.uploadingImages = false;
          }
        });
      } else {
        // Create mode - just store file for later
        this.imageFiles[index] = file;
        this.imagePreviews[index] = URL.createObjectURL(file);
      }
      
      // Reset input to allow selecting same file again
      input.value = '';
    }
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

    // Find first empty slot or add new
    const emptyIndex = this.imageFiles.findIndex(item => !item);
    if (emptyIndex >= 0) {
      this.imageFiles[emptyIndex] = file;
      this.imagePreviews[emptyIndex] = URL.createObjectURL(file);
    } else {
      this.imageFiles.push(file);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviews.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Add new image slot (following Court pattern)
   */
  addImageSlot() {
    this.imageFiles.push(undefined as any);
    this.imagePreviews.push(undefined as any);
  }

  /**
   * Remove image slot - calls API immediately for existing images
   * Handles both existing images (strings) and new uploads (Files)
   */
  removeImageSlot(index: number) {
    const item = this.imageFiles[index];
    
    if (typeof item === 'string' && this.isEditMode && this.product?.id) {
      // Existing image - delete from backend immediately
      this.productService.deleteProductImage(this.product.id, item).subscribe({
        next: () => {
          // Remove from arrays after successful deletion
          this.imageFiles.splice(index, 1);
          this.imagePreviews.splice(index, 1);
          
          // Ensure at least one slot remains
          if (this.imageFiles.length === 0) {
            this.initializeImages();
          }
          
          // Reload product to get updated image list
          if (this.product?.id) {
            this.productService.get(this.product.id).subscribe({
              next: (updatedProduct) => {
                this.product = updatedProduct;
                this.productChange.emit(updatedProduct);
              },
              error: (error) => {
                console.error('Error reloading product:', error);
              }
            });
          }
        },
        error: (error) => {
          console.error('Error deleting image:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.error?.message || 'Failed to delete image',
            life: 3000,
          });
        }
      });
    } else if (item instanceof File) {
      // New upload - just remove from arrays
      // Revoke object URL to free memory
      const previewUrl = this.imagePreviews[index];
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      this.imageFiles.splice(index, 1);
      this.imagePreviews.splice(index, 1);
      
      // Ensure at least one slot remains
      if (this.imageFiles.length === 0) {
        this.initializeImages();
      }
    } else {
      // Empty slot - just remove
      this.imageFiles.splice(index, 1);
      this.imagePreviews.splice(index, 1);
      
      // Ensure at least one slot remains
      if (this.imageFiles.length === 0) {
        this.initializeImages();
      }
    }
  }

  setPrimaryImage(index: number) {
    if (index >= 0 && index < this.imagePreviews.length && index !== 0) {
      const item = this.imageFiles[index];
      
      // If it's an existing image (string URL) and we're editing, call API
      if (typeof item === 'string' && this.isEditMode && this.product?.id) {
        this.productService.setPrimaryImage(this.product.id, item).subscribe({
          next: () => {
            // Move to first position in UI
            const preview = this.imagePreviews.splice(index, 1)[0];
            const file = this.imageFiles.splice(index, 1)[0];
            this.imagePreviews.unshift(preview);
            this.imageFiles.unshift(file);
            
            // Reload product to get updated primary image
            if (this.product?.id) {
              this.productService.get(this.product.id).subscribe({
                next: (updatedProduct) => {
                  this.product = updatedProduct;
                  this.productChange.emit(updatedProduct);
                },
                error: (error) => {
                  console.error('Error reloading product:', error);
                }
              });
            }
          },
          error: (error) => {
            console.error('Error setting primary image:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.error?.message || 'Failed to set primary image',
              life: 3000,
            });
          }
        });
      } else {
        // For new uploads or create mode, just move to first position
        const preview = this.imagePreviews.splice(index, 1)[0];
        const file = this.imageFiles.splice(index, 1)[0];
        this.imagePreviews.unshift(preview);
        this.imageFiles.unshift(file);
      }
    }
  }

  /**
   * Legacy method name for backward compatibility
   */
  removeImage(index: number) {
    this.removeImageSlot(index);
  }
  
  /**
   * Handle image error (fallback to placeholder)
   */
  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/placeholder.png';
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

    // Mark all form controls as touched to show validation errors
    Object.keys(this.productForm.controls).forEach(key => {
      this.productForm.get(key)?.markAsTouched();
    });
    
    // Mark all attribute form controls as touched
    if (this.attributeFormGroup) {
      Object.keys(this.attributeFormGroup.controls).forEach(key => {
        this.attributeFormGroup.get(key)?.markAsTouched();
      });
    }

    // Check if main form is invalid
    if (this.productForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields correctly',
        life: 3000,
      });
      return;
    }

    // Check if attribute form has errors
    if (this.attributeFormGroup && this.hasAttributeErrors()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attribute Validation Error',
        detail: 'Please fix attribute validation errors before saving',
        life: 3000,
      });
      return;
    }

    this.loading = true;

    const formValue = this.productForm.value;
    
    // Serialize attribute values to JSON
    const attributesJson = this.serializeAttributesToJson();
    
    // Note: image property is handled separately via FormData in parent component
    // Using type assertion since image is optional in practice but required in generated DTO
    const productDto = {
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
      attributes: attributesJson || undefined,
    } as CreateUpdateProductDto;

    // Emit save event with image files array for parent to handle
    // Parent will construct FormData and handle existing image removal
    this.save.emit({
      product: productDto,
      isEditMode: this.isEditMode,
      imageFiles: this.imageFiles, // Pass hybrid array to parent
    });
  }

  public populateFormPublic() {
    this.populateForm();
  }
  
  /**
   * Track by function for attribute list
   */
  trackByAttributeName(index: number, attr: ProductAttributeDto): string {
    return attr.name || index.toString();
  }
}

