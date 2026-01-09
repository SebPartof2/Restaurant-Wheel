-- Migration from v1 to v2
-- Generated from v1 backup
-- Run with: wrangler d1 execute restaurant-wheel-db-v2 --remote --file=v1-to-v2-migration.sql

-- ============================================================
-- USERS MIGRATION
-- ============================================================
-- Migrate all users with their existing password hashes
-- OAuth fields will be populated when they first login with S-Auth

INSERT INTO users (id, email, password_hash, name, is_admin, is_whitelisted, is_provisional, signup_code, created_at) VALUES
(1, 'sebpartof2@gmail.com', '4af1d7d982da964ead8c55770155e270d27fa82f76e2e3334a98381729f92d85', 'Sebastian', 1, 1, 0, NULL, '2025-12-13 19:58:50'),
(2, 'stephanie.kendall@gmail.com', '19e74589bcb84d1e5ceb387c17d327d4e40c5946df4cdbd9090db7dfb4aae941', 'Stephanie', 0, 1, 0, NULL, '2025-12-13 20:20:11'),
(3, 'huikang00@gmail.com', '0c93429aca7ff69f83c2c84de3ed248303f2a924140cd60cb23cbec34e62c862', 'Hui', 0, 1, 0, NULL, '2025-12-13 20:23:25'),
(4, 'theodore.kang00@gmail.com', '', 'Theodore', 0, 1, 1, 'BNV78', '2025-12-13 20:23:39');

-- ============================================================
-- RESTAURANTS MIGRATION
-- ============================================================
-- Note: photo_link field is excluded (v2 uses restaurant_photos table)

