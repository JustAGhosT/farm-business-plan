
-- 003_create_crop_suggestions.sql

CREATE TABLE crop_suggestions (
  id SERIAL PRIMARY KEY,
  province VARCHAR(255) NOT NULL,
  town VARCHAR(255) NOT NULL,
  crop_name VARCHAR(255) NOT NULL
);
