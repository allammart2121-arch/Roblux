const { v4: uuidv4 } = require('uuid');
const db = require('../models/db');

exports.getStats = async (req, res, next) => {
  try {
    const users = db.getAllUsers();
    const orders = db.getAllOrders();
    const transactions = db.getAllTransactions();
    const products = db.getProducts();

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalDepositsApproved = transactions
      .filter(t => t.type === 'deposit' && t.status === 'approved')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const pendingDepositsCount = transactions
      .filter(t => t.type === 'deposit' && t.status === 'pending').length;

    const pendingOrdersCount = orders
      .filter(o => o.status === 'Pendiente' || o.status === 'Procesando').length;

    return res.json({
      success: true,
      stats: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalDepositsApproved: Number(totalDepositsApproved.toFixed(2)),
        totalOrdersCount: orders.length,
        totalUsersCount: users.length,
        totalProductsCount: products.length,
        pendingDepositsCount,
        pendingOrdersCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// Platform Settings (Public & Admin)
exports.getSettings = async (req, res, next) => {
  try {
    const settings = db.getSettings();
    return res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const newSettings = req.body;
    if (newSettings.usdtRate !== undefined) {
      newSettings.usdtRate = parseFloat(newSettings.usdtRate);
    }
    const updated = db.updateSettings(newSettings);
    return res.json({
      success: true,
      message: '¡Configuración y Ajustes guardados exitosamente!',
      settings: updated
    });
  } catch (error) {
    next(error);
  }
};

// Users Management
exports.getUsers = async (req, res, next) => {
  try {
    const users = db.getAllUsers();
    return res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

exports.adjustUserBalance = async (req, res, next) => {
  try {
    const { userId, newBalance, mode } = req.body; // mode: 'set' | 'add' | 'subtract'
    const user = db.findUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado.' });
    }

    const amountNum = parseFloat(newBalance);
    if (isNaN(amountNum)) {
      return res.status(400).json({ success: false, error: 'Monto inválido.' });
    }

    let updatedUser;
    if (mode === 'add') {
      updatedUser = db.updateUserBalance(userId, amountNum);
    } else if (mode === 'subtract') {
      updatedUser = db.updateUserBalance(userId, -amountNum);
    } else {
      updatedUser = db.setUserBalance(userId, amountNum);
    }

    // Record audit transaction
    db.createTransaction({
      id: uuidv4(),
      userId,
      type: 'deposit',
      amount: amountNum,
      paymentMethod: 'ADMIN_AJUSTE',
      status: 'approved',
      referenceCode: 'ADMIN-' + Math.floor(1000 + Math.random() * 9000),
      notes: `Ajuste manual de saldo por Administrador (${req.user.username})`,
      createdAt: new Date().toISOString()
    });

    return res.json({
      success: true,
      message: `Saldo de ${user.username} actualizado a $${updatedUser.walletBalance.toFixed(2)} USD`,
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// Products Management (CRUD)
exports.createProduct = async (req, res, next) => {
  try {
    const { title, category, subcategory, price, stock, badge, imageUrl, description, deliveryTime } = req.body;

    if (!title || !category || price === undefined || stock === undefined) {
      return res.status(400).json({ success: false, error: 'Completa los campos obligatorios: título, categoría, precio y stock.' });
    }

    const newProduct = {
      id: 'prod-' + uuidv4().slice(0, 8),
      title: title.trim(),
      category: category.trim(),
      subcategory: subcategory ? subcategory.trim() : category.trim(),
      price: Number(parseFloat(price).toFixed(2)),
      stock: parseInt(stock, 10) || 0,
      badge: badge ? badge.trim() : 'Nuevo',
      rating: 5.0,
      imageUrl: imageUrl && imageUrl.trim() ? imageUrl.trim() : 'https://images.unsplash.com/photo-1614680376593-902f749f7cfc?auto=format&fit=crop&w=600&q=80',
      description: description ? description.trim() : 'Producto oficial entregado mediante tradeo.',
      deliveryTime: deliveryTime ? deliveryTime.trim() : 'Instantánea (1-5 min)',
      popular: true
    };

    db.addProduct(newProduct);

    return res.status(201).json({
      success: true,
      message: '¡Producto creado exitosamente en el catálogo!',
      product: newProduct
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = db.getProductById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado.' });
    }

    const updates = { ...req.body };
    if (updates.price !== undefined) updates.price = Number(parseFloat(updates.price).toFixed(2));
    if (updates.stock !== undefined) updates.stock = parseInt(updates.stock, 10);

    const updated = db.updateProduct(id, updates);

    return res.json({
      success: true,
      message: 'Producto actualizado correctamente.',
      product: updated
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteProduct(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado.' });
    }

    return res.json({
      success: true,
      message: `Producto "${deleted.title}" eliminado del catálogo.`
    });
  } catch (error) {
    next(error);
  }
};

// Orders Control
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = db.getAllOrders();
    return res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Pendiente' | 'Procesando' | 'Entregado' | 'Cancelado'

    if (!['Pendiente', 'Procesando', 'Entregado', 'Cancelado'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Estado de orden inválido.' });
    }

    const updatedOrder = db.updateOrderStatus(id, status);
    if (!updatedOrder) {
      return res.status(404).json({ success: false, error: 'Orden no encontrada.' });
    }

    return res.json({
      success: true,
      message: `Estado de la orden ${id} cambiado a "${status}".`,
      order: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

// Transactions & Deposit Review
exports.getAllTransactions = async (req, res, next) => {
  try {
    const transactions = db.getAllTransactions();
    return res.json({ success: true, count: transactions.length, transactions });
  } catch (error) {
    next(error);
  }
};

exports.reviewDeposit = async (req, res, next) => {
  try {
    const { transactionId, status, notes } = req.body; // status: 'approved' | 'rejected'
    const tx = db.getTransactionById(transactionId);
    
    if (!tx) {
      return res.status(404).json({ success: false, error: 'Transacción no encontrada.' });
    }

    if (tx.status !== 'pending') {
      return res.status(400).json({ success: false, error: `Esta recarga ya fue procesada anteriormente con estado: ${tx.status.toUpperCase()}` });
    }

    if (status === 'approved') {
      db.updateTransactionStatus(transactionId, 'approved', notes || 'Aprobado manualmente por Administrador');
      db.updateUserBalance(tx.userId, tx.amount);
      return res.json({
        success: true,
        message: `Depósito ${tx.referenceCode} APROBADO. Se han acreditado $${tx.amount.toFixed(2)} al usuario.`
      });
    } else {
      db.updateTransactionStatus(transactionId, 'rejected', notes || 'Rechazado por Administrador');
      return res.json({
        success: true,
        message: `Depósito ${tx.referenceCode} RECHAZADO.`
      });
    }
  } catch (error) {
    next(error);
  }
};
