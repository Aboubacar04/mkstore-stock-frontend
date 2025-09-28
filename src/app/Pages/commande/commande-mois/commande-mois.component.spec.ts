import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandeMoisComponent } from './commande-mois.component';

describe('CommandeMoisComponent', () => {
  let component: CommandeMoisComponent;
  let fixture: ComponentFixture<CommandeMoisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandeMoisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommandeMoisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
