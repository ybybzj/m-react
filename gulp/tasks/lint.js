module.exports = function(gulp, $, cfg) {
  gulp.task('lint', function () {
    var eslint = $.eslint;
    return gulp.src(cfg.gulp.src.entries)
        // eslint() attaches the lint output to the eslint property
        // of the file object so it can be used by other modules.
        .pipe(eslint({useEslintrc: true}))
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failOnError last.
        .pipe(eslint.failOnError());
  });
};