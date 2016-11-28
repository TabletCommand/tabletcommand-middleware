/* jslint node: true */
"use strict";

module.exports = function customSession(Department){
  var _ = require('lodash');

  var departmentForLogging = function(department){
    if(!_.isObject(department)){
      return {};
    }

    var item = _.pick(_.clone(department), ['_id', 'id', 'department', 'cadBidirectionalEnabled']);
    return JSON.parse(JSON.stringify(item)); // Force convert the item to JSON
  };

  var getDepartmentBySignupKey = function(req, res, callback){
    // Bail if req.department was already set
    // by a different middleware
    if (_.isObject(req.department) && _.size(req.department) > 0) {
      return callback(null, req.department);
    }

    var signupKey = '';
    if(_.isObject(req.query)) {
      if(_.has(req.query, 'signupKey')) {
        signupKey = req.query.signupKey;
      } else if (_.has(req.query, 'signupkey')) {
        signupKey = req.query.signupkey;
      }
    }

    if(signupKey === ''){
      return callback(null, null);
    }

    var query = {
      active: true,
      signupKey: signupKey
    };

    return Department.findOne(query, function(err, dbObject){
      if(err){
        console.log('err retrieving department by user', err);
      }

      if(_.isObject(dbObject) && _.size(dbObject) > 0){
        req.department = dbObject.toObject();
        req.departmentLog = departmentForLogging(dbObject.toJSON());
      }

      return callback(err, dbObject);
    });
  };

  return function(req, res, next){
    return getDepartmentBySignupKey(req, res, function(err, department){
      return next();
    });
  };
};
