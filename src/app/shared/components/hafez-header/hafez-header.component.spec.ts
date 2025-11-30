import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HafezHeaderComponent } from './hafez-header.component';

describe('HafezHeaderComponent', () => {
  let component: HafezHeaderComponent;
  let fixture: ComponentFixture<HafezHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HafezHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HafezHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
