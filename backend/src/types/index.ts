// Backend-specific types

export interface Env {
  DB: D1Database;
  ENVIRONMENT: string;
  FRONTEND_URL: string;
}

export interface RequestContext {
  user?: {
    id: number;
    email: string;
    is_admin: boolean;
    is_whitelisted: boolean;
  };
  session_id?: string;
}
