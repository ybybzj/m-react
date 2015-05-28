var express = require('express');
var browserify = require('browserify-middleware');
var compression = require('compression');
var logger = require('morgan');
var $node = {
  path: require('path')
};
var app = express();
app.use(compression());
app.use(logger('dev'));
app.use(express.static(__dirname));
app.get('/app.js', browserify('./client/app.msx',{transform: ['mithrilify']}));
app.listen(3000);