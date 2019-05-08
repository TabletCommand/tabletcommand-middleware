module.exports = function(client) {
  "use strict";
  // cSpell:words tabletcommand

  const _ = require("lodash");
  const debug = require("debug")("tabletcommand-middleware:store:redis");

  const findDepartmentByApiKey = function findDepartmentByApiKey(apiKey, callback) {
    const key = `api:${apiKey}`;
    debug(`GET ${key}`);
    return client.get(key, function(err, item) {
      if (err) {
        return callback(err, null);
      }

      let object = null;
      try {
        object = JSON.parse(item);
      } catch (e) {}

      return callback(null, object);
    });
  };

  const storeDepartmentByApiKey = function storeDepartmentByApiKey(apiKey, item, callback) {
    const key = `api:${apiKey}`;
    const val = JSON.stringify(item);
    const ttl = 60 * 60 * 24; // 24h
    debug(`SET ${key} ${val} "EX" ${ttl}`);
    return client.set(key, val, "EX", ttl, function(err, result) {
      return callback(err, result);
    });
  };

  const expireDepartmentByApiKey = function expireDepartmentByApiKey(apiKey, callback) {
    const key = `api:${apiKey}`;
    return expireItemByKey(key, callback);
  };

  const expireItemByKey = function expireItemByKey(key, callback) {
    const ttl = 0;
    debug(`EXPIRE ${key} ${ttl}`);
    return client.expire(key, ttl, function(err, result) {
      return callback(err, result);
    });
  };

  const findSessionByToken = function findSessionByToken(token, callback) {
    const key = `s:${token}`;

    debug(`GET ${key}`);
    return client.get(key, function(err, item) {
      if (err) {
        return callback(err, null, null, null);
      }

      let session = null;
      let user = null;
      let department = null;
      try {
        const object = JSON.parse(item);
        if (_.isObject(object.s)) {
          session = object.s;
        }
        if (_.isObject(object.u)) {
          user = object.u;
        }
        if (_.isObject(object.d)) {
          department = object.d;
        }
      } catch (e) {}

      return callback(null, session, user, department);
    });
  };

  const storeSessionByToken = function storeSessionByToken(token, session, user, department, callback) {
    const key = `s:${token}`;
    const item = {
      s: session,
      u: user,
      d: department
    };
    const val = JSON.stringify(item);
    const ttl = 60 * 60 * 12; // 12h
    debug(`SET ${key} ${val} "EX" ${ttl}`);
    return client.set(key, val, "EX", ttl, function(err, result) {
      return callback(err, result);
    });
  };

  const expireSessionByToken = function expireSessionByToken(token, callback) {
    const key = `s:${token}`;
    return expireItemByKey(key, callback);
  };

  return {
    findDepartmentByApiKey: findDepartmentByApiKey,
    storeDepartmentByApiKey: storeDepartmentByApiKey,
    expireDepartmentByApiKey: expireDepartmentByApiKey,

    findSessionByToken: findSessionByToken,
    storeSessionByToken: storeSessionByToken,
    expireSessionByToken: expireSessionByToken
  };
};
