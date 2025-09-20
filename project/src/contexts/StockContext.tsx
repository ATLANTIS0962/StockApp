import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Article, BonAttribution, Mouvement, Utilisateur, AlerteStock, PolitiqueMotDePasse } from '../types';
import DatabaseManager from '../database/database';
import { hasherMotDePasse, verifierMotDePasse, validerMotDePasse, genererTokenSession } from '../utils/auth';

interface StockContextType {
  // Articles
  articles: Article[];
  ajouterArticle: (article: Omit<Article, 'id' | 'dateCreation' | 'derniereModification'>) => void;
  modifierArticle: (id: string, article: Partial<Article>) => void;
  supprimerArticle: (id: string) => void;
  
  // Bons d'attribution
  bonsAttribution: BonAttribution[];
  creerBonAttribution: (bon: Omit<BonAttribution, 'id' | 'dateAttribution'>) => void;
  validerBonAttribution: (id: string) => void;
  annulerBonAttribution: (id: string) => void;
  
  // Mouvements
  mouvements: Mouvement[];
  ajouterMouvement: (mouvement: Omit<Mouvement, 'id' | 'date'>) => void;
  
  // Utilisateurs
  utilisateurs: Utilisateur[];
  utilisateurConnecte: Utilisateur | null;
  connexion: (email: string, motDePasse: string) => boolean;
  deconnexion: () => void;
  changerMotDePasse: (motDePasseActuel: string, nouveauMotDePasse: string) => Promise<boolean>;
  
  // Alertes
  alertesStock: AlerteStock[];
  
  // Gestion des utilisateurs
  ajouterUtilisateur: (utilisateur: Omit<Utilisateur, 'id'>) => void;
  modifierUtilisateur: (id: string, utilisateur: Partial<Utilisateur>) => void;
  supprimerUtilisateur: (id: string) => void;
  
  // Politique de mot de passe
  politiqueMotDePasse: PolitiqueMotDePasse;
  modifierPolitiqueMotDePasse: (politique: PolitiqueMotDePasse) => void;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

export const useStock = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
};

interface StockProviderProps {
  children: ReactNode;
}

