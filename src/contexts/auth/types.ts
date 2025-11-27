export type UserRole = "admin" | "manager" | "stylist" | "client";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole; // TypeScript confiará en que SIEMPRE será uno de estos 4
  cedula?: string;
  gender?: string;
  emailVerified?: boolean;
  provider?: "local" | "google";
  isActive?: boolean;
}

export interface AuthSessionData {
  accessToken: string;
  refreshToken: string;
  user: any; // Datos crudos de la API
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;

  login: (email: string, password: string) => Promise<void>;
  googleSignIn: (idToken: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (data: Partial<User> & { password: string }) => Promise<boolean>;

  sendVerificationEmail: (email: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<boolean>;

  refreshSession: () => Promise<boolean>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
}