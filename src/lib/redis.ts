import _ from "lodash";
import moment from "moment-timezone";

import * as helpers from "./helpers";
import redis, { RedisClient } from "redis";
import { Department, Location, FieldsOfDocument } from "tabletcommand-backend-models";
import { SimpleCallback } from "../types/types";

export function client(config: { redis: string; }) {
  return redis.createClient(config.redis);
}

function keyForDepartment(department: Department, prefix: string, callback: SimpleCallback<string>) {
  let key = prefix + ":";

  if (_.isString(department.id)) {
    key = key + department.id;
  } else if (_.isString(department._id)) {
    key = key + department._id;
  } else {
    key = key + "unknown";
  }

  return callback(null, key);
}

function retrieveItems(client: RedisClient, keys: string[], callback: SimpleCallback<string[]>) {
  if (!_.isArray(keys) || _.size(keys) === 0) {
    return callback(null, []);
  }

  const validKeys = _.filter(keys, function(k) {
    return _.isString(k) && k.length > 0;
  });

  function processKeysList(client: RedisClient, items: string[], index: number, resolved: string[], callback: SimpleCallback<string[]>): boolean {
    if (index >= _.size(items)) {
      callback(null, resolved);
    }

    const key = items[index];
    return client.get(key, function(err, object) {
      if (err) {
        return callback(err, []);
      }
      const resolvedX = _.clone(resolved);
      if (!_.isNull(object) && !_.isUndefined(object)) {
        resolvedX.push(object);
      }
      return processKeysList(client, items, index + 1, resolvedX, callback);
    });
  }

  return processKeysList(client, validKeys, 0, [], callback);
}

function prepareLocationItem(item: Location, callback: (err: Error, key?: string, val?: string, ttl?: number) => void) {
  if (!_.isString(item.departmentId) || item.departmentId.length === 0) {
    return callback(new Error(`Invalid departmentId ${item}`));
  }

  if (!_.isString(item.userId) || item.userId.length === 0) {
    return callback(new Error(`Invalid userId ${item}`));
  }

  const ttl = 60 * 60 * 24; // 24h
  const departmentId = item.departmentId;
  const userId = item.userId;

  const key = "l:" + departmentId + ":" + userId;
  const object = {
    lat: item.location.latitude,
    lon: item.location.longitude,
    type: item.device_type,
    username: item.username,
    active: helpers.itemIsTrue(item, "active"),
    uuid: item.uuid,
    id: item._id,
    userId: item.userId,
    t: item.modified_unix_date,
  };
  const val = JSON.stringify(object);

  return callback(null, key, val, ttl);
}

interface PackedLocation {
  lat: number;
  lon: number;
  type: string;
  username: string;
  active: boolean;
  uuid: string;
  userId: string;
  t: number;
}
function expandLocation(item: PackedLocation): Partial<FieldsOfDocument<Location>> {
  return {
    location: {
      latitude: item.lat,
      longitude: item.lon,
    },
    device_type: item.type,
    username: item.username,
    active: item.active,
    uuid: item.uuid,
    userId: item.userId,
    modified_unix_date: item.t,
  };
}

export function listLocation(client: RedisClient, department: Department, callback: SimpleCallback<Array<Partial<FieldsOfDocument<Location>>>>) {
  let departmentId = "";
  if (_.isString(department._id)) {
    departmentId = department._id;
  } else if (_.isObject(department._id)) {
    departmentId = department._id.toString();
  } else if (_.isString(department.id)) {
    departmentId = department.id;
  } else if (_.isObject(department.id)) {
    departmentId = department.id.toString();
  }

  if (!_.isString(departmentId) || departmentId.length === 0) {
    return callback(new Error(`Invalid departmentId ${departmentId}`));
  }

  const cursor = "0";
  const match = "l:" + departmentId + ":*";
  const count = "1000";

  return client.scan(cursor, "MATCH", match, "COUNT", count, function(err, result) {
    if (err) {
      return callback(err);
    }
    return retrieveItems(client, result[1], function(err, items) {
      const unpackResults = _.map(items, function(i) {
        try {
          const out: Partial<FieldsOfDocument<Location>>  = expandLocation(JSON.parse(i));
          out.departmentId = departmentId;
          return out;
        } catch (err) {
          return null;
        }
      });
      const validResults = _.filter(unpackResults, function(i) {
        return _.isObject(i) && _.size(i) > 0;
      });
      return callback(err, validResults);
    });
  });
}

export function storeLocation(client: RedisClient, item: Location, callback: SimpleCallback<"OK">) {
  return prepareLocationItem(item, function(err, key, val, ttl) {
    if (err) {
      return callback(err);
    }

    return client.set(key, val, "EX", ttl, function(err, result) {
      if (err) {
        console.log("Set key Err", err, "key", key, "value", val);
      }
      process.stdout.write(".");
      return callback(err, result);
    });
  });
}

