/* jslint node: true */
import express from "express";
import _ from "lodash";
export interface UserInfo {
  active: boolean;
  admin: boolean;
  outsider: boolean;
  username?: string;
  token: string;
  email: string;
  superuser?: boolean;
  departmentId?: string;
  nick?: string;
}
export function tokenSession(allowedTokens: Array<{ token: string, username: string }>) {

  const buildAllowedItems = function buildAllowedItems(items: Array<{ token: string, username: string }>) {
    if (!_.isArray(items)) {
      return [];
    }

    const mapped = _.map(items, function mapCallback(item) {
      const a = {
        active: false,
        admin: true,
        outsider: true,
        username: "",
        token: "",
        email: "",
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

    const filtered = _.filter(mapped, function filterCallback(item) {
      return item.active;
    });

    return filtered;
  };

  const validateToken = function validateToken(err: Error | null, tokens: UserInfo[], req: express.Request, res: express.Response, next: express.NextFunction) {
    let token = "";
    if (_.has(req.headers, "x-tc-auth-token")) {
      const headerValue = req.headers["x-tc-auth-token"];
      if (_.isString(headerValue)) {
        token = _.trim(headerValue);
      }
    }

    const foundUsers = _.filter(tokens, function filterCallback(item) {
      return item.token === token && token.length > 0;
    });

    if (_.size(foundUsers) > 0) {
      req.user = foundUsers[0];
    }

    return next(err);
  };

  return function tokenSessionCallback(req: express.Request, res: express.Response, next: express.NextFunction) {
    const tokens = buildAllowedItems(allowedTokens);
    return validateToken(null, tokens, req, res, next);
  };
}

export default tokenSession;
