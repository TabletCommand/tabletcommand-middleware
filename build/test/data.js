"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../lib/helpers");
// cSpell:words mockgoose tabletcommand backend signup apikey fdid flushall
function data(mockgoose, mongoose, models, redisClient) {
    const apiKey = "secretapikey1990";
    const departmentId = "5195426cc4e016a988000965";
    const d = {
        _id: departmentId,
        department: "Test Department",
        signupDomains: [],
        signupKey: "abcd",
        incidentTypes: [],
        rtsAuthKey: "rtsAuthKey123",
        rtsChannelPrefix: "rtsChannelPrefix123",
        rtsEnabled: true,
        pushEnabled: true,
        heartbeatEnabled: true,
        cadBidirectionalEnabled: true,
        cadMonitorMinutes: 30,
        cadMonitorEnabled: false,
        cadEmailUsername: "",
        apikey: apiKey,
        active: true,
        modified_unix_date: 1492743603.514,
        state: "CO",
        city: "Denver",
        fdid: "06905",
        uuid: "e4c5873c-1684-47a9-ad2d-81ded6e7ac15",
    };
    const userId = "535633c3c0384d0000002082";
    const token = "10b73460-90cd-4191-b27f-27e89067d8f5";
    const s = {
        _id: token,
        nick: "test",
        email: "test@example.com",
        user: userId,
        when: "2017-11-03T04:57:06.596Z",
        active: true,
        token,
        departmentId,
    };
    const u = {
        _id: userId,
        nick: "test",
        email: "test@example.com",
        name: "Test (Tablet Command)",
        active: true,
        when: "2014-04-22T09:17:54.783Z",
        departmentId,
        salt: "salt",
        pass: "password",
        admin: true,
        mapHidden: false,
        mapId: "TEST",
        rtsAuthKey: "abc1234AuthKey",
        outsider: true,
        remoteLoggingEnabled: false,
        isPro: true,
    };
    const prepareTestData = async function prepareTestData() {
        const testDepartment = new models.Department(d);
        await testDepartment.save();
        const testSession = new models.Session(s);
        await testSession.save();
        const testUser = new models.User(u);
        await testUser.save();
        return testUser;
    };
    const afterEach = async function afterEach() {
        await mockgoose.helper.reset();
        await helpers_1.convertToPromise(cb => redisClient.flushall(cb));
    };
    const beforeEach = async function beforeEach() {
        await mockgoose.prepareStorage();
        await mongoose.connect("mongodb://127.0.0.1:27017/TestingDB", {
            useMongoClient: true,
        });
        await prepareTestData();
    };
    return {
        apiKey,
        token,
        department: d,
        session: s,
        user: u,
        prepareTestData,
        beforeEach,
        afterEach,
    };
}
exports.data = data;
exports.default = data;
//# sourceMappingURL=data.js.map