import { UserResponse } from './user.interface';

/** Payload for `POST /api/v1/auth/login`. */
export interface LoginRequest {
  username: string;
  password: string;
}

/** Response from `POST /api/v1/auth/login` — single roundtrip yields both token and user. */
export interface LoginResponse {
  token: string;
  user: UserResponse;
}

export type Role = 'USER' | 'ADMIN';

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
