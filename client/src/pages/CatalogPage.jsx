import React, { useState, useEffect } from 'react';
import { Search, Zap, Gamepad2 } from 'lucide-react';
import { apiService } from '../services/api';
import ProductCard from '../components/ProductCard';
import RobuxCalculator from '../components/RobuxCalculator';

export default function CatalogPage({ activeCategory, onSelectCategory }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [usdtRate, setUsdtRate] = useState(42.50);
  const [bannerNotice, setBannerNotice] = useState('¡Recargas de Robux activas las 24 horas!');

  useEffect(() => {
    fetchCatalogAndSettings();
  }, [activeCategory]);

  const fetchCatalogAndSettings = async () => {
    setLoading(true);
    try {
      const [prodRes, settingsRes] = await Promise.all([
        apiService.getProducts({ category: activeCategory }),
        apiService.getSettings()
      ]);

      if (prodRes.success) {
        setProducts(prodRes.products);
      }

      if (settingsRes.success && settingsRes.settings) {
        if (settingsRes.settings.usdtRate) {
          setUsdtRate(parseFloat(settingsRes.settings.usdtRate));
        }
        if (settingsRes.settings.bannerNotice) {
          setBannerNotice(settingsRes.settings.bannerNotice);
        }
      }
    } catch (err) {
      console.error('Error fetching catalog data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = 
      activeCategory === 'Todos' ||
      activeCategory === 'Robux' ||
      p.category.toLowerCase() === activeCategory.toLowerCase() ||
      (p.subcategory && p.subcategory.toLowerCase() === activeCategory.toLowerCase());
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ paddingBottom: '4rem' }}>
      
      {/* HERO BANNER SECTION (CLEANED - NO TASA DEL DIA RIBBON) */}
      <section style={{
        position: 'relative',
        background: 'linear-gradient(180deg, rgba(138, 43, 226, 0.15) 0%, rgba(7, 9, 19, 0) 100%)',
        padding: '3.5rem 0 2.5rem 0',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            color: '#FFF',
            marginBottom: '1rem'
          }}>
            Recarga <span style={{ color: 'var(--primary)' }}>Robux</span> Oficiales <br />
            <span style={{ color: '#C084FC' }}>Acreditación Directa e Instantánea</span>
          </h1>

          <p style={{
            fontSize: '1.05rem',
            color: 'var(--text-muted)',
            maxWidth: '640px',
            margin: '0 auto 2rem auto',
            lineHeight: 1.6
          }}>
            {bannerNotice} Precios en Bolívares y entrega inmediata.
          </p>

          {/* Search Bar */}
          <div style={{
            maxWidth: '540px',
            margin: '0 auto',
            position: 'relative'
          }}>
            <Search 
              size={20} 
              color="var(--text-muted)" 
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} 
            />
            <input
              type="text"
              className="input-field"
              placeholder="Buscar paquete de Robux (ej: 800 Robux, 2000 Robux, Bonus)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: '3rem',
                height: '52px',
                borderRadius: '30px',
                fontSize: '0.95rem',
                boxShadow: 'var(--shadow-glow)'
              }}
            />
          </div>

        </div>
      </section>

      {/* ROBUX INTERACTIVE CALCULATOR & STORE GRID */}
      <section className="container" style={{ marginTop: '2rem' }}>
        
        {/* Dynamic Calculator */}
        <RobuxCalculator usdtRate={usdtRate} />

        {/* Section Header for Predefined Packages */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="badge badge-purple" style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem' }}>
              <Zap size={15} style={{ marginRight: '0.35rem' }} /> Paquetes Predefinidos de Robux
            </span>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Mostrando <strong>{filteredProducts.length}</strong> paquetes disponibles
          </div>
        </div>

        {/* Product Grid Container */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>Cargando catálogo oficial...</div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <Gamepad2 size={48} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.2rem', color: '#FFF', marginBottom: '0.5rem' }}>No se encontraron productos</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Intenta buscar con otro nombre o selecciona la categoría "Todos".
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
            gap: '1.75rem'
          }}>
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                usdtRate={usdtRate}
              />
            ))}
          </div>
        )}

      </section>

    </div>
  );
}
