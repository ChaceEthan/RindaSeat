// @ts-nocheck
require('dotenv').config();

const bcrypt = require('bcryptjs');
const { pool, formatDatabaseError } = require('../config/db');

const REQUIRED_TABLES = [
  'users',
  'companies',
  'stations',
  'buses',
  'routes',
  'trips',
  'bookings',
  'payments',
  'tickets',
  'admins',
  'notifications',
  'reviews',
  'saved_routes',
  'trip_updates'
];

const ALL_BOOTSTRAP_TABLES = [
  ...REQUIRED_TABLES,
  'booking_seats'
];

const PRE_MIGRATION_STATEMENTS = [
  'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"',
  `DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'company_admin', 'super_admin', 'passenger', 'staff', 'admin');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$`,
  "ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'user'",
  "ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'company_admin'",
  "ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin'",
  "ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'passenger'",
  "ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'staff'",
  "ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin'",
  `DO $$ BEGIN
    CREATE TYPE trip_status AS ENUM ('scheduled', 'boarding', 'departed', 'completed', 'cancelled');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$`,
  "ALTER TYPE trip_status ADD VALUE IF NOT EXISTS 'scheduled'",
  "ALTER TYPE trip_status ADD VALUE IF NOT EXISTS 'boarding'",
  "ALTER TYPE trip_status ADD VALUE IF NOT EXISTS 'departed'",
  "ALTER TYPE trip_status ADD VALUE IF NOT EXISTS 'completed'",
  "ALTER TYPE trip_status ADD VALUE IF NOT EXISTS 'cancelled'",
  `DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$`,
  "ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'pending'",
  "ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'paid'",
  "ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'failed'",
  "ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'refunded'",
  `DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('reserved', 'confirmed', 'cancelled', 'expired');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$`,
  "ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'reserved'",
  "ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'confirmed'",
  "ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'cancelled'",
  "ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'expired'",
  `DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM (
      'mobile_money',
      'mtn_momo',
      'airtel_money',
      'stripe',
      'card',
      'cash',
      'bank_transfer'
    );
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$`,
  "ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'mobile_money'",
  "ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'mtn_momo'",
  "ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'airtel_money'",
  "ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'stripe'",
  "ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'card'",
  "ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'cash'",
  "ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'bank_transfer'"
];

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL,
    full_name VARCHAR(120),
    email VARCHAR(160) NOT NULL UNIQUE,
    password TEXT,
    password_hash TEXT,
    phone VARCHAR(30),
    avatar TEXT,
    auth_provider VARCHAR(40) NOT NULL DEFAULT 'email',
    role user_role NOT NULL DEFAULT 'user',
    is_verified BOOLEAN NOT NULL DEFAULT false,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(160) NOT NULL,
    name VARCHAR(160) NOT NULL,
    logo TEXT,
    logo_url TEXT,
    email VARCHAR(160),
    phone VARCHAR(40),
    support_phone VARCHAR(40),
    address TEXT,
    description TEXT,
    verified BOOLEAN NOT NULL DEFAULT false,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 4.5 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
    amenities TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    brand_color VARCHAR(20) NOT NULL DEFAULT '#4f94f7',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS stations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_name VARCHAR(160) NOT NULL,
    name VARCHAR(160) NOT NULL,
    district VARCHAR(120) NOT NULL,
    city VARCHAR(120),
    province VARCHAR(120) NOT NULL,
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS buses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    plate_number VARCHAR(40) NOT NULL UNIQUE,
    bus_name VARCHAR(120),
    bus_type VARCHAR(80) NOT NULL DEFAULT 'Standard Coach',
    total_seats INTEGER NOT NULL CHECK (total_seats > 0),
    amenities TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    rows INTEGER NOT NULL DEFAULT 10 CHECK (rows > 0),
    columns INTEGER NOT NULL DEFAULT 4 CHECK (columns > 0),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    origin_station_id UUID NOT NULL REFERENCES stations(id) ON DELETE RESTRICT,
    destination_station_id UUID NOT NULL REFERENCES stations(id) ON DELETE RESTRICT,
    distance_km NUMERIC(8, 2) CHECK (distance_km IS NULL OR distance_km >= 0),
    estimated_duration INTERVAL NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT different_route_stations CHECK (origin_station_id <> destination_station_id),
    CONSTRAINT unique_route_pair UNIQUE (origin_station_id, destination_station_id)
  )`,
  `CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bus_id UUID NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE RESTRICT,
    departure_time TIMESTAMPTZ NOT NULL,
    arrival_time TIMESTAMPTZ NOT NULL,
    available_seats INTEGER NOT NULL DEFAULT 0 CHECK (available_seats >= 0),
    ticket_price NUMERIC(12, 2) NOT NULL CHECK (ticket_price >= 0),
    status trip_status NOT NULL DEFAULT 'scheduled',
    platform VARCHAR(40),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_trip_time CHECK (arrival_time > departure_time)
  )`,
  `CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    seat_number INTEGER NOT NULL CHECK (seat_number > 0),
    seat_numbers TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    booking_reference VARCHAR(40) NOT NULL,
    booking_status booking_status NOT NULL DEFAULT 'reserved',
    payment_status payment_status NOT NULL DEFAULT 'pending',
    qr_code TEXT,
    expires_at TIMESTAMPTZ,
    passenger_name VARCHAR(120),
    passenger_phone VARCHAR(30),
    passenger_email VARCHAR(160),
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS booking_seats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    seat_number VARCHAR(10) NOT NULL,
    status booking_status NOT NULL DEFAULT 'reserved',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    payment_method payment_method NOT NULL DEFAULT 'mobile_money',
    method payment_method NOT NULL DEFAULT 'mobile_money',
    transaction_id VARCHAR(120) NOT NULL UNIQUE,
    payment_status payment_status NOT NULL DEFAULT 'pending',
    status payment_status NOT NULL DEFAULT 'pending',
    provider VARCHAR(80) NOT NULL DEFAULT 'rindaseat_demo',
    phone_number VARCHAR(30),
    paid_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    ticket_number VARCHAR(40) NOT NULL UNIQUE,
    qr_code TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'issued',
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    scanned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'super_admin',
    permissions JSONB NOT NULL DEFAULT '{}'::JSONB,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(160) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL DEFAULT 'system',
    is_read BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    approved BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS saved_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    origin_station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    destination_station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    nickname VARCHAR(120),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT different_saved_route_stations CHECK (origin_station_id <> destination_station_id),
    CONSTRAINT unique_saved_route UNIQUE (user_id, origin_station_id, destination_station_id)
  )`,
  `CREATE TABLE IF NOT EXISTS trip_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    update_type VARCHAR(50) NOT NULL DEFAULT 'info',
    message TEXT NOT NULL,
    delay_minutes INTEGER NOT NULL DEFAULT 0,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`
];

const COMPATIBILITY_STATEMENTS = [
  'ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(120)',
  'ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(120)',
  'ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT',
  'ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT',
  'ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(30)',
  'ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT',
  "ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(40) NOT NULL DEFAULT 'email'",
  "ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'user'",
  'ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false',
  'ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ',
  'ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()',
  'ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()',
  `UPDATE users
   SET name = COALESCE(NULLIF(name, ''), NULLIF(full_name, ''), split_part(email, '@', 1), 'RindaSeat User'),
       full_name = COALESCE(NULLIF(full_name, ''), NULLIF(name, ''), split_part(email, '@', 1), 'RindaSeat User'),
       password = COALESCE(password, password_hash),
       password_hash = COALESCE(password_hash, password)`,
  "UPDATE users SET role = 'user' WHERE role::TEXT = 'passenger'",
  "UPDATE users SET role = 'super_admin' WHERE role::TEXT = 'admin'",
  "UPDATE users SET role = 'company_admin' WHERE role::TEXT = 'staff'",
  "ALTER TABLE users ALTER COLUMN name SET NOT NULL",
  "ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user'",
  'ALTER TABLE users ALTER COLUMN phone DROP NOT NULL',
  'ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL',
  'ALTER TABLE users ALTER COLUMN password DROP NOT NULL',

  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS company_name VARCHAR(160)',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS name VARCHAR(160)',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo TEXT',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url TEXT',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS email VARCHAR(160)',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone VARCHAR(40)',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS support_phone VARCHAR(40)',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS address TEXT',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS description TEXT',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT false',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2) NOT NULL DEFAULT 4.5',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS review_count INTEGER NOT NULL DEFAULT 0',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS amenities TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]',
  "ALTER TABLE companies ADD COLUMN IF NOT EXISTS brand_color VARCHAR(20) NOT NULL DEFAULT '#4f94f7'",
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()',
  'ALTER TABLE companies ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()',
  `UPDATE companies
   SET company_name = COALESCE(NULLIF(company_name, ''), NULLIF(name, ''), 'RindaSeat Operator ' || SUBSTRING(id::TEXT, 1, 8)),
       name = COALESCE(NULLIF(name, ''), NULLIF(company_name, ''), 'RindaSeat Operator ' || SUBSTRING(id::TEXT, 1, 8)),
       logo = COALESCE(logo, logo_url),
       logo_url = COALESCE(logo_url, logo),
       phone = COALESCE(phone, support_phone),
       support_phone = COALESCE(support_phone, phone)`,
  'ALTER TABLE companies ALTER COLUMN company_name SET NOT NULL',
  'ALTER TABLE companies ALTER COLUMN name SET NOT NULL',

  'ALTER TABLE stations ADD COLUMN IF NOT EXISTS station_name VARCHAR(160)',
  'ALTER TABLE stations ADD COLUMN IF NOT EXISTS name VARCHAR(160)',
  'ALTER TABLE stations ADD COLUMN IF NOT EXISTS district VARCHAR(120)',
  'ALTER TABLE stations ADD COLUMN IF NOT EXISTS city VARCHAR(120)',
  'ALTER TABLE stations ADD COLUMN IF NOT EXISTS province VARCHAR(120)',
  'ALTER TABLE stations ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 6)',
  'ALTER TABLE stations ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 6)',
  'ALTER TABLE stations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()',
  'ALTER TABLE stations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()',
  `UPDATE stations
   SET station_name = COALESCE(NULLIF(station_name, ''), NULLIF(name, ''), NULLIF(city, ''), 'RindaSeat Station ' || SUBSTRING(id::TEXT, 1, 8)),
       name = COALESCE(NULLIF(name, ''), NULLIF(station_name, ''), NULLIF(city, ''), 'RindaSeat Station ' || SUBSTRING(id::TEXT, 1, 8)),
       city = COALESCE(NULLIF(city, ''), NULLIF(station_name, ''), NULLIF(name, '')),
       district = COALESCE(NULLIF(district, ''), NULLIF(city, ''), 'Unknown District'),
       province = COALESCE(NULLIF(province, ''), 'Rwanda')`,
  'ALTER TABLE stations ALTER COLUMN station_name SET NOT NULL',
  'ALTER TABLE stations ALTER COLUMN name SET NOT NULL',
  'ALTER TABLE stations ALTER COLUMN district SET NOT NULL',
  'ALTER TABLE stations ALTER COLUMN province SET NOT NULL',

  'ALTER TABLE buses ADD COLUMN IF NOT EXISTS bus_name VARCHAR(120)',
  "ALTER TABLE buses ADD COLUMN IF NOT EXISTS bus_type VARCHAR(80) NOT NULL DEFAULT 'Standard Coach'",
  'ALTER TABLE buses ADD COLUMN IF NOT EXISTS amenities TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]',
  'ALTER TABLE buses ADD COLUMN IF NOT EXISTS rows INTEGER NOT NULL DEFAULT 10',
  'ALTER TABLE buses ADD COLUMN IF NOT EXISTS columns INTEGER NOT NULL DEFAULT 4',
  'ALTER TABLE buses ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true',
  'ALTER TABLE buses ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()',
  'ALTER TABLE buses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()',

  'ALTER TABLE routes ADD COLUMN IF NOT EXISTS distance_km NUMERIC(8, 2)',
  "ALTER TABLE routes ADD COLUMN IF NOT EXISTS estimated_duration INTERVAL NOT NULL DEFAULT INTERVAL '0 minutes'",
  'ALTER TABLE routes ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true',
  'ALTER TABLE routes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()',
  'ALTER TABLE routes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()',

  'ALTER TABLE trips ADD COLUMN IF NOT EXISTS available_seats INTEGER NOT NULL DEFAULT 0',
  'ALTER TABLE trips ADD COLUMN IF NOT EXISTS platform VARCHAR(40)',
  'ALTER TABLE trips ADD COLUMN IF NOT EXISTS notes TEXT',
  'ALTER TABLE trips ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()',
  'ALTER TABLE trips ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()',
  `UPDATE trips
   SET available_seats = COALESCE(NULLIF(available_seats, 0), buses.total_seats)
   FROM buses
   WHERE trips.bus_id = buses.id
     AND trips.available_seats = 0`,

  'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS seat_numbers TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]',
  'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_reference VARCHAR(40)',
  'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_status booking_status NOT NULL DEFAULT \'reserved\'',
  'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status payment_status NOT NULL DEFAULT \'pending\'',
  'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS qr_code TEXT',
  'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ',
  'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS passenger_name VARCHAR(120)',
  'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS passenger_phone VARCHAR(30)',
  'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS passenger_email VARCHAR(160)',
  'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0',
  'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ',
  'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()',
  'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()',
  `UPDATE bookings
   SET booking_reference = COALESCE(NULLIF(booking_reference, ''), UPPER(SUBSTRING(REPLACE(id::TEXT, '-', ''), 1, 10))),
       seat_numbers = CASE
         WHEN seat_numbers = ARRAY[]::TEXT[] THEN ARRAY[seat_number::TEXT]
         ELSE seat_numbers
       END,
       expires_at = COALESCE(expires_at, created_at + INTERVAL '15 minutes')`,
  'ALTER TABLE bookings ALTER COLUMN booking_reference SET NOT NULL',

  'ALTER TABLE booking_seats ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()',

  "ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method payment_method NOT NULL DEFAULT 'mobile_money'",
  "ALTER TABLE payments ADD COLUMN IF NOT EXISTS method payment_method NOT NULL DEFAULT 'mobile_money'",
  "ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_status payment_status NOT NULL DEFAULT 'pending'",
  "ALTER TABLE payments ADD COLUMN IF NOT EXISTS status payment_status NOT NULL DEFAULT 'pending'",
  "ALTER TABLE payments ADD COLUMN IF NOT EXISTS provider VARCHAR(80) NOT NULL DEFAULT 'rindaseat_demo'",
  'ALTER TABLE payments ADD COLUMN IF NOT EXISTS phone_number VARCHAR(30)',
  'ALTER TABLE payments ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ',
  "ALTER TABLE payments ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::JSONB",
  'ALTER TABLE payments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()',
  'ALTER TABLE payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()',
  `UPDATE payments
   SET payment_method = COALESCE(payment_method, method),
       method = COALESCE(method, payment_method),
       payment_status = COALESCE(payment_status, status),
       status = COALESCE(status, payment_status)`,

  'CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users(email)',
  'CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone_unique ON users(phone) WHERE phone IS NOT NULL',
  'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
  'CREATE INDEX IF NOT EXISTS idx_users_auth_provider ON users(auth_provider)',
  'CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_company_name_unique ON companies(company_name)',
  'CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_name_unique ON companies(name)',
  'CREATE INDEX IF NOT EXISTS idx_companies_verified ON companies(verified)',
  'CREATE UNIQUE INDEX IF NOT EXISTS idx_stations_station_name_unique ON stations(station_name)',
  'CREATE UNIQUE INDEX IF NOT EXISTS idx_stations_name_unique ON stations(name)',
  'CREATE INDEX IF NOT EXISTS idx_stations_city ON stations(city)',
  'CREATE INDEX IF NOT EXISTS idx_buses_company_id ON buses(company_id)',
  'CREATE INDEX IF NOT EXISTS idx_buses_active ON buses(active)',
  'CREATE INDEX IF NOT EXISTS idx_routes_origin_destination ON routes(origin_station_id, destination_station_id)',
  'CREATE INDEX IF NOT EXISTS idx_trips_route_id ON trips(route_id)',
  'CREATE INDEX IF NOT EXISTS idx_trips_bus_id ON trips(bus_id)',
  'CREATE INDEX IF NOT EXISTS idx_trips_departure_time ON trips(departure_time)',
  'CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status)',
  'CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_bookings_trip_id ON bookings(trip_id)',
  'CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference)',
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_trip_seat
   ON bookings(trip_id, seat_number)
   WHERE booking_status IN ('reserved', 'confirmed')`,
  'CREATE INDEX IF NOT EXISTS idx_booking_seats_booking_id ON booking_seats(booking_id)',
  'CREATE INDEX IF NOT EXISTS idx_booking_seats_trip_id ON booking_seats(trip_id)',
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_booking_seat
   ON booking_seats(trip_id, seat_number)
   WHERE status IN ('reserved', 'confirmed')`,
  'CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id)',
  'CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status)',
  'CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_trip_schedule ON trips(bus_id, route_id, departure_time)',
  'CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_tickets_trip_id ON tickets(trip_id)',
  'CREATE INDEX IF NOT EXISTS idx_admins_active ON admins(active)',
  'CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read)',
  'CREATE INDEX IF NOT EXISTS idx_reviews_company_id ON reviews(company_id)',
  'CREATE INDEX IF NOT EXISTS idx_saved_routes_user_id ON saved_routes(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_trip_updates_trip_id ON trip_updates(trip_id)',
  `CREATE OR REPLACE FUNCTION set_updated_at()
   RETURNS TRIGGER AS $$
   BEGIN
     NEW.updated_at = NOW();
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql`
];

const createUpdatedAtTriggerStatement = (tableName) => `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_${tableName}_updated_at'
  ) THEN
    CREATE TRIGGER trg_${tableName}_updated_at
    BEFORE UPDATE ON ${tableName}
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  END IF;
END $$`;

const UPDATED_AT_TRIGGER_STATEMENTS = ALL_BOOTSTRAP_TABLES.map(createUpdatedAtTriggerStatement);

const getExistingTables = async (client) => {
  const result = await client.query(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name = ANY($1::text[])`,
    [REQUIRED_TABLES]
  );

  return result.rows.map((row) => row.table_name);
};

