import React from 'react';
import { ShoppingCart, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1614680376593-902f749f7cfc?auto=format&fit=crop&w=600&q=80';

export default function ProductCard({ product, usdtRate = 42.50 }) {
  const { addToCart } = useCart();
  const { showToast } = useAuth();

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      showToast('Producto agotado por el momento.', 'error');
      return;
    }
    addToCart(product);
    showToast(`¡"${product.title}" añadido al carrito!`);
  };

  const isOutOfStock = product.stock <= 0;
  const rateNum = parseFloat(usdtRate) || 42.50;
  const priceInBs = (product.price * rateNum).toFixed(2);

  return (
    <div 
      className="glass-card product-card-hover"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        opacity: isOutOfStock ? 0.75 : 1
      }}
    >
      {/* Badge Ribbon */}
      {product.badge && (
        <div className="product-card-badge" style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 10 }}>
          <span className="badge badge-purple" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.5)', fontSize: '0.7rem' }}>
            {product.badge}
          </span>
        </div>
      )}

      {/* Product Image Container - COMPLETE FULL IMAGE (CONTAIN) */}
      <div 
        className="product-card-img"
        style={{
          width: '100%',
          height: '150px',
          position: 'relative',
          overflow: 'hidden',
          background: 'rgba(5, 7, 15, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.5rem'
        }}
      >
        <img
          src={product.imageUrl || DEFAULT_FALLBACK_IMAGE}
          alt={product.title}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
          }}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain', // Entire full image visible!
            transition: 'transform 0.3s ease',
            borderRadius: '6px'
          }}
          className="product-image"
        />

        <div 
          className="product-card-delivery"
          style={{
            position: 'absolute',
            bottom: '6px',
            left: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            background: 'rgba(7, 9, 19, 0.75)',
            padding: '0.15rem 0.4rem',
            borderRadius: '10px'
          }}
        >
          <Clock size={12} color="var(--primary)" />
          <span>{product.deliveryTime || '1-5 min'}</span>
        </div>
      </div>

      {/* Product Content Body */}
      <div className="product-card-body" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>
          {product.category}
        </div>

        <h3 className="product-card-title" style={{ fontSize: '0.92rem', fontWeight: 800, color: '#FFF', marginBottom: '0.35rem', lineHeight: 1.25 }}>
          {product.title}
        </h3>

        {/* PRICE DISPLAY EXCLUSIVELY IN BS */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'auto',
          paddingTop: '0.4rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Precio</div>
            <div className="product-card-price" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
              Bs. {priceInBs}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`btn btn-sm ${isOutOfStock ? 'btn-outline' : 'btn-primary'}`}
            style={{ borderRadius: '20px', padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
          >
            <ShoppingCart size={14} />
            {isOutOfStock ? 'Agotado' : 'Añadir'}
          </button>
        </div>

      </div>
    </div>
  );
}