INSERT INTO restaurants (id, name, address, is_fast_food, menu_link, state, nominated_by_user_id, created_by_admin_id, average_rating, created_at, updated_at, visited_at, reservation_datetime) VALUES
(1, 'The Smith', '400 N Clark St, Chicago, IL 60654', 0, 'https://thesmithrestaurant.com/location/chicago/#menu_select-menu-below', 'visited', 2, 1, 8.5, '2025-12-13 20:21:52', '2025-12-14 00:07:53', '2025-12-14 00:00:00', '2025-12-13 16:45:00'),
(2, 'Al Bawadi Grill', '8501 W Dempster St, Niles, IL 60714', 0, NULL, 'upcoming', 2, 1, 0, '2025-12-13 20:34:16', '2026-01-03 23:53:49', NULL, NULL),
(3, 'Au Cheval', '800 W Randolph St, Chicago, IL 60607', 0, NULL, 'active', 1, NULL, 0, '2025-12-13 20:34:42', '2025-12-13 22:08:27', NULL, NULL),
(4, 'Applebees', '6656 W. Grand Avenue, Chicago, IL 60707', 0, NULL, 'active', 4, 1, 0, '2025-12-13 20:37:48', '2025-12-13 22:08:25', NULL, NULL),
(8, 'Maharaj Indian Grill', '3400 River Rd, Franklin Park, IL 60131', 0, NULL, 'active', 2, NULL, 0, '2025-12-13 21:07:28', '2025-12-13 22:33:19', NULL, NULL),
(9, 'Alejandra''s', '400 E North Ave, Northlake, IL 60164', 0, NULL, 'active', 2, NULL, 0, '2025-12-13 21:07:57', '2025-12-13 22:08:23', NULL, NULL),
(10, 'Burger King', '6701 W Roosevelt Rd, Berwyn, IL 60402', 1, NULL, 'active', 4, 1, 0, '2025-12-13 21:08:59', '2025-12-13 22:08:29', NULL, NULL),
(11, 'Butcher & The Burger', '1021 W Armitage Ave, Chicago, IL 60614', 0, NULL, 'active', 2, 1, 0, '2025-12-13 21:12:15', '2025-12-13 22:08:30', NULL, NULL),
(12, 'Chef Ping', '1755 W Algonquin Rd, Rolling Meadows, IL 60008', 0, NULL, 'active', 2, 1, 0, '2025-12-13 21:14:51', '2025-12-13 22:08:43', NULL, NULL),
(13, 'CHICAGO RAMEN', '578 E Oakton St, Des Plaines, IL 60018', 0, 'https://chicago-ramen.us/collections', 'visited', 1, NULL, 8.75, '2025-12-13 21:16:07', '2025-12-24 00:45:22', '2025-12-24 00:00:00', NULL),
(14, 'Chili''s Grill & Bar', '915 W North Ave, Melrose Park, IL 60160', 0, NULL, 'active', 4, 1, 0, '2025-12-13 21:16:54', '2025-12-13 22:08:46', NULL, NULL),
(15, 'Chipotle Mexican Grill', '500 W North Ave, Melrose Park, IL 60160', 1, NULL, 'active', 1, NULL, 0, '2025-12-13 21:20:42', '2025-12-13 22:08:49', NULL, NULL),
(16, 'Community Tavern', '4038 N Milwaukee Ave, Chicago, IL 60641', 0, NULL, 'active', 2, 1, 0, '2025-12-13 21:21:41', '2025-12-13 22:08:51', NULL, NULL),
(17, 'Gibsons Bar & Steakhouse', '5464 N River Rd, Rosemont, IL 60018', 0, NULL, 'active', 1, NULL, 0, '2025-12-13 21:22:43', '2025-12-13 22:08:52', NULL, NULL),
(18, 'Greek Islands', '200 S Halsted St, Chicago, IL 60661', 0, NULL, 'active', 2, 1, 0, '2025-12-13 21:24:32', '2025-12-13 22:08:54', NULL, NULL),
(20, 'The Hampton Social - River North', '353 W Hubbard St, Chicago, IL 60654', 0, NULL, 'active', 2, 1, 0, '2025-12-13 21:26:24', '2025-12-13 22:10:26', NULL, NULL),
(21, 'Harry Caray''s Italian Steakhouse', '33 W Kinzie St, Chicago, IL 60654', 0, NULL, 'active', 1, NULL, 0, '2025-12-13 21:26:45', '2025-12-13 22:08:55', NULL, NULL),
(22, 'Hoja Santa', '722 Lake St, Oak Park, IL 60301', 0, NULL, 'active', 2, 1, 0, '2025-12-13 21:27:32', '2025-12-13 22:08:57', NULL, NULL),
(23, 'IHOP', '1040 W North Ave, Winston Plaza, Melrose Park, IL 60160', 1, NULL, 'active', 4, 1, 0, '2025-12-13 21:27:59', '2025-12-13 22:08:58', NULL, NULL),
(24, 'Kettlestrings Tavern', '800 S Oak Park Ave, Oak Park, IL 60304', 0, NULL, 'active', 1, NULL, 0, '2025-12-13 21:28:26', '2025-12-13 22:09:00', NULL, NULL),
(25, '336 Korean BBQ', '8357 W Golf Rd, Niles, IL 60714', 0, NULL, 'active', 2, 1, 0, '2025-12-13 21:29:21', '2025-12-13 22:08:17', NULL, NULL),
(26, 'Kyuramen - Oak Park', '118 N Marion St, Oak Park, IL 60301', 1, NULL, 'active', 1, NULL, 0, '2025-12-13 21:30:16', '2025-12-13 22:09:01', NULL, NULL),
(27, 'Little Bad Wolf', '1541 W Bryn Mawr Ave, Chicago, IL 60660', 0, NULL, 'active', 2, 1, 0, '2025-12-13 21:30:45', '2025-12-13 22:09:03', NULL, NULL),
(28, 'Little Goat Diner', '3325 N Southport Ave, Chicago, IL 60657', 0, NULL, 'active', 2, 1, 0, '2025-12-13 21:31:20', '2025-12-13 22:09:07', NULL, NULL),
(29, 'McDonald''s', '11 N 1st Ave, Maywood, IL 60153', 1, NULL, 'active', 4, 1, 0, '2025-12-13 21:32:09', '2025-12-13 22:09:08', NULL, NULL),
(30, 'McDonald''s (HQ)', '110 N Carpenter St, Chicago, IL 60607', 0, NULL, 'active', 2, 1, 0, '2025-12-13 21:32:54', '2025-12-13 22:10:09', NULL, NULL),
(31, 'The Momo World', '727 W Maxwell St, Chicago, IL 60607', 0, NULL, 'active', 2, 1, 0, '2025-12-13 21:33:51', '2025-12-13 22:10:27', NULL, NULL),
(32, 'New Star Restaurant', '7444 W North Ave, Elmwood Park, IL 60707', 0, NULL, 'active', 1, NULL, 0, '2025-12-13 21:34:54', '2025-12-13 22:10:10', NULL, NULL),
(33, 'Olive Garden Italian Restaurant', '1315 W North Ave, Melrose Park, IL 60160', 0, NULL, 'active', 4, 1, 0, '2025-12-13 21:37:30', '2025-12-13 22:10:11', NULL, NULL),
(34, 'Petite Vie Brasserie', '909 Burlington Ave, Western Springs, IL 60558', 0, NULL, 'active', 2, 1, 0, '2025-12-13 21:38:03', '2026-01-03 23:52:27', NULL, NULL),
(35, 'Popeyes Louisiana Kitchen', '610 Madison St, Oak Park, IL 60302', 1, NULL, 'active', 4, 1, 0, '2025-12-13 21:40:00', '2025-12-13 22:10:14', NULL, NULL),
(36, 'RAMEN-SAN', '59 W Hubbard St #2, Chicago, IL 60654', 0, NULL, 'active', 1, NULL, 0, '2025-12-13 21:40:36', '2025-12-13 22:10:18', NULL, NULL),
(37, 'Rustico', '155 S Oak Park Ave, Oak Park, IL 60302', 0, NULL, 'active', 2, 1, 0, '2025-12-13 21:41:43', '2025-12-13 22:10:20', NULL, NULL),
(38, 'SEN Sushi Bar', '814 S Oak Park Ave, Oak Park, IL 60304', 0, NULL, 'active', 2, 1, 0, '2025-12-13 21:43:54', '2025-12-13 22:10:21', NULL, NULL),
(39, 'Smoque BBQ', '3800 N Pulaski Rd, Chicago, IL 60641', 0, 'https://smoquebbq.com/locations/smoque/#menu', 'visited', 2, 1, 7.625, '2025-12-13 21:44:25', '2026-01-03 23:43:39', '2026-01-03 00:00:00', NULL),
(40, 'Subway', '8345 W North Ave Store 1-7A, Melrose Park, IL 60160', 1, NULL, 'active', 4, 1, 0, '2025-12-13 21:44:55', '2025-12-13 22:10:23', NULL, NULL),
(41, 'sweetgreen', '1143 Lake St, Oak Park, IL 60301', 0, NULL, 'active', 1, NULL, 0, '2025-12-13 21:45:22', '2025-12-13 22:10:24', NULL, NULL),
(42, 'Texas Roadhouse', '701 109th Pl, Crown Point, IN 46307', 0, NULL, 'active', 2, 1, 0, '2025-12-13 21:46:48', '2025-12-13 22:10:25', NULL, NULL),
(43, 'Victory Italian', '100 S Marion St, Oak Park, IL 60302', 0, NULL, 'active', 2, 1, 0, '2025-12-13 21:47:14', '2025-12-13 22:10:28', NULL, NULL),
(44, 'Wingstop', '1740 Harlem Ave, Elmwood Park, IL 60707', 1, NULL, 'active', 2, 1, 0, '2025-12-13 21:48:55', '2025-12-13 22:10:30', NULL, NULL),
(45, 'Katy''s Dumplings - Oak Park', '1113 Lake St, Oak Park, IL 60301', 0, NULL, 'active', 3, 1, 0, '2025-12-13 22:12:58', '2025-12-13 22:20:59', NULL, NULL),
(46, 'Yum Thai', '7330 Madison St, Forest Park, IL 60130', 0, NULL, 'active', 3, 1, 0, '2025-12-13 22:13:48', '2025-12-13 22:21:06', NULL, NULL),
(47, 'Sepia', '123 N Jefferson St, Chicago, IL 60661', 0, NULL, 'active', 1, NULL, 0, '2025-12-13 22:15:05', '2025-12-13 22:21:05', NULL, NULL),
(48, 'Haidilao HotPot Chicago Inc', '107 E Cermak Rd, Chicago, IL 60616', 0, NULL, 'active', 1, NULL, 0, '2025-12-13 22:16:22', '2025-12-13 22:20:39', NULL, NULL),
(49, 'Oliver''s', '1639 S Wabash Ave, Chicago, IL 60616', 0, NULL, 'active', 2, NULL, 0, '2025-12-13 22:19:28', '2025-12-13 22:36:11', NULL, NULL),
(50, 'Boston Fish Market Inc', '1225 Forest Ave, Des Plaines, IL 60018', 0, NULL, 'active', 2, NULL, 0, '2025-12-13 22:20:21', '2025-12-13 22:23:23', NULL, NULL),
(51, 'HaiSous Vietnamese Kitchen', '1800 S Carpenter St, Chicago, IL 60608', 0, NULL, 'active', 2, NULL, 0, '2025-12-13 22:20:42', '2025-12-13 22:33:16', NULL, NULL),
(52, 'Honey Butter Fried Chicken', '3361 N Elston Ave, Chicago, IL 60618', 0, NULL, 'active', 4, 1, 0, '2025-12-13 22:24:38', '2025-12-13 22:25:28', NULL, NULL),
(53, 'Sanders BBQ Supply Co.', '1742 W 99th St, Chicago, IL 60643', 0, NULL, 'active', 2, NULL, 0, '2025-12-13 22:25:03', '2025-12-13 22:36:12', NULL, NULL),
(54, 'Dunkin''', '7660 Madison St, Forest Park, IL 60130', 1, NULL, 'active', 4, 1, 0, '2025-12-13 22:27:06', '2025-12-13 22:28:07', NULL, NULL),
(55, 'Portillo''s', '170 North Ave, Northlake, IL 60164', 0, NULL, 'active', 1, NULL, 0, '2025-12-13 22:27:54', '2025-12-13 22:28:12', NULL, NULL),
(56, 'Lao Der', '3922 N Elston Ave, Chicago, IL 60618', 0, NULL, 'active', 2, NULL, 0, '2025-12-13 22:29:24', '2025-12-13 22:33:17', NULL, NULL),
(57, 'Raising Cane''s Chicken Fingers', '300 W North Ave, Melrose Park, IL 60160', 1, NULL, 'visited', 4, 1, 6.45, '2025-12-14 00:21:33', '2025-12-14 01:29:32', '2025-12-14 01:29:32', NULL),
(58, 'Gordon Ramsay Burger - Chicago', '2 E Ontario St, Chicago, IL 60611', 0, NULL, 'active', 1, NULL, 0, '2025-12-14 00:23:37', '2025-12-14 00:24:13', NULL, NULL),
(59, 'Citrine Café', '100 S Oak Park Ave, Oak Park, IL 60302', 0, NULL, 'visited', 3, 1, 7.875, '2025-12-14 00:28:20', '2025-12-14 01:29:12', '2025-12-14 01:29:12', NULL),
(60, 'Ina Mae', '1415 N Wood St, Chicago, IL 60622', 0, NULL, 'visited', 1, 1, 8.35, '2025-12-14 01:21:12', '2025-12-14 01:28:31', '2025-12-14 01:28:31', NULL),
(61, 'Chick-fil-A', '2 Winston Plaza, Melrose Park, IL 60160', 1, NULL, 'visited', 4, 1, 7.475, '2025-12-14 01:22:24', '2025-12-14 01:29:22', '2025-12-14 01:29:22', NULL),
(62, 'Taverna on Division', '1707 Division St, Melrose Park, IL 60160', 0, NULL, 'visited', 2, 1, 5.25, '2025-12-14 01:23:38', '2025-12-14 01:29:41', '2025-12-14 01:29:41', NULL),
(63, 'Maria''s', '1905 N Harlem Ave, Chicago, IL 60707', 0, NULL, 'visited', 2, 1, 8.25, '2025-12-14 01:24:07', '2025-12-14 01:29:02', '2025-12-14 01:29:02', NULL),
(64, 'Crepas Culichi', '1101 Lake St, Oak Park, IL 60301', 0, NULL, 'visited', 2, 1, 4.025, '2025-12-14 01:24:33', '2025-12-14 01:30:55', '2025-12-14 01:30:55', NULL),
(65, 'Bayan Ko Diner', '1820 W Montrose Ave, Chicago, IL 60613', 0, NULL, 'visited', 2, 1, 8.425, '2025-12-14 01:25:03', '2025-12-14 01:28:24', '2025-12-14 01:28:24', NULL),
(66, 'Gyuro Ramen', '171 N Aberdeen St, Chicago, IL 60607', 0, NULL, 'visited', 1, NULL, 8.25, '2025-12-14 01:25:28', '2025-12-14 01:28:39', '2025-12-14 01:28:39', NULL),
(67, 'Wendy''s', '11 N Harlem Ave, Oak Park, IL 60302', 1, NULL, 'visited', 4, 1, 4.75, '2025-12-14 01:26:02', '2025-12-14 01:30:30', '2025-12-14 01:30:30', NULL),
(68, 'Bistro Monadnock', '325 S Federal St, Chicago, IL 60604', 0, NULL, 'visited', 1, NULL, 8.75, '2025-12-14 01:26:34', '2025-12-14 01:28:12', '2025-12-14 01:28:12', NULL),
(69, 'Akahoshi Ramen', '2340 N California Ave Suite B, Chicago, IL 60647', 0, NULL, 'visited', 1, NULL, 6, '2025-12-14 01:27:29', '2025-12-14 01:31:04', '2025-12-14 01:31:04', NULL);

