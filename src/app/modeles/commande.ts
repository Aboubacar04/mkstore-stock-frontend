// detail-commande.ts
export class DetailCommande {
  idProduit: number = 0;
  nomModele: string = '';
  couleur: string = '';
  taille: string = '';
  quantite: number = 0;
  prixUnitaire: number = 0;
  totalLigne: number = 0;
}

// commande.ts
export class Commande {
  idCommande?: number;              // optionnel pour création
  date: string = '';                // format: "YYYY-MM-DD"
  nomClient: string = '';
  total: number = 0;
  details: DetailCommande[] = [];
}
