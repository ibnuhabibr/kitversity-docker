// Konfigurasi Database yang Kompatibel dengan Kode Existing
import mysql from 'mysql2/promise';
import type { Pool, PoolConnection } from 'mysql2/promise';

class DatabaseManager {
  private static instance: DatabaseManager;
  private pool: Pool | null = null;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public async initialize(): Promise<void> {
    if (this.pool) return;

    try {
      console.log("🔄 Initializing database connection pool...");
      
      const config = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        waitForConnections: true,
        connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
        queueLimit: 0,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true,
        charset: 'utf8mb4',
        timezone: '+00:00',
        // Connection pool settings
        idleTimeout: 300000, // 5 minutes
        maxIdle: 5,
        // SSL settings for production
        ssl: process.env.NODE_ENV === 'production' ? {
          rejectUnauthorized: false
        } : false
      };

      this.pool = mysql.createPool(config);
      
      // Test connection
      await this.testConnection();
      this.isConnected = true;
      
      console.log("✅ Database connection pool initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize database connection pool", error);
      throw error;
    }
  }

  public getPool(): Pool {
    if (!this.pool) {
      // Auto-initialize jika belum diinisialisasi (untuk backward compatibility)
      this.createPoolSync();
    }
    return this.pool!;
  }

  private createPoolSync(): void {
    if (this.pool) return;

    try {
      console.log("🔄 Creating database connection pool (sync)...");
      
      const config = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        waitForConnections: true,
        connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
        queueLimit: 0,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true,
        charset: 'utf8mb4',
        timezone: '+00:00'
      };

      this.pool = mysql.createPool(config);
      console.log("✅ Database connection pool created successfully");
    } catch (error) {
      console.error("❌ Failed to create database connection pool", error);
      throw error;
    }
  }

  public async getConnection(): Promise<PoolConnection> {
    const pool = this.getPool();
    return await pool.getConnection();
  }

  public async testConnection(): Promise<boolean> {
    try {
      const connection = await this.getConnection();
      await connection.ping();
      connection.release();
      console.log("✅ Database connection test successful");
      return true;
    } catch (error) {
      console.error("❌ Database connection test failed", error);
      return false;
    }
  }

  public async executeQuery<T = any>(
    query: string, 
    params: any[] = [], 
    requestId?: string
  ): Promise<T> {
    const startTime = Date.now();
    let connection: PoolConnection | null = null;

    try {
      connection = await this.getConnection();
      const [results] = await connection.execute(query, params);
      
      const duration = Date.now() - startTime;
      console.log(`DB Query executed (${duration}ms)`, { query: query.substring(0, 100), duration });
      
      return results as T;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error("Database query failed", {
        query: query.substring(0, 100),
        params,
        duration,
        error: error.message
      });
      throw error;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  public async transaction<T>(
    callback: (connection: PoolConnection) => Promise<T>,
    requestId?: string
  ): Promise<T> {
    const connection = await this.getConnection();
    
    try {
      await connection.beginTransaction();
      console.log("Transaction started");
      
      const result = await callback(connection);
      
      await connection.commit();
      console.log("Transaction committed");
      
      return result;
    } catch (error) {
      await connection.rollback();
      console.error("Transaction rolled back", { error: error.message });
      throw error;
    } finally {
      connection.release();
    }
  }

  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.isConnected = false;
      console.log("Database connection pool closed");
    }
  }

  public isHealthy(): boolean {
    return this.isConnected && this.pool !== null;
  }
}

// Export singleton instance
export const dbManager = DatabaseManager.getInstance();

// Legacy export untuk kompatibilitas dengan kode existing
export default dbManager.getPool();
export { dbManager as dbConnection };