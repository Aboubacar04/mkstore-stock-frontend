import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TailleComponentComponent } from './taille-component.component';

describe('TailleComponentComponent', () => {
  let component: TailleComponentComponent;
  let fixture: ComponentFixture<TailleComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TailleComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TailleComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
