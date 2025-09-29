import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-retour-button',
  imports: [],
  templateUrl: './retour-button.component.html',
  styleUrl: './retour-button.component.css'
})
export class RetourButtonComponent {

  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}
