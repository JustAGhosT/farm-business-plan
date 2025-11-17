
-- 004_locations.sql

INSERT INTO provinces (name) VALUES
('Eastern Cape'),
('Free State'),
('Gauteng'),
('KwaZulu-Natal'),
('Limpopo'),
('Mpumalanga'),
('North West'),
('Northern Cape'),
('Western Cape');

INSERT INTO towns (name, province_id) VALUES
('East London', 1),
('Port Elizabeth', 1),
('Mthatha', 1),
('Bloemfontein', 2),
('Welkom', 2),
('Kroonstad', 2),
('Johannesburg', 3),
('Pretoria', 3),
('Soweto', 3),
('Durban', 4),
('Pietermaritzburg', 4),
('Richards Bay', 4),
('Polokwane', 5),
('Mokopane', 5),
('Bela_Bela', 5),
('Mbombela', 6),
('Emalahleni', 6),
('Middelburg', 6),
('Mahikeng', 7),
('Rustenburg', 7),
('Klerksdorp', 7),
('Kimberley', 8),
('Upington', 8),
('Springbok', 8),
('Cape Town', 9),
('Stellenbosch', 9),
('George', 9);
