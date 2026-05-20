// @ts-nocheck
const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const generateToken = require('../utils/generateToken');

const getSaltRounds = () => Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

const health = (req, res) => {
  res.json({
    success: true,
    message: 'RindaSeat auth service is ready'
  });
};

const normalizeUser = (user) => ({
  id: user.id,
  fullName: user.full_name,
  name: user.full_name,
  phone: user.phone,
  email: user.email,
  role: user.role,
  createdAt: user.created_at
});

const register = async (req, res, next) => {
  try {
    const { fullName, phone, email, password } = req.body;
    const role = 'passenger';

    if (!fullName || !phone || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'fullName, phone, email, and password are required'
      });
    }

    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1 OR phone = $2',
      [email, phone]
    );

    if (existingUser.rowCount > 0) {
      return res.status(409).json({
        success: false,
        message: 'A user with that email or phone already exists'
      });
    }

    const passwordHash = await bcrypt.hash(password, getSaltRounds());
    const result = await query(
      `INSERT INTO users (full_name, phone, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, phone, email, role, created_at`,
      [fullName, phone, email, passwordHash, role]
    );

    const user = normalizeUser(result.rows[0]);
    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      data: {
        user,
        token,
        refreshToken: token
      }
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'email and password are required'
      });
    }

    const result = await query(
      'SELECT id, full_name, phone, email, password_hash, role, created_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = result.rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    delete user.password_hash;
    const normalizedUser = normalizeUser(user);
    const token = generateToken(normalizedUser);

    return res.json({
      success: true,
      data: {
        user: normalizedUser,
        token,
        refreshToken: token
      }
    });
  } catch (error) {
    return next(error);
  }
};

const profile = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, full_name, phone, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    return res.json({
      success: true,
      data: normalizeUser(result.rows[0])
    });
  } catch (error) {
    return next(error);
  }
};

const refresh = (req, res) => {
  const token = generateToken(req.user);
  return res.json({
    success: true,
    data: {
      token,
      refreshToken: token
    },
    token
  });
};

const googleAuth = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Firebase ID token is required'
      });
    }

    // Verify Firebase token
    const { getFirebaseAdmin, isFirebaseConfigured } = require('../config/firebase');
    
    if (!isFirebaseConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Firebase authentication is not configured'
      });
    }

    const admin = getFirebaseAdmin();
    let decodedToken;

    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired Firebase token'
      });
    }

    const { uid, email, name, picture } = decodedToken;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email not available from Google account'
      });
    }

    // Find or create user
    let result = await query(
      'SELECT id, full_name, phone, email, role, created_at FROM users WHERE email = $1',
      [email]
    );

    let user;
    if (result.rowCount === 0) {
      // Create new user from Google
      const newUserResult = await query(
        `INSERT INTO users (full_name, email, role, created_at)
         VALUES ($1, $2, $3, NOW())
         RETURNING id, full_name, phone, email, role, created_at`,
        [name || email.split('@')[0], email, 'passenger']
      );
      user = newUserResult.rows[0];
    } else {
      user = result.rows[0];
    }

    const normalizedUser = normalizeUser(user);
    const token = generateToken(normalizedUser);

    return res.json({
      success: true,
      data: {
        user: normalizedUser,
        token,
        refreshToken: token
      }
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  health,
  register,
  login,
  googleAuth,
  profile,
  refresh
};
