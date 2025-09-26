import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProduitServiceService } from '../../../Service/produit-service.service';
import { CommandeServiceService } from '../../../Service/commande-service.service';
import { Produit } from '../../../modeles/produits';

interface ProduitPanier {
  idProduit: number;
  nomModele: string;
  taille: string;
  couleur: string;
  quantite: number;
  prixUnitaire: number;
  total: number;
}

@Component({
  selector: 'app-passer-commande',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './passer-commande.component.html',
  styleUrls: ['./passer-commande.component.css']
})
export class PasserCommandeComponent implements OnInit {
  produits: Produit[] = [];
  panier: ProduitPanier[] = [];
  nomClient: string = '';

  // Pour le produit en cours de sélection
  selectedProduit: Produit | null = null;
  selectedCouleur: string = '';
  selectedQuantite: number = 1;

  // Couleurs disponibles
  couleurs = [
    { nom: 'Rouge', code: '#dc3545' },
    { nom: 'Bleu', code: '#007bff' },
    { nom: 'Vert', code: '#28a745' },
    { nom: 'Jaune', code: '#ffc107' },
    { nom: 'Noir', code: '#343a40' },
    { nom: 'Blanc', code: '#f8f9fa' },
    { nom: 'Rose', code: '#e83e8c' },
    { nom: 'Orange', code: '#fd7e14' }
  ];

  // Pour ajouter une couleur personnalisée
  nouvelleCouleurNom: string = '';
  nouvelleCouleurCode: string = '#F7B893';

  isLoading: boolean = false;
  showProductModal: boolean = false;

  // Messages
  alertMessage: string = '';
  alertType: 'success' | 'error' | '' = '';
  showAlert: boolean = false;

  constructor(
    private produitService: ProduitServiceService,
    private commandeService: CommandeServiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProduits();
  }

  loadProduits(): void {
    this.isLoading = true;
    this.produitService.getAllProduits().subscribe({
      next: (produits: Produit[]) => {
        this.produits = produits;
        this.isLoading = false;
      },
      error: (error) => {
        this.showAlertMessage('Erreur lors du chargement des produits', 'error');
        this.isLoading = false;
      }
    });
  }

  openProductModal(produit: Produit): void {
    this.selectedProduit = produit;
    this.selectedCouleur = '';
    this.selectedQuantite = 1;
    this.showProductModal = true;
  }

  closeProductModal(): void {
    this.showProductModal = false;
    this.selectedProduit = null;
  }

  ajouterAuPanier(): void {
    if (!this.selectedProduit || !this.selectedCouleur || this.selectedQuantite <= 0) {
      this.showAlertMessage('Veuillez sélectionner une couleur et une quantité valide', 'error');
      return;
    }

    if (this.selectedQuantite > (this.selectedProduit.quantite || 0)) {
      this.showAlertMessage('Quantité demandée supérieure au stock disponible', 'error');
      return;
    }

    const prixUnitaire = this.selectedProduit.modele?.prix_unitaire || 0;
    const total = prixUnitaire * this.selectedQuantite;

    const produitPanier: ProduitPanier = {
      idProduit: this.selectedProduit.id_produit!,
      nomModele: this.selectedProduit.modele?.nom_modele || '',
      taille: this.selectedProduit.taille?.libelle || '',
      couleur: this.selectedCouleur,
      quantite: this.selectedQuantite,
      prixUnitaire: prixUnitaire,
      total: total
    };

    this.panier.push(produitPanier);
    this.showAlertMessage('Produit ajouté au panier', 'success');
    this.closeProductModal();
  }

  ajouterCouleur(): void {
    if (!this.nouvelleCouleurNom.trim()) {
      this.showAlertMessage('Veuillez entrer un nom pour la couleur', 'error');
      return;
    }

    // Vérifier si la couleur existe déjà
    const existe = this.couleurs.some(c => c.nom.toLowerCase() === this.nouvelleCouleurNom.toLowerCase());
    if (existe) {
      this.showAlertMessage('Cette couleur existe déjà', 'error');
      return;
    }

    this.couleurs.push({
      nom: this.nouvelleCouleurNom,
      code: this.nouvelleCouleurCode
    });

    this.showAlertMessage('Couleur ajoutée avec succès', 'success');
    this.nouvelleCouleurNom = '';
    this.nouvelleCouleurCode = '#F7B893';
  }

  retirerDuPanier(index: number): void {
    this.panier.splice(index, 1);
    this.showAlertMessage('Produit retiré du panier', 'success');
  }

  getTotalCommande(): number {
    return this.panier.reduce((sum, item) => sum + item.total, 0);
  }

  passerCommande(): void {
    console.log('🔥 Bouton cliqué - Début de passerCommande()');
    console.log('Nom client:', this.nomClient);
    console.log('Panier:', this.panier);
    console.log('isLoading:', this.isLoading);

    // Vérification du nom client
    if (!this.nomClient || !this.nomClient.trim()) {
      console.error('❌ Nom client vide');
      this.showAlertMessage('Veuillez entrer le nom du client', 'error');
      return;
    }

    // Vérification du panier
    if (!this.panier || this.panier.length === 0) {
      console.error('❌ Panier vide');
      this.showAlertMessage('Le panier est vide', 'error');
      return;
    }

    // Création de la commande
    const commande = {
      nomCompletClient: this.nomClient.trim(),
      produits: this.panier.map(item => ({
        idProduit: item.idProduit,
        couleur: item.couleur,
        quantite: item.quantite
      }))
    };

    console.log('📦 Commande à envoyer:', commande);

    this.isLoading = true;

    // Appel API
    this.commandeService.createCommande(commande as any).subscribe({
      next: (response) => {
        console.log('✅ Commande créée avec succès:', response);
        this.showAlertMessage('Commande passée avec succès !', 'success');
        this.panier = [];
        this.nomClient = '';
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Erreur lors de la création de la commande:', error);
        console.error('Détails de l\'erreur:', {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          error: error.error
        });

        let errorMessage = 'Erreur lors de la création de la commande';
        if (error.status === 0) {
          errorMessage = 'Impossible de contacter le serveur';
        } else if (error.status === 400) {
          errorMessage = 'Données invalides';
        } else if (error.status === 500) {
          errorMessage = 'Erreur serveur';
        }

        this.showAlertMessage(errorMessage, 'error');
        this.isLoading = false;
      },
      complete: () => {
        console.log('🏁 Requête terminée');
      }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  }

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

  // Navigation vers la liste des commandes
  voirListeCommandes(): void {
    this.router.navigate(['/liste-commande']);
  }

  // Méthode de test pour debug
  testButton(): void {
    console.log('🧪 TEST: Le bouton fonctionne !');
    alert('Le bouton fonctionne !');
  }
}
