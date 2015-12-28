var rollup = require('rollup');
var babel = require('rollup-plugin-babel');
module.exports = function(gulp, $, cfg) {
  var gulpCfg = cfg.gulp;
  gulp.task('build', ['clean'], function(){
    return rollup.rollup({
      entry: 'src/' + gulpCfg.src.entry,
      plugins: [
        babel()
      ]
    }).then(function(bundle){
      bundle.write({
        format: 'umd',
        moduleName: 'mReact',
        moduleId: 'm-react',
        dest: gulpCfg.dest.build + '/m-react.js'
      });
    });
  });
};
