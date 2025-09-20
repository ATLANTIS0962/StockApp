import { Article, BonAttribution, Mouvement, Utilisateur, PolitiqueMotDePasse } from '../types';

// Interface pour simuler sqlite3 dans le navigateur
interface Database {
  run(sql: string, params?: any[], callback?: (err: Error | null) => void): void;
  get(sql: string, params?: any[], callback?: (err: Error | null, row?: any) => void): void;
  all(sql: string, params?: any[], callback?: (err: Error | null, rows?: any[]) => void): void;
  close(callback?: (err: Error | null) => void): void;
}

class DatabaseManager {
  private db: Database | null = null;
  private storageKeys = {
    utilisateurs: 'stock_utilisateurs',
    articles: 'stock_articles',
    bonsAttribution: 'stock_bons_attribution',
    mouvements: 'stock_mouvements',
    politique: 'stock_politique_mot_de_passe',
    initialized: 'stock_initialized'
  };

  constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      // IMPORTANT: Dans l'environnement WebContainer (navigateur), SQLite n'est pas disponible
      // Cette implémentation utilise localStorage pour simuler une base de données
      // En production serveur, ceci serait remplacé par une vraie connexion SQLite
      console.log('⚠️  Simulation SQLite avec localStorage (WebContainer ne supporte pas SQLite natif)');
      
      // Simulation de la création du fichier 'db'
      this.createTables();
      this.insertDefaultData();
      
