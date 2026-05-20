-- Safe, idempotent seed data for local/demo environments.
-- This file never truncates or deletes production data.

WITH station_seed(station_name, district, city, province, latitude, longitude) AS (
  VALUES
    ('Nyabugogo Bus Park', 'Nyarugenge', 'Kigali', 'Kigali City', -1.939200, 30.044600),
    ('Kimironko Taxi Park', 'Gasabo', 'Kigali', 'Kigali City', -1.935300, 30.130300),
    ('Huye Main Station', 'Huye', 'Huye', 'Southern Province', -2.596700, 29.739400),
    ('Musanze Bus Station', 'Musanze', 'Musanze', 'Northern Province', -1.499800, 29.634900),
    ('Rubavu Taxi Park', 'Rubavu', 'Rubavu', 'Western Province', -1.681800, 29.313400),
    ('Rusizi Bus Station', 'Rusizi', 'Rusizi', 'Western Province', -2.483300, 28.907500),
    ('Nyagatare Bus Station', 'Nyagatare', 'Nyagatare', 'Eastern Province', -1.298700, 30.327500),
    ('Muhanga Station', 'Muhanga', 'Muhanga', 'Southern Province', -2.084500, 29.756600),
    ('Nyanza Station', 'Nyanza', 'Nyanza', 'Southern Province', -2.351900, 29.750900)
)
INSERT INTO stations (id, station_name, name, district, city, province, latitude, longitude)
SELECT
  uuid_generate_v5(uuid_ns_url(), 'rindaseat:station:' || city),
  station_name,
  station_name,
  district,
  city,
  province,
  latitude,
  longitude
FROM station_seed
ON CONFLICT (station_name) DO UPDATE SET
  name = EXCLUDED.name,
  district = EXCLUDED.district,
  city = EXCLUDED.city,
  province = EXCLUDED.province,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  updated_at = NOW();

WITH company_seed(company_name, email, phone, address, description, rating, review_count, amenities, brand_color) AS (
  VALUES
    ('Volcano Express', 'support@volcano.rw', '+250788305050', 'Nyabugogo Bus Park, Kigali', 'Premium intercity service on Rwanda northern and western corridors.', 4.8, 1840, ARRAY['WiFi', 'USB charging', 'Air conditioning', 'Reclining seats'], '#ef4444'),
    ('Ritco', 'info@ritco.rw', '+250788319333', 'Remera, Kigali', 'National coach operator connecting Kigali with all provinces.', 4.6, 2260, ARRAY['Reliable schedule', 'Large luggage hold', 'Professional drivers'], '#2563eb'),
    ('Kigali Coach', 'hello@kigalicoach.rw', '+250788440010', 'Nyabugogo, Kigali', 'Fast city-to-city coach service from Nyabugogo.', 4.5, 950, ARRAY['Express service', 'Mobile ticketing', 'Clean coaches'], '#7c3aed'),
    ('Royal Express', 'care@royalexpress.rw', '+250788771177', 'Downtown Kigali', 'Executive transport for comfort-focused passengers.', 4.7, 1215, ARRAY['Executive coach', 'Extra legroom', 'Onboard host'], '#0f766e'),
    ('Omega Bus', 'bookings@omegabus.rw', '+250788552255', 'Muhanga Road, Kigali', 'Affordable daily services across Rwanda.', 4.4, 780, ARRAY['Affordable fares', 'Daily departures', 'Parcel desk'], '#f97316'),
    ('Virunga Express', 'travel@virungaexpress.rw', '+250788660066', 'Musanze Road, Kigali', 'Specialist service for Musanze, Rubavu, and Virunga corridor trips.', 4.6, 1090, ARRAY['Mountain route experts', 'WiFi', 'USB charging'], '#16a34a')
)
INSERT INTO companies (id, company_name, name, email, phone, support_phone, address, description, verified, rating, review_count, amenities, brand_color)
SELECT
  uuid_generate_v5(uuid_ns_url(), 'rindaseat:company:' || lower(company_name)),
  company_name,
  company_name,
  email,
  phone,
  phone,
  address,
  description,
  true,
  rating,
  review_count,
  amenities,
  brand_color
FROM company_seed
ON CONFLICT (company_name) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  support_phone = EXCLUDED.support_phone,
  address = EXCLUDED.address,
  description = EXCLUDED.description,
  verified = EXCLUDED.verified,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  amenities = EXCLUDED.amenities,
  brand_color = EXCLUDED.brand_color,
  updated_at = NOW();

