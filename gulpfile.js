var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var pkgCfg = require('./package.json');
require(pkgCfg.gulpDirectory || './gulp').loadTasks(gulp, $, pkgCfg);