import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CatalogPage from './pages/CatalogPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import CartDrawer from './components/CartDrawer';
import WalletDepositModal from './components/WalletDepositModal';
import PaymentGatewayModal from './components/PaymentGatewayModal';
import AuthModals from './components/AuthModals';
import { CheckCircle2, AlertCircle } from 'lucide-react';

function AppContent() {
  const { toast } = useAuth();
  const [currentPage, setCurrentPage] = useState('catalog'); // 'catalog' | 'profile' | 'admin'
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [activePaymentProcess, setActivePaymentProcess] = useState(null);

  const handleSelectCategory = (cat) => {
    setActiveCategory(cat);
    setCurrentPage('catalog');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Toast Notification */}
      {toast && (
        <div className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        onNavigate={setCurrentPage}
        currentPage={currentPage}
      />

      {/* Page Routing */}
      <main style={{ flexGrow: 1 }}>
        {currentPage === 'catalog' && (
          <CatalogPage
            activeCategory={activeCategory}
            onSelectCategory={handleSelectCategory}
          />
        )}

        {currentPage === 'profile' && <ProfilePage />}

        {currentPage === 'admin' && <AdminDashboardPage />}
      </main>

      {/* Global Drawers & Modals */}
      <CartDrawer />
      <WalletDepositModal onStartPaymentProcess={(paymentData) => setActivePaymentProcess(paymentData)} />
      
      {activePaymentProcess && (
        <PaymentGatewayModal
          paymentData={activePaymentProcess}
          onClose={() => setActivePaymentProcess(null)}
        />
      )}

      <AuthModals />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
