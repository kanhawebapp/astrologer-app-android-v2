import { graphqlRequest } from '../../graphqlClient';
import { GET_ASTROLOGER_APP_VERSION_QUERY } from './version.query';
import { GetAstrologerAppVersionData, GetAstrologerAppVersionVariables } from './version.type';
// import { GET_ASTROLOGER_APP_VERSION_QUERY } from './appVersion.query';


export const appVersionApi = {
  getAstrologerAppVersion: async (
    variables: GetAstrologerAppVersionVariables,
    token?: string,
  ): Promise<GetAstrologerAppVersionData> => {
    return graphqlRequest<GetAstrologerAppVersionData>({
      query: GET_ASTROLOGER_APP_VERSION_QUERY,
      variables: variables as unknown as Record<string, unknown>,
      token,
    });
  },
};