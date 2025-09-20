import React, { useState } from 'react';
import { useStock } from '../contexts/StockContext';
import { Article } from '../types';
import { Plus, Edit, Trash2, Package, AlertTriangle, Search, Filter } from 'lucide-react';
import ArticleForm from './ArticleForm';

const Articles: React.FC = () => {
  const { articles, supprimerArticle, utilisateurConnecte } = useStock();
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'critical' | 'out'>('all');

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.reference.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = stockFilter === 'all' || 
                         (stockFilter === 'low' && article.quantiteActuelle <= article.seuilCritique && article.quantiteActuelle > 0) ||
                         (stockFilter === 'critical' && article.quantiteActuelle <= article.seuilCritique * 0.5 && article.quantiteActuelle > 0) ||
                         (stockFilter === 'out' && article.quantiteActuelle <= 0);
    
    return matchesSearch && matchesFilter;
  });

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      supprimerArticle(id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingArticle(null);
  };

  const getStockStatus = (article: Article) => {
    if (article.quantiteActuelle <= 0) return { status: 'out', color: 'text-red-600', bg: 'bg-red-50' };
    if (article.quantiteActuelle <= article.seuilCritique * 0.5) return { status: 'critical', color: 'text-red-600', bg: 'bg-red-50' };
    if (article.quantiteActuelle <= article.seuilCritique) return { status: 'low', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { status: 'good', color: 'text-green-600', bg: 'bg-green-50' };
  };

  const canEdit = utilisateurConnecte?.role === 'admin' || utilisateurConnecte?.role === 'magasinier';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
        {canEdit && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Nouvel Article
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par désignation ou référence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les stocks</option>
              <option value="low">Stock faible</option>
              <option value="critical">Stock critique</option>
              <option value="out">Rupture de stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Package size={20} className="text-blue-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Total Articles</p>
              <p className="text-xl font-bold text-gray-900">{articles.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <AlertTriangle size={20} className="text-orange-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Stock Faible</p>
              <p className="text-xl font-bold text-orange-600">
                {articles.filter(a => a.quantiteActuelle <= a.seuilCritique && a.quantiteActuelle > 0).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <AlertTriangle size={20} className="text-red-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Stock Critique</p>
              <p className="text-xl font-bold text-red-600">
                {articles.filter(a => a.quantiteActuelle <= a.seuilCritique * 0.5 && a.quantiteActuelle > 0).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Trash2 size={20} className="text-red-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Rupture</p>
              <p className="text-xl font-bold text-red-600">
                {articles.filter(a => a.quantiteActuelle <= 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des articles */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Référence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Actuel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seuil Critique
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière Modification
                </th>
                {canEdit && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredArticles.map((article) => {
                const stockStatus = getStockStatus(article);
                return (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{article.designation}</div>
                        <div className="text-sm text-gray-500">{article.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {article.reference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {article.quantiteActuelle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {article.seuilCritique}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${stockStatus.bg} ${stockStatus.color}`}>
                        {stockStatus.status === 'out' ? 'Rupture' :
                         stockStatus.status === 'critical' ? 'Critique' :
                         stockStatus.status === 'low' ? 'Faible' : 'Normal'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(article.derniereModification).toLocaleDateString('fr-FR')}
                    </td>
                    {canEdit && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(article)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(article.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Aucun article trouvé</p>
          </div>
        )}
      </div>

      {/* Formulaire d'ajout/modification */}
      {showForm && (
        <ArticleForm
          article={editingArticle}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default Articles;