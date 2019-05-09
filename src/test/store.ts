"use strict";
import { assert } from "chai";

import mongoose from "mongoose";
import redisClient from "redis-js";
import storeModule from "../lib/store"
import dataModule from './data';

mongoose.Promise = require("bluebird");
import { connect, BackendModels } from "tabletcommand-backend-models";
import { db } from "../config"
import { Mockgoose } from "mockgoose";
let mockgoose = new Mockgoose(mongoose);

describe("Store", function() {
  let models : BackendModels;
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

  context("findSessionByToken", function() {
    it("gets session from database", function(done) {
      return store.findSessionByToken(testToken, function(err, session, user, department, cached) {
        assert.isNull(err);
        assert.isObject(session);
        assert.isObject(user);
        assert.isObject(department);
        assert.isFalse(cached, "Object should not be cached");
        return done();
      });
    });

    it("gets session from redis", function(done) {
      return store.findSessionByToken(testToken, function(err, session, user, department, cached) {
        assert.isNull(err);
        assert.isFalse(cached);

        return store.findSessionByToken(testToken, function(err, session, user, department, cached) {
          assert.isNull(err);
          assert.isObject(session);
          assert.isObject(user);
          assert.isObject(department);
          assert.isTrue(cached, "Object should be cached");
          return done();
        });
      });
    });

    it("gets session from database, when redis is expired", function(done) {
      // Cache the item to redis
      return store.findSessionByToken(testToken, function(err, session, user, department, cached) {
        assert.isNull(err);
        assert.isFalse(cached);

        return store.findSessionByToken(testToken, function(err, session, user, department, cached) {
          assert.isNull(err);
          assert.isObject(session);
          assert.isObject(user);
          assert.isObject(department);
          assert.isTrue(cached, "Object should be cached");

          return store.expireSessionByToken(testToken, function(err, result) {
            assert.isNull(err);

            // Testing after item is expired
            return store.findSessionByToken(testToken, function(err, session, user, department, cached) {
              assert.isNull(err);
              assert.isFalse(cached);

              return store.findSessionByToken(testToken, function(err, session, user, department, cached) {
                assert.isNull(err);
                assert.isObject(session);
                assert.isObject(user);
                assert.isObject(department);
                assert.isTrue(cached, "Object should be cached");
                return done();
              });
            });
          });
        });
      });
    });
  });
});
