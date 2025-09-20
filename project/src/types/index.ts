export interface Article {
  id: string;
  reference: string;
  designation: string;
  description: string;
  quantiteInitiale: number;
  quantiteActuelle: number;
  seuilCritique: number;
  dateCreation: Date;
  derniereModification: Date;
}

export interface BonAttribution {
  id: string;
  numerobon: string;
  articles: {
    articleId: string;
    designation: string;
    quantiteSortie: number;
  }[];
  destinataire: string;
  dateAttribution: Date;
  utilisateur: string;
  statut: 'en_attente' | 'valide' | 'annule';
}

export interface Mouvement {
  id: string;
  articleId: string;
  type: 'entree' | 'sortie';
  quantite: number;
  date: Date;
  reference: string;
  utilisateur: string;
  commentaire?: string;
}

export interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  role: 'admin' | 'magasinier' | 'utilisateur';
  actif: boolean;
  dateCreation: Date;
  derniereConnexion?: Date;
  doitChangerMotDePasse: boolean;
}

export interface AlerteStock {
  articleId: string;
  designation: string;
  quantiteActuelle: number;
  seuilCritique: number;
  niveau: 'critique' | 'faible' | 'rupture';
}

export interface PolitiqueMotDePasse {
  longueurMinimale: number;
  majusculesRequises: boolean;
  minusculesRequises: boolean;
  chiffresRequis: boolean;
  caracteresSpeciauxRequis: boolean;
  interdireMotsCommuns: boolean;
}

export interface SessionUtilisateur {
  utilisateur: Utilisateur;
  dateConnexion: Date;
  token: string;
}