const getTableCount = async (client, tableName) => {
  const result = await client.query(`SELECT COUNT(*)::INT AS count FROM ${tableName}`);
  return Number(result.rows[0]?.count || 0);
};

const runStatements = async (client, statements) => {
  for (const statement of statements) {
    await client.query(statement);
  }
};

const seedDefaultAdmin = async (client, logger) => {
  const adminEmail = (process.env.DEFAULT_ADMIN_EMAIL || 'admin@rindaseat.rw').trim().toLowerCase();
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'ChangeThisAdminPassword!2026';
  const passwordHash = await bcrypt.hash(adminPassword, Number(process.env.BCRYPT_SALT_ROUNDS) || 10);

  if (!process.env.DEFAULT_ADMIN_PASSWORD && logger && typeof logger.warn === 'function') {
    logger.warn('[SEED] DEFAULT_ADMIN_PASSWORD is not configured. Seeded admin uses the documented fallback password; change it immediately.');
  }

  const result = await client.query(
    `INSERT INTO users (
      id,
      name,
      full_name,
      email,
      password,
      password_hash,
      auth_provider,
      role,
      is_verified
     )
     VALUES (
      uuid_generate_v5(uuid_ns_url(), 'rindaseat:user:default-admin'),
      'RindaSeat Admin',
      'RindaSeat Admin',
      $1,
      $2,
      $2,
      'email',
      'super_admin',
      true
     )
     ON CONFLICT (email) DO UPDATE SET
      name = COALESCE(users.name, EXCLUDED.name),
      full_name = COALESCE(users.full_name, EXCLUDED.full_name),
      role = 'super_admin',
      is_verified = true,
      updated_at = NOW()
     RETURNING id`,
    [adminEmail, passwordHash]
  );

  await client.query(
    `INSERT INTO admins (user_id, role, permissions, active)
     VALUES ($1, 'super_admin', $2::JSONB, true)
     ON CONFLICT (user_id) DO UPDATE SET
      role = 'super_admin',
      active = true,
      updated_at = NOW()`,
    [
      result.rows[0].id,
      JSON.stringify({
        users: true,
        companies: true,
        trips: true,
        bookings: true,
        payments: true
      })
    ]
  );
};

