const rateLimit = require('express-rate-limit');
const { createHash } = require('node:crypto');

function createLimiter(prefix, options) {
  const store = {
    localKeys: false,
    init(settings) {
      this.windowMs = settings.windowMs;
    },
    async increment(key) {
      const { incrementRateLimit } = await import('../db/repositories.ts');
      return incrementRateLimit(`${prefix}:${key}`, this.windowMs);
    },
    async decrement(key) {
      const { decrementRateLimit } = await import('../db/repositories.ts');
      await decrementRateLimit(`${prefix}:${key}`);
    },
    async resetKey(key) {
      const { resetRateLimit } = await import('../db/repositories.ts');
      await resetRateLimit(`${prefix}:${key}`);
    }
  };

  return rateLimit({
    ...options,
    store,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
    keyGenerator: (req) => createHash('sha256').update(req.platformIp || req.ip || 'unknown').digest('hex')
  });
}

module.exports = { createLimiter };
