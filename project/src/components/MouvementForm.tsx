import React, { useState } from 'react';
import { useStock } from '../contexts/StockContext';
import { X, Save, Package, TrendingUp, TrendingDown } from 'lucide-react';

interface MouvementFormProps {
  onClose: () => void;
}

const MouvementForm: React.FC<MouvementFormProps> = ({ onClose }) => {
  const { articles, ajouterMouvement, utilisateurConnecte } = useStock();
  const [formData, setFormData] = useState({
    articleId: '',
    type: 'entree' as 'entree' | 'sortie',
    quantite: 0,
    reference: '',
    utilisateur: utilisateurConnecte?.prenom + ' ' + utilisateurConnecte?.nom || '',
    commentaire: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.articleId) {
      newErrors.articleId = 'Veuillez sélectionner un article';
    }

    if (!formData.quantite || formData.quantite <= 0) {
      newErrors.quantite = 'La quantité doit être supérieure à 0';
    }

    const selectedArticle = articles.find(a => a.id === formData.articleId);
    if (formData.type === 'sortie' && selectedArticle && formData.quantite > selectedArticle.quantiteActuelle) {
      newErrors.quantite = `Stock insuffisant (disponible: ${selectedArticle.quantiteActuelle})`;
    }

    if (!formData.reference.trim()) {
      newErrors.reference = 'La référence est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    ajouterMouvement({
      articleId: formData.articleId,
      type: formData.type,
      quantite: formData.quantite,
      reference: formData.reference,
      utilisateur: formData.utilisateur,
      commentaire: formData.commentaire
    });
    
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantite' ? Number(value) : value
    }));
    
    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const selectedArticle = articles.find(a => a.id === formData.articleId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Package size={20} className="mr-2" />
            Nouveau Mouvement de Stock
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Type de mouvement */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de Mouvement *
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="entree"
                    checked={formData.type === 'entree'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <TrendingUp size={16} className="text-green-600 mr-1" />
                  Entrée
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="sortie"
                    checked={formData.type === 'sortie'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <TrendingDown size={16} className="text-red-600 mr-1" />
                  Sortie
                </label>
              </div>
            </div>

            {/* Sélection de l'article */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Article *
              </label>
              <select
                name="articleId"
                value={formData.articleId}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.articleId ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Sélectionner un article</option>
                {articles.map(article => (
                  <option key={article.id} value={article.id}>
                    {article.designation} - Stock: {article.quantiteActuelle}
                  </option>
                ))}
              </select>
              {errors.articleId && (
                <p className="text-red-500 text-sm mt-1">{errors.articleId}</p>
              )}
            </div>

            {/* Informations sur l'article sélectionné */}
            {selectedArticle && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Package size={16} className="text-blue-600 mr-2" />
                  <h4 className="font-medium text-blue-900">Informations Article</h4>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Référence:</span>
                    <span className="ml-2 font-medium">{selectedArticle.reference}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Stock actuel:</span>
                    <span className="ml-2 font-medium">{selectedArticle.quantiteActuelle}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quantité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantité *
              </label>
              <input
                type="number"
                name="quantite"
                value={formData.quantite}
                onChange={handleInputChange}
                min="1"
                max={formData.type === 'sortie' ? selectedArticle?.quantiteActuelle : undefined}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.quantite ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Quantité"
              />
              {errors.quantite && (
                <p className="text-red-500 text-sm mt-1">{errors.quantite}</p>
              )}
            </div>

            {/* Référence */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Référence/Bon de Commande *
              </label>
              <input
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.reference ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Référence du mouvement"
              />
              {errors.reference && (
                <p className="text-red-500 text-sm mt-1">{errors.reference}</p>
              )}
            </div>

            {/* Utilisateur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Utilisateur
              </label>
              <input
                type="text"
                name="utilisateur"
                value={formData.utilisateur}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                readOnly
              />
            </div>

            {/* Commentaire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Commentaire
              </label>
              <textarea
                name="commentaire"
                value={formData.commentaire}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Commentaire optionnel"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Save size={16} className="mr-2" />
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MouvementForm;