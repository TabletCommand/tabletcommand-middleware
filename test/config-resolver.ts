import _ = require("lodash");
const assert = require("chai").assert;

const configResolver = require("../").configResolver();

describe("config-resolver", function() {
  context("redisURL", function() {
    it("returns the same url, if only one was defined", function(done) {
      const expectedURL = "redis://x:password@10.10.11.11:6370";
      const expectedResult = configResolver.redisURL(expectedURL);

      assert.equal(expectedURL, expectedResult);

      return done();
    });

    it("parses url and returns one random host", function(done) {
      const expectedURLs = [
        "redis://x:password@10.10.11.11:5000",
        "redis://x:password@10.10.12.12:6000"
      ];
      const expectedResult = configResolver.redisURL("redis://x:password@10.10.11.11:5000,10.10.12.12:6000");
      assert.isTrue(_.indexOf(expectedURLs, expectedResult) > -1);
      return done();
    });

    it("invalid url returns the same string", function(done) {
      const invalidURL = "abcd";
      const expectedResult = configResolver.redisURL(invalidURL);
      assert.equal(invalidURL, expectedResult);
      return done();
    });
  });
});
