-- Add reservation datetime for upcoming restaurants

-- Add reservation_datetime column
ALTER TABLE restaurants ADD COLUMN reservation_datetime DATETIME;

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_restaurants_reservation ON restaurants(reservation_datetime);
