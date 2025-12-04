import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShopDto, CreateUpdateShopDto } from '../../proxy/shops';

@Component({
  selector: 'app-create-update-shop',
  standalone: false,
  templateUrl: './create-update-shop.component.html',
  styleUrls: ['./create-update-shop.component.scss'],
})
export class CreateUpdateShopComponent implements OnInit {
  private _visible: boolean = false;
  private _shop: ShopDto = {} as ShopDto;
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
  set shop(value: ShopDto) {
    this._shop = value;
    this.shopChange.emit(value);
    if (this.visible && value) {
      this.handleInputChanges();
    }
  }
  get shop(): ShopDto {
    return this._shop;
  }

  @Input()
  set isEditMode(value: boolean) {
    this._isEditMode = value;
    this.isEditModeChange.emit(value);
    if (this.visible && this.shop && value) {
      this.handleInputChanges();
    }
  }
  get isEditMode(): boolean {
    return this._isEditMode;
  }

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<{ shop: CreateUpdateShopDto; isEditMode: boolean }>();
  @Output() shopChange = new EventEmitter<ShopDto>();
  @Output() isEditModeChange = new EventEmitter<boolean>();

  shopForm!: FormGroup;
  submitted: boolean = false;
  loading: boolean = false;
  logoPreview: string | null = null;
  autoGenerateSlug: boolean = true;
  autoGenerateTenantName: boolean = true;
  descriptionMaxLength: number = 2000;
  descriptionLength: number = 0;
  passwordStrength: string = '';
  showCredentialsDialog: boolean = false;
  createdCredentials: { tenantName: string; adminEmail: string; adminPassword: string } | null = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initForm();
    if (this.isEditMode && this.shop) {
      setTimeout(() => {
        this.populateForm();
      }, 100);
    }
  }

  private handleInputChanges() {
    if (!this.visible || !this.shop) {
      return;
    }
    this.initForm();
    if (this.isEditMode) {
      this.populateForm();
    }
  }

  initForm() {
    const tenantValidators = this.isEditMode ? [] : [Validators.required];
    
    this.shopForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(256)]],
      slug: ['', [Validators.required, Validators.maxLength(256)]],
      description: ['', [Validators.maxLength(2000)]],
      logoUrl: ['', [Validators.maxLength(512)]],
      isActive: [true],
      settings: [''],
      // Tenant fields (only required for create)
      tenantName: ['', tenantValidators.concat([Validators.maxLength(64)])],
      adminEmail: ['', tenantValidators.concat([Validators.email, Validators.maxLength(256)])],
      adminPassword: ['', tenantValidators.concat([Validators.minLength(6), Validators.maxLength(128)])],
      confirmPassword: ['', tenantValidators],
      adminUserName: ['', [Validators.maxLength(256)]],
      adminFirstName: ['', [Validators.maxLength(64)]],
      adminLastName: ['', [Validators.maxLength(64)]],
    }, { validators: this.passwordMatchValidator.bind(this) });

    // Auto-generate slug from name
    this.shopForm.get('name')?.valueChanges.subscribe((name) => {
      if (this.autoGenerateSlug && name) {
        const slug = this.generateSlug(name);
        this.shopForm.patchValue({ slug }, { emitEvent: false });
      }
      // Auto-generate tenant name from shop name (only on create)
      if (!this.isEditMode && this.autoGenerateTenantName && name) {
        const tenantName = this.generateSlug(name);
        this.shopForm.patchValue({ tenantName }, { emitEvent: false });
      }
    });

    // Auto-generate admin username from email
    this.shopForm.get('adminEmail')?.valueChanges.subscribe((email) => {
      if (!this.isEditMode && email && !this.shopForm.get('adminUserName')?.value) {
        this.shopForm.patchValue({ adminUserName: email }, { emitEvent: false });
      }
    });

    // Password strength checker
    this.shopForm.get('adminPassword')?.valueChanges.subscribe((password) => {
      if (password) {
        this.passwordStrength = this.checkPasswordStrength(password);
      } else {
        this.passwordStrength = '';
      }
    });

    // Update description length counter
    this.shopForm.get('description')?.valueChanges.subscribe((desc) => {
      this.descriptionLength = desc?.length || 0;
    });

    // Update logo preview
    this.shopForm.get('logoUrl')?.valueChanges.subscribe((url) => {
      if (url && this.isValidUrl(url)) {
        this.logoPreview = url;
      } else {
        this.logoPreview = null;
      }
    });
  }

  populateForm() {
    if (this.shop && this.shopForm) {
      this.shopForm.patchValue({
        name: this.shop.name || '',
        slug: this.shop.slug || '',
        description: this.shop.description || '',
        logoUrl: this.shop.logoUrl || '',
        isActive: this.shop.isActive !== undefined ? this.shop.isActive : true,
        settings: this.shop.settings || '',
        // Tenant fields are not populated on edit (read-only)
      });
      this.descriptionLength = this.shop.description?.length || 0;
      if (this.shop.logoUrl) {
        this.logoPreview = this.shop.logoUrl;
      }
      this.autoGenerateSlug = false; // Don't auto-generate when editing
      this.autoGenerateTenantName = false; // Don't auto-generate when editing
    }
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
      const name = this.shopForm.get('name')?.value;
      if (name) {
        const slug = this.generateSlug(name);
        this.shopForm.patchValue({ slug });
      }
    }
  }

  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  passwordMatchValidator = (form: FormGroup) => {
    const password = form.get('adminPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    // Only validate if both fields have values
    if (password.value && confirmPassword.value) {
      if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      } else {
        const errors = { ...confirmPassword.errors };
        delete errors['passwordMismatch'];
        confirmPassword.setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
    }
    
    return null;
  }

  checkPasswordStrength(password: string): string {
    if (!password) return '';
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    if (strength <= 2) return 'weak';
    if (strength <= 3) return 'medium';
    return 'strong';
  }

  toggleTenantNameAutoGeneration() {
    this.autoGenerateTenantName = !this.autoGenerateTenantName;
    if (this.autoGenerateTenantName) {
      const name = this.shopForm.get('name')?.value;
      if (name) {
        const tenantName = this.generateSlug(name);
        this.shopForm.patchValue({ tenantName });
      }
    }
  }

  onSave() {
    this.submitted = true;
    if (this.shopForm.invalid) {
      return;
    }

    this.loading = true;
    const formValue = this.shopForm.value;
    const shopDto: CreateUpdateShopDto = {
      name: formValue.name,
      slug: formValue.slug,
      description: formValue.description || undefined,
      logoUrl: formValue.logoUrl || undefined,
      isActive: formValue.isActive,
      settings: formValue.settings || undefined,
    };

    // Add tenant fields only for create
    if (!this.isEditMode) {
      shopDto.tenantName = formValue.tenantName;
      shopDto.adminEmail = formValue.adminEmail;
      shopDto.adminPassword = formValue.adminPassword;
      shopDto.adminUserName = formValue.adminUserName || undefined;
      shopDto.adminFirstName = formValue.adminFirstName || undefined;
      shopDto.adminLastName = formValue.adminLastName || undefined;
    }

    this.save.emit({ shop: shopDto, isEditMode: this.isEditMode });
    this.loading = false;
  }

  hideDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.submitted = false;
    this.shopForm.reset();
    this.logoPreview = null;
    this.autoGenerateSlug = true;
    this.autoGenerateTenantName = true;
    this.descriptionLength = 0;
    this.passwordStrength = '';
    this.showCredentialsDialog = false;
    this.createdCredentials = null;
  }

  showCredentials(tenantName: string, adminEmail: string, adminPassword: string) {
    this.createdCredentials = { tenantName, adminEmail, adminPassword };
    this.showCredentialsDialog = true;
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      // Could show a toast notification here
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

  getFieldError(fieldName: string): string {
    const field = this.shopForm.get(fieldName);
    if (field && field.invalid && (field.dirty || field.touched || this.submitted)) {
      if (field.errors?.['required']) {
        return `${fieldName} is required`;
      }
      if (field.errors?.['maxlength']) {
        return `${fieldName} must be less than ${field.errors['maxlength'].requiredLength} characters`;
      }
      if (field.errors?.['minlength']) {
        return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors?.['email']) {
        return 'Invalid email format';
      }
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.shopForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }
}

