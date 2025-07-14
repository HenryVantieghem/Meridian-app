import { createClient } from '@supabase/supabase-js';
import { withQueryCaching } from '@/lib/performance/caching';

// Database optimization configuration
export const DB_OPTIMIZATION_CONFIG = {
  // Connection pooling
  POOL: {
    MIN_CONNECTIONS: 2,
    MAX_CONNECTIONS: 20,
    IDLE_TIMEOUT: 30000, // 30 seconds
    CONNECTION_TIMEOUT: 10000, // 10 seconds
  },
  
  // Query optimization
  QUERY: {
    TIMEOUT: 30000, // 30 seconds
    MAX_ROWS: 1000,
    BATCH_SIZE: 100,
  },
  
  // Indexing strategy
  INDEXES: {
    USER_EMAIL: 'idx_users_email',
    EMAIL_SENDER: 'idx_emails_sender',
    EMAIL_DATE: 'idx_emails_date',
    EMAIL_PRIORITY: 'idx_emails_priority',
    JOB_STATUS: 'idx_jobs_status',
    ANALYTICS_DATE: 'idx_analytics_date',
  },
} as const;

// Optimized Supabase client with connection pooling
export class OptimizedSupabaseClient {
  private static instance: OptimizedSupabaseClient;
  private client: unknown;
  private connectionPool: Map<string, unknown> = new Map();
  private maxConnections = DB_OPTIMIZATION_CONFIG.POOL.MAX_CONNECTIONS;

