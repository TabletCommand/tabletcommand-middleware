"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mongoose_1 = __importDefault(require("mongoose"));
const redis_js_1 = __importDefault(require("redis-js"));
const store_1 = __importDefault(require("../lib/store"));
const data_1 = __importDefault(require("./data"));
const bluebird_1 = __importDefault(require("bluebird"));
mongoose_1.default.Promise = bluebird_1.default;
const tabletcommand_backend_models_1 = require("tabletcommand-backend-models");
const config_1 = require("../config");
const mockgoose_1 = require("mockgoose");
const mockgoose = new mockgoose_1.Mockgoose(mongoose_1.default);
describe("Store", function () {
    let models;
    let store;
    let data;
    let testApiKey;
    let testToken;
    before(async () => {
        models = (await tabletcommand_backend_models_1.connect(config_1.db)).models;
        store = store_1.default(models.Department, models.Session, models.User, redis_js_1.default);
        data = data_1.default(mockgoose, mongoose_1.default, models, redis_js_1.default);
        testApiKey = data.apiKey;
        testToken = data.token;
    });
    beforeEach(async function () {
        await data.beforeEach();
    });
    afterEach(async function () {
        await data.afterEach();
    });
    it("isMocked", (done) => {
        chai_1.assert.isTrue(mockgoose.helper.isMocked());
        done();
    });
    context("findDepartmentByApiKey", function () {
        it("gets department from database", async function (done) {
            const { department: item, cached } = await store.findDepartmentByApiKey(testApiKey);
            chai_1.assert.isObject(item);
            chai_1.assert.isFalse(cached);
        });
        it("gets department from cache", async function () {
            const { cached } = await store.findDepartmentByApiKey(testApiKey);
            chai_1.assert.isFalse(cached, "First call, it is not cached");
            const { department, cached: cached2 } = await store.findDepartmentByApiKey(testApiKey);
            chai_1.assert.isObject(department);
            chai_1.assert.isTrue(cached2, "Second call, it is cached");
        });
        it("gets department from database, when redis is expired", async function (done) {
            // Cache the item to redis
            {
                const { cached } = await store.findDepartmentByApiKey(testApiKey);
                chai_1.assert.isFalse(cached, "First call, it is not cached");
            }
            {
                const { department: item, cached } = await store.findDepartmentByApiKey(testApiKey);
                chai_1.assert.isObject(item);
                chai_1.assert.isTrue(cached, "Second call, it is cached");
            }
            await store.expireDepartmentByApiKey(testApiKey);
            {
                const { department: item, cached } = await store.findDepartmentByApiKey(testApiKey);
                chai_1.assert.isFalse(cached, "Call after expired, it is not cached");
            }
            {
                // Item is cached to redis
                const { department: item, cached } = await store.findDepartmentByApiKey(testApiKey);
                chai_1.assert.isObject(item);
                chai_1.assert.isTrue(cached, "Call again, it is cached");
            }
        });
    });
    context("findSessionByToken", function () {
        it("gets session from database", async function () {
            const { session, user, department, cached } = await store.findSessionByToken(testToken);
            chai_1.assert.isObject(session);
            chai_1.assert.isObject(user);
            chai_1.assert.isObject(department);
            chai_1.assert.isFalse(cached, "Object should not be cached");
        });
        it("gets session from redis", async function () {
            const { cached } = await store.findSessionByToken(testToken);
            chai_1.assert.isFalse(cached);
            const { session, user, department, cached: cached2 } = await store.findSessionByToken(testToken);
            chai_1.assert.isObject(session);
            chai_1.assert.isObject(user);
            chai_1.assert.isObject(department);
            chai_1.assert.isTrue(cached2, "Object should be cached");
        });
        it("gets session from database, when redis is expired", async function () {
            // Cache the item to redis
            {
                const { cached } = await store.findSessionByToken(testToken);
                chai_1.assert.isFalse(cached);
            }
            {
                const { session, user, department, cached } = await store.findSessionByToken(testToken);
                chai_1.assert.isObject(session);
                chai_1.assert.isObject(user);
                chai_1.assert.isObject(department);
                chai_1.assert.isTrue(cached, "Object should be cached");
            }
            await store.expireSessionByToken(testToken);
            {
                // Testing after item is expired
                const { cached } = await store.findSessionByToken(testToken);
                chai_1.assert.isFalse(cached);
            }
            {
                const { session, user, department, cached } = await store.findSessionByToken(testToken);
                chai_1.assert.isObject(session);
                chai_1.assert.isObject(user);
                chai_1.assert.isObject(department);
                chai_1.assert.isTrue(cached, "Object should be cached");
            }
        });
    });
});
//# sourceMappingURL=store.js.map