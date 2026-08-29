import React, { useState, useEffect } from 'react';
import { ShoppingCart, Wallet, User, LogOut, Zap, Gamepad2, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { apiService } from '../services/api';

export default function Navbar({ activeCategory, onSelectCategory, onNavigate, currentPage }) {
  const { user, logout, setAuthModal, setWalletModalOpen } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const [usdtRate, setUsdtRate] = useState(42.50);

  useEffect(() => {
    apiService.getSettings()
      .then(res => {
        if (res.success && res.settings && res.settings.usdtRate) {
          setUsdtRate(parseFloat(res.settings.usdtRate));
        }
      })
      .catch(err => console.error('Error fetching rate for navbar:', err));
  }, []);

  const balanceInBs = ((parseFloat(user?.walletBalance || 0)) * usdtRate).toFixed(2);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(7, 9, 19, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0.85rem 0'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand Logo - ROBLUX */}
        <div 
          onClick={() => onNavigate('catalog')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Gamepad2 size={24} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.1rem' }}>
              ROB<span style={{ color: 'var(--primary)' }}>LUX</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Tienda Oficial de Roblox
            </div>
          </div>
        </div>

        {/* Category Navigation Links */}
        <nav style={{ display: 'flex', gap: '0.5rem' }}>
          {['Todos', 'Robux', 'Armas Virtuales', 'Combos'].map(cat => (
            <button
              key={cat}
              onClick={() => {
                onNavigate('catalog');
                onSelectCategory(cat);
              }}
              className={`btn btn-sm ${activeCategory === cat && currentPage === 'catalog' ? 'btn-primary' : 'btn-outline'}`}
              style={{ borderRadius: '20px' }}
            >
              {cat === 'Robux' && <Zap size={14} />}
              {cat}
            </button>
          ))}
        </nav>

        {/* User Profile & Balance & Cart Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          
          {user ? (
            <>
              {/* User Balance Badge - EXCLUSIVELY IN BS ("Mi Saldo") */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 215, 0, 0.08)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                borderRadius: '30px',
                padding: '0.3rem 0.4rem 0.3rem 0.85rem',
                gap: '0.6rem'
              }}>
                <Wallet size={16} color="var(--accent-gold)" />
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mi Saldo</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                    Bs. {balanceInBs}
                  </span>
                </div>
                <button
                  onClick={() => setWalletModalOpen(true)}
                  className="btn btn-gold btn-sm"
                  style={{ borderRadius: '20px', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                >
                  <PlusCircle size={14} /> Recargar
                </button>
              </div>

              {/* User Dropdown / Profile Button */}
              <button
                onClick={() => onNavigate('profile')}
                className={`btn btn-sm ${currentPage === 'profile' ? 'btn-primary' : 'btn-outline'}`}
                style={{ borderRadius: '30px', gap: '0.5rem' }}
              >
                <User size={16} />
                <span>{user.username}</span>
              </button>

              <button
                onClick={logout}
                title="Cerrar Sesión"
                className="btn btn-outline btn-sm"
                style={{ borderRadius: '50%', width: '38px', height: '38px', padding: 0 }}
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setAuthModal('login')}
                className="btn btn-outline btn-sm"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => setAuthModal('register')}
                className="btn btn-primary btn-sm"
              >
                Registrarse
              </button>
            </div>
          )}

          {/* Cart Drawer Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: '30px', position: 'relative', padding: '0.55rem 1rem' }}
          >
            <ShoppingCart size={18} />
            {totalItems > 0 && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                background: '#FF0055',
                color: '#FFF',
                fontSize: '0.75rem',
                fontWeight: 800,
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px #FF0055'
              }}>
                {totalItems}
              </span>
            )}
          </button>

        </div>

      </div>
    </header>
  );
}
