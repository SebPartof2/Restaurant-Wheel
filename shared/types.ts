// Shared TypeScript types between frontend and backend

export type RestaurantState = 'pending' | 'active' | 'upcoming' | 'visited';

export interface User {
  id: number;
  email: string;
  name?: string;
  is_admin: boolean;
  is_whitelisted: boolean;
  is_provisional: boolean;
  signup_code?: string;
  created_at: string;
}

export interface Restaurant {
  id: number;
  name: string;
  address: string;
  is_fast_food: boolean;
  menu_link: string | null;
  photo_link: string | null;
  state: RestaurantState;
  nominated_by_user_id: number;
  created_by_admin_id: number | null;
  average_rating: number;
  created_at: string;
  updated_at: string;
  visited_at: string | null;
  reservation_datetime: string | null;
  nominated_by?: User; // Optional populated field
}

export interface Visit {
  id: number;
  restaurant_id: number;
  user_id: number;
  attended: boolean;
  rating: number | null;
  created_at: string;
  updated_at: string;
  user?: User; // Optional populated field
}

export interface Session {
  id: string;
  user_id: number;
  expires_at: string;
}

// API Request/Response types

export interface SignupRequest {
  signup_code: string;
  email: string;
  password: string;
  name?: string;
}

export interface VerifyCodeRequest {
  signup_code: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  session_id: string;
}

export interface CreateRestaurantRequest {
  name: string;
  address: string;
  is_fast_food: boolean;
  menu_link?: string;
  photo_link?: string;
  nominated_by_user_id?: number; // For admin creating on behalf of user
}

export interface UpdateRestaurantRequest {
  name?: string;
  address?: string;
  is_fast_food?: boolean;
  menu_link?: string;
  photo_link?: string;
  state?: RestaurantState;
  visited_at?: string;
  reservation_datetime?: string;
}

export interface SpinWheelRequest {
  exclude_fast_food: boolean;
}

export interface SpinWheelResponse {
  restaurant: Restaurant;
}

export interface MarkAttendanceRequest {
  user_ids: number[];
}

export interface SubmitRatingRequest {
  user_id: number;
  rating: number;
}

export interface AddToWhitelistRequest {
  email: string;
}

export interface CreateProvisionalUserRequest {
  email: string;
  name?: string;
}

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
