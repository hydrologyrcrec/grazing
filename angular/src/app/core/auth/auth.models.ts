export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}
export interface AuthResponse {
  user: AuthUser;
}
export interface LoginRequest {
  email: string;
  password: string;
}
export interface SignupRequest extends LoginRequest {
  firstName?: string;
  lastName?: string;
}
