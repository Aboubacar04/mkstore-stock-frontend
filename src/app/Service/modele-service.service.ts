// modele-service.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Modele } from '../modeles/modele';

@Injectable({
  providedIn: 'root'
})
export class ModeleServiceService {

  private apiUrl = 'http://localhost:8080/api/modele';

  // Headers avec Content-Type
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // Lire tous les modèles
  getModele(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // Lire un modèle par id
  getModeleById(id: number): Observable<Modele> {
    return this.http.get<Modele>(`${this.apiUrl}/${id}`);
  }

  // Créer un nouveau modèle avec FormData
  createModeleWithFormData(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);
  }

  // Mettre à jour avec FormData
  updateModeleWithFormData(id: number, formData: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, formData);
  }

  // Supprimer un modèle
  deleteModele(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
