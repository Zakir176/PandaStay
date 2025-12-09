-- PandaStays Supabase Database Migration Schema
-- Version: 1.0.0
-- Created for PandaStays Mobile-First Student Accommodation Web App

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum Types
CREATE TYPE bed_status AS ENUM ('vacant', 'occupied');
CREATE TYPE payment_method_type AS ENUM ('momo_mtn', 'momo_airtel', 'cash');
CREATE TYPE payment_status AS ENUM ('successful', 'pending', 'failed');
CREATE TYPE ticket_priority AS ENUM ('urgent', 'normal');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'fixed');
CREATE TYPE deposit_status AS ENUM ('held', 'partially_deducted', 'refunded');

-- 1. Properties Table
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    landlord_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    room_number VARCHAR(50) NOT NULL,
    capacity INT NOT NULL DEFAULT 2,
    price_per_term NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_room_per_property UNIQUE (property_id, room_number)
);

-- 3. Beds Table
CREATE TABLE IF NOT EXISTS beds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    bed_label VARCHAR(50) NOT NULL, -- e.g., 'Bed A', 'Bed B'
    status bed_status NOT NULL DEFAULT 'vacant',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_bed_per_room UNIQUE (room_id, bed_label)
);

-- 4. Tenants Table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    student_id VARCHAR(100),
    emergency_contact VARCHAR(255),
    current_bed_id UUID REFERENCES beds(id) ON DELETE SET NULL,
    lease_start DATE,
    lease_end DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    payment_method payment_method_type NOT NULL DEFAULT 'momo_mtn',
    status payment_status NOT NULL DEFAULT 'successful',
    transaction_ref VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 6. Maintenance Tickets Table
CREATE TABLE IF NOT EXISTS maintenance_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    issue_title VARCHAR(255) NOT NULL,
    description TEXT,
    priority ticket_priority NOT NULL DEFAULT 'normal',
    status ticket_status NOT NULL DEFAULT 'open',
    cost_spent NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 7. Security Deposits Table
CREATE TABLE IF NOT EXISTS security_deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    amount_held NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status deposit_status NOT NULL DEFAULT 'held',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rooms_property_id ON rooms(property_id);
CREATE INDEX IF NOT EXISTS idx_beds_room_id ON beds(room_id);
CREATE INDEX IF NOT EXISTS idx_tenants_current_bed_id ON tenants(current_bed_id);
CREATE INDEX IF NOT EXISTS idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_property_id ON maintenance_tickets(property_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_room_id ON maintenance_tickets(room_id);
CREATE INDEX IF NOT EXISTS idx_security_deposits_tenant_id ON security_deposits(tenant_id);

-- Enable Row Level Security (RLS) policies
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_deposits ENABLE ROW LEVEL SECURITY;

-- Default permissive read policies for authenticated users
CREATE POLICY "Allow public read properties" ON properties FOR SELECT USING (true);
CREATE POLICY "Allow public read rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Allow public read beds" ON beds FOR SELECT USING (true);
CREATE POLICY "Allow public read tenants" ON tenants FOR SELECT USING (true);
CREATE POLICY "Allow public read payments" ON payments FOR SELECT USING (true);
CREATE POLICY "Allow public read maintenance_tickets" ON maintenance_tickets FOR SELECT USING (true);
CREATE POLICY "Allow public read security_deposits" ON security_deposits FOR SELECT USING (true);
