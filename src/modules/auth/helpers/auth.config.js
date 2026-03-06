const config = require('../../../config/config');

const authCfg = {
    otpLength: config.auth.otp_length,
    otpTtlMs: config.auth.otp_ttl_ms,
    bcryptCost: config.auth.bcrypt_cost,
};

module.exports = { authCfg };