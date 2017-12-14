"use strict";

const gulp = require("gulp");
const eslint = require("gulp-eslint");
const mocha = require("gulp-mocha");
const babel = require("gulp-babel");

gulp.task("default", ["lint", "test", "transpile"]);

gulp.task("lint", function() {
  const sources = [
    "*.js",
    "src/lib/**",
    "src/middleware/*.js",
    "src/routes/*.js",
    "test/*.js"
  ];
  return gulp.src(sources)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task("test", ["lint"], function() {
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

gulp.task("transpile", ["test"], function() {
  const sources = [
    "src/middleware/*.js",
    "src/lib/**",
    "src/routes/*.js"
  ];
  const srcOpts = {
    base: "src"
  };
  return gulp.src(sources, srcOpts)
    .pipe(babel())
    .pipe(gulp.dest("dist"));
});
