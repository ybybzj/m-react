var source = require('vinyl-source-stream');
var gulpUtil = require('gulp-util');
var esperantoBundle = require('esperanto-bundle-stream');
var babelWhitelist = ['es6.arrowFunctions', 'es6.blockScoping', 'es6.classes', 'es6.constants', 'es6.destructuring', 'es6.parameters.default', 'es6.parameters.rest', 'es6.properties.shorthand', 'es6.templateLiterals'];
var babelCfg = {
  whitelist: babelWhitelist,
  loose: "all"
};
module.exports = function(gulp, $, cfg) {
  var gulpCfg = cfg.gulp;
  gulp.task('es6To5', ['clean'], function(){
    return gulp.src(gulpCfg.src.entries)
          .pipe($.babel(babelCfg))
          .pipe(gulp.dest('tmp'));
  });
  gulp.task('build', ['es6To5'], function() {
    return esperantoBundle({
              base: 'tmp', // optional, defaults to current dir
              entry: 'index.js', // the '.js' is optional
              type: 'umd',
              name:'mReact',
              sourceMap: true
            })
            .pipe(source(gulpCfg.dest.outputFile))
            // .pipe($.streamify($.babel(babelCfg)))
            .pipe(gulp.dest(gulpCfg.dest.build));
  });
};