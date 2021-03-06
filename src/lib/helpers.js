"use strict";

var _ = require("lodash");
var moment = require("moment-timezone");
var debug = require("debug")("massive-tyrion:helpers");
var request = require("request");

function calculateOffsetFromTime(time) {
  var serverUnix = new Date().valueOf() / 1000;
  var offset = serverUnix - time;
  return {
    offset: offset,
    server: serverUnix,
    received: time
  };
}

function fixObjectBooleanKey(obj, key, defaultValue) {
  if (!_.has(obj, key)) {
    obj[key] = defaultValue;
  }

  var trueIsh = (obj[key] === "true" || obj[key] === "1" || obj[key] === 1);
  var falseIsh = (obj[key] === "false" || obj[key] === "0" || obj[key] === 0);

  if (trueIsh) {
    obj[key] = true;
  } else if (falseIsh) {
    obj[key] = false;
  }
}

function fixObjectNumberKey(obj, key, defaultValue) {
  if (!_.has(obj, key)) {
    obj[key] = defaultValue;
    return;
  }

  if (!_.isNumber(obj[key]) && _.isNumber(parseInt(obj[key]))) {
    obj[key] = parseInt(obj[key]);
  }
}

function fixObjectStringKey(obj, key, defaultValue) {
  if (!_.has(obj, key)) {
    obj[key] = defaultValue;
  }
}

function sortWebListsForCollection(list, collectionName) {
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
}

function joinParentChildCollections(parents, childs, parentApiId, parentLocalId, parentName, parentUuid, parentDest) {
  var mapLocalIdItems = _.map(_.filter(childs, function(item) {
    return _.has(item, parentLocalId) && !_.has(item, parentApiId);
  }), function(item) {
    return {
      id: item[parentLocalId],
      item: item
    };
  });

  var mapApiIdItems = _.map(_.filter(childs, function(item) {
    return _.has(item, parentApiId);
  }), function(item) {
    return {
      id: item[parentApiId],
      item: item
    };
  });

  var unmergedItems = _.flatten([mapApiIdItems, mapLocalIdItems]);
  var reducedIds = _.reduce(unmergedItems, function(memo, i) {
    if (!_.has(memo, i.id)) {
      memo[i.id] = [];
    }

    memo[i.id].push(i.item);
    return memo;
  }, {});

  _.each(parents, function(parent) {
    var itemsByParentId = [];
    var itemsByApiParentId = [];
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

    parent[parentDest] = enhancedItems;
  });

  return parents;
}

function itemIsTrue(item, key) {
  if (_.isUndefined(item) || _.isNull(item)) {
    return false;
  }

  if (_.isUndefined(item[key]) || _.isNull(item[key])) {
    return false;
  }

  var itemTrue = item[key] === true || item[key] === "true";
  var itemOne = item[key] === 1 || item[key] === "1";

  return itemTrue || itemOne;
}

function isAdmin(item) {
  return itemIsTrue(item, "admin");
}

function isSuper(item) {
  return itemIsTrue(item, "superuser");
}

function isActive(item) {
  return itemIsTrue(item, "active");
}

function verifyJson(req, res, buf) {
  try {
    JSON.parse(buf);
  } catch (err) {
    var message = "Invalid JSON:" + buf;
    console.log(message);
  }
}

