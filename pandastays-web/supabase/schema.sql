-- ==============================================================================
-- PandaStays Database Schema — Clean Slate Rebuild (Hardened RLS)
-- Spec: Docs/pandastays-full-rebuild-brief.md & RLS Security Fix Brief
-- Architecture: Multi-Landlord SaaS for Zambian Student Boarding Houses
-- Core Unit: Bed-Space (Fundamental Rentable Unit)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- CLEAN SLATE RESET (Drops legacy & existing tables/types cleanly)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS reminder_log CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS tenancies CASCADE;
DROP TABLE IF EXISTS bed_spaces CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS landlords CASCADE;

-- Legacy tables cleanup
DROP TABLE IF EXISTS maintenance_tickets CASCADE;
DROP TABLE IF EXISTS security_deposits CASCADE;
DROP TABLE IF EXISTS beds CASCADE;

-- Drop Enum types cleanly
DROP TYPE IF EXISTS bed_status CASCADE;
DROP TYPE IF EXISTS tenancy_status CASCADE;
DROP TYPE IF EXISTS payment_method_type CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS report_status CASCADE;
DROP TYPE IF EXISTS reminder_channel CASCADE;
DROP TYPE IF EXISTS reminder_type CASCADE;
DROP TYPE IF EXISTS reminder_delivery_status CASCADE;

-- ------------------------------------------------------------------------------
-- ENUM TYPES
-- ------------------------------------------------------------------------------
CREATE TYPE bed_status AS ENUM ('vacant', 'occupied', 'reserved');
CREATE TYPE tenancy_status AS ENUM ('active', 'ended');
CREATE TYPE payment_method_type AS ENUM ('momo_mtn', 'momo_airtel', 'momo_zamtel', 'card', 'bank_transfer', 'cash');
CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed', 'reversed');
CREATE TYPE report_status AS ENUM ('open', 'in_progress', 'resolved');
CREATE TYPE reminder_channel AS ENUM ('whatsapp', 'sms');
CREATE TYPE reminder_type AS ENUM ('upcoming', 'overdue');
CREATE TYPE reminder_delivery_status AS ENUM ('queued', 'sent', 'delivered', 'failed');

-- ------------------------------------------------------------------------------
-- 1. Landlords Table (Profile data keyed directly to auth.users.id)
-- ------------------------------------------------------------------------------
CREATE TABLE landlords (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    lenco_subaccount_id VARCHAR(100),
    whatsapp_reminder_days_before INT NOT NULL DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Trigger to automatically create landlord profile upon auth signup
CREATE OR REPLACE FUNCTION public.handle_new_landlord()
RETURNS TRIGGER AS $$
BEGIN
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'landlord') = 'landlord' THEN
    INSERT INTO public.landlords (id, name, email, phone)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'phone', '')
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      email = EXCLUDED.email;
  ELSIF (NEW.raw_user_meta_data->>'role') = 'tenant' THEN
    -- Automatically link tenant record created by landlord if email matches
    UPDATE public.tenants
    SET auth_user_id = NEW.id
    WHERE LOWER(email) = LOWER(NEW.email) AND auth_user_id IS NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_landlord();

-- ------------------------------------------------------------------------------
-- 2. Properties Table
-- ------------------------------------------------------------------------------
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    landlord_id UUID NOT NULL REFERENCES landlords(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 3. Rooms Table
-- ------------------------------------------------------------------------------
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    room_number VARCHAR(50) NOT NULL,
    capacity INT NOT NULL DEFAULT 2,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_room_per_property UNIQUE (property_id, room_number)
);

-- ------------------------------------------------------------------------------
-- 4. Bed Spaces Table (The Fundamental Rentable Unit)
-- ------------------------------------------------------------------------------
CREATE TABLE bed_spaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    label VARCHAR(50) NOT NULL, -- e.g. "Bed 101-A (Window)", "Bed 101-B"
    rent_amount NUMERIC(12, 2) NOT NULL DEFAULT 2500.00,
    status bed_status NOT NULL DEFAULT 'vacant',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_bed_per_room UNIQUE (room_id, label)
);

-- ------------------------------------------------------------------------------
-- 5. Tenants Table (Auth profile data or invited tenants)
-- ------------------------------------------------------------------------------
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    id_number VARCHAR(100), -- NRC or Student ID
    date_of_birth DATE,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 6. Tenancies Table (Links a Tenant to a specific Bed-Space)
-- ------------------------------------------------------------------------------
CREATE TABLE tenancies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bed_space_id UUID NOT NULL REFERENCES bed_spaces(id) ON DELETE RESTRICT,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    rent_amount NUMERIC(12, 2) NOT NULL,
    billing_cycle VARCHAR(50) NOT NULL DEFAULT 'monthly', -- 'monthly' or 'semester'
    status tenancy_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 7. Payments Table (Recorded against Tenancy with automatic receipt number)
