import _ from "lodash";
import moment from "moment-timezone";
import debugModule from "debug";
const  debug = debugModule("massive-tyrion:helpers");
import request from "request";
import { Response, Request } from 'express';
import { User, Session, Department } from "tabletcommand-backend-models";
import express = require("express");
import { UserInfo } from "../middleware/token-session";
import { SimpleCallback } from "../types/types";

export function calculateOffsetFromTime(time: number) {
  const serverUnix = new Date().valueOf() / 1000;
  const offset = serverUnix - time;
  return {
    offset,
    server: serverUnix,
    received: time,
  };
}

export function fixObjectBooleanKey<K extends PropertyKey>(obj: Partial<Record<K, number | string | boolean>>, key: K, defaultValue: boolean) {
  if (!_.has(obj, key)) {
    obj[key] = defaultValue;
  }
  const value = obj[key] as unknown;
  const trueIsh = (value === "true" || value === "1" || value === 1);
  const falseIsh = (value === "false" || value === "0" || value === 0);

  if (trueIsh) {
    obj[key] = true;
  } else if (falseIsh) {
    obj[key] = false;
  }
}

function fixObjectNumberKey<K extends PropertyKey>(obj: Partial<Record<K, string | number>>, key: K, defaultValue: number) {
  if (!_.has(obj, key)) {
    obj[key] = defaultValue;
    return;
  }

  const value = obj[key] as unknown as string;
  if (!_.isNumber(value) && _.isNumber(parseInt(value))) {
    obj[key] = parseInt(value);
  }
}

function fixObjectStringKey<K extends PropertyKey>(obj: Partial<Record<K, string>>, key: K, defaultValue: string) {
  if (!_.has(obj, key)) {
    obj[key] = defaultValue;
  }
}

export function sortWebListsForCollection<T extends {
  isMandatory?: boolean,
  active?: boolean,
  position?: number,
  friendly_id?: string,
}>(list: T[], collectionName: string): T[] {
  if (!_.isArray(list)) {
    return list;
  }

  if (collectionName === "battalion") {
    const listWithFields = _.map(list, function(item) {
      fixObjectBooleanKey(item, "isMandatory", false);
      fixObjectBooleanKey(item, "active", true);
      fixObjectNumberKey(item, "position", 0);
      return item;
    });

    return _.orderBy(
      listWithFields, ["isMandatory", "active", "position"], ["desc", "desc", "asc"],
    );
  }

  //    cmd.sort = [['isMandatory', -1], ['position', 1], ['friendly_id', 1]];
  if (collectionName === "unit") {
    const unitsListWithFields = _.map(list, function(item) {
      fixObjectBooleanKey(item, "isMandatory", false);
      fixObjectNumberKey(item, "position", 0);
      fixObjectStringKey(item, "friendly_id", "");
      return item;
    });

    return _.orderBy(
      unitsListWithFields, ["isMandatory", "position", "friendly_id"], ["desc", "asc", "asc"],
    );
  }

  // Default, return the same list
  return list;
}

