-- Optional: sample data so you can see the app working right away.
-- Run AFTER schema.sql: psql -U postgres -d truck_hire_zw -f seed.sql
-- Password for both sample drivers is: password123

INSERT INTO drivers (full_name, phone, whatsapp, email, password_hash, city, is_phone_verified, subscription_status)
VALUES
('Tinashe Moyo', '+263771234567', '+263771234567', 'tinashe@example.com',
 '$2a$10$C6UzMDM.H6dfI/f3fLLW1eLfrGB2xTuLZxWq3g4rmKMLXO6TQtL9y', 'Harare', TRUE, 'active'),
('Farai Chikwanha', '+263772345678', '+263772345678', 'farai@example.com',
 '$2a$10$C6UzMDM.H6dfI/f3fLLW1eLfrGB2xTuLZxWq3g4rmKMLXO6TQtL9y', 'Bulawayo', FALSE, 'trial')
ON CONFLICT (phone) DO NOTHING;

INSERT INTO trucks (driver_id, title, truck_type, capacity_tonnes, description, location, price_guide, is_boosted, status)
SELECT id, 'Toyota Dyna 1 Tonne Truck', '1_ton', 1.0, 'Reliable 1 tonne truck, good for house moves and small deliveries.', 'Harare CBD', 'From $30/load, negotiable', TRUE, 'active'
FROM drivers WHERE phone = '+263771234567';

INSERT INTO trucks (driver_id, title, truck_type, capacity_tonnes, description, location, price_guide, is_boosted, status)
SELECT id, 'Isuzu 5 Tonne Lorry', '5_ton', 5.0, 'Open lorry, good for building materials and bulk goods.', 'Harare South', 'From $60/load', FALSE, 'active'
FROM drivers WHERE phone = '+263771234567';

INSERT INTO trucks (driver_id, title, truck_type, capacity_tonnes, description, location, price_guide, is_boosted, status)
SELECT id, 'Nissan Pickup for Hire', 'pickup', 0.75, 'Small pickup, ideal for quick errands and light loads around town.', 'Bulawayo', 'From $15/trip', FALSE, 'active'
FROM drivers WHERE phone = '+263772345678';