const seedCompanies = async (client) => {
  await client.query(
    `WITH company_seed(company_name, logo, email, phone, address, description, rating, review_count, amenities, brand_color) AS (
      VALUES
        ('Volcano Express', null, 'support@volcano.rw', '+250788305050', 'Nyabugogo Bus Park, Kigali', 'Premium intercity service on Rwanda northern and western corridors.', 4.8, 1840, ARRAY['WiFi', 'USB charging', 'Air conditioning', 'Reclining seats'], '#ef4444'),
        ('Ritco', null, 'info@ritco.rw', '+250788319333', 'Remera, Kigali', 'National coach operator connecting Kigali with all provinces.', 4.6, 2260, ARRAY['Reliable schedule', 'Large luggage hold', 'Professional drivers'], '#2563eb'),
        ('Kigali Coach', null, 'hello@kigalicoach.rw', '+250788440010', 'Nyabugogo, Kigali', 'Fast city-to-city coach service from Nyabugogo.', 4.5, 950, ARRAY['Express service', 'Mobile ticketing', 'Clean coaches'], '#7c3aed'),
        ('Royal Express', null, 'care@royalexpress.rw', '+250788771177', 'Downtown Kigali', 'Executive transport for comfort-focused passengers.', 4.7, 1215, ARRAY['Executive coach', 'Extra legroom', 'Onboard host'], '#0f766e'),
        ('Omega Bus', null, 'bookings@omegabus.rw', '+250788552255', 'Muhanga Road, Kigali', 'Affordable daily services across Rwanda.', 4.4, 780, ARRAY['Affordable fares', 'Daily departures', 'Parcel desk'], '#f97316'),
        ('Virunga Express', null, 'travel@virungaexpress.rw', '+250788660066', 'Musanze Road, Kigali', 'Specialist service for Musanze, Rubavu, and Virunga corridor trips.', 4.6, 1090, ARRAY['Mountain route experts', 'WiFi', 'USB charging'], '#16a34a')
    )
    INSERT INTO companies (id, company_name, name, logo, logo_url, email, phone, support_phone, address, description, verified, rating, review_count, amenities, brand_color)
    SELECT
      uuid_generate_v5(uuid_ns_url(), 'rindaseat:company:' || lower(company_name)),
      company_name,
      company_name,
      logo,
      logo,
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
      logo = EXCLUDED.logo,
      logo_url = EXCLUDED.logo_url,
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
      updated_at = NOW()`
  );
};

