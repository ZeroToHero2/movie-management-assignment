import { CONSTANTS } from '@application/common/constants';
const {
  DEFAULTS: { ENV, TIMEOUT, APP, THROTTLE, SWAGGER },
} = CONSTANTS;

export default () => ({
  ENV: process.env.NODE_ENV || ENV,
  TIMEOUT: process.env.TIMEOUT || TIMEOUT,
  APP: {
    NAME: process.env.APP_NAME || APP.NAME,
    PORT: process.env.PORT || APP.PORT,
    VERSION: process.env.APP_VERSION || APP.VERSION,
    BASE_URL: process.env.BASE_URL || APP.BASE_URL,
  },
  EMAIL: {
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    SENDGRID_SINGLE_SENDER_EMAIL: process.env.SENDGRID_SINGLE_SENDER_EMAIL,
  },
  JWT_OPTIONS: {
    SECRET: process.env.JWT_SECRET,
    EXPIRATION_TIME: process.env.JWT_EXPIRATION_TIME,
  },
  CRYPTO: {
    IV: process.env.CRYPTO_IV,
    SALT: process.env.CRYPTO_SALT,
    SECRET: process.env.CRYPTO_SECRET,
  },
  THROTTLE: {
    TTL: parseInt(process.env.THROTTLE_TTL || THROTTLE.TTL, 10),
    LIMIT: parseInt(process.env.THROTTLE_LIMIT || THROTTLE.LIMIT, 10),
  },
  SWAGGER_OPTIONS: {
    TITLE: process.env.SWAGGER_TITLE || SWAGGER.TITLE,
    DESCRIPTION: process.env.SWAGGER_DESCRIPTION || SWAGGER.DESCRIPTION,
    VERSION: process.env.SWAGGER_VERSION || SWAGGER.VERSION,
    CONTACT: {
      NAME: process.env.SWAGGER_CONTACT_NAME || SWAGGER.CONTACT.NAME,
      EMAIL: process.env.SWAGGER_CONTACT_EMAIL || SWAGGER.CONTACT.EMAIL,
      URL: process.env.SWAGGER_CONTACT_URL || SWAGGER.CONTACT.URL,
    },
  },
});
