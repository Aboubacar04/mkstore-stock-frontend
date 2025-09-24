// src/app/services/modele-service.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Modele } from '../modeles/modele';

@Injectable({
  providedIn: 'root'
})
export class ModeleServiceService {

  private apiUrl = 'http://localhost:8080/api/modele';  // URL de l'API

  constructor(private http: HttpClient) { }

  // Lire tous les modèles
  getModele(): Observable<Modele[]> {
    return this.http.get<Modele[]>(this.apiUrl);
  }

  // Lire un modèle par id
  getModeleById(id: number): Observable<Modele> {
    return this.http.get<Modele>(`${this.apiUrl}/${id}`);
  }

  // Créer un nouveau modèle
  createModele(modele: Modele): Observable<Modele> {
    return this.http.post<Modele>(this.apiUrl, modele);
  }

  // Mettre à jour un modèle existant
  updateModele(id: number, modele: Modele): Observable<Modele> {
    return this.http.put<Modele>(`${this.apiUrl}/${id}`, modele);
  }

  // Supprimer un modèle
  deleteModele(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
