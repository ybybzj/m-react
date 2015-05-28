var browserSync = require('browser-sync');
module.exports = function(gulp, $, cfg) {
  gulp.task('transform-msx', function(){
    return gulp.src('./example/app.jsx')
    .pipe($.msx())
    .pipe(gulp.dest('./example'));
  });
  gulp.task('sync', ['dist', 'transform-msx'], function() {
    browserSync({
      files: ['./example/app.js', './example/index.html', './build/*.js'],
      server: {
        baseDir: ['./example'],
        routes: {
          '/vendors': './build',
          '/lib': './node_modules'
        },
      },
      open: true
    });
    gulp.watch('./example/*.css').on('change', function() {
      gulp.src('./example/*.css').pipe(browserSync.reload({
        stream: true
      }));
    });
  });
};