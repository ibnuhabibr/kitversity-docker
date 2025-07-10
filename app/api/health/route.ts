// Comprehensive health check endpoint
import { NextRequest } from 'next/server';
import { dbManager } from '@/lib/db/config';
import { performanceMonitor } from '@/lib/monitoring/performance';
import { apiResponse, handleApiError } from '@/lib/api/error-handler';

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  
  try {
    const startTime = Date.now();
    
    // Database health check
    const dbHealthy = await dbManager.testConnection();
    const dbResponseTime = Date.now() - startTime;
    
    // Memory usage
    const memoryUsage = process.memoryUsage();
    
    // Performance metrics
    const healthMetrics = performanceMonitor.getHealthMetrics();
    
    // System uptime
    const uptime = process.uptime();
    
    const healthData = {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      uptime: Math.floor(uptime),
      database: {
        status: dbHealthy ? 'connected' : 'disconnected',
        responseTime: dbResponseTime
      },
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024)
      },
      performance: healthMetrics,
      checks: {
        database: dbHealthy,
        memory: memoryUsage.heapUsed < memoryUsage.heapTotal * 0.9
      }
    };

    const overallHealthy = Object.values(healthData.checks).every(check => check);
    
    return apiResponse(healthData, undefined, requestId);
    
  } catch (error) {
    return handleApiError(error, requestId);
  }
}