export function joinParentChildCollections<
      // TParent extends Record<"local_id" | "id" | "name" | "uuid", TChild[keyof TChild]>,
      TChild extends Record<TParentLocalId | TParentApiId | TParentName | TParentUuid, string>,
      TParent extends {
          "local_id": TChild[TParentLocalId]
          "uuid": TChild[TParentUuid]
          "name": TChild[TParentName]
          "id": TChild[TParentApiId],
      } & Record<TParentDest, TChild[]>,
      TParentLocalId extends PropertyKey,
      TParentApiId extends PropertyKey,
      TParentName extends PropertyKey,
      TParentUuid extends PropertyKey,
      TParentDest extends keyof TParent>(
  parents: TParent[],
  children: TChild[],
  parentApiId: TParentApiId,
  parentLocalId: TParentLocalId,
  parentName: TParentName,
  parentUuid: TParentUuid,
  parentDest: TParentDest) {

  const mapLocalIdItems = _.map(_.filter(children, function(item) {
    return _.has(item, parentLocalId) && !_.has(item, parentApiId);
  }), function(item) {
    return {
      id: item[parentLocalId],
      item,
    };
  });

  const mapApiIdItems = _.map(_.filter(children, function(item) {
    return _.has(item, parentApiId);
  }), function(item) {
    return {
      id: item[parentApiId],
      item,
    };
  });

  const unmergedItems = _.flatten([mapApiIdItems as any as typeof mapLocalIdItems, mapLocalIdItems]);
  const reducedIds = _.reduce(unmergedItems, function(memo, i) {
    if (!_.has(memo, i.id)) {
      memo[i.id] = [];
    }

    memo[i.id].push(i.item);
    return memo;
  }, {} as Record<string, typeof children>);

  _.each(parents, function(parent) {
    let itemsByParentId: typeof children = [];
    let itemsByApiParentId: typeof children = [];
    if (_.has(parent, "local_id") && _.has(reducedIds, parent.local_id)) {
      itemsByParentId = reducedIds[parent.local_id];
    }

    if (_.has(parent, "id") && _.has(reducedIds, parent.id)) {
      itemsByApiParentId = reducedIds[parent.id];
    }

    const mergedItems = _.flatten([itemsByParentId, itemsByApiParentId]);
    const enhancedItems = _.map(mergedItems, function(item) {
      item[parentApiId] = parent.id;

      if (_.has(parent, "name")) {
        item[parentName] = parent.name;
      }

      if (_.has(parent, "uuid")) {
        item[parentUuid] = parent.uuid;
      }

      return item;
    });

    parent[parentDest] = enhancedItems as TParent[TParentDest];
  });

  return parents;
}
type BooleanLike = boolean | string | number;
export function itemIsTrue(item: Record<string, string[] | string>, key: string): boolean;
export function itemIsTrue<K extends PropertyKey>(item: Partial<Record<K, BooleanLike>> | null, key: K): boolean;
export function itemIsTrue(item: Record<string, BooleanLike | string | string[]> | null, key: string) {
  if (_.isUndefined(item) || _.isNull(item)) {
    return false;
  }

  if (_.isUndefined(item[key]) || _.isNull(item[key])) {
    return false;
  }

  const itemTrue = item[key] === true || item[key] === "true";
  const itemOne = item[key] === 1 || item[key] === "1";

  return itemTrue || itemOne;
}

export function isAdmin(item: { admin?: BooleanLike } | null) {
  return itemIsTrue(item, "admin");
}

export function isSuper(item: { superuser?: BooleanLike } | null) {
  return itemIsTrue(item, "superuser");
}

export function isActive(item: { active?: BooleanLike } | null) {
  return itemIsTrue(item, "active");
}

export function verifyJson(req: Request , res: Response, buf: string) {
  try {
    JSON.parse(buf);
  } catch (err) {
    const message = "Invalid JSON:" + buf;
    console.log(message);
  }
}

