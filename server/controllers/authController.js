const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/config');
const db = require('../models/db');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
};

exports.register = async (req, res, next) => {
  try {
    const { username, whatsapp, phone, email, password, robloxUsername } = req.body;
    const userWhatsApp = (whatsapp || phone || '').trim();
    const userEmail = (email || '').trim().toLowerCase();

    if (!username || (!userWhatsApp && !userEmail) || !password) {
      return res.status(400).json({ success: false, error: 'Por favor ingresa nombre de usuario, número de WhatsApp y contraseña.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    if (userWhatsApp) {
      const existingWhatsApp = db.findUserByWhatsApp(userWhatsApp);
      if (existingWhatsApp) {
        return res.status(400).json({ success: false, error: 'El número de WhatsApp ya está registrado.' });
      }
    }

    if (userEmail) {
      const existingEmail = db.findUserByEmail(userEmail);
      if (existingEmail) {
        return res.status(400).json({ success: false, error: 'El correo electrónico ya está registrado.' });
      }
    }

    const existingUsername = db.findUserByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ success: false, error: 'El nombre de usuario ya está en uso.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
      id: uuidv4(),
      username: username.trim(),
      whatsapp: userWhatsApp,
      email: userEmail,
      robloxUsername: robloxUsername ? robloxUsername.trim() : username.trim(),
      passwordHash,
      walletBalance: 0.00,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    db.createUser(newUser);

    const token = generateToken(newUser.id);
    const { passwordHash: _, ...safeUser } = newUser;

    return res.status(201).json({
      success: true,
      message: '¡Registro exitoso! Bienvenido a RecargaRoblox.',
      token,
      user: safeUser
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, identifier, whatsapp, login, password } = req.body;
    const loginIdentifier = (identifier || whatsapp || email || login || '').trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({ success: false, error: 'Proporciona tus credenciales (WhatsApp, correo o usuario) y contraseña.' });
    }

    const user = db.findUserByIdentifier(loginIdentifier);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas. Verifica tus datos y contraseña.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas. Verifica tus datos y contraseña.' });
    }

    const token = generateToken(user.id);
    const { passwordHash: _, ...safeUser } = user;

    return res.json({
      success: true,
      message: '¡Inicio de sesión exitoso!',
      token,
      user: safeUser
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    // req.user is attached by authMiddleware
    const freshUser = db.findUserById(req.user.id);
    if (!freshUser) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado.' });
    }

    const { passwordHash, ...safeUser } = freshUser;
    const orders = db.getOrdersByUserId(req.user.id);
    const transactions = db.getTransactionsByUserId(req.user.id);

    return res.json({
      success: true,
      user: safeUser,
      stats: {
        totalOrders: orders.length,
        totalTransactions: transactions.length
      }
    });
  } catch (error) {
    next(error);
  }
};
