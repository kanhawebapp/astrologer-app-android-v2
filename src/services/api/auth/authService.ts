import { graphqlRequest } from '../../graphqlClient';
import { RequestOtpResponse, VerifyOtpResponse } from '../../../types';

const REQUEST_OTP_MUTATION = `
  mutation RequestOtp($contactNo: String!) {
    requestAstrologerOtp(contactNo: $contactNo) {
      message
    }
  }
`;

// const VERIFY_OTP_MUTATION = `
//   mutation VerifyOtp($contactNo: String!, $otp: String!) {
//     verifyAstrologerOtp(contactNo: $contactNo, otp: $otp) {
//       accessToken
//       astrologer {
//         id
//         contactNo
//       }
//     }
//   }
// `;

const VERIFY_OTP_MUTATION = `
  mutation VerifyOtp($contactNo: String!, $otp: String!) {
    verifyAstrologerOtp(contactNo: $contactNo, otp: $otp) {
      accessToken
      refreshToken
      astrologer {
        id
        contactNo
      }
    }
  }
`;

export const authApi = {
  requestOtp: (contactNo: string) => {
    console.log('=== SEND OTP REQUEST ===');
    console.log('Mutation:', REQUEST_OTP_MUTATION.trim());
    console.log('Variables:', JSON.stringify({ contactNo }, null, 2));
    console.log('========================');
    return graphqlRequest<{ requestAstrologerOtp: RequestOtpResponse }>({
      query: REQUEST_OTP_MUTATION,
      variables: { contactNo },
    });
  },

  verifyOtp: (contactNo: string, otp: string) => {
    console.log('=== VERIFY OTP REQUEST ===');
    console.log('Mutation:', VERIFY_OTP_MUTATION.trim());
    console.log('Variables:', JSON.stringify({ contactNo, otp }, null, 2));
    console.log('==========================');
    return graphqlRequest<{ verifyAstrologerOtp: VerifyOtpResponse }>({
      query: VERIFY_OTP_MUTATION,
      variables: { contactNo, otp },
    });
  },
};
