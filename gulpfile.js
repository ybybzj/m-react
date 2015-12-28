var gulp = require('gulp');
var p = require('path');
require('gulp-load-dir')(gulp, {
  gulp: require(p.resolve(__dirname, 'gulp', 'config.json'))
});
