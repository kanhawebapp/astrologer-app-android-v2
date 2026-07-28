export interface Wallet {
  balanceCoins: number;
  totalEarned: number;
  totalWithdrawn: number;
}

export interface Pricing {
  id: string;
  type: string;
  price: number;
  offerPrice: number;
  commissionPercent: number;
  isActive: boolean;
}

export interface RecentReview {
  id: string;
  rating: number;
  comment: string;
  reply: string | null;
  userName: string;
  createdAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface Experience {
  platformName: string;
  yearsWorked: number;
}

export interface KycDetail {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifsc: string;
  branchName: string;
  panNumber: string;
  profileImage: string;
  aadhaarImage: string;
  panImage: string;
  passbookImage: string;
  status: string;
}

export interface AstrologerProfileData {
  id: string;
  profilePic: string;
  name: string;
  displayName: string;
  email: string;
  contactNo: string;
  about: string;
  gender: string;

  languages: string[];
  skills: string[];
  problems: string[];

  experience: number;
  rating: number;

  tags: string;
  vtags: string;

  status: boolean;
  createdAt: string;

  totalReviews: number;
  totalSessions: number;

  pricing: Pricing[];
  wallet: Wallet;
  recentReviews: RecentReview[];
  addresses: Address[];
  experiences: Experience[];
  kycDetail: KycDetail;
}

export interface GetAstrologerProfileResponse {
  success: boolean;
  message: string;
  data: AstrologerProfileData;
}