import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProduitServiceService } from '../../../Service/produit-service.service';
import { ModeleServiceService } from '../../../Service/modele-service.service';
import { TailleServiceService } from '../../../Service/taille-service.service';
import { Produit } from '../../../modeles/produits';
import { Modele } from '../../../modeles/modele';
import { Taille } from '../../../modeles/taille';

interface ProduitGroupe {
  modele: Modele;
  produits: Produit[];
}

@Component({
  selector: 'app-produit-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './produit-component.component.html',
  styleUrls: ['./produit-component.component.css']
})
export class ProduitComponentComponent implements OnInit {
  produitsGroupes: ProduitGroupe[] = [];
  modeles: Modele[] = [];
  tailles: Taille[] = [];

  newProduit: Produit = new Produit();
  editingProduit: { [key: number]: boolean } = {};
  tempProduit: { [key: number]: Produit } = {};

  isLoading: boolean = false;
  showAddModal: boolean = false;
  showDeleteModal: boolean = false;
  produitToDelete: Produit | null = null;

  // Messages
  alertMessage: string = '';
  alertType: 'success' | 'error' | '' = '';
  showAlert: boolean = false;

  constructor(
    private produitService: ProduitServiceService,
    private modeleService: ModeleServiceService,
    private tailleService: TailleServiceService
  ) {}

  ngOnInit(): void {
    this.loadProduits();
    this.loadModeles();
    this.loadTailles();
  }

  // Charger tous les produits et les grouper par modèle
  loadProduits(): void {
    this.isLoading = true;
    this.produitService.getAllProduits().subscribe({
      next: (produits: Produit[]) => {
        this.groupProduitsByModele(produits);
        this.isLoading = false;
      },
      error: (error) => {
        this.showAlertMessage('Erreur lors du chargement des produits', 'error');
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  // Grouper les produits par modèle
  groupProduitsByModele(produits: Produit[]): void {
    const groupes = new Map<number, ProduitGroupe>();

    produits.forEach(produit => {
      if (produit.modele) {
        const modeleId = produit.modele.id_modele;

        if (!groupes.has(modeleId)) {
          groupes.set(modeleId, {
            modele: produit.modele,
            produits: []
          });
        }

        groupes.get(modeleId)?.produits.push(produit);
      }
    });

    this.produitsGroupes = Array.from(groupes.values());
  }

  // Charger les modèles pour le select
  loadModeles(): void {
    this.modeleService.getModele().subscribe({
      next: (response: any) => {
        this.modeles = response.data || response;
      },
      error: (error) => {
        console.error('Erreur chargement modèles:', error);
      }
    });
  }

  // Charger les tailles pour le select
  loadTailles(): void {
    this.tailleService.getAllTailles().subscribe({
      next: (response: any) => {
        this.tailles = response.data || response;
      },
      error: (error) => {
        console.error('Erreur chargement tailles:', error);
      }
    });
  }

  // Ouvrir le modal d'ajout
  openAddModal(): void {
    this.showAddModal = true;
    this.newProduit = new Produit();
  }

  // Fermer le modal d'ajout
  closeAddModal(): void {
    this.showAddModal = false;
    this.newProduit = new Produit();
  }

  // Ajouter un produit
  addProduit(): void {
    if (!this.newProduit.modeleId || !this.newProduit.tailleId || this.newProduit.quantite <= 0) {
      this.showAlertMessage('Veuillez remplir tous les champs', 'error');
      return;
    }

    this.isLoading = true;
    this.produitService.createProduit(this.newProduit).subscribe({
      next: (response) => {
        this.showAlertMessage('Produit ajouté avec succès !', 'success');
        this.loadProduits();
        this.closeAddModal();
        this.isLoading = false;
      },
      error: (error) => {
        this.showAlertMessage('Erreur lors de l\'ajout du produit', 'error');
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  // Activer le mode édition
  enableEdit(produit: Produit): void {
    if (produit.id_produit) {
      this.editingProduit[produit.id_produit] = true;
      this.tempProduit[produit.id_produit] = { ...produit };
    }
  }

  // Annuler l'édition
  cancelEdit(produit: Produit): void {
    if (produit.id_produit) {
      this.editingProduit[produit.id_produit] = false;
      if (this.tempProduit[produit.id_produit]) {
        Object.assign(produit, this.tempProduit[produit.id_produit]);
      }
    }
  }

  // Sauvegarder les modifications
  saveEdit(produit: Produit): void {
    if (!produit.id_produit || produit.quantite < 0) {
      this.showAlertMessage('La quantité doit être positive', 'error');
      return;
    }

    // Créer un objet propre avec seulement les champs nécessaires
    const produitToUpdate: Produit = {
      modeleId: produit.modele?.id_modele,
      tailleId: produit.taille?.id_taille,
      quantite: produit.quantite
    };

    this.isLoading = true;
    this.produitService.updateProduit(produit.id_produit, produitToUpdate).subscribe({
      next: (response) => {
        this.showAlertMessage('Produit modifié avec succès !', 'success');
        if (produit.id_produit) {
          this.editingProduit[produit.id_produit] = false;
        }
        this.loadProduits();
        this.isLoading = false;
      },
      error: (error) => {
        this.showAlertMessage('Erreur lors de la modification', 'error');
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  // Vérifier si une ligne est en édition
  isEditing(id?: number): boolean {
    return id ? (this.editingProduit[id] || false) : false;
  }

  // Ouvrir le modal de suppression
  openDeleteModal(produit: Produit): void {
    this.produitToDelete = produit;
    this.showDeleteModal = true;
  }

  // Fermer le modal de suppression
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.produitToDelete = null;
  }

  // Confirmer la suppression
  confirmDelete(): void {
    if (this.produitToDelete && this.produitToDelete.id_produit) {
      this.isLoading = true;
      this.produitService.deleteProduit(this.produitToDelete.id_produit).subscribe({
        next: () => {
          this.showAlertMessage('Produit supprimé avec succès !', 'success');
          this.loadProduits();
          this.closeDeleteModal();
          this.isLoading = false;
        },
        error: (error) => {
          this.showAlertMessage('Erreur lors de la suppression', 'error');
          this.isLoading = false;
          console.error('Erreur:', error);
        }
      });
    }
  }

  // Afficher un message d'alerte
  showAlertMessage(message: string, type: 'success' | 'error'): void {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;

    setTimeout(() => {
      this.showAlert = false;
    }, 4000);
  }

  // Fermer l'alerte manuellement
  closeAlert(): void {
    this.showAlert = false;
  }

  // Calculer le total de pièces pour un modèle
  getTotalPiecesModele(groupe: ProduitGroupe): number {
    return groupe.produits.reduce((sum, p) => sum + p.quantite, 0);
  }

  // Formater le prix
  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  }
}
