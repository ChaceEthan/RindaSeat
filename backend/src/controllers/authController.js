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

    const user = result.rows[0];

    return res.status(201).json({
      success: true,
      data: {
        user,
        token: generateToken(user)
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

    return res.json({
      success: true,
      data: {
        user,
        token: generateToken(user)
      }
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  health,
  register,
  login
};