function makeId(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

function hasFeature(dept, feature) {
  var value = 0;

  var hasKey = !_.isUndefined(dept[feature]) && !_.isNull(dept[feature]);
  var keyIsTrue = dept[feature] === true || dept[feature] === "true";
  var keyIsOne = dept[feature] === 1 || dept[feature] === "1";

  if (hasKey && (keyIsTrue || keyIsOne)) {
    value = 1;
  }
  return value;
}

function isItemValidOnMap(item) {
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
}

function stripSessionFields(value, key) {
  var fields = ["pass", "salt", "when"];
  var skipFields = _.isString(key) && _.includes(fields, key.toLowerCase());
  var filterSeneca = _.isString(key) && _.trimRight(key, "$") !== key;

  return filterSeneca || skipFields;
}

function cleanupUser(user) {
  return _.omit(user, stripSessionFields);
}

function resolveUser(args, callback) {
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

  var session = {};
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

function resolveLogin(args, callback) {
  if (!_.isObject(args) ||
    !_.isObject(args.req$) ||
    !_.isObject(args.req$.seneca) ||
    !_.isObject(args.req$.seneca.login) ||
    !itemIsTrue(args.req$.seneca.login, "active")
  ) {
    return callback(null, null);
  }

  var login = cleanupUser(args.req$.seneca.login);
  return callback(null, login);
}

function getClosedOrDate() {
  var nowForClosedDateUnixDate = moment().valueOf() / 1000.0;
  var closedOr = [{
    closed_unix_date: 0
  }, {
    closed_unix_date: {
      $gt: nowForClosedDateUnixDate
    }
  }];

  return closedOr;
}

function extractInfoFromDevice(device) {
  var maxDaysSinceEvent = 120;
  var info = {};
  info.appVer = "Unknown";
  info.osVer = "Unknown";
  info.env = "beta";
  info.daysSinceEvent = maxDaysSinceEvent; // max days

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
}

function headersToDevice(token, headers) {
  var env = "production";
  if (_.has(headers, "x-tc-apn-environment") &&
    headers["x-tc-apn-environment"] === "beta") {
    env = "beta";
  }

  var appVersion = "";
  if (_.has(headers, "x-tc-app-version")) {
    appVersion = headers["x-tc-app-version"];
  }

  var userAgent = "";
  if (_.has(headers, "user-agent")) {
    userAgent = headers["user-agent"];
  }

  var bundleIdentifier = "com.simple-track.Tablet-CMD";
  if (_.has(headers, "x-tc-bundle-identifier") &&
    _.isString(headers["x-tc-bundle-identifier"]) &&
    _.size(headers["x-tc-bundle-identifier"]) > 0) {
    bundleIdentifier = headers["x-tc-bundle-identifier"];
  } else if (appVersion.match(/Tablet CMD Beta/i)) {
    bundleIdentifier = "com.simple-track.beta.Tablet-CMD";
  }

  const silentEnabled = itemIsTrue(headers, "x-tc-silent-enabled");
  const richEnabled = itemIsTrue(headers, "x-tc-rich-enabled");

  const unixTime = new Date().valueOf() / 1000.0;
  let drift = 0;
  if (_.has(headers, "x-tc-device-time")) {
    const deviceTime = parseFloat(headers["x-tc-device-time"]);
    if (_.isFinite(deviceTime) && deviceTime > 0) {
      drift = unixTime - deviceTime;
    }
  }

  const deviceInfo = {
    token: token,
    env: env,
    ver: appVersion,
    ua: userAgent,
    time: unixTime,
    drift: drift,
    bundleIdentifier: bundleIdentifier,
    silentEnabled: silentEnabled,
    richEnabled: richEnabled
  };
  return deviceInfo;
}

function logUserDevice(postUrl, authToken, user, session, headers) {
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
    drift: device.drift,
    session: session.id
  };

  const filter = [];

  const shouldFilter = false;
  if (shouldFilter && _.contains(filter, item.appVer)) {
    return;
  }

  return requestPost(postUrl, authToken, item);
}

function requestPost(postUrl, authToken, item, callback) {
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
}

function configureMomentOpts() {
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
}

module.exports = {
  calculateOffsetFromTime: calculateOffsetFromTime,
  fixObjectBooleanKey: fixObjectBooleanKey,
  sortWebListsForCollection: sortWebListsForCollection,
  joinParentChildCollections: joinParentChildCollections,
  itemIsTrue: itemIsTrue,
  isAdmin: isAdmin,
  isSuper: isSuper,
  isActive: isActive,
  verifyJson: verifyJson,
  makeId: makeId,
  hasFeature: hasFeature,
  isItemValidOnMap: isItemValidOnMap,
  resolveUser: resolveUser,
  resolveLogin: resolveLogin,
  getClosedOrDate: getClosedOrDate,
  cleanupUser: cleanupUser,
  extractInfoFromDevice: extractInfoFromDevice,
  headersToDevice: headersToDevice,
  logUserDevice,
  configureMomentOpts: configureMomentOpts,
  requestPost: requestPost
};
