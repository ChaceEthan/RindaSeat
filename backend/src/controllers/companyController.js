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
      `SELECT
        companies.id,
        companies.name,
        companies.logo_url,
        companies.rating,
        companies.review_count,
        companies.amenities,
        companies.support_phone,
        companies.brand_color,
        companies.description,
        companies.created_at,
        COUNT(DISTINCT buses.id)::INT AS bus_count,
        COUNT(DISTINCT trips.id)::INT AS scheduled_trips
       FROM companies
       LEFT JOIN buses ON buses.company_id = companies.id
       LEFT JOIN trips ON trips.bus_id = buses.id AND trips.status IN ('scheduled', 'boarding')
       GROUP BY companies.id
       ORDER BY companies.name ASC`
    );

    return res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    return next(error);
  }
};

const getCompanyById = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT
        id,
        name,
        logo_url,
        rating,
        review_count,
        amenities,
        support_phone,
        brand_color,
        description,
        created_at
       FROM companies
       WHERE id = $1`,
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    return res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    return next(error);
  }
};

const getCompanyTrips = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT trips.id, trips.departure_time, trips.ticket_price
       FROM trips
       JOIN buses ON buses.id = trips.bus_id
       WHERE buses.company_id = $1
       AND trips.status IN ('scheduled', 'boarding')
       ORDER BY trips.departure_time ASC`,
      [req.params.id]
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
  listCompanies,
  getCompanyById,
  getCompanyTrips
};
