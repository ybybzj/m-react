var map$ = require('@zj/r-stream/composer/map');
module.exports = function(signal) {
  signal.add('input')
      .add('tempChange', ['input'], map$(function(e) {
          return e.target.value;
      }));
  signal.resolve();
}