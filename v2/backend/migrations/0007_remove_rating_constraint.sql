-- Remove rating constraint and change to REAL type for decimal support
-- Note: D1 handles transactions automatically, no need for explicit BEGIN/COMMIT

-- Create new visits table without rating constraint
CREATE TABLE visits_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  attended BOOLEAN DEFAULT 0,
  rating REAL,  -- Changed from INTEGER to REAL, removed CHECK constraint
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(restaurant_id, user_id)
);

-- Copy data from old table
INSERT INTO visits_new (id, restaurant_id, user_id, attended, rating, created_at, updated_at)
SELECT id, restaurant_id, user_id, attended, rating, created_at, updated_at
FROM visits;

-- Drop old table
DROP TABLE visits;

-- Rename new table
ALTER TABLE visits_new RENAME TO visits;

-- Recreate indexes
CREATE INDEX idx_visits_restaurant ON visits(restaurant_id);
CREATE INDEX idx_visits_user ON visits(user_id);
