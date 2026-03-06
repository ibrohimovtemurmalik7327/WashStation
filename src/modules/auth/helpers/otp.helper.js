const crypto = require('crypto');
const { authCfg } = require('./auth.config');

const generateOtp = () => {
    const len = authCfg.otpLength;
    const max = 10 ** len;
    const n = crypto.randomInt(0, max);
    return String(n).padStart(len, '0');
};

const computeExpiresAt = () => new Date(Date.now() + authCfg.otpTtlMs);

module.exports = { generateOtp, computeExpiresAt };