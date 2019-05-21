"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const custom_session_1 = __importDefault(require("./middleware/custom-session"));
const signup_session_1 = __importDefault(require("./middleware/signup-session"));
const token_session_1 = __importDefault(require("./middleware/token-session"));
const seneca_session_redis_1 = __importDefault(require("./middleware/seneca-session-redis"));
const apikey_session_redis_1 = __importDefault(require("./middleware/apikey-session-redis"));
const metrics_1 = __importDefault(require("./middleware/metrics"));
const redisModule = __importStar(require("./lib/redis"));
const helpersModule = __importStar(require("./lib/helpers"));
const routesCommonModule = __importStar(require("./routes/common"));
const startModule = __importStar(require("./lib/start"));
const loggerModule = __importStar(require("./lib/bunyan-logger"));
const config_resolver_1 = __importDefault(require("./lib/config-resolver"));
exports.session = {
    legacy: custom_session_1.default,
    signup: signup_session_1.default,
    token: token_session_1.default,
    seneca: seneca_session_redis_1.default,
    apiKey: apikey_session_redis_1.default,
};
exports.metrics = metrics_1.default;
exports.redis = redisModule;
exports.helpers = helpersModule;
exports.routesCommon = routesCommonModule;
exports.start = startModule;
exports.logger = loggerModule;
exports.configResolver = config_resolver_1.default;
//# sourceMappingURL=index.js.map