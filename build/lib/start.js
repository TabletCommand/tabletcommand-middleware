"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// cSpell:words nmea
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("server-nmea:storage");
function mongooseOnError(err) {
    console.log(`Mongoose default connection error: ${err}`);
    process.exit();
}
exports.mongooseOnError = mongooseOnError;
function mongooseOnDisconnected() {
    debug("Mongoose default connection disconnected");
    process.exit();
}
exports.mongooseOnDisconnected = mongooseOnDisconnected;
function serverOnError(error) {
    if (error.syscall !== "listen") {
        throw error;
    }
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            console.error("Port requires elevated privileges");
            break;
        case "EADDRINUSE":
            console.error("Port is already in use");
            break;
        default:
            throw error;
    }
    process.exit(1);
}
exports.serverOnError = serverOnError;
function serverOnListening(startTime, server) {
    return function onListeningFunc() {
        const address = server.address();
        console.log(`Server listening on ${address.address}:${address.port}. Start time: ${(new Date().valueOf() - startTime)} ms.`);
    };
}
exports.serverOnListening = serverOnListening;
function redisOnError(err) {
    console.log(`Redis connection error: ${err}.`);
    process.exit(1);
}
exports.redisOnError = redisOnError;
function redisOnConnect(config, startTime, mongoose, mongooseOnOpen) {
    return function redisOnConnectFunc() {
        console.log(`Redis connected after ${(new Date().valueOf() - startTime)}ms.`);
        const p = mongoose.connect(config.mongoUrl, {
            useMongoClient: true,
        });
        mongoose.connection.on("error", mongooseOnError);
        mongoose.connection.on("disconnected", mongooseOnDisconnected);
        mongoose.connection.on("open", mongooseOnOpen(config, startTime));
        return p;
    };
}
exports.redisOnConnect = redisOnConnect;
//# sourceMappingURL=start.js.map