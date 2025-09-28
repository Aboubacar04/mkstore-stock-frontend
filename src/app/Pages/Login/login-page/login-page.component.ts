import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthServiceService, LoginRequest, ChangePasswordRequest, AuthResponse } from '../../../Service/auth-service.service';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {

  // États du composant
  showPasswordReset: boolean = false;
  isLoading: boolean = false;

  // Formulaire de connexion
  loginForm: LoginRequest = {
    email: '',
    password: ''
  };

  // Formulaire de changement de mot de passe
  changePasswordForm: ChangePasswordRequest = {
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    newPassword: ''
  };

  // Messages d'alerte
  alertMessage: string = '';
  alertType: 'success' | 'error' | '' = '';
  showAlert: boolean = false;

  constructor(
    private authService: AuthServiceService,
    private router: Router
  ) {
    console.log('=== LOGIN COMPONENT INITIALISÉ ===');
  }

  // Méthodes d'accès au service (pour éviter les erreurs dans le template)
  get hasToken(): boolean {
    return this.authService.hasToken ? this.authService.hasToken() : false;
  }

  get isUserLoggedIn(): boolean {
    return this.authService.isLoggedIn ? this.authService.isLoggedIn() : false;
  }

  // Basculer vers le formulaire de changement de mot de passe
  togglePasswordReset(): void {
    this.showPasswordReset = !this.showPasswordReset;
    this.clearAlerts();
    this.resetForms();

    console.log('=== BASCULEMENT DE VUE ===');
    console.log('Mode changement de mot de passe:', this.showPasswordReset);

    if (this.showPasswordReset) {
      console.log('Formulaire de changement de mot de passe activé');
    } else {
      console.log('Formulaire de connexion activé');
    }
  }

  // Connexion
  onLogin(): void {
    console.log('=== TENTATIVE DE CONNEXION ===');
    console.log('Données du formulaire:', this.loginForm);

    if (!this.validateLoginForm()) {
      return;
    }

    this.isLoading = true;
    console.log('Envoi de la requête de connexion...');

    this.authService.login(this.loginForm).subscribe({
      next: (response: AuthResponse) => {
        console.log('=== RÉPONSE DE CONNEXION ===');
        console.log('Réponse complète:', response);
        console.log('Succès:', response.success);
        console.log('Message:', response.message);
        console.log('Token reçu:', response.token);
        console.log('Utilisateur connecté:', response.user);

        if (response.success) {
          this.showAlertMessage('Connexion réussie ! Redirection...', 'success');

          // Vérifier l'état de l'authentification
          console.log('=== ÉTAT POST-CONNEXION ===');
          console.log('Token stocké:', this.authService.getToken());
          console.log('Utilisateur actuel:', this.authService.getCurrentUser());
          console.log('Est connecté:', this.authService.isLoggedIn());
          console.log('Est admin:', this.authService.isAdmin());
          console.log('Est gérant:', this.authService.isGerant());

          // Redirection après 2 secondes
          setTimeout(() => {
            console.log('Redirection vers la page d\'accueil...');
            this.router.navigate(['/acceuil']);
          }, 2000);
        } else {
          this.showAlertMessage(response.message, 'error');
        }

        this.isLoading = false;
      },
      error: (error: any) => {
        console.log('=== ERREUR DE CONNEXION ===');
        console.error('Erreur complète:', error);
        this.showAlertMessage('Erreur: ' + error, 'error');
        this.isLoading = false;
      }
    });
  }

  // Changement de mot de passe
  onChangePassword(): void {
    console.log('=== TENTATIVE DE CHANGEMENT DE MOT DE PASSE ===');
    console.log('Données du formulaire:', this.changePasswordForm);

    if (!this.validateChangePasswordForm()) {
      return;
    }

    this.isLoading = true;
    console.log('Envoi de la requête de changement de mot de passe...');

    this.authService.changePassword(this.changePasswordForm).subscribe({
      next: (response: AuthResponse) => {
        console.log('=== RÉPONSE CHANGEMENT MOT DE PASSE ===');
        console.log('Réponse complète:', response);
        console.log('Succès:', response.success);
        console.log('Message:', response.message);

        if (response.success) {
          this.showAlertMessage('Mot de passe changé avec succès !', 'success');

          // Revenir au formulaire de connexion après succès
          setTimeout(() => {
            this.showPasswordReset = false;
            this.resetForms();
            console.log('Retour au formulaire de connexion');
          }, 2000);
        } else {
          this.showAlertMessage(response.message, 'error');
        }

        this.isLoading = false;
      },
      error: (error: any) => {
        console.log('=== ERREUR CHANGEMENT MOT DE PASSE ===');
        console.error('Erreur complète:', error);
        this.showAlertMessage('Erreur: ' + error, 'error');
        this.isLoading = false;
      }
    });
  }

  // Validation du formulaire de connexion
  validateLoginForm(): boolean {
    console.log('=== VALIDATION FORMULAIRE CONNEXION ===');

    if (!this.loginForm.email.trim()) {
      console.log('Erreur: Email vide');
      this.showAlertMessage('L\'email est obligatoire', 'error');
      return false;
    }

    if (!this.authService.isValidEmail(this.loginForm.email)) {
      console.log('Erreur: Format email invalide');
      this.showAlertMessage('Format d\'email invalide', 'error');
      return false;
    }

    if (!this.loginForm.password.trim()) {
      console.log('Erreur: Mot de passe vide');
      this.showAlertMessage('Le mot de passe est obligatoire', 'error');
      return false;
    }

    console.log('Validation réussie');
    return true;
  }

  // Validation du formulaire de changement de mot de passe
  validateChangePasswordForm(): boolean {
    console.log('=== VALIDATION FORMULAIRE CHANGEMENT MOT DE PASSE ===');

    const required = ['nom', 'prenom', 'email', 'newPassword'];

    for (const field of required) {
      if (!this.changePasswordForm[field as keyof ChangePasswordRequest]?.trim()) {
        console.log(`Erreur: ${field} vide`);
        this.showAlertMessage(`Le champ ${field} est obligatoire`, 'error');
        return false;
      }
    }

    if (!this.authService.isValidEmail(this.changePasswordForm.email)) {
      console.log('Erreur: Format email invalide');
      this.showAlertMessage('Format d\'email invalide', 'error');
      return false;
    }

    if (this.changePasswordForm.newPassword.length < 6) {
      console.log('Erreur: Mot de passe trop court');
      this.showAlertMessage('Le mot de passe doit contenir au moins 6 caractères', 'error');
      return false;
    }

    console.log('Validation réussie');
    return true;
  }

  // Afficher un message d'alerte
  showAlertMessage(message: string, type: 'success' | 'error'): void {
    console.log(`=== ALERTE ${type.toUpperCase()} ===`);
    console.log('Message:', message);

    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;

    setTimeout(() => {
      this.showAlert = false;
      console.log('Alerte masquée automatiquement');
    }, 5000);
  }

  // Fermer l'alerte manuellement
  closeAlert(): void {
    this.showAlert = false;
    console.log('Alerte fermée manuellement');
  }

  // Nettoyer les alertes
  clearAlerts(): void {
    this.showAlert = false;
    this.alertMessage = '';
    this.alertType = '';
  }

  // Réinitialiser les formulaires
  resetForms(): void {
    console.log('=== RÉINITIALISATION DES FORMULAIRES ===');

    this.loginForm = {
      email: '',
      password: ''
    };

    this.changePasswordForm = {
      nom: '',
      prenom: '',
      telephone: '',
      email: '',
      newPassword: ''
    };

    console.log('Formulaires réinitialisés');
  }

  // Test de connexion à l'API
  testConnection(): void {
    console.log('=== TEST DE CONNEXION API ===');
    this.authService.testConnection().subscribe({
      next: (response: any) => {
        console.log('API accessible:', response);
        this.showAlertMessage('Connexion à l\'API réussie', 'success');
      },
      error: (error: any) => {
        console.error('API inaccessible:', error);
        this.showAlertMessage('Connexion à l\'API échouée', 'error');
      }
    });
  }

  // Pré-remplir le formulaire pour les tests (à retirer en production)
  fillTestData(): void {
    console.log('=== REMPLISSAGE DONNÉES DE TEST ===');

    if (!this.showPasswordReset) {
      // Données de connexion de test
      this.loginForm.email = 'aboubacrisow99@gmail.com';
      this.loginForm.password = 'SENEGAL390a';
      console.log('Formulaire de connexion pré-rempli');
    } else {
      // Données de changement de mot de passe de test
      this.changePasswordForm.nom = 'Sow';
      this.changePasswordForm.prenom = 'Aboubacar';
      this.changePasswordForm.telephone = '773909890';
      this.changePasswordForm.email = 'aboubacrisow99@gmail.com';
      this.changePasswordForm.newPassword = 'nouveau123';
      console.log('Formulaire de changement de mot de passe pré-rempli');
    }
  }
}
