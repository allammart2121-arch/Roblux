import React, { useState, useEffect } from 'react';
import { User, Wallet, ShoppingBag, Clock, ShieldCheck, PlusCircle, CheckCircle2, XCircle, ArrowUpRight, Gamepad2, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

export default function ProfilePage() {
  const { user, setWalletModalOpen } = useAuth();
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'transactions'
  const [loading, setLoading] = useState(true);
  const [supportPhone, setSupportPhone] = useState('584141234567');
  const [usdtRate, setUsdtRate] = useState(42.50);

  useEffect(() => {
    fetchProfileData();
    apiService.getSettings()
      .then(res => {
        if (res.success && res.settings) {
          if (res.settings.supportPhone) {
            const cleaned = res.settings.supportPhone.replace(/[^0-9]/g, '');
            if (cleaned) setSupportPhone(cleaned);
          }
          if (res.settings.usdtRate) {
            setUsdtRate(parseFloat(res.settings.usdtRate));
          }
        }
      })
      .catch(err => console.error('Error fetching settings for profile:', err));
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const [ordersRes, txRes] = await Promise.all([
        apiService.getUserOrders(),
        apiService.getWalletTransactions()
      ]);

      if (ordersRes.success) setOrders(ordersRes.orders);
      if (txRes.success) setTransactions(txRes.transactions);
    } catch (err) {
      console.error('Error loading profile history:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWhatsAppUrl = (order) => {
    const itemsText = order.items ? order.items.map(i => `${i.title} (x${i.quantity})`).join(', ') : 'Ítems de Tienda';
    const text = encodeURIComponent(
      `¡Hola Administrador! 👋\n` +
      `Tengo una consulta sobre mi orden *${order.id}*.\n` +
      `🎮 *Usuario Roblox*: ${order.robloxTargetUser}\n` +
      `📦 *Ítems*: ${itemsText}\n` +
      `💵 *Monto*: $${order.totalAmount.toFixed(2)} USD (Bs. ${(order.totalAmount * usdtRate).toFixed(2)})`
    );
    return `https://wa.me/${supportPhone}?text=${text}`;
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h2>Inicia sesión para ver tu perfil.</h2>
      </div>
    );
  }

  const walletBalanceBs = (parseFloat(user.walletBalance || 0) * usdtRate).toFixed(2);

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      
      {/* Header Profile Summary Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        
        {/* Profile Info Card */}
        <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000',
            fontWeight: 800,
            fontSize: '1.8rem',
            boxShadow: 'var(--shadow-glow)'
          }}>
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF' }}>{user.username}</h2>
              <span className="badge badge-cyan">Cuenta Verificada</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{user.email}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Gamepad2 size={14} color="var(--primary)" /> Roblox User: <strong style={{ color: '#FFF' }}>{user.robloxUsername || user.username}</strong>
            </p>
          </div>
        </div>

        {/* Virtual Wallet Balance Card (DISPLAYED EXCLUSIVELY IN BS) */}
        <div className="glass-card" style={{
          padding: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.12) 0%, rgba(138, 43, 226, 0.15) 100%)',
          border: '1px solid var(--accent-gold)'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Wallet size={16} color="var(--accent-gold)" /> Saldo en Billetera Virtual
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
              Bs. {walletBalanceBs}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Tasa del día: 1 USD = {usdtRate.toFixed(2)} Bs.
            </div>
          </div>

          <button
            onClick={() => setWalletModalOpen(true)}
            className="btn btn-gold btn-lg"
            style={{ borderRadius: '16px' }}
          >
            <PlusCircle size={20} /> Recargar Fondos
          </button>
        </div>

      </div>

      {/* History Tabs Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveTab('orders')}
          className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline'}`}
        >
          <ShoppingBag size={18} /> Historial de Compras ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`btn ${activeTab === 'transactions' ? 'btn-primary' : 'btn-outline'}`}
        >
          <Wallet size={18} /> Historial de Depósitos ({transactions.length})
        </button>
      </div>

      {/* Tab Content: Orders Table */}
      {activeTab === 'orders' && (
        <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <ShoppingBag size={42} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
              <p>Aún no has realizado ninguna compra.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.85rem' }}>ID Orden</th>
                  <th style={{ padding: '0.85rem' }}>Ítems Adquiridos</th>
                  <th style={{ padding: '0.85rem' }}>Usuario Roblox</th>
                  <th style={{ padding: '0.85rem' }}>Método Pago</th>
                  <th style={{ padding: '0.85rem' }}>Monto Total</th>
                  <th style={{ padding: '0.85rem' }}>Estado</th>
                  <th style={{ padding: '0.85rem', textAlign: 'right' }}>Contacto</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const orderBs = (order.totalAmount * usdtRate).toFixed(2);
                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.85rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary)' }}>
                        {order.id}
                      </td>
                      <td style={{ padding: '0.85rem' }}>
                        {order.items.map(item => `${item.title} (x${item.quantity})`).join(', ')}
                      </td>
                      <td style={{ padding: '0.85rem', color: '#FFF' }}>{order.robloxTargetUser}</td>
                      <td style={{ padding: '0.85rem', textTransform: 'capitalize' }}>
                        {order.paymentMethod === 'wallet' ? 'Billetera Virtual' : 'Pasarela Directa'}
                      </td>
                      <td style={{ padding: '0.85rem' }}>
                        <div style={{ fontWeight: 800, color: 'var(--primary)' }}>${order.totalAmount.toFixed(2)}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--accent-gold)', fontWeight: 700 }}>Bs. {orderBs}</div>
                      </td>
                      <td style={{ padding: '0.85rem' }}>
                        <span className="badge badge-green">
                          <CheckCircle2 size={12} /> {order.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem', textAlign: 'right' }}>
                        <a
                          href={getWhatsAppUrl(order)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm"
                          style={{
                            background: '#25D366',
                            color: '#000',
                            fontWeight: 700,
                            padding: '0.35rem 0.75rem',
                            borderRadius: '20px'
                          }}
                        >
                          <MessageSquare size={14} /> WhatsApp Admin
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab Content: Transactions Table */}
      {activeTab === 'transactions' && (
        <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          {transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <Wallet size={42} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
              <p>No tienes transacciones de depósito registradas.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.85rem' }}>ID Transacción</th>
                  <th style={{ padding: '0.85rem' }}>Tipo</th>
                  <th style={{ padding: '0.85rem' }}>Canal de Pago</th>
                  <th style={{ padding: '0.85rem' }}>Código Referencia</th>
                  <th style={{ padding: '0.85rem' }}>Monto en Bs.</th>
                  <th style={{ padding: '0.85rem' }}>Estado</th>
                  <th style={{ padding: '0.85rem' }}>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => {
                  const txBs = (tx.amount * usdtRate).toFixed(2);
                  return (
                    <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.85rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                        {tx.id.slice(0, 8)}...
                      </td>
                      <td style={{ padding: '0.85rem', textTransform: 'capitalize' }}>
                        {tx.type === 'deposit' ? 'Recarga Saldo' : 'Compra Tienda'}
                      </td>
                      <td style={{ padding: '0.85rem', textTransform: 'uppercase', color: 'var(--accent-gold)' }}>
                        {tx.paymentMethod}
                      </td>
                      <td style={{ padding: '0.85rem', fontFamily: 'monospace', color: 'var(--primary)' }}>
                        {tx.referenceCode}
                      </td>
                      <td style={{ padding: '0.85rem', fontWeight: 800, color: tx.type === 'deposit' ? 'var(--accent-gold)' : 'var(--danger)' }}>
                        {tx.type === 'deposit' ? '+' : '-'}Bs. {txBs} (${tx.amount.toFixed(2)})
                      </td>
                      <td style={{ padding: '0.85rem' }}>
                        {tx.status === 'approved' && <span className="badge badge-green">APROBADO</span>}
                        {tx.status === 'pending' && <span className="badge badge-gold">PENDIENTE</span>}
                        {tx.status === 'rejected' && <span className="badge badge-red">RECHAZADO</span>}
                      </td>
                      <td style={{ padding: '0.85rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

    </div>
  );
}
