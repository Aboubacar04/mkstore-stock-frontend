import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommandeServiceService } from '../../Service/commande-service.service';
import { ModeleServiceService } from '../../Service/modele-service.service';
import { ProduitServiceService } from '../../Service/produit-service.service';
import { AuthServiceService, User } from '../../Service/auth-service.service';
import { RetourButtonComponent } from "../../button/retour-button/retour-button.component";


interface Notification {
  id: number;
  type: 'commande' | 'rupture';
  message: string;
  icon: string;
  iconColor: string;
  count: number;
  route: string;
}

interface SearchResult {
  type: 'modele' | 'produit' | 'commande';
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-header-component',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, RetourButtonComponent],
  templateUrl: './header-component.component.html',
  styleUrls: ['./header-component.component.css']
})
export class HeaderComponentComponent implements OnInit {
  notifications: Notification[] = [];
  notificationCount: number = 0;

  // Utilisateur connecté
  currentUser: User | null = null;
  userFullName: string = 'Utilisateur';

  // Recherche
  searchQuery: string = '';
  searchResults: SearchResult[] = [];
  showSearchResults: boolean = false;
  isSearching: boolean = false;

  // Données pour la recherche
  allModeles: any[] = [];
  allProduits: any[] = [];
  allCommandes: any[] = [];

  // Suggestions populaires
  popularSearches: string[] = [
    'Robe',
    'Ensemble',
    'Stock faible',
    'Commandes du jour',
    'Modèles en rupture'
  ];

