// Performance monitoring dan metrics
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: Date;
  tags?: Record<string, string>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private timers: Map<string, number> = new Map();

  startTimer(name: string): void {
    this.timers.set(name, Date.now());
  }

  endTimer(name: string, tags?: Record<string, string>): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      throw new Error(`Timer ${name} not found`);
    }

    const duration = Date.now() - startTime;
    this.timers.delete(name);

    this.recordMetric({
      name,
      value: duration,
      timestamp: new Date(),
      tags
    });

    return duration;
  }

  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only last 1000 metrics in memory
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name);
    }
    return this.metrics;
  }

  getAverageMetric(name: string, timeWindow?: number): number {
    let metrics = this.metrics.filter(m => m.name === name);
    
    if (timeWindow) {
      const cutoff = new Date(Date.now() - timeWindow);
      metrics = metrics.filter(m => m.timestamp > cutoff);
    }

    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }

  // Health check metrics
  getHealthMetrics() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentMetrics = this.metrics.filter(m => m.timestamp.getTime() > oneMinuteAgo);

    return {
      totalRequests: recentMetrics.filter(m => m.name.includes('api_request')).length,
      averageResponseTime: this.getAverageMetric('api_request_duration', 60000),
      errorRate: recentMetrics.filter(m => m.name.includes('error')).length / Math.max(recentMetrics.length, 1),
      dbConnectionTime: this.getAverageMetric('db_connection_time', 60000)
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Middleware untuk monitoring API performance
export function withPerformanceMonitoring(handler: Function) {
  return async function(request: any, ...args: any[]) {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();
    
    performanceMonitor.startTimer(`api_request_${requestId}`);
    
    try {
      const result = await handler(request, ...args);
      
      const duration = performanceMonitor.endTimer(`api_request_${requestId}`, {
        method: request.method,
        url: request.url,
        status: 'success'
      });

      logger.apiRequest(request.method, request.url, 200, duration, requestId);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      performanceMonitor.recordMetric({
        name: 'api_request_error',
        value: duration,
        timestamp: new Date(),
        tags: {
          method: request.method,
          url: request.url,
          error: error.message
        }
      });

      throw error;
    }
  };
}