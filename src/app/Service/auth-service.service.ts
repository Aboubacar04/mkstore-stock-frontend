import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

// Interfaces pour les requêtes et réponses
export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  newPassword: string;
}

export interface User {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: 'GERANT' | 'ADMIN';
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  private readonly apiUrl = 'http://localhost:8080/api/auth';
  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'current_user';

  // BehaviorSubject pour suivre l'état de connexion
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<User | null>(this.getCurrentUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Vérifier le token au démarrage
    this.checkTokenValidity();
  }

  // 1. MÉTHODE DE CONNEXION
  login(loginData: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginData)
      .pipe(
        tap(response => {
          if (response.success && response.token && response.user) {
            // Stocker le token et l'utilisateur
            this.setToken(response.token);
            this.setCurrentUser(response.user);

            // Mettre à jour les subjects
            this.isAuthenticatedSubject.next(true);
            this.currentUserSubject.next(response.user);
          }
        }),
        catchError(this.handleError)
      );
  }

  // 2. MÉTHODE DE DÉCONNEXION
  logout(): Observable<AuthResponse> {
    const headers = this.getAuthHeaders();

    return this.http.post<AuthResponse>(`${this.apiUrl}/logout`, {}, { headers })
      .pipe(
        tap(() => {
          // Nettoyer le stockage local
          this.clearAuth();
        }),
        catchError((error) => {
          // Même en cas d'erreur, nettoyer le stockage local
          this.clearAuth();
          return this.handleError(error);
        })
      );
  }

  // 3. MÉTHODE DE CHANGEMENT DE MOT DE PASSE
  changePassword(changePasswordData: ChangePasswordRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/change-password`, changePasswordData)
      .pipe(
        catchError(this.handleError)
      );
  }

  // 4. VÉRIFICATION DU TOKEN
  verifyToken(): Observable<AuthResponse> {
    const headers = this.getAuthHeaders();

    return this.http.get<AuthResponse>(`${this.apiUrl}/verify`, { headers })
      .pipe(
        tap(response => {
          if (response.success && response.user) {
            this.setCurrentUser(response.user);
            this.currentUserSubject.next(response.user);
            this.isAuthenticatedSubject.next(true);
          } else {
            this.clearAuth();
          }
        }),
        catchError((error) => {
          this.clearAuth();
          return this.handleError(error);
        })
      );
  }

  // MÉTHODES UTILITAIRES

  // Vérifier si l'utilisateur est connecté
  isLoggedIn(): boolean {
    return this.hasToken() && this.getCurrentUserFromStorage() !== null;
  }

  // Obtenir l'utilisateur actuel
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Obtenir le token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Vérifier si un token existe
  hasToken(): boolean {
    return this.getToken() !== null;
  }

  // Obtenir les headers d'authentification
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  // Vérifier si l'utilisateur a un rôle spécifique
  hasRole(role: 'GERANT' | 'ADMIN'): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  // Vérifier si l'utilisateur est admin
  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  // Vérifier si l'utilisateur est gérant
  isGerant(): boolean {
    return this.hasRole('GERANT');
  }

  // Obtenir le nom complet de l'utilisateur
  getFullName(): string {
    const user = this.getCurrentUser();
    return user ? `${user.prenom} ${user.nom}` : '';
  }

  // MÉTHODES PRIVÉES

  // Stocker le token
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Stocker l'utilisateur actuel
  private setCurrentUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  // Récupérer l'utilisateur depuis le stockage
  private getCurrentUserFromStorage(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  // Nettoyer l'authentification
  private clearAuth(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
  }

  // Vérifier la validité du token au démarrage
  private checkTokenValidity(): void {
    if (this.hasToken()) {
      this.verifyToken().subscribe({
        next: (response) => {
          // Le token est valide, l'état est déjà mis à jour dans verifyToken
        },
        error: () => {
          // Le token n'est pas valide, nettoyer
          this.clearAuth();
        }
      });
    }
  }

  // Gestion centralisée des erreurs
  private handleError = (error: HttpErrorResponse) => {
    let errorMessage = '';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        switch (error.status) {
          case 400:
            errorMessage = 'Données invalides';
            break;
          case 401:
            errorMessage = 'Non autorisé - vérifiez vos identifiants';
            this.clearAuth(); // Nettoyer l'auth en cas d'erreur 401
            break;
          case 403:
            errorMessage = 'Accès interdit';
            break;
          case 404:
            errorMessage = 'Service non trouvé';
            break;
          case 500:
            errorMessage = 'Erreur interne du serveur';
            break;
          default:
            errorMessage = `Erreur ${error.status}: ${error.statusText}`;
        }
      }
    }

    console.error('AuthService Error:', errorMessage, error);
    return throwError(() => errorMessage);
  };

  // Méthode pour forcer la déconnexion (en cas d'erreur token, etc.)
  forceLogout(): void {
    this.clearAuth();
  }

  // Méthode pour rafraîchir les données utilisateur
  refreshUserData(): Observable<AuthResponse> {
    return this.verifyToken();
  }

  // Validation d'email
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Méthode pour tester la connexion à l'API
  testConnection(): Observable<any> {
    return this.http.get(`${this.apiUrl}/verify`)
      .pipe(
        catchError((error) => {
          console.error('Impossible de se connecter à l\'API d\'authentification:', error);
          return throwError('Connexion à l\'API impossible');
        })
      );
  }
}
