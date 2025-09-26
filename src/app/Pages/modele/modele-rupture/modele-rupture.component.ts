import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ModeleServiceService } from '../../../Service/modele-service.service';
import { Modele } from '../../../modeles/modele';

@Component({
  selector: 'app-modele-rupture',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modele-rupture.component.html',
  styleUrl: './modele-rupture.component.css'
})
export class ModeleRuptureComponent implements OnInit {
  modelesEnRupture: Modele[] = [];
  isLoading: boolean = false;
  imageErrors: Set<number> = new Set();

  // Messages
  alertMessage: string = '';
  alertType: 'success' | 'error' | '' = '';
  showAlert: boolean = false;

  constructor(
    private modeleService: ModeleServiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadModelesEnRupture();
  }

  // Charger les modèles en rupture (total_pieces <= 3)
  loadModelesEnRupture(): void {
    this.isLoading = true;
    this.modeleService.getModele().subscribe({
      next: (response: any) => {
        const allModeles = response.data || response;
        // Filtrer les modèles avec total_pieces <= 3
        this.modelesEnRupture = allModeles.filter(
          (modele: Modele) => modele.total_pieces <= 3
        );
        this.isLoading = false;
      },
      error: (error) => {
        this.showAlertMessage('Erreur lors du chargement des modèles', 'error');
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  // Naviguer vers la page de réapprovisionnement
  reapprovisionner(): void {
    this.router.navigate(['/stocks']);
  }

  // Obtenir le niveau de criticité
  getNiveauCriticite(totalPieces: number): string {
    if (totalPieces === 0) return 'critique';
    if (totalPieces <= 1) return 'urgent';
    if (totalPieces <= 3) return 'attention';
    return 'normal';
  }

  // Obtenir l'icône selon le niveau
  getIconeCriticite(totalPieces: number): string {
    if (totalPieces === 0) return 'bi-x-octagon-fill';
    if (totalPieces <= 1) return 'bi-exclamation-triangle-fill';
    return 'bi-exclamation-circle-fill';
  }

  // Obtenir le texte du niveau
  getTexteCriticite(totalPieces: number): string {
    if (totalPieces === 0) return 'STOCK ÉPUISÉ';
    if (totalPieces <= 1) return 'CRITIQUE';
    return 'ALERTE';
  }

  // Rafraîchir les données
  rafraichir(): void {
    this.loadModelesEnRupture();
    this.showAlertMessage('Données actualisées', 'success');
  }

  // Gestion des images
  getImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    return `http://localhost:8080${imagePath}`;
  }

  onImageError(modeleId: number): void {
    this.imageErrors.add(modeleId);
  }

  hasImageError(modeleId: number): boolean {
    return this.imageErrors.has(modeleId);
  }

  // Formater le prix
  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  }

  // Messages d'alerte
  showAlertMessage(message: string, type: 'success' | 'error'): void {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;

    setTimeout(() => {
      this.showAlert = false;
    }, 4000);
  }

  closeAlert(): void {
    this.showAlert = false;
  }
}
