export interface UserWallet {
  balanceCoins: number;
  lockedCoins: number;
}

export interface UserDetails {
  id: string;
  name: string;
  mobile: string;
  countryCode: string;
  gender: string;
  occupation: string;

  wallet: UserWallet;

  totalSessions: number;
  completedSessions: number;
  totalReviews: number;

  createdAt: string;
}