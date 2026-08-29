const db = require('../models/db');

exports.getBalance = async (req, res, next) => {
  try {
    const user = db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado.' });
    }

    const transactions = db.getTransactionsByUserId(req.user.id);

    return res.json({
      success: true,
      walletBalance: user.walletBalance,
      currency: 'USD',
      recentTransactions: transactions.slice(0, 5)
    });
  } catch (error) {
    next(error);
  }
};

exports.getTransactions = async (req, res, next) => {
  try {
    const transactions = db.getTransactionsByUserId(req.user.id);
    return res.json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    next(error);
  }
};
