// @ts-nocheck
const { query } = require('../config/db');

const health = (req, res) => {
  res.json({
    success: true,
    message: 'RindaSeat company service is ready'
  });
};

const listCompanies = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, name, logo_url, created_at FROM companies ORDER BY name ASC'
    );

    return res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  health,
  listCompanies
};
