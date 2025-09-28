import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Interface pour l'utilisateur (correspond à votre entité Java)
export interface User {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  password: string;
  role: 'GERANT' | 'ADMIN';
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserServieService {

  private readonly apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) { }

  // CREATE - Créer un nouvel utilisateur
  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/create`, user)
      .pipe(
        catchError(this.handleError)
      );
  }

  // READ - Récupérer tous les utilisateurs
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/all`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // READ - Récupérer un utilisateur par ID
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // UPDATE - Mettre à jour un utilisateur
  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/update/${id}`, user)
      .pipe(
        catchError(this.handleError)
      );
  }

  // DELETE - Supprimer un utilisateur
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`, { responseType: 'text' })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Gestion centralisée des erreurs
  private handleError = (error: HttpErrorResponse) => {
    let errorMessage = '';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      switch (error.status) {
        case 400:
          errorMessage = error.error || 'Données invalides';
          break;
        case 404:
          errorMessage = error.error || 'Utilisateur non trouvé';
          break;
        case 500:
          errorMessage = error.error || 'Erreur interne du serveur';
          break;
        default:
          errorMessage = `Erreur ${error.status}: ${error.error || error.message}`;
      }
    }

    console.error('UserService Error:', errorMessage, error);
    return throwError(() => errorMessage);
  };
}