-- ============================================================
-- VISITS MIGRATION
-- ============================================================

INSERT INTO visits (id, restaurant_id, user_id, attended, rating, created_at, updated_at) VALUES
(1, 1, 2, 1, 7, '2025-12-14 00:10:09', '2025-12-14 00:12:59'),
(2, 1, 3, 1, 8, '2025-12-14 00:10:09', '2025-12-14 00:12:58'),
(3, 1, 1, 1, 9, '2025-12-14 00:10:09', '2025-12-14 00:12:59'),
(4, 1, 4, 1, 10, '2025-12-14 00:10:09', '2025-12-14 00:12:58'),
(5, 69, 4, 1, 1, '2025-12-14 01:31:42', '2025-12-14 01:31:45'),
(6, 69, 3, 1, 7, '2025-12-14 01:31:42', '2025-12-14 01:31:45'),
(7, 69, 2, 1, 6, '2025-12-14 01:31:43', '2025-12-14 01:31:45'),
(8, 69, 1, 1, 10, '2025-12-14 01:31:43', '2025-12-14 01:31:45'),
(9, 68, 4, 1, 9, '2025-12-14 01:32:13', '2025-12-14 01:32:13'),
(10, 68, 3, 1, 8, '2025-12-14 01:32:13', '2025-12-14 01:32:13'),
(11, 68, 2, 1, 8, '2025-12-14 01:32:13', '2025-12-14 01:32:14'),
(12, 68, 1, 1, 10, '2025-12-14 01:32:13', '2025-12-14 01:32:14'),
(13, 66, 4, 1, 8, '2025-12-14 01:32:39', '2025-12-14 01:32:39'),
(14, 66, 3, 1, 9, '2025-12-14 01:32:39', '2025-12-14 01:32:39'),
(15, 66, 2, 1, 9, '2025-12-14 01:32:40', '2025-12-14 01:32:40'),
(16, 66, 1, 1, 7, '2025-12-14 01:32:40', '2025-12-14 01:32:40'),
(17, 65, 4, 1, 8, '2025-12-14 01:33:29', '2025-12-14 01:33:30'),
(18, 65, 3, 1, 8, '2025-12-14 01:33:29', '2025-12-14 01:33:30'),
(19, 65, 2, 1, 10, '2025-12-14 01:33:30', '2025-12-14 01:33:30'),
(20, 65, 1, 1, 7.7, '2025-12-14 01:33:30', '2025-12-14 01:33:30'),
(21, 64, 4, 1, 5, '2025-12-14 01:34:20', '2025-12-14 01:34:20'),
(22, 64, 3, 1, 5, '2025-12-14 01:34:20', '2025-12-14 01:34:20'),
(23, 64, 2, 1, 2, '2025-12-14 01:34:20', '2025-12-14 01:34:21'),
(24, 64, 1, 1, 4.1, '2025-12-14 01:34:20', '2025-12-14 01:34:21'),
(25, 63, 4, 1, 8, '2025-12-14 01:35:32', '2025-12-14 01:35:32'),
(26, 63, 3, 1, 8, '2025-12-14 01:35:32', '2025-12-14 01:35:32'),
(27, 63, 2, 1, 9, '2025-12-14 01:35:32', '2025-12-14 01:35:32'),
(28, 63, 1, 1, 8, '2025-12-14 01:35:32', '2025-12-14 01:35:33'),
(29, 62, 4, 1, 8, '2025-12-14 01:36:16', '2025-12-14 01:36:16'),
(30, 62, 3, 1, 2, '2025-12-14 01:36:16', '2025-12-14 01:36:16'),
(31, 62, 2, 1, 5, '2025-12-14 01:36:16', '2025-12-14 01:36:17'),
(32, 62, 1, 1, 6, '2025-12-14 01:36:16', '2025-12-14 01:36:17'),
(33, 61, 4, 1, 9, '2025-12-14 01:37:36', '2025-12-14 01:37:37'),
(34, 61, 3, 1, 7, '2025-12-14 01:37:36', '2025-12-14 01:37:37'),
(35, 61, 2, 1, 7, '2025-12-14 01:37:37', '2025-12-14 01:37:37'),
(36, 61, 1, 1, 6.9, '2025-12-14 01:37:37', '2025-12-14 01:37:37'),
(37, 60, 4, 1, 9, '2025-12-14 01:38:46', '2025-12-14 01:38:47'),
(38, 60, 3, 1, 9, '2025-12-14 01:38:46', '2025-12-14 01:38:47'),
(39, 60, 2, 1, 7, '2025-12-14 01:38:46', '2025-12-14 01:38:47'),
(40, 60, 1, 1, 8.4, '2025-12-14 01:38:47', '2025-12-14 01:38:47'),
(41, 59, 4, 1, 9, '2025-12-14 01:39:22', '2025-12-14 01:39:22'),
(42, 59, 3, 1, 7, '2025-12-14 01:39:22', '2025-12-14 01:39:22'),
(43, 59, 2, 1, 8, '2025-12-14 01:39:22', '2025-12-14 01:39:23'),
(44, 59, 1, 1, 7.5, '2025-12-14 01:39:22', '2025-12-14 01:39:23'),
(45, 57, 4, 1, 7, '2025-12-14 01:40:35', '2025-12-14 01:40:35'),
(46, 57, 3, 1, 7, '2025-12-14 01:40:35', '2025-12-14 01:40:35'),
(47, 57, 2, 1, 5, '2025-12-14 01:40:35', '2025-12-14 01:40:35'),
(48, 57, 1, 1, 6.8, '2025-12-14 01:40:35', '2025-12-14 01:40:35'),
(49, 67, 4, 1, 6, '2025-12-14 01:41:10', '2025-12-14 01:41:10'),
(50, 67, 3, 1, 4, '2025-12-14 01:41:10', '2025-12-14 01:41:10'),
(51, 67, 2, 1, 3, '2025-12-14 01:41:10', '2025-12-14 01:41:10'),
(52, 67, 1, 1, 6, '2025-12-14 01:41:10', '2025-12-14 01:41:11'),
(53, 13, 4, 1, 9, '2025-12-24 00:43:58', '2025-12-24 00:43:58'),
(54, 13, 3, 1, 9, '2025-12-24 00:43:58', '2025-12-24 00:43:58'),
(55, 13, 2, 1, 8, '2025-12-24 00:43:58', '2025-12-24 00:43:58'),
(56, 13, 1, 1, 9, '2025-12-24 00:43:58', '2025-12-24 00:43:58'),
(57, 39, 4, 1, 6, '2026-01-03 23:41:49', '2026-01-03 23:41:49'),
(58, 39, 3, 1, 6.5, '2026-01-03 23:41:49', '2026-01-03 23:41:49'),
(59, 39, 2, 1, 10, '2026-01-03 23:41:49', '2026-01-03 23:41:50'),
(60, 39, 1, 1, 8, '2026-01-03 23:41:49', '2026-01-03 23:41:50');

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
-- Summary:
-- - 4 users migrated
-- - 69 restaurants migrated
-- - 60 visits migrated
-- - 0 legacy photos (v1 had no photo_link values set)
--
-- Note: Sessions not migrated (users will need to log in again with S-Auth)
--
-- Next steps:
-- 1. Verify counts: SELECT COUNT(*) FROM users; restaurants; visits;
-- 2. First admin should log in via S-Auth to complete OAuth setup
-- 3. Admin can then whitelist additional users for OAuth login