      console.log('✅ Base de données simulée "db" initialisée avec localStorage');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la base de données:', error);
      this.initializeLocalStorage();
    }
  }

  private createTables() {
    // Simulation de la création des tables SQLite (stockage réel: localStorage)
    const tables = {
      utilisateurs: `
        CREATE TABLE IF NOT EXISTS utilisateurs (
          id TEXT PRIMARY KEY,
          nom TEXT NOT NULL,
          prenom TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          motDePasse TEXT NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('admin', 'magasinier', 'utilisateur')),
          actif BOOLEAN NOT NULL DEFAULT 1,
          dateCreation DATETIME NOT NULL,
          derniereConnexion DATETIME,
          doitChangerMotDePasse BOOLEAN NOT NULL DEFAULT 1
        )
      `,
      articles: `
        CREATE TABLE IF NOT EXISTS articles (
          id TEXT PRIMARY KEY,
          reference TEXT UNIQUE NOT NULL,
          designation TEXT NOT NULL,
          description TEXT,
          quantiteInitiale INTEGER NOT NULL DEFAULT 0,
          quantiteActuelle INTEGER NOT NULL DEFAULT 0,
          seuilCritique INTEGER NOT NULL DEFAULT 0,
          dateCreation DATETIME NOT NULL,
          derniereModification DATETIME NOT NULL
        )
      `,
      bons_attribution: `
        CREATE TABLE IF NOT EXISTS bons_attribution (
          id TEXT PRIMARY KEY,
          numerobon TEXT UNIQUE NOT NULL,
          articles TEXT NOT NULL,
          destinataire TEXT NOT NULL,
          dateAttribution DATETIME NOT NULL,
          utilisateur TEXT NOT NULL,
          statut TEXT NOT NULL CHECK (statut IN ('en_attente', 'valide', 'annule'))
        )
      `,
      mouvements: `
        CREATE TABLE IF NOT EXISTS mouvements (
          id TEXT PRIMARY KEY,
          articleId TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('entree', 'sortie')),
          quantite INTEGER NOT NULL,
          date DATETIME NOT NULL,
          reference TEXT NOT NULL,
          utilisateur TEXT NOT NULL,
          commentaire TEXT,
          FOREIGN KEY (articleId) REFERENCES articles (id)
        )
      `,
      politique_mot_de_passe: `
        CREATE TABLE IF NOT EXISTS politique_mot_de_passe (
          id INTEGER PRIMARY KEY,
          longueurMinimale INTEGER NOT NULL DEFAULT 8,
          majusculesRequises BOOLEAN NOT NULL DEFAULT 1,
          minusculesRequises BOOLEAN NOT NULL DEFAULT 1,
          chiffresRequis BOOLEAN NOT NULL DEFAULT 1,
          caracteresSpeciauxRequis BOOLEAN NOT NULL DEFAULT 1,
          interdireMotsCommuns BOOLEAN NOT NULL DEFAULT 1
        )
      `
    };

    // Simulation de l'exécution des requêtes de création
    console.log('📋 Tables simulées créées:', Object.keys(tables));
  }

  private insertDefaultData() {
    const isInitialized = localStorage.getItem(this.storageKeys.initialized);
    
    if (!isInitialized) {
      // Utilisateurs par défaut
      const defaultUsers: Utilisateur[] = [
        {
          id: '1',
          nom: 'Administrateur',
          prenom: 'System',
          email: 'admin@stock.com',
          motDePasse: 'hello',
          role: 'admin',
          actif: true,
          dateCreation: new Date(),
          doitChangerMotDePasse: true
        },
        {
          id: '2',
          nom: 'Dupont',
          prenom: 'Jean',
          email: 'jean.dupont@stock.com',
          motDePasse: 'hello',
          role: 'magasinier',
          actif: true,
          dateCreation: new Date(),
          doitChangerMotDePasse: true
        }
      ];

      // Articles par défaut
      const now = new Date();
      const defaultArticles: Article[] = [
        {
          id: '1',
          reference: 'REF-001',
          designation: 'Ordinateur portable',
          description: 'Ordinateur portable Dell Latitude',
          quantiteInitiale: 10,
          quantiteActuelle: 8,
          seuilCritique: 2,
          dateCreation: now,
          derniereModification: now
        },
        {
          id: '2',
          reference: 'REF-002',
          designation: 'Souris optique',
          description: 'Souris optique USB',
          quantiteInitiale: 50,
          quantiteActuelle: 45,
          seuilCritique: 10,
          dateCreation: now,
          derniereModification: now
        },
        {
          id: '3',
          reference: 'REF-003',
          designation: 'Clavier sans fil',
          description: 'Clavier sans fil Bluetooth',
          quantiteInitiale: 25,
          quantiteActuelle: 20,
          seuilCritique: 5,
          dateCreation: now,
          derniereModification: now
        }
      ];

      // Politique de mot de passe par défaut
      const defaultPasswordPolicy: PolitiqueMotDePasse = {
        longueurMinimale: 8,
        majusculesRequises: true,
        minusculesRequises: true,
        chiffresRequis: true,
        caracteresSpeciauxRequis: true,
        interdireMotsCommuns: true
      };

      // Sauvegarder dans localStorage (simulation SQLite)
      localStorage.setItem(this.storageKeys.utilisateurs, JSON.stringify(defaultUsers));
      localStorage.setItem(this.storageKeys.articles, JSON.stringify(defaultArticles));
      localStorage.setItem(this.storageKeys.bonsAttribution, JSON.stringify([]));
      localStorage.setItem(this.storageKeys.mouvements, JSON.stringify([]));
      localStorage.setItem(this.storageKeys.politique, JSON.stringify(defaultPasswordPolicy));
      localStorage.setItem(this.storageKeys.initialized, 'true');

      console.log('📊 Données par défaut insérées dans la simulation "db"');
    }
  }

  private initializeLocalStorage() {
    console.log('💾 Utilisation de localStorage pour la persistance des données');
    this.insertDefaultData();
  }

  // Méthodes pour les utilisateurs
  getUtilisateurs(): Utilisateur[] {
    try {
      const data = localStorage.getItem(this.storageKeys.utilisateurs);
      const utilisateurs = data ? JSON.parse(data) : [];
      return utilisateurs.map((utilisateur: any) => ({
        ...utilisateur,
        dateCreation: new Date(utilisateur.dateCreation),
        derniereConnexion: utilisateur.derniereConnexion ? new Date(utilisateur.derniereConnexion) : undefined
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      return [];
    }
  }

  ajouterUtilisateur(utilisateur: Utilisateur): void {
    try {
      const utilisateurs = this.getUtilisateurs();
      utilisateurs.push(utilisateur);
      localStorage.setItem(this.storageKeys.utilisateurs, JSON.stringify(utilisateurs));
      console.log('👤 Utilisateur ajouté à la base simulée "db"');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'utilisateur:', error);
    }
  }

  modifierUtilisateur(id: string, utilisateurData: Partial<Utilisateur>): void {
    try {
      const utilisateurs = this.getUtilisateurs();
      const index = utilisateurs.findIndex(u => u.id === id);
      if (index !== -1) {
        utilisateurs[index] = { ...utilisateurs[index], ...utilisateurData };
        localStorage.setItem(this.storageKeys.utilisateurs, JSON.stringify(utilisateurs));
        console.log('✏️  Utilisateur modifié dans la base simulée "db"');
      }
    } catch (error) {
      console.error('Erreur lors de la modification de l\'utilisateur:', error);
    }
  }

  supprimerUtilisateur(id: string): void {
    try {
      const utilisateurs = this.getUtilisateurs();
      const filtered = utilisateurs.filter(u => u.id !== id);
      localStorage.setItem(this.storageKeys.utilisateurs, JSON.stringify(filtered));
      console.log('🗑️  Utilisateur supprimé de la base simulée "db"');
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    }
  }

  // Méthodes pour les articles
  getArticles(): Article[] {
    try {
      const data = localStorage.getItem(this.storageKeys.articles);
      const articles = data ? JSON.parse(data) : [];
      return articles.map((article: any) => ({
        ...article,
        dateCreation: new Date(article.dateCreation),
        derniereModification: new Date(article.derniereModification)
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des articles:', error);
      return [];
    }
  }

  ajouterArticle(article: Article): void {
    try {
      const articles = this.getArticles();
      articles.push(article);
      localStorage.setItem(this.storageKeys.articles, JSON.stringify(articles));
      console.log('📦 Article ajouté à la base simulée "db"');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'article:', error);
    }
  }

  modifierArticle(id: string, articleData: Partial<Article>): void {
    try {
      const articles = this.getArticles();
      const index = articles.findIndex(a => a.id === id);
      if (index !== -1) {
        articles[index] = { ...articles[index], ...articleData };
        localStorage.setItem(this.storageKeys.articles, JSON.stringify(articles));
        console.log('✏️  Article modifié dans la base simulée "db"');
      }
    } catch (error) {
      console.error('Erreur lors de la modification de l\'article:', error);
    }
  }

  supprimerArticle(id: string): void {
    try {
      // Supprimer les mouvements liés
      const mouvements = this.getMouvements();
      const filteredMouvements = mouvements.filter(m => m.articleId !== id);
      localStorage.setItem(this.storageKeys.mouvements, JSON.stringify(filteredMouvements));
      
      // Supprimer les bons d'attribution liés
      const bons = this.getBonsAttribution();
      const filteredBons = bons.filter(b => b.articleId !== id);
      localStorage.setItem(this.storageKeys.bonsAttribution, JSON.stringify(filteredBons));
      
      // Supprimer l'article
      const articles = this.getArticles();
      const filtered = articles.filter(a => a.id !== id);
      localStorage.setItem(this.storageKeys.articles, JSON.stringify(filtered));
      
      console.log('🗑️  Article et données liées supprimés de la base simulée "db"');
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'article:', error);
    }
  }

  // Méthodes pour les bons d'attribution
  getBonsAttribution(): BonAttribution[] {
    try {
      const data = localStorage.getItem(this.storageKeys.bonsAttribution);
      const bons = data ? JSON.parse(data) : [];
      return bons.map((bon: any) => ({
        ...bon,
        dateAttribution: new Date(bon.dateAttribution)
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des bons d\'attribution:', error);
      return [];
    }
  }

  ajouterBonAttribution(bon: BonAttribution): void {
    try {
      const bons = this.getBonsAttribution();
      bons.push(bon);
      localStorage.setItem(this.storageKeys.bonsAttribution, JSON.stringify(bons));
      console.log('📄 Bon d\'attribution ajouté à la base simulée "db"');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du bon d\'attribution:', error);
    }
  }

  modifierBonAttribution(id: string, bonData: Partial<BonAttribution>): void {
    try {
      const bons = this.getBonsAttribution();
      const index = bons.findIndex(b => b.id === id);
      if (index !== -1) {
        bons[index] = { ...bons[index], ...bonData };
        localStorage.setItem(this.storageKeys.bonsAttribution, JSON.stringify(bons));
        console.log('✏️  Bon d\'attribution modifié dans la base simulée "db"');
      }
    } catch (error) {
      console.error('Erreur lors de la modification du bon d\'attribution:', error);
    }
  }

  // Méthodes pour les mouvements
  getMouvements(): Mouvement[] {
    try {
      const data = localStorage.getItem(this.storageKeys.mouvements);
      const mouvements = data ? JSON.parse(data) : [];
      return mouvements.map((mouvement: any) => ({
        ...mouvement,
        date: new Date(mouvement.date)
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des mouvements:', error);
      return [];
    }
  }

  ajouterMouvement(mouvement: Mouvement): void {
    try {
      const mouvements = this.getMouvements();
      mouvements.push(mouvement);
      localStorage.setItem(this.storageKeys.mouvements, JSON.stringify(mouvements));
      console.log('📈 Mouvement ajouté à la base simulée "db"');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du mouvement:', error);
    }
  }

  // Méthodes pour la politique de mot de passe
  getPolitiqueMotDePasse(): PolitiqueMotDePasse {
    try {
      const data = localStorage.getItem(this.storageKeys.politique);
      return data ? JSON.parse(data) : {
        longueurMinimale: 8,
        majusculesRequises: true,
        minusculesRequises: true,
        chiffresRequis: true,
        caracteresSpeciauxRequis: true,
        interdireMotsCommuns: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la politique de mot de passe:', error);
      return {
        longueurMinimale: 8,
        majusculesRequises: true,
        minusculesRequises: true,
        chiffresRequis: true,
        caracteresSpeciauxRequis: true,
        interdireMotsCommuns: true
      };
    }
  }

  modifierPolitiqueMotDePasse(politique: PolitiqueMotDePasse): void {
    try {
      localStorage.setItem(this.storageKeys.politique, JSON.stringify(politique));
      console.log('🔒 Politique de mot de passe modifiée dans la base simulée "db"');
    } catch (error) {
      console.error('Erreur lors de la modification de la politique de mot de passe:', error);
    }
  }

  // Méthodes utilitaires
  getArticleById(id: string): Article | null {
    const articles = this.getArticles();
    return articles.find(a => a.id === id) || null;
  }

  // Méthode pour fermer la connexion à la base de données
  close(): void {
    if (this.db) {
      console.log('🔌 Fermeture de la connexion à la base simulée "db"');
      this.db = null;
    }
  }

  // Méthode pour exécuter des requêtes SQL personnalisées (simulation)
  executeQuery(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        console.log(`🔍 Simulation requête SQL sur "db": ${sql}`, params);
        // Simulation d'exécution de requête
        resolve({ success: true, message: 'Requête exécutée avec succès' });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Méthode pour obtenir des statistiques de la base de données
  getStats(): any {
    return {
      database: 'db (SQLite simulé avec localStorage)',
      environment: 'WebContainer (navigateur)',
      storage: 'localStorage',
      utilisateurs: this.getUtilisateurs().length,
      articles: this.getArticles().length,
      bonsAttribution: this.getBonsAttribution().length,
      mouvements: this.getMouvements().length,
      initialized: localStorage.getItem(this.storageKeys.initialized) === 'true',
      note: 'SQLite natif non disponible dans WebContainer'
    };
  }
}

export default DatabaseManager;