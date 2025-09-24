import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TailleComponent } from './taille-component.component';

describe('TailleComponentComponent', () => {
  let component: TailleComponent;
  let fixture: ComponentFixture<TailleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TailleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TailleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
