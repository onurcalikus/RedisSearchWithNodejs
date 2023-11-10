const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

const REDIS = {
  PORT: {
    CONTENT: 6379,
  },
  EXPIRE_SECOND: {
    ACCESS_TOKENS: 20 * 60,
    REFRESH_TOKEN: 24 * 60 * 60,
    SWAP: 9,
    BRIDGE: 9,
    WITHDRAW: 35,
    WALLETS_BALANCES: 5 * 60,
    VERIFICATION_CODES: 2 * 60,
  },
};

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  REDIS,
};
