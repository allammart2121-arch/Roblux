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
        <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 10 }}>
          <span className="badge badge-purple" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            {product.badge}
          </span>
        </div>
      )}

      {/* Product Image Container */}
      <div style={{
        width: '100%',
        height: '200px',
        position: 'relative',
        overflow: 'hidden',
        background: '#070913'
      }}>
        <img
          src={product.imageUrl || DEFAULT_FALLBACK_IMAGE}
          alt={product.title}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease'
          }}
          className="product-image"
        />

        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(11, 14, 23, 0.95) 0%, transparent 60%)'
        }} />

        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          <Clock size={14} color="var(--primary)" />
          <span>{product.deliveryTime || 'Instantánea (1-5 min)'}</span>
        </div>
      </div>

      {/* Product Content Body */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
          {product.category}
        </div>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFF', marginBottom: '0.5rem', lineHeight: 1.3 }}>
          {product.title}
        </h3>

        <p style={{
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
          marginBottom: '1rem',
          flexGrow: 1,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {product.description}
        </p>

        {/* PRICE DISPLAY EXCLUSIVELY IN BS */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'auto',
          paddingTop: '0.75rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Precio</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
              Bs. {priceInBs}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`btn btn-sm ${isOutOfStock ? 'btn-outline' : 'btn-primary'}`}
            style={{ borderRadius: '20px', padding: '0.5rem 0.85rem' }}
          >
            <ShoppingCart size={16} />
            {isOutOfStock ? 'Agotado' : 'Añadir'}
          </button>
        </div>

      </div>
    </div>
  );
}