-- ------------------------------------------------------------------------------
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenancy_id UUID NOT NULL REFERENCES tenancies(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    method payment_method_type NOT NULL DEFAULT 'momo_mtn',
    gateway_reference VARCHAR(255),
    status payment_status NOT NULL DEFAULT 'success',
    receipt_number VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 8. Reports Table (Maintenance issues with manual priority rank)
-- ------------------------------------------------------------------------------
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    photo_url TEXT,
    status report_status NOT NULL DEFAULT 'open',
    priority_rank INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 9. Reminder Log Table (Rules-based WhatsApp/SMS rent notifications)
-- ------------------------------------------------------------------------------
CREATE TABLE reminder_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenancy_id UUID NOT NULL REFERENCES tenancies(id) ON DELETE CASCADE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    channel reminder_channel NOT NULL DEFAULT 'whatsapp',
    reminder_type reminder_type NOT NULL DEFAULT 'upcoming',
    delivery_status reminder_delivery_status NOT NULL DEFAULT 'delivered'
);

-- ------------------------------------------------------------------------------
-- INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX idx_properties_landlord_id ON properties(landlord_id);
CREATE INDEX idx_rooms_property_id ON rooms(property_id);
CREATE INDEX idx_bed_spaces_room_id ON bed_spaces(room_id);
CREATE INDEX idx_bed_spaces_status ON bed_spaces(status);
CREATE INDEX idx_tenants_auth_user_id ON tenants(auth_user_id);
CREATE INDEX idx_tenants_email ON tenants(email);
CREATE INDEX idx_tenancies_bed_space_id ON tenancies(bed_space_id);
CREATE INDEX idx_tenancies_tenant_id ON tenancies(tenant_id);
CREATE INDEX idx_tenancies_status ON tenancies(status);
CREATE INDEX idx_payments_tenancy_id ON payments(tenancy_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_reports_property_id ON reports(property_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_priority_rank ON reports(priority_rank);
CREATE INDEX idx_reminder_log_tenancy_id ON reminder_log(tenancy_id);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE landlords ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bed_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_log ENABLE ROW LEVEL SECURITY;

-- 1. Clear out any legacy or permissive no-op policies
DROP POLICY IF EXISTS "Allow public read landlords" ON landlords;
DROP POLICY IF EXISTS "Allow public read properties" ON properties;
DROP POLICY IF EXISTS "Allow public read rooms" ON rooms;
DROP POLICY IF EXISTS "Allow public read bed_spaces" ON bed_spaces;
DROP POLICY IF EXISTS "Allow public read tenants" ON tenants;
DROP POLICY IF EXISTS "Allow public read tenancies" ON tenancies;
DROP POLICY IF EXISTS "Allow public read payments" ON payments;
DROP POLICY IF EXISTS "Allow public read reports" ON reports;
DROP POLICY IF EXISTS "Allow public read reminder_log" ON reminder_log;

DROP POLICY IF EXISTS "landlords_select_own" ON landlords;
DROP POLICY IF EXISTS "landlords_update_own" ON landlords;
DROP POLICY IF EXISTS "landlords_insert_own" ON landlords;
DROP POLICY IF EXISTS "properties_all_own" ON properties;
DROP POLICY IF EXISTS "rooms_all_own" ON rooms;
DROP POLICY IF EXISTS "bed_spaces_landlord_all" ON bed_spaces;
DROP POLICY IF EXISTS "bed_spaces_tenant_select_own" ON bed_spaces;
DROP POLICY IF EXISTS "tenants_select_own" ON tenants;
DROP POLICY IF EXISTS "tenants_update_own" ON tenants;
DROP POLICY IF EXISTS "tenants_landlord_select" ON tenants;
DROP POLICY IF EXISTS "tenants_landlord_insert" ON tenants;
DROP POLICY IF EXISTS "tenancies_landlord_all" ON tenancies;
DROP POLICY IF EXISTS "tenancies_tenant_select_own" ON tenancies;
DROP POLICY IF EXISTS "payments_landlord_select" ON payments;
DROP POLICY IF EXISTS "payments_tenant_select_own" ON payments;
DROP POLICY IF EXISTS "reports_landlord_all" ON reports;
DROP POLICY IF EXISTS "reports_tenant_select_own" ON reports;
DROP POLICY IF EXISTS "reports_tenant_insert_own" ON reports;
DROP POLICY IF EXISTS "reminder_log_landlord_select" ON reminder_log;

-- 2. Landlords: Each landlord sees/edits only their own profile
CREATE POLICY "landlords_select_own" ON landlords FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "landlords_update_own" ON landlords FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "landlords_insert_own" ON landlords FOR INSERT
  WITH CHECK (id = auth.uid());

-- 3. Properties: Scoped directly by landlord_id
CREATE POLICY "properties_all_own" ON properties FOR ALL
  USING (landlord_id = auth.uid())
  WITH CHECK (landlord_id = auth.uid());

-- 4. Rooms: Scoped through properties
CREATE POLICY "rooms_all_own" ON rooms FOR ALL
  USING (EXISTS (SELECT 1 FROM properties p WHERE p.id = rooms.property_id AND p.landlord_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM properties p WHERE p.id = rooms.property_id AND p.landlord_id = auth.uid()));

-- 5. Bed Spaces: Landlord full access via property chain; tenant read-only for their own bed-space
CREATE POLICY "bed_spaces_landlord_all" ON bed_spaces FOR ALL
  USING (EXISTS (
    SELECT 1 FROM rooms r JOIN properties p ON p.id = r.property_id
    WHERE r.id = bed_spaces.room_id AND p.landlord_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM rooms r JOIN properties p ON p.id = r.property_id
    WHERE r.id = bed_spaces.room_id AND p.landlord_id = auth.uid()
  ));

CREATE POLICY "bed_spaces_tenant_select_own" ON bed_spaces FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM tenancies t JOIN tenants te ON te.id = t.tenant_id
    WHERE t.bed_space_id = bed_spaces.id AND te.auth_user_id = auth.uid()
  ));

