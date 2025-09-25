import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModeleServiceService } from '../../../Service/modele-service.service';
import { Modele } from '../../../modeles/modele';

@Component({
  selector: 'app-modele-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modele-component.component.html',
  styleUrls: ['./modele-component.component.css']
})
export class ModeleComponentComponent implements OnInit {
  modeles: Modele[] = [];
  newModele: Modele = new Modele();
  editingModele: { [key: number]: boolean } = {};
  tempModele: { [key: number]: Modele } = {};
  isLoading: boolean = false;
  showAddModal: boolean = false;
  showDeleteModal: boolean = false;
  modeleToDelete: Modele | null = null;
  selectedFile: File | null = null;

  // Messages
  alertMessage: string = '';
  alertType: 'success' | 'error' | '' = '';
  showAlert: boolean = false;

  constructor(private modeleService: ModeleServiceService) {}

  ngOnInit(): void {
    this.loadModeles();
  }

  // Charger tous les modèles
  loadModeles(): void {
    this.isLoading = true;
    this.modeleService.getModele().subscribe({
      next: (response: any) => {
        this.modeles = response.data || response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur complète:', error);

        // Vérifier si c'est une erreur CORS/Connection
        if (error.status === 0) {
          this.showAlertMessage('Impossible de se connecter au serveur. Vérifiez que le backend est démarré sur http://localhost:8080', 'error');
        } else {
          this.showAlertMessage('Erreur lors du chargement des modèles', 'error');
        }

        this.isLoading = false;
      }
    });
  }

  // Ouvrir le modal d'ajout
  openAddModal(): void {
    this.showAddModal = true;
    this.newModele = new Modele();
    this.selectedFile = null;
  }

  // Fermer le modal d'ajout
  closeAddModal(): void {
    this.showAddModal = false;
    this.newModele = new Modele();
    this.selectedFile = null;
  }

  // Gérer la sélection de fichier
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      // Vous pouvez ajouter ici la logique pour uploader l'image
      this.newModele.image = `/uploads/${file.name}`;
    }
  }

  // Ajouter un modèle
  addModele(): void {
    if (!this.newModele.nom_modele.trim() || !this.newModele.type.trim()) {
      this.showAlertMessage('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    // Créer un FormData pour envoyer les données au format multipart/form-data
    const formData = new FormData();
    formData.append('nom_modele', this.newModele.nom_modele);
    formData.append('type', this.newModele.type);
    formData.append('total_pieces', this.newModele.total_pieces.toString());
    formData.append('prix_unitaire', this.newModele.prix_unitaire.toString());

    // Ajouter l'image si elle existe
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    } else {
      // Créer un fichier vide si pas d'image
      const emptyFile = new File([''], 'empty.png', { type: 'image/png' });
      formData.append('image', emptyFile);
    }

    this.isLoading = true;
    this.modeleService.createModeleWithFormData(formData).subscribe({
      next: (response) => {
        this.showAlertMessage('Modèle ajouté avec succès !', 'success');
        this.loadModeles();
        this.closeAddModal();
        this.isLoading = false;
      },
      error: (error) => {
        this.showAlertMessage('Erreur lors de l\'ajout du modèle', 'error');
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  // Activer le mode édition pour une ligne
  enableEdit(modele: Modele): void {
    this.editingModele[modele.id_modele] = true;
    this.tempModele[modele.id_modele] = { ...modele };
  }

  // Annuler l'édition
  cancelEdit(modele: Modele): void {
    this.editingModele[modele.id_modele] = false;
    const index = this.modeles.findIndex(m => m.id_modele === modele.id_modele);
    if (index !== -1 && this.tempModele[modele.id_modele]) {
      this.modeles[index] = { ...this.tempModele[modele.id_modele] };
    }
  }

  // Sauvegarder les modifications
  saveEdit(modele: Modele): void {
    if (!modele.nom_modele.trim() || !modele.type.trim()) {
      this.showAlertMessage('Les champs nom et type sont obligatoires', 'error');
      return;
    }

    // Créer un FormData pour la modification
    const formData = new FormData();
    formData.append('nom_modele', modele.nom_modele);
    formData.append('type', modele.type);
    formData.append('total_pieces', modele.total_pieces.toString());
    formData.append('prix_unitaire', modele.prix_unitaire.toString());

    this.isLoading = true;
    this.modeleService.updateModeleWithFormData(modele.id_modele, formData).subscribe({
      next: (response) => {
        this.showAlertMessage('Modèle modifié avec succès !', 'success');
        this.editingModele[modele.id_modele] = false;
        this.loadModeles();
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
  isEditing(id: number): boolean {
    return this.editingModele[id] || false;
  }

  // Ouvrir le modal de suppression
  openDeleteModal(modele: Modele): void {
    this.modeleToDelete = modele;
    this.showDeleteModal = true;
  }

  // Fermer le modal de suppression
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.modeleToDelete = null;
  }

  // Confirmer la suppression
  confirmDelete(): void {
    if (this.modeleToDelete && this.modeleToDelete.id_modele) {
      this.isLoading = true;
      this.modeleService.deleteModele(this.modeleToDelete.id_modele).subscribe({
        next: () => {
          this.showAlertMessage('Modèle supprimé avec succès !', 'success');
          this.loadModeles();
          this.closeDeleteModal();
          this.isLoading = false;
        },
        error: (error) => {
          this.showAlertMessage('Erreur lors de la suppression du modèle', 'error');
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

  // Formater le prix
  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  }
}
