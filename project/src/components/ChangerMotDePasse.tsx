import React, { useState } from 'react';
import { useStock } from '../contexts/StockContext';
import { validerMotDePasse, POLITIQUE_MOT_DE_PASSE_DEFAUT } from '../utils/auth';
import { X, Save, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

interface ChangerMotDePasseProps {
  onClose: () => void;
  forceChange?: boolean;
}

const ChangerMotDePasse: React.FC<ChangerMotDePasseProps> = ({ onClose, forceChange = false }) => {
  const { changerMotDePasse, utilisateurConnecte } = useStock();
  const [formData, setFormData] = useState({
    motDePasseActuel: '',
    nouveauMotDePasse: '',
    confirmerMotDePasse: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    actuel: false,
    nouveau: false,
    confirmer: false
  });
  const [erreurs, setErreurs] = useState<string[]>([]);
  const [chargement, setChargement] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErreurs([]);
  };

  const toggleShowPassword = (field: 'actuel' | 'nouveau' | 'confirmer') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChargement(true);
    setErreurs([]);

    try {
      // Validation du nouveau mot de passe
      const validation = validerMotDePasse(formData.nouveauMotDePasse);
      if (!validation.valide) {
        setErreurs(validation.erreurs);
        return;
      }

      // Vérifier que les mots de passe correspondent
      if (formData.nouveauMotDePasse !== formData.confirmerMotDePasse) {
        setErreurs(['Les mots de passe ne correspondent pas']);
        return;
      }

      // Changer le mot de passe
      const success = await changerMotDePasse(
        formData.motDePasseActuel,
        formData.nouveauMotDePasse
      );

      if (success) {
        onClose();
      } else {
        setErreurs(['Mot de passe actuel incorrect']);
      }
    } catch (error) {
      setErreurs(['Une erreur est survenue lors du changement de mot de passe']);
      console.error('Erreur changement mot de passe:', error);
    } finally {
      setChargement(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    const validation = validerMotDePasse(password);
    const score = validation.valide ? 100 : Math.max(0, 100 - (validation.erreurs.length * 20));
    
    if (score >= 80) return { level: 'Fort', color: 'text-green-600', bg: 'bg-green-500' };
    if (score >= 60) return { level: 'Moyen', color: 'text-yellow-600', bg: 'bg-yellow-500' };
    if (score >= 40) return { level: 'Faible', color: 'text-orange-600', bg: 'bg-orange-500' };
    return { level: 'Très faible', color: 'text-red-600', bg: 'bg-red-500' };
  };

  const passwordStrength = getPasswordStrength(formData.nouveauMotDePasse);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Lock size={20} className="mr-2" />
            {forceChange ? 'Changement de mot de passe requis' : 'Changer le mot de passe'}
          </h2>
          {!forceChange && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          )}
        </div>

        {forceChange && (
          <div className="p-4 bg-yellow-50 border-b">
            <div className="flex items-center">
              <AlertCircle size={20} className="text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800">
                Vous devez changer votre mot de passe pour continuer.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Mot de passe actuel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe actuel *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.actuel ? 'text' : 'password'}
                  name="motDePasseActuel"
                  value={formData.motDePasseActuel}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Entrez votre mot de passe actuel"
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword('actuel')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.actuel ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Nouveau mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nouveau mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.nouveau ? 'text' : 'password'}
                  name="nouveauMotDePasse"
                  value={formData.nouveauMotDePasse}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Entrez votre nouveau mot de passe"
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword('nouveau')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.nouveau ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {/* Indicateur de force du mot de passe */}
              {formData.nouveauMotDePasse && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Force du mot de passe:</span>
                    <span className={passwordStrength.color}>{passwordStrength.level}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full ${passwordStrength.bg} transition-all duration-300`}
                      style={{ width: `${Math.max(20, (100 - erreurs.length * 20))}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirmer le mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le nouveau mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirmer ? 'text' : 'password'}
                  name="confirmerMotDePasse"
                  value={formData.confirmerMotDePasse}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirmez votre nouveau mot de passe"
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword('confirmer')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirmer ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {/* Indicateur de correspondance */}
              {formData.confirmerMotDePasse && (
                <div className="mt-1 flex items-center text-sm">
                  {formData.nouveauMotDePasse === formData.confirmerMotDePasse ? (
                    <>
                      <CheckCircle size={16} className="text-green-600 mr-1" />
                      <span className="text-green-600">Les mots de passe correspondent</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={16} className="text-red-600 mr-1" />
                      <span className="text-red-600">Les mots de passe ne correspondent pas</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Politique de mot de passe */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Exigences du mot de passe :</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Au moins {POLITIQUE_MOT_DE_PASSE_DEFAUT.longueurMinimale} caractères</li>
                <li>• Au moins une majuscule (A-Z)</li>
                <li>• Au moins une minuscule (a-z)</li>
                <li>• Au moins un chiffre (0-9)</li>
                <li>• Au moins un caractère spécial (!@#$%^&*)</li>
                <li>• Éviter les mots de passe communs</li>
              </ul>
            </div>
          </div>

          {/* Erreurs */}
          {erreurs.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle size={20} className="text-red-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">Erreurs :</h4>
                  <ul className="text-sm text-red-700 mt-1 space-y-1">
                    {erreurs.map((erreur, index) => (
                      <li key={index}>• {erreur}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            {!forceChange && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
            )}
            <button
              type="submit"
              disabled={chargement}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
            >
              <Save size={16} className="mr-2" />
              {chargement ? 'Changement...' : 'Changer le mot de passe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangerMotDePasse;