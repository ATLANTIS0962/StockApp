import React, { useState } from 'react';
import { StockProvider, useStock } from './contexts/StockContext';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Articles from './components/Articles';
import BonsAttribution from './components/BonsAttribution';
import Mouvements from './components/Mouvements';
import Utilisateurs from './components/Utilisateurs';

const AppContent: React.FC = () => {
  const { utilisateurConnecte } = useStock();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!utilisateurConnecte) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'articles':
        return <Articles />;
      case 'bons':
        return <BonsAttribution />;
      case 'mouvements':
        return <Mouvements />;
      case 'utilisateurs':
        return <Utilisateurs />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

function App() {
  return (
    <StockProvider>
      <AppContent />
    </StockProvider>
  );
}

export default App;