import {
  graphqlRequest,
  GraphQLClientError,
} from '../../../services/graphqlClient';
import {
  AccountProfile,
  AccountDashboard,
  UpdateAvailabilityInput,
  UpdatePricingInput,
} from '../domain/types';

interface GraphQLProfileResponse {
  getAstrologerProfile: {
    success: boolean;
    message: string;
    data: any;
  };
}

const GET_ASTROLOGER_PROFILE_QUERY = `
  query GetAstrologerProfile {
    getAstrologerProfile {
      success
      message
      data {
        id
        name
        displayName
        email
        contactNo
        profilePic
        experience
        languages
        skills
        about
        rating
        totalReviews
        totalSessions
        status
        pricing {
          type
          price
          offerPrice
        }
        wallet {
          balanceCoins
          totalEarned
          totalWithdrawn
        }
      }
    }
  }
`;

interface GraphQLUpdateProfileResponse {
  updateAstrologerProfile: AccountProfile;
}

const UPDATE_AVAILABILITY_MUTATION = `
  mutation UpdateAvailability($input: UpdateAvailabilityInput!) {
    updateAvailability(input: $input) {
      isOnline
      chatEnabled
      callEnabled
      isBusy
      autoAcceptChat
      maxConcurrentSessions
    }
  }
`;

const UPDATE_PRICING_MUTATION = `
  mutation UpdatePricing($input: UpdatePricingInput!) {
    updatePricing(input: $input) {
      chatPricePerMinute
      callPricePerMinute
    }
  }
`;

const UPDATE_PROFILE_MUTATION = `
  mutation UpdateAstrologerProfile($input: UpdateAstrologerProfileInput!) {
    updateAstrologerProfile(input: $input) {
      id
      name
      displayName
      email
      contactNo
      profilePic
      experience
      languages
      skills
      about
      rating
      totalReviews
      totalSessions
      status
    }
  }
`;

export const accountApi = {
  getDashboard: async (token: string): Promise<any> => {
    try {
      const response = await graphqlRequest<GraphQLProfileResponse>({
        query: GET_ASTROLOGER_PROFILE_QUERY,
        token,
      });
      const data = response?.getAstrologerProfile?.data;
      if (!data) {
        throw new GraphQLClientError('No profile data returned from API');
      }
      return data;
    } catch (error) {
      if (error instanceof GraphQLClientError) {
        throw error;
      }
      throw new GraphQLClientError('Failed to fetch dashboard');
    }
  },

  updateAvailability: async (
    token: string,
    input: UpdateAvailabilityInput,
  ): Promise<void> => {
    try {
      await graphqlRequest({
        query: UPDATE_AVAILABILITY_MUTATION,
        variables: { input },
        token,
      });
    } catch (error) {
      if (error instanceof GraphQLClientError) {
        throw error;
      }
      throw new GraphQLClientError('Failed to update availability');
    }
  },

  updatePricing: async (
    token: string,
    input: UpdatePricingInput,
  ): Promise<void> => {
    try {
      await graphqlRequest({
        query: UPDATE_PRICING_MUTATION,
        variables: { input },
        token,
      });
    } catch (error) {
      if (error instanceof GraphQLClientError) {
        throw error;
      }
      throw new GraphQLClientError('Failed to update pricing');
    }
  },

  updateProfile: async (
    token: string,
    input: {
      name?: string;
      about?: string;
      skills?: string[];
      languages?: string[];
      chatPricePerMinute?: number;
      callPricePerMinute?: number;
    },
  ): Promise<AccountProfile> => {
    try {
      const response = await graphqlRequest<GraphQLUpdateProfileResponse>({
        query: UPDATE_PROFILE_MUTATION,
        variables: { input },
        token,
      });
      return response.updateAstrologerProfile;
    } catch (error) {
      if (error instanceof GraphQLClientError) {
        throw error;
      }
      throw new GraphQLClientError('Failed to update profile');
    }
  },
};