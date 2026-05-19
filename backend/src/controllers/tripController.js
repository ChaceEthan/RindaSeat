// @ts-nocheck
const { query } = require('../config/db');

const health = (req, res) => {
  res.json({
    success: true,
    message: 'RindaSeat trip service is ready'
  });
};

const listTrips = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT
        trips.id,
        trips.departure_time,
        trips.arrival_time,
        trips.ticket_price,
        trips.status,
        buses.plate_number,
        buses.total_seats,
        companies.name AS company_name,
        origin.name AS origin,
        destination.name AS destination
       FROM trips
       JOIN buses ON buses.id = trips.bus_id
       JOIN companies ON companies.id = buses.company_id
       JOIN routes ON routes.id = trips.route_id
       JOIN stations origin ON origin.id = routes.origin_station_id
       JOIN stations destination ON destination.id = routes.destination_station_id
       ORDER BY trips.departure_time ASC
       LIMIT 50`
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
  listTrips
};
