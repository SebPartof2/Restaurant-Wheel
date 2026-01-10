-- Disable foreign key constraints temporarily
PRAGMA foreign_keys = OFF;

-- Delete existing user
DELETE FROM users WHERE id = 5;

-- Insert all required users
INSERT INTO users (id, email, name, is_admin, is_whitelisted, is_provisional, created_at) VALUES
(1, 'sebpartof2@gmail.com', 'Sebastian Kang', 1, 1, 0, datetime('now')),
(2, 'stephanie.kendall@gmail.com', 'Stephanie Kendall', 0, 1, 0, datetime('now')),
(3, 'hui.kang00@gmail.com', 'Hui Kang', 0, 1, 0, datetime('now')),
(4, 'theodore.kang00@gmail.com', 'Theodore Kang', 0, 1, 0, datetime('now'));

-- Re-enable foreign key constraints
PRAGMA foreign_keys = ON;
