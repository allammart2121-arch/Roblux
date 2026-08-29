const fs = require('fs');
const path = require('path');
const config = require('../config/config');

class LocalDB {
  constructor() {
    this.dbPath = config.DB_PATH;
    this.dirPath = path.dirname(this.dbPath);
    this.data = {
      users: [],
      products: [],
      orders: [],
      transactions: [],
      settings: {
        usdtRate: 42.50,
        pagoMovilBank: 'Banesco (0134)',
        pagoMovilPhone: '0414-123-4567',
        pagoMovilId: 'J-40129384-9',
        usdtWalletAddress: 'TYu8x9KP2mN4vLqW1zRsA6bC8dE9fG0hJ',
        pagoMovilActive: true,
        cardActive: true,
        cryptoActive: true,
        supportPhone: '+58 414 123 4567',
        bannerNotice: '¡Recargas de Robux y Tradeos MM2 activos las 24 horas! Tasa oficial del día.'
      }
    };
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(this.dirPath)) {
        fs.mkdirSync(this.dirPath, { recursive: true });
      }

      if (fs.existsSync(this.dbPath)) {
        const fileContent = fs.readFileSync(this.dbPath, 'utf8');
        if (fileContent.trim()) {
          const parsed = JSON.parse(fileContent);
          this.data = {
            ...this.data,
            ...parsed,
            settings: { ...this.data.settings, ...(parsed.settings || {}) }
          };
        } else {
          this.save();
        }
      } else {
        this.save();
      }
    } catch (error) {
      console.error('Error initializing database file:', error);
    }
  }

  save() {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }

  // Settings
  getSettings() {
    return this.data.settings || {};
  }

  updateSettings(newSettings) {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.save();
    return this.data.settings;
  }

  // Users
  getAllUsers() {
    return this.data.users.map(({ passwordHash, ...safeUser }) => safeUser);
  }

  findUserByEmail(email) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  findUserByUsername(username) {
    return this.data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  createUser(user) {
    if (!user.role) user.role = 'user';
    this.data.users.push(user);
    this.save();
    return user;
  }

  updateUser(id, updates) {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.data.users[index] = { ...this.data.users[index], ...updates };
      this.save();
      return this.data.users[index];
    }
    return null;
  }

  updateUserBalance(id, deltaAmount) {
    const user = this.findUserById(id);
    if (!user) return null;
    const currentBalance = parseFloat(user.walletBalance || 0);
    const newBalance = Math.max(0, currentBalance + parseFloat(deltaAmount));
    return this.updateUser(id, { walletBalance: Number(newBalance.toFixed(2)) });
  }

  setUserBalance(id, exactBalance) {
    const user = this.findUserById(id);
    if (!user) return null;
    return this.updateUser(id, { walletBalance: Number(Math.max(0, exactBalance).toFixed(2)) });
  }

  // Products
  getProducts() {
    return this.data.products;
  }

  getProductById(id) {
    return this.data.products.find(p => p.id === id);
  }

  saveProducts(productsList) {
    this.data.products = productsList;
    this.save();
  }

  addProduct(product) {
    this.data.products.unshift(product);
    this.save();
    return product;
  }

  updateProduct(id, updates) {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.data.products[index] = { ...this.data.products[index], ...updates };
      this.save();
      return this.data.products[index];
    }
    return null;
  }

  deleteProduct(id) {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index !== -1) {
      const deleted = this.data.products.splice(index, 1);
      this.save();
      return deleted[0];
    }
    return null;
  }

  updateProductStock(id, quantityToDeduct) {
    const product = this.getProductById(id);
    if (product) {
      product.stock = Math.max(0, product.stock - quantityToDeduct);
      this.save();
      return product;
    }
    return null;
  }

  // Orders
  createOrder(order) {
    this.data.orders.unshift(order);
    this.save();
    return order;
  }

  getOrdersByUserId(userId) {
    return this.data.orders.filter(o => o.userId === userId);
  }

  getAllOrders() {
    return this.data.orders;
  }

  updateOrderStatus(orderId, status) {
    const order = this.data.orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
      this.save();
      return order;
    }
    return null;
  }

  // Transactions (Wallet deposits & purchases)
  createTransaction(tx) {
    this.data.transactions.unshift(tx);
    this.save();
    return tx;
  }

  getTransactionById(id) {
    return this.data.transactions.find(t => t.id === id);
  }

  getAllTransactions() {
    return this.data.transactions;
  }

  updateTransactionStatus(id, status, notes = '') {
    const tx = this.getTransactionById(id);
    if (tx) {
      tx.status = status;
      if (notes) tx.notes = notes;
      tx.updatedAt = new Date().toISOString();
      this.save();
      return tx;
    }
    return null;
  }

  getTransactionsByUserId(userId) {
    return this.data.transactions.filter(t => t.userId === userId);
  }
}

const db = new LocalDB();
module.exports = db;
