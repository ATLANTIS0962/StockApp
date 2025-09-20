import React, { useState } from 'react';
import { useStock } from '../contexts/StockContext';
import { Mouvement } from '../types';
import { Plus, History, TrendingUp, TrendingDown, Search, Filter, Calendar, User, Package } from 'lucide-react';
import MouvementForm from './MouvementForm';

const Mouvements: React.FC = () => {
  const { mouvements, articles, utilisateurConnecte } = useStock();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'entree' | 'sortie'>('all');
  const [dateFilter, setDateFilter] = useState('');

  const filteredMouvements = mouvements.filter(mouvement => {
    const article = articles.find(a => a.id === mouvement.articleId);
    const matchesSearch = article?.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article?.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mouvement.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mouvement.utilisateur.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || mouvement.type === typeFilter;
    
    const matchesDate = !dateFilter || 
                       new Date(mouvement.date).toISOString().split('T')[0] === dateFilter;
    
    return matchesSearch && matchesType && matchesDate;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const canAddMouvement = utilisateurConnecte?.role === 'admin' || utilisateurConnecte?.role === 'magasinier';

  const totalEntrees = mouvements.filter(m => m.type === 'entree').reduce((sum, m) => sum + m.quantite, 0);
  const totalSorties = mouvements.filter(m => m.type === 'sortie').reduce((sum, m) => sum + m.quantite, 0);
  const totalMouvements = mouvements.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Historique des Mouvements</h1>
        {canAddMouvement && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Nouveau Mouvement
          </button>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Entrées</p>
              <p className="text-2xl font-bold text-green-600">{totalEntrees}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sorties</p>
              <p className="text-2xl font-bold text-red-600">{totalSorties}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <TrendingDown size={24} className="text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Mouvements</p>
              <p className="text-2xl font-bold text-blue-600">{totalMouvements}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <History size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par article, référence ou utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les types</option>
              <option value="entree">Entrées</option>
              <option value="sortie">Sorties</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-gray-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Liste des mouvements */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Référence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commentaire
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMouvements.map((mouvement) => {
                const article = articles.find(a => a.id === mouvement.articleId);
                return (
                  <tr key={mouvement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(mouvement.date).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package size={16} className="text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {article?.designation || 'Article supprimé'}
                          </div>
                          <div className="text-sm text-gray-500">{article?.reference}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        mouvement.type === 'entree' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {mouvement.type === 'entree' ? 'Entrée' : 'Sortie'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`font-medium ${
                        mouvement.type === 'entree' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {mouvement.type === 'entree' ? '+' : '-'}{mouvement.quantite}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {mouvement.reference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User size={16} className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{mouvement.utilisateur}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {mouvement.commentaire}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredMouvements.length === 0 && (
          <div className="text-center py-12">
            <History size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Aucun mouvement trouvé</p>
          </div>
        )}
      </div>

      {/* Formulaire de nouveau mouvement */}
      {showForm && (
        <MouvementForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
};

export default Mouvements;