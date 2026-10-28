import React, { useState, useEffect } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, Wallet, Smartphone, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

export default function CartDrawer({ onOrderCreated }) {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, clearCart, totalAmount } = useCart();
  const { user, setAuthModal, setWalletModalOpen, refreshBalance, showToast } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState('wallet'); // 'wallet' | 'pago_movil'
  const [robloxUsername, setRobloxUsername] = useState(user?.robloxUsername || '');
  const [loading, setLoading] = useState(false);
  const [usdtRate, setUsdtRate] = useState(42.50);

  useEffect(() => {
    if (isCartOpen) {
      apiService.getSettings()
        .then(res => {
          if (res.success && res.settings && res.settings.usdtRate) {
            setUsdtRate(parseFloat(res.settings.usdtRate));
          }
        })
        .catch(err => console.error('Error fetching settings for cart:', err));
    }
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const userBalanceUsd = parseFloat(user?.walletBalance || 0);
  const userBalanceBs = (userBalanceUsd * usdtRate).toFixed(2);
  const totalInBs = (totalAmount * usdtRate).toFixed(2);
  const isInsufficientWallet = paymentMethod === 'wallet' && userBalanceUsd < totalAmount;

  const handleCheckout = async () => {
    if (!user) {
      showToast('Inicia sesión para poder procesar tu orden.', 'error');
      setAuthModal('login');
      return;
    }

    if (!robloxUsername.trim()) {
      showToast('Por favor ingresa tu Nombre de Usuario de Roblox.', 'error');
      return;
    }

    if (cartItems.length === 0) {
      showToast('Tu carrito está vacío.', 'error');
      return;
    }

    if (paymentMethod === 'wallet' && isInsufficientWallet) {
      showToast('Saldo insuficiente en tu cuenta. Por favor recarga saldo.', 'error');
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        items: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        })),
        paymentMethod: paymentMethod === 'wallet' ? 'wallet' : 'pago_movil',
        robloxTargetUser: robloxUsername.trim()
      };

      const res = await apiService.checkout(orderPayload);
      if (res.success) {
        showToast(res.message || '¡Orden procesada con éxito!');
        const createdOrder = res.order;
        clearCart();
        setIsCartOpen(false);
        refreshBalance();
        
        if (onOrderCreated) {
          onOrderCreated(createdOrder);
        }
      }
    } catch (err) {
      showToast(err.message || 'Error al procesar el pago.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 999,
      background: 'rgba(5, 7, 15, 0.8)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        height: '100%',
        background: '#0B0E17',
        borderLeft: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.8)',
        animation: 'slideLeft 0.3s ease-out'
      }}>
        {/* Drawer Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingBag color="var(--primary)" size={22} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFF' }}>Carrito de Compras</h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="btn btn-outline btn-sm"
            style={{ borderRadius: '50%', width: '36px', height: '36px', padding: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body - Items List EXCLUSIVELY IN BS */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '1.25rem' }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
              <ShoppingBag size={48} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.1rem', color: '#FFF', marginBottom: '0.5rem' }}>Tu carrito está vacío</h3>
              <p style={{ fontSize: '0.85rem' }}>Añade Robux o ítems legendarios para comenzar.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cartItems.map(item => {
                const itemTotalUsd = item.product.price * item.quantity;
                const itemTotalBs = (itemTotalUsd * usdtRate).toFixed(2);
                return (
                  <div 
                    key={item.product.id}
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '16px',
                      padding: '0.9rem',
                      display: 'flex',
                      gap: '0.85rem',
                      alignItems: 'center',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25)',
                      position: 'relative'
                    }}
                  >
                    {/* Left: Product Badge / Icon (replaces broken image) */}
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.25) 0%, rgba(0, 242, 254, 0.2) 100%)',
                      border: '1px solid rgba(0, 242, 254, 0.35)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      {item.product.imageUrl && !item.product.imageUrl.includes('unsplash') ? (
                        <img
                          src={item.product.imageUrl}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.nextElementSibling) {
                              e.currentTarget.nextElementSibling.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div style={{
                        display: (item.product.imageUrl && !item.product.imageUrl.includes('unsplash')) ? 'none' : 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%'
                      }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.5px' }}>
                          R$
                        </span>
                      </div>
                    </div>

                    {/* Middle: Title & Price */}
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        color: '#FFF',
                        marginBottom: '0.2rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {item.product.title}
                      </div>
                      <div style={{ fontSize: '0.98rem', color: 'var(--accent-gold)', fontWeight: 800 }}>
                        Bs. {itemTotalBs}
                      </div>
                    </div>

                    {/* Right: Quantity Stepper & Trash */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'rgba(15, 23, 42, 0.85)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '3px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                      }}>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'rgba(255, 255, 255, 0.06)',
                            color: '#FFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 242, 254, 0.2)'; e.currentTarget.style.color = 'var(--primary)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; e.currentTarget.style.color = '#FFF'; }}
                          title="Restar 1"
                        >
                          <Minus size={13} strokeWidth={2.5} />
                        </button>

                        <span style={{
                          fontSize: '0.88rem',
                          fontWeight: 800,
                          color: '#FFF',
                          minWidth: '26px',
                          textAlign: 'center',
                          userSelect: 'none'
                        }}>
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'rgba(255, 255, 255, 0.06)',
                            color: '#FFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 242, 254, 0.2)'; e.currentTarget.style.color = 'var(--primary)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; e.currentTarget.style.color = '#FFF'; }}
                          title="Sumar 1"
                        >
                          <Plus size={13} strokeWidth={2.5} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '10px',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          background: 'rgba(239, 68, 68, 0.12)',
                          color: '#FF6B6B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          flexShrink: 0
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'; e.currentTarget.style.borderColor = 'var(--danger)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'; }}
                        title="Eliminar producto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Drawer Footer & Checkout Controls */}
        {cartItems.length > 0 && (
          <div style={{
            padding: '1.25rem',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-surface)'
          }}>
            {/* Target Roblox User Input */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Usuario de Roblox para la Recarga:
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Ej: RobloxPlayer2026"
                value={robloxUsername}
                onChange={(e) => setRobloxUsername(e.target.value)}
              />
            </div>

            {/* Payment Method Selector */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Método de Pago:
              </label>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`btn btn-sm ${paymentMethod === 'wallet' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ justifyContent: 'flex-start', padding: '0.6rem 0.8rem' }}
                >
                  <Wallet size={16} /> Mi Saldo
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('pago_movil')}
                  className={`btn btn-sm ${paymentMethod === 'pago_movil' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ justifyContent: 'flex-start', padding: '0.6rem 0.8rem' }}
                >
                  <Smartphone size={16} /> Pago Móvil
                </button>
              </div>
            </div>

            {/* Insufficient balance warning card EXCLUSIVELY IN BS */}
            {paymentMethod === 'wallet' && user && isInsufficientWallet && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid var(--danger)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem',
                marginBottom: '1rem',
                fontSize: '0.8rem',
                color: '#FF8888',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>Saldo insuficiente en tu cuenta (Bs. {userBalanceBs})</span>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setWalletModalOpen(true);
                  }}
                  className="btn btn-gold btn-sm"
                  style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem' }}
                >
                  Recargar Saldo
                </button>
              </div>
            )}

            {/* TOTAL PRICE SUMMARY EXCLUSIVELY IN BS */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '0.85rem',
              borderRadius: '8px'
            }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total a Pagar:</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                Bs. {totalInBs}
              </span>
            </div>

            {/* Final Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={loading || (paymentMethod === 'wallet' && isInsufficientWallet)}
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
            >
              {loading ? 'Procesando Orden...' : `Pagar Ahora (Bs. ${totalInBs})`}
              <ArrowRight size={18} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
