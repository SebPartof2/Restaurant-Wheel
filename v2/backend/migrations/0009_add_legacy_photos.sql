-- Add legacy_photo_urls table to preserve v1 external photo URLs
-- This table stores the original photo_link URLs from v1 restaurants
-- These are kept separate since they are external URLs, not R2-stored photos
CREATE TABLE legacy_photo_urls (
  restaurant_id INTEGER PRIMARY KEY,
  url TEXT NOT NULL,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Index for quick lookups
CREATE INDEX idx_legacy_photos_restaurant ON legacy_photo_urls(restaurant_id);
