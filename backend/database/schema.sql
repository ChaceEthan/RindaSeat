CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'company_admin', 'super_admin', 'passenger', 'staff', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE trip_status AS ENUM ('scheduled', 'boarding', 'departed', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('reserved', 'confirmed', 'cancelled', 'expired');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('mobile_money', 'mtn_momo', 'airtel_money', 'stripe', 'card', 'cash', 'bank_transfer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS users (
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
);

CREATE TABLE IF NOT EXISTS companies (
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
);

CREATE TABLE IF NOT EXISTS stations (
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
);

CREATE TABLE IF NOT EXISTS buses (
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
);

CREATE TABLE IF NOT EXISTS routes (
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
);

CREATE TABLE IF NOT EXISTS trips (
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
);

CREATE TABLE IF NOT EXISTS bookings (
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
);

CREATE TABLE IF NOT EXISTS payments (
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
);

CREATE TABLE IF NOT EXISTS tickets (
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
);

CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'super_admin',
  permissions JSONB NOT NULL DEFAULT '{}'::JSONB,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(160) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50) NOT NULL DEFAULT 'system',
  is_read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  approved BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saved_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  origin_station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  destination_station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  nickname VARCHAR(120),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT different_saved_route_stations CHECK (origin_station_id <> destination_station_id),
  CONSTRAINT unique_saved_route UNIQUE (user_id, origin_station_id, destination_station_id)
);

CREATE TABLE IF NOT EXISTS trip_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  update_type VARCHAR(50) NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  delay_minutes INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS booking_seats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  seat_number VARCHAR(10) NOT NULL,
  status booking_status NOT NULL DEFAULT 'reserved',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone_unique ON users(phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_company_name_unique ON companies(company_name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_stations_station_name_unique ON stations(station_name);
CREATE INDEX IF NOT EXISTS idx_buses_company_id ON buses(company_id);
CREATE INDEX IF NOT EXISTS idx_routes_origin_destination ON routes(origin_station_id, destination_station_id);
CREATE INDEX IF NOT EXISTS idx_trips_departure_time ON trips(departure_time);
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_trip_schedule ON trips(bus_id, route_id, departure_time);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_trip_seat ON bookings(trip_id, seat_number) WHERE booking_status IN ('reserved', 'confirmed');
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_booking_seat ON booking_seats(trip_id, seat_number) WHERE status IN ('reserved', 'confirmed');
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_company_id ON reviews(company_id);
CREATE INDEX IF NOT EXISTS idx_saved_routes_user_id ON saved_routes(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_updates_trip_id ON trip_updates(trip_id);
