import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share, CheckCircle2 } from 'lucide-react';

export default function InstallPwaBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(iosDevice);

    // Check if standalone PWA mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      setInstalled(true);
      return;
    }

    // Android / Chrome beforeinstallprompt event listener
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show iOS banner if iOS and not installed
    if (iosDevice && !isStandalone) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalled(true);
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide(!showIosGuide);
    }
  };

  if (!showBanner || installed) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.15) 0%, rgba(138, 43, 226, 0.2) 100%)',
      borderBottom: '1px solid var(--border-glow)',
      padding: '0.65rem 1rem',
      position: 'relative',
      zIndex: 99
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000'
          }}>
            <Smartphone size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFF' }}>
              Descarga la App BloxShop
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Acceso rápido desde la pantalla de tu teléfono
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={handleInstallClick}
            className="btn btn-primary btn-sm"
            style={{ borderRadius: '20px', padding: '0.35rem 0.85rem', fontSize: '0.78rem', gap: '0.4rem' }}
          >
            <Download size={14} /> Instalar App
          </button>
          
          <button
            onClick={() => setShowBanner(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.2rem'
            }}
          >
            <X size={18} />
          </button>
        </div>

      </div>

      {/* iOS Installation Guide Popup */}
      {showIosGuide && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid var(--primary)',
          borderRadius: '12px',
          padding: '0.85rem',
          marginTop: '0.5rem',
          fontSize: '0.8rem',
          color: '#FFF',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem'
        }}>
          <div style={{ fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Share size={16} /> Pasos para instalar en tu iPhone / Safari:
          </div>
          <div>1. Toca el botón <strong>Compartir (⎋)</strong> en la barra inferior de Safari.</div>
          <div>2. Desliza hacia abajo y presiona <strong>"Agregar a inicio" (+ ➕)</strong>.</div>
        </div>
      )}

    </div>
  );
}
