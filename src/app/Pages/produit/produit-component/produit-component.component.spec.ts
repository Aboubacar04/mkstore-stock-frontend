import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProduitComponentComponent } from './produit-component.component';

describe('ProduitComponentComponent', () => {
  let component: ProduitComponentComponent;
  let fixture: ComponentFixture<ProduitComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProduitComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProduitComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
