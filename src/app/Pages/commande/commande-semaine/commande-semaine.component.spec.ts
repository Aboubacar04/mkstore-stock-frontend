import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandeSemaineComponent } from './commande-semaine.component';

describe('CommandeSemaineComponent', () => {
  let component: CommandeSemaineComponent;
  let fixture: ComponentFixture<CommandeSemaineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandeSemaineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommandeSemaineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
