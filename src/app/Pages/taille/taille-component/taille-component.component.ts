import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Taille } from '../../../modeles/taille';
import { TailleServiceService } from '../../../Service/taille-service.service';

@Component({
  selector: 'app-taille',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatProgressSpinnerModule,
    FontAwesomeModule,
  ],
  templateUrl: './taille-component.component.html',
  styleUrls: ['./taille-component.component.css']
})
export class TailleComponent implements OnInit {
   faTrash = faTrash;

  displayedColumns: string[] = ['id_taille', 'libelle', 'actions'];
  dataSource = new MatTableDataSource<Taille>();
  tailles: Taille[] = [];
  nouvelleTaille: Taille = new Taille();
  isLoading = false;
  message: string = '';
  messageType: 'success' | 'error' = 'success';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private tailleService: TailleServiceService) {}

  ngOnInit(): void {
    this.getAllTailles();
  }

  showMessage(msg: string, type: 'success' | 'error' = 'success') {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => this.message = '', 5000);
  }

  // 🔹 Récupérer toutes les tailles
  getAllTailles() {
    this.isLoading = true;
    this.tailleService.getAllTailles().subscribe(
      (response: any) => {
        this.tailles = response.data || [];
        this.dataSource.data = this.tailles;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.isLoading = false;
        this.showMessage(response.message || 'Tailles récupérées avec succès', 'success');
      },
      error => {
        console.error('Erreur getAllTailles :', error);
        this.showMessage(error.error?.message || 'Erreur lors de la récupération des tailles', 'error');
        this.isLoading = false;
      }
    );
  }

  // 🔹 Créer une taille
  createTaille() {
    if (!this.nouvelleTaille.libelle) return;
    this.isLoading = true;
    this.tailleService.createTaille({ libelle: this.nouvelleTaille.libelle }).subscribe(
      (response: any) => {
        this.nouvelleTaille = new Taille();
        this.getAllTailles();
        this.showMessage(response.message || 'Taille créée avec succès', 'success');
      },
      error => {
        console.error('Erreur createTaille :', error);
        this.showMessage(error.error?.message || 'Erreur lors de la création de la taille', 'error');
        this.isLoading = false;
      }
    );
  }

  // 🔹 Supprimer une taille
  deleteTaille(id: number) {
    if (confirm("Voulez-vous vraiment supprimer cette taille ?")) {
      this.isLoading = true;
      this.tailleService.deleteTaille(id).subscribe(
        (res: any) => {
          this.tailles = this.tailles.filter(t => t.id_taille !== id);
          this.dataSource.data = this.tailles;
          this.showMessage(res?.message || 'Taille supprimée avec succès', 'success');
          this.isLoading = false;
        },
        error => {
          console.error("Erreur suppression :", error);
          this.showMessage(error.error?.message || 'Erreur lors de la suppression de la taille', 'error');
          this.isLoading = false;
        }
      );
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
