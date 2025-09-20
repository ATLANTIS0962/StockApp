import React, { useState } from 'react';
import { useStock } from '../contexts/StockContext';
import { BonAttribution } from '../types';
import { Plus, FileText, Eye, Check, X, Calendar, User, Package, Search, Filter, Clock, Printer } from 'lucide-react';
import BonAttributionForm from './BonAttributionForm';
import BonPrint from './BonPrint';

const BonsAttribution: React.FC = () => {
  const { bonsAttribution, articles, validerBonAttribution, annulerBonAttribution, utilisateurConnecte } = useStock();
  const [showForm, setShowForm] = useState(false);
  const [selectedBon, setSelectedBon] = useState<BonAttribution | null>(null);
  const [printBon, setPrintBon] = useState<BonAttribution | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'en_attente' | 'valide' | 'annule'>('all');

  const filteredBons = bonsAttribution.filter(bon => {
    const matchesSearch = bon.numerobon.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bon.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bon.destinataire.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || bon.statut === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleValidate = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir valider ce bon d\'attribution ?')) {
      validerBonAttribution(id);
    }
  };

  const handleCancel = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce bon d\'attribution ?')) {
      annulerBonAttribution(id);
    }
  };

  const getStatusColor = (statut: BonAttribution['statut']) => {
    switch (statut) {
      case 'en_attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'valide':
        return 'bg-green-100 text-green-800';
      case 'annule':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (statut: BonAttribution['statut']) => {
    switch (statut) {
      case 'en_attente':
        return 'En attente';
      case 'valide':
        return 'Validé';
      case 'annule':
        return 'Annulé';
      default:
        return 'Inconnu';
    }
  };

  const canCreateBon = utilisateurConnecte?.role === 'admin' || utilisateurConnecte?.role === 'magasinier';
  const canValidate = utilisateurConnecte?.role === 'admin' || utilisateurConnecte?.role === 'magasinier';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Bons d'Attribution</h1>
        {canCreateBon && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Nouveau Bon
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
                placeholder="Rechercher par numéro, article ou destinataire..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="valide">Validé</option>
              <option value="annule">Annulé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <FileText size={20} className="text-blue-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Total Bons</p>
              <p className="text-xl font-bold text-gray-900">{bonsAttribution.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Clock size={20} className="text-yellow-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">En Attente</p>
              <p className="text-xl font-bold text-yellow-600">
                {bonsAttribution.filter(b => b.statut === 'en_attente').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Check size={20} className="text-green-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Validés</p>
              <p className="text-xl font-bold text-green-600">
                {bonsAttribution.filter(b => b.statut === 'valide').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <X size={20} className="text-red-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Annulés</p>
              <p className="text-xl font-bold text-red-600">
                {bonsAttribution.filter(b => b.statut === 'annule').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des bons */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Numéro Bon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Articles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité Totale
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destinataire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBons.map((bon) => (
                <tr key={bon.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {bon.numerobon}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="space-y-1">
                      {bon.articles.slice(0, 2).map((article, index) => (
                        <div key={index} className="text-sm">
                          {article.designation}
                        </div>
                      ))}
                      {bon.articles.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{bon.articles.length - 2} autres...
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {bon.articles.reduce((sum, article) => sum + article.quantiteSortie, 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {bon.destinataire}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(bon.dateAttribution).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(bon.statut)}`}>
                      {getStatusLabel(bon.statut)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedBon(bon)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Voir les détails"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => setPrintBon(bon)}
                        className="text-purple-600 hover:text-purple-800"
                        title="Imprimer"
                      >
                        <Printer size={16} />
                      </button>
                      {canValidate && bon.statut === 'en_attente' && (
                        <>
                          <button
                            onClick={() => handleValidate(bon.id)}
                            className="text-green-600 hover:text-green-800"
                            title="Valider"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleCancel(bon.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Annuler"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredBons.length === 0 && (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Aucun bon d'attribution trouvé</p>
          </div>
        )}
      </div>

      {/* Formulaire de création */}
      {showForm && (
        <BonAttributionForm onClose={() => setShowForm(false)} />
      )}

      {/* Modal de détails */}
      {selectedBon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText size={20} className="mr-2" />
                Détails du Bon
              </h2>
              <button
                onClick={() => setSelectedBon(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Numéro Bon</p>
                  <p className="text-base text-gray-900">{selectedBon.numerobon}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="text-base text-gray-900">
                    {new Date(selectedBon.dateAttribution).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Destinataire</p>
                  <p className="text-base text-gray-900">{selectedBon.destinataire}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Utilisateur</p>
                  <p className="text-base text-gray-900">{selectedBon.utilisateur}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Statut</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedBon.statut)}`}>
                    {getStatusLabel(selectedBon.statut)}
                  </span>
                </div>
              </div>
              
              {/* Liste des articles */}
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500 mb-2">Articles ({selectedBon.articles.length})</p>
                <div className="space-y-2">
                  {selectedBon.articles.map((article, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded border-l-4 border-blue-500">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">{article.designation}</span>
                        <span className="text-sm text-gray-600">Qté: {article.quantiteSortie}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t">
                  <div className="flex justify-between items-center font-medium">
                    <span>Total:</span>
                    <span>{selectedBon.articles.reduce((sum, article) => sum + article.quantiteSortie, 0)} articles</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between space-x-3 p-6 border-t">
              <button
                onClick={() => setPrintBon(selectedBon)}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Printer size={16} className="mr-2" />
                Imprimer
              </button>
              <button
                onClick={() => setSelectedBon(null)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'impression */}
      {printBon && (
        <BonPrint
          bon={printBon}
          articles={articles}
          onClose={() => setPrintBon(null)}
        />
      )}
    </div>
  );
};

export default BonsAttribution;