import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthServiceService } from '../Service/auth-service.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthServiceService);
  const router = inject(Router);

  // Vérifier si l'utilisateur est connecté
  if (authService.isLoggedIn()) {
    return true;
  }

  // Si non connecté, rediriger vers login
  console.log('Accès refusé : utilisateur non connecté');
  router.navigate(['/login']);
  return false;
};

// Guard pour protéger les routes admin uniquement
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthServiceService);
  const router = inject(Router);

  // Vérifier si l'utilisateur est connecté ET admin
  if (authService.isLoggedIn() && authService.isAdmin()) {
    return true;
  }

  // Si pas admin, rediriger vers accueil
  console.log('Accès refusé : accès admin requis');
  router.navigate(['/acceuil']);
  return false;
};
