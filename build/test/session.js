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
const session_1 = __importDefault(require("../lib/session"));
const bluebird_1 = __importDefault(require("bluebird"));
mongoose_1.default.Promise = bluebird_1.default;
const tabletcommand_backend_models_1 = require("tabletcommand-backend-models");
const mockgoose_1 = require("mockgoose");
const config_1 = require("../config");
const mockgoose = new mockgoose_1.Mockgoose(mongoose_1.default);
describe("Session", function () {
    let models;
    let store;
    let data;
    let session;
    let testApiKey;
    let testToken;
    before(async () => {
        models = (await tabletcommand_backend_models_1.connect(config_1.db)).models;
        store = store_1.default(models.Department, models.Session, models.User, redis_js_1.default);
        data = data_1.default(mockgoose, mongoose_1.default, models, redis_js_1.default);
        testApiKey = data.apiKey;
        testToken = data.token;
        session = session_1.default(store);
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
    context("detectApiKey", function () {
        it("resolved from headers 1/2", function (done) {
            const fakeHeaders = {
                apikey: testApiKey,
            };
            const foundKey = session.detectApiKey(fakeHeaders, null);
            chai_1.assert.equal(testApiKey, foundKey);
            done();
        });
        it("resolved from headers 2/2", function (done) {
            const fakeHeaders = {
                apiKey: testApiKey,
            };
            const foundKey = session.detectApiKey(fakeHeaders, null);
            chai_1.assert.equal(testApiKey, foundKey);
            done();
        });
        it("resolved from query 1/2", function (done) {
            const fakeQuery = {
                apikey: testApiKey,
            };
            const foundKey = session.detectApiKey(null, fakeQuery);
            chai_1.assert.equal(testApiKey, foundKey);
            done();
        });
        it("resolved from query 2/2", function (done) {
            const fakeQuery = {
                apiKey: testApiKey,
            };
            const foundKey = session.detectApiKey(null, fakeQuery);
            chai_1.assert.equal(testApiKey, foundKey);
            done();
        });
    });
    context("authByApiKey", function () {
        it("not resolved if no api key is present", async function () {
            const fakeReq = {};
            const fakeRes = {};
            const department = await session.authByApiKey(fakeReq, fakeRes);
            chai_1.assert.isNull(department);
            chai_1.assert.isNotObject(fakeReq.department);
        });
        it("not resolved if invalid api key", async function () {
            const fakeReq = {
                headers: {
                    apikey: "abc",
                },
            };
            const fakeRes = {};
            const department = await session.authByApiKey(fakeReq, fakeRes);
            chai_1.assert.isNull(department);
            chai_1.assert.isNotObject(fakeReq.department);
        });
        it("resolved with correct api key", async function () {
            const fakeReq = {
                headers: {
                    apikey: testApiKey,
                },
            };
            const fakeRes = {};
            const department = await session.authByApiKey(fakeReq, fakeRes);
            chai_1.assert.isObject(department);
            chai_1.assert.isObject(fakeReq.department);
            chai_1.assert.deepEqual(department, fakeReq.department);
            chai_1.assert.equal(data.department.apikey, department.apikey);
        });
    });
    context("detectCookieSession", function () {
        it("not resolved if no token is present", function (done) {
            const cookies = {};
            const foundSession = session.detectCookieSession(cookies);
            chai_1.assert.equal(foundSession, "");
            done();
        });
        it("resolved if token is present", function (done) {
            const testSession = "helloworld";
            const sessionName = session.sessionCookieName;
            const cookies = {
                [sessionName]: testSession,
            };
            const foundSession = session.detectCookieSession(cookies);
            chai_1.assert.equal(foundSession, testSession);
            done();
        });
    });
    context("authBySenecaCookie", function () {
        it("not resolved if no session token is present", async function () {
            const fakeReq = {};
            const fakeRes = {};
            const { session: sess, user, department } = await session.authBySenecaCookie(fakeReq, fakeRes);
            chai_1.assert.isNull(sess);
            chai_1.assert.isNull(user);
            chai_1.assert.isNull(department);
            chai_1.assert.isNotObject(fakeReq.session);
            chai_1.assert.isNotObject(fakeReq.user);
            chai_1.assert.isNotObject(fakeReq.department);
        });
        it("not resolved if invalid session token", async function () {
            const cookies = {
                [session.sessionCookieName]: "abcd",
            };
            const fakeReq = {
                cookies,
            };
            const fakeRes = {};
            const { session: sess, user, department } = await session.authBySenecaCookie(fakeReq, fakeRes);
            chai_1.assert.isNull(sess);
            chai_1.assert.isNull(user);
            chai_1.assert.isNull(department);
            chai_1.assert.isNotObject(fakeReq.session);
            chai_1.assert.isNotObject(fakeReq.user);
            chai_1.assert.isNotObject(fakeReq.department);
        });
        it("resolved with correct session token", async function () {
            const cookies = {
                [session.sessionCookieName]: testToken,
            };
            const fakeReq = {
                cookies,
            };
            const fakeRes = {};
            const { session: sess, user, department } = await session.authBySenecaCookie(fakeReq, fakeRes);
            chai_1.assert.isObject(sess);
            chai_1.assert.isObject(user);
            chai_1.assert.isObject(department);
            chai_1.assert.isObject(fakeReq.session);
            chai_1.assert.isObject(fakeReq.login);
            chai_1.assert.isObject(fakeReq.user);
            chai_1.assert.isObject(fakeReq.department);
            chai_1.assert.equal(data.session.token, testToken);
            chai_1.assert.equal(data.user._id, user._id);
            chai_1.assert.equal(data.department._id, department._id);
        });
    });
});
//# sourceMappingURL=session.js.map