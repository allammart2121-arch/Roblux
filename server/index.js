const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const config = require('./config/config');
const { seedDatabase } = require('./seed/seedData');
const authMiddleware = require('./middleware/authMiddleware');
const adminMiddleware = require('./middleware/adminMiddleware');
const errorHandler = require('./middleware/errorHandler');

// Controllers
const authController = require('./controllers/authController');
const productController = require('./controllers/productController');
const walletController = require('./controllers/walletController');
const paymentController = require('./controllers/paymentController');
const orderController = require('./controllers/orderController');
const adminController = require('./controllers/adminController');

const app = express();

// Middlewares - Increased JSON body limit to 50mb for image uploads
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Seed Data
seedDatabase();

// --- PUBLIC & USER API ROUTES ---

// Public Site Settings Route
app.get('/api/settings', adminController.getSettings);

// Auth Routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.get('/api/auth/me', authMiddleware, authController.getProfile);

// Catalog Routes
app.get('/api/products', productController.getProducts);
app.get('/api/products/:id', productController.getProductById);

// Wallet Routes
app.get('/api/wallet/balance', authMiddleware, walletController.getBalance);
app.get('/api/wallet/transactions', authMiddleware, walletController.getTransactions);

// Payment Gateway Routes
app.post('/api/payments/initiate', authMiddleware, paymentController.initiatePayment);
app.post('/api/payments/process', authMiddleware, paymentController.processPayment);
app.get('/api/payments/status/:id', authMiddleware, paymentController.getTransactionStatus);

// Order & Checkout Routes
app.post('/api/orders/checkout', authMiddleware, orderController.createOrder);
app.get('/api/orders', authMiddleware, orderController.getUserOrders);
app.get('/api/orders/:id', authMiddleware, orderController.getOrderById);

// --- ADMIN API ROUTES (PROTECTED BY JWT + ADMIN ROLE) ---
app.use('/api/admin', authMiddleware, adminMiddleware);

app.get('/api/admin/stats', adminController.getStats);
app.get('/api/admin/settings', adminController.getSettings);
app.put('/api/admin/settings', adminController.updateSettings);

app.get('/api/admin/users', adminController.getUsers);
app.post('/api/admin/users/balance', adminController.adjustUserBalance);

app.post('/api/admin/products', adminController.createProduct);
app.put('/api/admin/products/:id', adminController.updateProduct);
app.delete('/api/admin/products/:id', adminController.deleteProduct);

app.get('/api/admin/orders', adminController.getAllOrders);
app.put('/api/admin/orders/:id/status', adminController.updateOrderStatus);

app.get('/api/admin/transactions', adminController.getAllTransactions);
app.post('/api/admin/transactions/review', adminController.reviewDeposit);

// --- STATIC FILE SERVING FOR 2 INDEPENDENT PORTALS ---
const clientDistPath = path.resolve(__dirname, '..', 'client', 'dist');
console.log(`📁 Rutas estáticas de cliente cargadas en: ${clientDistPath}`);

app.use(express.static(clientDistPath));

// Route 1: Exclusive Admin Portal (/admin)
app.get('/admin*', (req, res) => {
  const adminFilePath = path.join(clientDistPath, 'admin.html');
  if (fs.existsSync(adminFilePath)) {
    return res.sendFile(adminFilePath);
  }
  return res.status(200).send('API Server Activo. Compilando Portal Admin...');
});

// Route 2: Exclusive Customer Portal (/)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, error: 'Endpoint no encontrado.' });
  }
  const clientFilePath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(clientFilePath)) {
    return res.sendFile(clientFilePath);
  }
  return res.status(200).send('API Server Activo. Compilando Portal Cliente...');
});

// Central Error Handling
app.use(errorHandler);

// Start Server
app.listen(config.PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 Servidor BloxShop corriendo en puerto: ${config.PORT}`);
  console.log(`🛒 Portal de Clientes: http://localhost:${config.PORT}/`);
  console.log(`👑 Portal de Administrador: http://localhost:${config.PORT}/admin`);
  console.log(`=================================================`);
});
