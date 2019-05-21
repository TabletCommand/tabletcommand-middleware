"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const chai_1 = require("chai");
const __1 = require("../");
const configResolver = __1.configResolver();
describe("config-resolver", function () {
    context("redisURL", function () {
        it("returns the same url, if only one was defined", function (done) {
            const expectedURL = "redis://x:password@10.10.11.11:6370";
            const expectedResult = configResolver.redisURL(expectedURL);
            chai_1.assert.equal(expectedURL, expectedResult);
            return done();
        });
        it("parses url and returns one random host", function (done) {
            const expectedURLs = [
                "redis://x:password@10.10.11.11:5000",
                "redis://x:password@10.10.12.12:6000",
            ];
            const expectedResult = configResolver.redisURL("redis://x:password@10.10.11.11:5000,10.10.12.12:6000");
            chai_1.assert.isTrue(lodash_1.default.indexOf(expectedURLs, expectedResult) > -1);
            return done();
        });
        it("invalid url returns the same string", function (done) {
            const invalidURL = "abcd";
            const expectedResult = configResolver.redisURL(invalidURL);
            chai_1.assert.equal(invalidURL, expectedResult);
            return done();
        });
    });
});
//# sourceMappingURL=config-resolver.js.map