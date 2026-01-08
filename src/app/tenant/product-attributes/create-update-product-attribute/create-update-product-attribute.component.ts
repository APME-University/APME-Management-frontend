import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { 
  ProductAttributeDto, 
  CreateUpdateProductAttributeDto, 
  ProductAttributeService,
  ProductAttributeDataType
} from '../../../proxy/products';
import { MessageService } from 'primeng/api';
import { ShopContextService } from '../../../core/services/shop-context.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-create-update-product-attribute',
  standalone: false,
  templateUrl: './create-update-product-attribute.component.html',
  styleUrls: ['./create-update-product-attribute.component.scss'],
})
export class CreateUpdateProductAttributeComponent implements OnInit {
  private _visible: boolean = false;
  private _productAttribute: ProductAttributeDto = {} as ProductAttributeDto;
  private _isEditMode: boolean = false;

  @Input()
  set visible(value: boolean) {
    this._visible = value;
    if (value) {
      this.loadShopIdAndHandleChanges();
      this.loadExistingAttributes();
    }
  }
  get visible(): boolean {
    return this._visible;
  }
  
  @Input() existingAttributesList: ProductAttributeDto[] = [];

  @Input()
  set productAttribute(value: ProductAttributeDto) {
    this._productAttribute = value;
    this.productAttributeChange.emit(value);
    if (this.visible && value) {
      this.handleInputChanges();
    }
  }
  get productAttribute(): ProductAttributeDto {
    return this._productAttribute;
  }

  @Input()
  set isEditMode(value: boolean) {
    this._isEditMode = value;
    this.isEditModeChange.emit(value);
    if (this.visible && this.productAttribute && value) {
      this.handleInputChanges();
    }
  }
  get isEditMode(): boolean {
    return this._isEditMode;
  }

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<{ productAttribute: CreateUpdateProductAttributeDto; isEditMode: boolean }>();
  @Output() productAttributeChange = new EventEmitter<ProductAttributeDto>();
  @Output() isEditModeChange = new EventEmitter<boolean>();

  productAttributeForm!: FormGroup;
  submitted: boolean = false;
  loading: boolean = false;
  existingAttributes: ProductAttributeDto[] = []; // For duplicate checking

  ProductAttributeDataType = ProductAttributeDataType;
  
  dataTypeOptions = [
    { label: 'Text', value: ProductAttributeDataType.Text, icon: 'pi pi-font' },
    { label: 'Number', value: ProductAttributeDataType.Number, icon: 'pi pi-hashtag' },
    { label: 'Boolean', value: ProductAttributeDataType.Boolean, icon: 'pi pi-check-square' },
    { label: 'Date', value: ProductAttributeDataType.Date, icon: 'pi pi-calendar' },
  ];

  constructor(
    private fb: FormBuilder,
    private productAttributeService: ProductAttributeService,
    private messageService: MessageService,
    private shopContextService: ShopContextService
  ) {}

  ngOnInit() {
    this.initForm();
    if (this.isEditMode && this.productAttribute) {
      setTimeout(() => {
        this.populateForm();
      }, 100);
    }
  }

  private loadShopIdAndHandleChanges() {
    if (!this.isEditMode) {
      const cachedShopId = this.shopContextService.getCurrentShopId();
      if (cachedShopId && this.productAttributeForm) {
        this.productAttributeForm.patchValue({ shopId: cachedShopId }, { emitEvent: false });
        this.handleInputChanges();
      } else {
        this.shopContextService.getCurrentShop().pipe(take(1)).subscribe(shop => {
          if (shop && this.productAttributeForm) {
            this.productAttributeForm.patchValue({ shopId: shop.id }, { emitEvent: false });
          }
          this.handleInputChanges();
        });
      }
    } else {
      this.handleInputChanges();
    }
  }
  
  /**
   * Load existing attributes for duplicate checking
   */
  private loadExistingAttributes() {
    if (this.existingAttributesList && this.existingAttributesList.length > 0) {
      this.existingAttributes = [...this.existingAttributesList];
    } else {
      // Fallback: load from service if list not provided
      const shopId = this.productAttributeForm?.get('shopId')?.value || 
                     this.shopContextService.getCurrentShopId();
      if (shopId) {
        this.productAttributeService.getList({ 
          shopId: shopId,
          maxResultCount: 1000 
        }).subscribe({
          next: (result) => {
            this.existingAttributes = result.items || [];
          },
          error: () => {
            this.existingAttributes = [];
          }
        });
      }
    }
  }

  private handleInputChanges() {
    if (!this.visible) {
      return;
    }

    if (this.isEditMode && this.productAttribute) {
      setTimeout(() => {
        this.populateForm();
      }, 100);
    } else {
      this.resetForm();
    }
  }

  initForm() {
    // Get shopId first if available
    const shopId = this.shopContextService.getCurrentShopId();
    
    this.productAttributeForm = this.fb.group({
      shopId: [shopId || null], // No validation
      name: ['', [
        Validators.required, 
        Validators.maxLength(128), 
        Validators.pattern(/^[a-z0-9_]+$/),
        this.duplicateNameValidator.bind(this)
      ]],
      displayName: [''], // No validation
      dataType: [ProductAttributeDataType.Text], // Default value, no validation
      isRequired: [false],
      displayOrder: [0], // Default value, no validation
    });
    
    // Watch name changes for duplicate checking
    this.productAttributeForm.get('name')?.valueChanges.subscribe(() => {
      this.productAttributeForm.get('name')?.updateValueAndValidity();
    });
  }
  
