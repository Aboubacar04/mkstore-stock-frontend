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
  selector: 'app-commande-mois',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './commande-mois.component.html',
  styleUrl: './commande-mois.component.css'
})
export class CommandeMoisComponent implements OnInit {
  commandesMois: Commande[] = [];
  commandeSelectionnee: Commande | null = null;
  showDetailModal: boolean = false;
  isLoading: boolean = false;

  // Dates du mois
  dateDebutMois: Date = new Date();
  dateFinMois: Date = new Date();
  nomMois: string = '';
  annee: number = new Date().getFullYear();

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalPages: number = 1;

  // Pour les alertes
  alertMessage: string = '';
  alertType: 'success' | 'error' | '' = '';
  showAlert: boolean = false;

  // Données pour les statistiques par semaine
  semainesDuMois: { numero: number, debut: Date, fin: Date }[] = [];

  constructor(private commandeService: CommandeServiceService) {}

  ngOnInit(): void {
    this.calculerDatesMois();
    this.calculerSemainesDuMois();
    this.loadCommandesMois();

    // Rafraîchir automatiquement au début du nouveau mois
    this.programmerRafraichissementMois();
  }

  // Calculer les dates de début et fin du mois
  calculerDatesMois(): void {
    const aujourd_hui = new Date();

    // Début du mois
    this.dateDebutMois = new Date(aujourd_hui.getFullYear(), aujourd_hui.getMonth(), 1);
    this.dateDebutMois.setHours(0, 0, 0, 0);

    // Fin du mois
    this.dateFinMois = new Date(aujourd_hui.getFullYear(), aujourd_hui.getMonth() + 1, 0);
    this.dateFinMois.setHours(23, 59, 59, 999);

    // Nom du mois et année
    this.nomMois = this.getNomMois(aujourd_hui.getMonth());
    this.annee = aujourd_hui.getFullYear();
  }

  // Calculer les semaines du mois pour les statistiques
  calculerSemainesDuMois(): void {
    this.semainesDuMois = [];
    const premierJour = new Date(this.dateDebutMois);
    const dernierJour = new Date(this.dateFinMois);

    // Trouver le premier dimanche du mois (ou avant si le mois ne commence pas un dimanche)
    const premierDimanche = new Date(premierJour);
    premierDimanche.setDate(premierJour.getDate() - premierJour.getDay());

    let semaineCourante = new Date(premierDimanche);
    let numeroSemaine = 1;

    while (semaineCourante <= dernierJour) {
      const debutSemaine = new Date(semaineCourante);
      const finSemaine = new Date(semaineCourante);
      finSemaine.setDate(debutSemaine.getDate() + 6);
      finSemaine.setHours(23, 59, 59, 999);

      // Si la semaine chevauche avec le mois
      if (finSemaine >= premierJour && debutSemaine <= dernierJour) {
        this.semainesDuMois.push({
          numero: numeroSemaine,
          debut: new Date(Math.max(debutSemaine.getTime(), premierJour.getTime())),
          fin: new Date(Math.min(finSemaine.getTime(), dernierJour.getTime()))
        });
        numeroSemaine++;
      }

      semaineCourante.setDate(semaineCourante.getDate() + 7);
    }
  }

  // Obtenir le nom du mois
  getNomMois(mois: number): string {
    const moisNoms = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return moisNoms[mois];
  }

