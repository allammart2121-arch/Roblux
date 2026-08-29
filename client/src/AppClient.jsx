import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CatalogPage from './pages/CatalogPage';
import ProfilePage from './pages/ProfilePage';
import CartDrawer from './components/CartDrawer';
import WalletDepositModal from './components/WalletDepositModal';
import PaymentGatewayModal from './components/PaymentGatewayModal';
import WhatsAppSuccessModal from './components/WhatsAppSuccessModal';
import AuthModals from './components/AuthModals';
import { CheckCircle2, AlertCircle } from 'lucide-react';

function ClientContent() {
  const { toast } = useAuth();
  const [currentPage, setCurrentPage] = useState('catalog'); // 'catalog' | 'profile'
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [activePaymentProcess, setActivePaymentProcess] = useState(null);
  const [completedOrderForWhatsApp, setCompletedOrderForWhatsApp] = useState(null);

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

      {/* Pure Customer Navbar */}
      <Navbar
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        onNavigate={setCurrentPage}
        currentPage={currentPage}
      />

      {/* Customer Page Routing */}
      <main style={{ flexGrow: 1 }}>
        {currentPage === 'catalog' && (
          <CatalogPage
            activeCategory={activeCategory}
            onSelectCategory={handleSelectCategory}
          />
        )}

        {currentPage === 'profile' && <ProfilePage />}
      </main>

      {/* Global Customer Drawers & Modals */}
      <CartDrawer onOrderCreated={(order) => setCompletedOrderForWhatsApp(order)} />

      <WalletDepositModal onStartPaymentProcess={(paymentData) => setActivePaymentProcess(paymentData)} />
      
      {activePaymentProcess && (
        <PaymentGatewayModal
          paymentData={activePaymentProcess}
          onClose={() => setActivePaymentProcess(null)}
          onPaymentApproved={(tx) => setCompletedOrderForWhatsApp(tx)}
        />
      )}

      {/* Emerging WhatsApp Contact Popup for Approved Orders/Deposits */}
      {completedOrderForWhatsApp && (
        <WhatsAppSuccessModal
          orderData={completedOrderForWhatsApp}
          onClose={() => setCompletedOrderForWhatsApp(null)}
        />
      )}

      <AuthModals />

      {/* Customer Footer */}
      <Footer />
    </div>
  );
}

export default function AppClient() {
  return (
    <AuthProvider>
      <CartProvider>
        <ClientContent />
      </CartProvider>
    </AuthProvider>
  );
}
