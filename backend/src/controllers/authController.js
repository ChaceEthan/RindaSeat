// @ts-nocheck
const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const generateToken = require('../utils/generateToken');

const getSaltRounds = () => Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const normalizeText = (value) => String(value || '').trim();
const isUniqueViolation = (error) => error && error.code === '23505';

const health = (req, res) => {
  res.json({
    success: true,
    message: 'RindaSeat auth service is ready'
  });
};

const normalizeUser = (user) => ({
  id: user.id,
  fullName: user.full_name || user.name,
  name: user.name || user.full_name,
  phone: user.phone,
  email: user.email,
  avatar: user.avatar,
  authProvider: user.provider || user.auth_provider,
  provider: user.provider || user.auth_provider,
  role: user.role,
  isVerified: user.is_verified,
  lastLogin: user.last_login,
  createdAt: user.created_at
});

const buildAuthResponse = (user, token) => ({
  success: true,
  data: {
    user,
    token,
    refreshToken: token
  },
  user,
  token,
  refreshToken: token
});

const register = async (req, res, next) => {
  try {
    const fullName = normalizeText(req.body.fullName || req.body.name);
    const phone = normalizeText(req.body.phone);
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    const role = 'user';

    if (!fullName || !phone || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'fullName, phone, email, and password are required'
      });
    }

    const existingUser = await query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1) OR phone = $2',
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
      `INSERT INTO users (
        name,
        full_name,
        phone,
        email,
        password,
        password_hash,
        provider,
        auth_provider,
        role,
        is_verified
       )
       VALUES ($1, $1, $2, $3, $4, $4, 'email', 'email', $5, false)
       RETURNING id, name, full_name, phone, email, avatar, provider, auth_provider, role, is_verified, last_login, created_at`,
      [fullName, phone, email, passwordHash, role]
    );

    const user = normalizeUser(result.rows[0]);
    const token = generateToken(user);

    return res.status(201).json(buildAuthResponse(user, token));
  } catch (error) {
    if (isUniqueViolation(error)) {
      return res.status(409).json({
        success: false,
        message: 'A user with that email or phone already exists'
      });
    }

    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'email and password are required'
      });
    }

    const result = await query(
      `SELECT id, name, full_name, phone, email, avatar, password, password_hash, provider, auth_provider, role, is_verified, last_login, created_at
       FROM users
       WHERE LOWER(email) = LOWER($1)`,
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = result.rows[0];
    const storedPasswordHash = user.password_hash || user.password;

    if (!storedPasswordHash) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const passwordMatches = await bcrypt.compare(password, storedPasswordHash);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const updatedUser = await query(
      `UPDATE users
       SET last_login = NOW(), updated_at = NOW()
       WHERE id = $1
       RETURNING id, name, full_name, phone, email, avatar, provider, auth_provider, role, is_verified, last_login, created_at`,
      [user.id]
    );

    delete user.password;
    delete user.password_hash;
    const normalizedUser = normalizeUser(updatedUser.rows[0] || user);
    const token = generateToken(normalizedUser);

    return res.json(buildAuthResponse(normalizedUser, token));
  } catch (error) {
    return next(error);
  }
};

const profile = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, name, full_name, phone, email, avatar, provider, auth_provider, role, is_verified, last_login, created_at
       FROM users
       WHERE id = $1`,
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
    token,
    refreshToken: token
  });
};

const logout = (req, res) => {
  return res.json({
    success: true,
    message: 'Logged out'
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

    const { email, name, picture, email_verified: emailVerified } = decodedToken;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email not available from Google account'
      });
    }

    // Find or create user
    let result = await query(
      `SELECT id, name, full_name, phone, email, avatar, provider, auth_provider, role, is_verified, last_login, created_at
       FROM users
       WHERE LOWER(email) = LOWER($1)`,
      [normalizedEmail]
    );

    let user;
    if (result.rowCount === 0) {
      // Create new user from Google
      const newUserResult = await query(
        `INSERT INTO users (
          name,
          full_name,
          email,
          avatar,
          provider,
          auth_provider,
          role,
          is_verified,
          last_login,
          created_at
         )
         VALUES ($1, $1, $2, $3, 'google', 'google', 'user', $4, NOW(), NOW())
         RETURNING id, name, full_name, phone, email, avatar, provider, auth_provider, role, is_verified, last_login, created_at`,
        [
          normalizeText(name) || normalizedEmail.split('@')[0],
          normalizedEmail,
          picture || null,
          Boolean(emailVerified)
        ]
      );
      user = newUserResult.rows[0];
    } else {
      const existingUser = result.rows[0];
      const updatedUserResult = await query(
        `UPDATE users
         SET name = COALESCE(NULLIF(name, ''), $2),
             full_name = COALESCE(NULLIF(full_name, ''), $2),
             avatar = COALESCE($3, avatar),
             provider = CASE
               WHEN provider = 'email' THEN 'google'
               ELSE COALESCE(provider, auth_provider, 'google')
             END,
             auth_provider = CASE
               WHEN auth_provider = 'email' THEN 'google'
               ELSE COALESCE(auth_provider, provider, 'google')
             END,
             is_verified = is_verified OR $4,
             last_login = NOW(),
             updated_at = NOW()
         WHERE id = $1
         RETURNING id, name, full_name, phone, email, avatar, provider, auth_provider, role, is_verified, last_login, created_at`,
        [
          existingUser.id,
          normalizeText(name) || normalizedEmail.split('@')[0],
          picture || null,
          Boolean(emailVerified)
        ]
      );
      user = updatedUserResult.rows[0] || existingUser;
    }

    const normalizedUser = normalizeUser(user);
    const token = generateToken(normalizedUser);

    return res.json(buildAuthResponse(normalizedUser, token));
  } catch (error) {
    if (isUniqueViolation(error)) {
      return res.status(409).json({
        success: false,
        message: 'A user with that email already exists'
      });
    }

    return next(error);
  }
};

module.exports = {
  health,
  register,
  login,
  googleAuth,
  profile,
  refresh,
  logout
};
