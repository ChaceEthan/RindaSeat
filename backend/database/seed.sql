TRUNCATE TABLE booking_seats, payments, bookings, trips, buses, routes RESTART IDENTITY CASCADE;

DELETE FROM companies
WHERE name IN (
  'Volcano Express',
  'Ritco',
  'RITCO',
  'Kigali Coach',
  'Royal Express',
  'Omega Bus',
  'Virunga Express',
  'Horizon',
  'Alpha Express'
);

DELETE FROM stations
WHERE name IN (
  'Nyabugogo',
  'Nyabugogo Bus Park',
  'Huye',
  'Huye Main Station',
  'Ruhango',
  'Nyamata',
  'Kabuga',
  'Nyanza',
  'Nyanza Station',
  'Musanze Bus Station',
  'Rubavu Taxi Park',
  'Rusizi Bus Station',
  'Nyagatare Bus Station',
  'Muhanga Station'
);

WITH station_seed(name, district, city, province, latitude, longitude) AS (
  VALUES
    ('Nyabugogo Bus Park', 'Nyarugenge', 'Kigali', 'Kigali City', -1.939200, 30.044600),
    ('Huye Main Station', 'Huye', 'Huye', 'Southern Province', -2.596700, 29.739400),
    ('Musanze Bus Station', 'Musanze', 'Musanze', 'Northern Province', -1.499800, 29.634900),
    ('Rubavu Taxi Park', 'Rubavu', 'Rubavu', 'Western Province', -1.681800, 29.313400),
    ('Rusizi Bus Station', 'Rusizi', 'Rusizi', 'Western Province', -2.483300, 28.907500),
    ('Nyagatare Bus Station', 'Nyagatare', 'Nyagatare', 'Eastern Province', -1.298700, 30.327500),
    ('Muhanga Station', 'Muhanga', 'Muhanga', 'Southern Province', -2.084500, 29.756600),
    ('Nyanza Station', 'Nyanza', 'Nyanza', 'Southern Province', -2.351900, 29.750900)
)
INSERT INTO stations (id, name, district, city, province, latitude, longitude)
SELECT uuid_generate_v5(uuid_ns_url(), 'rindaseat:station:' || city), name, district, city, province, latitude, longitude
FROM station_seed
ON CONFLICT (name) DO UPDATE SET
  district = EXCLUDED.district,
  city = EXCLUDED.city,
  province = EXCLUDED.province,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude;