const seedStations = async (client) => {
  await client.query(
    `WITH station_seed(station_name, district, city, province, latitude, longitude) AS (
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
      updated_at = NOW()`
  );
};

const seedBuses = async (client) => {
  await client.query(
    `WITH bus_seed(company_name, plate_number, bus_name, total_seats, rows, columns, bus_type, amenities) AS (
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
      updated_at = NOW()`
  );
};

const seedRoutes = async (client) => {
  await client.query(
    `WITH route_seed(origin_city, destination_city, duration_text, distance_km) AS (
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
      active = true,
      updated_at = NOW()`
  );
};

const seedTrips = async (client) => {
  await client.query(
    `WITH trip_seed(origin_city, destination_city, company_name, plate_number, day_offset, departure_clock, price, platform) AS (
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
      updated_at = NOW()`
  );
};

const seedDatabaseIfEmpty = async ({ client: existingClient, logger = console } = {}) => {
  let client = existingClient;
  let shouldRelease = false;

  try {
    if (!client) {
      client = await pool.connect();
      shouldRelease = true;
    }

    const seeded = [];
    const adminCount = await getTableCount(client, 'admins');

    if (adminCount === 0) {
      await seedDefaultAdmin(client, logger);
      seeded.push('default admin');
    }

    if (await getTableCount(client, 'companies') === 0) {
      await seedCompanies(client);
      seeded.push('companies');
    }

    if (await getTableCount(client, 'stations') === 0) {
      await seedStations(client);
      seeded.push('stations');
    }

    if (await getTableCount(client, 'buses') === 0) {
      await seedCompanies(client);
      await seedBuses(client);
      seeded.push('buses');
    }

    if (await getTableCount(client, 'routes') === 0) {
      await seedStations(client);
      await seedRoutes(client);
      seeded.push('routes');
    }

    if (await getTableCount(client, 'trips') === 0) {
      await seedCompanies(client);
      await seedStations(client);
      await seedBuses(client);
      await seedRoutes(client);
      await seedTrips(client);
      seeded.push('trips');
    }

    if (seeded.length > 0 && logger && typeof logger.log === 'function') {
      logger.log(`[SEED] Seeded ${seeded.join(', ')}`);
    } else if (logger && typeof logger.log === 'function') {
      logger.log('[SEED] Existing data detected; seed skipped');
    }

    return {
      success: true,
      seeded
    };
  } catch (error) {
    const message = formatDatabaseError(error);

    if (logger && typeof logger.warn === 'function') {
      logger.warn(`[SEED] Seed skipped: ${message}`);
    }

    return {
      success: false,
      error: message,
      seeded: []
    };
  } finally {
    if (shouldRelease && client) {
      client.release();
    }
  }
};

