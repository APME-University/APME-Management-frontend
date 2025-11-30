import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HafezMenuComponent } from './hafez-menu.component';

describe('HafezMenuComponent', () => {
  let component: HafezMenuComponent;
  let fixture: ComponentFixture<HafezMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HafezMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HafezMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
