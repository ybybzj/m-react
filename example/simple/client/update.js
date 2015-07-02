module.exports = function(w) {
  w('tempChange', function(state, temp) {
    state.store.set('temp', temp);
  });
};