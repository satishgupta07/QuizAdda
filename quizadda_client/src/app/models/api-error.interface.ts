/** Shape of every error response returned by the backend's GlobalExceptionHandler. */
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  violations?: Array<{ field: string; message: string }>;
}
