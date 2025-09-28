import { UserServieService, User } from './../../../Service/user-servie.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-page.component.html',
  styleUrl: './user-page.component.css'
})
export class UserPageComponent implements OnInit {

  // Liste des utilisateurs
  users: User[] = [];
  filteredUsers: User[] = [];

  // États du composant
  isLoading: boolean = false;
  showModal: boolean = false;
  isEditMode: boolean = false;

  // Formulaire utilisateur
  selectedUser: User | null = null;
  userForm: User = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    password: '',
    role: 'GERANT'
  };

  // Recherche et filtres
  searchTerm: string = '';
  selectedRole: string = 'ALL';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 1;

  // Messages d'alerte
  alertMessage: string = '';
  alertType: 'success' | 'error' | '' = '';
  showAlert: boolean = false;

  constructor(private userService: UserServieService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  // Charger tous les utilisateurs
  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.showAlertMessage('Erreur lors du chargement des utilisateurs: ' + error, 'error');
        this.isLoading = false;
      }
    });
  }

  // Appliquer les filtres de recherche et de rôle
  applyFilters(): void {
    let filtered = [...this.users];

    // Filtre par recherche
    if (this.searchTerm.trim()) {
      filtered = filtered.filter(user =>
        user.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.prenom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Filtre par rôle
    if (this.selectedRole !== 'ALL') {
      filtered = filtered.filter(user => user.role === this.selectedRole);
    }

    this.filteredUsers = filtered;
    this.calculateTotalPages();
  }

  // Calculer le nombre total de pages
  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  // Obtenir les utilisateurs de la page actuelle
  getPaginatedUsers(): User[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, endIndex);
  }

  // Navigation pagination
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // Ouvrir le modal pour créer un utilisateur
  openCreateModal(): void {
    this.isEditMode = false;
    this.userForm = {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      password: '',
      role: 'GERANT'
    };
    this.showModal = true;
  }

  // Ouvrir le modal pour modifier un utilisateur
  openEditModal(user: User): void {
    this.isEditMode = true;
    this.selectedUser = user;
    this.userForm = {
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone || '',
      password: '', // On laisse vide pour ne pas changer le mot de passe
      role: user.role
    };
    this.showModal = true;
  }

  // Fermer le modal
  closeModal(): void {
    this.showModal = false;
    this.selectedUser = null;
    this.resetForm();
  }

  // Réinitialiser le formulaire
  resetForm(): void {
    this.userForm = {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      password: '',
      role: 'GERANT'
    };
  }

  // Sauvegarder un utilisateur (créer ou modifier)
  saveUser(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;

    if (this.isEditMode && this.selectedUser) {
      // Modification
      const updateData: any = { ...this.userForm };
      if (!updateData.password.trim()) {
        delete updateData.password; // Ne pas envoyer le mot de passe s'il est vide
      }

      this.userService.updateUser(this.selectedUser.id!, updateData).subscribe({
        next: (updatedUser) => {
          this.showAlertMessage('Utilisateur modifié avec succès', 'success');
          this.loadUsers();
          this.closeModal();
          this.isLoading = false;
        },
        error: (error) => {
          this.showAlertMessage('Erreur lors de la modification: ' + error, 'error');
          this.isLoading = false;
        }
      });
    } else {
      // Création
      this.userService.createUser(this.userForm).subscribe({
        next: (newUser) => {
          this.showAlertMessage('Utilisateur créé avec succès', 'success');
          this.loadUsers();
          this.closeModal();
          this.isLoading = false;
        },
        error: (error) => {
          this.showAlertMessage('Erreur lors de la création: ' + error, 'error');
          this.isLoading = false;
        }
      });
    }
  }

  // Supprimer un utilisateur
  deleteUser(user: User): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.prenom} ${user.nom} ?`)) {
      this.isLoading = true;
      this.userService.deleteUser(user.id!).subscribe({
        next: () => {
          this.showAlertMessage('Utilisateur supprimé avec succès', 'success');
          this.loadUsers();
          this.isLoading = false;
        },
        error: (error) => {
          this.showAlertMessage('Erreur lors de la suppression: ' + error, 'error');
          this.isLoading = false;
        }
      });
    }
  }

  // Validation du formulaire
  validateForm(): boolean {
    if (!this.userForm.nom.trim()) {
      this.showAlertMessage('Le nom est obligatoire', 'error');
      return false;
    }
    if (!this.userForm.prenom.trim()) {
      this.showAlertMessage('Le prénom est obligatoire', 'error');
      return false;
    }
    if (!this.userForm.email.trim()) {
      this.showAlertMessage('L\'email est obligatoire', 'error');
      return false;
    }
    if (!this.isValidEmail(this.userForm.email)) {
      this.showAlertMessage('Format d\'email invalide', 'error');
      return false;
    }
    if (!this.isEditMode && !this.userForm.password.trim()) {
      this.showAlertMessage('Le mot de passe est obligatoire', 'error');
      return false;
    }
    return true;
  }

  // Validation d'email
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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

  // Méthodes pour les filtres
  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onRoleFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  // Rafraîchir les données
  refreshData(): void {
    this.searchTerm = '';
    this.selectedRole = 'ALL';
    this.currentPage = 1;
    this.loadUsers();
    this.showAlertMessage('Données actualisées', 'success');
  }

  // Obtenir le nombre total d'utilisateurs
  getTotalUsers(): number {
    return this.users.length;
  }

  // Obtenir le nombre d'utilisateurs par rôle
  getUsersByRole(role: string): number {
    return this.users.filter(user => user.role === role).length;
  }
}
