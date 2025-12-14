// Statistics service - aggregates existing data

import type { DatabaseService } from './db';

export interface Statistics {
  // Restaurant stats
  totalRestaurants: number;
  pendingRestaurants: number;
  activeRestaurants: number;
  upcomingRestaurants: number;
  visitedRestaurants: number;
  fastFoodCount: number;
  nonFastFoodCount: number;

  // Rating stats
  overallAverageRating: number;
  totalRatingsGiven: number;
  ratedRestaurantCount: number;
  unratedRestaurantCount: number;

  // User stats
  totalUsers: number;
  adminCount: number;
  provisionalCount: number;

  // Top lists
  topRatedRestaurants: Array<{
    id: number;
    name: string;
    average_rating: number;
    rating_count: number;
  }>;

  mostActiveNominators: Array<{
    id: number;
    name: string | null;
    email: string;
    nomination_count: number;
  }>;

  mostActiveRaters: Array<{
    id: number;
    name: string | null;
    email: string;
    rating_count: number;
  }>;

  // Full leaderboard (all rated restaurants)
  restaurantLeaderboard: Array<{
    id: number;
    name: string;
    average_rating: number;
    rating_count: number;
    state: string;
  }>;

  // User rating averages
  userRatingAverages: Array<{
    id: number;
    name: string | null;
    email: string;
    average_rating: number;
    rating_count: number;
  }>;

  // Average rating of nominated restaurants per user (visited only)
  nominatorRestaurantAverages: Array<{
    id: number;
    name: string | null;
    email: string;
    average_rating: number;
    nominated_count: number;
    visited_nominated_count: number;
  }>;
}

export class StatisticsService {
  constructor(private db: DatabaseService) {}

  async getStatistics(): Promise<Statistics> {
    // Restaurant counts by state
    const restaurantStats = await this.db.queryOne<{
      total: number;
      pending: number;
      active: number;
      upcoming: number;
      visited: number;
      fast_food: number;
    }>(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN state = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN state = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN state = 'upcoming' THEN 1 ELSE 0 END) as upcoming,
        SUM(CASE WHEN state = 'visited' THEN 1 ELSE 0 END) as visited,
        SUM(CASE WHEN is_fast_food = 1 THEN 1 ELSE 0 END) as fast_food
      FROM restaurants
    `);

    // Rating stats
    const ratingStats = await this.db.queryOne<{
      total_ratings: number;
      average_rating: number;
      rated_count: number;
    }>(`
      SELECT
        COUNT(*) as total_ratings,
        AVG(rating) as average_rating,
        COUNT(DISTINCT restaurant_id) as rated_count
      FROM visits
      WHERE rating IS NOT NULL
    `);

    // User stats
    const userStats = await this.db.queryOne<{
      total: number;
      admins: number;
      provisional: number;
    }>(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_admin = 1 THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN is_provisional = 1 THEN 1 ELSE 0 END) as provisional
      FROM users
    `);

    // Top rated restaurants (with at least 1 rating)
    const topRated = await this.db.execute<{
      id: number;
      name: string;
      average_rating: number;
      rating_count: number;
    }>(`
      SELECT
        r.id,
        r.name,
        AVG(v.rating) as average_rating,
        COUNT(v.rating) as rating_count
      FROM restaurants r
      INNER JOIN visits v ON r.id = v.restaurant_id
      WHERE v.rating IS NOT NULL
      GROUP BY r.id, r.name
      ORDER BY average_rating DESC
      LIMIT 10
    `);

    // Most active nominators
    const topNominators = await this.db.execute<{
      id: number;
      name: string | null;
      email: string;
      nomination_count: number;
    }>(`
      SELECT
        u.id,
        u.name,
        u.email,
        COUNT(r.id) as nomination_count
      FROM users u
      INNER JOIN restaurants r ON u.id = r.nominated_by_user_id
      GROUP BY u.id, u.name, u.email
      ORDER BY nomination_count DESC
      LIMIT 10
    `);

