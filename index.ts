import customSession from "./src/middleware/custom-session";
import signupSession from "./src/middleware/signup-session";
import tokenSession from "./src/middleware/token-session";
import senecaSession from "./src/middleware/seneca-session-redis";
import apiKeySession from "./src/middleware/apikey-session-redis";
import metricsModule from "./src/middleware/metrics";
import * as redisModule from "./src/lib/redis";
import * as helpersModule from "./src/lib/helpers";
import * as routesCommonModule from "./src/routes/common";
import * as startModule from "./src/lib/start";
import * as loggerModule from "./src/lib/bunyan-logger";
import configResolverModule from "./src/lib/config-resolver";


export const session = {
  legacy: customSession,
  signup: signupSession,
  token: tokenSession,
  seneca: senecaSession,
  apiKey: apiKeySession
};
export const metrics = metricsModule;
export const redis = redisModule;
export const helpers = helpersModule;
export const routesCommon = routesCommonModule;
export const start = startModule;
export const logger = loggerModule;
export const configResolver = configResolverModule;

