"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
function tokenSession(allowedTokens) {
    const buildAllowedItems = function buildAllowedItems(items) {
        if (!lodash_1.default.isArray(items)) {
            return [];
        }
        const mapped = lodash_1.default.map(items, function mapCallback(item) {
            const a = {
                active: false,
                admin: true,
                outsider: true,
                username: "",
                token: "",
                email: "",
            };
            if (lodash_1.default.isString(item.token)) {
                a.token = lodash_1.default.trim(item.token);
            }
            if (lodash_1.default.isString(item.username)) {
                a.username = lodash_1.default.trim(item.username);
                a.email = "devops+" + a.username + "@tabletcommand.com";
            }
            a.active = a.username.length > 0 && a.token.length > 0;
            return a;
        });
        const filtered = lodash_1.default.filter(mapped, function filterCallback(item) {
            return item.active;
        });
        return filtered;
    };
    const validateToken = function validateToken(err, tokens, req, res, next) {
        let token = "";
        if (lodash_1.default.has(req.headers, "x-tc-auth-token")) {
            const headerValue = req.headers["x-tc-auth-token"];
            if (lodash_1.default.isString(headerValue)) {
                token = lodash_1.default.trim(headerValue);
            }
        }
        const foundUsers = lodash_1.default.filter(tokens, function filterCallback(item) {
            return item.token === token && token.length > 0;
        });
        if (lodash_1.default.size(foundUsers) > 0) {
            req.user = foundUsers[0];
        }
        return next(err);
    };
    return function tokenSessionCallback(req, res, next) {
        const tokens = buildAllowedItems(allowedTokens);
        return validateToken(null, tokens, req, res, next);
    };
}
exports.tokenSession = tokenSession;
exports.default = tokenSession;
//# sourceMappingURL=token-session.js.map