// produit-service.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produit } from '../modeles/produits';


@Injectable({
  providedIn: 'root'
})
export class ProduitServiceService {

  private apiUrl = 'http://localhost:8080/api/produit';

  // Headers avec Content-Type
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // 📋 Récupérer tous les produits
  getAllProduits(): Observable<Produit[]> {
    return this.http.get<Produit[]>(this.apiUrl);
  }

  // 🔍 Récupérer un produit par ID
  getProduitById(id: number): Observable<Produit> {
    return this.http.get<Produit>(`${this.apiUrl}/${id}`);
  }

  // ➕ Créer un nouveau produit
  createProduit(produit: Produit): Observable<any> {
    return this.http.post<any>(this.apiUrl, produit, this.httpOptions);
  }

  // ✏️ Mettre à jour un produit
  updateProduit(id: number, produit: Produit): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, produit, this.httpOptions);
  }

  // 🗑️ Supprimer un produit
  deleteProduit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
