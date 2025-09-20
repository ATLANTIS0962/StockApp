import React, { useState } from 'react';
import { useStock } from '../contexts/StockContext';
import ChangerMotDePasse from './ChangerMotDePasse';
import PolitiqueMotDePasseComponent from './PolitiqueMotDePasse';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  History, 
  Users, 
  Bell, 
  User, 
  LogOut,
  Lock,
  Shield,
  Menu,
  X
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange }) => {
  const { utilisateurConnecte, deconnexion, alertesStock } = useStock();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showPasswordPolicy, setShowPasswordPolicy] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
    { id: 'articles', label: 'Articles', icon: Package },
    { id: 'bons', label: 'Bons d\'Attribution', icon: FileText },
    { id: 'mouvements', label: 'Historique', icon: History },
  ];

  if (utilisateurConnecte?.role === 'admin') {
    menuItems.push({ id: 'utilisateurs', label: 'Utilisateurs', icon: Users });
  }

  const handleLogout = () => {
    deconnexion();
    window.location.reload();
  };

  // Vérifier si l'utilisateur doit changer son mot de passe
  React.useEffect(() => {
    if (utilisateurConnecte?.doitChangerMotDePasse) {
      setShowChangePassword(true);
    }
  }, [utilisateurConnecte]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-4 bg-blue-600 text-white">
          <h1 className="text-lg font-bold">Stock Manager</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="mt-4 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3 mb-2 text-left rounded-lg transition-colors ${
                  currentPage === item.id
                    ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} className="mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-4 bg-white shadow-sm">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden mr-4"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-semibold text-gray-800">
              {menuItems.find(item => item.id === currentPage)?.label || 'Tableau de Bord'}
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <Bell size={20} className="text-gray-600" />
              {alertesStock.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {alertesStock.length}
                </span>
              )}
            </div>
            
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <User size={20} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {utilisateurConnecte?.prenom} {utilisateurConnecte?.nom}
                  </span>
                </div>
              </button>
              
              {/* Menu déroulant utilisateur */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowChangePassword(true);
                        setShowUserMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Lock size={16} className="mr-2" />
                      Changer le mot de passe
                    </button>
                    
                    {utilisateurConnecte?.role === 'admin' && (
                      <button
                        onClick={() => {
                          setShowPasswordPolicy(true);
                          setShowUserMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Shield size={16} className="mr-2" />
                        Politique de mot de passe
                      </button>
                    )}
                    
                    <hr className="my-1" />
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} className="mr-2" />
                      Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Alerte changement de mot de passe requis */}
        {utilisateurConnecte?.doitChangerMotDePasse && !showChangePassword && (
          <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Lock size={20} className="text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-800">
                  Vous devez changer votre mot de passe pour des raisons de sécurité.
                </span>
              </div>
              <button
                onClick={() => setShowChangePassword(true)}
                className="text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors"
              >
                Changer maintenant
              </button>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Modals */}
      {showChangePassword && (
        <ChangerMotDePasse
          onClose={() => setShowChangePassword(false)}
          forceChange={utilisateurConnecte?.doitChangerMotDePasse}
        />
      )}
      
      {showPasswordPolicy && (
        <PolitiqueMotDePasseComponent
          onClose={() => setShowPasswordPolicy(false)}
        />
      )}
      
      {/* Fermer le menu utilisateur en cliquant ailleurs */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
};

export default Layout;