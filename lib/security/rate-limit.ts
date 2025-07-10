// Rate limiting untuk API endpoints
import { NextRequest } from 'next/server';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(config: RateLimitConfig) {
  return function(request: NextRequest): { success: boolean; limit: number; remaining: number; reset: Date } {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const key = `${ip}:${request.nextUrl.pathname}`;
    const now = Date.now();
    
    const record = rateLimitStore.get(key);
    
    if (!record || now > record.resetTime) {
      // Reset atau buat record baru
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      
      return {
        success: true,
        limit: config.maxRequests,
        remaining: config.maxRequests - 1,
        reset: new Date(now + config.windowMs)
      };
    }
    
    if (record.count >= config.maxRequests) {
      return {
        success: false,
        limit: config.maxRequests,
        remaining: 0,
        reset: new Date(record.resetTime)
      };
    }
    
    record.count++;
    
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - record.count,
      reset: new Date(record.resetTime)
    };
  };
}

// Predefined rate limits
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  maxRequests: 100
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  maxRequests: 5 // Lebih ketat untuk auth
});