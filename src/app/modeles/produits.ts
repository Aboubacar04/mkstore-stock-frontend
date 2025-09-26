import { Modele } from "./modele";
import { Taille } from "./taille";

// produit.ts
export class Produit {
  id_produit?: number;        // identifiant du produit (optionnel pour création)
  modeleId?: number;          // ID du modèle (pour création)
  tailleId?: number;          // ID de la taille (pour création)
  quantite: number = 0;       // quantité en stock

  // Objets complets retournés par le backend
  modele?: Modele;
  taille?: Taille;
}
