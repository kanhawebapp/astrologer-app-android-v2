
import { graphqlRequest } from "../../graphqlClient";

const LOGOUT_MUTATION = `
  mutation LogoutAstrologer {
    logoutAstrologer {
      message
      success
    }
  }
`;

export const logoutApi = (token: string) => {
  console.log('=== LOGOUT API CALL ===');

  return graphqlRequest<{
    logoutAstrologer: {
      message: string;
      success: boolean;
    };
  }>({
    query: LOGOUT_MUTATION,
    token,
  });
};