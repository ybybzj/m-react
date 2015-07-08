export default function Map() {
  if (!this instanceof Map) {
    return new Map();
  }
  this._index = -1;
  this._keys = [];
  this._values = [];
}
Map.prototype = {
  has: function(key) {
    validateKey(key);
    var list = this._keys,
      i;
    if (key != key || key === 0) { //NaN or 0
      for (i = list.length; i-- && !is(list[i], key);) {}
    } else {
      i = list.indexOf(key);
    }
    //update index
    this._index = i;
    return -1 < i;
  },
  clear: function() {
    this._keys.length = 0;
    this._values.length = 0;
    this._index = -1;
  },
  set: function(key, value) {
    this.has(key) ? 
      this._values[this._index] = value 
      : 
      this._values[this._keys.push(key) - 1] = value;
    return this;
  },
  get: function(key, defaultValue) {
    if (this.has(key)) {
      return this._values[this._index];
    } else {
      if (arguments.length > 1) {
        this.set(key, defaultValue);
      }
      return defaultValue;
    }
  },
  remove: function(key) {
    var i = this._index;
    if (this.has(key)) {
      this._keys.splice(i, 1);
      this._values.splice(i, 1);
    }
    return -1 < i;
  },
  each: function(fn){
    if(typeof fn !== 'function') return;
    var i = 0, l = this._keys.length;
    for(;i < l; i++){
      fn(this._values[i], this._keys[i]);
    }
  }
};
//detect NaN/0 equality
function is(a, b) {
  return isNaN(a) ? isNaN(b) : a === b;
}

function validateKey(key) {
  if (key !== Object(key)) {
    throw new TypeError('[Map]Invalid value used as a map key! given: ' + key);
  }
}