import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetourButtonComponent } from './retour-button.component';

describe('RetourButtonComponent', () => {
  let component: RetourButtonComponent;
  let fixture: ComponentFixture<RetourButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetourButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RetourButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
