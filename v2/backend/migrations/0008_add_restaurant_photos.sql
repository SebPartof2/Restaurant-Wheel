-- Add restaurant_photos table for multiple photos per restaurant
CREATE TABLE restaurant_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER NOT NULL,
  r2_key TEXT NOT NULL,              -- Path in R2: restaurants/{restaurant_id}/{uuid}-{version}.{ext}
  filename TEXT NOT NULL,             -- Original filename from upload
  mime_type TEXT NOT NULL,            -- image/jpeg, image/png, image/webp
  file_size INTEGER NOT NULL,         -- File size in bytes
  width INTEGER,                      -- Image width in pixels (optional)
  height INTEGER,                     -- Image height in pixels (optional)
  is_primary BOOLEAN DEFAULT 0,       -- Flag for primary photo (shown in cards)
  uploaded_by_user_id INTEGER NOT NULL,
  display_order INTEGER DEFAULT 0,    -- Order in gallery (0 = first)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX idx_photos_restaurant ON restaurant_photos(restaurant_id);
CREATE INDEX idx_photos_uploaded_by ON restaurant_photos(uploaded_by_user_id);
CREATE INDEX idx_photos_primary ON restaurant_photos(restaurant_id, is_primary);
CREATE INDEX idx_photos_order ON restaurant_photos(restaurant_id, display_order);
