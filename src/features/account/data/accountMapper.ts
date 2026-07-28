import { AccountProfile, AccountDashboard, Availability, Pricing, Stats } from '../domain/types';

const htmlToText = (html: string): string => {
  return html.replace(/<[^>]*>/g, '');
};

export const mapProfile = (apiProfile: any): AccountProfile => {
  return {
    id: apiProfile.id,
    name: apiProfile.name,
    displayName: apiProfile.displayName,
    email: apiProfile.email,
    phone: apiProfile.contactNo,
    avatar: apiProfile.profilePic,
    experience: apiProfile.experience,
    languages: apiProfile.languages || [],
    skills: apiProfile.skills || [],
    pricePerMinute: 0,
    rating: apiProfile.rating,
    totalReviews: apiProfile.totalReviews,
    totalSessions: apiProfile.totalSessions,
    about: htmlToText(apiProfile.about || ''),
    isOnline: apiProfile.status,
  };
};

export const mapWalletStats = (wallet: any): Partial<Stats> => {
  return {
    balance: wallet?.balanceCoins || 0,
    totalEarned: wallet?.totalEarned || 0,
    totalWithdrawn: wallet?.totalWithdrawn || 0,
  };
};

export const mapPricing = (pricingArray: any[]): Pricing => {
  const pricing: Pricing = {
    chatPricePerMinute: 0,
    callPricePerMinute: 0,
    minChatPrice: 0,
    maxChatPrice: 0,
    minCallPrice: 0,
    maxCallPrice: 0,
  };

  pricingArray?.forEach((item) => {
    switch (item.type) {
      case 'CHAT':
        pricing.chatPricePerMinute = item.price;
        break;
      case 'CALL':
        pricing.callPricePerMinute = item.price;
        break;
    }
  });

  return pricing;
};

export const mapDashboard = (apiResponse: any): AccountDashboard => {
  const profile = mapProfile(apiResponse);
  return {
    profile,
    availability: {
      isOnline: apiResponse.status,
      chatEnabled: true,
      callEnabled: true,
      isBusy: false,
      autoAcceptChat: false,
      maxConcurrentSessions: 3,
    },
    pricing: mapPricing(apiResponse.pricing || []),
    stats: {
      ...mapWalletStats(apiResponse.wallet || {}),
      totalSessions: profile.totalSessions,
      rating: profile.rating,
      responseRate: 0,
      todayEarnings: 0,
      todaySessions: 0,
      weekEarnings: 0,
      monthEarnings: 0,
    },
  };
};