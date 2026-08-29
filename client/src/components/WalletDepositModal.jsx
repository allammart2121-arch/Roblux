import React, { useState, useEffect } from 'react';
import { X, Wallet, Smartphone, CheckCircle2, ArrowRight, Clock, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

export default function WalletDepositModal({ onStartPaymentProcess }) {
  const { walletModalOpen, setWalletModalOpen, user, showToast } = useAuth();
  
  const [selectedAmount, setSelectedAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState('');

  // Dynamic Site Settings from Admin
  const [settings, setSettings] = useState({
    usdtRate: 42.50,
    pagoMovilBank: 'Banesco (0134)',
    pagoMovilPhone: '0414-123-4567',
    pagoMovilId: 'J-40129384-9',
    supportPhone: '584141234567'
  });

  const [pagoMovilRef, setPagoMovilRef] = useState('');
  const [submittedTx, setSubmittedTx] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (walletModalOpen) {
      setSubmittedTx(null);
      apiService.getSettings()
        .then(res => {
          if (res.success && res.settings) {
            setSettings(prev => ({ ...prev, ...res.settings }));
          }
        })
        .catch(err => console.error('Error fetching live settings:', err));
    }
  }, [walletModalOpen]);

  if (!walletModalOpen) return null;

  const finalAmountUsd = customAmount ? parseFloat(customAmount) : selectedAmount;
  const usdtRate = parseFloat(settings.usdtRate) || 42.50;
  const amountInLocalCurrency = (finalAmountUsd * usdtRate).toFixed(2);

  const handleSubmitDeposit = async (e) => {
    e.preventDefault();
    if (!finalAmountUsd || finalAmountUsd <= 0) {
      showToast('Por favor ingresa un monto válido para recargar.', 'error');
      return;
    }

    if (!pagoMovilRef.trim()) {
      showToast('Ingresa el número de referencia del Pago Móvil.', 'error');
      return;
    }

    setLoading(true);
    try {
      // Create pending deposit transaction for Admin approval
      const res = await apiService.initiatePayment({
        amount: finalAmountUsd,
        paymentMethod: 'pago_movil',
        paymentDetails: {
          bank: settings.pagoMovilBank,
          phone: settings.pagoMovilPhone,
          reference: pagoMovilRef.trim(),
          montoBs: amountInLocalCurrency
        }
      });

      if (res.success) {
        setSubmittedTx(res.transaction);
        showToast('¡Solicitud de recarga enviada al Administrador!');
      }
    } catch (err) {
      showToast(err.message || 'Error al enviar la solicitud de recarga.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const supportPhoneClean = (settings.supportPhone || '584141234567').replace(/[^0-9]/g, '');
  const refCode = submittedTx?.referenceCode || pagoMovilRef || 'REF';
  
  const waDepositMsg = encodeURIComponent(
    `¡Hola Administrador! 👋\n` +
    `Acabo de enviar una solicitud de recarga de saldo en BloxShop.\n\n` +
    `👤 *Usuario*: ${user?.username}\n` +
    `💵 *Monto en Bolívares*: Bs. ${amountInLocalCurrency}\n` +
    `💳 *Canal*: PAGO MÓVIL\n` +
    `📌 *Referencia*: ${refCode}\n\n` +
    `Adjunto mi comprobante para su verificación y aprobación de saldo. ¡Gracias!`
  );

  return (
    <div className="modal-overlay">
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '540px',
        padding: '2rem',
        position: 'relative',
        boxShadow: 'var(--shadow-purple-glow)'
      }}>
        {/* Close Button */}
        <button
          onClick={() => setWalletModalOpen(false)}
          className="btn btn-outline btn-sm"
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', borderRadius: '50%', width: '36px', height: '36px', padding: 0 }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
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
            <Wallet size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF' }}>Recargar Mi Saldo</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Acredita fondos en Bolívares a tu cuenta mediante Pago Móvil.
            </p>
          </div>
        </div>

        {/* SUCCESS PENDING DEPOSIT SUBMITTED VIEW */}
        {submittedTx ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '2px solid var(--warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--warning)',
              margin: '0 auto 1rem auto'
            }}>
              <Clock size={38} />
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFF', marginBottom: '0.4rem' }}>
              ¡Solicitud Registrada en Estado PENDIENTE!
            </h3>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Tu comprobante con referencia <strong style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{submittedTx.referenceCode}</strong> por el monto de <strong style={{ color: 'var(--accent-gold)' }}>Bs. {amountInLocalCurrency}</strong> ha sido enviado al Administrador para su verificación.
            </p>

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem',
              marginBottom: '1.5rem',
              fontSize: '0.8rem',
              color: 'var(--text-muted)'
            }}>
              Apenas el Administrador verifique el pago en el panel, tus fondos de <strong style={{ color: 'var(--accent-gold)' }}>Bs. {amountInLocalCurrency}</strong> se acreditarán automáticamente en tu cuenta.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a
                href={`https://wa.me/${supportPhoneClean}?text=${waDepositMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-lg"
                style={{
                  background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                  color: '#FFF',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  gap: '0.5rem'
                }}
              >
                <MessageSquare size={18} /> Enviar Comprobante al Admin por WhatsApp
              </a>

              <button
                onClick={() => setWalletModalOpen(false)}
                className="btn btn-outline btn-md"
              >
                Cerrar y Esperar Aprobación
              </button>
            </div>
          </div>
        ) : (
          /* DEPOSIT FORM - PAGO MOVIL ONLY */
          <form onSubmit={handleSubmitDeposit}>
            {/* Preset Amount Selectors in Bs */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Selecciona el Paquete a Recargar:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {[5, 10, 25, 50].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amt);
                      setCustomAmount('');
                    }}
                    className={`btn btn-sm ${selectedAmount === amt && !customAmount ? 'btn-primary' : 'btn-outline'}`}
                    style={{ fontWeight: 800, flexDirection: 'column', padding: '0.4rem 0.2rem' }}
                  >
                    <span>Bs. {(amt * usdtRate).toFixed(0)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pago Móvil Only Details Box */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                <div style={{ color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Smartphone size={18} /> Datos Oficiales para Pago Móvil:
                </div>
                <div style={{ color: 'var(--text-muted)' }}>• Banco: <strong style={{ color: '#FFF' }}>{settings.pagoMovilBank}</strong></div>
                <div style={{ color: 'var(--text-muted)' }}>• Teléfono: <strong style={{ color: '#FFF' }}>{settings.pagoMovilPhone}</strong></div>
                <div style={{ color: 'var(--text-muted)' }}>• RIF / Cédula: <strong style={{ color: '#FFF' }}>{settings.pagoMovilId}</strong></div>
                <div style={{ color: 'var(--accent-gold)', fontWeight: 800, marginTop: '0.2rem', fontSize: '1rem' }}>
                  Monto a Transferir: <span style={{ fontSize: '1.1rem', color: '#FFF' }}>Bs. {amountInLocalCurrency}</span>
                </div>
                <div style={{ marginTop: '0.4rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.2rem', color: 'var(--text-muted)' }}>
                    Número de Referencia del Pago:
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Ej: 849204"
                    value={pagoMovilRef}
                    onChange={(e) => setPagoMovilRef(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
            >
              {loading ? 'Enviando Solicitud...' : `Enviar Recarga (Bs. ${amountInLocalCurrency})`}
              <ArrowRight size={18} />
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
