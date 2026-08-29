import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, LayoutDashboard, Package, ShoppingBag, Wallet, Users, Settings, 
  PlusCircle, Edit, Trash2, CheckCircle2, XCircle, Clock, Search, RefreshCw, DollarSign, Save, Smartphone, CreditCard, MessageSquare, Bell, AlertTriangle
} from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProductFormModal from '../components/ProductFormModal';

export default function AdminDashboardPage() {
  const { user, showToast } = useAuth();
  
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'products' | 'orders' | 'deposits' | 'users' | 'settings'
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Settings State
  const [siteSettings, setSiteSettings] = useState({
    usdtRate: '42.50',
    pagoMovilBank: 'Banesco (0134)',
    pagoMovilPhone: '0414-123-4567',
    pagoMovilId: 'J-40129384-9',
    usdtWalletAddress: 'TYu8x9KP2mN4vLqW1zRsA6bC8dE9fG0hJ',
    pagoMovilActive: true,
    cardActive: true,
    cryptoActive: true,
    supportPhone: '+58 414 123 4567',
    bannerNotice: '¡Recargas de Robux y Tradeos MM2 activos las 24 horas! Tasa oficial del día.'
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Product Form Modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // User Balance adjustment state
  const [selectedUser, setSelectedUser] = useState(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceMode, setBalanceMode] = useState('add'); // 'add' | 'subtract' | 'set'

  useEffect(() => {
    fetchAdminData();
    // Auto refresh every 15 seconds to check for new pending deposits
    const interval = setInterval(() => {
      fetchAdminData();
    }, 15000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchAdminData = async () => {
    try {
      const statsRes = await apiService.getAdminStats();
      if (statsRes.success) setStats(statsRes.stats);

      const settingsRes = await apiService.getAdminSettings();
      if (settingsRes.success) setSiteSettings(prev => ({ ...prev, ...settingsRes.settings }));

      const prodRes = await apiService.getProducts();
      if (prodRes.success) setProducts(prodRes.products);

      const orderRes = await apiService.getAdminOrders();
      if (orderRes.success) setOrders(orderRes.orders);

      const txRes = await apiService.getAdminTransactions();
      if (txRes.success) setTransactions(txRes.transactions.filter(t => t.type === 'deposit'));

      const userRes = await apiService.getAdminUsers();
      if (userRes.success) setUsersList(userRes.users);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handlers for Settings Update
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await apiService.updateAdminSettings(siteSettings);
      if (res.success) {
        showToast(res.message || 'Configuración guardada exitosamente.');
        setSiteSettings(res.settings);
      }
    } catch (err) {
      showToast(err.message || 'Error al guardar la configuración.', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  // Handlers for Products
  const handleDeleteProduct = async (id, title) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${title}" del catálogo?`)) return;
    try {
      const res = await apiService.deleteProduct(id);
      if (res.success) {
        showToast(res.message);
        fetchAdminData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handlers for Orders
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await apiService.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        showToast(res.message);
        fetchAdminData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handlers for Deposits Review
  const handleReviewDeposit = async (transactionId, statusAction) => {
    try {
      const res = await apiService.reviewDeposit({
        transactionId,
        status: statusAction
      });
      if (res.success) {
        showToast(res.message);
        fetchAdminData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handlers for User Balance
  const handleAdjustBalance = async (e) => {
    e.preventDefault();
    if (!selectedUser || !balanceAmount) return;
    try {
      const res = await apiService.adjustUserBalance({
        userId: selectedUser.id,
        newBalance: balanceAmount,
        mode: balanceMode
      });
      if (res.success) {
        showToast(res.message);
        setSelectedUser(null);
        setBalanceAmount('');
        fetchAdminData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--danger)' }}>Acceso Denegado. Requiere Cuenta de Administrador.</h2>
      </div>
    );
  }

  const pendingDepositsList = transactions.filter(t => t.status === 'pending');
  const pendingOrdersList = orders.filter(o => o.status === 'Pendiente' || o.status === 'Procesando');

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      
      {/* Admin Header Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '20px',
              background: 'rgba(138, 43, 226, 0.2)',
              border: '1px solid rgba(138, 43, 226, 0.4)',
              color: '#C084FC',
              fontSize: '0.75rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <ShieldCheck size={14} /> PANEL DE CONTROL ADMINISTRATIVO
            </div>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#FFF', marginTop: '0.4rem' }}>
            Gestión General de la Plataforma
          </h1>
        </div>

        <button
          onClick={fetchAdminData}
          className="btn btn-outline btn-sm"
          style={{ borderRadius: '20px' }}
        >
          <RefreshCw size={16} /> Actualizar Datos
        </button>
      </div>

      {/* PROMINENT PENDING DEPOSITS ALERT NOTIFICATION BANNER */}
      {pendingDepositsList.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)',
          border: '1px solid var(--danger)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)',
          animation: 'pulse 2s infinite'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--danger)',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Clock size={28} />
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFF' }}>
                🔔 {pendingDepositsList.length} SOLICITUDES DE RECARGA PENDIENTES DE APROBACIÓN
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Los clientes enviaron comprobantes de pago. Revisa y haz clic en Aprobar para acreditarles el saldo.
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('deposits')}
            className="btn btn-lg"
            style={{
              background: 'var(--danger)',
              color: '#FFF',
              fontWeight: 800,
              borderRadius: '30px',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
            }}
          >
            Ver y Aprobar Recargas
          </button>
        </div>
      )}

      {/* Admin Sidebar / Tabs Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <button
          onClick={() => setActiveTab('summary')}
          className={`btn ${activeTab === 'summary' ? 'btn-primary' : 'btn-outline'}`}
        >
          <LayoutDashboard size={18} /> Resumen KPI
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-outline'}`}
        >
          <Package size={18} /> Productos ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline'}`}
        >
          <ShoppingBag size={18} /> Control de Órdenes ({orders.length})
          {pendingOrdersList.length > 0 && (
            <span style={{ background: 'var(--warning)', color: '#000', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '10px', fontWeight: 800, marginLeft: '0.3rem' }}>
              {pendingOrdersList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('deposits')}
          className={`btn ${activeTab === 'deposits' ? 'btn-primary' : 'btn-outline'}`}
          style={{ position: 'relative' }}
        >
          <Wallet size={18} /> Recargas / Depósitos ({transactions.length})
          {pendingDepositsList.length > 0 && (
            <span style={{ background: 'var(--danger)', color: '#FFF', fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '10px', fontWeight: 800, marginLeft: '0.4rem', animation: 'bounce 1s infinite' }}>
              {pendingDepositsList.length} PENDIENTES
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
        >
          <Users size={18} /> Usuarios ({usersList.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderColor: 'var(--accent-gold)' }}
        >
          <Settings size={18} /> Ajustes & Configuración
        </button>
      </div>

      {/* --- TAB 1: SUMMARY KPI --- */}
      {activeTab === 'summary' && stats && (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2.5rem'
          }}>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Ventas Totales ($ USD)</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>${stats.totalRevenue.toFixed(2)}</div>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Depósitos Aprobados</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>${stats.totalDepositsApproved.toFixed(2)}</div>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Total Órdenes Registradas</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FFF' }}>{stats.totalOrdersCount}</div>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Tasa del Día Configurada</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-gold)' }}>{siteSettings.usdtRate} <span style={{ fontSize: '0.9rem' }}>Bs/$</span></div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Quick Pending Alerts */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#FFF', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock color="var(--warning)" size={20} /> Órdenes Pendientes por Entregar
              </h3>
              {pendingOrdersList.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>¡Todas las órdenes han sido entregadas!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {pendingOrdersList.slice(0, 4).map(ord => (
                    <div key={ord.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.85rem' }}>{ord.id} - {ord.robloxTargetUser}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ord.items.map(i => i.title).join(', ')}</div>
                      </div>
                      <button onClick={() => setActiveTab('orders')} className="btn btn-sm btn-outline">Ver Orden</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#FFF', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wallet color="var(--danger)" size={20} /> Solicitudes de Recarga Pendientes ({pendingDepositsList.length})
              </h3>
              {pendingDepositsList.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No hay depósitos pendientes de revisión.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {pendingDepositsList.slice(0, 4).map(tx => (
                    <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--accent-gold)', fontSize: '0.85rem' }}>Ref: {tx.referenceCode} (${tx.amount.toFixed(2)})</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Canal: {tx.paymentMethod.toUpperCase()}</div>
                      </div>
                      <button onClick={() => setActiveTab('deposits')} className="btn btn-sm btn-primary">Revisar y Aprobar</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: DEPOSITS REVIEW (APROBAR / RECHAZAR RECARGAS) --- */}
      {activeTab === 'deposits' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF' }}>
                Auditoría y Aprobación de Recargas de Billetera
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Revisa los comprobantes enviados por los clientes. Al hacer clic en <strong>Aprobar</strong>, el saldo se acreditará instantáneamente a la billetera del usuario.
              </p>
            </div>
          </div>

          {/* HIGH-PRIORITY PENDING DEPOSITS SECTION */}
          {pendingDepositsList.length > 0 && (
            <div style={{ marginBottom: '2.5rem' }}>
              <h4 style={{ fontSize: '1.1rem', color: 'var(--warning)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={20} /> Solicitudes Pendientes de Verificación ({pendingDepositsList.length})
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
                {pendingDepositsList.map(tx => {
                  const targetUser = usersList.find(u => u.id === tx.userId);
                  return (
                    <div
                      key={tx.id}
                      className="glass-card"
                      style={{
                        padding: '1.5rem',
                        border: '1px solid var(--warning)',
                        boxShadow: '0 0 20px rgba(245, 158, 11, 0.25)',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div>
                          <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>PENDIENTE DE REVISIÓN</span>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFF', marginTop: '0.3rem' }}>
                            {targetUser ? targetUser.username : 'Usuario'} ({targetUser?.email || 'N/A'})
                          </h4>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>
                            ${tx.amount.toFixed(2)} <span style={{ fontSize: '0.8rem' }}>USD</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>
                            Bs. {(tx.amount * (parseFloat(siteSettings.usdtRate) || 42.50)).toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div style={{
                        background: 'rgba(0,0,0,0.4)',
                        borderRadius: '8px',
                        padding: '0.85rem',
                        marginBottom: '1.25rem',
                        fontSize: '0.82rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>
                          <span>Canal de Pago:</span>
                          <strong style={{ color: 'var(--primary)', textTransform: 'uppercase' }}>{tx.paymentMethod}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>
                          <span>Código de Referencia / Hash:</span>
                          <strong style={{ color: '#FFF', fontFamily: 'monospace' }}>{tx.referenceCode}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                          <span>Fecha Solicitud:</span>
                          <span>{new Date(tx.createdAt).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* CLEAR APPROVE / REJECT ACTION BUTTONS */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <button
                          onClick={() => handleReviewDeposit(tx.id, 'approved')}
                          className="btn btn-primary btn-md"
                          style={{
                            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                            fontWeight: 800,
                            borderRadius: '10px'
                          }}
                        >
                          <CheckCircle2 size={18} /> APROBAR Y ACREDITAR SALDO
                        </button>

                        <button
                          onClick={() => handleReviewDeposit(tx.id, 'rejected')}
                          className="btn btn-outline btn-md"
                          style={{
                            borderColor: 'var(--danger)',
                            color: 'var(--danger)',
                            borderRadius: '10px'
                          }}
                        >
                          <XCircle size={18} /> RECHAZAR RECARGA
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* HISTORICAL TRANSACTIONS TABLE */}
          <h4 style={{ fontSize: '1.1rem', color: '#FFF', marginBottom: '1rem' }}>
            Historial Completo de Depósitos
          </h4>

          <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.85rem' }}>Ref / ID</th>
                  <th style={{ padding: '0.85rem' }}>Canal de Pago</th>
                  <th style={{ padding: '0.85rem' }}>Monto ($ USD)</th>
                  <th style={{ padding: '0.85rem' }}>Estado</th>
                  <th style={{ padding: '0.85rem' }}>Notas de Auditoría</th>
                  <th style={{ padding: '0.85rem', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.85rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--accent-gold)' }}>
                      {tx.referenceCode}
                    </td>
                    <td style={{ padding: '0.85rem', textTransform: 'uppercase', color: 'var(--primary)' }}>
                      {tx.paymentMethod}
                    </td>
                    <td style={{ padding: '0.85rem', fontWeight: 800, color: 'var(--success)' }}>
                      ${tx.amount.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      {tx.status === 'approved' && <span className="badge badge-green">APROBADO</span>}
                      {tx.status === 'pending' && <span className="badge badge-gold">PENDIENTE</span>}
                      {tx.status === 'rejected' && <span className="badge badge-red">RECHAZADO</span>}
                    </td>
                    <td style={{ padding: '0.85rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {tx.notes || 'Auditoría registrada'}
                    </td>
                    <td style={{ padding: '0.85rem', textAlign: 'right' }}>
                      {tx.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleReviewDeposit(tx.id, 'approved')}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '0.35rem 0.65rem' }}
                          >
                            <CheckCircle2 size={14} /> Aprobar
                          </button>
                          <button
                            onClick={() => handleReviewDeposit(tx.id, 'rejected')}
                            className="btn btn-outline btn-sm"
                            style={{ borderColor: 'var(--danger)', color: 'var(--danger)', padding: '0.35rem 0.65rem' }}
                          >
                            <XCircle size={14} /> Rechazar
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Procesado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 6: SETTINGS & CONFIGURATION --- */}
      {activeTab === 'settings' && (
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF' }}>⚙️ Configuración del Sitio y Métodos de Pago</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Configura la tasa del día, datos de bancos, direcciones crypto y parámetros generales de la plataforma.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Section 1: Tasa del Día */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontSize: '1.1rem', color: 'var(--accent-gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <DollarSign size={20} /> Tasa de Cambio del Día ($ USD / Moneda Local)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', alignItems: 'center' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    Tasa del Día (Bs / USD):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    placeholder="42.50"
                    value={siteSettings.usdtRate}
                    onChange={(e) => setSiteSettings({ ...siteSettings, usdtRate: e.target.value })}
                    required
                  />
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Esta tasa se reflejará automáticamente en el modal de recarga para los clientes que paguen en Pago Móvil o moneda local.
                </div>
              </div>
            </div>

            {/* Section 2: Pago Móvil */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Smartphone size={20} /> Configuración de Pago Móvil
                </h4>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.82rem', color: '#FFF' }}>
                  <input
                    type="checkbox"
                    checked={siteSettings.pagoMovilActive}
                    onChange={(e) => setSiteSettings({ ...siteSettings, pagoMovilActive: e.target.checked })}
                  />
                  Canal Pago Móvil Activo
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Banco Receptivo:
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Banesco (0134)"
                    value={siteSettings.pagoMovilBank}
                    onChange={(e) => setSiteSettings({ ...siteSettings, pagoMovilBank: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Teléfono Pago Móvil:
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="0414-123-4567"
                    value={siteSettings.pagoMovilPhone}
                    onChange={(e) => setSiteSettings({ ...siteSettings, pagoMovilPhone: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    RIF / Cédula Titular:
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="J-40129384-9"
                    value={siteSettings.pagoMovilId}
                    onChange={(e) => setSiteSettings({ ...siteSettings, pagoMovilId: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Crypto USDT */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1.1rem', color: '#C084FC', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Wallet size={20} /> Configuración Criptomonedas (USDT TRC20)
                </h4>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.82rem', color: '#FFF' }}>
                  <input
                    type="checkbox"
                    checked={siteSettings.cryptoActive}
                    onChange={(e) => setSiteSettings({ ...siteSettings, cryptoActive: e.target.checked })}
                  />
                  Canal Crypto USDT Activo
                </label>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Dirección de Billetera USDT TRC20:
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="TYu8x9KP2mN4vLqW1zRsA6bC8dE9fG0hJ"
                  value={siteSettings.usdtWalletAddress}
                  onChange={(e) => setSiteSettings({ ...siteSettings, usdtWalletAddress: e.target.value })}
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
            </div>

            {/* Section 4: Tarjetas de Crédito */}
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={20} color="var(--primary)" />
                <div>
                  <h4 style={{ fontSize: '1rem', color: '#FFF' }}>Pasarela de Tarjetas Visa / Mastercard</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Procesamiento directo simulado de tarjetas de crédito.</p>
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.82rem', color: '#FFF' }}>
                <input
                  type="checkbox"
                  checked={siteSettings.cardActive}
                  onChange={(e) => setSiteSettings({ ...siteSettings, cardActive: e.target.checked })}
                />
                Canal Tarjetas Activo
              </label>
            </div>

            {/* Section 5: Soporte & Banner del Sitio */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontSize: '1.1rem', color: '#FFF', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare size={20} color="var(--success)" /> Mensajes del Sitio & Soporte Técnico
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Teléfono de Soporte WhatsApp:
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="+58 414 123 4567"
                    value={siteSettings.supportPhone}
                    onChange={(e) => setSiteSettings({ ...siteSettings, supportPhone: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Texto del Anuncio del Banner Principal:
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="¡Recargas activas las 24 horas!"
                    value={siteSettings.bannerNotice}
                    onChange={(e) => setSiteSettings({ ...siteSettings, bannerNotice: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              <Save size={18} />
              {savingSettings ? 'Guardando Ajustes...' : 'Guardar Toda la Configuración'}
            </button>

          </form>
        </div>
      )}

      {/* --- TAB 2: PRODUCTS CRUD --- */}
      {activeTab === 'products' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#FFF' }}>Catálogo de Productos ({products.length})</h3>
            <button
              onClick={() => {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }}
              className="btn btn-primary btn-sm"
            >
              <PlusCircle size={16} /> Crear Nuevo Producto
            </button>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.85rem' }}>Producto</th>
                  <th style={{ padding: '0.85rem' }}>Categoría</th>
                  <th style={{ padding: '0.85rem' }}>Precio ($ USD)</th>
                  <th style={{ padding: '0.85rem' }}>Stock</th>
                  <th style={{ padding: '0.85rem' }}>Badge</th>
                  <th style={{ padding: '0.85rem', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src={p.imageUrl} alt={p.title} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: 700, color: '#FFF' }}>{p.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.deliveryTime}</div>
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem' }}>{p.category}</td>
                    <td style={{ padding: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>${p.price.toFixed(2)}</td>
                    <td style={{ padding: '0.85rem' }}>
                      <span style={{ color: p.stock > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>
                        {p.stock} un.
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem' }}><span className="badge badge-purple">{p.badge}</span></td>
                    <td style={{ padding: '0.85rem', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          setEditingProduct(p);
                          setIsProductModalOpen(true);
                        }}
                        className="btn btn-outline btn-sm"
                        style={{ marginRight: '0.5rem', padding: '0.35rem 0.6rem' }}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id, p.title)}
                        className="btn btn-outline btn-sm"
                        style={{ borderColor: 'var(--danger)', color: 'var(--danger)', padding: '0.35rem 0.6rem' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 3: ORDERS FULFILLMENT --- */}
      {activeTab === 'orders' && (
        <div>
          <h3 style={{ fontSize: '1.2rem', color: '#FFF', marginBottom: '1.5rem' }}>Control de Órdenes y Entregas</h3>

          <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.85rem' }}>ID Orden</th>
                  <th style={{ padding: '0.85rem' }}>Usuario Roblox Destino</th>
                  <th style={{ padding: '0.85rem' }}>Ítems a Entregar</th>
                  <th style={{ padding: '0.85rem' }}>Total</th>
                  <th style={{ padding: '0.85rem' }}>Estado Actual</th>
                  <th style={{ padding: '0.85rem' }}>Cambiar Estado</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(ord => (
                  <tr key={ord.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.85rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary)' }}>
                      {ord.id}
                    </td>
                    <td style={{ padding: '0.85rem', fontWeight: 800, color: '#FFF' }}>
                      {ord.robloxTargetUser}
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      {ord.items.map(i => `${i.title} (x${i.quantity})`).join(', ')}
                    </td>
                    <td style={{ padding: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>
                      ${ord.totalAmount.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      {ord.status === 'Entregado' && <span className="badge badge-green">ENTREGADO</span>}
                      {ord.status === 'Procesando' && <span className="badge badge-gold">PROCESANDO</span>}
                      {ord.status === 'Pendiente' && <span className="badge badge-purple">PENDIENTE</span>}
                      {ord.status === 'Cancelado' && <span className="badge badge-red">CANCELADO</span>}
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                        className="input-field"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', background: '#0F1424', width: 'auto' }}
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="Procesando">Procesando</option>
                        <option value="Entregado">Entregado</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 5: USERS MANAGEMENT & MANUAL BALANCE ADJUSTMENT --- */}
      {activeTab === 'users' && (
        <div>
          <h3 style={{ fontSize: '1.2rem', color: '#FFF', marginBottom: '1.5rem' }}>Usuarios Registrados y Control de Saldo</h3>

          <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.85rem' }}>Usuario</th>
                  <th style={{ padding: '0.85rem' }}>Correo Electrónico</th>
                  <th style={{ padding: '0.85rem' }}>User Roblox</th>
                  <th style={{ padding: '0.85rem' }}>Saldo Billetera</th>
                  <th style={{ padding: '0.85rem' }}>Rol</th>
                  <th style={{ padding: '0.85rem', textAlign: 'right' }}>Ajustar Saldo</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.85rem', fontWeight: 700, color: '#FFF' }}>{u.username}</td>
                    <td style={{ padding: '0.85rem', color: 'var(--text-muted)' }}>{u.email}</td>
                    <td style={{ padding: '0.85rem', color: 'var(--primary)' }}>{u.robloxUsername || u.username}</td>
                    <td style={{ padding: '0.85rem', fontWeight: 800, color: 'var(--success)' }}>
                      ${parseFloat(u.walletBalance || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      <span className={`badge ${u.role === 'admin' ? 'badge-purple' : 'badge-cyan'}`}>
                        {u.role ? u.role.toUpperCase() : 'USER'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setBalanceAmount('10.00');
                        }}
                        className="btn btn-gold btn-sm"
                        style={{ padding: '0.35rem 0.65rem' }}
                      >
                        <DollarSign size={14} /> Modificar Saldo
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Balance Adjustment Modal */}
      {selectedUser && (
        <div className="modal-overlay">
          <div className="glass-card" style={{ width: '100%', maxWidth: '420px', padding: '2rem', position: 'relative' }}>
            <button onClick={() => setSelectedUser(null)} className="btn btn-outline btn-sm" style={{ position: 'absolute', top: '1rem', right: '1rem', borderRadius: '50%', width: '32px', height: '32px', padding: 0 }}>
              <XCircle size={18} />
            </button>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFF', marginBottom: '0.5rem' }}>
              Ajustar Saldo de {selectedUser.username}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Saldo actual: <strong>${parseFloat(selectedUser.walletBalance || 0).toFixed(2)} USD</strong>
            </p>

            <form onSubmit={handleAdjustBalance}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Modo de Operación:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
                  <button type="button" onClick={() => setBalanceMode('add')} className={`btn btn-sm ${balanceMode === 'add' ? 'btn-primary' : 'btn-outline'}`}>+ Sumar</button>
                  <button type="button" onClick={() => setBalanceMode('subtract')} className={`btn btn-sm ${balanceMode === 'subtract' ? 'btn-primary' : 'btn-outline'}`}>- Restar</button>
                  <button type="button" onClick={() => setBalanceMode('set')} className={`btn btn-sm ${balanceMode === 'set' ? 'btn-primary' : 'btn-outline'}`}>= Definir</button>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Monto ($ USD):
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="input-field"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-gold btn-lg" style={{ width: '100%' }}>
                Aplicar Cambio de Saldo
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Product Form Modal Component */}
      <ProductFormModal
        product={editingProduct}
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSaved={fetchAdminData}
      />

    </div>
  );
}