  /**
   * Custom validator to check for duplicate attribute names
   */
  duplicateNameValidator(control: any) {
    if (!control || !control.value) {
      return null;
    }
    
    const name = control.value.trim().toLowerCase();
    if (!name) {
      return null;
    }
    
    // Check if name already exists (excluding current attribute in edit mode)
    const duplicate = this.existingAttributes.find(attr => 
      attr.name.toLowerCase() === name && 
      (!this.isEditMode || attr.id !== this.productAttribute?.id)
    );
    
    return duplicate ? { duplicateName: true } : null;
  }

  populateForm() {
    if (this.productAttribute && this.productAttributeForm) {
      this.productAttributeForm.patchValue({
        shopId: this.productAttribute.shopId || null,
        name: this.productAttribute.name || '',
        displayName: this.productAttribute.displayName || '',
        dataType: this.productAttribute.dataType ?? ProductAttributeDataType.Text,
        isRequired: this.productAttribute.isRequired !== undefined ? this.productAttribute.isRequired : false,
        displayOrder: this.productAttribute.displayOrder || 0,
      });
    }
  }

  populateFormPublic() {
    this.populateForm();
  }

  resetForm() {
    if (this.productAttributeForm) {
      this.productAttributeForm.reset({
        shopId: null,
        name: '',
        displayName: '',
        dataType: ProductAttributeDataType.Text,
        isRequired: false,
        displayOrder: 0,
      });
      this.submitted = false;
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.productAttributeForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched || this.submitted));
  }

  getFieldError(fieldName: string): string {
    // Only validate name field
    if (fieldName !== 'name') {
      return '';
    }
    
    const control = this.productAttributeForm.get(fieldName);
    if (control?.errors) {
      if (control.errors['required']) {
        return 'Attribute name is required';
      }
      if (control.errors['maxlength']) {
        return `Maximum length is ${control.errors['maxlength'].requiredLength} characters`;
      }
      if (control.errors['pattern']) {
        return 'Only lowercase letters, numbers, and underscores are allowed (e.g., color, weight_grams)';
      }
      if (control.errors['duplicateName']) {
        return 'An attribute with this name already exists for this shop';
      }
    }
    return '';
  }
  
  /**
   * Get field hint/help text
   */
  getFieldHint(fieldName: string): string {
    switch (fieldName) {
      case 'name':
        return 'Lowercase letters, numbers, and underscores only. Used as the key in product attributes JSON.';
      case 'displayName':
        return 'User-friendly name shown in forms and product pages. Can contain spaces and any characters.';
      case 'dataType':
        return 'Select the type of data this attribute will store. This cannot be changed after creation.';
      case 'displayOrder':
        return 'Lower numbers appear first. Use this to control the order attributes appear in forms.';
      case 'isRequired':
        return ''; // Removed hint text as requested
      default:
        return '';
    }
  }
  
  /**
   * Get data type icon
   */
  getDataTypeIcon(dataType: ProductAttributeDataType): string {
    const option = this.dataTypeOptions.find(opt => opt.value === dataType);
    return option?.icon || 'pi pi-tag';
  }
  
  /**
   * Get data type label
   */
  getDataTypeLabel(dataType: ProductAttributeDataType): string {
    const option = this.dataTypeOptions.find(opt => opt.value === dataType);
    return option?.label || 'Text';
  }

  onSave() {
    this.submitted = true;

    // Only mark name field as touched to show validation errors
    this.productAttributeForm.get('name')?.markAsTouched();

    // Only validate name field
    if (this.productAttributeForm.get('name')?.invalid) {
      const errorMessage = this.getFieldError('name') || 'Please fix the attribute name';
      
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: errorMessage,
        life: 3000,
      });
      return;
    }

    this.loading = true;
    const formValue = this.productAttributeForm.value;
    const dto: CreateUpdateProductAttributeDto = {
      shopId: formValue.shopId || this.shopContextService.getCurrentShopId(),
      name: formValue.name.trim(),
      displayName: formValue.displayName?.trim() || formValue.name.trim(), // Use name as fallback if displayName is empty
      dataType: formValue.dataType || ProductAttributeDataType.Text, // Default to Text
      isRequired: formValue.isRequired || false,
      displayOrder: formValue.displayOrder || 0, // Default to 0
    };

    if (this.isEditMode && this.productAttribute?.id) {
      this.productAttributeService.update(this.productAttribute.id, dto).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Product attribute updated successfully',
            life: 3000,
          });
          this.loading = false;
          this.save.emit({ productAttribute: dto, isEditMode: true });
        },
        error: (error) => {
          console.error('Error updating product attribute:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.error?.message || 'Failed to update product attribute',
            life: 3000,
          });
          this.loading = false;
        },
      });
    } else {
      this.productAttributeService.create(dto).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Product attribute created successfully',
            life: 3000,
          });
          this.loading = false;
          this.save.emit({ productAttribute: dto, isEditMode: false });
        },
        error: (error) => {
          console.error('Error creating product attribute:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.error?.message || 'Failed to create product attribute',
            life: 3000,
          });
          this.loading = false;
        },
      });
    }
  }

  hideDialog() {
    this.visibleChange.emit(false);
  }
}
