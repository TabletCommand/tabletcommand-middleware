"use strict";

const gulp = require("gulp");
const eslint = require("gulp-eslint");
const mocha = require("gulp-mocha");

gulp.task("default", ["lint", "test"]);

gulp.task("lint", function() {
  const sources = [
    "*.js",
    "lib/*.js",
    "middleware/*.js",
    "routes/*.js",
    "test/*.js"
  ];
  return gulp.src(sources)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task("test", function() {
  const tests = [
    "test/*.js"
  ];
  const srcOpts = {
    read: false
  };
  return gulp.src(tests, srcOpts)
    .pipe(mocha({
      reporter: "list"
    }));
});
