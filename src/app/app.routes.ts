import { Routes } from '@angular/router';
import { TailleComponent } from './Pages/taille/taille-component/taille-component.component';
import { ModeleComponentComponent } from './Pages/modele/modele-component/modele-component.component';
import { ProduitComponentComponent } from './Pages/produit/produit-component/produit-component.component';
import { AcceuilComponentComponent } from './Pages/acceuil/acceuil-component/acceuil-component.component';
import { PasserCommandeComponent } from './Pages/commande/passer-commande/passer-commande.component';
import { ListCommandeComponent } from './Pages/commande/list-commande/list-commande.component';
import { CommandeJourComponent } from './Pages/commande/commande-jour/commande-jour.component';
import { ModeleRuptureComponent } from './Pages/modele/modele-rupture/modele-rupture.component';
import { CommandeSemaineComponent } from './Pages/commande/commande-semaine/commande-semaine.component';
import { CommandeMoisComponent } from './Pages/commande/commande-mois/commande-mois.component';
import { UserPageComponent } from './Pages/user/user-page/user-page.component';
import { LoginPageComponent } from './Pages/Login/login-page/login-page.component';
import { authGuard, adminGuard } from './guards/auth.guard';
import { UserProfileComponent } from './Pages/user/user-profile/user-profile.component';

export const routes: Routes = [
  // Route publique (accessible sans connexion)
  { path: 'login', component: LoginPageComponent },

  // Routes protégées (nécessitent connexion) - ADMIN et GERANT
  {
    path: 'tailles',
    component: TailleComponent,
    canActivate: [authGuard]
  },
  {
    path: 'modeles',
    component: ModeleComponentComponent,
    canActivate: [authGuard]
  },
  {
    path: 'stocks',
    component: ProduitComponentComponent,
    canActivate: [authGuard]
  },
  {
    path: 'acceuil',
    component: AcceuilComponentComponent,
    canActivate: [authGuard]
  },
  {
    path: 'passer-commande',
    component: PasserCommandeComponent,
    canActivate: [authGuard]
  },
  {
    path: 'liste-commande',
    component: ListCommandeComponent,
    canActivate: [authGuard]
  },
  {
    path: 'commande-du-jour',
    component: CommandeJourComponent,
    canActivate: [authGuard]
  },
  {
    path: 'modele-rupture',
    component: ModeleRuptureComponent,
    canActivate: [authGuard]
  },
  {
    path: 'commande-semaine',
    component: CommandeSemaineComponent,
    canActivate: [authGuard]
  },
  {
    path: 'commande-mois',
    component: CommandeMoisComponent,
    canActivate: [authGuard]
  },

  // Route réservée aux ADMIN uniquement (GERANT ne peut pas accéder)
  {
    path: 'Paramettre-user',
    component: UserPageComponent,
    canActivate: [authGuard, adminGuard] // Double protection
  },
   {
    path: 'user-profile',
    component: UserProfileComponent,
    canActivate: [authGuard, adminGuard] // Double protection
  },

  // Redirection par défaut
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Route wildcard pour les URLs non trouvées
  { path: '**', redirectTo: '/login' }
];
