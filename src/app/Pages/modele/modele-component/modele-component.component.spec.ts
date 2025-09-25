import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModeleComponentComponent } from './modele-component.component';

describe('ModeleComponentComponent', () => {
  let component: ModeleComponentComponent;
  let fixture: ComponentFixture<ModeleComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModeleComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModeleComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
