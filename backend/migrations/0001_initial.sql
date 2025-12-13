-- Users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT 0,
  is_whitelisted BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_admin ON users(is_admin);

-- Restaurants table
CREATE TABLE restaurants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  is_fast_food BOOLEAN DEFAULT 0,
  menu_link TEXT,
  photo_link TEXT,
  state TEXT DEFAULT 'pending' CHECK(state IN ('pending', 'active', 'upcoming', 'visited')),
  nominated_by_user_id INTEGER NOT NULL,
  created_by_admin_id INTEGER,
  average_rating REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  visited_at DATETIME,
  FOREIGN KEY (nominated_by_user_id) REFERENCES users(id),
  FOREIGN KEY (created_by_admin_id) REFERENCES users(id)
);

CREATE INDEX idx_restaurants_state ON restaurants(state);
CREATE INDEX idx_restaurants_nominated_by ON restaurants(nominated_by_user_id);

-- Visits table (tracks attendance and ratings)
CREATE TABLE visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  attended BOOLEAN DEFAULT 0,
  rating INTEGER CHECK(rating >= 1 AND rating <= 5),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(restaurant_id, user_id)
);

CREATE INDEX idx_visits_restaurant ON visits(restaurant_id);
CREATE INDEX idx_visits_user ON visits(user_id);

-- Sessions table
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
