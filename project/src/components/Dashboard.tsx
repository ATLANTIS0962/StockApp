import React from 'react';
import { useStock } from '../contexts/StockContext';
import { Package, FileText, TrendingUp, AlertTriangle, Users, Activity, Database } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { articles, bonsAttribution, mouvements, alertesStock, utilisateurs } = useStock();

  // Calculs des statistiques
  const totalArticles = articles.length;
  const totalBons = bonsAttribution.length;
  const bonsEnAttente = bonsAttribution.filter(b => b.statut === 'en_attente').length;
  const totalMouvements = mouvements.length;
  const utilisateursActifs = utilisateurs.filter(u => u.actif).length;

  // Mouvements récents
  const mouvementsRecents = mouvements
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Articles les plus mouvementés
  const articlesPopulaires = articles
    .map(article => ({
      ...article,
      mouvements: mouvements.filter(m => m.articleId === article.id).length
    }))
    .sort((a, b) => b.mouvements - a.mouvements)
    .slice(0, 5);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    trend?: string;
  }> = ({ title, value, icon, color, trend }) => (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-1">
              <TrendingUp size={16} className="inline mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Alertes Stock */}
      {alertesStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <AlertTriangle size={20} className="text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-red-800">Alertes Stock</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {alertesStock.map((alerte) => (
              <div key={alerte.articleId} className="bg-white p-3 rounded border-l-4 border-red-500">
                <p className="font-medium text-gray-900">{alerte.designation}</p>
                <p className="text-sm text-gray-600">
                  Stock: {alerte.quantiteActuelle} / Seuil: {alerte.seuilCritique}
                </p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  alerte.niveau === 'rupture' ? 'bg-red-100 text-red-800' :
                  alerte.niveau === 'critique' ? 'bg-orange-100 text-orange-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {alerte.niveau}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Articles"
          value={totalArticles}
          icon={<Package size={24} className="text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Bons d'Attribution"
          value={totalBons}
          icon={<FileText size={24} className="text-white" />}
          color="bg-green-500"
        />
        <StatCard
          title="En Attente"
          value={bonsEnAttente}
          icon={<AlertTriangle size={24} className="text-white" />}
          color="bg-orange-500"
        />
        <StatCard
          title="Utilisateurs Actifs"
          value={utilisateursActifs}
          icon={<Users size={24} className="text-white" />}
          color="bg-purple-500"
        />
      </div>

      {/* Graphiques et statistiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mouvements récents */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity size={20} className="mr-2" />
            Mouvements Récents
          </h3>
          <div className="space-y-3">
            {mouvementsRecents.length > 0 ? (
              mouvementsRecents.map((mouvement) => {
                const article = articles.find(a => a.id === mouvement.articleId);
                return (
                  <div key={mouvement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-gray-900">{article?.designation}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(mouvement.date).toLocaleDateString('fr-FR')} - {mouvement.utilisateur}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        mouvement.type === 'entree' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {mouvement.type === 'entree' ? '+' : '-'}{mouvement.quantite}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-4">Aucun mouvement récent</p>
            )}
          </div>
        </div>

        {/* Articles populaires */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp size={20} className="mr-2" />
            Articles les Plus Mouvementés
          </h3>
          <div className="space-y-3">
            {articlesPopulaires.length > 0 ? (
              articlesPopulaires.map((article, index) => (
                <div key={article.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mr-3">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{article.designation}</p>
                      <p className="text-sm text-gray-600">Stock: {article.quantiteActuelle}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">
                      {article.mouvements} mouvements
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Aucun article trouvé</p>
            )}
          </div>
        </div>
      </div>

      {/* Statistiques supplémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Mouvements ce Mois</h4>
          <p className="text-2xl font-bold text-gray-900">{totalMouvements}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Alertes Actives</h4>
          <p className="text-2xl font-bold text-red-600">{alertesStock.length}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;