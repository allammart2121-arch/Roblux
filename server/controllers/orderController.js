const { v4: uuidv4 } = require('uuid');
const db = require('../models/db');

exports.createOrder = async (req, res, next) => {
  try {
    const { items, paymentMethod, robloxTargetUser } = req.body;
    const userId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'El carrito de compras está vacío.' });
    }

    const currentUser = db.findUserById(userId);
    if (!currentUser) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado.' });
    }

    let calculatedTotal = 0;
    const orderItems = [];

    // Verify inventory stock & compute total
    for (const item of items) {
      const product = db.getProductById(item.productId);
      if (!product) {
        return res.status(404).json({ 
          success: false, 
          error: `El producto ID "${item.productId}" ya no existe en el catálogo.` 
        });
      }

      const qty = parseInt(item.quantity, 10) || 1;
      if (product.stock < qty) {
        return res.status(400).json({ 
          success: false, 
          error: `Stock insuficiente para "${product.title}". Stock disponible: ${product.stock}` 
        });
      }

      const itemTotal = product.price * qty;
      calculatedTotal += itemTotal;

      orderItems.push({
        productId: product.id,
        title: product.title,
        category: product.category,
        price: product.price,
        quantity: qty,
        itemTotal: Number(itemTotal.toFixed(2)),
        imageUrl: product.imageUrl,
        deliveryTime: product.deliveryTime
      });
    }

    calculatedTotal = Number(calculatedTotal.toFixed(2));

    // Handle Payment Method
    if (paymentMethod === 'wallet') {
      if (currentUser.walletBalance < calculatedTotal) {
        return res.status(400).json({
          success: false,
          error: `Saldo en Billetera insuficiente. Tu saldo actual es $${currentUser.walletBalance.toFixed(2)}, pero el total a pagar es $${calculatedTotal.toFixed(2)}.`
        });
      }

      // Deduct balance
      db.updateUserBalance(userId, -calculatedTotal);
    }

    // Deduct inventory stock for each item
    for (const orderItem of orderItems) {
      db.updateProductStock(orderItem.productId, orderItem.quantity);
    }

    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    const order = {
      id: orderId,
      userId,
      items: orderItems,
      totalAmount: calculatedTotal,
      paymentMethod,
      robloxTargetUser: robloxTargetUser || currentUser.robloxUsername || currentUser.username,
      status: 'Entregado',
      createdAt: new Date().toISOString()
    };

    db.createOrder(order);

    // Record purchase transaction
    const tx = {
      id: uuidv4(),
      userId,
      type: 'purchase',
      amount: calculatedTotal,
      paymentMethod,
      status: 'approved',
      referenceCode: orderId,
      notes: `Compra de ${orderItems.length} producto(s) en tienda`,
      createdAt: new Date().toISOString()
    };

    db.createTransaction(tx);

    const updatedUser = db.findUserById(userId);

    return res.status(201).json({
      success: true,
      message: '¡Compra completada con éxito! Tus ítems / Robux están en proceso de acreditación.',
      order,
      newBalance: updatedUser.walletBalance
    });

  } catch (error) {
    next(error);
  }
};

exports.getUserOrders = async (req, res, next) => {
  try {
    const orders = db.getOrdersByUserId(req.user.id);
    return res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const orders = db.getOrdersByUserId(req.user.id);
    const order = orders.find(o => o.id === id);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Orden no encontrada.' });
    }

    return res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};
