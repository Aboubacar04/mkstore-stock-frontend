import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { HeaderComponentComponent } from "./layout/header-component/header-component.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponentComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'gestion-stock-frontend';
  showHeader: boolean = true;

  constructor(private router: Router) {
    // Vérifier immédiatement la route actuelle dans le constructor
    this.updateHeaderVisibility(this.router.url);
  }

  ngOnInit(): void {
    // Écouter les changements de route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Mettre à jour la visibilité du header
        this.updateHeaderVisibility(event.url);
      });
  }

  // Méthode pour mettre à jour la visibilité du header
  private updateHeaderVisibility(url: string): void {
    // Masquer le header si on est sur /login ou sur la racine / (qui redirige vers login)
    this.showHeader = !url.includes('/login') && url !== '/' && url !== '';
  }
}