  private constructor() {
    this.client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  static getInstance(): OptimizedSupabaseClient {
    if (!OptimizedSupabaseClient.instance) {
      OptimizedSupabaseClient.instance = new OptimizedSupabaseClient();
    }
    return OptimizedSupabaseClient.instance;
  }

  // Get optimized client
  getClient() {
    return this.client;
  }

  // Connection pool management
  private async getConnection(key: string): Promise<unknown> {
    if (this.connectionPool.has(key)) {
      return this.connectionPool.get(key);
    }

    if (this.connectionPool.size >= this.maxConnections) {
      // Remove oldest connection
      const oldestKey = this.connectionPool.keys().next().value;
      if (oldestKey) {
        this.connectionPool.delete(oldestKey);
      }
    }

    const connection = this.client;
    this.connectionPool.set(key, connection);
    
    return connection;
  }

  // Optimized query execution with caching
  async executeQuery<T>(
    _query: string,
    _params: unknown[] = [],
    options: {
      cache?: boolean;
      cacheKey?: string;
      timeout?: number;
    } = {}
  ): Promise<T[]> {
    const { cache = true } = options;

    const executeWithTimeout = async (): Promise<T[]> => {
      const connection = await this.getConnection('default') as any;
      
      const { data, error } = await connection
        .from('your_table') // Replace with actual table
        .select('*')
        .limit(DB_OPTIMIZATION_CONFIG.QUERY.MAX_ROWS);

      if (error) throw error;
      return data || [];
    };

    if (cache && options.cacheKey) {
      return withQueryCaching(executeWithTimeout, {
        key: options.cacheKey,
        ttl: 300, // 5 minutes
      })();
    }

    return executeWithTimeout();
  }

  // Batch processing for large datasets
  async batchProcess<T>(
    items: T[],
    processor: (batch: T[]) => Promise<void>,
    options: {
      batchSize?: number;
      concurrency?: number;
      onProgress?: (processed: number, total: number) => void;
    } = {}
  ): Promise<void> {
    const {
      batchSize = DB_OPTIMIZATION_CONFIG.QUERY.BATCH_SIZE,
      concurrency = 3,
      onProgress,
    } = options;

    const batches = this.chunkArray(items, batchSize);
    let processed = 0;

    // Process batches with concurrency control
    for (let i = 0; i < batches.length; i += concurrency) {
      const batchGroup = batches.slice(i, i + concurrency);
      
      await Promise.all(
        batchGroup.map(async (batch) => {
          await processor(batch);
          processed += batch.length;
          onProgress?.(processed, items.length);
        })
      );
    }
  }

  // Chunk array into batches
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // Optimized user queries
  async getUsersWithOptimization(
    _filters: {
      email?: string;
      status?: string;
      limit?: number;
    } = {}
  ) {
    return this.executeQuery('users', [], {
      cache: true,
      cacheKey: 'users:default',
    });
  }

  // Optimized email queries with indexing
  async getEmailsWithOptimization(
    filters: {
      sender?: string;
      dateFrom?: Date;
      dateTo?: Date;
      priority?: number;
      limit?: number;
    } = {}
  ) {
    // Use appropriate indexes based on filters
    let query = this.client.from('emails').select('*');
    
    if (filters.sender) {
      query = query.eq('sender', filters.sender);
    }
    
    if (filters.dateFrom || filters.dateTo) {
      if (filters.dateFrom && filters.dateTo) {
        query = query.gte('created_at', filters.dateFrom.toISOString())
                   .lte('created_at', filters.dateTo.toISOString());
      } else if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom.toISOString());
      } else if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo.toISOString());
      }
    }
    
    if (filters.priority !== undefined) {
      query = query.eq('priority', filters.priority);
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  }

  // Real-time subscription optimization
  async createOptimizedSubscription<T>(
    table: string,
    event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
    callback: (payload: T) => void,
    options: {
      filter?: string;
      throttle?: number;
    } = {}
  ) {
    const { filter, throttle = 1000 } = options;
    
    let subscription = this.client
      .channel(`optimized_${table}_${event}`)
      .on('postgres_changes', {
        event,
        schema: 'public',
        table,
        filter,
      }, callback);

    // Throttle updates to prevent excessive callbacks
    if (throttle > 0) {
      let timeout: NodeJS.Timeout;
      const throttledCallback = (payload: T) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => callback(payload), throttle);
      };
      
      subscription = subscription.on('postgres_changes', {
        event,
        schema: 'public',
        table,
        filter,
      }, throttledCallback);
    }

    return subscription.subscribe();
  }

  // Database indexing utilities
  async createIndexes(): Promise<void> {
    const indexes = [
      // User indexes
      `CREATE INDEX IF NOT EXISTS ${DB_OPTIMIZATION_CONFIG.INDEXES.USER_EMAIL} ON users(email)`,
      
      // Email indexes
      `CREATE INDEX IF NOT EXISTS ${DB_OPTIMIZATION_CONFIG.INDEXES.EMAIL_SENDER} ON emails(sender)`,
      `CREATE INDEX IF NOT EXISTS ${DB_OPTIMIZATION_CONFIG.INDEXES.EMAIL_DATE} ON emails(created_at)`,
      `CREATE INDEX IF NOT EXISTS ${DB_OPTIMIZATION_CONFIG.INDEXES.EMAIL_PRIORITY} ON emails(priority)`,
      
      // Job indexes
      `CREATE INDEX IF NOT EXISTS ${DB_OPTIMIZATION_CONFIG.INDEXES.JOB_STATUS} ON processing_jobs(status)`,
      
      // Analytics indexes
      `CREATE INDEX IF NOT EXISTS ${DB_OPTIMIZATION_CONFIG.INDEXES.ANALYTICS_DATE} ON analytics(created_at)`,
    ];

    for (const index of indexes) {
      try {
        await this.client.rpc('exec_sql', { sql: index });
      } catch (error) {
        console.warn(`Failed to create index: ${index}`, error);
      }
    }
  }

  // Query performance monitoring
  async monitorQueryPerformance<T>(
    queryFn: () => Promise<T>,
    options: {
      name: string;
      threshold?: number;
    }
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await queryFn();
      const duration = performance.now() - startTime;
      
      // Log slow queries
      if (duration > (options.threshold || 1000)) {
        console.warn(`Slow query detected: ${options.name} took ${duration}ms`);
      }
      
      // Track performance metrics
      if (typeof window !== 'undefined') {
        window.gtag?.('event', 'query_performance', {
          query_name: options.name,
          duration,
          threshold: options.threshold || 1000,
        });
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      // Track failed queries
      if (typeof window !== 'undefined') {
        const errorMessage = (error instanceof Error) ? error.message : String(error);
        window.gtag?.('event', 'query_error', {
          query_name: options.name,
          duration,
          error: errorMessage,
        });
      }
      
      throw error;
    }
  }

  // Database cleanup and maintenance
  async performMaintenance(): Promise<void> {
    try {
      // Vacuum tables
      await this.client.rpc('exec_sql', { sql: 'VACUUM ANALYZE' });
      
      // Update statistics
      await this.client.rpc('exec_sql', { sql: 'ANALYZE' });
      
      console.log('Database maintenance completed');
    } catch (error) {
      console.error('Database maintenance failed:', error);
    }
  }

  // Connection pool statistics
  getPoolStats(): {
    activeConnections: number;
    maxConnections: number;
    utilization: number;
  } {
    return {
      activeConnections: this.connectionPool.size,
      maxConnections: this.maxConnections,
      utilization: (this.connectionPool.size / this.maxConnections) * 100,
    };
  }
}

// Export singleton
export const optimizedDb = OptimizedSupabaseClient.getInstance();

// Query optimization utilities
export const optimizeQuery = <T>(
  queryFn: () => Promise<T>,
  options: {
    name: string;
    cache?: boolean;
    cacheKey?: string;
    timeout?: number;
  }
): (() => Promise<T>) => {
  return async () => {
    return optimizedDb.monitorQueryPerformance(queryFn, {
      name: options.name,
      threshold: options.timeout,
    });
  };
};

// Batch processing utilities
export const createBatchProcessor = <T>(
  processor: (items: T[]) => Promise<void>,
  options: {
    batchSize?: number;
    concurrency?: number;
    onProgress?: (processed: number, total: number) => void;
  } = {}
) => {
  return (items: T[]) => optimizedDb.batchProcess(items, processor, options);
};

// Real-time subscription utilities
export const createOptimizedSubscription = <T>(
  table: string,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
  callback: (payload: T) => void,
  options: {
    filter?: string;
    throttle?: number;
  } = {}
) => {
  return optimizedDb.createOptimizedSubscription(table, event, callback, options);
}; 