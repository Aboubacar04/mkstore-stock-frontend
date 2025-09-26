import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceuilComponentComponent } from './acceuil-component.component';

describe('AcceuilComponentComponent', () => {
  let component: AcceuilComponentComponent;
  let fixture: ComponentFixture<AcceuilComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcceuilComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcceuilComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
