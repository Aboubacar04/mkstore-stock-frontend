// commande-service.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Commande } from '../modeles/commande';

@Injectable({
  providedIn: 'root'
})
export class CommandeServiceService {

  private apiUrl = 'http://localhost:8080/api/commande';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // 📋 Récupérer toutes les commandes
  getAllCommandes(): Observable<Commande[]> {
    return this.http.get<Commande[]>(this.apiUrl);
  }

  // 🔍 Récupérer une commande par ID
  getCommandeById(id: number): Observable<Commande> {
    return this.http.get<Commande>(`${this.apiUrl}/${id}`);
  }

  // ➕ Créer une nouvelle commande
  createCommande(commande: Commande): Observable<any> {
    return this.http.post<any>(this.apiUrl, commande, this.httpOptions);
  }

  // ✏️ Mettre à jour une commande (si nécessaire)
  updateCommande(id: number, commande: Commande): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, commande, this.httpOptions);
  }

  // 🗑️ Supprimer une commande
  deleteCommande(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
