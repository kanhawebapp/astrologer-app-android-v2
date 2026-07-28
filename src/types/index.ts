export interface Astrologer {
  id: string;
  contactNo: string;
  name?: string;
  email?: string;
  avatar?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RequestOtpResponse {
  message: string;
}

// export interface VerifyOtpResponse {
//   accessToken: string;
//   astrologer: Astrologer;
// }

export interface VerifyOtpResponse {
  accessToken: string;
  refreshToken: string;
  astrologer: {
    id: string;
    contactNo: string;
  };
}

export interface AuthState {
  user: Astrologer | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
  statusCode: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
};

export type BottomTabParamList = {
  HomeTab: undefined;
  ProfileTab: undefined;
  SettingsTab: undefined;
};
