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




export const routes: Routes = [
{ path: 'tailles', component: TailleComponent },
{ path: 'modeles', component: ModeleComponentComponent },
{ path: 'stocks', component: ProduitComponentComponent},
{ path: 'acceuil', component: AcceuilComponentComponent},
{ path: 'passer-commande', component: PasserCommandeComponent},
{ path: 'liste-commande', component: ListCommandeComponent},
{ path: 'commande-du-jour', component: CommandeJourComponent},
{ path: 'modele-rupture', component: ModeleRuptureComponent},
{ path: 'commande-semaine', component: CommandeSemaineComponent},
{ path: 'commande-mois', component: CommandeMoisComponent},
{ path: 'Paramettre-user', component: UserPageComponent},
{ path: 'login', component: LoginPageComponent},

];
