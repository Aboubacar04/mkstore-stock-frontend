import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandeJourComponent } from './commande-jour.component';

describe('CommandeJourComponent', () => {
  let component: CommandeJourComponent;
  let fixture: ComponentFixture<CommandeJourComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandeJourComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommandeJourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
