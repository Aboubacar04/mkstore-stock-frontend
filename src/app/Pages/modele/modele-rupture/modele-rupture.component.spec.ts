import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModeleRuptureComponent } from './modele-rupture.component';

describe('ModeleRuptureComponent', () => {
  let component: ModeleRuptureComponent;
  let fixture: ComponentFixture<ModeleRuptureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModeleRuptureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModeleRuptureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
