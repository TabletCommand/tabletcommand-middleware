"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bunyan_1 = __importDefault(require("bunyan"));
function logger(name, filePath, logToConsole) {
    const streams = [];
    if (logToConsole) {
        streams.push({
            level: "info",
            stream: process.stdout,
        });
    }
    streams.push({
        type: "rotating-file",
        path: filePath,
        period: "1d",
        count: 10,
    });
    const logger = bunyan_1.default.createLogger({
        name,
        streams,
    });
    // Reopen file streams on signal
    process.on("SIGUSR2", function () {
        logger.reopenFileStreams();
    });
    return logger;
}
exports.logger = logger;
function middleware(loggerInstance) {
    return function accessLogMiddleware(req, res, next) {
        // This doesn't fire the log immediately, but waits until the response is finished
        // This means we have a chance of logging the response code
        res.on("finish", () => {
            loggerInstance.info({
                remoteAddress: req.ip,
                method: req.method,
                url: req.originalUrl,
                protocol: req.protocol,
                hostname: req.hostname,
                httpVersion: `${req.httpVersionMajor}.${req.httpVersionMinor}`,
                userAgent: req.headers["user-agent"],
                status: res._header ? res.statusCode : undefined,
            }, "access_log");
        });
        next();
    };
}
exports.middleware = middleware;
//# sourceMappingURL=bunyan-logger.js.map