// const ENV = {
//   dev: {
//     // API_BASE_URL: 'https://dhwaniastro.com/userAuth/graphql',
//     API_BASE_URL: 'http://192.168.1.10:4000/graphql',
//   },
//   staging: {
//     API_BASE_URL: 'https://api.staging.example.com/graphql',
//   },
//   production: {
//     API_BASE_URL: 'https://dhwaniastro.com/userAuth/graphql',
//   },
// } as const;

// const ENV = {
//   dev: {
//     API_BASE_URL: 'https://dhwaniastro.com/astroAuth/graphql',
//     // API_BASE_URL: 'http://192.168.1.10:4000/graphql',
//   },
//   staging: {
//     API_BASE_URL: 'https://api.staging.example.com/graphql',
//   },
//   production: {
//     API_BASE_URL: 'https://dhwaniastro.com/userAuth/graphql',
//   },
// } as const;

const ENV = {
  dev: {
    API_BASE_URL: 'https://dhwaniastro.com/astroAuth/graphql',
  },

  staging: {
    API_BASE_URL: 'https://api.staging.example.com/graphql',
  },

  production: {
    API_BASE_URL: 'https://dhwaniastro.com/astroAuth/graphql',
  },
  imageBaseUrl: 'https://dhwaniastro.com',
} as const;

type Environment = keyof typeof ENV;

const getEnvironment = (): Environment => {
  return __DEV__ ? 'dev' : 'production';
};

const currentEnv = getEnvironment();


export const Config = {
  ...ENV[currentEnv],
  ENV: currentEnv,
  APP_VERSION: '1.0.0',
  APP_NAME: 'DhwaniAstrologer',
  TOKEN_KEY: '@auth_token',
  USER_KEY: '@user_data',
} as const;
