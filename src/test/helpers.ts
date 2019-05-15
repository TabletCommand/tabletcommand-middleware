import _ from "lodash";
import { assert } from "chai";
import { helpers } from "../index";

describe("Helpers", function() {
  it("fixObjectBooleanKey", function(done) {
    const obj = {
      key1: "1",
      key2: 1,
      key3: "0",
      key4: 0,
      key5: "a",
    };

    const t1 = _.clone(obj);
    helpers.fixObjectBooleanKey(t1, "key1", false);
    assert.isTrue(t1.key1 as unknown === true);

    const t2 = _.clone(obj);
    helpers.fixObjectBooleanKey(t2, "key2", false);
    assert.isTrue(t2.key2  as unknown === true);

    const t3 = _.clone(obj);
    helpers.fixObjectBooleanKey(t3, "key3", true);
    assert.isTrue(t3.key3  as unknown === false);

    const t4 = _.clone(obj);
    helpers.fixObjectBooleanKey(t4, "key4", true);
    assert.isTrue(t4.key4  as unknown === false);

    const t5 = _.clone(obj);
    helpers.fixObjectBooleanKey(t5, "key5", true);
    assert.isTrue(t5.key5 === "a");

    return done();
  });

  it("isAdmin", function(done) {
    const at = {
      admin: true,
    };
    assert.isTrue(helpers.isAdmin(at));

    const a1 = {
      admin: 1,
    };
    assert.isTrue(helpers.isAdmin(a1));

    const a1s = {
      admin: "1",
    };
    assert.isTrue(helpers.isAdmin(a1s));

    const af = {
      admin: "false",
    };
    assert.isFalse(helpers.isAdmin(af));

    const a0 = {
      admin: 0,
    };
    assert.isFalse(helpers.isAdmin(a0));

    const e = {};
    assert.isFalse(helpers.isAdmin(e));

    return done();
  });

  it("isSuper", function(done) {
    const sa = {
      superuser: 1,
    };
    assert.isTrue(helpers.isSuper(sa));

    const sf = {
      superuser: 0,
    };
    assert.isFalse(helpers.isSuper(sf));

    return done();
  });

  it("isActive", function(done) {
    const a = {
      active: true,
    };
    assert.isTrue(helpers.isActive(a));

    const i = {
      active: "false",
    };
    assert.isFalse(helpers.isActive(i));
    return done();
  });
});
