module.exports = function(watch){
  watch('todoToggled', onTodoToggled);
  watch('todoEdited', onTodoEdited);
  watch('todoDestroyed', onTodoDestroyed);
  watch('todoSaved', onTodoSaved);
  watch('todoCanceled', onTodoCanceled);
  watch('todoCreated', onTodoCreated);
  watch('filterChanged', onFilterChanged);
  watch('completedCleared', onCompletedCleared);
  watch('allToggled', onAllToggled);
};

function onTodoToggled(state, data){
  _updateTodo(state, data, {
    completed: function(c){return !c;},
  });
  state.store.commit();
}

function onTodoEdited(state, data){
  _updateTodo(state, data, {status: 'editing'});
}
function onTodoDestroyed(state, data){
  var store = state.store,
      ref = state.refs.todos.get(data.id),
      indexes = store.get('index');
  state.refs.todos.remove(ref);
  store.unset(['todos', ref]);
  store.splice('index', [indexes.indexOf(ref), 1]);
}
function onTodoSaved(state, data){
  _updateTodo(state, data, {
    title: data.value,
    status: 'saved'
  });
}
function onTodoCanceled(state, data){
  _updateTodo(state, data, {status: 'saved'});
}
function onTodoCreated(state, data){
  var newTodo = {
    title: data.val,
    status: 'created'
  };
  var newRef =  state.refs.todos.create(),
      newId = newRef;
  state.refs.todos.update(newRef, newId);
  newTodo.id = newId;
  state.store.set(['todos', newRef], newTodo);
  state.store.unshift('index', newRef);
}

function onFilterChanged(state, filter){
  state.store.set('filter', filter);
}
function onCompletedCleared(state){
  _updateTodos(state, {
    completed: false
  });
}
function onAllToggled(state, completed){
  _updateTodos(state, {
    completed: completed
  });
}
//helpers
function _updateTodo(state, data, update){
  var ref = state.refs.todos.get(data.id),
      cursor = state.store.select('todos');
  Object.keys(update).forEach(function(k){
    var val = update[k];
    if(typeof val === 'function'){
      val = val(cursor.get([ref,k]));
    }
    cursor.set([ref, k], val);
  });
}

function _updateTodos(state, update){
  var index = state.store.get('index'),
      store = state.store,
      cursor = store.select('todos');
  index.forEach(function(ref){
    cursor.merge(ref, update);
  });
}