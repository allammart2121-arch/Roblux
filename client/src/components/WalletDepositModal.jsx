import React, { useState, useEffect } from 'react';
import { X, Wallet, Smartphone, CheckCircle2, ArrowRight, Clock, MessageSquare, Copy, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

export default function WalletDepositModal({ onStartPaymentProcess }) {
  const { walletModalOpen, setWalletModalOpen, user, showToast } = useAuth();
  
  const [amountBs, setAmountBs] = useState('');

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
  const [copiedField, setCopiedField] = useState(null);

  const copyToClipboard = (text, fieldName = 'Datos') => {
    const handleSuccess = () => {
      setCopiedField(fieldName);
      showToast(fieldName === 'all' ? '¡Datos de pago copiados al portapapeles!' : `¡${fieldName} copiado!`);
      setTimeout(() => setCopiedField(null), 2500);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(handleSuccess)
        .catch(() => fallbackCopy(text, handleSuccess));
    } else {
      fallbackCopy(text, handleSuccess);
    }
  };

  const fallbackCopy = (text, onSuccess) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
      onSuccess();
    } catch (err) {
      showToast('No se pudo copiar automáticamente.', 'error');
    }
  };

  const copyAllPaymentData = () => {
    const textToCopy = `DATOS PAGO MÓVIL:\nBanco: ${settings.pagoMovilBank}\nTeléfono: ${settings.pagoMovilPhone}\nRIF / Cédula: ${settings.pagoMovilId}\nMonto a Transferir: Bs. ${amountInLocalCurrency}`;
    copyToClipboard(textToCopy, 'all');
  };

  useEffect(() => {
    if (walletModalOpen) {
      setSubmittedTx(null);
      setPagoMovilRef('');
      setAmountBs('');
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

  const usdtRate = parseFloat(settings.usdtRate) || 42.50;
  const parsedBs = parseFloat(amountBs) || 0;
  const finalAmountUsd = parsedBs > 0 ? (parsedBs / usdtRate) : 0;
  const amountInLocalCurrency = parsedBs > 0 ? parsedBs.toFixed(2) : '0.00';

  const handleSubmitDeposit = async (e) => {
    e.preventDefault();
    if (!parsedBs || parsedBs <= 0) {
      showToast('Por favor escribe un monto válido a recargar.', 'error');
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
    `Acabo de enviar una solicitud de recarga de saldo en ROBLUX.\n\n` +
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
            {/* Input para Escribir Monto a Recargar */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.45rem' }}>
                Monto a Recargar:
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{
                  position: 'absolute',
                  left: '1rem',
                  fontWeight: 800,
                  color: 'var(--accent-gold)',
                  fontSize: '0.95rem',
                  pointerEvents: 'none'
                }}>
                  Bs.
                </span>
                <input
                  type="number"
                  step="any"
                  min="1"
                  className="input-field"
                  style={{
                    paddingLeft: '2.8rem',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: '#FFF'
                  }}
                  placeholder="Escribe el monto a recargar (Ej: 19800)"
                  value={amountBs}
                  onChange={(e) => setAmountBs(e.target.value)}
                  required
                />
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.82rem' }}>
                <div style={{ color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.1rem' }}>
                  <Smartphone size={18} /> Datos Oficiales para Pago Móvil:
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
                  <span>• Banco: <strong style={{ color: '#FFF' }}>{settings.pagoMovilBank}</strong></span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(settings.pagoMovilBank, 'Banco')}
                    className="btn btn-outline btn-sm"
                    style={{ padding: '0.15rem 0.4rem', height: '22px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                    title="Copiar Banco"
                  >
                    {copiedField === 'Banco' ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
                  <span>• Teléfono: <strong style={{ color: '#FFF' }}>{settings.pagoMovilPhone}</strong></span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(settings.pagoMovilPhone.replace(/[^0-9]/g, '') || settings.pagoMovilPhone, 'Teléfono')}
                    className="btn btn-outline btn-sm"
                    style={{ padding: '0.15rem 0.4rem', height: '22px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                    title="Copiar Teléfono"
                  >
                    {copiedField === 'Teléfono' ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
                  <span>• RIF / Cédula: <strong style={{ color: '#FFF' }}>{settings.pagoMovilId}</strong></span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(settings.pagoMovilId.replace(/[^0-9A-Za-z]/g, '') || settings.pagoMovilId, 'RIF / Cédula')}
                    className="btn btn-outline btn-sm"
                    style={{ padding: '0.15rem 0.4rem', height: '22px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                    title="Copiar RIF / Cédula"
                  >
                    {copiedField === 'RIF / Cédula' ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--accent-gold)', fontWeight: 800, marginTop: '0.1rem', fontSize: '1rem' }}>
                  <span>Monto a Transferir: <span style={{ fontSize: '1.1rem', color: '#FFF' }}>Bs. {amountInLocalCurrency}</span></span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(amountInLocalCurrency, 'Monto')}
                    className="btn btn-outline btn-sm"
                    style={{ padding: '0.15rem 0.4rem', height: '22px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                    title="Copiar Monto"
                  >
                    {copiedField === 'Monto' ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                  </button>
                </div>

                {/* Botón principal: Copiar Datos de Pago */}
                <button
                  type="button"
                  onClick={copyAllPaymentData}
                  className="btn btn-sm"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    background: copiedField === 'all' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0, 240, 255, 0.12)',
                    border: copiedField === 'all' ? '1px solid var(--success)' : '1px solid var(--primary)',
                    color: copiedField === 'all' ? 'var(--success)' : 'var(--primary)',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    padding: '0.55rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    marginTop: '0.35rem',
                    marginBottom: '0.25rem',
                    width: '100%',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {copiedField === 'all' ? <Check size={16} /> : <Copy size={16} />}
                  {copiedField === 'all' ? '¡Datos de Pago Copiados!' : 'Copiar Datos de Pago'}
                </button>

                <div style={{ marginTop: '0.3rem' }}>
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
