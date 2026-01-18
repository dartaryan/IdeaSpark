// Shared service layer types

/**
 * Standard error type for service responses
 */
export interface AppError {
  message: string;
  code: string;
}

/**
 * Standard response type for all service methods
 * Provides consistent error handling across the application
 */
export type ServiceResponse<T> = {
  data: T | null;
  error: AppError | null;
};
