// Database service wrapper for D1

import type { Env } from '../types';

export class DatabaseService {
  constructor(private db: D1Database) {}

  /**
   * Execute a query with parameters
   */
  async execute<T = any>(query: string, params: any[] = []): Promise<T[]> {
    const result = await this.db.prepare(query).bind(...params).all();
    return result.results as T[];
  }

  /**
   * Execute a query and return first row
   */
  async queryOne<T = any>(query: string, params: any[] = []): Promise<T | null> {
    const result = await this.db.prepare(query).bind(...params).first();
    return result as T | null;
  }

  /**
   * Execute an insert and return the inserted ID
   */
  async insert(query: string, params: any[] = []): Promise<number> {
    const result = await this.db.prepare(query).bind(...params).run();
    return result.meta.last_row_id;
  }

  /**
   * Execute an update/delete and return affected rows
   */
  async run(query: string, params: any[] = []): Promise<number> {
    const result = await this.db.prepare(query).bind(...params).run();
    return result.meta.changes;
  }
}

export function createDbService(env: Env): DatabaseService {
  return new DatabaseService(env.DB);
}
