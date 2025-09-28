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
  selector: 'app-commande-semaine',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './commande-semaine.component.html',
  styleUrl: './commande-semaine.component.css'
})
export class CommandeSemaineComponent implements OnInit {
  commandesSemaine: Commande[] = [];
  commandeSelectionnee: Commande | null = null;
  showDetailModal: boolean = false;
  isLoading: boolean = false;

  // Dates de la semaine
  dateDebutSemaine: Date = new Date();
  dateFinSemaine: Date = new Date();
  numeroSemaine: number = 0;

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
    this.calculerDatesemaine();
    this.loadCommandesSemaine();

    // Rafraîchir automatiquement au début de la nouvelle semaine
    this.programmerRafraichissementSemaine();
  }

  // Calculer les dates de début et fin de semaine
  calculerDatesemaine(): void {
    const aujourd_hui = new Date();
    const jourSemaine = aujourd_hui.getDay();

    // Calculer le début de la semaine (dimanche)
    this.dateDebutSemaine = new Date(aujourd_hui);
    this.dateDebutSemaine.setDate(aujourd_hui.getDate() - jourSemaine);
    this.dateDebutSemaine.setHours(0, 0, 0, 0);

    // Calculer la fin de la semaine (samedi)
    this.dateFinSemaine = new Date(this.dateDebutSemaine);
    this.dateFinSemaine.setDate(this.dateDebutSemaine.getDate() + 6);
    this.dateFinSemaine.setHours(23, 59, 59, 999);

    // Calculer le numéro de semaine
    this.numeroSemaine = this.getNumeroSemaine(aujourd_hui);
  }

  // Obtenir le numéro de semaine dans l'année
  getNumeroSemaine(date: Date): number {
    const premierJanvier = new Date(date.getFullYear(), 0, 1);
    const joursEcoules = Math.floor((date.getTime() - premierJanvier.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((joursEcoules + premierJanvier.getDay() + 1) / 7);
  }

  // Charger les commandes de la semaine
  loadCommandesSemaine(): void {
    this.isLoading = true;
    this.commandeService.getAllCommandes().subscribe({
      next: (commandes: any[]) => {
        // Filtrer uniquement les commandes de la semaine courante
        this.commandesSemaine = commandes.filter(commande => {
          const dateCommande = new Date(commande.date);
          return dateCommande >= this.dateDebutSemaine && dateCommande <= this.dateFinSemaine;
        });

        // Trier par date décroissante (plus récentes en premier)
        this.commandesSemaine.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        this.calculateTotalPages();
        this.isLoading = false;
        console.log('Commandes de la semaine:', this.commandesSemaine);
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
    this.totalPages = Math.ceil(this.commandesSemaine.length / this.itemsPerPage);
  }

  // Obtenir les commandes de la page actuelle
  getCommandesPaginees(): Commande[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.commandesSemaine.slice(startIndex, endIndex);
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

  // Calculer le total de la semaine
  getTotalSemaine(): number {
    return this.commandesSemaine.reduce((sum, commande) => sum + (commande.total || 0), 0);
  }

  // Nombre de commandes de la semaine
  getNombreCommandesSemaine(): number {
    return this.commandesSemaine.length;
  }

  // Obtenir les commandes par jour de la semaine
  getCommandesParJour(jour: number): Commande[] {
    return this.commandesSemaine.filter(commande => {
      const dateCommande = new Date(commande.date);
      return dateCommande.getDay() === jour;
    });
  }

  // Calculer le total par jour
  getTotalParJour(jour: number): number {
    const commandesJour = this.getCommandesParJour(jour);
    return commandesJour.reduce((sum, commande) => sum + (commande.total || 0), 0);
  }

  // Obtenir le nom du jour
  getNomJour(jour: number): string {
    const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return jours[jour];
  }

  // Programmer le rafraîchissement au début de la nouvelle semaine
  programmerRafraichissementSemaine(): void {
    const maintenant = new Date();
    const prochainDimanche = new Date();

    // Calculer le prochain dimanche à minuit
    const joursSemaine = maintenant.getDay();
    const joursJusquaDimanche = joursSemaine === 0 ? 7 : 7 - joursSemaine;
    prochainDimanche.setDate(maintenant.getDate() + joursJusquaDimanche);
    prochainDimanche.setHours(0, 0, 0, 0);

    const tempsJusquaDimanche = prochainDimanche.getTime() - maintenant.getTime();

    setTimeout(() => {
      this.calculerDatesemaine();
      this.commandesSemaine = [];
      this.currentPage = 1;
      this.loadCommandesSemaine();
      this.programmerRafraichissementSemaine(); // Reprogrammer pour la semaine suivante
    }, tempsJusquaDimanche);
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
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  // Formater la date courte
  formatDateCourte(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short'
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

  // Formater la plage de dates de la semaine
  formatPlageDates(): string {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long'
    };
    const debut = this.dateDebutSemaine.toLocaleDateString('fr-FR', options);
    const fin = this.dateFinSemaine.toLocaleDateString('fr-FR', options);
    return `${debut} au ${fin}`;
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
    this.loadCommandesSemaine();
    this.showAlertMessage('Données actualisées', 'success');
  }
}
