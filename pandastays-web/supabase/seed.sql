-- ==============================================================================
-- PandaStays Seed Data — Clean Slate Rebuild
-- Spec: Docs/pandastays-full-rebuild-brief.md (Section 3)
-- Seeds: Mukuba House (Lusaka) with Rooms, Bed-Spaces, Tenants, Tenancies,
-- Payments, Maintenance Reports (with manual priority), and Reminder Logs
-- ==============================================================================

-- 1. Landlord
INSERT INTO landlords (id, name, email, phone, lenco_subaccount_id, whatsapp_reminder_days_before)
VALUES (
    '11111111-0000-4000-8000-000000000001',
    'Mwamba Kaunda',
    'landlord@mukubahouse.zm',
    '+260 97 7123456',
    'sub_lenco_mukuba_981',
    3
) ON CONFLICT (id) DO NOTHING;

-- 2. Property: Mukuba House
INSERT INTO properties (id, landlord_id, name, address)
VALUES (
    '22222222-0000-4000-8000-000000000001',
    '11111111-0000-4000-8000-000000000001',
    'Mukuba House',
    'Plot 402, Great East Road, Northmead, Lusaka, Zambia'
) ON CONFLICT (id) DO NOTHING;

-- 3. Rooms
INSERT INTO rooms (id, property_id, room_number, capacity)
VALUES 
    ('33333333-0000-4000-8000-000000000101', '22222222-0000-4000-8000-000000000001', '101', 2),
    ('33333333-0000-4000-8000-000000000102', '22222222-0000-4000-8000-000000000001', '102', 2),
    ('33333333-0000-4000-8000-000000000103', '22222222-0000-4000-8000-000000000001', '103', 2),
    ('33333333-0000-4000-8000-000000000104', '22222222-0000-4000-8000-000000000001', '104', 2)
ON CONFLICT (id) DO NOTHING;

-- 4. Bed-Spaces (The fundamental rentable unit)
INSERT INTO bed_spaces (id, room_id, label, rent_amount, status)
VALUES 
    -- Room 101
    ('44444444-0000-4000-8000-000000000101', '33333333-0000-4000-8000-000000000101', 'Bed 101-A (Window)', 2600.00, 'occupied'),
    ('44444444-0000-4000-8000-000000000102', '33333333-0000-4000-8000-000000000101', 'Bed 101-B', 2500.00, 'occupied'),
    -- Room 102
    ('44444444-0000-4000-8000-000000000103', '33333333-0000-4000-8000-000000000102', 'Bed 102-A', 2500.00, 'occupied'),
    ('44444444-0000-4000-8000-000000000104', '33333333-0000-4000-8000-000000000102', 'Bed 102-B (Window)', 2600.00, 'occupied'),
    -- Room 103
    ('44444444-0000-4000-8000-000000000105', '33333333-0000-4000-8000-000000000103', 'Bed 103-A', 2500.00, 'occupied'),
    ('44444444-0000-4000-8000-000000000106', '33333333-0000-4000-8000-000000000103', 'Bed 103-B', 2500.00, 'vacant'),
    -- Room 104
    ('44444444-0000-4000-8000-000000000107', '33333333-0000-4000-8000-000000000104', 'Bed 104-A', 2800.00, 'occupied'),
    ('44444444-0000-4000-8000-000000000108', '33333333-0000-4000-8000-000000000104', 'Bed 104-B', 2800.00, 'reserved')
ON CONFLICT (id) DO NOTHING;

-- 5. Tenants
INSERT INTO tenants (id, name, email, phone, id_number, emergency_contact_name, emergency_contact_phone)
VALUES 
    ('55555555-0000-4000-8000-000000000001', 'John Phiri', 'john.phiri@unza.zm', '+260 97 1122334', '392819/11/1', 'Mr. Patrick Phiri (Father)', '+260 97 7889900'),
    ('55555555-0000-4000-8000-000000000002', 'Mary Banda', 'mary.banda@unza.zm', '+260 96 2233445', '410291/11/1', 'Mrs. Grace Banda (Mother)', '+260 96 6778899'),
    ('55555555-0000-4000-8000-000000000003', 'David Mulenga', 'david.m@cbu.ac.zm', '+260 95 3344556', '502918/11/1', 'Peter Mulenga (Uncle)', '+260 95 5667788'),
    ('55555555-0000-4000-8000-000000000004', 'Sarah Chilufya', 'sarah.c@unza.zm', '+260 97 4455667', '481920/11/1', 'Agnes Chilufya (Mother)', '+260 97 4455112'),
    ('55555555-0000-4000-8000-000000000005', 'Emmanuel Ngoma', 'engoma@apex.zm', '+260 96 5566778', '610294/11/1', 'Kelvin Ngoma (Brother)', '+260 96 3322110'),
    ('55555555-0000-4000-8000-000000000006', 'Chileshe Mubanga', 'chileshe.mubanga@unza.zm', '+260 97 6677889', '294810/11/1', 'Dr. J. Mubanga (Guardian)', '+260 97 9988776')