-- 6. Tenants: Landlord sees/manages tenants in their properties; tenant sees/edits only themself
CREATE POLICY "tenants_select_own" ON tenants FOR SELECT
  USING (auth_user_id = auth.uid());

CREATE POLICY "tenants_update_own" ON tenants FOR UPDATE
  USING (auth_user_id = auth.uid());

CREATE POLICY "tenants_landlord_select" ON tenants FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM tenancies t
    JOIN bed_spaces bs ON bs.id = t.bed_space_id
    JOIN rooms r ON r.id = bs.room_id
    JOIN properties p ON p.id = r.property_id
    WHERE t.tenant_id = tenants.id AND p.landlord_id = auth.uid()
  ));

CREATE POLICY "tenants_landlord_insert" ON tenants FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 7. Tenancies: Landlord full access via property chain; tenant read-only for their own
CREATE POLICY "tenancies_landlord_all" ON tenancies FOR ALL
  USING (EXISTS (
    SELECT 1 FROM bed_spaces bs JOIN rooms r ON r.id = bs.room_id JOIN properties p ON p.id = r.property_id
    WHERE bs.id = tenancies.bed_space_id AND p.landlord_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM bed_spaces bs JOIN rooms r ON r.id = bs.room_id JOIN properties p ON p.id = r.property_id
    WHERE bs.id = tenancies.bed_space_id AND p.landlord_id = auth.uid()
  ));

CREATE POLICY "tenancies_tenant_select_own" ON tenancies FOR SELECT
  USING (EXISTS (SELECT 1 FROM tenants te WHERE te.id = tenancies.tenant_id AND te.auth_user_id = auth.uid()));

-- 8. Payments: Read-only for both roles via client; all writes go through server using service role
CREATE POLICY "payments_landlord_select" ON payments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM tenancies t
    JOIN bed_spaces bs ON bs.id = t.bed_space_id
    JOIN rooms r ON r.id = bs.room_id
    JOIN properties p ON p.id = r.property_id
    WHERE t.id = payments.tenancy_id AND p.landlord_id = auth.uid()
  ));

CREATE POLICY "payments_tenant_select_own" ON payments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM tenancies t JOIN tenants te ON te.id = t.tenant_id
    WHERE t.id = payments.tenancy_id AND te.auth_user_id = auth.uid()
  ));

-- 9. Reports: Landlord full access via property; tenant can read/create their own
CREATE POLICY "reports_landlord_all" ON reports FOR ALL
  USING (EXISTS (SELECT 1 FROM properties p WHERE p.id = reports.property_id AND p.landlord_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM properties p WHERE p.id = reports.property_id AND p.landlord_id = auth.uid()));

CREATE POLICY "reports_tenant_select_own" ON reports FOR SELECT
  USING (EXISTS (SELECT 1 FROM tenants te WHERE te.id = reports.tenant_id AND te.auth_user_id = auth.uid()));

CREATE POLICY "reports_tenant_insert_own" ON reports FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM tenants te WHERE te.id = reports.tenant_id AND te.auth_user_id = auth.uid()));

-- 10. Reminder Log: Landlord read-only visibility via tenancy chain; no client insert policy
CREATE POLICY "reminder_log_landlord_select" ON reminder_log FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM tenancies t
    JOIN bed_spaces bs ON bs.id = t.bed_space_id
    JOIN rooms r ON r.id = bs.room_id
    JOIN properties p ON p.id = r.property_id
    WHERE t.id = reminder_log.tenancy_id AND p.landlord_id = auth.uid()
  ));
