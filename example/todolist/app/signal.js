module.exports = function(signal){
  signal.add('filterChanged')
    .add('completedCleared')
    .add('allToggled')
    .add('todoToggled')
    .add('todoEdited')
    .add('todoDestroyed')
    .add('todoSaved')
    .add('todoCanceled')
    .add('todoCreated');
  signal.resolve();
};