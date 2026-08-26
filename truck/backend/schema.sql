-- Truck Hire ZW database schema
-- Run this once against your PostgreSQL database to create the tables.
-- Example: psql -U postgres -d truck_hire_zw -f schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drivers / truck owners create accounts. Customers never need an account.
CREATE TABLE IF NOT EXISTS drivers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name           VARCHAR(120) NOT NULL,
    phone               VARCHAR(30) NOT NULL UNIQUE,
    whatsapp            VARCHAR(30),
    email               VARCHAR(160) UNIQUE,
    password_hash       TEXT NOT NULL,
    city                VARCHAR(80),
    is_phone_verified   BOOLEAN NOT NULL DEFAULT FALSE,
    -- Subscription: drivers pay a small monthly fee to keep listing.
    subscription_status VARCHAR(20) NOT NULL DEFAULT 'trial', -- trial | active | expired
    subscription_expires_at TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Truck / lorry / pickup listings posted by drivers.
CREATE TABLE IF NOT EXISTS trucks (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id           UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    title               VARCHAR(120) NOT NULL,          -- e.g. "Toyota Dyna 1 Tonne"
    truck_type          VARCHAR(40) NOT NULL,            -- pickup | 1_ton | 3_ton | 5_ton | 7_ton | 10_ton | tipper | flatbed | other
    capacity_tonnes     NUMERIC(5,2),                    -- e.g. 1.00, 5.00
    description         TEXT,
    location             VARCHAR(120) NOT NULL,          -- e.g. "Harare CBD", "Bulawayo"
    price_guide         VARCHAR(80),                     -- free text, e.g. "$40/load, negotiable"
    photo_url           TEXT,                            -- single hero photo for v1
    status               VARCHAR(20) NOT NULL DEFAULT 'active', -- active | paused
    -- Boosting: paid drivers can appear at the top of search results.
    is_boosted           BOOLEAN NOT NULL DEFAULT FALSE,
    boosted_until         TIMESTAMPTZ,
    view_count            INTEGER NOT NULL DEFAULT 0,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Every time a customer taps "Call" or "WhatsApp" on a listing we log it.
-- This gives drivers a simple usage metric ("this listing got 12 contacts this month")
-- without us ever touching the actual negotiation or payment.
CREATE TABLE IF NOT EXISTS contact_events (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    truck_id    UUID NOT NULL REFERENCES trucks(id) ON DELETE CASCADE,
    contact_type VARCHAR(20) NOT NULL, -- call | whatsapp
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trucks_driver_id ON trucks(driver_id);
CREATE INDEX IF NOT EXISTS idx_trucks_type ON trucks(truck_type);
CREATE INDEX IF NOT EXISTS idx_trucks_location ON trucks(location);
CREATE INDEX IF NOT EXISTS idx_trucks_boosted ON trucks(is_boosted, boosted_until);
CREATE INDEX IF NOT EXISTS idx_contact_events_truck_id ON contact_events(truck_id);
