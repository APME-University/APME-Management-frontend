import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  ProductDto, 
  ProductAttributeDto, 
  ProductAttributeService
} from '../../../proxy/products';
import { ProductAttributeDataType } from '../../../proxy/products/product-attribute-data-type.enum';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-product-attributes-display',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TagModule,
    ProgressSpinnerModule,
    DividerModule
  ],
  templateUrl: './product-attributes-display.component.html',
  styleUrls: ['./product-attributes-display.component.scss']
})
export class ProductAttributesDisplayComponent implements OnInit, OnChanges {
  @Input() product!: ProductDto;
  @Input() shopId?: string;
  
  productAttributes: ProductAttributeDto[] = [];
  loading: boolean = false;
  
  ProductAttributeDataType = ProductAttributeDataType;
  
  constructor(private productAttributeService: ProductAttributeService) {}
  
  ngOnInit(): void {
    this.loadProductAttributes();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['shopId'] && !changes['shopId'].firstChange) {
      this.loadProductAttributes();
    }
    if (changes['product'] && !changes['product'].firstChange) {
      // Reload attributes if product changes
      this.loadProductAttributes();
    }
  }
  
  /**
   * Load product attributes for the shop
   */
  loadProductAttributes(): void {
    const shopIdToUse = this.shopId || this.product?.shopId;
    
    if (!shopIdToUse) {
      return;
    }
    
    this.loading = true;
    
    this.productAttributeService.getList({ 
      shopId: shopIdToUse,
      maxResultCount: 1000 
    }).subscribe({
      next: (result) => {
        this.productAttributes = (result.items || []).sort((a, b) => 
          (a.displayOrder || 0) - (b.displayOrder || 0)
        );
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading product attributes:', error);
        this.loading = false;
      }
    });
  }
  
  /**
   * Get attribute value from product's attributes JSON
   */
  getAttributeValue(attributeName: string): any {
    if (!this.product?.attributes) {
      return null;
    }
    
    try {
      const attributes = JSON.parse(this.product.attributes);
      return attributes[attributeName] ?? null;
    } catch {
      return null;
    }
  }
  
  /**
   * Get display name for an attribute
   */
  getAttributeDisplayName(attributeName: string): string {
    const attr = this.productAttributes.find(a => a.name === attributeName);
    return attr?.displayName || attributeName;
  }
  
  /**
   * Format attribute value for display
   */
  formatAttributeValue(attributeName: string, value: any): string {
    const attr = this.productAttributes.find(a => a.name === attributeName);
    
    if (!attr) {
      return String(value);
    }
    
    switch (attr.dataType) {
      case ProductAttributeDataType.Boolean:
        return value ? 'Yes' : 'No';
        
      case ProductAttributeDataType.Date:
        if (typeof value === 'string') {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString();
          }
        }
        return String(value);
        
      case ProductAttributeDataType.Number:
        return typeof value === 'number' 
          ? value.toLocaleString() 
          : String(value);
        
      case ProductAttributeDataType.Text:
      default:
        return String(value);
    }
  }
  
  /**
   * Check if product has any attributes
   */
  hasAttributes(): boolean {
    if (!this.product?.attributes) {
      return false;
    }
    
    try {
      const attributes = JSON.parse(this.product.attributes);
      return Object.keys(attributes).length > 0;
    } catch {
      return false;
    }
  }
  
  /**
   * Get all attribute entries with metadata
   */
  getAttributeEntries(): Array<{ 
    name: string; 
    displayName: string; 
    value: any; 
    dataType: ProductAttributeDataType;
  }> {
    if (!this.hasAttributes()) {
      return [];
    }
    
    try {
      const attributes = JSON.parse(this.product.attributes);
      return Object.entries(attributes)
        .map(([name, value]) => {
          const attr = this.productAttributes.find(a => a.name === name);
          return {
            name,
            displayName: attr?.displayName || name,
            value,
            dataType: attr?.dataType ?? ProductAttributeDataType.Text
          };
        })
        .filter(entry => entry.value !== null && entry.value !== undefined && entry.value !== '')
        .sort((a, b) => {
          // Sort by display order if available
          const attrA = this.productAttributes.find(attr => attr.name === a.name);
          const attrB = this.productAttributes.find(attr => attr.name === b.name);
          const orderA = attrA?.displayOrder ?? 999;
          const orderB = attrB?.displayOrder ?? 999;
          return orderA - orderB;
        });
    } catch {
      return [];
    }
  }
}
