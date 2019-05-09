import _ from "lodash";
import moment from "moment-timezone"
var debug = require("debug")("massive-tyrion:helpers");
import request from "request";
import { Response, Request } from 'express'
import { User, Session, Department } from "tabletcommand-backend-models";
import express = require("express");
import { UserInfo } from "../middleware/token-session";

export function calculateOffsetFromTime(time: number) {
  var serverUnix = new Date().valueOf() / 1000;
  var offset = serverUnix - time;
  return {
    offset: offset,
    server: serverUnix,
    received: time
  };
};

export function fixObjectBooleanKey<K extends PropertyKey>(obj: Partial<Record<K, boolean>>, key: K, defaultValue: boolean) {
  if (!_.has(obj, key)) {
    obj[key] = defaultValue;
  }
  const value = obj[key] as unknown;
  var trueIsh = (value === "true" || value === "1" || value === 1);
  var falseIsh = (value === "false" || value === "0" || value === 0);

  if (trueIsh) {
    obj[key] = true;
  } else if (falseIsh) {
    obj[key] = false;
  }
};

function fixObjectNumberKey<K extends PropertyKey>(obj: Partial<Record<K, number>>, key: K, defaultValue: number) {
  if (!_.has(obj, key)) {
    obj[key] = defaultValue;
    return;
  }

  const value = obj[key] as unknown as string;
  if (!_.isNumber(value) && _.isNumber(parseInt(value))) {
    obj[key] = parseInt(value);
  }
};

function fixObjectStringKey<K extends PropertyKey>(obj: Partial<Record<K, string>>, key: K, defaultValue: string){
  if (!_.has(obj, key)) {
    obj[key] = defaultValue;
  }
};

export function sortWebListsForCollection<T extends {
  isMandatory?: boolean,
  active?: boolean,
  position?: number,
  friendly_id? : string
}>(list: T[], collectionName: string): T[] {
  if (!_.isArray(list)) {
    return list;
  }

  if (collectionName === "battalion") {
    var listWithFields = _.map(list, function(item) {
      fixObjectBooleanKey(item, "isMandatory", false);
      fixObjectBooleanKey(item, "active", true);
      fixObjectNumberKey(item, "position", 0);
      return item;
    });

    return _.orderBy(
      listWithFields, ["isMandatory", "active", "position"], ["desc", "desc", "asc"]
    );
  }

  //    cmd.sort = [['isMandatory', -1], ['position', 1], ['friendly_id', 1]];
  if (collectionName === "unit") {
    var unitsListWithFields = _.map(list, function(item) {
      fixObjectBooleanKey(item, "isMandatory", false);
      fixObjectNumberKey(item, "position", 0);
      fixObjectStringKey(item, "friendly_id", "");
      return item;
    });

    return _.orderBy(
      unitsListWithFields, ["isMandatory", "position", "friendly_id"], ["desc", "asc", "asc"]
    );
  }

  // Default, return the same list
  return list;
};

