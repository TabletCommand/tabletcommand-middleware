/* jslint node: true */
"use strict";

module.exports = function tokenSession(allowedTokens) {
  var _ = require('lodash');

  var buildAllowedItems = function buildAllowedItems(items, callback) {
    if (!_.isArray(items)) {
      return callback(null, []);
    }

    var mapped = _.map(items, function mapCallback(item) {
      var a = {
        active: false,
        admin: true,
        outsider: true,
        username: '',
        token: '',
        email: ''
      };

      if (_.isString(item.token)) {
        a.token = _.trim(item.token);
      }

      if (_.isString(item.username)) {
        a.username = _.trim(item.username);
        a.email = "devops+" + a.username + "@tabletcommand.com";
      }

      a.active = a.username.length > 0 && a.token.length > 0;

      return a;
    });

    var filtered = _.filter(mapped, function filterCallback(item) {
      return item.active;
    });

    return callback(null, filtered);
  };

  var validateToken = function validateToken(tokens, req, res, next) {
    var token = "";
    if (_.has(req.headers, 'x-tc-auth-token') && _.isString(req.headers['x-tc-auth-token'])) {
      token = _.trim(req.headers['x-tc-auth-token']);
    }

    var foundUsers = _.filter(tokens, function filterCallback(item) {
      return item.token === token && token.length > 0;
    });

    if (_.size(foundUsers) > 0) {
      req.user = foundUsers[0];
    }

    return next();
  };

  return function tokenSessionCallback(req, res, next) {
    return buildAllowedItems(allowedTokens, function buildAllowedItemsCallback(err, tokens) {
      return validateToken(tokens, req, res, next);
    });
  };
};
