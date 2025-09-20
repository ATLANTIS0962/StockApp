import { PolitiqueMotDePasse } from '../types';
import CryptoJS from 'crypto-js';

// Politique de mot de passe par défaut
export const POLITIQUE_MOT_DE_PASSE_DEFAUT: PolitiqueMotDePasse = {
  longueurMinimale: 8,
  majusculesRequises: true,
  minusculesRequises: true,
  chiffresRequis: true,
  caracteresSpeciauxRequis: true,
  interdireMotsCommuns: true
};

// Mots de passe communs à éviter
const MOTS_DE_PASSE_COMMUNS = [
  'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
  'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'azerty'
];

// Fonction pour hasher un mot de passe
export const hasherMotDePasse = (motDePasse: string): string => {
  return CryptoJS.SHA256(motDePasse).toString();
};

// Fonction pour vérifier un mot de passe
export const verifierMotDePasse = (motDePasse: string, hash: string): boolean => {
  return hasherMotDePasse(motDePasse) === hash;
};

// Fonction pour valider un mot de passe selon la politique
export const validerMotDePasse = (motDePasse: string, politique: PolitiqueMotDePasse = POLITIQUE_MOT_DE_PASSE_DEFAUT): { valide: boolean; erreurs: string[] } => {
  const erreurs: string[] = [];

  // Vérifier la longueur minimale
  if (motDePasse.length < politique.longueurMinimale) {
    erreurs.push(`Le mot de passe doit contenir au moins ${politique.longueurMinimale} caractères`);
  }

  // Vérifier les majuscules
  if (politique.majusculesRequises && !/[A-Z]/.test(motDePasse)) {
    erreurs.push('Le mot de passe doit contenir au moins une majuscule');
  }

  // Vérifier les minuscules
  if (politique.minusculesRequises && !/[a-z]/.test(motDePasse)) {
    erreurs.push('Le mot de passe doit contenir au moins une minuscule');
  }

  // Vérifier les chiffres
  if (politique.chiffresRequis && !/[0-9]/.test(motDePasse)) {
    erreurs.push('Le mot de passe doit contenir au moins un chiffre');
  }

  // Vérifier les caractères spéciaux
  if (politique.caracteresSpeciauxRequis && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(motDePasse)) {
    erreurs.push('Le mot de passe doit contenir au moins un caractère spécial');
  }

  // Vérifier les mots communs
  if (politique.interdireMotsCommuns && MOTS_DE_PASSE_COMMUNS.includes(motDePasse.toLowerCase())) {
    erreurs.push('Ce mot de passe est trop commun, veuillez en choisir un autre');
  }

  return {
    valide: erreurs.length === 0,
    erreurs
  };
};

// Fonction pour générer un mot de passe aléatoire
export const genererMotDePasseAleatoire = (longueur: number = 12): string => {
  const majuscules = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const minuscules = 'abcdefghijklmnopqrstuvwxyz';
  const chiffres = '0123456789';
  const caracteresSpeciaux = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const tousCaracteres = majuscules + minuscules + chiffres + caracteresSpeciaux;
  
  let motDePasse = '';
  
  // S'assurer qu'il y a au moins un caractère de chaque type
  motDePasse += majuscules[Math.floor(Math.random() * majuscules.length)];
  motDePasse += minuscules[Math.floor(Math.random() * minuscules.length)];
  motDePasse += chiffres[Math.floor(Math.random() * chiffres.length)];
  motDePasse += caracteresSpeciaux[Math.floor(Math.random() * caracteresSpeciaux.length)];
  
  // Compléter avec des caractères aléatoires
  for (let i = 4; i < longueur; i++) {
    motDePasse += tousCaracteres[Math.floor(Math.random() * tousCaracteres.length)];
  }
  
  // Mélanger les caractères
  return motDePasse.split('').sort(() => Math.random() - 0.5).join('');
};

// Fonction pour générer un token de session
export const genererTokenSession = (): string => {
  return CryptoJS.lib.WordArray.random(32).toString();
};

// Fonction pour valider un email
export const validerEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};