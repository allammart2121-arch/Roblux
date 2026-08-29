import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, Gamepad2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModals() {
  const { authModal, setAuthModal, login, register, showToast } = useAuth();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRobloxUsername, setRegRobloxUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [loading, setLoading] = useState(false);

  if (!authModal) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email: loginEmail, password: loginPassword });
    } catch (err) {
      showToast(err.message || 'Error al iniciar sesión.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({
        username: regUsername,
        email: regEmail,
        robloxUsername: regRobloxUsername,
        password: regPassword
      });
    } catch (err) {
      showToast(err.message || 'Error al registrar usuario.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '2.25rem',
        position: 'relative',
        boxShadow: 'var(--shadow-glow)'
      }}>
        <button
          onClick={() => setAuthModal(null)}
          className="btn btn-outline btn-sm"
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', borderRadius: '50%', width: '36px', height: '36px', padding: 0 }}
        >
          <X size={18} />
        </button>

        {authModal === 'login' ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: 'var(--primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000',
                margin: '0 auto 0.75rem auto'
              }}>
                <Lock size={26} strokeWidth={2.5} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF' }}>Iniciar Sesión</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Accede a tu billetera virtual e historial de compras.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Correo Electrónico:
                </label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="tu@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Contraseña:
                </label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                <ArrowRight size={18} />
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              ¿No tienes una cuenta aún?{' '}
              <button
                onClick={() => setAuthModal('register')}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
              >
                Regístrate gratis
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: 'var(--secondary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                margin: '0 auto 0.75rem auto'
              }}>
                <Gamepad2 size={28} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF' }}>Crear Cuenta</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Únete a la plataforma de recargas Roblox más segura.
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Nombre de Usuario (Plataforma):
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="GamerPro2026"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Correo Electrónico:
                </label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="tu@email.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Usuario de Roblox (Opcional):
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="TuUserEnRoblox"
                  value={regRobloxUsername}
                  onChange={(e) => setRegRobloxUsername(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Contraseña (mínimo 6 caracteres):
                </label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-secondary btn-lg"
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                {loading ? 'Creando Cuenta...' : 'Registrarme'}
                <ArrowRight size={18} />
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              ¿Ya tienes una cuenta?{' '}
              <button
                onClick={() => setAuthModal('login')}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
              >
                Inicia sesión aquí
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
