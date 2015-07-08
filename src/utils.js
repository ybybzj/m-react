function NOOP() {}

var typeReg = /^\[object (\w+)\]$/;
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
  var tm = Object.prototype.toString.call(o).match(typeReg);
  return tm == null ? 'unknown' : tm[1].toLowerCase();
}
var _slice = Array.prototype.slice;
function slice() {
  return _slice.apply(arguments[0], _slice.call(arguments, 1));
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
    throw new TypeError('[removeVoidValue]param should be a object! given: ' + o);
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
  for(let i = 0, l = a.length; i < l; i++){
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
// *
//  * function to extract two types relative to batch update activity.
//  * TaskType - indicate the way of handling the corresponding task.
//  *            type bitmask(0 => render; 1 => redraw)
//  * MergeType - indicate how to merge current task into the task queue.
//  *            type bitmask(0 => contain; 1 => replace)
//  * @param  {[Positive Number]} tMask, result of bitwise operation on type bitmask
//  * so, 0 => TaskType.render | MergeType.contain(00)
//  *     1 => TaskType.render | MergeType.replace(01)
//  *     2 => TaskType.redraw | MergeType.contain(10)
//  *     3 => TaskType.redraw | MergeType.replace(11)
//  * @return {[types]}       [taskType, mergeType]

// function extractTaskTypes(tMask){
//   return [(tMask&2)>>1, (tMask&1)];
// }
// var isAncestorOf = 'compareDocumentPosition' in document.documentElement ?
//                         function (el, container) {
//                             return (container.compareDocumentPosition(el)&16) === 16 ;
//                         } :
//                         function (el, container) {
//                             container = container === document || container === window ? document.documentElement : container;
//                             return container !== el && container.contains(el);
//                         };
function getParentElFrom(inQEl, taskEl){
  if(inQEl === taskEl){
    return taskEl;
  }
  var comparePosResult = inQEl.compareDocumentPosition(taskEl);
  if(comparePosResult & (16|8)){
    return comparePosResult&16 ? inQEl: taskEl;
  }else{
    return null;
  }
}
export { NOOP, type, slice, hasOwn, _extend, extend, removeVoidValue, toArray, getHash, matchReg, getParentElFrom };
