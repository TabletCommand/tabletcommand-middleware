/* jslint node: true */
"use strict";

var _ = require("lodash");
var assert = require("chai").assert;

var helpers = require("../index").helpers;

describe("Helpers", function(){
  it("fixObjectBooleanKey", function(done){
  	var obj = {
  		"key1": "1",
  		"key2": 1,
  		"key3": "0",
  		"key4": 0,
  		"key5": "a"
  	};

  	var t1 = _.clone(obj);
  	helpers.fixObjectBooleanKey(t1, "key1", false);
  	assert.isTrue(t1.key1 === true);

  	var t2 = _.clone(obj);
  	helpers.fixObjectBooleanKey(t2, "key2", false);
  	assert.isTrue(t2.key2 === true);

  	var t3 = _.clone(obj);
  	helpers.fixObjectBooleanKey(t3, "key3", true);
  	assert.isTrue(t3.key3 === false);

  	var t4 = _.clone(obj);
  	helpers.fixObjectBooleanKey(t4, "key4", true);
  	assert.isTrue(t4.key4 === false);

  	var t5 = _.clone(obj);
  	helpers.fixObjectBooleanKey(t5, "key5", true);
  	assert.isTrue(t5.key5 === "a");

    return done();
	});
});