import {
  requestAnimationFrame as raf,
  cancelAnimationFrame as cancelRaf,
  FRAME_BUDGET
} from './raf';
import {
  type,
  NOOP
} from '../utils';
function Batch(opts) {
  this.options = opts || {};
  var cb = this.options.onFlush;
  this._cb = type(cb) === 'function' ? cb : NOOP;
  this._queue = [];
  this._startPos = 0;
  this.flush = this.flush.bind(this);
}
Batch.prototype.addTarget = function(target) {
  var oldLen = this._queue.length;
  if(type(this.options.onAddTarget) === 'function'){
    this._queue = this.options.onAddTarget.call(this, this._queue, target);
  }else{
    this._queue.push(target);
  }
  
  if (oldLen === 0 && this._queue.length === 1) {
    this.scheduleFlush();
  }
  return this;
};
Batch.prototype.removeTarget = function(target) {
  var idx = this._queue.indexOf(target);
  if (idx !== -1) this._queue.splice(idx, 1);
  return this;
};
Batch.prototype.flush = function() {
  var startTime = new Date(),
    elapsedTime,
    cb = this._cb,
    startPos = this._startPos,
    task, _i, _len, _ref;
  _ref = this._queue;
  for (_i = startPos, _len = _ref.length; _i < _len; _i++) {
    task = _ref[_i];
    cb.call(null, task);
    elapsedTime = (new Date()) - startTime;
    if (elapsedTime > FRAME_BUDGET) {
      console.log('frame budget overflow:', elapsedTime);
      _i++;
      break;
    }
  }
  
  this._queue.splice(0, _i);
  this._startPos = 0;

  if (this._queue.length) {
    this.scheduleFlush();
  }else{
    if(type(this.options.onFinish) === 'function'){
      this.options.onFinish.call(null);
    }
  }
};
Batch.prototype.scheduleFlush = function() {
  this._tick = raf(this.flush);
  return this._tick;
};
Batch.prototype.onFlush = function(fn) {
  if (type(fn) !== 'function') {
    throw new TypeError('[Batch.prototype.onFlush]need a Function here, but given ' + fn);
  }
  this._cb = fn;
  return this;
};
Batch.prototype.length = function() {
  return this._queue.length;
};
Batch.prototype.stop = function() {
  cancelRaf(this._tick);
  this._queue.length = 0;
  return this;
};
['onAddTarget','onFinish'].forEach(function(mname){
  Batch.prototype[mname] = function(fn){
    if (type(fn) !== 'function') {
      throw new TypeError('[Batch.prototype.'+mname+']need a Function here, but given ' + fn);
    }
    this.options[mname] = fn;
    return this;
  };
});
export default Batch;