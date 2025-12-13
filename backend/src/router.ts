// Main router configuration

import { Hono } from 'hono';
import type { Env, RequestContext } from './types';
import { corsMiddleware } from './middleware/cors';
import { authMiddleware, requireAuth } from './middleware/auth';
import { requireAdmin } from './middleware/admin';

// Auth handlers
import { handleSignup, handleLogin, handleLogout, handleGetMe, handleVerifyCode } from './handlers/auth';

// Restaurant handlers
import {
  handleGetRestaurants,
  handleGetRestaurant,
  handleCreateRestaurant,
  handleUpdateRestaurant,
  handleDeleteRestaurant,
  handleApproveRestaurant,
  handleRejectRestaurant,
  handleMarkVisited,
  handleConfirmUpcoming,
  handleGetOverallStats,
} from './handlers/restaurants';

// Wheel handlers
import { handleGetActiveRestaurants, handleSpinWheel } from './handlers/wheel';

// Visits handlers
import { handleGetVisits, handleMarkAttendance, handleSubmitRating } from './handlers/visits';

// Admin handlers
import { handleGetUsers, handleUpdateUser, handleAddToWhitelist, handleGetPendingNominations, handleCreateProvisionalUser } from './handlers/admin';

export function createRouter() {
  const app = new Hono<{ Bindings: Env; Variables: RequestContext }>();

  // Apply CORS middleware to all routes
  app.use('*', corsMiddleware);

  // Apply auth middleware to all routes (checks for session but doesn't require it)
  app.use('*', authMiddleware);

  // Health check
  app.get('/', (c) => c.json({ status: 'ok', service: 'restaurant-wheel-api' }));

  // ======================
  // Auth routes
  // ======================
  const auth = new Hono<{ Bindings: Env; Variables: RequestContext }>();

  auth.post('/verify-code', handleVerifyCode);
  auth.post('/signup', handleSignup);
  auth.post('/login', handleLogin);
  auth.post('/logout', handleLogout);
  auth.get('/me', handleGetMe);

  app.route('/api/auth', auth);

  // ======================
  // Restaurant routes
  // ======================
  const restaurants = new Hono<{ Bindings: Env; Variables: RequestContext }>();

  restaurants.get('/', handleGetRestaurants);
  restaurants.get('/stats/overall', handleGetOverallStats);
  restaurants.get('/:id', handleGetRestaurant);
  restaurants.post('/', requireAuth, handleCreateRestaurant);
  restaurants.patch('/:id', requireAuth, requireAdmin, handleUpdateRestaurant);
  restaurants.delete('/:id', requireAuth, requireAdmin, handleDeleteRestaurant);
  restaurants.post('/:id/approve', requireAuth, requireAdmin, handleApproveRestaurant);
  restaurants.post('/:id/reject', requireAuth, requireAdmin, handleRejectRestaurant);
  restaurants.post('/:id/confirm-upcoming', requireAuth, requireAdmin, handleConfirmUpcoming);
  restaurants.post('/:id/mark-visited', requireAuth, requireAdmin, handleMarkVisited);

  app.route('/api/restaurants', restaurants);

  // ======================
  // Wheel routes
  // ======================
  const wheel = new Hono<{ Bindings: Env; Variables: RequestContext }>();

  wheel.get('/active', requireAuth, handleGetActiveRestaurants);
  wheel.post('/spin', requireAuth, requireAdmin, handleSpinWheel);

  app.route('/api/wheel', wheel);

  // ======================
  // Visits routes
  // ======================
  const visits = new Hono<{ Bindings: Env; Variables: RequestContext }>();

  visits.get('/:restaurantId', requireAuth, handleGetVisits);
  visits.post('/:restaurantId/attendance', requireAuth, requireAdmin, handleMarkAttendance);
  visits.post('/:restaurantId/rate', requireAuth, requireAdmin, handleSubmitRating);

  app.route('/api/visits', visits);

  // ======================
  // Admin routes
  // ======================
  const admin = new Hono<{ Bindings: Env; Variables: RequestContext }>();

  admin.get('/users', requireAuth, requireAdmin, handleGetUsers);
  admin.patch('/users/:id', requireAuth, requireAdmin, handleUpdateUser);
  admin.post('/users/whitelist', requireAuth, requireAdmin, handleAddToWhitelist);
  admin.post('/users/provisional', requireAuth, requireAdmin, handleCreateProvisionalUser);
  admin.get('/nominations/pending', requireAuth, requireAdmin, handleGetPendingNominations);

  app.route('/api/admin', admin);

  return app;
}
