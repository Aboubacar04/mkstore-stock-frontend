import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Taille } from '../../../modeles/taille';
import { TailleServiceService } from '../../../Service/taille-service.service';


@Component({
  selector: 'app-taille',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './taille-component.component.html',
  styleUrls: ['./taille-component.component.css']
})
export class TailleComponent implements OnInit {
  tailles: Taille[] = [];
  newTaille: Taille = { libelle: '' };
  isLoading: boolean = false;
  showAddModal: boolean = false;
  showDeleteModal: boolean = false;
  tailleToDelete: Taille | null = null;

  // Messages
  alertMessage: string = '';
  alertType: 'success' | 'error' | '' = '';
  showAlert: boolean = false;

  constructor(private tailleService: TailleServiceService) {}

  ngOnInit(): void {
    this.loadTailles();
  }

  // Charger toutes les tailles
  loadTailles(): void {
    this.isLoading = true;
    this.tailleService.getAllTailles().subscribe({
      next: (response: any) => {
        this.tailles = response.data || response;
        this.isLoading = false;
      },
      error: (error) => {
        this.showAlertMessage('Erreur lors du chargement des tailles', 'error');
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  // Ouvrir le modal d'ajout
  openAddModal(): void {
    this.showAddModal = true;
    this.newTaille = { libelle: '' };
  }

  // Fermer le modal d'ajout
  closeAddModal(): void {
    this.showAddModal = false;
    this.newTaille = { libelle: '' };
  }

  // Ajouter une taille
  addTaille(): void {
    if (!this.newTaille.libelle.trim()) {
      this.showAlertMessage('Veuillez entrer un libellé', 'error');
      return;
    }

    this.isLoading = true;
    this.tailleService.createTaille(this.newTaille).subscribe({
      next: (response) => {
        this.showAlertMessage('Taille ajoutée avec succès !', 'success');
        this.loadTailles();
        this.closeAddModal();
        this.isLoading = false;
      },
      error: (error) => {
        this.showAlertMessage('Erreur lors de l\'ajout de la taille', 'error');
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  // Ouvrir le modal de suppression
  openDeleteModal(taille: Taille): void {
    this.tailleToDelete = taille;
    this.showDeleteModal = true;
  }

  // Fermer le modal de suppression
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.tailleToDelete = null;
  }

  // Confirmer la suppression
  confirmDelete(): void {
    if (this.tailleToDelete && this.tailleToDelete.id_taille) {
      this.isLoading = true;
      this.tailleService.deleteTaille(this.tailleToDelete.id_taille).subscribe({
        next: () => {
          this.showAlertMessage('Taille supprimée avec succès !', 'success');
          this.loadTailles();
          this.closeDeleteModal();
          this.isLoading = false;
        },
        error: (error) => {
          this.showAlertMessage('Erreur lors de la suppression de la taille', 'error');
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

    // Masquer automatiquement après 4 secondes
    setTimeout(() => {
      this.showAlert = false;
    }, 4000);
  }

  // Fermer l'alerte manuellement
  closeAlert(): void {
    this.showAlert = false;
  }
}
