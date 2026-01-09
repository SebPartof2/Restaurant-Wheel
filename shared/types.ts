// Shared TypeScript types between frontend and backend

export type RestaurantState = 'pending' | 'active' | 'upcoming' | 'visited';

export interface User {
  id?: number;
  email: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  oauth_provider?: string;
  oauth_subject?: string;
  access_level?: string;
  is_admin: boolean;
  is_whitelisted: boolean;
  is_provisional: boolean;
  signup_code?: string;
  last_login?: string;
  created_at?: string;
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

export interface OAuth2LoginResponse {
  authorization_url: string;
  state: string;
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

// Photo types
export interface RestaurantPhoto {
  id: number;
  restaurant_id: number;
  filename: string;
  original_url: string;
  thumbnail_url: string | null;
  mime_type: string;
  file_size: number;
  width: number | null;
  height: number | null;
  uploaded_by_user_id: number;
  is_primary: boolean;
  display_order: number;
  caption: string | null;
  created_at: string;
  uploaded_by?: User; // Optional populated field
}

// Alias for compatibility
export type Photo = RestaurantPhoto;

// Spin wheel result type
export type SpinResult = SpinWheelResponse;

// Generic paginated response
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}
