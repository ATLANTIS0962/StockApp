import React, { useState } from 'react';
import { useStock } from '../contexts/StockContext';
import { PolitiqueMotDePasse } from '../types';
import { X, Save, Shield, Settings } from 'lucide-react';

interface PolitiqueMotDePasseProps {
  onClose: () => void;
}

const PolitiqueMotDePasseComponent: React.FC<PolitiqueMotDePasseProps> = ({ onClose }) => {
  const { politiqueMotDePasse, modifierPolitiqueMotDePasse } = useStock();
  const [formData, setFormData] = useState<PolitiqueMotDePasse>(politiqueMotDePasse);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    modifierPolitiqueMotDePasse(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Shield size={20} className="mr-2" />
            Politique de Mot de Passe
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
            {/* Longueur minimale */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longueur minimale
              </label>
              <input
                type="number"
                name="longueurMinimale"
                value={formData.longueurMinimale}
                onChange={handleInputChange}
                min="4"
                max="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Options de complexité */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Exigences de complexité</h3>
              
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="majusculesRequises"
                    checked={formData.majusculesRequises}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Majuscules requises (A-Z)</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="minusculesRequises"
                    checked={formData.minusculesRequises}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Minuscules requises (a-z)</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="chiffresRequis"
                    checked={formData.chiffresRequis}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Chiffres requis (0-9)</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="caracteresSpeciauxRequis"
                    checked={formData.caracteresSpeciauxRequis}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Caractères spéciaux requis (!@#$%^&*)</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="interdireMotsCommuns"
                    checked={formData.interdireMotsCommuns}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Interdire les mots de passe communs</span>
                </label>
              </div>
            </div>

            {/* Aperçu de la politique */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                <Settings size={16} className="mr-1" />
                Aperçu de la politique
              </h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Longueur minimale : {formData.longueurMinimale} caractères</p>
                {formData.majusculesRequises && <p>• Au moins une majuscule</p>}
                {formData.minusculesRequises && <p>• Au moins une minuscule</p>}
                {formData.chiffresRequis && <p>• Au moins un chiffre</p>}
                {formData.caracteresSpeciauxRequis && <p>• Au moins un caractère spécial</p>}
                {formData.interdireMotsCommuns && <p>• Interdiction des mots de passe communs</p>}
              </div>
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
              Sauvegarder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PolitiqueMotDePasseComponent;