-- PandaStays Seed Data Script
-- Populates database with dummy data matching Stitch property dashboard templates
-- Uses strictly valid hexadecimal standard UUID v4 strings

-- 1. Insert Property
INSERT INTO properties (id, name, address, landlord_id)
VALUES (
    'a1b2c3d4-0000-4000-8000-000000000001',
    'Mukuba House',
    'Plot 402, Great East Road, Lusaka, Zambia',
    'b2c3d4e5-0000-4000-8000-000000000001'
) ON CONFLICT (id) DO NOTHING;

-- 2. Insert Rooms
INSERT INTO rooms (id, property_id, room_number, capacity, price_per_term)
VALUES 
    ('10000001-0000-4000-8000-000000000101', 'a1b2c3d4-0000-4000-8000-000000000001', '101', 2, 2500.00),
    ('10000001-0000-4000-8000-000000000102', 'a1b2c3d4-0000-4000-8000-000000000001', '102', 2, 2500.00),
    ('10000001-0000-4000-8000-000000000103', 'a1b2c3d4-0000-4000-8000-000000000001', '103', 2, 2500.00),
    ('10000001-0000-4000-8000-000000000104', 'a1b2c3d4-0000-4000-8000-000000000001', '104', 2, 2500.00)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Beds for Rooms
INSERT INTO beds (id, room_id, bed_label, status)
VALUES 
    -- Room 101 Beds
    ('b0000001-0000-4000-8000-000000000101', '10000001-0000-4000-8000-000000000101', 'Bed A', 'occupied'),
    ('b0000001-0000-4000-8000-000000000102', '10000001-0000-4000-8000-000000000101', 'Bed B', 'occupied'),
    -- Room 102 Beds
    ('b0000001-0000-4000-8000-000000000103', '10000001-0000-4000-8000-000000000102', 'Bed A', 'occupied'),
    ('b0000001-0000-4000-8000-000000000104', '10000001-0000-4000-8000-000000000102', 'Bed B', 'occupied'),
    -- Room 103 Beds
    ('b0000001-0000-4000-8000-000000000105', '10000001-0000-4000-8000-000000000103', 'Bed A', 'occupied'),
    ('b0000001-0000-4000-8000-000000000106', '10000001-0000-4000-8000-000000000103', 'Bed B', 'vacant'),
    -- Room 104 Beds
    ('b0000001-0000-4000-8000-000000000107', '10000001-0000-4000-8000-000000000104', 'Bed A', 'occupied'),
    ('b0000001-0000-4000-8000-000000000108', '10000001-0000-4000-8000-000000000104', 'Bed B', 'occupied')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Tenants
INSERT INTO tenants (id, full_name, phone_number, student_id, emergency_contact, current_bed_id, lease_start, lease_end)
VALUES 
    ('e0000001-0000-4000-8000-000000000001', 'Chileshe Mubanga', '+260 97 1234567', '20240981', 'Parent (+260 97 1234567)', 'b0000001-0000-4000-8000-000000000107', '2024-01-01', '2026-11-30'),
    ('e0000001-0000-4000-8000-000000000002', 'John Phiri', '+260 96 2345678', '20240982', 'Guardian (+260 96 2345678)', 'b0000001-0000-4000-8000-000000000101', '2024-01-01', '2026-11-30'),
    ('e0000001-0000-4000-8000-000000000003', 'Mary Banda', '+260 95 3456789', '20240983', 'Parent (+260 95 3456789)', 'b0000001-0000-4000-8000-000000000102', '2024-01-01', '2026-11-30'),
    ('e0000001-0000-4000-8000-000000000004', 'David Mulenga', '+260 97 4567890', '20240984', 'Parent (+260 97 4567890)', 'b0000001-0000-4000-8000-000000000103', '2024-01-01', '2026-11-30'),
    ('e0000001-0000-4000-8000-000000000005', 'Sarah Chilufya', '+260 96 5678901', '20240985', 'Guardian (+260 96 5678901)', 'b0000001-0000-4000-8000-000000000104', '2024-01-01', '2026-11-30'),
    ('e0000001-0000-4000-8000-000000000006', 'Emmanuel Ngoma', '+260 95 6789012', '20240986', 'Parent (+260 95 6789012)', 'b0000001-0000-4000-8000-000000000105', '2024-01-01', '2026-11-30'),
    ('e0000001-0000-4000-8000-000000000007', 'Chanda Mwewa', '+260 97 7890123', '20240987', 'Parent (+260 97 7890123)', 'b0000001-0000-4000-8000-000000000108', '2024-01-01', '2026-11-30')
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Payments
INSERT INTO payments (id, tenant_id, amount, payment_method, status, transaction_ref, created_at)
VALUES 
    ('c0000001-0000-4000-8000-000000000001', 'e0000001-0000-4000-8000-000000000001', 1200.00, 'momo_mtn', 'successful', 'TXN-10293', NOW() - INTERVAL '2 days'),
    ('c0000001-0000-4000-8000-000000000002', 'e0000001-0000-4000-8000-000000000004', 1250.00, 'cash', 'successful', 'TXN-10292', NOW() - INTERVAL '3 days'),
    ('c0000001-0000-4000-8000-000000000003', 'e0000001-0000-4000-8000-000000000006', 2500.00, 'momo_airtel', 'successful', 'TXN-10291', NOW() - INTERVAL '4 days')
ON CONFLICT (id) DO NOTHING;

-- 6. Insert Maintenance Tickets
INSERT INTO maintenance_tickets (id, property_id, room_id, issue_title, description, priority, status, cost_spent)
VALUES 
    ('d0000001-0000-4000-8000-000000000001', 'a1b2c3d4-0000-4000-8000-000000000001', '10000001-0000-4000-8000-000000000104', 'Leaking Bathroom Pipe', 'Water spreading to hallway carpet.', 'urgent', 'open', 0.00),
    ('d0000001-0000-4000-8000-000000000002', 'a1b2c3d4-0000-4000-8000-000000000001', '10000001-0000-4000-8000-000000000101', 'Broken Bed Frame', 'Slats collapsed on one side.', 'normal', 'in_progress', 450.00),
    ('d0000001-0000-4000-8000-000000000003', 'a1b2c3d4-0000-4000-8000-000000000001', '10000001-0000-4000-8000-000000000102', 'Flickering Lights', 'Main room light bulb needs replacing.', 'normal', 'open', 0.00),
    ('d0000001-0000-4000-8000-000000000004', 'a1b2c3d4-0000-4000-8000-000000000001', '10000001-0000-4000-8000-000000000103', 'Broken Window Pane', 'Security risk, ground floor.', 'urgent', 'fixed', 850.00)
ON CONFLICT (id) DO NOTHING;

-- 7. Insert Security Deposits
INSERT INTO security_deposits (id, tenant_id, amount_held, status)
VALUES 
    ('f0000001-0000-4000-8000-000000000001', 'e0000001-0000-4000-8000-000000000001', 1200.00, 'held'),
    ('f0000001-0000-4000-8000-000000000002', 'e0000001-0000-4000-8000-000000000002', 1200.00, 'held'),
    ('f0000001-0000-4000-8000-000000000003', 'e0000001-0000-4000-8000-000000000005', 1100.00, 'held')
ON CONFLICT (id) DO NOTHING;
