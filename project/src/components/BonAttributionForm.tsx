import React, { useState, useEffect } from 'react';
import { useStock } from '../contexts/StockContext';
import { Article } from '../types';
import { X, Save, FileText, Package, User, Plus, Trash2, Minus } from 'lucide-react';

interface BonAttributionFormProps {
  onClose: () => void;
}

interface ArticleSelection {
  articleId: string;
  designation: string;
  quantiteSortie: number;
  stockDisponible: number;
}

const BonAttributionForm: React.FC<BonAttributionFormProps> = ({ onClose }) => {
  const { articles, creerBonAttribution, utilisateurConnecte } = useStock();
  const [formData, setFormData] = useState({
    numerobon: '',
    destinataire: '',
    utilisateur: utilisateurConnecte?.prenom + ' ' + utilisateurConnecte?.nom || '',
    statut: 'en_attente' as const
  });

  const [selectedArticles, setSelectedArticles] = useState<ArticleSelection[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Générer automatiquement un numéro de bon
    const now = new Date();
    const numero = `BON-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Date.now().toString().slice(-4)}`;
    setFormData(prev => ({ ...prev, numerobon: numero }));
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.numerobon.trim()) {
      newErrors.numerobon = 'Le numéro de bon est requis';
    }

    if (selectedArticles.length === 0) {
      newErrors.articles = 'Veuillez sélectionner au moins un article';
    }

    if (!formData.destinataire.trim()) {
      newErrors.destinataire = 'Le destinataire est requis';
    }

    // Vérifier les quantités
    selectedArticles.forEach((item, index) => {
      if (item.quantiteSortie <= 0) {
        newErrors[`quantite_${index}`] = 'La quantité doit être supérieure à 0';
      }
      if (item.quantiteSortie > item.stockDisponible) {
        newErrors[`quantite_${index}`] = `Stock insuffisant (disponible: ${item.stockDisponible})`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    creerBonAttribution({
      numerobon: formData.numerobon,
      articles: selectedArticles.map(item => ({
        articleId: item.articleId,
        designation: item.designation,
        quantiteSortie: item.quantiteSortie
      })),
      destinataire: formData.destinataire,
      utilisateur: formData.utilisateur,
      statut: formData.statut
    });
    
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addArticle = () => {
    setSelectedArticles(prev => [...prev, {
      articleId: '',
      designation: '',
      quantiteSortie: 1,
      stockDisponible: 0
    }]);
  };

  const removeArticle = (index: number) => {
    setSelectedArticles(prev => prev.filter((_, i) => i !== index));
    // Nettoyer les erreurs pour cet article
    const newErrors = { ...errors };
    delete newErrors[`quantite_${index}`];
    setErrors(newErrors);
  };

  const updateArticle = (index: number, field: keyof ArticleSelection, value: string | number) => {
    setSelectedArticles(prev => {
      const updated = [...prev];
      if (field === 'articleId' && typeof value === 'string') {
        const article = articles.find(a => a.id === value);
        if (article) {
          updated[index] = {
            ...updated[index],
            articleId: value,
            designation: article.designation,
            stockDisponible: article.quantiteActuelle
          };
        }
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });

    // Nettoyer l'erreur pour ce champ
    if (errors[`quantite_${index}`]) {
      setErrors(prev => ({ ...prev, [`quantite_${index}`]: '' }));
    }
  };

  const articlesDisponibles = articles.filter(article => 
    article.quantiteActuelle > 0 && 
    !selectedArticles.some(selected => selected.articleId === article.id)
  );

  const totalQuantite = selectedArticles.reduce((sum, item) => sum + item.quantiteSortie, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText size={20} className="mr-2" />
            Nouveau Bon d'Attribution
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Informations générales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de Bon *
                </label>
                <input
                  type="text"
                  name="numerobon"
                  value={formData.numerobon}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.numerobon ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="BON-20231201-0001"
                />
                {errors.numerobon && (
                  <p className="text-red-500 text-sm mt-1">{errors.numerobon}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destinataire *
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    name="destinataire"
                    value={formData.destinataire}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.destinataire ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Nom du destinataire"
                  />
                </div>
                {errors.destinataire && (
                  <p className="text-red-500 text-sm mt-1">{errors.destinataire}</p>
                )}
              </div>
            </div>

            {/* Sélection des articles */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Package size={20} className="mr-2" />
                  Articles à attribuer
                </h3>
                <button
                  type="button"
                  onClick={addArticle}
                  className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <Plus size={16} className="mr-1" />
                  Ajouter un article
                </button>
              </div>

              {errors.articles && (
                <p className="text-red-500 text-sm mb-4">{errors.articles}</p>
              )}

              <div className="space-y-4">
                {selectedArticles.map((item, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Article #{index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeArticle(index)}
                        className="text-red-600 hover:text-red-800"
                        title="Supprimer cet article"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Article *
                        </label>
                        <select
                          value={item.articleId}
                          onChange={(e) => updateArticle(index, 'articleId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Sélectionner un article</option>
                          {articlesDisponibles.map(article => (
                            <option key={article.id} value={article.id}>
                              {article.designation} - Stock: {article.quantiteActuelle}
                            </option>
                          ))}
                          {item.articleId && !articlesDisponibles.find(a => a.id === item.articleId) && (
                            <option value={item.articleId}>
                              {item.designation} - Stock: {item.stockDisponible}
                            </option>
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantité *
                        </label>
                        <input
                          type="number"
                          value={item.quantiteSortie}
                          onChange={(e) => updateArticle(index, 'quantiteSortie', Number(e.target.value))}
                          min="1"
                          max={item.stockDisponible}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[`quantite_${index}`] ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="Quantité"
                        />
                        {errors[`quantite_${index}`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`quantite_${index}`]}</p>
                        )}
                      </div>
                    </div>

                    {item.articleId && (
                      <div className="mt-3 text-sm text-gray-600">
                        <span>Stock disponible: <strong>{item.stockDisponible}</strong></span>
                      </div>
                    )}
                  </div>
                ))}

                {selectedArticles.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Package size={48} className="mx-auto mb-4 text-gray-400" />
                    <p>Aucun article sélectionné</p>
                    <p className="text-sm">Cliquez sur "Ajouter un article" pour commencer</p>
                  </div>
                )}
              </div>
            </div>

            {/* Résumé */}
            {selectedArticles.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Résumé du bon</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Nombre d'articles:</span>
                    <span className="ml-2 font-medium">{selectedArticles.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Quantité totale:</span>
                    <span className="ml-2 font-medium">{totalQuantite}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Destinataire:</span>
                    <span className="ml-2 font-medium">{formData.destinataire || 'Non défini'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Créé par:</span>
                    <span className="ml-2 font-medium">{formData.utilisateur}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Utilisateur (lecture seule) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Créé par
              </label>
              <input
                type="text"
                value={formData.utilisateur}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
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
              Créer le Bon
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BonAttributionForm;