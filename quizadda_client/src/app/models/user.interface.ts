/**
 * Safe user view returned by the backend (mirrors `UserResponse.java`).
 * Notably has no `password` field — passwords never travel back to the client.
 */
export interface UserResponse {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profile: string;
  enabled: boolean;
  authorities: string[];
}

/** Registration payload sent to `POST /api/v1/users`. */
export interface RegisterUserRequest {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

/** Payload for `PUT /api/v1/auth/me`. */
export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

/** Payload for `POST /api/v1/auth/me/password`. */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