export function joinParentChildCollections<
      //TParent extends Record<"local_id" | "id" | "name" | "uuid", TChild[keyof TChild]>,
      TChild extends Record<TParentLocalId | TParentApiId | TParentName | TParentUuid, string>,
      TParent extends {
          "local_id" : TChild[TParentLocalId]
          "uuid": TChild[TParentUuid]
          "name": TChild[TParentName]
          "id": TChild[TParentApiId]
      } & Record<TParentDest, TChild[]>,
      TParentLocalId extends PropertyKey, 
      TParentApiId extends PropertyKey, 
      TParentName extends PropertyKey, 
      TParentUuid extends PropertyKey,
      TParentDest extends keyof TParent>(
  parents: Array<TParent>,
  children: Array<TChild>,
  parentApiId: TParentApiId,
  parentLocalId: TParentLocalId,
  parentName: TParentName,
  parentUuid: TParentUuid,
  parentDest: TParentDest) {

  var mapLocalIdItems = _.map(_.filter(children, function(item) {
    return _.has(item, parentLocalId) && !_.has(item, parentApiId);
  }), function(item) {
    return {
      id: item[parentLocalId],
      item: item
    };
  });

  var mapApiIdItems = _.map(_.filter(children, function(item) {
    return _.has(item, parentApiId);
  }), function(item) {
    return {
      id: item[parentApiId],
      item: item
    };
  });

  var unmergedItems = _.flatten([mapApiIdItems as any as typeof mapLocalIdItems, mapLocalIdItems]);
  var reducedIds = _.reduce(unmergedItems, function(memo, i) {
    if (!_.has(memo, i.id)) {
      memo[i.id] = [];
    }

    memo[i.id].push(i.item);
    return memo;
  }, {} as Record<string, typeof children>);

  _.each(parents, function(parent) {
    var itemsByParentId: typeof children = [];
    var itemsByApiParentId: typeof children = [];
    if (_.has(parent, "local_id") && _.has(reducedIds, parent.local_id)) {
      itemsByParentId = reducedIds[parent.local_id];
    }

    if (_.has(parent, "id") && _.has(reducedIds, parent.id)) {
      itemsByApiParentId = reducedIds[parent.id];
    }

    var mergedItems = _.flatten([itemsByParentId, itemsByApiParentId]);
    var enhancedItems = _.map(mergedItems, function(item) {
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
};
type BooleanLike = boolean | ("true" | "false") | (1 | 0)
export function itemIsTrue(item: Record<string, string[] | string>, key: string): boolean
export function itemIsTrue<K extends PropertyKey>(item: Partial<Record<K, BooleanLike>> | null, key: K): boolean
export function itemIsTrue(item: Record<string, BooleanLike | string | string[]> | null, key: string) {
  if (_.isUndefined(item) || _.isNull(item)) {
    return false;
  }

  if (_.isUndefined(item[key]) || _.isNull(item[key])) {
    return false;
  }

  var itemTrue = item[key] === true || item[key] === "true";
  var itemOne = item[key] === 1 || item[key] === "1";

  return itemTrue || itemOne;
};

export function isAdmin(item: { admin?: BooleanLike } | null) {
  return itemIsTrue(item, "admin");
};

export function isSuper(item: { superuser?: BooleanLike } | null) {
  return itemIsTrue(item, "superuser");
};

export function isActive(item: { active?: BooleanLike } | null) {
  return itemIsTrue(item, "active");
};

export function verifyJson(req: Request , res: Response, buf: string) {
  try {
    JSON.parse(buf);
  } catch (err) {
    var message = "Invalid JSON:" + buf;
    console.log(message);
  }
};

export function makeId(length: number) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};

export function hasFeature(dept: Department, feature: keyof Department) {
  var value = 0;

  var hasKey = !_.isUndefined(dept[feature]) && !_.isNull(dept[feature]);
  var keyIsTrue = dept[feature] === true || dept[feature] === "true";
  var keyIsOne = dept[feature] === 1 || dept[feature] === "1";

  if (hasKey && (keyIsTrue || keyIsOne)) {
    value = 1;
  }
  return value;
};

export function isItemValidOnMap(item: { latitude: string; longitude: string; }) {
  var invalidDegreeLimit = 5.0;

  var parsedLat = parseInt(item.latitude);
  var parsedLon = parseInt(item.longitude);

  if (_.isNaN(parsedLat) || _.isNaN(parsedLon)) {
    return false;
  }

  if (Math.abs(parsedLat) < invalidDegreeLimit && Math.abs(parsedLon) < invalidDegreeLimit) {
    return false;
  }

  return true;
};

function stripSessionFields(value: any, key: string) {
  var fields = ["pass", "salt", "when"];
  var skipFields = _.isString(key) && _.includes(fields, key.toLowerCase());
  var filterSeneca = _.isString(key) && _.trimEnd(key, "$") !== key;

  return filterSeneca || skipFields;
};

export function cleanupUser(user: UserInfo) {
  // Usage assertions, the definitions don't seem to know about this overload.
  return _.omit(user, stripSessionFields as any);
};

export function resolveUser(args: { req$: express.Request, user: UserInfo }, callback: (err: Error, user?: UserInfo, session?: Session) => void): void {
  var hasSeneca = _.isObject(args) &&
    _.isObject(args.req$) &&
    _.isObject(args.req$.seneca);
  var hasSenecaUser = hasSeneca && _.isObject(args.req$.seneca.user);
  var hasReqUser = _.isObject(args.req$.user);
  var hasArgsUser = _.isObject(args) && _.isObject(args.user);
  var hasHeaders = _.isObject(args.req$) && _.isObject(args.req$.headers);
  if (!hasSenecaUser && !hasArgsUser && !hasReqUser) {
    if (hasHeaders) {
      debug("No user. Headers were:", args.req$.headers);
    }

    debug("No hasSenecaUser and no hasArgsUser");
    return callback(null, null);
  }

  var resolvedUser = null;
  if (hasSenecaUser) {
    resolvedUser = args.req$.seneca.user;
  } else if (hasArgsUser) {
    resolvedUser = args.user;
  } else if (hasReqUser) {
    resolvedUser = args.req$.user;
  }

  var session: Session;
  if (hasSeneca && _.isObject(args.req$.seneca.login)) {
    session = args.req$.seneca.login;
  } else if (_.isObject(args.req$.session)) {
    session = args.req$.session;
  }

  var userInactive = !itemIsTrue(resolvedUser, "active");
  var sessionInactive = !itemIsTrue(session, "active");
  // sessionInactive = false; // TODO: remove this once all the users are active

  if (_.isNull(resolvedUser) || userInactive || sessionInactive) {
    debug("User or session not active for", resolvedUser.nick, session.id);
    return callback(null, null, null);
  }

  var user = cleanupUser(resolvedUser);
  return callback(null, user, session);
};

type ResolveLoginArg = { req$: { seneca: { login: UserInfo; }; }; }
export function resolveLogin(args: ResolveLoginArg): UserInfo {
  if (!_.isObject(args) ||
    !_.isObject(args.req$) ||
    !_.isObject(args.req$.seneca) ||
    !_.isObject(args.req$.seneca.login) ||
    !itemIsTrue(args.req$.seneca.login, "active")
  ) {
    return null;
  }

  var login = cleanupUser(args.req$.seneca.login);
  return login;
};

var getClosedOrDate = function getClosedOrDate() {
  var nowForClosedDateUnixDate = moment().valueOf() / 1000.0;
  var closedOr = [{
    closed_unix_date: 0
  }, {
    closed_unix_date: {
      $gt: nowForClosedDateUnixDate
    }
  }];

  return closedOr;
};

export function extractInfoFromDevice(device: { token?: string; env: any; ver: any; ua: any; time: any; bundleIdentifier?: string; silentEnabled?: boolean; richEnabled?: boolean; }) {
  var maxDaysSinceEvent = 120;
  var info = {
    appVer: "Unknown",
    osVer: "Unknown",
    env:"beta",
    daysSinceEvent: maxDaysSinceEvent, // max days
  };

  var unixDate = moment().valueOf() / 1000.0;
  var dayAsSeconds = 60 * 60 * 24;

  if (!_.isUndefined(device.env) && !_.isNull(device.env)) {
    info.env = device.env;
  }

  if (!_.isUndefined(device.ver) && !_.isNull(device.ver)) {
    info.appVer = device.ver;
  }

  if (!_.isUndefined(device.ua) && !_.isNull(device.ua)) {
    var partsAppVer = "";
    var partsOsVer = "";

    var userAgentParts = device.ua.match(/(.*)\((.*)\)/i);

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
      var osSplitParts = partsOsVer.match(/(.*);(.*);(.*)/i);

      var foundOsVer = "";
      if (osSplitParts && osSplitParts[2]) {
        foundOsVer = osSplitParts[2];
      }

      if (foundOsVer.length > 0) {
        info.osVer = foundOsVer.trim();
      }
    }
  }

  if (!_.isUndefined(device.time) && !_.isNull(device.time)) {
    var secondsAgo = unixDate - parseFloat(device.time);
    info.daysSinceEvent = Math.floor(secondsAgo / dayAsSeconds);
  }

  return info;
};

export function headersToDevice(token: string, headers: express.Request['headers']) {
  var env = "production";
  if (_.has(headers, "x-tc-apn-environment") &&
    headers["x-tc-apn-environment"] === "beta") {
    env = "beta";
  }

  var appVersion = "";
  if (_.has(headers, "x-tc-app-version")) {
    appVersion = headers["x-tc-app-version"] as string;
  }

  var userAgent = "";
  if (_.has(headers, "user-agent")) {
    userAgent = headers["user-agent"];
  }

  var bundleIdentifier = "com.simple-track.Tablet-CMD";
  if (_.has(headers, "x-tc-bundle-identifier") &&
    _.isString(headers["x-tc-bundle-identifier"]) &&
    _.size(headers["x-tc-bundle-identifier"]) > 0) {
    bundleIdentifier = headers["x-tc-bundle-identifier"] as string;
  } else if (appVersion.match(/Tablet CMD Beta/i)) {
    bundleIdentifier = "com.simple-track.beta.Tablet-CMD";
  }

  var silentEnabled = itemIsTrue(headers, "x-tc-silent-enabled");
  var richEnabled = itemIsTrue(headers, "x-tc-rich-enabled");

  var unixtime = moment().valueOf() / 1000.0;
  var deviceInfo = {
    token: token,
    env: env,
    ver: appVersion,
    ua: userAgent,
    time: unixtime,
    bundleIdentifier: bundleIdentifier,
    silentEnabled: silentEnabled,
    richEnabled: richEnabled
  };
  return deviceInfo;
};

export function logUserDevice(postUrl: string, authToken: string, user: User, session: Session, headers: Request['headers']) {
  var device = headersToDevice("", headers);
  var info = extractInfoFromDevice(device);

  var item = {
    userId: user.id,
    departmentId: user.departmentId,
    nick: user.nick,
    appVer: info.appVer,
    osVer: info.osVer,
    ua: device.ua,
    t: device.time,
    session: session.id
  };

  var filter: string[] = [];

  var shouldFilter = false;
  if (shouldFilter && (_ as any).contains(filter, item.appVer)) {
    return;
  }

  return requestPost(postUrl, authToken, item);
};

export function requestPost(postUrl: string, authToken: string, item: unknown, callback?: request.RequestCallback) {
  if (!_.isFunction(callback)) {
    callback = function defaultCallback() {
      // Empty
    };
  }
  var reqOpts = {
    url: postUrl,
    method: "POST",
    json: item,
    headers: {
      "x-tc-auth-token": authToken
    }
  };
  return request(reqOpts, callback);
};

var configureMomentOpts = function configureMomentOpts() {
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
      yy: "%dy"
    }
  });
};
