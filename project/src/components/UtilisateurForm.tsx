import React, { useState, useEffect } from 'react';
import { useStock } from '../contexts/StockContext';
import { Utilisateur } from '../types';
import { validerMotDePasse, genererMotDePasseAleatoire } from '../utils/auth';
import { X, Save, User, Eye, EyeOff, RefreshCw, AlertCircle } from 'lucide-react';

interface UtilisateurFormProps {
  utilisateur?: Utilisateur | null;
  onClose: () => void;
}

const UtilisateurForm: React.FC<UtilisateurFormProps> = ({ utilisateur, onClose }) => {
  const { ajouterUtilisateur, modifierUtilisateur, politiqueMotDePasse } = useStock();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    role: 'utilisateur' as Utilisateur['role'],
    actif: true,
    doitChangerMotDePasse: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [passwordGenerated, setPasswordGenerated] = useState(false);

  useEffect(() => {
    if (utilisateur) {
      setFormData({
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        motDePasse: '', // Ne pas pré-remplir le mot de passe
        role: utilisateur.role,
        actif: utilisateur.actif,
        doitChangerMotDePasse: utilisateur.doitChangerMotDePasse
      });
    }
  }, [utilisateur]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }

    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    // Validation du mot de passe pour les nouveaux utilisateurs
    if (!utilisateur && formData.motDePasse) {
      const validation = validerMotDePasse(formData.motDePasse, politiqueMotDePasse);
      if (!validation.valide) {
        newErrors.motDePasse = validation.erreurs.join(', ');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Si c'est un nouvel utilisateur et qu'aucun mot de passe n'est fourni, en générer un
    if (!utilisateur && !formData.motDePasse) {
      const motDePasseGenere = genererMotDePasseAleatoire();
      setFormData(prev => ({ ...prev, motDePasse: motDePasseGenere }));
      setPasswordGenerated(true);
      alert(`Mot de passe généré automatiquement : ${motDePasseGenere}\nVeuillez le noter et le communiquer à l'utilisateur.`);
      return;
    }

    if (utilisateur) {
      // Pour la modification, ne pas inclure le mot de passe s'il est vide
      const updateData = { ...formData };
      if (!updateData.motDePasse) {
        delete updateData.motDePasse;
      }
      modifierUtilisateur(utilisateur.id, updateData);
    } else {
      ajouterUtilisateur(formData);
    }
    
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const genererMotDePasse = () => {
    const motDePasseGenere = genererMotDePasseAleatoire();
    setFormData(prev => ({ ...prev, motDePasse: motDePasseGenere }));
    setPasswordGenerated(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <User size={20} className="mr-2" />
            {utilisateur ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom *
                </label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.prenom ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Prénom"
                />
                {errors.prenom && (
                  <p className="text-red-500 text-sm mt-1">{errors.prenom}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.nom ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Nom"
                />
                {errors.nom && (
                  <p className="text-red-500 text-sm mt-1">{errors.nom}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="email@exemple.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            
            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {utilisateur ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe *'}
              </label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="motDePasse"
                    value={formData.motDePasse}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.motDePasse ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder={utilisateur ? "Nouveau mot de passe" : "Mot de passe"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {!utilisateur && (
                  <button
                    type="button"
                    onClick={genererMotDePasse}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                    title="Générer un mot de passe"
                  >
                    <RefreshCw size={16} />
                  </button>
                )}
              </div>
              {errors.motDePasse && (
                <p className="text-red-500 text-sm mt-1">{errors.motDePasse}</p>
              )}
              {passwordGenerated && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="flex items-center">
                    <AlertCircle size={16} className="text-yellow-600 mr-2" />
                    <p className="text-sm text-yellow-800">
                      Mot de passe généré automatiquement. Veuillez le noter et le communiquer à l'utilisateur.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rôle *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="utilisateur">Utilisateur</option>
                <option value="magasinier">Magasinier</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="actif"
                  checked={formData.actif}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">
                  Utilisateur actif
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="doitChangerMotDePasse"
                  checked={formData.doitChangerMotDePasse}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">
                  Doit changer le mot de passe à la prochaine connexion
                </label>
              </div>
            </div>
            
            {/* Politique de mot de passe */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Exigences du mot de passe :</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Au moins {politiqueMotDePasse.longueurMinimale} caractères</li>
                {politiqueMotDePasse.majusculesRequises && <li>• Au moins une majuscule (A-Z)</li>}
                {politiqueMotDePasse.minusculesRequises && <li>• Au moins une minuscule (a-z)</li>}
                {politiqueMotDePasse.chiffresRequis && <li>• Au moins un chiffre (0-9)</li>}
                {politiqueMotDePasse.caracteresSpeciauxRequis && <li>• Au moins un caractère spécial (!@#$%^&*)</li>}
                {politiqueMotDePasse.interdireMotsCommuns && <li>• Éviter les mots de passe communs</li>}
              </ul>
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
              {utilisateur ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UtilisateurForm;