"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const chai_1 = require("chai");
const index_1 = require("../index");
describe("Helpers", function () {
    it("fixObjectBooleanKey", function (done) {
        const obj = {
            key1: "1",
            key2: 1,
            key3: "0",
            key4: 0,
            key5: "a",
        };
        const t1 = lodash_1.default.clone(obj);
        index_1.helpers.fixObjectBooleanKey(t1, "key1", false);
        chai_1.assert.isTrue(t1.key1 === true);
        const t2 = lodash_1.default.clone(obj);
        index_1.helpers.fixObjectBooleanKey(t2, "key2", false);
        chai_1.assert.isTrue(t2.key2 === true);
        const t3 = lodash_1.default.clone(obj);
        index_1.helpers.fixObjectBooleanKey(t3, "key3", true);
        chai_1.assert.isTrue(t3.key3 === false);
        const t4 = lodash_1.default.clone(obj);
        index_1.helpers.fixObjectBooleanKey(t4, "key4", true);
        chai_1.assert.isTrue(t4.key4 === false);
        const t5 = lodash_1.default.clone(obj);
        index_1.helpers.fixObjectBooleanKey(t5, "key5", true);
        chai_1.assert.isTrue(t5.key5 === "a");
        return done();
    });
    it("isAdmin", function (done) {
        const at = {
            admin: true,
        };
        chai_1.assert.isTrue(index_1.helpers.isAdmin(at));
        const a1 = {
            admin: 1,
        };
        chai_1.assert.isTrue(index_1.helpers.isAdmin(a1));
        const a1s = {
            admin: "1",
        };
        chai_1.assert.isTrue(index_1.helpers.isAdmin(a1s));
        const af = {
            admin: "false",
        };
        chai_1.assert.isFalse(index_1.helpers.isAdmin(af));
        const a0 = {
            admin: 0,
        };
        chai_1.assert.isFalse(index_1.helpers.isAdmin(a0));
        const e = {};
        chai_1.assert.isFalse(index_1.helpers.isAdmin(e));
        return done();
    });
    it("isSuper", function (done) {
        const sa = {
            superuser: 1,
        };
        chai_1.assert.isTrue(index_1.helpers.isSuper(sa));
        const sf = {
            superuser: 0,
        };
        chai_1.assert.isFalse(index_1.helpers.isSuper(sf));
        return done();
    });
    it("isActive", function (done) {
        const a = {
            active: true,
        };
        chai_1.assert.isTrue(index_1.helpers.isActive(a));
        const i = {
            active: "false",
        };
        chai_1.assert.isFalse(index_1.helpers.isActive(i));
        return done();
    });
});
//# sourceMappingURL=helpers.js.map