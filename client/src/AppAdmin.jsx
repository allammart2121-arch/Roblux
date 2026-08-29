import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminDashboardPage from './pages/AdminDashboardPage';
import { ShieldCheck, Lock, Mail, ArrowRight, Gamepad2, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';

function AdminContent() {
  const { user, login, logout, toast, showToast } = useAuth();
  
  const [adminEmail, setAdminEmail] = useState('admin@recargaroblox.com');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login({ email: adminEmail, password: adminPassword });
      if (res.user.role !== 'admin') {
        logout();
        showToast('Acceso denegado. Esta cuenta no posee permisos de Administrador.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error al iniciar sesión administrativa.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Toast Notification */}
      {toast && (
        <div className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Admin Dedicated Navbar - BloxShop */}
      <header style={{
        background: 'rgba(7, 9, 19, 0.95)',
        borderBottom: '1px solid var(--border-glow)',
        padding: '1rem 0'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'var(--secondary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF'
            }}>
              <ShieldCheck size={26} />
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFF' }}>
                PANEL DE ADMINISTRACIÓN | <span style={{ color: 'var(--primary)' }}>BLOXSHOP</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#C084FC', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Portal de Control de Operaciones 2026
              </div>
            </div>
          </div>

          {user && user.role === 'admin' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Admin: <strong style={{ color: '#FFF' }}>{user.username}</strong>
              </span>
              <button
                onClick={logout}
                className="btn btn-outline btn-sm"
                style={{ borderRadius: '20px' }}
              >
                <LogOut size={16} /> Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flexGrow: 1, padding: '2rem 0' }}>
        {user && user.role === 'admin' ? (
          <AdminDashboardPage />
        ) : (
          /* DEDICATED ADMIN LOGIN PORTAL */
          <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '65vh' }}>
            <div className="glass-card" style={{
              width: '100%',
              maxWidth: '440px',
              padding: '2.5rem',
              boxShadow: 'var(--shadow-purple-glow)',
              position: 'relative'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '20px',
                  background: 'var(--secondary-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFF',
                  margin: '0 auto 1rem auto',
                  boxShadow: '0 0 25px rgba(138, 43, 226, 0.4)'
                }}>
                  <Lock size={32} />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFF' }}>Acceso Administrativo</h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  Ingresa tus credenciales oficiales de Administrador de BloxShop.
                </p>
              </div>

              <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    Correo Administrador:
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="admin@recargaroblox.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    Contraseña Administrativa:
                  </label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-secondary btn-lg"
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  {loading ? 'Verificando Acceso...' : 'Ingresar al Panel de Control'}
                  <ArrowRight size={18} />
                </button>
              </form>

              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '8px',
                padding: '0.75rem',
                marginTop: '1.5rem',
                fontSize: '0.75rem',
                color: 'var(--text-dim)',
                textAlign: 'center'
              }}>
                🔑 Credenciales Demo por Defecto:<br />
                <strong>admin@recargaroblox.com</strong> / <strong>admin123</strong>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer style={{
        background: 'rgba(5, 7, 15, 0.95)',
        borderTop: '1px solid var(--border-color)',
        padding: '1.25rem 0',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-dim)'
      }}>
        <div className="container">
          BloxShop Admin Portal © 2026 - Panel de Control Exclusivo para Administradores
        </div>
      </footer>

    </div>
  );
}

export default function AppAdmin() {
  return (
    <AuthProvider>
      <AdminContent />
    </AuthProvider>
  );
}
