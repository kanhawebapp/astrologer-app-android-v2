export interface MonthlyAnalytics {
  month: string;
  earnings: number;
  chats: number;
  calls: number;
}

export interface AstrologerAnalytics {
  totalEarnings: number;
  totalFollowers: number;
  totalChats: number;
  totalCalls: number;
  averageRating: number;
  monthlyData: MonthlyAnalytics[];
}

export interface GetAstrologerAnalyticsVariables {
  astrologerId: string;
  
}

export interface GetAstrologerAnalyticsData {
  getAstrologerAnalytics: AstrologerAnalytics;
}