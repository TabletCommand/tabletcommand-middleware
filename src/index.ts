import customSession from "./middleware/custom-session";
import signupSession from "./middleware/signup-session";
import tokenSession from "./middleware/token-session";
import senecaSession from "./middleware/seneca-session-redis";
import apiKeySession from "./middleware/apikey-session-redis";
import metricsModule from "./middleware/metrics";
import * as redisModule from "./lib/redis";
import * as helpersModule from "./lib/helpers";
import * as routesCommonModule from "./routes/common";
import * as startModule from "./lib/start";
import * as loggerModule from "./lib/bunyan-logger";
import configResolverModule from "./lib/config-resolver";

export const session = {
  legacy: customSession,
  signup: signupSession,
  token: tokenSession,
  seneca: senecaSession,
  apiKey: apiKeySession,
};
export const metrics = metricsModule;
export const redis = redisModule;
export const helpers = helpersModule;
export const routesCommon = routesCommonModule;
export const start = startModule;
export const logger = loggerModule;
export const configResolver = configResolverModule;
