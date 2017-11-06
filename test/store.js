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

describe("Store", function() {
  beforeEach(function(done) {
    mockgoose.prepareStorage().then(function() {
      mongoose.connect("mongodb://127.0.0.1:27017/TestingDB", {
        useMongoClient: true // this option silents the warning, but does not cleanup the data
      }, function(err) {
        prepareTestData(function() {
          done(err);
        });
      });
    });
  });

  afterEach(function(done) {
    mockgoose.helper.reset().then(function() {
      redisClient.flushall(function() {
        done();
      });
    });
  });

  it("isMocked", (done) => {
    assert.isTrue(mockgoose.helper.isMocked());
    done();
  });

  it("gets department from database", function(done) {
    return store.findDepartmentByApiKey(testApiKey, function(err, item, cached) {
      assert.isNull(err);
      assert.isObject(item);
      assert.isFalse(cached);
      return done();
    });
  });

  it("gets department from cache", function(done) {
    return store.findDepartmentByApiKey(testApiKey, function(err, item, cached) {
      assert.isNull(err);
      assert.isFalse(cached, "First call, it is not cached");

      return store.findDepartmentByApiKey(testApiKey, function(err, item, cached) {
        assert.isNull(err);
        assert.isObject(item);
        assert.isTrue(cached, "Second call, it is cached");
        return done();
      });
    });
  });

  it("gets department from database, when redis is expired", function(done) {
    // Cache the item to redis
    return store.findDepartmentByApiKey(testApiKey, function(err, item, cached) {
      assert.isNull(err);
      assert.isFalse(cached, "First call, it is not cached");

      // Item is cached to redis
      return store.findDepartmentByApiKey(testApiKey, function(err, item, cached) {
        assert.isNull(err);
        assert.isObject(item);
        assert.isTrue(cached, "Second call, it is cached");

        return store.expireDepartmentByApiKey(testApiKey, function(err, item) {
          assert.isNull(err);

          return store.findDepartmentByApiKey(testApiKey, function(err, item, cached) {
            assert.isNull(err);
            assert.isFalse(cached, "Call after expired, it is not cached");

            // Item is cached to redis
            return store.findDepartmentByApiKey(testApiKey, function(err, item, cached) {
              assert.isNull(err);
              assert.isObject(item);
              assert.isTrue(cached, "Call again, it is cached");

              return done();
            });
          });
        });
      });
    });

  });
});
