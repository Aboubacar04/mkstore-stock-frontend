import { Routes } from '@angular/router';
import { TailleComponent } from './Pages/taille/taille-component/taille-component.component';
import { ModeleComponentComponent } from './Pages/modele/modele-component/modele-component.component';




export const routes: Routes = [
{ path: 'tailles', component: TailleComponent },
{ path: 'modeles', component: ModeleComponentComponent }

];
