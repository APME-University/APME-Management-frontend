import { Component, EventEmitter, Input, OnInit, Output, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { AddressService } from '../../proxy/customers/addresses/address.service';
// import { LookupDto } from '../../proxy/models';
import { IdentityRoleDto, IdentityUserCreateDto, IdentityUserDto, IdentityUserService, IdentityUserUpdateDto } from '@abp/ng.identity/proxy';

@Component({
  selector: 'app-create-update-user',
  standalone: false,
  templateUrl: './create-update-user.component.html',
  styleUrls: ['./create-update-user.component.scss']
})
export class CreateUpdateUserComponent implements OnInit {
  private _visible: boolean = false;
  private _user: IdentityUserDto = {} as IdentityUserDto;
  private _isEditMode: boolean = false;

  @Input() 
  set visible(value: boolean) {
    this._visible = value;
    if (value) {
      console.log('Dialog became visible, calling handleInputChanges');
      this.handleInputChanges();
    }
  }
  get visible(): boolean {
    return this._visible;
  }

  @Input() 
  set user(value: IdentityUserDto) {
    this._user = value;
    this.userChange.emit(value);
    if (this.visible && value) {
      this.handleInputChanges();
    }
  }
  get user(): IdentityUserDto {
    return this._user;
  }

  @Input() 
  set isEditMode(value: boolean) {
    this._isEditMode = value;
    this.isEditModeChange.emit(value);
    if (this.visible && this.user && value) {
      this.handleInputChanges();
    }
  }
  get isEditMode(): boolean {
    return this._isEditMode;
  }

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<{ user: IdentityUserDto, isEditMode: boolean }>();
  @Output() userChange = new EventEmitter<IdentityUserDto>();
  @Output() isEditModeChange = new EventEmitter<boolean>();

  userForm!: FormGroup;
  submitted: boolean = false;
  allRoles: IdentityRoleDto[] = []; // Store all roles
  
  constructor(
    private fb: FormBuilder,
    // private addressService: AddressService,
    private identityUserService: IdentityUserService
  ) {}

  ngOnInit() {
    this.initForm();
    
    // If we already have user data and are in edit mode, populate the form
    if (this.isEditMode && this.user) {
      setTimeout(() => {
        this.patchForm();
      }, 100);
    }
    
    // Load roles
    this.loadRoles();
  }
  // Handle input changes efficiently
  private handleInputChanges() {
    console.log('handleInputChanges called:', { visible: this.visible, user: this.user, isEditMode: this.isEditMode });
    
    if (!this.visible || !this.user) {
      console.log('Early return from handleInputChanges');
      return;
    }
    this.initForm();
    
    // If in edit mode, populate the form with existing user data immediately
    if (this.isEditMode) {
      console.log('Edit mode detected, calling patchForm immediately');
      this.patchForm();
    }
    
   
    this.loadRoles();
  }



  loadRoles() {
    console.log('Loading roles...');
    this.identityUserService.getAssignableRoles().subscribe((result) => {
      this.allRoles = result.items || [];
      console.log('Roles loaded:', this.allRoles);
    });
  }

  // Method to ensure form is populated with current data
  ensureFormPopulated() {
    console.log('ensureFormPopulated called');
    if (this.isEditMode && this.user && this.userForm) {
      console.log('Ensuring form is populated');
      this.patchForm();
    }
  }

  // Method to handle when the form is ready
  onFormReady() {
    console.log('Form is ready');
    if (this.isEditMode && this.user) {
      console.log('Form ready in edit mode, calling patchForm');
      this.patchForm();
    }
  }

  initForm() {
    console.log('Initializing form, isEditMode:', this.isEditMode);
    
    this.userForm = this.fb.group({
      userName: ['', [Validators.required]],
      name: [''],
      surname: [''],
      email: ['', []],
      phoneNumber: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      isActive: [true],
      lockoutEnabled: [false],
      roles: [[], [Validators.required, this.validateRolesArray.bind(this)]] // Add roles field with validation
    });

    // Remove password validation for edit mode
    if (this.isEditMode) {
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
    }
    
    console.log('Form initialized:', this.userForm);
    
    // If in edit mode and we have user data, populate the form after initialization
    if (this.isEditMode && this.user) {
      console.log('Form initialized in edit mode, calling patchForm');
      setTimeout(() => {
        this.patchForm();
      }, 50);
    }
    
    // Call onFormReady after form initialization
    setTimeout(() => {
      this.onFormReady();
    }, 100);
  }

  // Custom validator for cities array
 

  // Custom validator for roles array
  private validateRolesArray(control: any): { [key: string]: any } | null {
    const roles = control.value;
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return { roleRequired: true };
    }
    
    const validRoles = roles.filter((role: any) => 
      role && typeof role === 'string' && role.trim() !== ''
    );
    
    if (validRoles.length === 0) {
      return { invalidRoles: true };
    }
    
    return null;
  }

  patchForm() {


    
    // Extract role names for the multiselect - load from service if in edit mode
    let roleNames: string[] = [];
    if (this.isEditMode && this.user.id) {
      this.identityUserService.getRoles(this.user.id).subscribe((result) => {
        roleNames = result.items?.map(role => role.name || '') || [];
        console.log('Loaded user roles:', roleNames);
        
        // Update the form with roles after loading
        this.userForm.patchValue({ roles: roleNames });
      });
    }
    
  
    this.userForm.patchValue({
      userName: this.user.userName || '',
      name: this.user.name || '',
      surname: this.user.surname || '',
      email: this.user.email || '',
      phoneNumber: this.user.phoneNumber || '',
      isActive: this.user.isActive !== undefined ? this.user.isActive : true,
      lockoutEnabled: this.user.lockoutEnabled !== undefined ? this.user.lockoutEnabled : false,
      roles: roleNames
    });
    
    console.log('Form values after patching:', this.userForm.value);
    console.log('Form roles value after patching:', this.userForm.get('roles')?.value);
  }


  public onSave() {
    this.submitted = true;
    
    // Debug form state before processing

    if (this.userForm.valid) {      
      const formValue = this.userForm.value;
      
      // Extract and validate cities from form value
      
      // Extract role names from form value
      const roleNamesArray = this.validateRolesData(formValue.roles);
      
      if (this.isEditMode) {
        const updateDto: IdentityUserUpdateDto = {
          userName: formValue.userName,
          name: formValue.name,
          surname: formValue.surname,
          email: formValue.email,
          phoneNumber: formValue.phoneNumber,
          isActive: formValue.isActive,
          lockoutEnabled: formValue.lockoutEnabled,
          roleNames: roleNamesArray, // Use the processed roles array
          concurrencyStamp: this.user.concurrencyStamp
        };

        this.save.emit({ user: updateDto as any, isEditMode: true });
      } else {
        const createDto: IdentityUserCreateDto = {
          userName: formValue.userName,
          name: formValue.name,
          surname: formValue.surname,
          email: formValue.email,
          phoneNumber: formValue.phoneNumber,
          password: formValue.password,
          isActive: formValue.isActive,
          lockoutEnabled: formValue.lockoutEnabled,
          roleNames: roleNamesArray, // Use the processed roles array
        };

        this.save.emit({ user: createDto as any, isEditMode: false });
      }
    }
  }

  onCancel() {
    this.resetComponentState();
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onHide() {
    this.resetComponentState();
    this.visible = false;
    this.visibleChange.emit(false);
  }

  private resetComponentState() {
    this.submitted = false;
    this.userForm.reset();
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field?.invalid && this.submitted) {
      if (field.hasError('required')) {
        return '::Required';
      }
      if (field.hasError('email')) {
        return '::InvalidEmail';
      }
      if (field.hasError('minlength')) {
        return '::MinLength';
      }
    
     
      if (field.hasError('roleRequired')) {
        return '::AtLeastOneRoleRequired';
      }
      if (field.hasError('invalidRoles')) {
        return '::InvalidRoles';
      }
    } 
    return '';
  }

  // Method to handle dialog opening
  onDialogOpen() {
    if (this.visible && this.user) {
      this.handleInputChanges();
    }
  }

  // Method to handle user data updates
  updateUserData(newUser: IdentityUserDto) {
    this._user = newUser;
    if (this.visible) {
      this.handleInputChanges();
    }
  }

  // Public method to manually populate the form
  populateForm() {
    if (this.isEditMode && this.user) {
      this.patchForm();
    }
  }

  // Method called when dialog is shown
  onShow() {
    if (this.isEditMode && this.user) {
      this.patchForm();
    }
  }

  // Method to validate cities data before sending


  // Method to validate roles data before sending
  private validateRolesData(roles: any[]): string[] {
    if (!roles || !Array.isArray(roles)) {
      return [];
    }
    
    const validRoleNames = roles.filter(roleName => {
      const isValid = roleName && typeof roleName === 'string' && roleName.trim() !== '';
      if (!isValid) {
      }
      return isValid;
    });
    
    return validRoleNames;
  }

  // Method to test cities selection
 

  // Method to test roles selection
  public testRolesSelection() {
    if (this.allRoles && this.allRoles.length > 0) {
      const testRoleNames = this.allRoles.slice(0, 2).map(role => role.name);
      this.userForm.patchValue({ roles: testRoleNames });
    }
  }
}
