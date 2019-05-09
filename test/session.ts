import { assert } from "chai";
import express from "express";

import mongoose from "mongoose";
import redisClient from "redis-js";
import storeModule from "../src/lib/store"
import dataModule from './data';
import sessionModule from '../src/lib/session'

mongoose.Promise = require("bluebird");
const models = require("tabletcommand-backend-models");

let Mockgoose = require("mockgoose").Mockgoose;
let mockgoose = new Mockgoose(mongoose);

const store = storeModule(models.Department, models.Session, models.User, redisClient);
const data = dataModule(mockgoose, mongoose, models, redisClient);

const testApiKey = data.apiKey;
const testToken = data.token;

const session = sessionModule(store);

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
      const foundKey = session.detectApiKey(fakeHeaders, null);
      assert.equal(testApiKey, foundKey);
      done();
    });

    it("resolved from headers 2/2", function(done) {
      const fakeHeaders = {
        apiKey: testApiKey
      };
      const foundKey = session.detectApiKey(fakeHeaders, null);
      assert.equal(testApiKey, foundKey);
      done();
    });

    it("resolved from query 1/2", function(done) {
      const fakeQuery = {
        apikey: testApiKey
      };
      const foundKey = session.detectApiKey(null, fakeQuery);
      assert.equal(testApiKey, foundKey);
      done();
    });

    it("resolved from query 2/2", function(done) {
      const fakeQuery = {
        apiKey: testApiKey
      };
      const foundKey = session.detectApiKey(null, fakeQuery);
      assert.equal(testApiKey, foundKey);
      done();
    });
  });

  context("authByApiKey", function() {
    it("not resolved if no api key is present", function(done) {
      let fakeReq = {} as express.Request;;
      let fakeRes = {} as express.Response;
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
      } as unknown as express.Request;;
      let fakeRes = {} as express.Response;
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
      } as unknown as express.Request;
      let fakeRes = {} as express.Response;
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
      const foundSession = session.detectCookieSession(cookies)
      assert.equal(foundSession, "");
      done();
    });

    it("resolved if token is present", function(done) {
      const testSession = "helloworld";
      const sessionName = session.sessionCookieName;
      let cookies = {
        [sessionName]: testSession
      };
      const foundSession = session.detectCookieSession(cookies);
      assert.equal(foundSession, testSession);
      done();
    });
  });

  context("authBySenecaCookie", function() {
    it("not resolved if no session token is present", function(done) {
      let fakeReq = {} as express.Request;
      let fakeRes = {} as express.Response;
      session.authBySenecaCookie(fakeReq, fakeRes, function(err, session, user, department) {
        assert.isNull(err);
        assert.isNull(session);
        assert.isNull(user);
        assert.isNull(department);
        assert.isNotObject(fakeReq.session);
        assert.isNotObject(fakeReq.user);
        assert.isNotObject(fakeReq.department);
        done();
      });
    });

    it("not resolved if invalid session token", function(done) {
      let cookies = {
        [session.sessionCookieName]: "abcd"
      };
      let fakeReq = {
        cookies: cookies
      } as unknown as express.Request;
      let fakeRes = {} as express.Response;
      session.authBySenecaCookie(fakeReq, fakeRes, function(err, session, user, department) {
        assert.isNull(err);
        assert.isNull(session);
        assert.isNull(user);
        assert.isNull(department);
        assert.isNotObject(fakeReq.session);
        assert.isNotObject(fakeReq.user);
        assert.isNotObject(fakeReq.department);
        done();
      });
    });

    it("resolved with correct session token", function(done) {
      let cookies = {
        [session.sessionCookieName]: testToken
      };
      let fakeReq = {
        cookies: cookies
      } as unknown as express.Request;
      let fakeRes = {} as express.Response;
      session.authBySenecaCookie(fakeReq, fakeRes, function(err, session, user, department) {
        assert.isNull(err);
        assert.isObject(session);
        assert.isObject(user);
        assert.isObject(department);
        assert.isObject(fakeReq.session);
        assert.isObject((fakeReq as any).login);
        assert.isObject(fakeReq.user);
        assert.isObject(fakeReq.department);
        assert.equal(data.session.token, testToken);
        assert.equal(data.user._id, user._id);
        assert.equal(data.department._id, department._id);
        done();
      });
    });
  });
});
