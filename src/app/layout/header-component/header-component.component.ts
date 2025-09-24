import { Component } from '@angular/core';

@Component({
  selector: 'app-header-component',
  standalone: true,
  imports: [

  ],
  templateUrl: './header-component.component.html',
  styleUrls: ['./header-component.component.css']
})
export class HeaderComponentComponent {
   menuActive = false;

  toggleMenu() {
    this.menuActive = !this.menuActive;
  }

  closeMenu() {
    this.menuActive = false; // Ferme le menu après avoir cliqué sur un lien
  }
}
