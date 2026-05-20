// @ts-nocheck
const { query } = require('../config/db');

const mapTripRow = (row) => {
  const departureDate = row.departure_time ? new Date(row.departure_time) : null;
  const arrivalDate = row.arrival_time ? new Date(row.arrival_time) : null;
  const formatTime = (date) => (date
    ? date.toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Africa/Kigali' })
    : '');

  return {
    id: row.id,
    routeId: row.route_id,
    departure: row.origin_city || row.origin,
    arrival: row.destination_city || row.destination,
    departureStation: row.origin,
    arrivalStation: row.destination,
    departureDate: row.departure_time,
    arrivalDate: row.arrival_time,
    date: row.departure_time,
    departureTime: formatTime(departureDate),
    arrivalTime: formatTime(arrivalDate),
    duration: row.duration_label,
    durationMinutes: Number(row.duration_minutes || 0),
    distanceKm: row.distance_km,
    price: Number(row.ticket_price || 0),
    seatsLeft: Number(row.seats_left || 0),
    availableSeats: Number(row.seats_left || 0),
    status: row.status,
    platform: row.platform,
    company: {
      id: row.company_id,
      name: row.company_name,
      logoUrl: row.logo_url,
      rating: Number(row.rating || 0),
      reviewCount: Number(row.review_count || 0),
      amenities: row.company_amenities || [],
      supportPhone: row.support_phone,
      brandColor: row.brand_color
    },
    bus: {
      id: row.bus_id,
      name: row.bus_name,
      plateNumber: row.plate_number,
      totalSeats: Number(row.total_seats || 0),
      rows: Number(row.rows || 10),
      columns: Number(row.columns || 4),
      type: row.bus_type,
      amenities: row.bus_amenities || []
    },
    amenities: Array.from(new Set([...(row.company_amenities || []), ...(row.bus_amenities || [])]))
  };
};

const buildTripSelect = () => `
  SELECT
    trips.id,
    trips.route_id,
    trips.bus_id,
    trips.departure_time,
    trips.arrival_time,
    trips.ticket_price,
    trips.status,
    trips.platform,
    buses.plate_number,
    buses.total_seats,
    buses.bus_name,
    buses.bus_type,
    buses.amenities AS bus_amenities,
    buses.rows,
    buses.columns,
    companies.id AS company_id,
    companies.name AS company_name,
    companies.logo_url,
    companies.rating,
    companies.review_count,
    companies.amenities AS company_amenities,
    companies.support_phone,
    companies.brand_color,
    origin.name AS origin,
    origin.city AS origin_city,
    destination.name AS destination,
    destination.city AS destination_city,
    routes.distance_km,
    ROUND(EXTRACT(EPOCH FROM routes.estimated_duration) / 60) AS duration_minutes,
    CONCAT(
      FLOOR(EXTRACT(EPOCH FROM routes.estimated_duration) / 3600)::INT,
      'h ',
      LPAD(FLOOR(MOD(EXTRACT(EPOCH FROM routes.estimated_duration) / 60, 60))::INT::TEXT, 2, '0'),
      'm'
    ) AS duration_label,
    GREATEST(
      buses.total_seats - COUNT(booking_seats.id) FILTER (WHERE booking_seats.status IN ('reserved', 'confirmed')),
      0
    ) AS seats_left
  FROM trips
  JOIN buses ON buses.id = trips.bus_id
  JOIN companies ON companies.id = buses.company_id
  JOIN routes ON routes.id = trips.route_id
  JOIN stations origin ON origin.id = routes.origin_station_id
  JOIN stations destination ON destination.id = routes.destination_station_id
  LEFT JOIN booking_seats ON booking_seats.trip_id = trips.id
`;

const buildTripGroupOrder = () => `
  GROUP BY
    trips.id,
    buses.id,
    companies.id,
    routes.id,
    origin.id,
    destination.id
  ORDER BY trips.departure_time ASC
`;

const health = (req, res) => {
  res.json({
    success: true,
    message: 'RindaSeat trip service is ready'
  });
};

const listTrips = async (req, res, next) => {
  req.query = {
    ...req.query,
    limit: req.query.limit || 50
  };
  return searchTrips(req, res, next);
};

