var path = require('path');
module.exports = function(gulp, $, cfg) {
  var gulpCfg = cfg.gulp;
  gulp.task('dist', ['build'], function() {
    var s = $.size({
              title: 'm-react dist',
              gzip: true
            });
    return gulp.src(path.join(gulpCfg.dest.build, gulpCfg.dest.outputFile))
    .pipe($.uglify())
    .pipe(s)
    .pipe($.rename({
      extname: '.min.js'
    })).pipe(gulp.dest(gulpCfg.dest.dist))
  });
};