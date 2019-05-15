const gulp = require("gulp");
const shell = require('gulp-shell')
const mocha = require("gulp-mocha");
const del = require("del");
const gulpTSLint = require("gulp-tslint");
const TSLint = require("tslint");

const tsProjectFileName = "src/tsconfig.json";

gulp.task('clean', function(){
  return del('build/**', {force:true});
});


gulp.task("ts", gulp.series("clean", shell.task("tsc -p .\\src")));

gulp.task("tslint", function() {
  const sources = [
    "src/**/*.ts",
    "!src/**/*.d.ts"
  ];
  const lintProgram = TSLint.Linter.createProgram(tsProjectFileName);
  return gulp.src(sources)
    .pipe(gulpTSLint({
      program: lintProgram,
      formatter: "verbose",
      configuration: "tslint.json"
    }))
    .pipe(gulpTSLint.report());
});

gulp.task("test", gulp.series(gulp.parallel("tslint", "ts"), function runTests() {
  const tests = [
    "build/src/test/*.js",
    "build/src/test/store/*.js"
  ];
  const srcOpts = {
    read: false
  };
  return gulp.src(tests, srcOpts)
    .pipe(mocha({
      reporter: "list"
    }));
}));

gulp.task("watch", gulp.series("clean", shell.task("tsc -p .\\src --watch")));
