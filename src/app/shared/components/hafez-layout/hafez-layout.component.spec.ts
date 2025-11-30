import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HafezLayoutComponent } from './hafez-layout.component';

describe('HafezLayoutComponent', () => {
  let component: HafezLayoutComponent;
  let fixture: ComponentFixture<HafezLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HafezLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HafezLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
