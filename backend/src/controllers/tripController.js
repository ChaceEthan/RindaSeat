// @ts-nocheck
const { query } = require('../config/db');
const { getSocket } = require('../config/socket');
const { isUuid } = require('../utils/uuid');

const liveTripLocations = new Map();
const passengerPickupMarkers = new Map();

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
    if (!isUuid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

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
    if (!isUuid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

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
      `SELECT seat_number, status
       FROM booking_seats
       WHERE trip_id = $1
       AND status IN ('reserved', 'confirmed')`,
      [req.params.id]
    );

    const unavailableSeats = bookedResult.rows
      .filter((row) => row.status === 'confirmed')
      .map((row) => row.seat_number);
    const reservedSeats = bookedResult.rows
      .filter((row) => row.status === 'reserved')
      .map((row) => row.seat_number);
    const lockedSeats = bookedResult.rows.map((row) => row.seat_number);

    return res.json({
      success: true,
      data: {
        rows: Number(trip.rows || 10),
        columns: Number(trip.columns || 4),
        totalSeats: Number(trip.total_seats || 40),
        unavailableSeats,
        reservedSeats,
        lockedSeats
      }
    });
  } catch (error) {
    return next(error);
  }
};

const getStoredPassengerMarkers = (tripId) => (
  Array.from(passengerPickupMarkers.values())
    .filter((marker) => String(marker.tripId) === String(tripId))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
);

const emitTripEvent = (tripId, eventName, payload) => {
  try {
    getSocket().to(`trip:${tripId}`).emit(eventName, payload);
  } catch (error) {
    // Socket.IO is optional in tests and cold starts.
  }
};

const buildSyntheticTracking = (tripId) => {
  const seed = String(tripId || 'demo').split('').reduce((total, char) => total + char.charCodeAt(0), 0);
  const seatsLeft = Math.max(2, 18 - (seed % 15));
  const totalSeats = 40;
  const progressPercent = Math.max(12, Math.min(88, 20 + (seed % 63)));
  const stops = ['Nyabugogo', 'Sonatubes', 'Gishushu', 'Remera', 'Destination terminal'];
  const currentIndex = Math.min(stops.length - 2, Math.floor((progressPercent / 100) * (stops.length - 1)));

  return {
    tripId,
    source: 'synthetic-live-tracking',
    currentLocation: stops[currentIndex],
    nextStop: stops[currentIndex + 1],
    latitude: -1.9392 + ((seed % 18) / 1000),
    longitude: 30.0446 + ((seed % 21) / 1000),
    heading: seed % 360,
    speedKph: 38 + (seed % 28),
    progressPercent,
    seatsLeft,
    totalSeats,
    passengersOnboard: totalSeats - seatsLeft,
    occupancyPercent: Math.round(((totalSeats - seatsLeft) / totalSeats) * 100),
    status: seatsLeft <= 0 ? 'full' : 'bookable_on_route',
    etaToNextStop: `${8 + (seed % 13)} min`,
    nearestPickupPoint: stops[currentIndex + 1],
    remainingStops: stops.slice(currentIndex + 1).map((name, index) => ({
      name,
      eta: `${8 + (index * 12) + (seed % 6)} min`
    })),
    updatedAt: new Date().toISOString()
  };
};

const loadTrackingSnapshot = async (tripId) => {
  if (!isUuid(tripId)) {
    return buildSyntheticTracking(tripId);
  }

  const result = await query(
    `${buildTripSelect()}
     WHERE trips.id = $1
     ${buildTripGroupOrder()}
     LIMIT 1`,
    [tripId]
  );

  if (result.rowCount === 0) {
    return null;
  }

  const trip = mapTripRow(result.rows[0]);
  const storedLocation = liveTripLocations.get(String(tripId)) || {};
  const seatsLeft = Number(storedLocation.seatsLeft ?? trip.seatsLeft ?? 0);
  const totalSeats = Number(trip.bus?.totalSeats || 1);
  const passengersOnboard = Math.max(0, totalSeats - seatsLeft);
  const progressPercent = Number(storedLocation.progressPercent || (trip.status === 'boarding' ? 8 : 0));
  const routeStops = [
    trip.departureStation,
    trip.departure,
    trip.arrivalStation
  ].filter(Boolean);

  return {
    tripId,
    routeId: trip.routeId,
    operator: trip.company.name,
    bus: trip.bus,
    departure: trip.departure,
    arrival: trip.arrival,
    departureTime: trip.departureTime,
    arrivalTime: trip.arrivalTime,
    currentLocation: storedLocation.currentLocation || trip.departureStation,
    nextStop: storedLocation.nextStop || trip.arrivalStation,
    latitude: Number(storedLocation.latitude || 0),
    longitude: Number(storedLocation.longitude || 0),
    heading: Number(storedLocation.heading || 0),
    speedKph: Number(storedLocation.speedKph || 0),
    progressPercent,
    seatsLeft,
    totalSeats,
    passengersOnboard,
    occupancyPercent: Math.round((passengersOnboard / Math.max(1, totalSeats)) * 100),
    status: seatsLeft <= 0 ? 'full' : trip.status === 'departed' ? 'bookable_on_route' : trip.status,
    etaToNextStop: storedLocation.etaToNextStop || trip.arrivalTime,
    nearestPickupPoint: storedLocation.nearestPickupPoint || trip.departureStation,
    remainingStops: routeStops.map((name, index) => ({
      name,
      eta: index === 0 ? 'now' : `${Math.max(8, index * 18)} min`
    })),
    updatedAt: storedLocation.updatedAt || new Date().toISOString()
  };
};