const verifyRequiredTables = async ({ client: existingClient, logger = console } = {}) => {
  let client = existingClient;
  let shouldRelease = false;

  try {
    if (!client) {
      client = await pool.connect();
      shouldRelease = true;
    }

    const existingTables = await getExistingTables(client);
    const missingTables = REQUIRED_TABLES.filter((tableName) => !existingTables.includes(tableName));

    if (missingTables.length > 0) {
      logger.warn(`[MIGRATIONS] Missing tables after migration: ${missingTables.join(', ')}`);
      return {
        allTablesExist: false,
        missingTables,
        existingTables
      };
    }

    logger.log(`[MIGRATIONS] Required tables verified: ${REQUIRED_TABLES.join(', ')}`);
    return {
      allTablesExist: true,
      missingTables: [],
      existingTables
    };
  } catch (error) {
    const message = formatDatabaseError(error);
    logger.warn(`[MIGRATIONS] Table verification skipped: ${message}`);
    return {
      allTablesExist: false,
      missingTables: REQUIRED_TABLES,
      existingTables: [],
      error: message
    };
  } finally {
    if (shouldRelease && client) {
      client.release();
    }
  }
};

const runMigrations = async ({ logger = console, seed = true } = {}) => {
  let client;

  try {
    logger.log('[MIGRATIONS] Starting database schema bootstrap');
    client = await pool.connect();

    await runStatements(client, PRE_MIGRATION_STATEMENTS);

    await client.query('BEGIN');
    await runStatements(client, SCHEMA_STATEMENTS);
    await runStatements(client, COMPATIBILITY_STATEMENTS);
    await runStatements(client, UPDATED_AT_TRIGGER_STATEMENTS);

    const verification = await verifyRequiredTables({ client, logger });

    if (!verification.allTablesExist) {
      throw new Error(`Required tables missing: ${verification.missingTables.join(', ')}`);
    }

    let seedResult = { success: true, seeded: [] };

    if (seed && process.env.SKIP_DB_SEED !== 'true') {
      seedResult = await seedDatabaseIfEmpty({ client, logger });
    }

    await client.query('COMMIT');
    logger.log('[MIGRATIONS] Database schema bootstrap completed');

    return {
      success: true,
      statementsExecuted: PRE_MIGRATION_STATEMENTS.length
        + SCHEMA_STATEMENTS.length
        + COMPATIBILITY_STATEMENTS.length
        + UPDATED_AT_TRIGGER_STATEMENTS.length,
      missingTables: [],
      seed: seedResult,
      message: 'Schema bootstrap completed'
    };
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK').catch(() => {});
    }

    const message = formatDatabaseError(error);
    logger.warn(`[MIGRATIONS] Bootstrap unavailable: ${message}`);

    return {
      success: false,
      error: message,
      message: 'Schema bootstrap did not complete'
    };
  } finally {
    if (client) {
      client.release();
    }
  }
};

module.exports = {
  REQUIRED_TABLES,
  runMigrations,
  seedDatabaseIfEmpty,
  verifyRequiredTables
};
