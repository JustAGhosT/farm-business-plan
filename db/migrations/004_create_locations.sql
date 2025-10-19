
-- 004_create_locations.sql

CREATE TABLE provinces (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE towns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  province_id INTEGER NOT NULL REFERENCES provinces(id)
);
