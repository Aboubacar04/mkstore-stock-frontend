import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommandeServiceService } from '../../../Service/commande-service.service';
import { FormsModule } from '@angular/forms';


// Modèles
export class DetailCommande {
  idProduit: number = 0;
  nomModele: string = '';
  couleur: string = '';
  taille: string = '';
  quantite: number = 0;
  prixUnitaire: number = 0;
  totalLigne: number = 0;
}

export class Commande {
  idCommande?: number;
  date: string = '';
  nomClient: string = '';
  total: number = 0;
  details: DetailCommande[] = [];
}

@Component({
  selector: 'app-commande-jour',
  standalone: true,
  imports: [CommonModule, FormsModule,],
  templateUrl: './commande-jour.component.html',
  styleUrl: './commande-jour.component.css'
})
export class CommandeJourComponent implements OnInit {
  commandesDuJour: Commande[] = [];
  commandeSelectionnee: Commande | null = null;
  showDetailModal: boolean = false;
  isLoading: boolean = false;
  dateAujourdhui: string = '';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 7;
  totalPages: number = 1;

  // Pour les alertes
  alertMessage: string = '';
  alertType: 'success' | 'error' | '' = '';
  showAlert: boolean = false;

  constructor(private commandeService: CommandeServiceService) {}

  ngOnInit(): void {
    this.dateAujourdhui = this.getDateAujourdhui();
    this.loadCommandesDuJour();

    // Rafraîchir automatiquement à minuit
    this.programmerRafraichissementMinuit();
  }

  // Obtenir la date d'aujourd'hui au format YYYY-MM-DD
  getDateAujourdhui(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Charger les commandes du jour
  loadCommandesDuJour(): void {
    this.isLoading = true;
    this.commandeService.getAllCommandes().subscribe({
      next: (commandes: any[]) => {
        // Filtrer uniquement les commandes d'aujourd'hui
        this.commandesDuJour = commandes.filter(commande => {
          const commandeDate = new Date(commande.date).toISOString().split('T')[0];
          return commandeDate === this.dateAujourdhui;
        });
        this.calculateTotalPages();
        this.isLoading = false;
        console.log('Commandes du jour:', this.commandesDuJour);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commandes:', error);
        this.showAlertMessage('Erreur lors du chargement des commandes', 'error');
        this.isLoading = false;
      }
    });
  }

  // Calculer le nombre total de pages
  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.commandesDuJour.length / this.itemsPerPage);
  }

  // Obtenir les commandes de la page actuelle
  getCommandesPaginees(): Commande[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.commandesDuJour.slice(startIndex, endIndex);
  }

  // Navigation pagination
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Générer les numéros de pages à afficher
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;

    if (this.totalPages <= maxPagesToShow) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push(-1);
        pages.push(this.totalPages);
      } else if (this.currentPage >= this.totalPages - 2) {
        pages.push(1);
        pages.push(-1);
        for (let i = this.totalPages - 3; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push(-1);
        pages.push(this.totalPages);
      }
    }

    return pages;
  }

  // Calculer le total du jour
  getTotalDuJour(): number {
    return this.commandesDuJour.reduce((sum, commande) => sum + (commande.total || 0), 0);
  }

  // Nombre de commandes du jour
  getNombreCommandesDuJour(): number {
    return this.commandesDuJour.length;
  }

  // Programmer le rafraîchissement à minuit
  programmerRafraichissementMinuit(): void {
    const maintenant = new Date();
    const minuit = new Date();
    minuit.setHours(24, 0, 0, 0);

    const tempsJusquaMinuit = minuit.getTime() - maintenant.getTime();

    setTimeout(() => {
      this.dateAujourdhui = this.getDateAujourdhui();
      this.commandesDuJour = [];
      this.currentPage = 1; // Réinitialiser à la page 1
      this.loadCommandesDuJour();
      this.programmerRafraichissementMinuit(); // Reprogrammer pour le lendemain
    }, tempsJusquaMinuit);
  }

  // Ouvrir le modal des détails
  openDetailModal(commande: Commande): void {
    this.commandeSelectionnee = commande;
    this.showDetailModal = true;
  }

  // Fermer le modal
  closeDetailModal(): void {
    this.showDetailModal = false;
    this.commandeSelectionnee = null;
  }

  // Formater le prix
  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  }

  // Formater la date avec l'heure
  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  // Formater juste l'heure
  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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

  // Rafraîchir les données
  rafraichir(): void {
    this.currentPage = 1;
    this.loadCommandesDuJour();
    this.showAlertMessage('Données actualisées', 'success');
  }
}