export const StockProvider: React.FC<StockProviderProps> = ({ children }) => {
  const [db, setDb] = useState<DatabaseManager | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [bonsAttribution, setBonsAttribution] = useState<BonAttribution[]>([]);
  const [mouvements, setMouvements] = useState<Mouvement[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [utilisateurConnecte, setUtilisateurConnecte] = useState<Utilisateur | null>(null);
  const [alertesStock, setAlertesStock] = useState<AlerteStock[]>([]);
  const [politiqueMotDePasse, setPolitiqueMotDePasse] = useState<PolitiqueMotDePasse>({
    longueurMinimale: 8,
    majusculesRequises: true,
    minusculesRequises: true,
    chiffresRequis: true,
    caracteresSpeciauxRequis: true,
    interdireMotsCommuns: true
  });

  // Initialiser la base de données
  useEffect(() => {
    try {
      const database = new DatabaseManager();
      setDb(database);
      loadData(database);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la base de données:', error);
    }
    
    // Cleanup
    return () => {
      if (db) {
        db.close();
      }
    };
  }, []);

  const loadData = (database: DatabaseManager = db!) => {
    if (!database) return;
    
    try {
      setArticles(database.getArticles());
      setBonsAttribution(database.getBonsAttribution());
      setMouvements(database.getMouvements());
      setUtilisateurs(database.getUtilisateurs());
      setPolitiqueMotDePasse(database.getPolitiqueMotDePasse());
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  // Calculer les alertes stock
  useEffect(() => {
    const nouvelles: AlerteStock[] = [];
    
    articles.forEach(article => {
      if (article.quantiteActuelle <= 0) {
        nouvelles.push({
          articleId: article.id,
          designation: article.designation,
          quantiteActuelle: article.quantiteActuelle,
          seuilCritique: article.seuilCritique,
          niveau: 'rupture'
        });
      } else if (article.quantiteActuelle <= article.seuilCritique) {
        nouvelles.push({
          articleId: article.id,
          designation: article.designation,
          quantiteActuelle: article.quantiteActuelle,
          seuilCritique: article.seuilCritique,
          niveau: article.quantiteActuelle <= article.seuilCritique * 0.5 ? 'critique' : 'faible'
        });
      }
    });
    
    setAlertesStock(nouvelles);
  }, [articles]);

  const ajouterArticle = (articleData: Omit<Article, 'id' | 'dateCreation' | 'derniereModification'>) => {
    if (!db) return;
    
    const nouvelArticle: Article = {
      ...articleData,
      id: Date.now().toString(),
      dateCreation: new Date(),
      derniereModification: new Date()
    };
    
    try {
      db.ajouterArticle(nouvelArticle);
      loadData();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'article:', error);
    }
  };

  const modifierArticle = (id: string, articleData: Partial<Article>) => {
    if (!db) return;
    
    const updatedData = { ...articleData, derniereModification: new Date() };
    
    try {
      db.modifierArticle(id, updatedData);
      loadData();
    } catch (error) {
      console.error('Erreur lors de la modification de l\'article:', error);
    }
  };

  const supprimerArticle = (id: string) => {
    if (!db) return;
    
    try {
      db.supprimerArticle(id);
      loadData();
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'article:', error);
    }
  };

  const creerBonAttribution = (bonData: Omit<BonAttribution, 'id' | 'dateAttribution'>) => {
    if (!db) return;
    
    const nouveauBon: BonAttribution = {
      ...bonData,
      id: Date.now().toString(),
      dateAttribution: new Date()
    };
    
    try {
      db.ajouterBonAttribution(nouveauBon);
      loadData();
    } catch (error) {
      console.error('Erreur lors de la création du bon d\'attribution:', error);
    }
  };

  const validerBonAttribution = (id: string) => {
    if (!db) return;
    
    const bon = bonsAttribution.find(b => b.id === id);
    if (bon && bon.statut === 'en_attente') {
      try {
        // Mettre à jour le bon
        db.modifierBonAttribution(id, { statut: 'valide' });
        
        // Mettre à jour le stock pour chaque article
        bon.articles.forEach(articleBon => {
          const article = articles.find(a => a.id === articleBon.articleId);
          if (article) {
            db.modifierArticle(articleBon.articleId, { 
              quantiteActuelle: article.quantiteActuelle - articleBon.quantiteSortie 
            });
          }
          
          // Ajouter un mouvement pour chaque article
          const mouvement: Mouvement = {
            id: (Date.now() + Math.random()).toString(),
            articleId: articleBon.articleId,
            type: 'sortie',
            quantite: articleBon.quantiteSortie,
            date: new Date(),
            reference: bon.numerobon,
            utilisateur: bon.utilisateur,
            commentaire: `Attribution à ${bon.destinataire}`
          };
          
          db.ajouterMouvement(mouvement);
        });
        
        // Recharger les données
        loadData();
      } catch (error) {
        console.error('Erreur lors de la validation du bon d\'attribution:', error);
      }
    }
  };

  const annulerBonAttribution = (id: string) => {
    if (!db) return;
    
    try {
      db.modifierBonAttribution(id, { statut: 'annule' });
      loadData();
    } catch (error) {
      console.error('Erreur lors de l\'annulation du bon d\'attribution:', error);
    }
  };

  const ajouterMouvement = (mouvementData: Omit<Mouvement, 'id' | 'date'>) => {
    if (!db) return;
    
    const nouveauMouvement: Mouvement = {
      ...mouvementData,
      id: Date.now().toString(),
      date: new Date()
    };
    
    try {
      db.ajouterMouvement(nouveauMouvement);
      
      // Mettre à jour le stock
      const article = articles.find(a => a.id === mouvementData.articleId);
      if (article) {
        const nouvelleQuantite = mouvementData.type === 'entree' 
          ? article.quantiteActuelle + mouvementData.quantite
          : article.quantiteActuelle - mouvementData.quantite;
        
        db.modifierArticle(mouvementData.articleId, { quantiteActuelle: nouvelleQuantite });
      }
      
      // Recharger les données
      loadData();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du mouvement:', error);
    }
  };

  const connexion = (email: string, motDePasse: string) => {
    // Connexion simplifiée pour le debug
    console.log('Tentative de connexion:', { email, motDePasse });
    console.log('Utilisateurs disponibles:', utilisateurs);
    
    // Vérification directe avec mots de passe en clair pour le debug
    if (email === 'admin@stock.com' && motDePasse === 'hello') {
      const adminUser = utilisateurs.find(u => u.email === 'admin@stock.com');
      if (adminUser) {
        setUtilisateurConnecte(adminUser);
        return true;
      }
    }
    
    if (email === 'jean.dupont@stock.com' && motDePasse === 'hello') {
      const magasinierUser = utilisateurs.find(u => u.email === 'jean.dupont@stock.com');
      if (magasinierUser) {
        setUtilisateurConnecte(magasinierUser);
        return true;
      }
    }
    
    console.log('Connexion échouée');
    return false;
  };

  const deconnexion = () => {
    setUtilisateurConnecte(null);
  };
  
  const changerMotDePasse = async (motDePasseActuel: string, nouveauMotDePasse: string): Promise<boolean> => {
    if (!utilisateurConnecte || !db) return false;
    
    // Vérification simplifiée du mot de passe actuel
    console.log('Vérification mot de passe:', {
      saisi: motDePasseActuel,
      stocke: utilisateurConnecte.motDePasse,
      email: utilisateurConnecte.email
    });
    
    // Pour les comptes par défaut, vérifier directement
    const isDefaultAccount = (utilisateurConnecte.email === 'admin@stock.com' || utilisateurConnecte.email === 'jean.dupont@stock.com') 
                             && utilisateurConnecte.motDePasse === 'hello';
    
    if (!isDefaultAccount && !verifierMotDePasse(motDePasseActuel, utilisateurConnecte.motDePasse)) {
      console.log('Mot de passe actuel incorrect');
      return false;
    }
    
    // Si c'est un compte par défaut, vérifier que le mot de passe saisi est "hello"
    if (isDefaultAccount && motDePasseActuel !== 'hello') {
      console.log('Mot de passe par défaut incorrect');
      return false;
    }
    
    // Valider le nouveau mot de passe
    const validation = validerMotDePasse(nouveauMotDePasse, politiqueMotDePasse);
    if (!validation.valide) {
      console.log('Nouveau mot de passe invalide:', validation.erreurs);
      return false;
    }
    
    // Hasher et sauvegarder le nouveau mot de passe
    const nouveauHash = hasherMotDePasse(nouveauMotDePasse);
    console.log('Changement de mot de passe réussi');
    
    db.modifierUtilisateur(utilisateurConnecte.id, { 
      motDePasse: nouveauHash,
      doitChangerMotDePasse: false
    });
    
    // Mettre à jour l'utilisateur connecté
    setUtilisateurConnecte(prev => prev ? { 
      ...prev, 
      motDePasse: nouveauHash,
      doitChangerMotDePasse: false
    } : null);
    
    loadData();
    return true;
  };

  const ajouterUtilisateur = (utilisateurData: Omit<Utilisateur, 'id'>) => {
    if (!db) return;
    
    const nouvelUtilisateur: Utilisateur = {
      ...utilisateurData,
      id: Date.now().toString(),
      motDePasse: hasherMotDePasse(utilisateurData.motDePasse || 'TempPass123!'),
      dateCreation: new Date(),
      doitChangerMotDePasse: true
    };
    
    try {
      db.ajouterUtilisateur(nouvelUtilisateur);
      loadData();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'utilisateur:', error);
    }
  };

  const modifierUtilisateur = (id: string, utilisateurData: Partial<Utilisateur>) => {
    if (!db) return;
    
    // Si un nouveau mot de passe est fourni, le hasher
    const updatedData = { ...utilisateurData };
    if (updatedData.motDePasse) {
      updatedData.motDePasse = hasherMotDePasse(updatedData.motDePasse);
    }
    
    try {
      db.modifierUtilisateur(id, updatedData);
      loadData();
    } catch (error) {
      console.error('Erreur lors de la modification de l\'utilisateur:', error);
    }
  };

  const supprimerUtilisateur = (id: string) => {
    if (!db) return;
    
    try {
      db.supprimerUtilisateur(id);
      loadData();
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    }
  };
  
  const modifierPolitiqueMotDePasse = (politique: PolitiqueMotDePasse) => {
    if (!db) return;
    
    try {
      db.modifierPolitiqueMotDePasse(politique);
      setPolitiqueMotDePasse(politique);
    } catch (error) {
      console.error('Erreur lors de la modification de la politique de mot de passe:', error);
    }
  };

  const value: StockContextType = {
    articles,
    ajouterArticle,
    modifierArticle,
    supprimerArticle,
    bonsAttribution,
    creerBonAttribution,
    validerBonAttribution,
    annulerBonAttribution,
    mouvements,
    ajouterMouvement,
    utilisateurs,
    utilisateurConnecte,
    connexion,
    deconnexion,
    changerMotDePasse,
    alertesStock,
    ajouterUtilisateur,
    modifierUtilisateur,
    supprimerUtilisateur,
    politiqueMotDePasse,
    modifierPolitiqueMotDePasse
  };

  return (
    <StockContext.Provider value={value}>
      {children}
    </StockContext.Provider>
  );
};