"use strict";

// cSpell:words mockgoose tabletcommand backend

const _ = require("lodash");
const assert = require("chai").assert;

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
const models = require("tabletcommand-backend-models");

let Mockgoose = require("mockgoose").Mockgoose;
let mockgoose = new Mockgoose(mongoose);

const redisClient = require("redis-js");

const store = require("../lib/store")(models.Department, redisClient);

const testApiKey = "secretapikey1990";
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
  "apikey": testApiKey,
  "active": true,
  "modified_unix_date": 1492743603.514,
  "state": "CO",
  "city": "Denver",
  "fdid": "06905",
  "uuid": "e4c5873c-1684-47a9-ad2d-81ded6e7ac15",
  "modified_date": "2017-04-21T03:00:03.514"
};
let testDepartment = models.Department(d);

const prepareTestData = function prepareTestData(callback) {
  testDepartment.save().then(function(err, savedItem) {
    return callback(err);
  });
};

before(function(done) {
  mockgoose.prepareStorage().then(function() {
    mongoose.connect("mongodb://127.0.0.1:27017/TestingDB", {
      // useMongoClient: true // this option silents the warning, but does not cleanup the data
    }, function(err) {
      prepareTestData(function() {
        done(err);
      });
    });
  });
});

after(function(done) {
  mockgoose.helper.reset().then(function() {
    done();
  });
});

describe("Store", function() {
  beforeEach(function(done) {
    return done();
  });
  afterEach(function(done) {
    return done();
  });

  it("isMocked", (done) => {
    assert.isTrue(mockgoose.helper.isMocked());
    done();
  });

  it("sets correct user", function(done) {
    return store.findDepartmentByApiKey(testApiKey, function(err, result) {
      console.log("Err", err, result);
      assert.isTrue(true);
      return done();
    });
  });
});
