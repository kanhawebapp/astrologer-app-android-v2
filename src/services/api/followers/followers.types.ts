export interface FollowerUser {
  id: string;
  name: string;
  mobile: string;
  countryCode: string;
}

export interface Follower {
  id: string;
  userId: string;
  astrologerId: string;
  createdAt: string;
  user: FollowerUser;
}

export interface GetAstrologerFollowersResponse {
  followers: Follower[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetAstrologerFollowersCountResponse {
  totalFollowers: number;
}