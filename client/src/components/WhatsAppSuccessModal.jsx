import React, { useState, useEffect } from 'react';
import { X, MessageSquare, CheckCircle2 } from 'lucide-react';
import { apiService } from '../services/api';

export default function WhatsAppSuccessModal({ orderData, onClose }) {
  const [supportPhone, setSupportPhone] = useState('584141234567');
  const [usdtRate, setUsdtRate] = useState(42.50);

  useEffect(() => {
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
      .catch(err => console.error('Error fetching settings for WhatsApp modal:', err));
  }, []);

  if (!orderData) return null;

  const robloxUser = orderData.robloxTargetUser || 'No especificado';
  const orderId = orderData.id || orderData.referenceCode || 'ORD-ORDEN';
  const totalAmountUsd = orderData.totalAmount || orderData.amount || 0;
  const totalAmountBs = (totalAmountUsd * usdtRate).toFixed(2);
  const itemsText = orderData.items ? orderData.items.map(i => `${i.title} (x${i.quantity})`).join(', ') : 'Recarga de Saldo';

  // Construct pre-filled WhatsApp Message (BloxShop)
  const waText = encodeURIComponent(
    `¡Hola Administrador de BloxShop! 👋\n` +
    `Acabo de realizar la compra de mi orden *${orderId}*.\n\n` +
    `🎮 *Usuario Roblox de Entrega*: ${robloxUser}\n` +
    `📦 *Ítems Comprados*: ${itemsText}\n` +
    `💵 *Monto Total*: Bs. ${totalAmountBs}\n\n` +
    `Quedo atento en esta línea de WhatsApp para recibir mis Robux / Ítems en Roblox. ¡Gracias!`
  );

  const whatsappUrl = `https://wa.me/${supportPhone}?text=${waText}`;

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '500px',
        padding: '2.25rem',
        textAlign: 'center',
        position: 'relative',
        boxShadow: '0 0 35px rgba(16, 185, 129, 0.4)',
        border: '1px solid var(--success)',
        animation: 'fadeIn 0.3s ease-out'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn btn-outline btn-sm"
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', borderRadius: '50%', width: '36px', height: '36px', padding: 0 }}
        >
          <X size={18} />
        </button>

        {/* Success Icon */}
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
          margin: '0 auto 1.25rem auto'
        }}>
          <CheckCircle2 size={44} />
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFF', marginBottom: '0.4rem' }}>
          ¡Pago Registrado y Orden Generada!
        </h2>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          Tu solicitud para la orden <strong style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{orderId}</strong> ha sido creada exitosamente.
        </p>

        {/* Order Details Summary Box (EXCLUSIVELY IN BS) */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          marginBottom: '1.75rem',
          textAlign: 'left',
          fontSize: '0.85rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
            <span>Usuario Roblox:</span>
            <strong style={{ color: '#FFF' }}>{robloxUser}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
            <span>Monto Total:</span>
            <strong style={{ color: 'var(--accent-gold)' }}>Bs. {totalAmountBs}</strong>
          </div>
          <div style={{ color: 'var(--text-muted)' }}>
            <span>Ítems:</span> <span style={{ color: '#FFF' }}>{itemsText}</span>
          </div>
        </div>

        {/* DIRECT WHATSAPP ACTION BUTTON */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-lg"
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            color: '#FFF',
            fontWeight: 800,
            boxShadow: '0 4px 20px rgba(37, 211, 102, 0.4)',
            fontSize: '1rem',
            gap: '0.6rem'
          }}
        >
          <MessageSquare size={22} />
          Contactar Administrador por WhatsApp para Entregar Compra
        </a>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.85rem' }}>
          * Serás redirigido al WhatsApp oficial del Administrador con los detalles de tu orden pre-llenados.
        </div>

      </div>
    </div>
  );
}
