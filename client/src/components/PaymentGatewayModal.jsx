import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Loader2, Lock, ArrowRight, Wallet, MessageSquare } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PaymentGatewayModal({ paymentData, onClose, onPaymentApproved }) {
  const { refreshBalance, showToast } = useAuth();
  
  const [step, setStep] = useState('initiating'); // 'initiating' | 'verifying' | 'completed'
  const [transaction, setTransaction] = useState(null);
  const [status, setStatus] = useState('pending'); // 'pending' | 'approved' | 'rejected'
  const [errorMessage, setErrorMessage] = useState('');
  const [supportPhone, setSupportPhone] = useState('584141234567');

  useEffect(() => {
    apiService.getSettings()
      .then(res => {
        if (res.success && res.settings && res.settings.supportPhone) {
          const cleaned = res.settings.supportPhone.replace(/[^0-9]/g, '');
          if (cleaned) setSupportPhone(cleaned);
        }
      })
      .catch(err => console.error('Error fetching support phone:', err));
  }, []);

  useEffect(() => {
    if (!paymentData) return;

    let isMounted = true;
    const startPayment = async () => {
      try {
        setStep('initiating');
        const res = await apiService.initiatePayment(paymentData);
        if (res.success && isMounted) {
          setTransaction(res.transaction);
          setStep('verifying');
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage(err.message || 'Error al iniciar la pasarela de pagos.');
          setStatus('rejected');
          setStep('completed');
        }
      }
    };

    startPayment();
    return () => { isMounted = false; };
  }, [paymentData]);

  const handleSimulateAction = async (action) => {
    if (!transaction) return;
    try {
      setStep('processing');
      const res = await apiService.processPayment({
        transactionId: transaction.id,
        action
      });

      if (res.success) {
        setStatus('approved');
        setTransaction(res.transaction);
        refreshBalance();
        showToast(res.message || '¡Pago aprobado exitosamente!');
        if (onPaymentApproved) {
          onPaymentApproved(res.transaction);
        }
      } else {
        setStatus('rejected');
        setTransaction(res.transaction);
        showToast(res.message || 'Pago rechazado.', 'error');
      }
    } catch (err) {
      setStatus('rejected');
      setErrorMessage(err.message || 'Error al procesar la verificación del pago.');
    } finally {
      setStep('completed');
    }
  };

  if (!paymentData) return null;

  const waText = encodeURIComponent(
    `¡Hola Administrador! 👋\n` +
    `Acabo de realizar una recarga de saldo/compra aprobada.\n` +
    `📌 *Referencia*: ${transaction?.referenceCode || 'REF'}\n` +
    `💵 *Monto*: $${paymentData.amount.toFixed(2)} USD\n` +
    `Quedo atento para coordinar la entrega en Roblox.`
  );
  const whatsappUrl = `https://wa.me/${supportPhone}?text=${waText}`;

  return (
    <div className="modal-overlay">
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '2.5rem',
        textAlign: 'center',
        position: 'relative',
        boxShadow: 'var(--shadow-glow)'
      }}>
        
        {/* Header Security Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: 'rgba(0, 242, 254, 0.1)',
          color: 'var(--primary)',
          padding: '0.35rem 0.85rem',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 700,
          marginBottom: '1.5rem',
          border: '1px solid rgba(0, 242, 254, 0.3)'
        }}>
          <Lock size={14} /> PASARELA DE PAGOS SEGURA SSL (SIMULADOR 2026)
        </div>

        {/* STEP 1 & 2: INITIATING / VERIFYING */}
        {(step === 'initiating' || step === 'verifying' || step === 'processing') && (
          <div>
            <div style={{ margin: '2rem 0' }}>
              <Loader2 size={54} color="var(--primary)" style={{ animation: 'spin 1.5s linear infinite' }} />
            </div>

            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFF', marginBottom: '0.5rem' }}>
              Procesando Transacción de ${paymentData.amount.toFixed(2)}
            </h2>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              {step === 'initiating' && 'Estableciendo conexión encriptada con el proveedor financiero...'}
              {step === 'verifying' && 'Esperando verificación y validación del código de referencia...'}
              {step === 'processing' && 'Acreditando saldo instantáneo en la billetera virtual...'}
            </p>

            {/* Interactive Simulation Panel */}
            {step === 'verifying' && transaction && (
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                marginBottom: '1.5rem',
                textAlign: 'left'
              }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Detalles de la Transacción:
                </div>
                <div style={{ fontSize: '0.85rem', color: '#FFF', display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span>Referencia:</span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{transaction.referenceCode}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#FFF', display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span>Método:</span>
                  <span style={{ textTransform: 'uppercase', color: 'var(--accent-gold)' }}>{paymentData.paymentMethod}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#FFF', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Estado Actual:</span>
                  <span className="badge badge-gold">PENDIENTE</span>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1rem 0' }} />

                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem', textAlign: 'center' }}>
                  Simula la respuesta del banco/nodo financiero para probar el flujo de la plataforma:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button
                    onClick={() => handleSimulateAction('approve')}
                    className="btn btn-primary btn-sm"
                  >
                    <CheckCircle2 size={16} /> Aprobar Pago
                  </button>

                  <button
                    onClick={() => handleSimulateAction('reject')}
                    className="btn btn-outline btn-sm"
                    style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                  >
                    <XCircle size={16} /> Rechazar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: COMPLETED (APPROVED) */}
        {step === 'completed' && status === 'approved' && (
          <div>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--success)',
              margin: '0 auto 1.5rem auto',
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)'
            }}>
              <CheckCircle2 size={42} />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFF', marginBottom: '0.5rem' }}>
              ¡Transacción Aprobada!
            </h2>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Se han acreditado exitosamente <strong style={{ color: 'var(--primary)' }}>${paymentData.amount.toFixed(2)} USD</strong> a tu billetera virtual.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-lg"
                style={{
                  background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                  color: '#FFF',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  gap: '0.5rem'
                }}
              >
                <MessageSquare size={18} /> Contactar Administrador en WhatsApp
              </a>

              <button
                onClick={onClose}
                className="btn btn-outline btn-md"
                style={{ width: '100%' }}
              >
                Volver a la Tienda
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: COMPLETED (REJECTED) */}
        {step === 'completed' && status === 'rejected' && (
          <div>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '2px solid var(--danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--danger)',
              margin: '0 auto 1.5rem auto'
            }}>
              <XCircle size={42} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF', marginBottom: '0.5rem' }}>
              Transacción Rechazada
            </h2>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              {errorMessage || 'La entidad bancaria o la pasarela de pagos rechazó la solicitud de transferencia.'}
            </p>

            <button
              onClick={onClose}
              className="btn btn-outline btn-lg"
              style={{ width: '100%' }}
            >
              Cerrar e Intentar Nuevamente
            </button>
          </div>
        )}

      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
