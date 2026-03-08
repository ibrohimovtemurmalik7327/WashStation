const path = require('path');
const dotenv = require('dotenv');

dotenv.config({
  path: path.resolve(__dirname, '../../.env')
});

function must(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required env variable: ${name}`);
  }

  return value;
}

const config = {

  env: process.env.NODE_ENV || 'development',

  server: {
    port: Number(process.env.PORT || 5000)
  },

  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'db_laundry'
  },

  jwt: {
    secret: must('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '1h'
  },

  bcrypt: {
    cost: Number(process.env.BCRYPT_COST || 10)
  },

  billing: {
    pricePerKg: Number(process.env.PRICE_PER_KG || 5000)
  },

  booking: {
    maxBookingHours: Number(process.env.MAX_BOOKING_HOURS || 4),
    intervalMinutes: Number(process.env.BOOKING_INTERVAL_MINUTES || 10)
  },

  tables: {
    TB_USERS: 'tb_users',
    TB_TICKETS: 'tb_tickets',
    TB_BRANCHES: 'tb_branches'
  },

  auth: {
        otp_length: Number(process.env.AUTH_OTP_LENGTH) || 6,
        otp_ttl_ms: Number(process.env.AUTH_OTP_TTL_MS) || 5 * 60 * 1000,
        otp_max_attempts: Number(process.env.AUTH_OTP_MAX_ATTEMPTS) || 5,
        bcrypt_cost: Number(process.env.BCRYPT_COST) || 10
  },
};

module.exports = config;