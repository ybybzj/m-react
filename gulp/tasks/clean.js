var registerArgTask = require('../util/registerArgTask');
module.exports = function(_,_,cfg){
  registerArgTask('clean', ['build','dist', 'tmp'], function(arg, cb) {
    var rmDest = (function() {
      switch (arg) {
        case 'build':
          return cfg.gulp.dest[arg];
        case 'dist':
          return cfg.gulp.dest[arg];
        case 'tmp':
          return 'tmp';
        default:
          return '';
      }
    })();
    require('rimraf')(rmDest, cb);
  });
};