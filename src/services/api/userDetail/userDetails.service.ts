import { graphqlRequest } from '../../graphqlClient';
import { GET_USER_DETAILS_QUERY } from './userDetails.query';
import { UserDetails } from './userDetails.types';

export const userDetailsApi = {
  getUserDetails: async (
    userId: string,
    token?: string,
  ) => {
    console.log('=== GET USER DETAILS REQUEST ===');

    console.log(
      'Variables:',
      JSON.stringify(
        {
          userId,
        },
        null,
        2,
      ),
    );

    console.log('================================');

    return graphqlRequest<{
      getUserDetails: UserDetails;
    }>({
      query: GET_USER_DETAILS_QUERY,
      variables: {
        userId,
      },
      token,
    });
  },
};

// const fetchUserDetails = async (userId: string) => {
//   try {
//     const response =
//       await userDetailsApi.getUserDetails(userId);

//     console.log(
//       'user details response:',
//       JSON.stringify(response, null, 2),
//     );

//     const userData =
//       response?.data?.getUserDetails;

//     if (userData) {
//       console.log('user data:', userData);

//       // setUserDetails(userData);
//     }
//   } catch (error) {
//     console.log('user details error:', error);
//   }
// };