import _ from "lodash";
import { assert } from "chai";
import { helpers } from "../index";

describe("Helpers", function() {
  it("fixObjectBooleanKey", function(done) {
    var obj = {
      "key1": "1",
      "key2": 1,
      "key3": "0",
      "key4": 0,
      "key5": "a"
    };

    var t1 = _.clone(obj);
    helpers.fixObjectBooleanKey(t1, "key1", false);
    assert.isTrue(t1.key1 as unknown === true);

    var t2 = _.clone(obj);
    helpers.fixObjectBooleanKey(t2, "key2", false);
    assert.isTrue(t2.key2  as unknown === true);

    var t3 = _.clone(obj);
    helpers.fixObjectBooleanKey(t3, "key3", true);
    assert.isTrue(t3.key3  as unknown === false);

    var t4 = _.clone(obj);
    helpers.fixObjectBooleanKey(t4, "key4", true);
    assert.isTrue(t4.key4  as unknown === false);

    var t5 = _.clone(obj);
    helpers.fixObjectBooleanKey(t5, "key5", true);
    assert.isTrue(t5.key5 === "a");

    return done();
  });

  it("isAdmin", function(done) {
    var at = {
      admin: true
    };
    assert.isTrue(helpers.isAdmin(at));

    var a1 = {
      admin: 1
    };
    assert.isTrue(helpers.isAdmin(a1));

    var a1s = {
      admin: "1"
    };
    assert.isTrue(helpers.isAdmin(a1s));

    var af = {
      admin: "false"
    };
    assert.isFalse(helpers.isAdmin(af));

    var a0 = {
      admin: 0
    };
    assert.isFalse(helpers.isAdmin(a0));

    var e = {};
    assert.isFalse(helpers.isAdmin(e));

    return done();
  });

  it("isSuper", function(done) {
    var sa = {
      superuser: 1
    };
    assert.isTrue(helpers.isSuper(sa));

    var sf = {
      superuser: 0
    };
    assert.isFalse(helpers.isSuper(sf));

    return done();
  });

  it("isActive", function(done) {
    var a = {
      active: true
    };
    assert.isTrue(helpers.isActive(a));

    var i = {
      active: "false"
    };
    assert.isFalse(helpers.isActive(i));
    return done();
  });
});
