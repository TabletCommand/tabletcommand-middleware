"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const chai_1 = require("chai");
const index_1 = require("../index");
const tokenSession = index_1.session.token;
describe("Token Session", function () {
    it("sets correct user", function (done) {
        const testToken = "abcd";
        const testUsername = "test-abcd";
        const req = {
            headers: {
                "x-tc-auth-token": testToken,
            },
        };
        const session = tokenSession([{
                token: testToken,
                username: testUsername,
            }]);
        return session(req, {}, function () {
            chai_1.assert.isObject(req.user);
            chai_1.assert.equal(req.user.username, testUsername);
            chai_1.assert.equal(req.user.token, testToken);
            return done();
        });
    });
    it("no user if no tokens were provided", function (done) {
        const req = {};
        const session = tokenSession([{
                a: "b",
            }]);
        return session(req, {}, function () {
            chai_1.assert.isTrue(!lodash_1.default.isObject(req.user));
            return done();
        });
    });
});
//# sourceMappingURL=middleware-token-session.js.map