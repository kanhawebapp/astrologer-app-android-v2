import { Config } from '../config/env';

interface GraphQLError {
  message: string;
  locations?: { line: number; column: number }[];
  path?: string[];
  extensions?: Record<string, unknown>;
}

interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: GraphQLError[];
}

interface GraphQLRequestOptions {
  query: string;
  variables?: Record<string, unknown>;
  token?: string;
}

export class GraphQLClientError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 0) {
    super(message);
    this.name = 'GraphQLClientError';
    this.statusCode = statusCode;
  }
}

const getAuthToken = (): string | null => {
  try {
    const { store } = require('../store');
    const token = store.getState().auth.token;
    return token || null;
  } catch (error) {
    // console.log('=== GraphQL Token Fetch Error ===');
    // console.log('Error:', error instanceof Error ? error.message : 'Unknown error');
    // console.log('================================');
    return null;
  }
};

const resolveToken = (manualToken?: string): string | null => {
  const token = manualToken ?? getAuthToken();
  
  if (token) {
    // console.log('=== GraphQL Client Token Resolved ===');
    // console.log('Source:', manualToken ? 'MANUAL' : 'REDUX_STORE');
    // console.log('Token:', `${token.substring(0, 20)}...`);
    // console.log('==================================');
  } else {
    // console.log('=== GraphQL Client: NO TOKEN AVAILABLE ===');
    // console.log('==========================================');
  }
  
  return token;
};

export async function graphqlRequest<T = unknown>({
  query,
  variables,
  token,
}: GraphQLRequestOptions): Promise<T> {
  const resolvedToken = resolveToken(token);
  
  // console.log('[GRAPHQL] Request Started');
  // console.log(`[GRAPHQL] Token Source: ${token ? 'MANUAL' : resolvedToken ? 'REDUX_STORE' : 'NONE'}`);
  if (resolvedToken) {
    // console.log(`[GRAPHQL] Token Preview: ${resolvedToken.substring(0, 20)}...`);
  }
  // console.log(`[GRAPHQL] Authorization Header Attached: ${!!resolvedToken}`);
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (resolvedToken) {
    headers.Authorization = `Bearer ${resolvedToken}`;
  }

  try {
    const body = JSON.stringify({ query, variables });

    // console.log('=== GRAPHQL HTTP REQUEST ===');
    // console.log('URL:', Config.API_BASE_URL);
    // console.log('Method: POST');
    // console.log('Headers:', JSON.stringify(headers, null, 2));
    // console.log('Body:', JSON.stringify({ query, variables }, null, 2));
    // console.log('============================');

    const response = await fetch(Config.API_BASE_URL, {
      method: 'POST',
      headers,
      body,
    });

    const result: GraphQLResponse<T> = await response.json();

    // console.log('=== GRAPHQL HTTP RESPONSE ===');
    // console.log('Status:', response.status);
    // console.log('Response:', JSON.stringify(result, null, 2));
    // console.log('=============================');

    if (!response.ok) {
      // console.log('=== GRAPHQL HTTP ERROR ===');
      // console.log('Status:', response.status);
      // console.log('Errors:', JSON.stringify(result.errors, null, 2));
      // console.log('==========================');
      throw new GraphQLClientError(
        result.errors?.[0]?.message || `HTTP Error: ${response.status}`,
        response.status,
      );
    }

    if (result.errors && result.errors.length > 0) {
      throw new GraphQLClientError(result.errors[0].message, response.status);
    }

    if (!result.data) {
      throw new GraphQLClientError('No data returned from GraphQL query');
    }

    return result.data;
  } catch (error) {
    // console.log('=== GRAPHQL CATCH ERROR ===');
    // console.log('Error:', error instanceof Error ? error.message : error);
    // console.log('===========================');

    if (error instanceof GraphQLClientError) {
      throw error;
    }

    if (
      error instanceof TypeError &&
      error.message === 'Network request failed'
    ) {
      throw new GraphQLClientError(
        'Network error. Please check your connection.',
      );
    }

    throw new GraphQLClientError(
      error instanceof Error ? error.message : 'An unexpected error occurred',
    );
  }
}