WITH bus_seed(company_name, plate_number, bus_name, total_seats, rows, columns, bus_type, amenities) AS (
  VALUES
    ('Volcano Express', 'RAC 201 V', 'Volcano Premium 201', 40, 10, 4, 'Premium Coach', ARRAY['WiFi', 'USB charging', 'Air conditioning']),
    ('Volcano Express', 'RAC 202 V', 'Volcano Express 202', 40, 10, 4, 'Executive Coach', ARRAY['WiFi', 'Air conditioning']),
    ('Ritco', 'RAD 118 R', 'Ritco Intercity 118', 45, 11, 4, 'Standard Coach', ARRAY['Large luggage hold', 'Professional driver']),
    ('Ritco', 'RAD 119 R', 'Ritco Express 119', 45, 11, 4, 'Standard Coach', ARRAY['Large luggage hold', 'Mobile ticketing']),
    ('Kigali Coach', 'RAE 410 K', 'Kigali Coach 410', 40, 10, 4, 'Executive Coach', ARRAY['Express service', 'USB charging']),
    ('Royal Express', 'RAF 550 X', 'Royal Executive 550', 36, 9, 4, 'Executive Coach', ARRAY['Extra legroom', 'USB charging', 'Air conditioning']),
    ('Omega Bus', 'RAG 707 O', 'Omega Daily 707', 45, 11, 4, 'Standard Coach', ARRAY['Affordable fares', 'Parcel desk']),
    ('Virunga Express', 'RAH 330 G', 'Virunga Mountain 330', 40, 10, 4, 'Premium Coach', ARRAY['WiFi', 'USB charging', 'Air conditioning'])
)
INSERT INTO buses (id, company_id, plate_number, bus_name, total_seats, rows, columns, bus_type, amenities, active)
SELECT
  uuid_generate_v5(uuid_ns_url(), 'rindaseat:bus:' || plate_number),
  companies.id,
  bus_seed.plate_number,
  bus_seed.bus_name,
  bus_seed.total_seats,
  bus_seed.rows,
  bus_seed.columns,
  bus_seed.bus_type,
  bus_seed.amenities,
  true
FROM bus_seed
JOIN companies ON companies.company_name = bus_seed.company_name
ON CONFLICT (plate_number) DO UPDATE SET
  company_id = EXCLUDED.company_id,
  bus_name = EXCLUDED.bus_name,
  total_seats = EXCLUDED.total_seats,
  rows = EXCLUDED.rows,
  columns = EXCLUDED.columns,
  bus_type = EXCLUDED.bus_type,
  amenities = EXCLUDED.amenities,
  active = true,
  updated_at = NOW();

WITH route_seed(origin_city, destination_city, duration_text, distance_km) AS (
  VALUES
    ('Kigali', 'Huye', '3 hours', 135),
    ('Kigali', 'Musanze', '2 hours 15 minutes', 105),
    ('Kigali', 'Rubavu', '3 hours 30 minutes', 157),
    ('Kigali', 'Rusizi', '6 hours 30 minutes', 276),
    ('Kigali', 'Nyagatare', '2 hours 40 minutes', 156),
    ('Huye', 'Kigali', '3 hours', 135),
    ('Musanze', 'Kigali', '2 hours 15 minutes', 105),
    ('Rubavu', 'Kigali', '3 hours 30 minutes', 157)
)
INSERT INTO routes (origin_station_id, destination_station_id, estimated_duration, distance_km, active)
SELECT origin.id, destination.id, route_seed.duration_text::INTERVAL, route_seed.distance_km, true
FROM route_seed
JOIN stations origin ON origin.city = route_seed.origin_city
JOIN stations destination ON destination.city = route_seed.destination_city
ON CONFLICT (origin_station_id, destination_station_id) DO UPDATE SET
  estimated_duration = EXCLUDED.estimated_duration,
  distance_km = EXCLUDED.distance_km,
  active = true,
  updated_at = NOW();

WITH trip_seed(origin_city, destination_city, plate_number, day_offset, departure_clock, price, platform) AS (
  VALUES
    ('Kigali', 'Huye', 'RAC 201 V', 0, '07:00'::TIME, 4200, 'Bay 4'),
    ('Kigali', 'Huye', 'RAD 118 R', 0, '10:30'::TIME, 3800, 'Bay 2'),
    ('Kigali', 'Musanze', 'RAH 330 G', 0, '08:00'::TIME, 3600, 'Bay 5'),
    ('Kigali', 'Rubavu', 'RAC 202 V', 0, '14:30'::TIME, 5600, 'Bay 4'),
    ('Huye', 'Kigali', 'RAC 201 V', 1, '08:30'::TIME, 4200, 'Stand 1'),
    ('Musanze', 'Kigali', 'RAH 330 G', 1, '16:00'::TIME, 3600, 'Stand 2')
)
INSERT INTO trips (bus_id, route_id, departure_time, arrival_time, available_seats, ticket_price, status, platform, notes)
SELECT
  buses.id,
  routes.id,
  (CURRENT_DATE + trip_seed.day_offset + trip_seed.departure_clock) AT TIME ZONE 'Africa/Kigali',
  ((CURRENT_DATE + trip_seed.day_offset + trip_seed.departure_clock) AT TIME ZONE 'Africa/Kigali') + routes.estimated_duration,
  buses.total_seats,
  trip_seed.price,
  'scheduled',
  trip_seed.platform,
  'Demo schedule seeded for RindaSeat Rwanda transport testing'
FROM trip_seed
JOIN stations origin ON origin.city = trip_seed.origin_city
JOIN stations destination ON destination.city = trip_seed.destination_city
JOIN routes ON routes.origin_station_id = origin.id AND routes.destination_station_id = destination.id
JOIN buses ON buses.plate_number = trip_seed.plate_number
ON CONFLICT (bus_id, route_id, departure_time) DO UPDATE SET
  arrival_time = EXCLUDED.arrival_time,
  available_seats = EXCLUDED.available_seats,
  ticket_price = EXCLUDED.ticket_price,
  status = 'scheduled',
  platform = EXCLUDED.platform,
  notes = EXCLUDED.notes,
  updated_at = NOW();