  constructor(
    private commandeService: CommandeServiceService,
    private modeleService: ModeleServiceService,
    private produitService: ProduitServiceService,
    private authService: AuthServiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadNotifications();
    this.loadSearchData();

    // S'abonner aux changements d'utilisateur
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.updateUserFullName();
    });

    // Rafraîchir les notifications toutes les 30 secondes
    setInterval(() => {
      this.loadNotifications();
    }, 30000);
  }

  // Charger les informations de l'utilisateur connecté
  loadUserInfo(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.updateUserFullName();

    console.log('=== UTILISATEUR DANS HEADER ===');
    console.log('Utilisateur:', this.currentUser);
    console.log('Nom complet:', this.userFullName);
  }

  // Mettre à jour le nom complet de l'utilisateur
  updateUserFullName(): void {
    if (this.currentUser) {
      this.userFullName = `${this.currentUser.prenom} ${this.currentUser.nom}`;
    } else {
      this.userFullName = 'Utilisateur';
    }
  }

  // Méthode de déconnexion
  logout(): void {
    console.log('=== DÉCONNEXION DÉCLENCHÉE ===');

    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.authService.logout().subscribe({
        next: (response) => {
          console.log('Déconnexion réussie:', response);

          // Rediriger vers la page de connexion
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Erreur lors de la déconnexion:', error);

          // Même en cas d'erreur, rediriger vers login
          // car le service a déjà nettoyé le localStorage
          this.router.navigate(['/login']);
        }
      });
    }
  }

  // Obtenir l'initiale du prénom pour l'avatar
  getUserInitial(): string {
    if (this.currentUser && this.currentUser.prenom) {
      return this.currentUser.prenom.charAt(0).toUpperCase();
    }
    return 'U';
  }

  // Obtenir le rôle de l'utilisateur
  getUserRole(): string {
    if (this.currentUser) {
      return this.currentUser.role === 'ADMIN' ? 'Administrateur' : 'Gérant';
    }
    return '';
  }

  loadSearchData(): void {
    // Charger les modèles
    this.modeleService.getModele().subscribe({
      next: (response: any) => {
        this.allModeles = response.data || response;
      }
    });

    // Charger les produits
    this.produitService.getAllProduits().subscribe({
      next: (produits: any[]) => {
        this.allProduits = produits;
      }
    });

    // Charger les commandes
    this.commandeService.getAllCommandes().subscribe({
      next: (commandes: any[]) => {
        this.allCommandes = commandes;
      }
    });
  }

  onSearchInput(): void {
    if (this.searchQuery.trim().length < 2) {
      this.searchResults = [];
      this.showSearchResults = false;
      return;
    }

    this.isSearching = true;
    this.showSearchResults = true;
    this.performSearch();
  }

  performSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    this.searchResults = [];

    // Rechercher dans les modèles
    this.allModeles.forEach(modele => {
      if (modele.nom_modele.toLowerCase().includes(query) ||
          modele.type.toLowerCase().includes(query)) {
        this.searchResults.push({
          type: 'modele',
          id: modele.id_modele,
          title: modele.nom_modele,
          subtitle: `Type: ${modele.type} | Stock: ${modele.total_pieces} pcs`,
          icon: 'bi-palette',
          route: '/modeles'
        });
      }
    });

    // Rechercher dans les produits
    this.allProduits.forEach(produit => {
      if (produit.modele?.nom_modele.toLowerCase().includes(query) ||
          produit.taille?.libelle.toLowerCase().includes(query)) {
        this.searchResults.push({
          type: 'produit',
          id: produit.id_produit,
          title: `${produit.modele?.nom_modele} - ${produit.taille?.libelle}`,
          subtitle: `Quantité: ${produit.quantite} pcs`,
          icon: 'bi-box-seam',
          route: '/stocks'
        });
      }
    });

    // Rechercher dans les commandes
    this.allCommandes.forEach(commande => {
      if (commande.nomClient.toLowerCase().includes(query) ||
          commande.idCommande.toString().includes(query)) {
        this.searchResults.push({
          type: 'commande',
          id: commande.idCommande,
          title: `Commande #${commande.idCommande}`,
          subtitle: `Client: ${commande.nomClient}`,
          icon: 'bi-receipt',
          route: '/liste-commande'
        });
      }
    });

    // Recherches spéciales
    if ('stock faible'.includes(query) || 'rupture'.includes(query)) {
      this.searchResults.push({
        type: 'modele',
        id: 0,
        title: 'Modèles en rupture de stock',
        subtitle: 'Voir tous les modèles avec stock ≤ 3',
        icon: 'bi-exclamation-triangle',
        route: '/modele-rupture'
      });
    }

    if ('commande'.includes(query) && 'jour'.includes(query)) {
      this.searchResults.push({
        type: 'commande',
        id: 0,
        title: 'Commandes du jour',
        subtitle: 'Voir toutes les commandes d\'aujourd\'hui',
        icon: 'bi-calendar-check',
        route: '/commande-du-jour'
      });
    }

    this.isSearching = false;
  }

  selectSearchResult(result: SearchResult): void {
    this.router.navigate([result.route]);
    this.clearSearch();
  }

  selectPopularSearch(search: string): void {
    this.searchQuery = search;
    this.onSearchInput();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
    this.showSearchResults = false;
  }

  loadNotifications(): void {
    this.notifications = [];

    // Charger les commandes du jour
    this.loadCommandesDuJour();

    // Charger les modèles en rupture
    this.loadModelesEnRupture();
  }

  loadCommandesDuJour(): void {
    this.commandeService.getAllCommandes().subscribe({
      next: (commandes: any[]) => {
        const today = new Date().toISOString().split('T')[0];
        const commandesDuJour = commandes.filter(commande => {
          const commandeDate = new Date(commande.date).toISOString().split('T')[0];
          return commandeDate === today;
        });

        if (commandesDuJour.length > 0) {
          this.notifications.push({
            id: 1,
            type: 'commande',
            message: `${commandesDuJour.length} commande(s) aujourd'hui`,
            icon: 'bi-cart-check',
            iconColor: 'text-success',
            count: commandesDuJour.length,
            route: '/commande-du-jour'
          });
        }

        this.updateNotificationCount();
      },
      error: (error) => {
        console.error('Erreur chargement commandes:', error);
      }
    });
  }

  loadModelesEnRupture(): void {
    this.modeleService.getModele().subscribe({
      next: (response: any) => {
        const allModeles = response.data || response;
        const modelesEnRupture = allModeles.filter(
          (modele: any) => modele.total_pieces <= 3
        );

        if (modelesEnRupture.length > 0) {
          this.notifications.push({
            id: 2,
            type: 'rupture',
            message: `${modelesEnRupture.length} modèle(s) en rupture`,
            icon: 'bi-exclamation-triangle',
            iconColor: 'text-danger',
            count: modelesEnRupture.length,
            route: '/modele-rupture'
          });
        }

        this.updateNotificationCount();
      },
      error: (error) => {
        console.error('Erreur chargement modèles:', error);
      }
    });
  }

  updateNotificationCount(): void {
    this.notificationCount = this.notifications.length;
  }

  removeNotification(notificationId: number): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.updateNotificationCount();
  }

  removeAllNotifications(): void {
    this.notifications = [];
    this.notificationCount = 0;
  }
}
