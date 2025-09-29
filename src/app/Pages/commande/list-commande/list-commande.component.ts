import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommandeServiceService } from '../../../Service/commande-service.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

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
  selector: 'app-list-commande',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './list-commande.component.html',
  styleUrl: './list-commande.component.css'
})
export class ListCommandeComponent implements OnInit {
  commandes: Commande[] = [];
  commandeSelectionnee: Commande | null = null;
  showDetailModal: boolean = false;
  isLoading: boolean = false;

  // Modal de suppression
  showDeleteModal: boolean = false;
  commandeToDelete: Commande | null = null;

  // Propriétés de filtrage
  periodeFiltre: 'tous' | 'journee' | 'hebdomadaire' | 'mensuel' = 'tous';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 9;
  totalPages: number = 1;

  // Pour les alertes
  alertMessage: string = '';
  alertType: 'success' | 'error' | '' = '';
  showAlert: boolean = false;

  constructor(private commandeService: CommandeServiceService) {}

  ngOnInit(): void {
    this.loadCommandes();
  }

  loadCommandes(): void {
    this.isLoading = true;
    this.commandeService.getAllCommandes().subscribe({
      next: (commandes: any[]) => {
        this.commandes = commandes;
        this.calculateTotalPages();
        this.isLoading = false;
        console.log('Commandes chargées:', this.commandes);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commandes:', error);
        this.showAlertMessage('Erreur lors du chargement des commandes', 'error');
        this.isLoading = false;
      }
    });
  }

  // Méthode de filtrage par période
  filtrerParPeriode(periode: string): void {
    this.periodeFiltre = periode as any;
    this.currentPage = 1;
    this.calculateTotalPages();
  }

  // Obtenir les commandes filtrées
  getCommandesFiltrees(): Commande[] {
    if (this.periodeFiltre === 'tous') {
      return this.commandes;
    }

    const aujourd_hui = new Date();
    aujourd_hui.setHours(0, 0, 0, 0);

    return this.commandes.filter(commande => {
      const dateCommande = new Date(commande.date);
      dateCommande.setHours(0, 0, 0, 0);

      switch (this.periodeFiltre) {
        case 'journee':
          return dateCommande.getTime() === aujourd_hui.getTime();

        case 'hebdomadaire':
          const debutSemaine = new Date(aujourd_hui);
          const jourSemaine = aujourd_hui.getDay();
          debutSemaine.setDate(aujourd_hui.getDate() - jourSemaine);
          const finSemaine = new Date(debutSemaine);
          finSemaine.setDate(debutSemaine.getDate() + 6);
          finSemaine.setHours(23, 59, 59, 999);
          return dateCommande >= debutSemaine && dateCommande <= finSemaine;

        case 'mensuel':
          return dateCommande.getMonth() === aujourd_hui.getMonth()
            && dateCommande.getFullYear() === aujourd_hui.getFullYear();

        default:
          return true;
      }
    });
  }

  // Compter les commandes par période
  getCountByPeriode(periode: string): number {
    const periodeSauvegardee = this.periodeFiltre;
    this.periodeFiltre = periode as any;
    const count = this.getCommandesFiltrees().length;
    this.periodeFiltre = periodeSauvegardee;
    return count;
  }

  // Calculer le total général des commandes filtrées
  getTotalGeneralFiltre(): number {
    return this.getCommandesFiltrees().reduce((total, commande) =>
      total + (commande.total || 0), 0
    );
  }

  // Obtenir le texte d'information du filtre
  getFilterInfoText(): string {
    const aujourd_hui = new Date();

    switch (this.periodeFiltre) {
      case 'journee':
        return `Affichage des commandes du ${aujourd_hui.toLocaleDateString('fr-FR')}`;

      case 'hebdomadaire':
        const debutSemaine = new Date(aujourd_hui);
        const jourSemaine = aujourd_hui.getDay();
        debutSemaine.setDate(aujourd_hui.getDate() - jourSemaine);
        const finSemaine = new Date(debutSemaine);
        finSemaine.setDate(debutSemaine.getDate() + 6);
        return `Affichage des commandes du ${debutSemaine.toLocaleDateString('fr-FR')} au ${finSemaine.toLocaleDateString('fr-FR')}`;

      case 'mensuel':
        const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
        const mois = aujourd_hui.toLocaleDateString('fr-FR', options);
        return `Affichage des commandes de ${mois}`;

      default:
        return 'Affichage de toutes les commandes';
    }
  }

  // Calculer le nombre total de pages
  calculateTotalPages(): void {
    const commandesFiltrees = this.getCommandesFiltrees();
    this.totalPages = Math.ceil(commandesFiltrees.length / this.itemsPerPage);

    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
  }

  // Obtenir les commandes de la page actuelle
  getCommandesPaginees(): Commande[] {
    const commandesFiltrees = this.getCommandesFiltrees();
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return commandesFiltrees.slice(startIndex, endIndex);
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

  // Calculer le total de toutes les commandes
  getTotalGeneral(): number {
    return this.commandes.reduce((sum, commande) => sum + (commande.total || 0), 0);
  }

  // Ouvrir le modal des détails
  openDetailModal(commande: Commande): void {
    this.commandeSelectionnee = commande;
    this.showDetailModal = true;
  }

  // Fermer le modal des détails
  closeDetailModal(): void {
    this.showDetailModal = false;
    this.commandeSelectionnee = null;
  }

  // Ouvrir le modal de suppression
  openDeleteModal(commande: Commande, event: Event): void {
    event.stopPropagation(); // Empêcher l'ouverture du modal de détails
    this.commandeToDelete = commande;
    this.showDeleteModal = true;
  }

  // Fermer le modal de suppression
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.commandeToDelete = null;
  }

  // Confirmer la suppression
  confirmDelete(): void {
    if (this.commandeToDelete && this.commandeToDelete.idCommande) {
      this.isLoading = true;
      this.commandeService.deleteCommande(this.commandeToDelete.idCommande).subscribe({
        next: () => {
          this.showAlertMessage('Commande supprimée avec succès !', 'success');
          this.loadCommandes();
          this.closeDeleteModal();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.showAlertMessage('Erreur lors de la suppression de la commande', 'error');
          this.isLoading = false;
        }
      });
    }
  }

  // Formater le prix
  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  }

  // Formater la date
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
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
}
