// acceuil-component.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ModeleServiceService } from '../../../Service/modele-service.service';
import { CommandeServiceService } from '../../../Service/commande-service.service';
import { Modele } from '../../../modeles/modele';
import { Commande } from '../../../modeles/commande';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-acceuil-component',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './acceuil-component.component.html',
  styleUrls: ['./acceuil-component.component.css']
})
export class AcceuilComponentComponent implements OnInit {
  modeles: Modele[] = [];
  commandes: Commande[] = [];
  isLoading: boolean = false;
  imageErrors: Set<number> = new Set();

  stats = [
    {
      icon: 'bi-box-seam',
      value: '0',
      label: 'Modèles',
      color: '#F7B893'
    },
    {
      icon: 'bi-layers',
      value: '0',
      label: 'Pièces en Stock',
      color: '#28a745'
    },
    {
      icon: 'bi-cart-check',
      value: '0',
      label: 'Commandes',
      color: '#007bff'
    },
    {
      icon: 'bi-currency-exchange',
      value: '0 FCFA',
      label: 'Chiffre d\'affaires',
      color: '#ffc107'
    }
  ];

  constructor(
    private modeleService: ModeleServiceService,
    private commandeService: CommandeServiceService
  ) {}

  ngOnInit(): void {
    this.loadModeles();
    this.loadCommandes();
  }

  loadModeles(): void {
    this.isLoading = true;
    this.modeleService.getModele().subscribe({
      next: (response: any) => {
        this.modeles = response.data || response;
        this.updateStats();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement modèles:', error);
        this.isLoading = false;
      }
    });
  }

  loadCommandes(): void {
    this.commandeService.getAllCommandes().subscribe({
      next: (commandes: Commande[]) => {
        this.commandes = commandes;
        this.updateStats();
      },
      error: (error) => {
        console.error('Erreur chargement commandes:', error);
      }
    });
  }

  updateStats(): void {
    // Nombre de modèles
    this.stats[0].value = this.modeles.length.toString();

    // Total pièces en stock
    const totalPieces = this.modeles.reduce((sum, m) => sum + m.total_pieces, 0);
    this.stats[1].value = totalPieces.toString();

    // Nombre de commandes
    this.stats[2].value = this.commandes.length.toString();

    // Chiffre d'affaires total
    const chiffreAffaires = this.commandes.reduce((sum, c) => sum + c.total, 0);
    this.stats[3].value = this.formatPrice(chiffreAffaires);
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) {
      return '';
    }
    const fullUrl = `http://localhost:8080${imagePath}`;
    return fullUrl;
  }

  onImageError(modeleId: number): void {
    this.imageErrors.add(modeleId);
  }

  hasImageError(modeleId: number): boolean {
    return this.imageErrors.has(modeleId);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  }
}
