export interface AccountProfile {
  id: any;
  name: string;
  displayName?: string;
  email: string;
  phone: string;
  avatar?: string;
  experience: number;
  languages: string[];
  skills: string[];
  pricePerMinute: number;
  rating: number;
  totalReviews: number;
  totalSessions: number;
  about: string;
  isOnline: boolean;
}

export interface Availability {
  isOnline: boolean;
  chatEnabled: boolean;
  callEnabled: boolean;
  isBusy: boolean;
  autoAcceptChat: boolean;
  maxConcurrentSessions: number;
}

export interface Pricing {
  chatPricePerMinute: number;
  callPricePerMinute: number;
  minChatPrice: number;
  maxChatPrice: number;
  minCallPrice: number;
  maxCallPrice: number;
}

export interface Stats {
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
  totalSessions: number;
  rating: number;
  responseRate: number;
  todayEarnings: number;
  todaySessions: number;
  weekEarnings: number;
  monthEarnings: number;
}

export interface AccountDashboard {
  profile: AccountProfile;
  availability: Availability;
  pricing: Pricing;
  stats: Stats;
}

export interface AccountState {
  dashboard: AccountDashboard | null;
  profile: AccountProfile | null;
  pricing: Pricing | null;
  availability: Availability | null;
  stats: Stats | null;
  loading: boolean;
  updating: boolean;
  error: string | null;
  isMockData: boolean;
}

export interface SettingItemData {
  id: string;
  title: string;
  icon: string;
  type: 'navigation' | 'toggle' | 'action';
  value?: string | boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export interface ProfessionalInfo {
  skills: string[];
  languages: string[];
  pricePerMinute: number;
  totalReviews: number;
  experience: number;
}

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface GraphQLDashboardResponse {
  astrologerDashboard: AccountDashboard;
}

export interface GraphQLProfileResponse {
  astrologerProfile: AccountProfile;
}

export interface UpdateAvailabilityInput {
  isOnline?: boolean;
  chatEnabled?: boolean;
  callEnabled?: boolean;
  isBusy?: boolean;
  autoAcceptChat?: boolean;
  maxConcurrentSessions?: number;
}

export interface UpdatePricingInput {
  chatPricePerMinute?: number;
  callPricePerMinute?: number;
}