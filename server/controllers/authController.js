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
    const { username, email, password, robloxUsername } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, error: 'Por favor ingresa nombre de usuario, correo y contraseña.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    const existingEmail = db.findUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ success: false, error: 'El correo electrónico ya está registrado.' });
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
      email: email.trim().toLowerCase(),
      robloxUsername: robloxUsername ? robloxUsername.trim() : username.trim(),
      passwordHash,
      walletBalance: 0.00,
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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Proporciona tu correo y contraseña.' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas. Verifica tu correo y contraseña.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas. Verifica tu correo y contraseña.' });
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
