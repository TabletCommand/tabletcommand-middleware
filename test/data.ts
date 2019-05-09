"use strict";

import { Department, BackendModels, MongooseModule, User } from "tabletcommand-backend-models";
import { RedisClient } from "redis";
import { SimpleCallback } from "../src/types";
import { Mockgoose } from 'mockgoose'

// cSpell:words mockgoose tabletcommand backend signup apikey fdid flushall

export function data(mockgoose: Mockgoose, mongoose: MongooseModule, models: BackendModels, redisClient: RedisClient) {
  const apiKey = "secretapikey1990";
  const departmentId = "5195426cc4e016a988000965";
  const d: Partial<Department> = {
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
    "active": true,
    "modified_unix_date": 1492743603.514,
    "state": "CO",
    "city": "Denver",
    "fdid": "06905",
    "uuid": "e4c5873c-1684-47a9-ad2d-81ded6e7ac15",
    // "modified_date": "2017-04-21T03:00:03.514"
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

  const prepareTestData = function prepareTestData(callback: SimpleCallback<User>) {
    let testDepartment = new models.Department(d);
    testDepartment.save(function(err, result) {
      if (err) {
        return callback(err);
      }

      let testSession = new models.Session(s);
      testSession.save(function(err, result) {
        if (err) {
          return callback(err);
        }

        let testUser = new models.User(u);
        testUser.save(function(err, result) {
          return callback(err, result);
        });
      });
    });
  };

  const afterEach = function afterEach(callback: SimpleCallback<unknown>) {
    mockgoose.helper.reset().then(function() {
      redisClient.flushall(function() {
        callback(undefined);
      });
    });
  };

  const beforeEach = function beforeEach(callback: SimpleCallback<unknown>) {
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
    token: token,
    department: d,
    session: s,
    user: u,

    prepareTestData: prepareTestData,
    beforeEach: beforeEach,
    afterEach: afterEach
  };
};
export default data;