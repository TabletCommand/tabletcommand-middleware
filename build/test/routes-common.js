"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const chai_1 = require("chai");
const index_1 = require("../index");
describe("routesCommon", function () {
    context("authDepartment", function () {
        it("isAllowed", function (done) {
            const reqObj = {
                department: {
                    department: "Test Department",
                    departmentId: "abc1234",
                },
            };
            return index_1.routesCommon.authDepartment(reqObj, {}, function next(err) {
                chai_1.assert.isUndefined(err, "Err should not be set");
                return done();
            });
        });
        it("isDenied", function (done) {
            return index_1.routesCommon.authDepartment({}, {}, function next(err) {
                chai_1.assert.instanceOf(err, Error);
                chai_1.assert.equal(err.status, 401);
                return done();
            });
        });
    });
    context("authSuper", function () {
        it("isAllowed", function (done) {
            const reqObj = {
                user: {
                    nick: "verygoodguy",
                    superuser: true,
                },
            };
            return index_1.routesCommon.authSuper(reqObj, {}, function next(err) {
                chai_1.assert.isUndefined(err, "Err should not be set");
                return done();
            });
        });
        it("isDenied", function (done) {
            return index_1.routesCommon.authSuper({}, {}, function next(err) {
                chai_1.assert.instanceOf(err, Error);
                chai_1.assert.equal(err.status, 401);
                return done();
            });
        });
    });
    context("authUser", function () {
        const req = {
            user: {
                nick: "hello",
                active: true,
            },
        };
        it("isAllowed", function (done) {
            return index_1.routesCommon.authUser(req, {}, function next(err) {
                chai_1.assert.isUndefined(err, "Err should not be set");
                return done();
            });
        });
        it("isDenied", function (done) {
            const reqd = lodash_1.default.clone(req);
            reqd.user.active = false;
            return index_1.routesCommon.authUser(reqd, {}, function next(err) {
                chai_1.assert.instanceOf(err, Error);
                chai_1.assert.equal(err.status, 401);
                return done();
            });
        });
    });
});
//# sourceMappingURL=routes-common.js.map