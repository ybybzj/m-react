module.exports = function(gulp, $, cfg) {
  gulp.task('watch', function() {
    var watcher = gulp.watch(cfg.gulp.src.entries, ['build']);
    watcher.on('change',function(event) {
      console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');

    });
  });
};