var gulp = require('gulp');
var registerArgTask = module.exports = function registerArgTask(taskName, argumentsList, taskHandler) {
  if (!Array.isArray(argumentsList)) {
    argumentsList = [];
  }
  if (argumentsList.length === 0) {
    gulp.task(taskName, taskHandler);
  } else {
    argumentsList.forEach(function(arg) {
      var subTaskName = taskName + ':' + arg;
      gulp.task(subTaskName, function(cb) {
        return taskHandler.call(this, arg, cb);
      });
    });
    gulp.task(taskName, argumentsList.map(function(arg) {
      return taskName + ':' + arg;
    }));
  }
};