"use strict";

// cSpell:words mockgoose tabletcommand backend signup apikey fdid flushall

module.exports = function(mockgoose, mongoose, models, redisClient) {
  const apiKey = "secretapikey1990";
  const d = {
    "_id": mongoose.Types.ObjectId(),
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
    "active": true,
    "modified_unix_date": 1492743603.514,
    "state": "CO",
    "city": "Denver",
    "fdid": "06905",
    "uuid": "e4c5873c-1684-47a9-ad2d-81ded6e7ac15",
    "modified_date": "2017-04-21T03:00:03.514"
  };

  const prepareTestData = function prepareTestData(callback) {
    let testDepartment = models.Department(d);
    testDepartment.save(function(err, result) {
      return callback(err, result);
    });
  };

  const afterEach = function afterEach(callback) {
    mockgoose.helper.reset().then(function() {
      redisClient.flushall(function() {
        callback();
      });
    });
  };

  const beforeEach = function beforeEach(callback) {
    mockgoose.prepareStorage().then(function() {
      mongoose.connect("mongodb://127.0.0.1:27017/TestingDB", {
        useMongoClient: true // this option silents the warning, but does not cleanup the data
      }, function(err) {
        prepareTestData(function() {
          callback(err);
        });
      });
    });
  };

  return {
    apiKey: apiKey,
    department: d,
    prepareTestData: prepareTestData,
    beforeEach: beforeEach,
    afterEach: afterEach
  };
};
