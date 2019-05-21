"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = process.env.NODE_MONGO_URL || "mongodb://test:test@127.0.0.1/test";
exports.redis = process.env.NODE_MASSIVE_REDIS_URL || "redis://x:password@localhost:6379";
//# sourceMappingURL=config.js.map