export function makeId(length: number) {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

export function hasFeature(dept: Department, feature: keyof Department) {
  let value = 0;

  const hasKey = !_.isUndefined(dept[feature]) && !_.isNull(dept[feature]);
  const keyIsTrue = dept[feature] === true || dept[feature] === "true";
  const keyIsOne = dept[feature] === 1 || dept[feature] === "1";

  if (hasKey && (keyIsTrue || keyIsOne)) {
    value = 1;
  }
  return value;
}

export function isItemValidOnMap(item: { latitude: string; longitude: string; }) {
  const invalidDegreeLimit = 5.0;

  const parsedLat = parseInt(item.latitude);
  const parsedLon = parseInt(item.longitude);

  if (_.isNaN(parsedLat) || _.isNaN(parsedLon)) {
    return false;
  }

  if (Math.abs(parsedLat) < invalidDegreeLimit && Math.abs(parsedLon) < invalidDegreeLimit) {
    return false;
  }

  return true;
}

function stripSessionFields(value: any, key: string) {
  const fields = ["pass", "salt", "when"];
  const skipFields = _.isString(key) && _.includes(fields, key.toLowerCase());
  const filterSeneca = _.isString(key) && _.trimEnd(key, "$") !== key;

  return filterSeneca || skipFields;
}

export function cleanupUser(user: UserInfo) {
  // Usage assertions, the definitions don't seem to know about this overload.
  return _.omit(user, stripSessionFields as any);
}

export function resolveUser(args: { req$: express.Request, user: UserInfo }): { user: UserInfo, session: Session } {
  const hasSeneca = _.isObject(args) &&
    _.isObject(args.req$) &&
    _.isObject(args.req$.seneca);
  const hasSenecaUser = hasSeneca && _.isObject(args.req$.seneca.user);
  const hasReqUser = _.isObject(args.req$.user);
  const hasArgsUser = _.isObject(args) && _.isObject(args.user);
  const hasHeaders = _.isObject(args.req$) && _.isObject(args.req$.headers);
  if (!hasSenecaUser && !hasArgsUser && !hasReqUser) {
    if (hasHeaders) {
      debug("No user. Headers were:", args.req$.headers);
    }

    debug("No hasSenecaUser and no hasArgsUser");
    return null;
  }

  let resolvedUser = null;
  if (hasSenecaUser) {
    resolvedUser = args.req$.seneca.user;
  } else if (hasArgsUser) {
    resolvedUser = args.user;
  } else if (hasReqUser) {
    resolvedUser = args.req$.user;
  }

  let session: Session;
  if (hasSeneca && _.isObject(args.req$.seneca.login)) {
    session = args.req$.seneca.login;
  } else if (_.isObject(args.req$.session)) {
    session = args.req$.session;
  }

  const userInactive = !itemIsTrue(resolvedUser, "active");
  const sessionInactive = !itemIsTrue(session, "active");
  // sessionInactive = false; // TODO: remove this once all the users are active

  if (_.isNull(resolvedUser) || userInactive || sessionInactive) {
    debug("User or session not active for", resolvedUser.nick, session.id);
    return null;
  }

  const user = cleanupUser(resolvedUser);
  return { user, session };
}

interface ResolveLoginArg { req$: { seneca: { login: UserInfo; }; }; }
export function resolveLogin(args: ResolveLoginArg): UserInfo {
  if (!_.isObject(args) ||
    !_.isObject(args.req$) ||
    !_.isObject(args.req$.seneca) ||
    !_.isObject(args.req$.seneca.login) ||
    !itemIsTrue(args.req$.seneca.login, "active")
  ) {
    return null;
  }

  const login = cleanupUser(args.req$.seneca.login);
  return login;
}

function getClosedOrDate() {
  const nowForClosedDateUnixDate = moment().valueOf() / 1000.0;
  const closedOr = [{
    closed_unix_date: 0,
  }, {
    closed_unix_date: {
      $gt: nowForClosedDateUnixDate,
    },
  }];

  return closedOr;
}

export function extractInfoFromDevice(device: { token?: string; env: any; ver: any; ua: any; time: any; bundleIdentifier?: string; silentEnabled?: boolean; richEnabled?: boolean; }) {
  const maxDaysSinceEvent = 120;
  const info = {
    appVer: "Unknown",
    osVer: "Unknown",
    env: "beta",
    daysSinceEvent: maxDaysSinceEvent, // max days
  };

  const unixDate = moment().valueOf() / 1000.0;
  const dayAsSeconds = 60 * 60 * 24;

  if (!_.isUndefined(device.env) && !_.isNull(device.env)) {
    info.env = device.env;
  }

  if (!_.isUndefined(device.ver) && !_.isNull(device.ver)) {
    info.appVer = device.ver;
  }

  if (!_.isUndefined(device.ua) && !_.isNull(device.ua)) {
    let partsAppVer = "";
    let partsOsVer = "";

    const userAgentParts = device.ua.match(/(.*)\((.*)\)/i);

    if (userAgentParts && userAgentParts[1]) {
      partsAppVer = userAgentParts[1];
    }

    if (userAgentParts && userAgentParts[2]) {
      partsOsVer = userAgentParts[2];
    }

    if (partsAppVer.length > 0) {
      info.appVer = partsAppVer.trim();
    }

    if (partsOsVer.length > 0) {
      const osSplitParts = partsOsVer.match(/(.*);(.*);(.*)/i);

      let foundOsVer = "";
      if (osSplitParts && osSplitParts[2]) {
        foundOsVer = osSplitParts[2];
      }

      if (foundOsVer.length > 0) {
        info.osVer = foundOsVer.trim();
      }
    }
  }

  if (!_.isUndefined(device.time) && !_.isNull(device.time)) {
    const secondsAgo = unixDate - parseFloat(device.time);
    info.daysSinceEvent = Math.floor(secondsAgo / dayAsSeconds);
  }

  return info;
}

export function headersToDevice(token: string, headers: express.Request['headers']) {
  let env = "production";
  if (_.has(headers, "x-tc-apn-environment") &&
    headers["x-tc-apn-environment"] === "beta") {
    env = "beta";
  }

  let appVersion = "";
  if (_.has(headers, "x-tc-app-version")) {
    appVersion = headers["x-tc-app-version"] as string;
  }

  let userAgent = "";
  if (_.has(headers, "user-agent")) {
    userAgent = headers["user-agent"];
  }

  let bundleIdentifier = "com.simple-track.Tablet-CMD";
  if (_.has(headers, "x-tc-bundle-identifier") &&
    _.isString(headers["x-tc-bundle-identifier"]) &&
    _.size(headers["x-tc-bundle-identifier"]) > 0) {
    bundleIdentifier = headers["x-tc-bundle-identifier"] as string;
  } else if (appVersion.match(/Tablet CMD Beta/i)) {
    bundleIdentifier = "com.simple-track.beta.Tablet-CMD";
  }

  const silentEnabled = itemIsTrue(headers, "x-tc-silent-enabled");
  const richEnabled = itemIsTrue(headers, "x-tc-rich-enabled");

  const unixtime = moment().valueOf() / 1000.0;
  const deviceInfo = {
    token,
    env,
    ver: appVersion,
    ua: userAgent,
    time: unixtime,
    bundleIdentifier,
    silentEnabled,
    richEnabled,
  };
  return deviceInfo;
}

export function logUserDevice(postUrl: string, authToken: string, user: User, session: Session, headers: Request['headers']) {
  const device = headersToDevice("", headers);
  const info = extractInfoFromDevice(device);

  const item = {
    userId: user.id,
    departmentId: user.departmentId,
    nick: user.nick,
    appVer: info.appVer,
    osVer: info.osVer,
    ua: device.ua,
    t: device.time,
    session: session.id,
  };

  const filter: string[] = [];

  const shouldFilter = false;
  if (shouldFilter && (_ as any).contains(filter, item.appVer)) {
    return;
  }

  return requestPost(postUrl, authToken, item);
}

export function requestPost(postUrl: string, authToken: string, item: unknown, callback?: request.RequestCallback) {
  if (!_.isFunction(callback)) {
    callback = function defaultCallback() {
      // Empty
    };
  }
  const reqOpts = {
    url: postUrl,
    method: "POST",
    json: item,
    headers: {
      "x-tc-auth-token": authToken,
    },
  };
  return request(reqOpts, callback);
}

const configureMomentOpts = function configureMomentOpts() {
  moment.updateLocale("en", {
    relativeTime: {
      future: "in %s",
      past: "%s ago",
      s: "%ds",
      ss: "%ds",
      m: "%dmin",
      mm: "%dmin",
      h: "%dh",
      hh: "%dh",
      d: "%dd",
      dd: "%dd",
      M: "%dmon",
      MM: "%dmon",
      y: "%dy",
      yy: "%dy",
    },
  });
};

export function convertToPromise<T = never>(fn: (cb: SimpleCallback<T>) => void) {
  return new Promise<T | null>((resolve, reject) => fn((err, result) => {
      if (err) {
          reject(err);
      } else {
          resolve(result);
      }
  }));
}