function prepareDebugInfoItem(item: Location, callback: (err: Error, key?: string, val?: string, ttl?: number) => void) {
  if (!_.isString(item.departmentId) || item.departmentId.length === 0) {
    return callback(new Error(`Invalid departmentId: ${item}`));
  }

  if (!_.isString(item.userId) || item.userId.length === 0) {
    return callback(new Error(`Invalid userId: ${item}`));
  }

  if (!_.isString(item.session) || item.session.length === 0) {
    return callback(new Error(`Invalid session ${item}`));
  }

  const ttl = 60 * 60 * 24 * 14; // 14d
  const departmentId = item.departmentId;
  const userId = item.userId;
  const session = item.session;

  const key = "info:" + departmentId + ":" + userId + ":" + session;

  const props = ["nick", "appVer", "osVer", "ua", "t", "userId", "departmentId"];
  const object = _.pick(item, props);
  const val = JSON.stringify(object);

  return callback(null, key, val, ttl);
}

export function storeDebugInfo(client: RedisClient, item: Location, callback: SimpleCallback<"OK">) {
  return prepareDebugInfoItem(item, function(err, key, val, ttl) {
    if (err) {
      return callback(err);
    }

    return client.set(key, val, "EX", ttl, function(err, result) {
      if (err) {
        console.log("Set key Err", err, "key", key, "value", val);
      }
      return callback(err, result);
    });
  });
}

export function checkOnline(client: RedisClient, department: Department, callback: SimpleCallback<any[]>) {
  return keyForDepartment(department, "info", function(err, key) {
    if (err) {
      return callback(err);
    }
    return client.keys(key + ":*", function(err, keys) {
      if (_.size(keys) === 0) {
        return callback(err, []);
      }

      return client.mget(keys, function(err, items) {
        const unpacked = _.map(items, function(item) {
          try {
            const o = JSON.parse(item);
            o.department = department.department;
            return o;
          } catch (e) {
            return null;
          }
        });
        const valid = _.filter(unpacked, function(item) {
          return _.isObject(item);
        });
        return callback(err, valid);
      });
    });
  });
}

export function expireItemsMatchingKey(client: RedisClient, keyPattern: string, seconds: number, callback: SimpleCallback<string[]>) {
  return client.keys(keyPattern, function(err, keys) {
    if (_.size(keys) === 0) {
      return callback(err, []);
    }

    function processExpire(items: string[], index: number, callback: SimpleCallback<string[]>): boolean {
      if (index >= _.size(items)) {
        callback(null);
        return false;
      }

      const key = items[index];
      return client.expire(key, seconds, function(err, result) {
        if (err) {
          return callback(err);
        }
        return processExpire(items, index + 1, callback);
      });
    }

    return processExpire(keys, 0, callback);
  });
}

export function storeAPNInfo(client: RedisClient, item: APNItem, callback: SimpleCallback<number>) {
  return prepareStoreAPNInfoItem(item, function(err, key, val, ttl) {
    if (err) {
      return callback(err, null);
    }
    return client.incr(key, function(err, result) {
      if (err) {
        return callback(err);
      }
      return client.expire(key, ttl, function(err, result) {
        return callback(err, result);
      });
    });
  });
}
interface APNItem { time: number; departmentId: string; }
function prepareStoreAPNInfoItem(item: APNItem, callback: (err: Error, key?: string, value?: number, ttl?: number) => void) {
  // INCR apn:deptId:unixTime

  if (!_.isFinite(item.time)) {
    return callback(new Error(`Invalid time: ${item}`));
  }

  if (!_.isString(item.departmentId)) {
    return callback(new Error(`Invalid departmentId: ${item}`));
  }

  const ttl = 60 * 61; // 61 minutes
  const departmentId = item.departmentId;
  const unixTime = moment.unix(item.time).unix();
  const key = "apn:" + departmentId + ":" + unixTime;
  const value = 1;
  return callback(null, key, value, ttl);
}

function apnInfoMixin(keys: string[], values: string[], callback: SimpleCallback<Array<{ time: number, value: number }>>) {
  const grouped: Record<string, number> = {};
  _.each(_.zipObject(keys, values), function(value, key) {
    const v = parseInt(value);
    if (!_.isFinite(v)) {
      return;
    }

    if (!_.isString(key)) {
      return;
    }

    const parts = key.split(":");
    if (!_.isString(parts[1]) || !_.isFinite(parseInt(parts[2]))) {
      return;
    }

    const t = parseInt(parts[2]);

    if (!_.has(grouped, t)) {
      grouped[t] = 0;
    }
    grouped[t] = grouped[t] + v;
  });

  const simplified = _.map(grouped, function(value, time) {
    return {
      time: parseInt(time),
      value,
    };
  });

  const sorted = _.sortBy(simplified, "time");
  return callback(null, sorted);
}

export function getAPNInfo(client: RedisClient, department: Department, callback: SimpleCallback<Array<{ time: number; value: number; }>>) {
  return client.keys("apn:*", function(err, keys) {
    const validKeys = _.filter(keys, function(key) {
      if (department) {
        let departmentId = "xoxo";
        if (_.isString(department._id)) {
          departmentId = department._id;
        } else if (_.isObject(department._id)) {
          departmentId = department._id.toString();
        } else if (_.isString(department.id)) {
          departmentId = department.id;
        } else if (_.isObject(department.id)) {
          departmentId = department.id.toString();
        }

        return key.indexOf(departmentId) !== -1;
      }

      return true;
    });

    if (_.size(validKeys) === 0) {
      return callback(err, []);
    }

    return client.mget(validKeys, function(err, validValues) {
      if (err) {
        return callback(err, []);
      }
      return apnInfoMixin(validKeys, validValues, function(err, items) {
        return callback(err, items);
      });
    });
  });
}