const searchTrips = async (req, res, next) => {
  try {
    const {
      from,
      to,
      date,
      company,
      busType,
      maxPrice,
      price,
      limit = 80
    } = req.query;

    const params = [];
    const where = ['trips.status IN (\'scheduled\', \'boarding\')'];

    if (from) {
      params.push(`%${String(from).toLowerCase()}%`);
      where.push(`(LOWER(origin.city) LIKE $${params.length} OR LOWER(origin.name) LIKE $${params.length})`);
    }

    if (to) {
      params.push(`%${String(to).toLowerCase()}%`);
      where.push(`(LOWER(destination.city) LIKE $${params.length} OR LOWER(destination.name) LIKE $${params.length})`);
    }

    if (date) {
      params.push(date);
      where.push(`trips.departure_time >= $${params.length}::DATE`);
      params.push(date);
      where.push(`trips.departure_time < ($${params.length}::DATE + INTERVAL '1 day')`);
    } else {
      where.push('trips.departure_time >= (NOW() - INTERVAL \'2 hours\')');
      where.push('trips.departure_time < (CURRENT_DATE + INTERVAL \'14 days\')');
    }

    if (company) {
      params.push(`%${String(company).toLowerCase()}%`);
      where.push(`(LOWER(companies.name) LIKE $${params.length} OR companies.id::TEXT = REPLACE($${params.length}, '%', ''))`);
    }

    if (busType) {
      params.push(`%${String(busType).toLowerCase()}%`);
      where.push(`LOWER(buses.bus_type) LIKE $${params.length}`);
    }

    const priceLimit = maxPrice || price;
    if (priceLimit) {
      params.push(Number(priceLimit));
      where.push(`trips.ticket_price <= $${params.length}`);
    }

    params.push(Math.min(Number(limit) || 80, 120));

    const result = await query(
      `${buildTripSelect()}
       WHERE ${where.join(' AND ')}
       ${buildTripGroupOrder()}
       LIMIT $${params.length}`,
      params
    );

    const trips = result.rows.map(mapTripRow);

    return res.json({
      success: true,
      count: trips.length,
      trips,
      data: trips
    });
  } catch (error) {
    return next(error);
  }
};

const getTripById = async (req, res, next) => {
  try {
    const result = await query(
      `${buildTripSelect()}
       WHERE trips.id = $1
       ${buildTripGroupOrder()}
       LIMIT 1`,
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    const trip = mapTripRow(result.rows[0]);

    return res.json({
      success: true,
      trip,
      data: trip
    });
  } catch (error) {
    return next(error);
  }
};

const getTripSeats = async (req, res, next) => {
  try {
    const tripResult = await query(
      `SELECT trips.id, buses.total_seats, buses.rows, buses.columns
       FROM trips
       JOIN buses ON buses.id = trips.bus_id
       WHERE trips.id = $1`,
      [req.params.id]
    );

    if (tripResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    const trip = tripResult.rows[0];
    const bookedResult = await query(
      `SELECT seat_number
       FROM booking_seats
       WHERE trip_id = $1
       AND status IN ('reserved', 'confirmed')`,
      [req.params.id]
    );

    const unavailableSeats = bookedResult.rows.map((row) => row.seat_number);

    return res.json({
      success: true,
      data: {
        rows: Number(trip.rows || 10),
        columns: Number(trip.columns || 4),
        totalSeats: Number(trip.total_seats || 40),
        unavailableSeats,
        lockedSeats: unavailableSeats
      }
    });
  } catch (error) {
    return next(error);
  }
};

const getTripsByCompany = async (req, res, next) => {
  req.query = {
    ...req.query,
    company: req.params.companyId
  };
  return searchTrips(req, res, next);
};

const getTripMeta = async (req, res, next) => {
  try {
    const [stationsResult, companiesResult, busTypesResult] = await Promise.all([
      query('SELECT id, name, city, district, province FROM stations ORDER BY city ASC'),
      query('SELECT id, name, logo_url, rating, review_count, amenities, brand_color FROM companies ORDER BY name ASC'),
      query('SELECT DISTINCT bus_type FROM buses WHERE active = true ORDER BY bus_type ASC')
    ]);

    return res.json({
      success: true,
      data: {
        stations: stationsResult.rows,
        companies: companiesResult.rows,
        busTypes: busTypesResult.rows.map((row) => row.bus_type)
      }
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  health,
  listTrips,
  searchTrips,
  getTripById,
  getTripSeats,
  getTripsByCompany,
  getTripMeta
};
