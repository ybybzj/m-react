module.exports = {
  data: {
    todos: {},
    index:[],
    filter: 'all'
  },
  facets: {
    showingTodos: {
      cursors: {
        todos: 'todos',
        index: 'index',
        filter: 'filter'
      },
      get: function(data) {
        return values(data.todos, data.index).filter(function(item) {
          switch (data.filter) {
            case 'active':
              return !item.completed;
            case 'completed':
              return item.completed;
            default:
              return true;
          }
        });
      }
    },
    completedCount: {
      cursors: {
        todos: 'todos',
        index: 'index'
      },
      get: function(data) {
        return values(data.todos, data.index).reduce(function(accum, todo) {
          return !todo.completed ? accum : accum + 1;
        }, 0);
      }
    },
    activeTodoCount: {
      cursors: {
        todos: 'todos',
        index: 'index'
      },
      get: function(data) {
        return values(data.todos, data.index).reduce(function(accum, todo) {
          return todo.completed ? accum : accum + 1;
        }, 0);
      }
    }
  },
  refs:{
    todos: 'todos'
  },
  options: {
    syncwrite: true
  }
};

function values(obj, index){
  var result = [];
  for(var i= 0, l = index.length; i < l; i++){
    result.push(obj[index[i]]);
  }
  return result;
}