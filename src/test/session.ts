import { assert } from "chai";
import express from "express";

import mongoose from "mongoose";
import redisClient from "redis-js";
import storeModule from "../lib/store";
import dataModule from './data';
import sessionModule from '../lib/session';
import bluebird from 'bluebird';

mongoose.Promise = bluebird;
import { connect, BackendModels } from "tabletcommand-backend-models";

import { Mockgoose } from "mockgoose";
import { db } from '../config';

const mockgoose = new Mockgoose(mongoose);

describe("Session", function() {
  let models: BackendModels;
  let store: ReturnType<typeof storeModule> ;
  let data: ReturnType<typeof dataModule>;
  let session: ReturnType<typeof sessionModule>;

  let testApiKey: string;
  let testToken: string;

  before(async () => {
    models = (await connect(db)).models;
    store = storeModule(models.Department, models.Session, models.User, redisClient);
    data = dataModule(mockgoose, mongoose, models, redisClient);
    testApiKey = data.apiKey;
    testToken = data.token;
    session = sessionModule(store);
  });

  beforeEach(async function() {
    await data.beforeEach();
  });

  afterEach(async function() {
    await data.afterEach();
  });

  it("isMocked", (done) => {
    assert.isTrue(mockgoose.helper.isMocked());
    done();
  });

  context("detectApiKey", function() {
    it("resolved from headers 1/2", function(done) {
      const fakeHeaders = {
        apikey: testApiKey,
      };
      const foundKey = session.detectApiKey(fakeHeaders, null);
      assert.equal(testApiKey, foundKey);
      done();
    });

    it("resolved from headers 2/2", function(done) {
      const fakeHeaders = {
        apiKey: testApiKey,
      };
      const foundKey = session.detectApiKey(fakeHeaders, null);
      assert.equal(testApiKey, foundKey);
      done();
    });

    it("resolved from query 1/2", function(done) {
      const fakeQuery = {
        apikey: testApiKey,
      };
      const foundKey = session.detectApiKey(null, fakeQuery);
      assert.equal(testApiKey, foundKey);
      done();
    });

    it("resolved from query 2/2", function(done) {
      const fakeQuery = {
        apiKey: testApiKey,
      };
      const foundKey = session.detectApiKey(null, fakeQuery);
      assert.equal(testApiKey, foundKey);
      done();
    });
  });

  context("authByApiKey", function() {
    it("not resolved if no api key is present", async function() {
      const fakeReq = {} as express.Request;
      const fakeRes = {} as express.Response;
      const department = await session.authByApiKey(fakeReq, fakeRes);
      assert.isNull(department);
      assert.isNotObject(fakeReq.department);
    });

    it("not resolved if invalid api key", async function() {
      const fakeReq = {
        headers: {
          apikey: "abc",
        },
      } as unknown as express.Request;
      const fakeRes = {} as express.Response;
      const department = await session.authByApiKey(fakeReq, fakeRes);

      assert.isNull(department);
      assert.isNotObject(fakeReq.department);
    });

    it("resolved with correct api key", async function() {
      const fakeReq = {
        headers: {
          apikey: testApiKey,
        },
      } as unknown as express.Request;
      const fakeRes = {} as express.Response;
      const department = await session.authByApiKey(fakeReq, fakeRes);
      assert.isObject(department);
      assert.isObject(fakeReq.department);
      assert.deepEqual(department, fakeReq.department);
      assert.equal(data.department.apikey, department!.apikey);
    });
  });

  context("detectCookieSession", function() {
    it("not resolved if no token is present", function(done) {
      const cookies = {};
      const foundSession = session.detectCookieSession(cookies);
      assert.equal(foundSession, "");
      done();
    });

    it("resolved if token is present", function(done) {
      const testSession = "helloworld";
      const sessionName = session.sessionCookieName;
      const cookies = {
        [sessionName]: testSession,
      };
      const foundSession = session.detectCookieSession(cookies);
      assert.equal(foundSession, testSession);
      done();
    });
  });

  context("authBySenecaCookie", function() {
    it("not resolved if no session token is present", async function() {
      const fakeReq = {} as express.Request;
      const fakeRes = {} as express.Response;
      const { session: sess, user, department } = await session.authBySenecaCookie(fakeReq, fakeRes)!;
      assert.isNull(sess);
      assert.isNull(user);
      assert.isNull(department);
      assert.isNotObject(fakeReq.session);
      assert.isNotObject(fakeReq.user);
      assert.isNotObject(fakeReq.department);
    });

    it("not resolved if invalid session token", async function() {
      const cookies = {
        [session.sessionCookieName]: "abcd",
      };
      const fakeReq = {
        cookies,
      } as unknown as express.Request;
      const fakeRes = {} as express.Response;
      const { session: sess, user, department } = await session.authBySenecaCookie(fakeReq, fakeRes);
      assert.isNull(sess);
      assert.isNull(user);
      assert.isNull(department);
      assert.isNotObject(fakeReq.session);
      assert.isNotObject(fakeReq.user);
      assert.isNotObject(fakeReq.department);
    });

    it("resolved with correct session token", async function() {
      const cookies = {
        [session.sessionCookieName]: testToken,
      };
      const fakeReq = {
        cookies,
      } as unknown as express.Request;
      const fakeRes = {} as express.Response;
      const { session: sess, user, department } = await session.authBySenecaCookie(fakeReq, fakeRes);

      assert.isObject(sess);
      assert.isObject(user);
      assert.isObject(department);
      assert.isObject(fakeReq.session);
      assert.isObject(fakeReq.login);
      assert.isObject(fakeReq.user);
      assert.isObject(fakeReq.department);
      assert.equal(data.session.token, testToken);
      assert.equal(data.user._id, user!._id);
      assert.equal(data.department._id, department!._id);
    });
  });
});