import { Environment } from '@application/common/enums';

const CONSTANTS = {
  LOGGER: {
    IGNORED_ROUTES: ['health'],
  },
  JWT: {
    CLAIMS_KEY: 'claims',
  },
  CRYPTO: {
    IV_LENGTH: 16,
    KEY_LENGTH: 32,
    ALGORITHM: 'aes-256-cbc',
  },
  EMAIL: {
    QR: {
      TYPE: 'image/png',
      WIDTH: 200,
      MARGIN: 1,
      RENDER_OPTS: {
        quality: 1,
      },
      ERROR_CORRECTION_LEVEL: 'H',
      COLOR: {
        DARK: '#000000',
        LIGHT: '#ffffff',
      },
    },
  },
  //? Default values for the application
  DEFAULTS: {
    APP: {
      PORT: 3000,
      NAME: 'Movie Management API',
      VERSION: '1.0.0',
      BASE_URL: 'http://localhost:3000',
    },
    TIMEOUT: 10000,
    LOG_LEVEL: 'debug',
    ENV: Environment.DEV,
    THROTTLE: {
      TTL: '60000',
      LIMIT: '25',
    },
    SWAGGER: {
      TITLE: 'Movie Management API',
      DESCRIPTION: 'Movie Management API Documentation',
      VERSION: '1.0.0',
      CONTACT: {
        NAME: 'Bahadır Ünal',
        EMAIL: 'bahadir.unal@tedu.edu.tr',
        URL: 'https://www.linkedin.com/in/bahadır-ünal-78547916a',
      },
    },
  },
};

export { CONSTANTS };
