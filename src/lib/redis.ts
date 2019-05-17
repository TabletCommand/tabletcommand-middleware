import _ from "lodash";
import moment from "moment-timezone";

import * as helpers from "./helpers";
import redis, { RedisClient } from "redis";
import { Department, Location, FieldsOfDocument } from "tabletcommand-backend-models";
import { SimpleCallback } from "../types/types";
import { convertToPromise } from "./helpers";

export function client(config: { redis: string; }) {
  return redis.createClient(config.redis);
}

function keyForDepartment(department: Department, prefix: string): string {
  let key = prefix + ":";

  if (_.isString(department.id)) {
    key = key + department.id;
  } else if (_.isString(department._id)) {
    key = key + department._id;
  } else {
    key = key + "unknown";
  }

  return key;
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

function prepareLocationItem(item: Location): { key: string, val: string, ttl: number } {
  if (!_.isString(item.departmentId) || item.departmentId.length === 0) {
    throw new Error(`Invalid departmentId ${item}`);
  }

  if (!_.isString(item.userId) || item.userId.length === 0) {
    throw new Error(`Invalid userId ${item}`);
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

  return { key, val, ttl };
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

export async function storeLocation(client: RedisClient, item: Location, callback: SimpleCallback<"OK">) {
  const { key, val, ttl } = prepareLocationItem(item);

  try {
    const result = await convertToPromise<"OK">(cb => client.set(key, val, "EX", ttl, cb));
    process.stdout.write(".");
    return result;
  } catch (err) {
    console.log("Set key Err", err, "key", key, "value", val);
  }
}

function prepareDebugInfoItem(item: Location): { key: string, val: string, ttl: number } {
  if (!_.isString(item.departmentId) || item.departmentId.length === 0) {
    throw new Error(`Invalid departmentId: ${item}`);
  }

  if (!_.isString(item.userId) || item.userId.length === 0) {
    throw new Error(`Invalid userId: ${item}`);
  }

  if (!_.isString(item.session) || item.session.length === 0) {
    throw new Error(`Invalid session ${item}`);
  }

  const ttl = 60 * 60 * 24 * 14; // 14d
  const departmentId = item.departmentId;
  const userId = item.userId;
  const session = item.session;

  const key = "info:" + departmentId + ":" + userId + ":" + session;

  const props = ["nick", "appVer", "osVer", "ua", "t", "userId", "departmentId"];
  const object = _.pick(item, props);
  const val = JSON.stringify(object);

  return { key, val, ttl };
}

export function storeDebugInfo(client: RedisClient, item: Location, callback: SimpleCallback<"OK">) {
  const { key, val, ttl } = prepareDebugInfoItem(item);

  try {
    return convertToPromise<"OK">(cb => client.set(key, val, "EX", ttl, cb));
  } catch (err) {
    console.log("Set key Err", err, "key", key, "value", val);
    throw err;
  }
}

export async function checkOnline(client: RedisClient, department: Department): Promise<object[]> {
  const key = keyForDepartment(department, "info");

  const keys = await convertToPromise<string[]>(cb => client.keys(key + ":*", cb));
  if (_.size(keys) === 0) {
    return [];
  }

  const items = await convertToPromise<string[]>(cb => client.mget(keys, cb));
  const unpacked = _.map(items, item => {
    try {
      const o = JSON.parse(item);
      o.department = department.department;
      return o;
    } catch (e) {
      return null;
    }
  });
  const valid = _.filter(unpacked, _.isObject);
  return valid;
}

export async function expireItemsMatchingKey(client: RedisClient, keyPattern: string, seconds: number): Promise<string[]> {
  const keys = await convertToPromise<string[]>(cb => client.keys(keyPattern, cb));
  if (_.size(keys) === 0) {
    return [];
  }

  for (const key of keys) {
    await convertToPromise<number>(cb => client.expire(key, seconds, cb));
  }

  await keys;
}

export async function storeAPNInfo(client: RedisClient, item: APNItem): Promise<number> {
  const { key, value, ttl } = prepareStoreAPNInfoItem(item);

  await convertToPromise<number>(cb => client.incr(key, cb));
  return await convertToPromise<number>(cb => client.expire(key, ttl, cb));
}
interface APNItem { time: number; departmentId: string; }
function prepareStoreAPNInfoItem(item: APNItem) {
  // INCR apn:deptId:unixTime

  if (!_.isFinite(item.time)) {
    throw new Error(`Invalid time: ${item}`);
  }

  if (!_.isString(item.departmentId)) {
    throw new Error(`Invalid departmentId: ${item}`);
  }

  const ttl = 60 * 61; // 61 minutes
  const departmentId = item.departmentId;
  const unixTime = moment.unix(item.time).unix();
  const key = "apn:" + departmentId + ":" + unixTime;
  const value = 1;
  return { key, value, ttl };
}

function apnInfoMixin(keys: string[], values: string[]): Array<{ time: number, value: number }> {
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
  return sorted;
}

export async function getAPNInfo(client: RedisClient, department: Department): Promise<Array<{ time: number; value: number; }>> {
  const keys = await convertToPromise<string[]>(cb => client.keys("apn:*", cb));
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
    return [];
  }

  const validValues = await convertToPromise<string[]>(cb => client.mget(validKeys, cb));

  return apnInfoMixin(validKeys, validValues);
}
