import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import RobuxCalculator from '../components/RobuxCalculator';

export default function CatalogPage() {
  const [usdtRate, setUsdtRate] = useState(42.50);
  const [bannerNotice, setBannerNotice] = useState('¡Recargas de Robux activas las 24 horas!');

  useEffect(() => {
    apiService.getSettings()
      .then(settingsRes => {
        if (settingsRes.success && settingsRes.settings) {
          if (settingsRes.settings.usdtRate) {
            setUsdtRate(parseFloat(settingsRes.settings.usdtRate));
          }
          if (settingsRes.settings.bannerNotice) {
            setBannerNotice(settingsRes.settings.bannerNotice);
          }
        }
      })
      .catch(err => console.error('Error fetching settings:', err));
  }, []);

  return (
    <div style={{ paddingBottom: '4rem' }}>
      
      {/* HERO BANNER SECTION */}
      <section style={{
        position: 'relative',
        background: 'linear-gradient(180deg, rgba(80, 118, 141, 0.2) 0%, rgba(10, 18, 26, 0) 100%)',
        padding: '3rem 0 2rem 0',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          
          {/* Brand Icon Emblem */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <div style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              padding: '4px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.5) 0%, rgba(80, 118, 141, 0.3) 100%)',
              boxShadow: '0 0 30px rgba(56, 189, 248, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src="/logo.png" 
                alt="ROBUX SHOP" 
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'contain'
                }}
              />
            </div>
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            color: '#FFF',
            marginBottom: '1rem'
          }}>
            Recarga <span style={{ color: 'var(--primary)' }}>Robux</span> Oficiales <br />
            <span style={{ color: '#9BB8CD' }}>Acreditación Directa e Instantánea</span>
          </h1>

          <p style={{
            fontSize: '1.05rem',
            color: 'var(--text-muted)',
            maxWidth: '640px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            {bannerNotice} Precios en Bolívares y entrega inmediata.
          </p>

        </div>
      </section>

      {/* ROBUX INTERACTIVE CALCULATOR */}
      <section className="container" style={{ marginTop: '2.5rem' }}>
        <RobuxCalculator usdtRate={usdtRate} />
      </section>

    </div>
  );
}