ON CONFLICT (id) DO NOTHING;

-- 6. Tenancies
INSERT INTO tenancies (id, bed_space_id, tenant_id, start_date, end_date, rent_amount, billing_cycle, status)
VALUES 
    ('66666666-0000-4000-8000-000000000001', '44444444-0000-4000-8000-000000000101', '55555555-0000-4000-8000-000000000001', '2026-01-05', '2026-12-15', 2600.00, 'monthly', 'active'),
    ('66666666-0000-4000-8000-000000000002', '44444444-0000-4000-8000-000000000102', '55555555-0000-4000-8000-000000000002', '2026-01-05', '2026-12-15', 2500.00, 'monthly', 'active'),
    ('66666666-0000-4000-8000-000000000003', '44444444-0000-4000-8000-000000000103', '55555555-0000-4000-8000-000000000003', '2026-01-05', '2026-12-15', 2500.00, 'monthly', 'active'),
    ('66666666-0000-4000-8000-000000000004', '44444444-0000-4000-8000-000000000104', '55555555-0000-4000-8000-000000000004', '2026-01-05', '2026-12-15', 2600.00, 'monthly', 'active'),
    ('66666666-0000-4000-8000-000000000005', '44444444-0000-4000-8000-000000000105', '55555555-0000-4000-8000-000000000005', '2026-02-01', '2026-12-15', 2500.00, 'monthly', 'active'),
    ('66666666-0000-4000-8000-000000000006', '44444444-0000-4000-8000-000000000107', '55555555-0000-4000-8000-000000000006', '2026-01-10', '2026-12-15', 2800.00, 'monthly', 'active')
ON CONFLICT (id) DO NOTHING;

-- 7. Payments (Recorded against Tenancy, with auto receipts)
INSERT INTO payments (id, tenancy_id, amount, paid_at, method, gateway_reference, status, receipt_number)
VALUES 
    ('77777777-0000-4000-8000-000000000001', '66666666-0000-4000-8000-000000000001', 2600.00, NOW() - INTERVAL '3 days', 'momo_mtn', 'LNC-MTN-984021', 'success', 'REC-2026-001'),
    ('77777777-0000-4000-8000-000000000002', '66666666-0000-4000-8000-000000000002', 2500.00, NOW() - INTERVAL '4 days', 'momo_airtel', 'LNC-AIR-882103', 'success', 'REC-2026-002'),
    ('77777777-0000-4000-8000-000000000003', '66666666-0000-4000-8000-000000000003', 1300.00, NOW() - INTERVAL '5 days', 'momo_mtn', 'LNC-MTN-773910', 'success', 'REC-2026-003'),
    ('77777777-0000-4000-8000-000000000004', '66666666-0000-4000-8000-000000000004', 2600.00, NOW() - INTERVAL '6 days', 'momo_zamtel', 'LNC-ZAM-661029', 'success', 'REC-2026-004'),
    ('77777777-0000-4000-8000-000000000006', '66666666-0000-4000-8000-000000000006', 2800.00, NOW() - INTERVAL '2 days', 'momo_airtel', 'LNC-AIR-552910', 'success', 'REC-2026-005')
ON CONFLICT (id) DO NOTHING;

-- 8. Reports (Maintenance issues with manual priority rank)
INSERT INTO reports (id, property_id, tenant_id, description, category, photo_url, status, priority_rank)
VALUES 
    ('88888888-0000-4000-8000-000000000001', '22222222-0000-4000-8000-000000000001', '55555555-0000-4000-8000-000000000005', 'Shower mixer tap leaking continuously in shared bathroom near Room 103', 'Plumbing', NULL, 'open', 1),
    ('88888888-0000-4000-8000-000000000002', '22222222-0000-4000-8000-000000000001', '55555555-0000-4000-8000-000000000003', 'Ceiling light flicker and socket dead on north wall of Room 102', 'Electrical', NULL, 'in_progress', 2),
    ('88888888-0000-4000-8000-000000000003', '22222222-0000-4000-8000-000000000001', '55555555-0000-4000-8000-000000000001', 'Study desk drawer runner jammed in Room 101 Bed A', 'Furniture', NULL, 'open', 3)
ON CONFLICT (id) DO NOTHING;

-- 9. Reminder Logs (Rules-based WhatsApp rent reminders)
INSERT INTO reminder_log (id, tenancy_id, sent_at, channel, reminder_type, delivery_status)
VALUES 
    ('99999999-0000-4000-8000-000000000001', '66666666-0000-4000-8000-000000000005', NOW() - INTERVAL '2 days', 'whatsapp', 'upcoming', 'delivered'),
    ('99999999-0000-4000-8000-000000000002', '66666666-0000-4000-8000-000000000003', NOW() - INTERVAL '1 day', 'whatsapp', 'upcoming', 'delivered')
ON CONFLICT (id) DO NOTHING;
