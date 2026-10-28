import React from 'react';
import { Gamepad2, ShieldCheck, Zap, Lock, Headphones } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      background: 'rgba(5, 7, 15, 0.95)',
      borderTop: '1px solid var(--border-color)',
      padding: '3rem 0 1.5rem 0',
      marginTop: 'auto'
    }}>
      <div className="container">
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2rem',
          marginBottom: '2.5rem'
        }}>
          {/* Brand Col - ROBUX SHOP */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
              <img 
                src="/logo.png" 
                alt="ROBUX SHOP" 
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  objectFit: 'contain',
                  boxShadow: '0 0 12px rgba(56, 189, 248, 0.35)',
                  border: '1px solid rgba(80, 118, 141, 0.4)'
                }}
              />
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFF' }}>
                ROBUX <span style={{ color: 'var(--primary)' }}>SHOP</span>
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              La plataforma oficial más rápida y segura para la compra de Robux en Roblox con pagos en Bolívares.
            </p>
          </div>

          {/* Guarantee 1 */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Zap color="var(--primary)" size={24} style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFF', marginBottom: '0.2rem' }}>Recarga Inmediata</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Acreditación en 1-5 minutos directa a tu cuenta.</p>
            </div>
          </div>

          {/* Guarantee 2 */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <ShieldCheck color="var(--success)" size={24} style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFF', marginBottom: '0.2rem' }}>100% Seguro Sin Ban</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Procesos legítimos verificados por el Administrador.</p>
            </div>
          </div>

          {/* Guarantee 3 */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Headphones color="var(--primary)" size={24} style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFF', marginBottom: '0.2rem' }}>Atención por WhatsApp</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Atención directa al cliente para concretar tu recarga.</p>
            </div>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem' }} />

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8rem',
          color: 'var(--text-dim)'
        }}>
          <div>
            ROBUX SHOP © 2026 - Todos los derechos reservados.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Lock size={14} color="var(--success)" />
            <span>Conexión Encriptada SSL</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
