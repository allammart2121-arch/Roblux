const { v4: uuidv4 } = require('uuid');
const db = require('../models/db');

exports.initiatePayment = async (req, res, next) => {
  try {
    const { amount, paymentMethod, paymentDetails } = req.body;
    const userId = req.user.id;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, error: 'El monto ingresado no es válido.' });
    }

    if (!['card', 'pago_movil', 'crypto'].includes(paymentMethod)) {
      return res.status(400).json({ success: false, error: 'Método de pago no soportado.' });
    }

    const referenceCode = 'REF-' + Math.floor(100000 + Math.random() * 900000);

    const transaction = {
      id: uuidv4(),
      userId,
      type: 'deposit',
      amount: Number(parsedAmount.toFixed(2)),
      paymentMethod,
      paymentDetails: paymentDetails || {},
      status: 'pending',
      referenceCode,
      notes: `Solicitud de recarga de saldo mediante ${paymentMethod.toUpperCase()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.createTransaction(transaction);

    return res.status(201).json({
      success: true,
      message: 'Solicitud de pago registrada. Estado: PENDIENTE.',
      transaction
    });
  } catch (error) {
    next(error);
  }
};

exports.processPayment = async (req, res, next) => {
  try {
    const { transactionId, action } = req.body; // action: 'approve' or 'reject'
    const userId = req.user.id;

    const tx = db.getTransactionById(transactionId);
    if (!tx) {
      return res.status(404).json({ success: false, error: 'Transacción no encontrada.' });
    }

    if (tx.userId !== userId) {
      return res.status(403).json({ success: false, error: 'No tienes permiso sobre esta transacción.' });
    }

    if (tx.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        error: `La transacción ya ha sido procesada previamente con estado: ${tx.status.toUpperCase()}.` 
      });
    }

    if (action === 'reject') {
      const updatedTx = db.updateTransactionStatus(transactionId, 'rejected', 'Pago rechazada por la pasarela de pagos.');
      return res.json({
        success: false,
        message: 'Transacción RECHAZADA.',
        transaction: updatedTx
      });
    }

    // Default simulation behavior: Approve transaction and credit wallet balance
    const updatedTx = db.updateTransactionStatus(transactionId, 'approved', 'Pago verificado y aprobado exitosamente por la pasarela.');
    const updatedUser = db.updateUserBalance(userId, tx.amount);

    return res.json({
      success: true,
      message: `¡Pago APROBADO! Se han acreditado $${tx.amount.toFixed(2)} a tu billetera virtual.`,
      transaction: updatedTx,
      newBalance: updatedUser ? updatedUser.walletBalance : null
    });
  } catch (error) {
    next(error);
  }
};

exports.getTransactionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tx = db.getTransactionById(id);
    if (!tx) {
      return res.status(404).json({ success: false, error: 'Transacción no encontrada.' });
    }
    return res.json({ success: true, transaction: tx });
  } catch (error) {
    next(error);
  }
};
