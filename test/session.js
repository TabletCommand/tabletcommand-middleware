"use strict";

// cSpell:words mockgoose tabletcommand backend apikey

const assert = require("chai").assert;

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
const models = require("tabletcommand-backend-models");

let Mockgoose = require("mockgoose").Mockgoose;
let mockgoose = new Mockgoose(mongoose);

const redisClient = require("redis-js");

const store = require("../lib/store")(models.Department, models.Session, models.User, redisClient);
const data = require("./data")(mockgoose, mongoose, models, redisClient);
const testApiKey = data.apiKey;

const session = require("../lib/session")(store);

describe("Session", function() {
  beforeEach(function(done) {
    data.beforeEach(done);
  });

  afterEach(function(done) {
    data.afterEach(done);
  });

  it("isMocked", (done) => {
    assert.isTrue(mockgoose.helper.isMocked());
    done();
  });

  context("detectApiKey", function() {
    it("resolved from headers 1/2", function(done) {
      const fakeHeaders = {
        apikey: testApiKey
      };
      session.detectApiKey(fakeHeaders, null, function(foundKey) {
        assert.equal(testApiKey, foundKey);
        done();
      });
    });

    it("resolved from headers 2/2", function(done) {
      const fakeHeaders = {
        apiKey: testApiKey
      };
      session.detectApiKey(fakeHeaders, null, function(foundKey) {
        assert.equal(testApiKey, foundKey);
        done();
      });
    });

    it("resolved from query 1/2", function(done) {
      const fakeQuery = {
        apikey: testApiKey
      };
      session.detectApiKey(null, fakeQuery, function(foundKey) {
        assert.equal(testApiKey, foundKey);
        done();
      });
    });

    it("resolved from query 2/2", function(done) {
      const fakeQuery = {
        apiKey: testApiKey
      };
      session.detectApiKey(null, fakeQuery, function(foundKey) {
        assert.equal(testApiKey, foundKey);
        done();
      });
    });
  });

  context("authByApiKey", function() {
    it("not resolved if no api key is present", function(done) {
      let fakeReq = {};
      let fakeRes = {};
      session.authByApiKey(fakeReq, fakeRes, function(err, department) {
        assert.isNull(err);
        assert.isNull(department);
        assert.isNotObject(fakeReq.department);
        done();
      });
    });

    it("not resolved if invalid api key", function(done) {
      let fakeReq = {
        headers: {
          apikey: "abc"
        }
      };
      let fakeRes = {};
      session.authByApiKey(fakeReq, fakeRes, function(err, department) {
        assert.isNull(err);
        assert.isNull(department);
        assert.isNotObject(fakeReq.department);
        done();
      });
    });

    it("resolved with correct api key", function(done) {
      let fakeReq = {
        headers: {
          apikey: testApiKey
        }
      };
      let fakeRes = {};
      session.authByApiKey(fakeReq, fakeRes, function(err, department) {
        assert.isNull(err);
        assert.isObject(department);
        assert.isObject(fakeReq.department);
        assert.deepEqual(department, fakeReq.department);
        assert.equal(data.department.apikey, department.apikey);
        done();
      });
    });
  });

  context("detectCookieSession", function() {
    it("not resolved if no token is present", function(done) {
      const cookies = {};
      session.detectCookieSession(cookies, function(foundSession) {
        assert.equal(foundSession, "");
        done();
      });
    });

    it("resolved if token is present", function(done) {
      const testSession = "helloworld";
      const cookies = {
        "seneca-login": testSession
      };
      session.detectCookieSession(cookies, function(foundSession) {
        assert.equal(foundSession, testSession);
        done();
      });
    });
  });
});
