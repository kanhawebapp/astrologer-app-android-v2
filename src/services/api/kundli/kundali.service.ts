import { graphqlRequest } from '../../graphqlClient';
import { GET_KUNDALI_QUERY } from './kundali.query';
import {
    GetKundaliData,
    GetKundaliVariables,
} from './kundali.types';

export const kundaliApi = {
    getKundali: async (
        variables: GetKundaliVariables,
        token?: string,
    ) => {
        console.log(
            '=== GET KUNDALI REQUEST ===',
        );
        console.log(
            'Variables:',
            JSON.stringify(
                variables,
                null,
                2,
            ),
        );
        console.log(
            'Query:',
            GET_KUNDALI_QUERY.trim(),
        );
        console.log(
            '==========================',
        );

        return graphqlRequest<
            GetKundaliData,
            GetKundaliVariables
        >({
            query: GET_KUNDALI_QUERY,
            variables,
            token,
        });
    },
};