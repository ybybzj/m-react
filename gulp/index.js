exports.loadTasks = function(gulp, $, pkgCfg){
  var tasks = require('./tasks');
  Object.keys(tasks).forEach(function(loaderName){
    tasks[loaderName](gulp, $, {
      pkg: pkgCfg,
      gulp: require('./config.json')
    });
  });
};