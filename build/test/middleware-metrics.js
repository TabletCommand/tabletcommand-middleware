"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const index_1 = require("../index");
const metrics = index_1.metrics();
describe("Metrics Middleware", function () {
    it("removes uuid from end of paths", function (done) {
        const path = "api.user.daafe605-feac-add0-ad0e-89023d48deab";
        return metrics.defaultFilter(path, function (cleanPath) {
            chai_1.assert.equal(cleanPath, "api.user");
            return done();
        });
    });
    it("removes uuid from middle of paths", function (done) {
        const path = "api.user.daafe605-feac-add0-ad0e-89023d48deab.info";
        return metrics.defaultFilter(path, function (cleanPath) {
            chai_1.assert.equal(cleanPath, "api.user.info");
            return done();
        });
    });
    it("removes mongo id from middle of paths", function (done) {
        const path = "api.online.515a41a3e0387575cc939002.status";
        return metrics.defaultFilter(path, function (cleanPath) {
            chai_1.assert.equal(cleanPath, "api.online.status");
            return done();
        });
    });
    it("skips paths without uuid", function (done) {
        const path = "api.user.profile";
        return metrics.defaultFilter(path, function (cleanPath) {
            chai_1.assert.equal(cleanPath, "api.user.profile");
            return done();
        });
    });
});
//# sourceMappingURL=middleware-metrics.js.map