    // Most active raters
    const topRaters = await this.db.execute<{
      id: number;
      name: string | null;
      email: string;
      rating_count: number;
    }>(`
      SELECT
        u.id,
        u.name,
        u.email,
        COUNT(v.rating) as rating_count
      FROM users u
      INNER JOIN visits v ON u.id = v.user_id
      WHERE v.rating IS NOT NULL
      GROUP BY u.id, u.name, u.email
      ORDER BY rating_count DESC
      LIMIT 10
    `);

    // Full restaurant leaderboard (all rated restaurants)
    const restaurantLeaderboard = await this.db.execute<{
      id: number;
      name: string;
      average_rating: number;
      rating_count: number;
      state: string;
    }>(`
      SELECT
        r.id,
        r.name,
        AVG(v.rating) as average_rating,
        COUNT(v.rating) as rating_count,
        r.state
      FROM restaurants r
      INNER JOIN visits v ON r.id = v.restaurant_id
      WHERE v.rating IS NOT NULL
      GROUP BY r.id, r.name, r.state
      ORDER BY average_rating DESC, rating_count DESC
    `);

    // User rating averages (how users rate on average)
    const userRatingAverages = await this.db.execute<{
      id: number;
      name: string | null;
      email: string;
      average_rating: number;
      rating_count: number;
    }>(`
      SELECT
        u.id,
        u.name,
        u.email,
        AVG(v.rating) as average_rating,
        COUNT(v.rating) as rating_count
      FROM users u
      INNER JOIN visits v ON u.id = v.user_id
      WHERE v.rating IS NOT NULL
      GROUP BY u.id, u.name, u.email
      ORDER BY average_rating DESC, rating_count DESC
    `);

    // Average rating of nominated restaurants per user (visited only)
    const nominatorRestaurantAverages = await this.db.execute<{
      id: number;
      name: string | null;
      email: string;
      average_rating: number;
      nominated_count: number;
      visited_nominated_count: number;
    }>(`
      SELECT
        u.id,
        u.name,
        u.email,
        AVG(restaurant_ratings.average_rating) as average_rating,
        COUNT(DISTINCT r.id) as nominated_count,
        COUNT(DISTINCT restaurant_ratings.restaurant_id) as visited_nominated_count
      FROM users u
      INNER JOIN restaurants r ON u.id = r.nominated_by_user_id
      LEFT JOIN (
        SELECT
          v.restaurant_id,
          AVG(v.rating) as average_rating
        FROM visits v
        WHERE v.rating IS NOT NULL
        GROUP BY v.restaurant_id
      ) restaurant_ratings ON r.id = restaurant_ratings.restaurant_id AND r.state = 'visited'
      GROUP BY u.id, u.name, u.email
      HAVING visited_nominated_count > 0
      ORDER BY average_rating DESC
    `);

    return {
      // Restaurant stats
      totalRestaurants: restaurantStats?.total || 0,
      pendingRestaurants: restaurantStats?.pending || 0,
      activeRestaurants: restaurantStats?.active || 0,
      upcomingRestaurants: restaurantStats?.upcoming || 0,
      visitedRestaurants: restaurantStats?.visited || 0,
      fastFoodCount: restaurantStats?.fast_food || 0,
      nonFastFoodCount: (restaurantStats?.total || 0) - (restaurantStats?.fast_food || 0),

      // Rating stats
      overallAverageRating: ratingStats?.average_rating || 0,
      totalRatingsGiven: ratingStats?.total_ratings || 0,
      ratedRestaurantCount: ratingStats?.rated_count || 0,
      unratedRestaurantCount: (restaurantStats?.visited || 0) - (ratingStats?.rated_count || 0),

      // User stats
      totalUsers: userStats?.total || 0,
      adminCount: userStats?.admins || 0,
      provisionalCount: userStats?.provisional || 0,

      // Top lists
      topRatedRestaurants: topRated,
      mostActiveNominators: topNominators,
      mostActiveRaters: topRaters,

      // Extended lists
      restaurantLeaderboard,
      userRatingAverages,
      nominatorRestaurantAverages,
    };
  }
}
