import React, { useState, useEffect } from 'react';
import { useStock } from '../contexts/StockContext';
import { Article } from '../types';
import { X, Save, Package } from 'lucide-react';

interface ArticleFormProps {
  article?: Article | null;
  onClose: () => void;
}

const ArticleForm: React.FC<ArticleFormProps> = ({ article, onClose }) => {
  const { ajouterArticle, modifierArticle } = useStock();
  const [formData, setFormData] = useState({
    reference: '',
    designation: '',
    description: '',
    quantiteInitiale: 0,
    quantiteActuelle: 0,
    seuilCritique: 0
  });

  useEffect(() => {
    if (article) {
      setFormData({
        reference: article.reference,
        designation: article.designation,
        description: article.description,
        quantiteInitiale: article.quantiteInitiale,
        quantiteActuelle: article.quantiteActuelle,
        seuilCritique: article.seuilCritique
      });
    }
  }, [article]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (article) {
      modifierArticle(article.id, formData);
    } else {
      ajouterArticle({
        ...formData,
        quantiteActuelle: formData.quantiteInitiale
      });
    }
    
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('quantite') || name === 'seuilCritique' ? Number(value) : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Package size={20} className="mr-2" />
            {article ? 'Modifier l\'article' : 'Nouvel article'}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Référence *
              </label>
              <input
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="REF-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Désignation *
              </label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nom de l'article"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Description détaillée de l'article"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantité {article ? 'Actuelle' : 'Initiale'} *
                </label>
                <input
                  type="number"
                  name={article ? "quantiteActuelle" : "quantiteInitiale"}
                  value={article ? formData.quantiteActuelle : formData.quantiteInitiale}
                  onChange={handleInputChange}
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seuil Critique *
                </label>
                <input
                  type="number"
                  name="seuilCritique"
                  value={formData.seuilCritique}
                  onChange={handleInputChange}
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {article && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantité Initiale
                </label>
                <input
                  type="number"
                  name="quantiteInitiale"
                  value={formData.quantiteInitiale}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
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
              {article ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArticleForm;