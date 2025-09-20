import React, { useState } from 'react';
import { useStock } from '../contexts/StockContext';
import { Utilisateur } from '../types';
import { Plus, Edit, Trash2, Users, UserCheck, UserX, Search, Shield, Mail } from 'lucide-react';
import UtilisateurForm from './UtilisateurForm';

const Utilisateurs: React.FC = () => {
  const { utilisateurs, utilisateurConnecte, supprimerUtilisateur } = useStock();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUtilisateur, setEditingUtilisateur] = useState<Utilisateur | null>(null);

  const filteredUtilisateurs = utilisateurs.filter(user => 
    user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: Utilisateur['role']) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'magasinier':
        return 'bg-blue-100 text-blue-800';
      case 'utilisateur':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: Utilisateur['role']) => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'magasinier':
        return 'Magasinier';
      case 'utilisateur':
        return 'Utilisateur';
      default:
        return 'Inconnu';
    }
  };

  const isAdmin = utilisateurConnecte?.role === 'admin';

  const handleEdit = (utilisateur: Utilisateur) => {
    setEditingUtilisateur(utilisateur);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      supprimerUtilisateur(id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingUtilisateur(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
        {isAdmin && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Nouvel Utilisateur
          </button>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Users size={20} className="text-blue-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Total Utilisateurs</p>
              <p className="text-xl font-bold text-gray-900">{utilisateurs.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <UserCheck size={20} className="text-green-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Actifs</p>
              <p className="text-xl font-bold text-green-600">
                {utilisateurs.filter(u => u.actif).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Shield size={20} className="text-purple-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Administrateurs</p>
              <p className="text-xl font-bold text-purple-600">
                {utilisateurs.filter(u => u.role === 'admin').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Users size={20} className="text-blue-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Magasiniers</p>
              <p className="text-xl font-bold text-blue-600">
                {utilisateurs.filter(u => u.role === 'magasinier').length}
              </p>
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
                placeholder="Rechercher par nom, prénom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                {isAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUtilisateurs.map((utilisateur) => (
                <tr key={utilisateur.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {utilisateur.prenom[0]}{utilisateur.nom[0]}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {utilisateur.prenom} {utilisateur.nom}
                        </div>
                        <div className="text-sm text-gray-500">
                          {utilisateur.id === utilisateurConnecte?.id && '(Vous)'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Mail size={16} className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{utilisateur.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(utilisateur.role)}`}>
                      {getRoleLabel(utilisateur.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      utilisateur.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {utilisateur.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(utilisateur)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                        {utilisateur.id !== utilisateurConnecte?.id && (
                          <button
                            onClick={() => handleDelete(utilisateur.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUtilisateurs.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Aucun utilisateur trouvé</p>
          </div>
        )}
      </div>

      {/* Formulaire d'ajout/modification */}
      {showForm && (
        <UtilisateurForm
          utilisateur={editingUtilisateur}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default Utilisateurs;