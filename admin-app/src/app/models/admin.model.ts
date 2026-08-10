export interface Admin {
  id: number;
  name: string;
  email: string;
  is_active?: boolean;
  status?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  admin: Admin;
}

export interface AdminResponse {
  success: boolean;
  admin: Admin;
}
