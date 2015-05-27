export { NOOP, type, slice, gettersetter, hasOwn, extend, removeVoidValue, toArray };

function NOOP() {};

function type(o) {
  if (o === null) {
    return 'null';
  }
  if (o === undefined) {
    return 'undefined';
  }
  if (o !== o) {
    return 'NaN';
  }
  var typeStr = Object.prototype.toString.call(o);
  switch (typeStr) {
    case '[object Object]':
      return 'object';
    case '[object Array]':
      return 'array';
    case '[object String]':
      return 'string';
    case '[object Function]':
      return 'function';
    case '[object Number]':
      return 'number';
    default:
      return 'unknown';
  }
}

function slice() {
  var args = [].slice.call(arguments, 1);
  return [].slice.apply(arguments[0], args);
};

function gettersetter(store) {
  var prop = function() {
    if (arguments.length) store = arguments[0];
    return store;
  };
  prop.toJSON = function() {
    return store;
  };
  return prop;
}

function hasOwn(o, k) {
  return Object.prototype.hasOwnProperty.call(o, k);
}
function extend(target /*, o ...*/ ) {
  var result = {}, l = arguments.length,
    i = 0,
    k, o;
  while (i < l) {
    o = arguments[i++];
    for (k in o) {
      if (hasOwn(o, k)) {
        result[k] = o[k];
      }
    }
  }
  return result;
}
function removeVoidValue(o){
  if(type(o) !== 'object'){
    throw new TypeError('[removeVoidValue]param should be a object! given: '+ o);
  }
  var result = {};
  Object.keys(o).forEach(function(k){
    if(o[k] !== undefined){
      result[k] = o[k];
    }
  });
  return result;
}

function toArray(a){
  switch(type(a)){
    case 'undefined':
    case 'null':
      return [];
    case 'array':
      return a;
    default:
      return [a];
  }
}