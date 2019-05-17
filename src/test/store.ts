"use strict";
import { assert } from "chai";

import mongoose from "mongoose";
import redisClient from "redis-js";
import storeModule from "../lib/store";
import dataModule from './data';
import bluebird from 'bluebird';

mongoose.Promise = bluebird;
import { connect, BackendModels } from "tabletcommand-backend-models";
import { db } from "../config";
import { Mockgoose } from "mockgoose";
const mockgoose = new Mockgoose(mongoose);

describe("Store", function() {
  let models: BackendModels;
  let store: ReturnType<typeof storeModule> ;
  let data: ReturnType<typeof dataModule>;

  const testApiKey = data.apiKey;
  const testToken = data.token;

  before(async () => {
    models = (await connect(db)).models;
    store = storeModule(models.Department, models.Session, models.User, redisClient);
    data = dataModule(mockgoose, mongoose, models, redisClient);
  });
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

  context("findDepartmentByApiKey", function() {
    it("gets department from database", async function(done) {
      const { department: item, cached } = await store.findDepartmentByApiKey(testApiKey);

      assert.isObject(item);
      assert.isFalse(cached);
    });

    it("gets department from cache", async function() {
      const { cached } = await store.findDepartmentByApiKey(testApiKey);
      assert.isFalse(cached, "First call, it is not cached");

      const { department, cached: cached2 } = await store.findDepartmentByApiKey(testApiKey);

      assert.isObject(department);
      assert.isTrue(cached2, "Second call, it is cached");
    });

    it("gets department from database, when redis is expired", async function(done) {
      // Cache the item to redis
      {
        const { cached } = await store.findDepartmentByApiKey(testApiKey);
        assert.isFalse(cached, "First call, it is not cached");
      }
      {
        const { department: item, cached } = await store.findDepartmentByApiKey(testApiKey);

        assert.isObject(item);
        assert.isTrue(cached, "Second call, it is cached");
      }
      await store.expireDepartmentByApiKey(testApiKey);
      {
        const { department: item, cached } = await store.findDepartmentByApiKey(testApiKey);
        assert.isFalse(cached, "Call after expired, it is not cached");
      }
      {
        // Item is cached to redis
        const { department: item, cached } = await store.findDepartmentByApiKey(testApiKey);
        assert.isObject(item);
        assert.isTrue(cached, "Call again, it is cached");
      }
    });
  });

  context("findSessionByToken", function() {
    it("gets session from database", async function() {
      const { session, user, department, cached } = await store.findSessionByToken(testToken);
      assert.isObject(session);
      assert.isObject(user);
      assert.isObject(department);
      assert.isFalse(cached, "Object should not be cached");
    });

    it("gets session from redis", async function() {
      const { cached } = await store.findSessionByToken(testToken);
      assert.isFalse(cached);

      const { session, user, department, cached: cached2 } = await store.findSessionByToken(testToken);
      assert.isObject(session);
      assert.isObject(user);
      assert.isObject(department);
      assert.isTrue(cached2, "Object should be cached");
    });

    it("gets session from database, when redis is expired", async function() {
      // Cache the item to redis
      {
        const { cached } = await store.findSessionByToken(testToken);
        assert.isFalse(cached);
      }
      {
        const { session, user, department, cached } = await store.findSessionByToken(testToken);
        assert.isObject(session);
        assert.isObject(user);
        assert.isObject(department);
        assert.isTrue(cached, "Object should be cached");
      }
      await store.expireSessionByToken(testToken);
      {
          // Testing after item is expired
          const { cached } = await store.findSessionByToken(testToken);
          assert.isFalse(cached);
      }
      {
          const { session, user, department, cached } = await store.findSessionByToken(testToken);
          assert.isObject(session);
          assert.isObject(user);
          assert.isObject(department);
          assert.isTrue(cached, "Object should be cached");
      }
    });
  });
});
