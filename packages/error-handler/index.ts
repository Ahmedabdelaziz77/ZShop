export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: Boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this);
  }
}

// Not found error
export class NotFoundError extends AppError {
  constructor(message = "Resources not found.") {
    super(message, 404);
  }
}

// Validation error
export class ValidationError extends AppError {
  constructor(message = "Invalid Request Data.", details?: any) {
    super(message, 400, true, details);
  }
}

// Auth error
export class AuthError extends AppError {
  constructor(message = "Unauthorized.") {
    super(message, 401);
  }
}

// Forbidden error for permissions
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden access.") {
    super(message, 403);
  }
}

// Database error
export class DatabaseError extends AppError {
  constructor(message = "Database error.", details?: any) {
    super(message, 500, true, details);
  }
}

// Rate limit error
export class RateLimitError extends AppError {
  constructor(message = "Too many requests, please try again later.") {
    super(message, 429);
  }
}
