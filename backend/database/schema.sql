CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('passenger', 'company_admin', 'staff', 'admin');
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
  CREATE TYPE payment_method AS ENUM ('mobile_money', 'card', 'cash', 'bank_transfer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(120) NOT NULL,
  phone VARCHAR(30) NOT NULL UNIQUE,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'passenger',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(120) NOT NULL UNIQUE,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(120) NOT NULL UNIQUE,
  district VARCHAR(120) NOT NULL
);

CREATE TABLE IF NOT EXISTS buses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  plate_number VARCHAR(40) NOT NULL UNIQUE,
  total_seats INTEGER NOT NULL CHECK (total_seats > 0)
);

CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  origin_station_id UUID NOT NULL REFERENCES stations(id) ON DELETE RESTRICT,
  destination_station_id UUID NOT NULL REFERENCES stations(id) ON DELETE RESTRICT,
  estimated_duration INTERVAL NOT NULL,
  CONSTRAINT different_route_stations CHECK (origin_station_id <> destination_station_id),
  CONSTRAINT unique_route_pair UNIQUE (origin_station_id, destination_station_id)
);

CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bus_id UUID NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE RESTRICT,
  departure_time TIMESTAMPTZ NOT NULL,
  arrival_time TIMESTAMPTZ NOT NULL,
  ticket_price NUMERIC(12, 2) NOT NULL CHECK (ticket_price >= 0),
  status trip_status NOT NULL DEFAULT 'scheduled',
  CONSTRAINT valid_trip_time CHECK (arrival_time > departure_time)
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  seat_number INTEGER NOT NULL CHECK (seat_number > 0),
  qr_code TEXT,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  booking_status booking_status NOT NULL DEFAULT 'reserved',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  method payment_method NOT NULL,
  transaction_id VARCHAR(120) NOT NULL UNIQUE,
  status payment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE companies ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2) NOT NULL DEFAULT 4.5;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS review_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS amenities TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE companies ADD COLUMN IF NOT EXISTS support_phone VARCHAR(30);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS brand_color VARCHAR(20) NOT NULL DEFAULT '#4f94f7';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE stations ADD COLUMN IF NOT EXISTS city VARCHAR(120);
ALTER TABLE stations ADD COLUMN IF NOT EXISTS province VARCHAR(120);
ALTER TABLE stations ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 6);
ALTER TABLE stations ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 6);
UPDATE stations SET city = COALESCE(city, name), province = COALESCE(province, district);
ALTER TABLE stations ALTER COLUMN city SET NOT NULL;
ALTER TABLE stations ALTER COLUMN province SET NOT NULL;

ALTER TABLE buses ADD COLUMN IF NOT EXISTS bus_name VARCHAR(120);
ALTER TABLE buses ADD COLUMN IF NOT EXISTS bus_type VARCHAR(80) NOT NULL DEFAULT 'Standard Coach';
ALTER TABLE buses ADD COLUMN IF NOT EXISTS amenities TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE buses ADD COLUMN IF NOT EXISTS rows INTEGER NOT NULL DEFAULT 10;
ALTER TABLE buses ADD COLUMN IF NOT EXISTS columns INTEGER NOT NULL DEFAULT 4;
ALTER TABLE buses ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE routes ADD COLUMN IF NOT EXISTS distance_km INTEGER;
ALTER TABLE routes ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE trips ADD COLUMN IF NOT EXISTS platform VARCHAR(40);
ALTER TABLE trips ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE trips ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_reference VARCHAR(32);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS passenger_name VARCHAR(120);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS passenger_phone VARCHAR(30);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS passenger_email VARCHAR(160);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS seat_numbers TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
UPDATE bookings
SET booking_reference = COALESCE(booking_reference, UPPER(SUBSTRING(REPLACE(id::TEXT, '-', ''), 1, 10))),
    seat_numbers = CASE
      WHEN seat_numbers = ARRAY[]::TEXT[] THEN ARRAY[seat_number::TEXT]
      ELSE seat_numbers
    END;
ALTER TABLE bookings ALTER COLUMN booking_reference SET NOT NULL;

CREATE TABLE IF NOT EXISTS booking_seats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  seat_number VARCHAR(10) NOT NULL,
  status booking_status NOT NULL DEFAULT 'reserved',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE payments ADD COLUMN IF NOT EXISTS provider VARCHAR(80) NOT NULL DEFAULT 'rindaseat_demo';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS phone_number VARCHAR(30);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::JSONB;

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_buses_company_id ON buses(company_id);
CREATE INDEX IF NOT EXISTS idx_routes_origin_destination ON routes(origin_station_id, destination_station_id);
CREATE INDEX IF NOT EXISTS idx_trips_departure_time ON trips(departure_time);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_trip_id ON bookings(trip_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_trip_seat
ON bookings(trip_id, seat_number)
WHERE booking_status IN ('reserved', 'confirmed');
CREATE INDEX IF NOT EXISTS idx_booking_seats_booking_id ON booking_seats(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_seats_trip_id ON booking_seats(trip_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_booking_seat
ON booking_seats(trip_id, seat_number)
WHERE status IN ('reserved', 'confirmed');
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_trip_schedule
ON trips(bus_id, route_id, departure_time);