  // Charger les commandes du mois
  loadCommandesMois(): void {
    this.isLoading = true;
    this.commandeService.getAllCommandes().subscribe({
      next: (commandes: any[]) => {
        // Filtrer uniquement les commandes du mois courant
        this.commandesMois = commandes.filter(commande => {
          const dateCommande = new Date(commande.date);
          return dateCommande >= this.dateDebutMois && dateCommande <= this.dateFinMois;
        });

        // Trier par date décroissante (plus récentes en premier)
        this.commandesMois.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        this.calculateTotalPages();
        this.isLoading = false;
        console.log('Commandes du mois:', this.commandesMois);
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
    this.totalPages = Math.ceil(this.commandesMois.length / this.itemsPerPage);
  }

  // Obtenir les commandes de la page actuelle
  getCommandesPaginees(): Commande[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.commandesMois.slice(startIndex, endIndex);
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

  // Calculer le total du mois
  getTotalMois(): number {
    return this.commandesMois.reduce((sum, commande) => sum + (commande.total || 0), 0);
  }

  // Nombre de commandes du mois
  getNombreCommandesMois(): number {
    return this.commandesMois.length;
  }

  // Obtenir les commandes par semaine
  getCommandesParSemaine(numeroSemaine: number): Commande[] {
    const semaine = this.semainesDuMois[numeroSemaine - 1];
    if (!semaine) return [];

    return this.commandesMois.filter(commande => {
      const dateCommande = new Date(commande.date);
      return dateCommande >= semaine.debut && dateCommande <= semaine.fin;
    });
  }

  // Calculer le total par semaine
  getTotalParSemaine(numeroSemaine: number): number {
    const commandesSemaine = this.getCommandesParSemaine(numeroSemaine);
    return commandesSemaine.reduce((sum, commande) => sum + (commande.total || 0), 0);
  }

  // Obtenir les commandes par jour de la semaine pour une semaine donnée
  getCommandesParJour(jour: number): Commande[] {
    return this.commandesMois.filter(commande => {
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

  // Obtenir la moyenne journalière du mois
  getMoyenneJournaliere(): number {
    const nombreJoursEcoules = this.getNombreJoursEcoulesDuMois();
    return nombreJoursEcoules > 0 ? this.getTotalMois() / nombreJoursEcoules : 0;
  }

  // Calculer le nombre de jours écoulés dans le mois
  getNombreJoursEcoulesDuMois(): number {
    const aujourd_hui = new Date();
    const finPeriode = aujourd_hui > this.dateFinMois ? this.dateFinMois : aujourd_hui;
    const diffTime = finPeriode.getTime() - this.dateDebutMois.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  // Programmer le rafraîchissement au début du nouveau mois
  programmerRafraichissementMois(): void {
    const maintenant = new Date();
    const premierJourMoisProchain = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 1);
    premierJourMoisProchain.setHours(0, 0, 0, 0);

    const tempsJusquNouveauMois = premierJourMoisProchain.getTime() - maintenant.getTime();

    // Si c'est plus de 24h, on programme le rafraîchissement
    if (tempsJusquNouveauMois > 0) {
      setTimeout(() => {
        this.calculerDatesMois();
        this.calculerSemainesDuMois();
        this.commandesMois = [];
        this.currentPage = 1;
        this.loadCommandesMois();
        this.programmerRafraichissementMois(); // Reprogrammer pour le mois suivant
      }, tempsJusquNouveauMois);
    }
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

  // Formater la période du mois
  formatPeriodeMois(): string {
    return `${this.nomMois} ${this.annee}`;
  }

  // Formater la plage de dates d'une semaine
  formatPlageSemaine(numeroSemaine: number): string {
    const semaine = this.semainesDuMois[numeroSemaine - 1];
    if (!semaine) return '';

    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short'
    };
    const debut = semaine.debut.toLocaleDateString('fr-FR', options);
    const fin = semaine.fin.toLocaleDateString('fr-FR', options);
    return `${debut} - ${fin}`;
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
    this.loadCommandesMois();
    this.showAlertMessage('Données actualisées', 'success');
  }

  // Obtenir le pourcentage d'une semaine par rapport au total du mois
  getPourcentageSemaine(numeroSemaine: number): number {
    const totalMois = this.getTotalMois();
    if (totalMois === 0) return 0;
    const totalSemaine = this.getTotalParSemaine(numeroSemaine);
    return (totalSemaine / totalMois) * 100;
  }

  // Obtenir la semaine la plus performante
  getMeilleureSemaine(): { numero: number, total: number } | null {
    if (this.semainesDuMois.length === 0) return null;

    let meilleure = { numero: 1, total: 0 };

    for (let i = 1; i <= this.semainesDuMois.length; i++) {
      const total = this.getTotalParSemaine(i);
      if (total > meilleure.total) {
        meilleure = { numero: i, total };
      }
    }

    return meilleure.total > 0 ? meilleure : null;
  }
}
