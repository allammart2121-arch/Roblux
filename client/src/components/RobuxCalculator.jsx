import React, { useState } from 'react';
import { Calculator, Zap, ShoppingCart, ArrowRight, ShieldCheck, Sparkles, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function RobuxCalculator({ usdtRate = 792 }) {
  const { addToCart } = useCart();
  const { showToast } = useAuth();

  const [robuxAmount, setRobuxAmount] = useState(50);

  // Formula: Base 50 Robux = $0.50 + $0.10 = $0.60 ($0.01 per Robux + $0.10 USD)
  const calculatePriceUsd = (amount) => {
    const r = Math.max(1, parseInt(amount, 10) || 0);
    const usd = (r * 0.01) + 0.10;
    return Number(usd.toFixed(2));
  };

  const rateNum = parseFloat(usdtRate) || 792;
  const currentRobux = Math.max(1, parseInt(robuxAmount, 10) || 50);
  const priceUsd = calculatePriceUsd(currentRobux);
  const priceBs = (priceUsd * rateNum).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const quickPills = [50, 100, 200, 400, 800, 1000, 2000, 5000];

  const handleAddToCart = () => {
    if (currentRobux < 10) {
      showToast('La cantidad mínima es de 10 Robux.', 'error');
      return;
    }

    const calculatedProduct = {
      id: `robux-custom-${currentRobux}`,
      title: `${currentRobux.toLocaleString()} Robux`,
      category: 'Robux',
      subcategory: 'Robux',
      price: priceUsd,
      stock: 99999,
      badge: `${currentRobux} R$`,
      rating: 5.0,
      imageUrl: '',
      description: `Acreditación de ${currentRobux.toLocaleString()} Robux a tu cuenta de Roblox.`,
      deliveryTime: 'Instantánea (1-5 min)'
    };

    addToCart(calculatedProduct);
    showToast(`¡${currentRobux.toLocaleString()} Robux añadidos al carrito!`);
  };

  const handleStep = (delta) => {
    setRobuxAmount((prev) => {
      const current = parseInt(prev, 10) || 50;
      return Math.max(50, current + delta);
    });
  };

  return (
    <div
      className="glass-card"
      style={{
        maxWidth: '820px',
        margin: '0 auto 2.5rem auto',
        padding: '2rem',
        borderRadius: '24px',
        background: 'linear-gradient(145deg, rgba(16, 28, 42, 0.95) 0%, rgba(10, 18, 26, 0.95) 100%)',
        border: '1px solid rgba(80, 118, 141, 0.3)',
        boxShadow: '0 8px 32px rgba(10, 18, 26, 0.5)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Glow highlight */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '180px',
          height: '180px',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#04101A',
              boxShadow: '0 4px 15px rgba(56, 189, 248, 0.35)'
            }}
          >
            <Calculator size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFF', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              Calculadora de Robux <Sparkles size={18} color="var(--accent-gold)" />
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              Ingresa la cantidad que quieras o escoge un botón rápido
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Input Column + Result Card Column */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          alignItems: 'center'
        }}
      >
        {/* Left: Input & Stepper */}
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
            Cantidad de Robux (R$):
          </label>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <button
              type="button"
              onClick={() => handleStep(-50)}
              className="btn btn-outline"
              style={{
                borderRadius: '12px',
                width: '46px',
                height: '46px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
              title="Restar 50 Robux"
            >
              <Minus size={18} />
            </button>

            <div style={{ position: 'relative', flexGrow: 1 }}>
              <input
                type="number"
                min="10"
                step="10"
                className="input-field"
                value={robuxAmount}
                onChange={(e) => setRobuxAmount(e.target.value)}
                style={{
                  height: '48px',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#FFF',
                  textAlign: 'center',
                  background: 'rgba(7, 9, 19, 0.8)',
                  border: '1px solid var(--border-glow)',
                  borderRadius: '12px'
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '0.85rem',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  pointerEvents: 'none'
                }}
              >
                R$
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleStep(50)}
              className="btn btn-outline"
              style={{
                borderRadius: '12px',
                width: '46px',
                height: '46px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
              title="Sumar 50 Robux"
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Quick pills */}
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Cantidades Frecuentes:
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {quickPills.map((pill) => (
                <button
                  key={pill}
                  type="button"
                  onClick={() => setRobuxAmount(pill)}
                  className={`btn btn-sm ${currentRobux === pill ? 'btn-primary' : 'btn-outline'}`}
                  style={{
                    borderRadius: '16px',
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.65rem'
                  }}
                >
                  {pill} R$
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Calculated Price Box & Buy Button */}
        <div
          style={{
            background: 'rgba(7, 9, 19, 0.85)',
            border: '1px solid rgba(255, 215, 0, 0.25)',
            borderRadius: '16px',
            padding: '1.25rem',
            textAlign: 'center',
            boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>
            Total a Pagar en Bolívares
          </div>

          <div
            style={{
              fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
              fontWeight: 900,
              color: 'var(--accent-gold)',
              lineHeight: 1.1,
              marginBottom: '0.35rem'
            }}
          >
            Bs. {priceBs}
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span>Entrega en 1-5 min</span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="btn btn-primary btn-lg"
            style={{
              width: '100%',
              borderRadius: '30px',
              fontWeight: 800,
              fontSize: '0.95rem',
              boxShadow: '0 4px 18px rgba(56, 189, 248, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem'
            }}
          >
            <ShoppingCart size={18} />
            <span>Comprar {currentRobux.toLocaleString()} Robux</span>
          </button>
        </div>
      </div>
    </div>
  );
}