const getTripTracking = async (req, res, next) => {
  try {
    const tracking = await loadTrackingSnapshot(req.params.id);

    if (!tracking) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    return res.json({
      success: true,
      tracking,
      data: tracking
    });
  } catch (error) {
    return next(error);
  }
};

const updateTripLocation = async (req, res, next) => {
  try {
    const tripId = req.params.id;
    const payload = {
      tripId,
      latitude: Number(req.body.latitude),
      longitude: Number(req.body.longitude),
      heading: Number(req.body.heading || 0),
      speedKph: Number(req.body.speedKph || req.body.speed || 0),
      currentLocation: req.body.currentLocation || req.body.nearestStop || null,
      nextStop: req.body.nextStop || null,
      nearestPickupPoint: req.body.nearestPickupPoint || req.body.pickupPoint || null,
      seatsLeft: req.body.seatsLeft === undefined ? undefined : Number(req.body.seatsLeft),
      progressPercent: req.body.progressPercent === undefined ? undefined : Number(req.body.progressPercent),
      etaToNextStop: req.body.etaToNextStop || null,
      driverId: req.user?.id || null,
      updatedAt: new Date().toISOString()
    };

    if (!Number.isFinite(payload.latitude) || !Number.isFinite(payload.longitude)) {
      return res.status(400).json({
        success: false,
        message: 'latitude and longitude are required'
      });
    }

    const previous = liveTripLocations.get(String(tripId)) || {};
    const nextLocation = Object.fromEntries(
      Object.entries({ ...previous, ...payload }).filter(([, value]) => value !== undefined && value !== null)
    );

    liveTripLocations.set(String(tripId), nextLocation);
    emitTripEvent(tripId, 'driver-location', nextLocation);

    return res.json({
      success: true,
      tracking: nextLocation,
      data: nextLocation
    });
  } catch (error) {
    return next(error);
  }
};

const sharePassengerLocation = async (req, res, next) => {
  try {
    const tripId = req.params.id;
    const marker = {
      id: `${tripId}:${req.user?.id || req.body.passengerId || Date.now()}`,
      tripId,
      passengerId: req.user?.id || req.body.passengerId || null,
      passengerName: req.body.passengerName || req.user?.name || 'Passenger',
      phone: req.body.phone || req.body.passengerPhone || null,
      pickupPoint: req.body.pickupPoint || req.body.nearestPickupPoint || 'Roadside pickup',
      latitude: Number(req.body.latitude),
      longitude: Number(req.body.longitude),
      seatsRequested: Number(req.body.seatsRequested || req.body.seatCount || 1),
      status: req.body.status || 'waiting',
      updatedAt: new Date().toISOString()
    };

    if (!Number.isFinite(marker.latitude) || !Number.isFinite(marker.longitude)) {
      return res.status(400).json({
        success: false,
        message: 'latitude and longitude are required'
      });
    }

    passengerPickupMarkers.set(marker.id, marker);
    emitTripEvent(tripId, 'passenger-pickup-marker', marker);

    return res.status(201).json({
      success: true,
      marker,
      data: marker
    });
  } catch (error) {
    return next(error);
  }
};

const getDriverDashboard = async (req, res, next) => {
  try {
    const tracking = await loadTrackingSnapshot(req.params.id);

    if (!tracking) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    const markers = getStoredPassengerMarkers(req.params.id);
    const dashboard = {
      tripId: req.params.id,
      tracking,
      passengerMarkers: markers,
      pickupIndicators: markers.map((marker) => ({
        passengerId: marker.passengerId,
        pickupPoint: marker.pickupPoint,
        status: marker.status === 'boarded' ? 'green' : 'red',
        latitude: marker.latitude,
        longitude: marker.longitude
      })),
      qrVerification: {
        enabled: true,
        actions: ['scan_qr_ticket', 'confirm_boarding', 'mark_no_show']
      },
      occupancy: {
        remainingSeats: tracking.seatsLeft,
        totalSeats: tracking.totalSeats,
        percentage: tracking.occupancyPercent,
        isFull: tracking.seatsLeft <= 0
      },
      realtimeChannels: [
        `trip:${req.params.id}`,
        'driver-location',
        'passenger-pickup-marker',
        'seat-inventory',
        'boarding-confirmation'
      ]
    };

    return res.json({
      success: true,
      dashboard,
      data: dashboard
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
    const stationHierarchy = stationsResult.rows.reduce((groups, station) => {
      const province = groups[station.province] || {
        name: station.province,
        districts: {}
      };
      const district = province.districts[station.district] || {
        name: station.district,
        city: station.city,
        stations: []
      };

      district.stations.push(station);
      province.districts[station.district] = district;
      groups[station.province] = province;
      return groups;
    }, {});

    return res.json({
      success: true,
      data: {
        stations: stationsResult.rows,
        stationHierarchy: Object.values(stationHierarchy).map((province) => ({
          ...province,
          districts: Object.values(province.districts)
        })),
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
  getTripTracking,
  updateTripLocation,
  sharePassengerLocation,
  getDriverDashboard,
  getTripsByCompany,
  getTripMeta
};
