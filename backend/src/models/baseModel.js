// @ts-nocheck
const { query } = require('../config/db');

const allowedTables = new Set([
  'users',
  'companies',
  'stations',
  'buses',
  'routes',
  'trips',
  'bookings',
  'payments'
]);

const findById = async (tableName, id) => {
  if (!allowedTables.has(tableName)) {
    throw new Error(`Unsupported table lookup: ${tableName}`);
  }

  const result = await query(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);
  return result.rows[0] || null;
};

module.exports = {
  findById
};
