"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_uri_1 = __importDefault(require("mongodb-uri"));
const lodash_1 = __importDefault(require("lodash"));
function config() {
    function redisURL(str) {
        // URI format: redis://x:942t4dff@192.168.0.17:6379,192.168.0.18:1234
        let urlParts = null;
        try {
            urlParts = mongodb_uri_1.default.parse(str);
        }
        catch (e) {
            // parse failed and that is ok.
        }
        if (!lodash_1.default.isObject(urlParts)) {
            return str;
        }
        let hostPort = "localhost:6379"; // Default
        if (lodash_1.default.isArray(urlParts.hosts) && urlParts.hosts.length > 0) {
            const srv = urlParts.hosts[Math.floor(Math.random() * urlParts.hosts.length)];
            hostPort = `${srv.host}:${srv.port}`;
        }
        else {
            console.log(`Could not determine Redis URL configuration from: ${str}.`);
        }
        return `${urlParts.scheme}://${urlParts.username}:${urlParts.password}@${hostPort}`;
    }
    return {
        redisURL,
    };
}
exports.default = config;
//# sourceMappingURL=config-resolver.js.map