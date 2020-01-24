"use strict";

// cSpell:words mockgoose tabletcommand backend signup apikey fdid flushall

module.exports = function(mockgoose, mongoose, models, redisClient) {
  const apiKey = "secretapikey1990";
  const personnelApiKey = "secretpersonnelapikey2299";
  const departmentId = "5195426cc4e016a988000965";
  const d = {
    "_id": departmentId,
    "department": "Test Department",
    "signupDomains": [],
    "signupKey": "abcd",
    "incidentTypes": [],
    "rtsAuthKey": "rtsAuthKey123",
    "rtsChannelPrefix": "rtsChannelPrefix123",
    "rtsEnabled": true,
    "pushEnabled": true,
    "heartbeatEnabled": true,
    "cadBidirectionalEnabled": true,
    "cadMonitorMinutes": 30,
    "cadMonitorEnabled": false,
    "cadEmailUsername": "",
    "apikey": apiKey,
    "agencies": [
      // TODO: Currently, the models do not save this item. Need to update models to nwer version.
      {
        name: "Tablet Command",
        code: "TC",
        personnelApiKey: personnelApiKey
      }
    ],
    "active": true,
    "modified_unix_date": 1492743603.514,
    "state": "CO",
    "city": "Denver",
    "fdid": "06905",
    "uuid": "e4c5873c-1684-47a9-ad2d-81ded6e7ac15",
    "modified_date": "2017-04-21T03:00:03.514"
  };

  const userId = "535633c3c0384d0000002082";
  const token = "10b73460-90cd-4191-b27f-27e89067d8f5";
  const s = {
    "_id": token,
    "nick": "test",
    "email": "test@example.com",
    "user": userId,
    "when": "2017-11-03T04:57:06.596Z",
    "active": true,
    "token": token,
    "departmentId": departmentId
  };

  const u = {
    "_id": userId,
    "nick": "test",
    "email": "test@example.com",
    "name": "Test (Tablet Command)",
    "active": true,
    "when": "2014-04-22T09:17:54.783Z",
    "departmentId": departmentId,
    "salt": "salt",
    "pass": "password",
    "admin": true,
    "mapHidden": false,
    "mapId": "TEST",
    "rtsAuthKey": "abc1234AuthKey",
    "outsider": true,
    "remoteLoggingEnabled": false,
    "isPro": true
  };

  async function prepareTestData(models) {
    let testDepartment = models.Department(d);
    await testDepartment.save();

    let testSession = models.Session(s);
    await testSession.save();

    let testUser = models.User(u);
    await testUser.save();
  }

  const afterEach = async function afterEach() {
    await mockgoose.helper.reset();
    await new Promise((resolve, reject) => redisClient.flushall(() => resolve()));
  };

  const beforeEach = async function beforeEach() {
    await mongoose.connection.db.dropDatabase();
    await mockgoose.prepareStorage();
    await prepareTestData(models);
  };

  return {
    apiKey: apiKey,
    personnelApiKey: personnelApiKey,
    token: token,
    department: d,
    session: s,
    user: u,

    prepareTestData: prepareTestData,
    beforeEach: beforeEach,
    afterEach: afterEach
  };
};
