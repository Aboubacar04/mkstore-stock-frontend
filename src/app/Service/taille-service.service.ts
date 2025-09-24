import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Taille } from '../modeles/taille';

@Injectable({
  providedIn: 'root'
})
export class TailleServiceService {

  private apiUrl = 'http://localhost:8080/api/taille';

  constructor(private http: HttpClient) { }

  // GET all tailles
  getAllTailles(): Observable<Taille[]> {
    return this.http.get<Taille[]>(this.apiUrl);
  }

  // GET taille by id
  getTailleById(id: number): Observable<Taille> {
    return this.http.get<Taille>(`${this.apiUrl}/${id}`);
  }

  // POST new taille
  createTaille(taille: Taille): Observable<Taille> {
    return this.http.post<Taille>(this.apiUrl, taille);
  }

  // PUT update taille
  updateTaille(id: number, taille: Taille): Observable<Taille> {
    return this.http.put<Taille>(`${this.apiUrl}/${id}`, taille);
  }

  // DELETE taille
  deleteTaille(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
