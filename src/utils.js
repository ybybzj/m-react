export { NOOP, type, slice, gettersetter, hasOwn, _extend, extend, removeVoidValue, toArray, getHash,matchReg };

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
    case '[object RegExp]':
      return 'regexp';
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
function _extend(/*o ...*/ ) {
  var l = arguments.length,
    i = 0,
    k, o,
    target;
  while (i < l) {
    target = arguments[i];
    if(target === Object(target)){
      break;
    }
    i++;
  }
  if(i === l){
    return {};
  }
  
  i++;
  while(i < l){
    o = arguments[i++];
    if(o !== Object(o)){
      continue;
    }
    for (k in o) {
      if (hasOwn(o, k)) {
        target[k] = o[k];
      }
    }
  }
  return target;
}
function extend(/*o ...*/ ) {
  var args = slice(arguments);
  return _extend.apply(null, [{}].concat(args));
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

//only flatten one level, since other case is rare
function _flatten(a){
  var result = [], needFlatten = true;
  for(let i=0,l = a.length; i < l; i++){
    let item = a[i];
    if(type(item) === 'array'){
      result.push(item);
    }else{
      needFlatten = false;
      break;
    }
  }
  if(needFlatten === false || a.length === 0){
    result = a;
  }else{
    result = [].concat.apply([], result);
  }
  return result;
}

function toArray(a){
  switch(type(a)){
    case 'undefined':
    case 'null':
      return [];
    case 'array':
      return _flatten(a);
    default:
      return [a];
  }
}
function getHash () {
  return Object.create(null);
}
function matchReg(str, reg){
  if(type(str) !== 'string' || type(reg) !== 'regexp'){
    return null;
  }
  return str.match(reg);
}