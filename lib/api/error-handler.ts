// Centralized error handling untuk API
import { NextResponse } from 'next/server';
import { logger } from '../logger';

export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export function handleApiError(error: any, requestId?: string): NextResponse {
  // Log error
  logger.error('API Error occurred', {
    message: error.message,
    stack: error.stack,
    statusCode: error.statusCode,
    code: error.code
  }, requestId);

  if (error instanceof ApiError) {
    return NextResponse.json({
      success: false,
      error: {
        message: error.message,
        code: error.code,
        details: error.details
      },
      requestId
    }, { status: error.statusCode });
  }

  // Database errors
  if (error.code === 'ER_DUP_ENTRY') {
    return NextResponse.json({
      success: false,
      error: {
        message: 'Data already exists',
        code: 'DUPLICATE_ENTRY'
      },
      requestId
    }, { status: 409 });
  }

  // Default error
  return NextResponse.json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message,
      code: 'INTERNAL_ERROR'
    },
    requestId
  }, { status: 500 });
}

// API Response wrapper
export function apiResponse<T>(data: T, message?: string, requestId?: string) {
  return NextResponse.json({
    success: true,
    data,
    message,
    requestId
  });
}