WITH company_seed(name, logo_url, rating, review_count, amenities, support_phone, brand_color, description) AS (
  VALUES
    ('Volcano Express', null, 4.8, 1840, ARRAY['WiFi', 'USB charging', 'Air conditioning', 'Reclining seats'], '+250788305050', '#ef4444', 'Premium intercity service on Rwanda northern and western corridors.'),
    ('Ritco', null, 4.6, 2260, ARRAY['Reliable schedule', 'Large luggage hold', 'Professional drivers'], '+250788319333', '#2563eb', 'National coach operator connecting Kigali with all provinces.'),
    ('Kigali Coach', null, 4.5, 950, ARRAY['Express service', 'Mobile ticketing', 'Clean coaches'], '+250788440010', '#7c3aed', 'Fast city-to-city coach service from Nyabugogo.'),
    ('Royal Express', null, 4.7, 1215, ARRAY['Executive coach', 'Extra legroom', 'Onboard host'], '+250788771177', '#0f766e', 'Executive transport for comfort-focused passengers.'),
    ('Omega Bus', null, 4.4, 780, ARRAY['Affordable fares', 'Daily departures', 'Parcel desk'], '+250788552255', '#f97316', 'Affordable daily services across Rwanda.'),
    ('Virunga Express', null, 4.6, 1090, ARRAY['Mountain route experts', 'WiFi', 'USB charging'], '+250788660066', '#16a34a', 'Specialist service for Musanze, Rubavu, and Virunga corridor trips.')
)
INSERT INTO companies (id, name, logo_url, rating, review_count, amenities, support_phone, brand_color, description)
SELECT uuid_generate_v5(uuid_ns_url(), 'rindaseat:company:' || lower(name)), name, logo_url, rating, review_count, amenities, support_phone, brand_color, description
FROM company_seed
ON CONFLICT (name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  amenities = EXCLUDED.amenities,
  support_phone = EXCLUDED.support_phone,
  brand_color = EXCLUDED.brand_color,
  description = EXCLUDED.description;

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
JOIN companies ON companies.name = bus_seed.company_name
ON CONFLICT (plate_number) DO UPDATE SET
  company_id = EXCLUDED.company_id,
  bus_name = EXCLUDED.bus_name,
  total_seats = EXCLUDED.total_seats,
  rows = EXCLUDED.rows,
  columns = EXCLUDED.columns,
  bus_type = EXCLUDED.bus_type,
  amenities = EXCLUDED.amenities,
  active = true;

WITH route_seed(origin_city, destination_city, duration_text, distance_km) AS (
  VALUES
    ('Kigali', 'Huye', '3 hours', 135),
    ('Kigali', 'Musanze', '2 hours 15 minutes', 105),
    ('Kigali', 'Rubavu', '3 hours 30 minutes', 157),
    ('Kigali', 'Rusizi', '6 hours 30 minutes', 276),
    ('Kigali', 'Nyagatare', '2 hours 40 minutes', 156),
    ('Huye', 'Kigali', '3 hours', 135),
    ('Musanze', 'Kigali', '2 hours 15 minutes', 105),
    ('Rubavu', 'Kigali', '3 hours 30 minutes', 157),
    ('Kigali', 'Muhanga', '1 hour 20 minutes', 52),
    ('Muhanga', 'Kigali', '1 hour 20 minutes', 52),
    ('Huye', 'Nyanza', '45 minutes', 36),
    ('Nyanza', 'Kigali', '2 hours 15 minutes', 98)
)
INSERT INTO routes (origin_station_id, destination_station_id, estimated_duration, distance_km, active)
SELECT
  origin.id,
  destination.id,
  route_seed.duration_text::INTERVAL,
  route_seed.distance_km,
  true
FROM route_seed
JOIN stations origin ON origin.city = route_seed.origin_city
JOIN stations destination ON destination.city = route_seed.destination_city
ON CONFLICT (origin_station_id, destination_station_id) DO UPDATE SET
  estimated_duration = EXCLUDED.estimated_duration,
  distance_km = EXCLUDED.distance_km,
  active = true;

WITH trip_seed(origin_city, destination_city, company_name, plate_number, day_offset, departure_clock, price, platform) AS (
  VALUES
    ('Kigali', 'Huye', 'Volcano Express', 'RAC 201 V', 0, '07:00'::TIME, 4200, 'Bay 4'),
    ('Kigali', 'Huye', 'Ritco', 'RAD 118 R', 0, '10:30'::TIME, 3800, 'Bay 2'),
    ('Kigali', 'Huye', 'Royal Express', 'RAF 550 X', 0, '15:00'::TIME, 5200, 'Bay 6'),
    ('Kigali', 'Musanze', 'Virunga Express', 'RAH 330 G', 0, '08:00'::TIME, 3600, 'Bay 5'),
    ('Kigali', 'Musanze', 'Kigali Coach', 'RAE 410 K', 0, '13:30'::TIME, 3900, 'Bay 1'),
    ('Kigali', 'Rubavu', 'Virunga Express', 'RAH 330 G', 0, '09:00'::TIME, 5200, 'Bay 5'),
    ('Kigali', 'Rubavu', 'Volcano Express', 'RAC 202 V', 0, '14:30'::TIME, 5600, 'Bay 4'),
    ('Kigali', 'Rusizi', 'Ritco', 'RAD 119 R', 0, '06:30'::TIME, 8500, 'Bay 2'),
    ('Kigali', 'Nyagatare', 'Omega Bus', 'RAG 707 O', 0, '11:00'::TIME, 4500, 'Bay 8'),
    ('Huye', 'Kigali', 'Volcano Express', 'RAC 201 V', 0, '08:30'::TIME, 4200, 'Stand 1'),
    ('Musanze', 'Kigali', 'Virunga Express', 'RAH 330 G', 0, '16:00'::TIME, 3600, 'Stand 2'),
    ('Rubavu', 'Kigali', 'Volcano Express', 'RAC 202 V', 0, '07:30'::TIME, 5600, 'Stand 3'),
    ('Kigali', 'Huye', 'Volcano Express', 'RAC 201 V', 1, '07:00'::TIME, 4200, 'Bay 4'),
    ('Kigali', 'Musanze', 'Virunga Express', 'RAH 330 G', 1, '08:00'::TIME, 3600, 'Bay 5'),
    ('Kigali', 'Rubavu', 'Volcano Express', 'RAC 202 V', 1, '14:30'::TIME, 5600, 'Bay 4'),
    ('Kigali', 'Rusizi', 'Ritco', 'RAD 119 R', 1, '06:30'::TIME, 8500, 'Bay 2'),
    ('Huye', 'Kigali', 'Ritco', 'RAD 118 R', 1, '12:00'::TIME, 3800, 'Stand 1'),
    ('Rubavu', 'Kigali', 'Virunga Express', 'RAH 330 G', 1, '10:00'::TIME, 5200, 'Stand 3')
)
INSERT INTO trips (bus_id, route_id, departure_time, arrival_time, ticket_price, status, platform, notes)
SELECT
  buses.id,
  routes.id,
  (CURRENT_DATE + trip_seed.day_offset + trip_seed.departure_clock) AT TIME ZONE 'Africa/Kigali',
  ((CURRENT_DATE + trip_seed.day_offset + trip_seed.departure_clock) AT TIME ZONE 'Africa/Kigali') + routes.estimated_duration,
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
  ticket_price = EXCLUDED.ticket_price,
  status = 'scheduled',
  platform = EXCLUDED.platform,
  notes = EXCLUDED.notes;

WITH sample_booked AS (
  SELECT trips.id AS trip_id, seat_number
  FROM trips
  CROSS JOIN (VALUES ('A1'), ('B2'), ('C3')) AS seats(seat_number)
  WHERE trips.departure_time >= CURRENT_DATE
  ORDER BY trips.departure_time ASC
  LIMIT 9
)
INSERT INTO booking_seats (booking_id, trip_id, seat_number, status)
SELECT
  uuid_generate_v5(uuid_ns_url(), 'rindaseat:demo-booking:' || sample_booked.trip_id::TEXT || ':' || sample_booked.seat_number),
  sample_booked.trip_id,
  sample_booked.seat_number,
  'confirmed'
FROM sample_booked
WHERE EXISTS (
  SELECT 1 FROM bookings
  WHERE bookings.id = uuid_generate_v5(uuid_ns_url(), 'rindaseat:demo-booking:' || sample_booked.trip_id::TEXT || ':' || sample_booked.seat_number)
)
ON CONFLICT DO NOTHING;
