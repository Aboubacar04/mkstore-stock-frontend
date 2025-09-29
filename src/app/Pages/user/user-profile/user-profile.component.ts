import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthServiceService, User } from '../../../Service/auth-service.service';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {

  currentUser: User | null = null;
  isLoading: boolean = false;
  isEditMode: boolean = false;

  // Formulaire d'édition
  editForm: {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
  } = {
    nom: '',
    prenom: '',
    email: '',
    telephone: ''
  };

  // Messages d'alerte
  alertMessage: string = '';
  alertType: 'success' | 'error' | '' = '';
  showAlert: boolean = false;

  constructor(
    private authService: AuthServiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();

    // S'abonner aux changements d'utilisateur
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.updateEditForm();
    });
  }

  // Charger le profil utilisateur
  loadUserProfile(): void {
    this.currentUser = this.authService.getCurrentUser();

    if (!this.currentUser) {
      this.showAlertMessage('Utilisateur non connecté', 'error');
      this.router.navigate(['/login']);
      return;
    }

    this.updateEditForm();
  }

  // Mettre à jour le formulaire d'édition avec les données actuelles
  updateEditForm(): void {
    if (this.currentUser) {
      this.editForm = {
        nom: this.currentUser.nom,
        prenom: this.currentUser.prenom,
        email: this.currentUser.email,
        telephone: this.currentUser.telephone || ''
      };
    }
  }

  // Activer le mode édition
  enableEditMode(): void {
    this.isEditMode = true;
    this.updateEditForm();
  }

  // Annuler l'édition
  cancelEdit(): void {
    this.isEditMode = false;
    this.updateEditForm();
  }

  // Sauvegarder les modifications (simulation - à adapter selon ton backend)
  saveProfile(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;

    // Note : Tu devras créer un endpoint backend pour mettre à jour le profil
    // Pour l'instant, on simule la sauvegarde
    setTimeout(() => {
      // Mettre à jour localement
      if (this.currentUser) {
        this.currentUser.nom = this.editForm.nom;
        this.currentUser.prenom = this.editForm.prenom;
        this.currentUser.email = this.editForm.email;
        this.currentUser.telephone = this.editForm.telephone;

        // Mettre à jour dans le localStorage
        localStorage.setItem('current_user', JSON.stringify(this.currentUser));
      }

      this.showAlertMessage('Profil mis à jour avec succès !', 'success');
      this.isEditMode = false;
      this.isLoading = false;
    }, 1000);
  }

  // Validation du formulaire
  validateForm(): boolean {
    if (!this.editForm.nom.trim()) {
      this.showAlertMessage('Le nom est obligatoire', 'error');
      return false;
    }

    if (!this.editForm.prenom.trim()) {
      this.showAlertMessage('Le prénom est obligatoire', 'error');
      return false;
    }

    if (!this.editForm.email.trim()) {
      this.showAlertMessage('L\'email est obligatoire', 'error');
      return false;
    }

    if (!this.isValidEmail(this.editForm.email)) {
      this.showAlertMessage('Format d\'email invalide', 'error');
      return false;
    }

    return true;
  }

  // Validation d'email
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Obtenir l'initiale pour l'avatar
  getUserInitial(): string {
    if (this.currentUser && this.currentUser.prenom) {
      return this.currentUser.prenom.charAt(0).toUpperCase();
    }
    return 'U';
  }

  // Obtenir le nom complet
  getFullName(): string {
    if (this.currentUser) {
      return `${this.currentUser.prenom} ${this.currentUser.nom}`;
    }
    return '';
  }

  // Obtenir le rôle traduit
  getRoleLabel(): string {
    if (this.currentUser) {
      return this.currentUser.role === 'ADMIN' ? 'Administrateur' : 'Gérant';
    }
    return '';
  }

  // Obtenir la couleur du badge selon le rôle
  getRoleBadgeClass(): string {
    if (this.currentUser) {
      return this.currentUser.role === 'ADMIN' ? 'badge-admin' : 'badge-gerant';
    }
    return '';
  }

  // Formater la date
  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Non disponible';

    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);
  }

  // Déconnexion
  logout(): void {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
      this.authService.logout().subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: () => {
          this.router.navigate(['/login']);
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

  // Fermer l'alerte
  closeAlert(): void {
    this.showAlert = false;
  }
}
