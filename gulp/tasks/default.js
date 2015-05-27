var runSequence = require('run-sequence');
module.exports = function(gulp, $){
  gulp.task('default', function(cb){
    runSequence('dist', 'clean:tmp', cb);
  });
};