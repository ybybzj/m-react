(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define('m-react', factory) :
  global.mReact = factory();
}(this, function () { 'use strict';

  var babelHelpers = {};

  babelHelpers.classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  babelHelpers;
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
  function _extend() /*o ...*/{
    var l = arguments.length,
        i = 0,
        k,
        o,
        target;
    while (i < l) {
      target = arguments[i];
      if (target === Object(target)) {
        break;
      }
      i++;
    }
    if (i === l) {
      return {};
    }

    i++;
    while (i < l) {
      o = arguments[i++];
      if (o !== Object(o)) {
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
  function extend() /*o ...*/{
    var args = slice(arguments);
    return _extend.apply(null, [{}].concat(args));
  }
  function removeVoidValue(o) {
    if (type(o) !== 'object') {
      throw new TypeError('[removeVoidValue]param should be a object! given: ' + o);
    }
    var result = {};
    Object.keys(o).forEach(function (k) {
      if (o[k] !== undefined) {
        result[k] = o[k];
      }
    });
    return result;
  }

  //only flatten one level, since other case is rare
  function _flatten(a) {
    var result = [],
        needFlatten = true;
    for (var i = 0, l = a.length; i < l; i++) {
      var item = a[i];
      if (type(item) === 'array') {
        result.push(item);
      } else {
        needFlatten = false;
        break;
      }
    }
    if (needFlatten === false || a.length === 0) {
      result = a;
    } else {
      result = [].concat.apply([], result);
    }
    return result;
  }

  function toArray(a) {
    switch (type(a)) {
      case 'undefined':
      case 'null':
        return [];
      case 'array':
        return _flatten(a);
      default:
        return [a];
    }
  }
  function getHash() {
    return Object.create(null);
  }
  function matchReg(str, reg) {
    if (type(str) !== 'string' || type(reg) !== 'regexp') {
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
  function getParentElFrom(inQEl, taskEl) {
    if (inQEl === taskEl) {
      return taskEl;
    }
    var comparePosResult = inQEl.compareDocumentPosition(taskEl);
    if (comparePosResult & (16 | 8)) {
      return comparePosResult & 16 ? inQEl : taskEl;
    } else {
      return null;
    }
  }

  var tagReg = /(?:(^|#|\.)([^#\.\[\]]+))|(\[.+?\])/g;
  var attrReg = /\[(.+?)(?:=("|'|)(.*?)\2)?\]/;
  function m() {
    var tagStr = arguments[0],
        attrs = arguments[1],
        children = slice(arguments, 2);
    if (type(tagStr) !== 'string') {
      throw new Error('selector in m(selector, attrs, children) should be a string');
    }

    var hasAttr = attrs != null && type(attrs) === 'object' && !('tag' in attrs || 'view' in attrs) && !('subtree' in attrs),
        vNode = {
      tag: 'div',
      attrs: {}
    },
        match,
        pair,
        classAttrName,
        classes = [];
    //normalize arguments
    attrs = hasAttr ? attrs : {};
    classAttrName = 'class' in attrs ? 'class' : 'className';
    children = hasAttr ? children : slice(arguments, 1);
    vNode.children = type(children[0]) === 'array' ? children[0] : children;

    //parse tag string
    /*eslint no-cond-assign:0*/
    while (match = tagReg.exec(tagStr)) {
      if (match[1] === '' && match[2]) {
        vNode.tag = match[2];
      } else if (match[1] === '#') {
        vNode.attrs.id = match[2];
      } else if (match[1] === '.') {
        classes.push(match[2]);
      } else if (match[3][0] === '[') {
        pair = attrReg.exec(match[3]);
        vNode.attrs[pair[1]] = pair[3] || (pair[2] ? '' : true);
      }
    }

    if (classes.length > 0) {
      vNode.attrs[classAttrName] = classes.join(' ');
    }

    Object.keys(attrs).forEach(function (attrName) {
      var attrVal = attrs[attrName];
      if (attrName === classAttrName && type(attrVal) !== 'string' && attrVal.trim() !== '') {
        vNode.attrs[attrName] = (vNode.attrs[attrName] || '') + ' ' + attrVal;
      } else {
        vNode.attrs[attrName] = attrVal;
      }
    });

    return vNode;
  }

  m.trust = function (value) {
    /*eslint no-new-wrappers:0*/
    value = new String(value);
    value.$trusted = true;
    return value;
  };

  function Batch(opts) {
    this.options = opts || {};
    var cb = this.options.onFlush;
    this._cb = type(cb) === 'function' ? cb : NOOP;
    this._queue = [];
    this._startPos = 0;
    this.flush = this.flush.bind(this);
  }
  Batch.prototype.addTarget = function (target) {
    var oldLen = this._queue.length;
    if (type(this.options.onAddTarget) === 'function') {
      this._queue = this.options.onAddTarget.call(this, this._queue, target);
    } else {
      this._queue.push(target);
    }

    if (oldLen === 0 && this._queue.length === 1) {
      this.scheduleFlush();
    }
    return this;
  };
  Batch.prototype.removeTarget = function (target) {
    var idx = this._queue.indexOf(target);
    if (idx !== -1) {
      this._queue.splice(idx, 1);
    }
    return this;
  };
  Batch.prototype.flush = function () {
    var startTime = new Date(),
        elapsedTime,
        cb = this._cb,
        startPos = this._startPos,
        task,
        _i,
        _len,
        _ref;
    _ref = this._queue;
    for (_i = startPos, _len = _ref.length; _i < _len; _i++) {
      task = _ref[_i];
      cb.call(null, task);
      elapsedTime = new Date() - startTime;
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
    } else {
      if (type(this.options.onFinish) === 'function') {
        this.options.onFinish.call(null);
      }
    }
  };
  Batch.prototype.scheduleFlush = function () {
    if (this._tick) {
      cancelAnimationFrame(this._tick);
    }
    this._tick = requestAnimationFrame(this.flush);
    return this._tick;
  };
  Batch.prototype.onFlush = function (fn) {
    if (type(fn) !== 'function') {
      throw new TypeError('[Batch.prototype.onFlush]need a Function here, but given ' + fn);
    }
    this._cb = fn;
    return this;
  };
  Batch.prototype.length = function () {
    return this._queue.length;
  };
  Batch.prototype.stop = function () {
    cancelAnimationFrame(this._tick);
    this._queue.length = 0;
    return this;
  };
  ['onAddTarget', 'onFinish'].forEach(function (mname) {
    Batch.prototype[mname] = function (fn) {
      if (type(fn) !== 'function') {
        throw new TypeError('[Batch.prototype.' + mname + ']need a Function here, but given ' + fn);
      }
      this.options[mname] = fn;
      return this;
    };
  });

  function Map() {
    if (!this instanceof Map) {
      return new Map();
    }
    this._index = -1;
    this._keys = [];
    this._values = [];
  }
  Map.prototype = {
    has: function has(key) {
      validateKey(key);
      var list = this._keys,
          i;
      if (key != key || key === 0) {
        //NaN or 0
        for (i = list.length; i--;) {
          if (is(list[i], key)) {
            break;
          }
        }
      } else {
        i = list.indexOf(key);
      }
      //update index
      this._index = i;
      return i > -1;
    },
    clear: function clear() {
      this._keys.length = 0;
      this._values.length = 0;
      this._index = -1;
    },
    set: function set(key, value) {
      if (this.has(key)) {
        this._values[this._index] = value;
      } else {
        this._values[this._keys.push(key) - 1] = value;
      }
      return this;
    },
    get: function get(key, defaultValue) {
      if (this.has(key)) {
        return this._values[this._index];
      } else {
        if (arguments.length > 1) {
          this.set(key, defaultValue);
        }
        return defaultValue;
      }
    },
    remove: function remove(key) {
      var i = this._index;
      if (this.has(key)) {
        this._keys.splice(i, 1);
        this._values.splice(i, 1);
      }
      return i > -1;
    },
    each: function each(fn) {
      if (typeof fn !== 'function') {
        return;
      }
      var i = 0,
          l = this._keys.length;
      for (; i < l; i++) {
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

  function DOMDelegator(doc) {
    if (!this instanceof DOMDelegator) {
      return new DOMDelegator(doc);
    }

    doc = doc || $document || { documentElement: 1 }; //enable to run in nodejs;
    if (!doc.documentElement) {
      throw new Error('[DOMDelegator]Invalid parameter "doc", should be a document object! given: ' + doc);
    }
    this.root = doc.documentElement;
    this.listenedEvents = getHash();
    this.eventDispatchers = getHash();
    this.globalListeners = getHash();
    this.domEvHandlerMap = new Map();
  }
  var proto = DOMDelegator.prototype;

  proto.on = function on(el, evType, handler) {
    var evStore = getEvStore(this.domEvHandlerMap, el, getHash());
    addListener(evStore, evType, this, handler);
    return this;
  };

  proto.off = function off(el, evType, handler) {
    var evStore = getEvStore(this.domEvHandlerMap, el);
    if (!evStore) {
      return this;
    }
    if (arguments.length >= 3) {
      removeListener(evStore, evType, this, handler);
    } else if (arguments.length === 2) {
      removeListener(evStore, evType, this);
    } else {
      removeAllListener(evStore, this);
    }

    if (Object.keys(evStore).length === 0) {
      this.domEvHandlerMap.remove(el);
    }
    return this;
  };

  proto.addGlobalEventListener = function addGlobalEventListener(evType, handler) {
    addListener(this.globalListeners, evType, this, handler);
    return this;
  };
  proto.removeGlobalEventListener = function removeGlobalEventListener(evType, handler) {
    if (arguments.length >= 2) {
      removeListener(this.globalListeners, evType, this, handler);
    } else if (arguments.length === 1) {
      removeListener(this.globalListeners, evType, this);
    } else {
      removeAllListener(this.globalListeners, this);
    }
    return this;
  };
  proto.destroy = function destroy() {
    this.unlistenTo();
    this.listenedEvents = null;
    this.eventDispatchers = null;
    this.globalListeners = null;
    this.domEvHandlerMap.clear();
  };

  //for each evType, increase by 1 if there is a new el start to listen
  // to this type of event
  proto.listenTo = function listenTo(evType) {
    if (!(evType in this.listenedEvents)) {
      this.listenedEvents[evType] = 0;
    }
    this.listenedEvents[evType]++;

    if (this.listenedEvents[evType] !== 1) {
      return this;
    }
    var listener = this.eventDispatchers[evType];
    if (!listener) {
      listener = this.eventDispatchers[evType] = createDispatcher(evType, this);
    }
    addEventListener(this.root, evType, listener);
    return this;
  };
  //for each evType, decrease by 1 if there is a el stop to listen
  // to this type of event
  proto.unlistenTo = function unlistenTo(evType) {
    var eventDispatchers = this.eventDispatchers,
        delegator = this;
    if (arguments.length === 0) {
      //remove all dispatch listeners
      Object.keys(eventDispatchers).filter(function (etype) {
        var rtn = !!eventDispatchers[etype];
        if (rtn) {
          //force to call removeEventListener method
          eventDispatchers[etype] = 1;
        }
        return rtn;
      }).forEach(function (etype) {
        delegator.unlistenTo(etype);
      });
      return this;
    }
    if (!(evType in this.listenedEvents) || this.listenedEvents[evType] === 0) {
      console.log('[DOMDelegator unlistenTo]event "' + evType + '" is already unlistened!');
      return this;
    }
    this.listenedEvents[evType]--;
    if (this.listenedEvents[evType] > 0) {
      return this;
    }
    var listener = this.eventDispatchers[evType];
    if (!listener) {
      throw new Error('[DOMDelegator unlistenTo]: cannot ' + 'unlisten to ' + evType);
    }
    removeEventListener(this.root, evType, listener);
    return this;
  };

  function createDispatcher(evType, delegator) {
    var globalListeners = delegator.globalListeners,
        delegatorRoot = delegator.root;
    return function dispatcher(ev) {
      var globalHandlers = globalListeners[evType] || [];
      if (globalHandlers && globalHandlers.length > 0) {
        var globalEvent = new ProxyEvent(ev);
        globalEvent.target = delegatorRoot;
        callListeners(globalHandlers, globalEvent);
      }

      findAndInvokeListeners(ev.target, ev, evType, delegator);
    };
  }

  function findAndInvokeListeners(el, ev, evType, delegator) {
    var listener = getListener(el, evType, delegator);
    if (listener && listener.handlers.length > 0) {
      var listenerEvent = new ProxyEvent(ev);
      listenerEvent.currentTarget = listener.currentTarget;
      callListeners(listener.handlers, listenerEvent);
      if (listenerEvent._bubbles) {
        findAndInvokeListeners(listener.currentTarget.parentNode, ev, evType, delegator);
      }
    }
  }

  function getListener(target, evType, delegator) {
    if (target == null) {
      return null;
    }
    var evStore = getEvStore(delegator.domEvHandlerMap, target),
        handlers;
    if (!evStore || !(handlers = evStore[evType]) || handlers.length === 0) {
      return getListener(target.parentNode, evType, delegator);
    }
    return {
      currentTarget: target,
      handlers: handlers
    };
  }

  function callListeners(handlers, ev) {
    handlers.forEach(function (handler) {
      if (type(handler) === 'function') {
        handler(ev);
      } else if (type(handler.handleEvent) === 'function') {
        handler.handleEvent(ev);
      } else {
        throw new Error('[DOMDelegator callListeners] unknown handler ' + 'found: ' + JSON.stringify(handlers));
      }
    });
  }
  //helpers
  function getEvStore(map, el, defaultStore) {
    return arguments.length > 2 ? map.get(el, defaultStore) : map.get(el);
  }

  function addListener(evHash, evType, delegator, handler) {
    var handlers = evHash[evType] || [];
    if (handlers.length === 0) {
      //it's first time for this el to listen to event of evType
      delegator.listenTo(evType);
    }
    if (handlers.indexOf(handler) === -1) {
      handlers.push(handler);
    }
    evHash[evType] = handlers;
    return handler;
  }

  function removeListener(evHash, evType, delegator, handler) {
    var handlers = evHash[evType];
    if (!handlers || handlers.length === 0 || arguments.length === 3) {
      if (handlers && handlers.length) {
        //this el stop to listen to event of evType
        delegator.unlistenTo(evType);
      }
      delete evHash[evType];
      return handler;
    }
    var index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
    evHash[evType] = handlers;
    if (handlers.length === 0) {
      //this el stop to listen to event of evType
      delegator.unlistenTo(evType);
      delete evHash[evType];
    }
    return handler;
  }

  function removeAllListener(evHash, delegator) {
    Object.keys(evHash).forEach(function (evType) {
      removeListener(evHash, evType, delegator);
    });
    return evHash;
  }

  var $global = typeof window !== 'undefined' ? window : {};
  var $document = $global.document;
  var RT = typeof process !== 'undefined' && !process.browser ? 'nodejs' : typeof window !== 'undefined' ? 'browser' : 'unknown';
  var G = {
    forcing: false,
    unloaders: new Map(),
    computePreRedrawHook: null,
    computePostRedrawHook: null,
    //mount registries
    roots: [],
    recreations: [],
    components: [],
    controllers: [],
    //render registries
    domCacheMap: new Map(),
    domDelegator: new DOMDelegator(),
    //global batch render queue
    renderQueue: new Batch()
  };

  var lastTime = 0;
  var FRAME_BUDGET = 16;
  var vendors = ['webkit', 'moz', 'ms', 'o'];
  var requestAnimationFrame = $global.requestAnimationFrame;
  var cancelAnimationFrame = $global.cancelAnimationFrame || $global.cancelRequestAnimationFrame;
  for (var x = 0, l = vendors.length; x < l && !requestAnimationFrame; ++x) {
    requestAnimationFrame = $global[vendors[x] + 'RequestAnimationFrame'];
    cancelAnimationFrame = $global[vendors[x] + 'CancelAnimationFrame'] || $global[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  if (!requestAnimationFrame) {
    requestAnimationFrame = function (callback) {
      var currTime = Date.now ? Date.now() : new Date().getTime();
      var timeToCall = Math.max(0, FRAME_BUDGET - (currTime - lastTime));
      var id = setTimeout(function () {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  if (!cancelAnimationFrame) {
    cancelAnimationFrame = function (id) {
      return clearTimeout(id);
    };
  }

  //listen all event at capture phase
  function addEventListener(el, type, handler) {
    return el.addEventListener(type, handler, true);
  }

  //listen all event at capture phase
  function removeEventListener(el, type, handler) {
    return el.removeEventListener(type, handler, true);
  }

  var EV_PROPS = {
    all: ['altKey', 'bubbles', 'cancelable', 'ctrlKey', 'eventPhase', 'metaKey', 'relatedTarget', 'shiftKey', 'target', 'timeStamp', 'type', 'view', 'which'],
    mouse: ['button', 'buttons', 'clientX', 'clientY', 'layerX', 'layerY', 'offsetX', 'offsetY', 'pageX', 'pageY', 'screenX', 'screenY', 'toElement'],
    key: ['char', 'charCode', 'key', 'keyCode']
  };
  var rkeyEvent = /^key|input/;
  var rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/;
  function ProxyEvent(ev) {
    if (!this instanceof ProxyEvent) {
      return new ProxyEvent(ev);
    }
    this.init(ev);

    if (rkeyEvent.test(ev.type)) {
      synthesizeEvProps(this, ev, 'key');
    } else if (rmouseEvent.test(ev.type)) {
      synthesizeEvProps(this, ev, 'mouse');
    }
  }
  ProxyEvent.prototype = extend(ProxyEvent.prototype, {
    init: function init(ev) {
      synthesizeEvProps(this, ev, 'all');
      this.originalEvent = ev;
      this._bubbles = false;
    },
    preventDefault: function preventDefault() {
      return this.originalEvent.preventDefault();
    },
    startPropagation: function startPropagation() {
      this._bubbles = true;
    }
  });

  function synthesizeEvProps(proxy, ev, category) {
    var evProps = EV_PROPS[category];
    for (var i = 0, l = evProps.length; i < l; i++) {
      var prop = evProps[i];
      proxy[prop] = ev[prop];
    }
  }

  var domCacheMap$1 = G.domCacheMap;
  var domDelegator = G.domDelegator;
  function clear(domNodes, vNodes) {
    vNodes = vNodes || [];
    vNodes = [].concat(vNodes);
    for (var i = domNodes.length - 1; i > -1; i--) {
      if (domNodes[i] && domNodes[i].parentNode) {
        if (vNodes[i]) {
          unload(vNodes[i]);
        } // cleanup before dom is removed from dom tree
        domDelegator.off(domNodes[i]);
        domCacheMap$1.remove(domNodes[i]);
        try {
          domNodes[i].parentNode.removeChild(domNodes[i]);
          /*eslint no-empty:0*/
        } catch (e) {} //ignore if this fails due to order of events (see http://stackoverflow.com/questions/21926083/failed-to-execute-removechild-on-node)
      }
    }
    if (domNodes.length != 0) {
      domNodes.length = 0;
    }
  }

  function unload(vNode) {
    if (vNode.configContext && type(vNode.configContext.onunload) === 'function') {
      vNode.configContext.onunload();
      vNode.configContext.onunload = null;
    }
    if (vNode.controllers) {
      for (var i = 0, l = vNode.controllers.length; i < l; i++) {
        var controller = vNode.controllers[i];
        if (type(controller.onunload) === 'function') {
          controller.onunload({ preventDefault: NOOP });
          G.unloaders.remove(controller); //unload function should only execute once
        }
      }
    }
    if (vNode.children) {
      if (type(vNode.children) === 'array') {
        for (var i = 0, l = vNode.children.length; i < l; i++) {
          var child = vNode.children[i];
          unload(child);
        }
      } else if (vNode.children.tag) {
        unload(vNode.children);
      }
    }
  }

  var domDelegator$1 = G.domDelegator;
  var evAttrReg = /^ev([A-Z]\w*)/;
  function setAttributes(domNode, tag, dataAttrs, cachedAttrs, namespace) {
    Object.keys(dataAttrs).forEach(function (attrName) {
      var dataAttr = dataAttrs[attrName],
          cachedAttr = cachedAttrs[attrName],
          evMatch;

      if (!(attrName in cachedAttrs) || cachedAttr !== dataAttr) {
        cachedAttrs[attrName] = dataAttr;
        try {
          //`config` isn't a real attributes, so ignore it
          if (attrName === 'config' || attrName == 'key') {
            return;
          }
          //hook event handlers to the auto-redrawing system
          else if (type(dataAttr) === 'function' && attrName.indexOf('on') === 0) {
              domNode[attrName] = dataAttr;
              // bind handler to domNode for a delegation event
            } else if ((evMatch = matchReg(attrName, evAttrReg)) && evMatch[1].length) {
                var evType = evMatch[1].toLowerCase();
                domDelegator$1.off(domNode, evType);
                if (isHandler(dataAttr)) {
                  domDelegator$1.on(domNode, evType, dataAttr);
                }
              }
              //handle `style: {...}`
              else if (attrName === 'style' && dataAttr != null && type(dataAttr) === 'object') {
                  Object.keys(dataAttr).forEach(function (rule) {
                    if (cachedAttr == null || cachedAttr[rule] !== dataAttr[rule]) {
                      domNode.style[rule] = dataAttr[rule];
                    }
                  });
                  if (type(cachedAttr) === 'object') {
                    Object.keys(cachedAttr).forEach(function (rule) {
                      if (!(rule in dataAttr)) {
                        domNode.style[rule] = '';
                      }
                    });
                  }
                }
                //handle SVG
                else if (namespace != null) {
                    if (attrName === 'href') {
                      domNode.setAttributeNS('http://www.w3.org/1999/xlink', 'href', dataAttr);
                    } else if (attrName === 'className') {
                      domNode.setAttribute('class', dataAttr);
                    } else {
                      domNode.setAttribute(attrName, dataAttr);
                    }
                  }
                  //handle cases that are properties (but ignore cases where we should use setAttribute instead)
                  //- list and form are typically used as strings, but are DOM element references in js
                  //- when using CSS selectors (e.g. `m('[style='']')`), style is used as a string, but it's an object in js
                  else if (attrName in domNode && !(attrName === 'list' || attrName === 'style' || attrName === 'form' || attrName === 'type' || attrName === 'width' || attrName === 'height')) {
                      //#348 don't set the value if not needed otherwise cursor placement breaks in Chrome
                      if (tag !== 'input' || domNode[attrName] !== dataAttr) {
                        domNode[attrName] = dataAttr;
                      }
                    } else {
                      domNode.setAttribute(attrName, dataAttr);
                    }
        } catch (e) {
          //swallow IE's invalid argument errors to mimic HTML's fallback-to-doing-nothing-on-invalid-attributes behavior
          if (e.message.indexOf('Invalid argument') < 0) {
            throw e;
          }
        }
      }
      //#348 dataAttr may not be a string, so use loose comparison (double equal) instead of strict (triple equal)
      else if (attrName === 'value' && tag === 'input' && domNode.value != dataAttr) {
          domNode.value = dataAttr;
        }
    });
    return cachedAttrs;
  }

  function isHandler(handler) {
    return type(handler) === 'function' || handler && type(handler.handleEvent) === 'function';
  }

  //`build` is a recursive function that manages creation/diffing/removal of DOM elements based on comparison between `data` and `cached`
  //the diff algorithm can be summarized as this:
  //1 - compare `data` and `cached`
  //2 - if they are different, copy `data` to `cached` and update the DOM based on what the difference is
  //3 - recursively apply this algorithm for every array and for the children of every virtual element
  //the `cached` data structure is essentially the same as the previous redraw's `data` data structure, with a few additions:
  //- `cached` always has a property called `nodes`, which is a list of DOM elements that correspond to the data represented by the respective virtual element
  //- in order to support attaching `nodes` as a property of `cached`, `cached` is *always* a non-primitive object, i.e. if the data was a string, then cached is a String instance. If data was `null` or `undefined`, cached is `new String('')`
  //- `cached also has a `configContext` property, which is the state storage object exposed by config(element, isInitialized, context)
  //- when `cached` is an Object, it represents a virtual element; when it's an Array, it represents a list of elements; when it's a String, Number or Boolean, it represents a text node
  //`parentElement` is a DOM element used for W3C DOM API calls
  //`parentTag` is only used for handling a corner case for textarea values
  //`parentCache` is used to remove nodes in some multi-node cases
  //`parentIndex` and `index` are used to figure out the offset of nodes. They're artifacts from before arrays started being flattened and are likely refactorable
  //`data` and `cached` are, respectively, the new and old nodes being diffed
  //`shouldReattach` is a flag indicating whether a parent node was recreated (if so, and if this node is reused, then this node must reattach itself to the new parent)
  //`editable` is a flag that indicates whether an ancestor is contenteditable
  //`namespace` indicates the closest HTML namespace as it cascades down from an ancestor
  //`configs` is a list of config functions to run after the topmost `build` call finishes running
  //there's logic that relies on the assumption that null and undefined data are equivalent to empty strings
  //- this prevents lifecycle surprises from procedural helpers that mix implicit and explicit return statements (e.g. function foo() {if (cond) return m('div')}
  //- it simplifies diffing code
  //data.toString() might throw or return null if data is the return value of Console.log in Firefox (behavior depends on version)
  var VOID_ELEMENTS = /^(AREA|BASE|BR|COL|COMMAND|EMBED|HR|IMG|INPUT|KEYGEN|LINK|META|PARAM|SOURCE|TRACK|WBR)$/;
  function build(parentElement, parentTag, parentCache, parentIndex, data, cached, shouldReattach, index, editable, namespace, configs) {
    //data.toString() might throw or return null if data is the return value of Console.log in firefox (behavior depends on version)
    try {
      if (data == null || data.toString() == null) {
        data = '';
      }
    } catch (_) {
      data = '';
    }
    if (data.subtree === 'retain') {
      return cached;
    }
    var cachedType = type(cached),
        dataType = type(data),
        intact;
    if (cached == null || cachedType !== dataType) {
      // validate cached
      cached = clearCached(data, cached, index, parentIndex, parentCache, dataType);
    }
    if (dataType === 'array') {
      // children diff
      data = _recursiveFlatten(data);
      intact = cached.length === data.length;
      cached = diffChildrenWithKey(data, cached, parentElement);
      cached = diffArrayItem(data, cached, parentElement, parentTag, index, shouldReattach, intact, editable, namespace, configs);
    } else if (data != null && dataType === 'object') {
      // attributes diff
      cached = diffVNode(data, cached, parentElement, index, shouldReattach, editable, namespace, configs);
    } else if (type(data) !== 'function') {
      //handle text nodes
      cached = diffTextNode(data, cached, parentElement, parentTag, index, shouldReattach, editable);
    }
    return cached;
  }
  //diff functions
  function clearCached(data, cached, index, parentIndex, parentCache, dataType) {
    var offset, end;
    if (cached != null) {
      if (parentCache && parentCache.nodes) {
        offset = index - parentIndex;
        end = offset + (dataType === 'array' ? data : cached.nodes).length;
        clear(parentCache.nodes.slice(offset, end), parentCache.slice(offset, end));
      } else if (cached.nodes) {
        clear(cached.nodes, cached);
      }
    }
    cached = new data.constructor();
    if (cached.tag) {
      cached = {};
    }
    cached.nodes = [];
    return cached;
  }

  function diffChildrenWithKey(data, cached, parentElement) {
    //keys algorithm: sort elements without recreating them if keys are present
    //1) create a map of all existing keys, and mark all for deletion
    //2) add new keys to map and mark them for addition
    //3) if key exists in new list, change action from deletion to a move
    //4) for each key, handle its corresponding action as marked in previous steps
    var DELETION = 1,
        INSERTION = 2,
        MOVE = 3;
    var existing = {},
        shouldMaintainIdentities = false;
    // 1)
    cached.forEach(function (cachedNode, idx) {
      var key = _key(cachedNode);
      //normarlize key
      _normalizeKey(cachedNode, key);

      if (key !== undefined) {
        shouldMaintainIdentities = true;
        existing[key] = {
          action: DELETION,
          index: idx
        };
      }
    });
    // add keys to all items if at least one of items has a key attribute
    var guid = 0;
    if (data.some(function (dataNode) {
      var key = _key(dataNode);
      //normarlize key
      _normalizeKey(dataNode, key);
      return key !== undefined;
    })) {
      data.forEach(function (dataNode) {
        if (dataNode && dataNode.attrs && dataNode.attrs.key == null) {
          dataNode.attrs.key = '__mithril__' + guid++;
        }
      });
    }
    if (shouldMaintainIdentities && _isKeysDiffer()) {
      // 2), 3)
      data.forEach(_dataNodeToExisting);
      // 4)
      var changes = undefined,
          newCached = new Array(cached.length);
      changes = Object.keys(existing).map(function (key) {
        return existing[key];
      }).sort(function (a, b) {
        return a.action - b.action || a.index - b.index;
      });
      newCached.nodes = cached.nodes.slice();
      for (var i = 0, l = changes.length; i < l; i++) {
        _applyChanges(changes[i], newCached);
      }
      cached = newCached;
    }
    return cached;
    //helpers
    function _isKey(key) {
      return type(key) === 'string' || type(key) === 'number' && type(key) !== 'NaN';
    }

    function _key(nodeItem) {
      return nodeItem && nodeItem.attrs && _isKey(nodeItem.attrs.key) ? nodeItem.attrs.key : undefined;
    }
    function _normalizeKey(node, key) {
      if (!node || !node.attrs) {
        return;
      }
      if (key === undefined) {
        delete node.attrs.key;
      } else {
        node.attrs.key = key;
      }
    }

    function _isKeysDiffer() {
      if (data.length !== cached.length) {
        return true;
      }
      return data.some(function (dataNode, idx) {
        var cachedNode = cached[idx];
        return cachedNode.attrs && dataNode.attrs && cachedNode.attrs.key !== dataNode.attrs.key;
      });
    }

    function _dataNodeToExisting(dataNode, nodeIdx) {
      var key = _key(dataNode);
      if (key !== undefined) {
        if (!existing[key]) {
          existing[key] = {
            action: INSERTION,
            index: nodeIdx
          };
        } else {
          var fromIdx = existing[key].index;
          existing[key] = {
            action: MOVE,
            index: nodeIdx,
            from: fromIdx,
            element: cached.nodes[fromIdx] || $document.createElement('div')
          };
        }
      }
    }

    function _applyChanges(change, newCached) {
      var changeIdx = change.index,
          action = change.action;
      if (action === DELETION) {
        clear(cached[changeIdx].nodes, cached[changeIdx]);
        newCached.splice(changeIdx, 1);
      }
      if (action === INSERTION) {
        var dummy = $document.createElement('div');
        dummy.setAttribute('data-mref', changeIdx);
        var key = data[changeIdx].attrs.key;
        parentElement.insertBefore(dummy, parentElement.childNodes[changeIdx] || null);
        newCached.splice(changeIdx, 0, {
          attrs: { key: key },
          nodes: [dummy]
        });
        newCached.nodes[changeIdx] = dummy;
      }

      if (action === MOVE) {
        change.element.setAttribute('data-mref', changeIdx);
        if (parentElement.childNodes[changeIdx] !== change.element && change.element !== null) {
          parentElement.insertBefore(change.element, parentElement.childNodes[changeIdx] || null);
        }
        newCached[changeIdx] = cached[change.from];
        newCached.nodes[changeIdx] = change.element;
      }
    }
  }

  function diffArrayItem(data, cached, parentElement, parentTag, index, shouldReattach, intact, editable, namespace, configs) {
    var subArrayCount = 0,
        cacheCount = 0,
        nodes = [];
    data.forEach(_diffBuildItem);
    if (!intact) {
      //diff the array itself

      //update the list of DOM nodes by collecting the nodes from each item
      for (var i = 0, len = data.length; i < len; i++) {
        if (cached[i] != null) {
          nodes.push.apply(nodes, cached[i].nodes);
        }
      }
      //remove items from the end of the array if the new array is shorter than the old one
      //if errors ever happen here, the issue is most likely a bug in the construction of the `cached` data structure somewhere earlier in the program
      /*eslint no-cond-assign:0*/
      for (var i = 0, node; node = cached.nodes[i]; i++) {
        if (node.parentNode != null && nodes.indexOf(node) < 0) {
          clear([node], [cached[i]]);
        }
      }
      if (data.length < cached.length) {
        cached.length = data.length;
      }
      cached.nodes = nodes;
    }
    return cached;
    //helpers
    function _diffBuildItem(dataNode) {
      var item = build(parentElement, parentTag, cached, index, dataNode, cached[cacheCount], shouldReattach, index + subArrayCount || subArrayCount, editable, namespace, configs);
      if (item === undefined) {
        return;
      }
      if (!item.nodes.intact) {
        intact = false;
      }
      if (item.$trusted) {
        //fix offset of next element if item was a trusted string w/ more than one html element
        //the first clause in the regexp matches elements
        //the second clause (after the pipe) matches text nodes
        subArrayCount += (item.match(/<[^\/]|\>\s*[^<]/g) || [0]).length;
      } else {
        subArrayCount += type(item) === 'array' ? item.length : 1;
      }
      cached[cacheCount++] = item;
    }
  }

  function diffVNode(data, cached, parentElement, index, shouldReattach, editable, namespace, configs) {
    var views = [],
        controllers = [],
        componentName,
        componentCache;
    //record the final component name
    //handle the situation that vNode is a component({view, controller});

    while (data.view) {
      var curView = data.view;
      var view = data.view.$original || curView;
      var controllerIndex = cached.views ? cached.views.indexOf(view) : -1;
      var controller = controllerIndex > -1 ? cached.controllers[controllerIndex] : new (data.controller || NOOP)();
      var component = controller.instance;
      if (typeof component === 'object') {
        // handle component
        componentName = component.name;
        if (typeof component.cached === 'object') {
          componentCache = component.cached;
        }
        component.viewFn = [curView, controller];
      }

      var key = data && data.attrs && data.attrs.key;
      data = data.view(controller);
      if (data.subtree === 'retain') {
        return componentCache ? componentCache : cached;
      }
      if (key != null) {
        if (!data.attrs) {
          data.attrs = {};
        }
        data.attrs.key = key;
      }
      if (controller.onunload) {
        G.unloaders.set(controller, controller.onunload);
      }
      views.push(view);
      controllers.push(controller);
    }

    //the result of view function must be a sigle root vNode,
    //not a array or string
    if (!data.tag && controllers.length) {
      throw new Error('Component template must return a virtual element, not an array, string, etc.');
    }
    if (!data.attrs) {
      data.attrs = {};
    }
    if (componentCache != null) {
      cached = componentCache;
    }
    if (!cached.attrs) {
      cached.attrs = {};
    }
    //if an element is different enough from the one in cache, recreate it
    if (data.tag != cached.tag || !_hasSameKeys(data.attrs, cached.attrs) || data.attrs.id != cached.attrs.id || data.attrs.key != cached.attrs.key || type(componentName) === 'string' && cached.componentName != componentName) {
      if (cached.nodes.length) {
        clear(cached.nodes, cached);
      }
    }

    if (type(data.tag) !== 'string') {
      return cached;
    }

    var isNew = cached.nodes.length === 0,
        dataAttrKeys = Object.keys(data.attrs),
        hasKeys = dataAttrKeys.length > ('key' in data.attrs ? 1 : 0),
        domNode,
        newNodeIdx;
    if (data.attrs.xmlns) {
      namespace = data.attrs.xmlns;
    } else if (data.tag === 'svg') {
      namespace = 'http://www.w3.org/2000/svg';
    } else if (data.tag === 'math') {
      namespace = 'http://www.w3.org/1998/Math/MathML';
    }

    if (isNew) {
      var _newElement2 = _newElement(parentElement, namespace, data, index);

      domNode = _newElement2[0];
      newNodeIdx = _newElement2[1];

      cached = {
        tag: data.tag,
        //set attributes first, then create children
        attrs: hasKeys ? setAttributes(domNode, data.tag, data.attrs, {}, namespace) : data.attrs,
        children: data.children != null && data.children.length > 0 ? build(domNode, data.tag, undefined, undefined, data.children, cached.children, true, 0, data.attrs.contenteditable ? domNode : editable, namespace, configs) : data.children,
        nodes: [domNode]
      };
      if (controllers.length) {
        cached.views = views;
        cached.controllers = controllers;
      }

      if (cached.children && !cached.children.nodes) {
        cached.children.nodes = [];
      }
      //edge case: setting value on <select> doesn't work before children exist, so set it again after children have been created
      if (data.tag === 'select' && 'value' in data.attrs) {
        setAttributes(domNode, data.tag, { value: data.attrs.value }, {}, namespace);
      }

      if (newNodeIdx != null) {
        parentElement.insertBefore(domNode, parentElement.childNodes[newNodeIdx] || null);
      }
    } else {
      domNode = cached.nodes[0];
      if (hasKeys) {
        setAttributes(domNode, data.tag, data.attrs, cached.attrs, namespace);
      }
      cached.children = build(domNode, data.tag, undefined, undefined, data.children, cached.children, false, 0, data.attrs.contenteditable ? domNode : editable, namespace, configs);
      cached.nodes.intact = true;
      if (controllers.length) {
        cached.views = views;
        cached.controllers = controllers;
      }
      if (shouldReattach === true && domNode != null) {
        parentElement.insertBefore(domNode, parentElement.childNodes[index] || null);
      }
    }
    if (type(componentName) === 'string') {
      cached.componentName = componentName;
    }
    //schedule configs to be called. They are called after `build` finishes running
    if (type(data.attrs.config) === 'function') {
      var context = cached.configContext = cached.configContext || {};

      // bind
      var callback = function callback(args) {
        return function () {
          return data.attrs.config.apply(data, args);
        };
      };
      configs.push(callback([domNode, !isNew, context, cached, [parentElement, index, editable, namespace]]));
    }
    return cached;
  }
  function _newElement(parentElement, namespace, data, index) {
    var domNode,
        domNodeIndex,
        insertIdx = index;
    if (parentElement && parentElement.childNodes.length) {
      domNodeIndex = _findDomNodeByRef(parentElement, index);
      if (domNodeIndex && domNodeIndex[0]) {
        insertIdx = domNodeIndex[1];
        if (domNodeIndex[0].tagName.toLowerCase() == data.tag.toLowerCase()) {
          return [domNodeIndex[0], null];
        } else {
          clear([domNodeIndex[0]]);
        }
      }
    }
    if (data.attrs.is) {
      domNode = namespace === undefined ? $document.createElement(data.tag, data.attrs.is) : $document.createElementNS(namespace, data.tag, data.attrs.is);
    } else {
      domNode = namespace === undefined ? $document.createElement(data.tag) : $document.createElementNS(namespace, data.tag);
    }
    domNode.setAttribute('data-mref', index);
    return [domNode, insertIdx];
  }
  function _findDomNodeByRef(parentElement, ref) {
    var i = 0,
        l = parentElement.childNodes.length,
        childNode;
    for (; i < l; i++) {
      childNode = parentElement.childNodes[i];
      if (childNode.getAttribute && childNode.getAttribute('data-mref') == ref) {
        return [childNode, i];
      }
    }
    return null;
  }

  function diffTextNode(data, cached, parentElement, parentTag, index, shouldReattach, editable) {
    //handle text nodes
    var nodes;
    if (cached.nodes.length === 0) {
      if (data == '') {
        return cached;
      }
      clear([parentElement.childNodes[index]]);
      if (data.$trusted) {
        nodes = injectHTML(parentElement, index, data);
      } else {
        nodes = [$document.createTextNode(data)];
        if (!parentElement.nodeName.match(VOID_ELEMENTS)) {
          parentElement.insertBefore(nodes[0], parentElement.childNodes[index] || null);
        }
      }
      cached = 'string number boolean'.indexOf(typeof data) > -1 ? new data.constructor(data) : data;
      cached.nodes = nodes;
    } else if (cached.valueOf() !== data.valueOf() || shouldReattach === true) {
      nodes = cached.nodes;
      if (!editable || editable !== $document.activeElement) {
        if (data.$trusted) {
          clear(nodes, cached);
          nodes = injectHTML(parentElement, index, data);
        } else {
          //corner case: replacing the nodeValue of a text node that is a child of a textarea/contenteditable doesn't work
          //we need to update the value property of the parent textarea or the innerHTML of the contenteditable element instead
          if (parentTag === 'textarea') {
            parentElement.value = data;
          } else if (editable) {
            editable.innerHTML = data;
          } else {
            if (nodes[0].nodeType === 1 || nodes.length > 1) {
              //was a trusted string
              clear(cached.nodes, cached);
              nodes = [$document.createTextNode(data)];
            }
            parentElement.insertBefore(nodes[0], parentElement.childNodes[index] || null);
            nodes[0].nodeValue = data;
          }
        }
      }
      cached = new data.constructor(data);
      cached.nodes = nodes;
    } else {
      cached.nodes.intact = true;
    }
    return cached;
  }

  //helpers
  function _recursiveFlatten(arr) {
    for (var i = 0; i < arr.length; i++) {
      // arr may be modified, ex. nodelist
      if (type(arr[i]) === 'array') {
        arr = arr.concat.apply([], arr);
        i--; //check current index again and flatten until there are no more nested arrays at that index
      }
    }
    return arr;
  }
  function _hasSameKeys(o1, o2) {
    var o1Keys = Object.keys(o1).sort().join(),
        o2Keys = Object.keys(o2).sort().join();
    return o1Keys === o2Keys;
  }
  function injectHTML(parentElement, index, data) {
    var nextSibling = parentElement.childNodes[index];
    if (nextSibling) {
      var isElement = nextSibling.nodeType !== 1;
      var placeholder = $document.createElement('span');
      if (isElement) {
        parentElement.insertBefore(placeholder, nextSibling || null);
        placeholder.insertAdjacentHTML('beforebegin', data);
        parentElement.removeChild(placeholder);
      } else {
        nextSibling.insertAdjacentHTML('beforebegin', data);
      }
    } else {
      parentElement.insertAdjacentHTML('beforeend', data);
    }
    var nodes = [],
        childNode;
    while ((childNode = parentElement.childNodes[index++]) !== nextSibling) {
      nodes.push(childNode);
    }
    return nodes;
  }

  function render(root, vNode, forceRecreation, force) {
    var task = {
      root: root,
      vNode: vNode,
      forceRecreation: forceRecreation
    };
    if (force === true) {
      return _render(task);
    }
    G.renderQueue.addTarget({
      mergeType: 1, // replace
      root: root,
      processor: _render,
      params: [task]
    });
  }
  var html;
  var documentNode = {
    appendChild: function appendChild(node) {
      if (html === undefined) {
        html = $document.createElement('html');
      }
      if ($document.documentElement && $document.documentElement !== node) {
        $document.replaceChild(node, $document.documentElement);
      } else {
        $document.appendChild(node);
      }
      this.childNodes = $document.childNodes;
    },
    insertBefore: function insertBefore(node) {
      this.appendChild(node);
    },
    childNodes: []
  };
  // var domNodeCache = [], vNodeCache = Object.create(null);
  var domCacheMap = G.domCacheMap;
  function _render(task) {
    var root = task.root;
    var vNode = task.vNode;
    var forceRecreation = task.forceRecreation;

    if (!root) {
      throw new Error('Ensure the DOM element being passed to m.route/m.mount/m.render is not undefined.');
    }
    var configs = [],
        isDocumentRoot = root === $document || root === $document.documentElement,
        domNode = isDocumentRoot ? documentNode : root,
        vNodeCache;
    if (isDocumentRoot && vNode.tag !== 'html') {
      vNode = { tag: 'html', attrs: {}, children: vNode };
    }

    if (forceRecreation) {
      reset(domNode);
    }
    vNodeCache = build(domNode, null, undefined, undefined, vNode, domCacheMap.get(domNode), false, 0, null, undefined, configs);
    configs.forEach(function (onRender) {
      onRender();
    });
    domCacheMap.set(domNode, vNodeCache);
  }

  function reset(root) {
    clear(root.childNodes, domCacheMap.get(root));
    domCacheMap.remove(root);
  }

  //global render queue setting
  var renderQueue = G.renderQueue.onFinish(_onFinish);
  var redrawing = false;
  function update(force) {
    if (redrawing === true) {
      return;
    }
    redrawing = true;
    if (force === true) {
      G.forcing = true;
    }
    _updateRoots(force);
    redrawing = false;
  }
  function _updateRoots(force) {
    var root, component, controller, needRecreation;
    if (renderQueue.length() === 0 || force === true) {
      if (type(G.computePreRedrawHook) === 'function') {
        G.computePreRedrawHook();
        G.computePreRedrawHook = null;
      }
    }
    if (renderQueue.length() > 0) {
      renderQueue.stop();
    }
    for (var i = 0, l = G.roots.length; i < l; i++) {
      root = G.roots[i];
      component = G.components[i];
      controller = G.controllers[i];
      needRecreation = G.recreations[i];
      if (controller) {
        if (typeof controller.instance === 'object') {
          //   // controller.instance.redraw = function componentRedraw(){
          //   //   renderQueue.addTarget({
          //   //     mergeType: 0,// contain
          //   //     processor: _render,
          //   //     root: root,
          //   //     params:[{
          //   //       root: root,
          //   //       vNode: component.view ? component.view(controller) : '',
          //   //       forceRecreation: false
          //   //     }]
          //   //   });
          //   // };
          controller.instance.viewFn = [component.view, controller];
        }
        render(root, component.view ? component.view(controller) : '', needRecreation, force);
      }
      //reset back to not destroy root's children
      G.recreations[i] = void 0;
    }
    if (force === true) {
      _onFinish();
      G.forcing = false;
    }
  }

  function _onFinish() {
    if (type(G.computePostRedrawHook) === 'function') {
      G.computePostRedrawHook();
      G.computePostRedrawHook = null;
    }
  }

  //render queue setting
  G.renderQueue.onFlush(onFlush).onAddTarget(onMergeTask);

  function onFlush(task) {
    var processor = task.processor;
    var params = task.params;

    if (typeof processor === 'function') {
      processor.apply(null, params);
    }
  }

  function onMergeTask(queue, task) {
    var i, l, removeIdx, taskToPush;
    for (i = 0, l = queue.length; i < l; i++) {
      taskToPush = canBeMerged(queue[i], task);
      if (taskToPush) {
        removeIdx = i;
        break;
      }
    }
    if (removeIdx > -1) {
      queue.splice(removeIdx, 1);
      queue.push(taskToPush);
    } else {
      queue.push(task);
    }

    return queue;
  }
  function canBeMerged(taskInQ, task) {
    var inQRoot = taskInQ.root,
        tRoot = task.root;
    if (taskInQ.mergeType & task.mergeType) {
      // at least one of them are replace
      return inQRoot === tRoot ? task : null;
    } else {
      // both of them are contain
      var parent = getParentElFrom(inQRoot, tRoot);
      return !parent ? null : parent === inQRoot ? taskInQ : task;
    }
  }

  var topComponent;

  function mount(root, component, forceRecreation) {
    if (!root) {
      throw new Error('Please ensure the DOM element exists before rendering a template into it.');
    }
    var index = G.roots.indexOf(root);
    if (index < 0) {
      index = G.roots.length;
    }

    var isPrevented = false;
    var event = {
      preventDefault: function preventDefault() {
        isPrevented = true;
        G.computePreRedrawHook = G.computePostRedrawHook = null;
      }
    };
    G.unloaders.each(function (unloader, controller) {
      unloader.call(controller, event);
      controller.onunload = null;
    });

    if (isPrevented) {
      G.unloaders.each(function (unloader, controller) {
        controller.onunload = unloader;
      });
    } else {
      G.unloaders.clear();
    }

    if (G.controllers[index] && type(G.controllers[index].onunload) === 'function') {
      G.controllers[index].onunload(event);
    }

    if (!isPrevented) {
      G.roots[index] = root;
      var currentComponent = topComponent = component = component || { controller: NOOP };
      var constructor = component.controller || NOOP;
      var controller = new constructor();
      //controllers may call m.mount recursively (via m.route redirects, for example)
      //this conditional ensures only the last recursive m.mount call is applied
      if (currentComponent === topComponent) {
        G.controllers[index] = controller;
        G.components[index] = component;
        G.recreations[index] = forceRecreation;
      }
      update();
      return G.controllers[index];
    }
  }

  function parameterize(component, args) {
    var controller = function controller() {
      return (component.controller || NOOP).apply(this, args) || this;
    };

    var view = function view(ctrl) {
      if (arguments.length > 1) {
        args = args.concat(slice(arguments, 1));
      }
      return component.view.apply(component, args.length ? [ctrl].concat(args) : [ctrl]);
    };
    view.$original = component.view;
    var output = { controller: controller, view: view };
    if (args[0] && args[0].key != null) {
      output.attrs = { key: args[0].key };
    }
    return output;
  }

  function componentize(component) {
    return parameterize(component, slice(arguments, 1));
  }

  var extendMethods = ['componentWillMount', 'componentDidMount', 'componentWillUpdate', 'componentDidUpdate', 'componentWillUnmount', 'componentWillDetached', 'componentWillReceiveProps', 'getInitialProps', 'getInitialState'];
  var pipedMethods = ['getInitialProps', 'getInitialState', 'componentWillReceiveProps'];
  var ignoreProps = ['setState', 'mixins', 'onunload', 'setInternalProps', 'redraw'];

  var Component = (function () {
    function Component(props, children) {
      babelHelpers.classCallCheck(this, Component);

      if (type(props) !== 'object' && props != null) {
        throw new TypeError('[Component]param for constructor should a object or null or undefined! given: ' + props);
      }
      this.props = props || {};
      this.props.children = toArray(children);
      this.root = null;
      // this.state = {};
      if (this.getInitialProps) {
        this.props = this.getInitialProps(this.props);
      }
      if (this.getInitialState) {
        this.state = this.getInitialState(this.props);
      }
    }

    Component.prototype.setProps = function setProps(props, children) {
      if (this.componentWillReceiveProps) {
        props = this.componentWillReceiveProps(props);
      }
      this.props = removeVoidValue(extend(this.props, props, { children: toArray(children) }));
    };

    Component.prototype.onunload = function onunload(fn) {
      if (type(fn) === 'function') {
        fn.call(this);
      }
      this.root = null;
      this.cached = null;
      this.redrawData = null;
    };

    Component.prototype.setInternalProps = function setInternalProps(rootEl, cached, redrawData) {
      this.root = rootEl;
      this.cached = cached;
      this.redrawData = redrawData;
    };
    // getInitialProps(props){

    // }

    // render(props, states){

    // }
    // getInitialState(props){

    // }
    // componentDidMount(el){

    // }
    // shouldComponentUpdate(){

    // }

    // componentDidUpdate(){

    // }
    // componentWillReceiveProps(){

    // }
    // componentWillUnmount(e){

    // }
    // componentWillDetached(el){

    // }

    Component.prototype.redraw = function redraw() {
      if (this.redrawData == null) {
        return;
      }
      var instance = this;

      G.renderQueue.addTarget({
        mergeType: 0, // contain
        processor: _build,
        root: instance.root,
        params: [instance]
      });
    };

    Component.prototype.setState = function setState(state, silence) {
      if (this.state == null) {
        this.state = {};
      }
      this.state = extend(this.state, state);
      if (!silence && RT === 'browser') {
        this.redraw();
      }
    };

    return Component;
  })();

  function _build(instance) {
    var viewFn = instance.viewFn;
    var data = viewFn[0](viewFn[1]);
    var key = instance.props.key;
    var _instance$redrawData = instance.redrawData;
    var parentElement = _instance$redrawData[0];
    var index = _instance$redrawData[1];
    var editable = _instance$redrawData[2];
    var namespace = _instance$redrawData[3];
    var configs = [];
    if (key != null) {
      data.attrs = data.attrs || {};
      data.attrs.key = key;
    }

    instance.cached = build(parentElement, null, undefined, undefined, data, instance.cached, false, index, editable, namespace, configs);
    for (var i = 0, l = configs.length; i < l; i++) {
      configs[i]();
    }
  }
  function createComponent(options) {
    if (type(options) !== 'object') {
      throw new TypeError('[createComponent]param should be a object! given: ' + options);
    }
    var component = {},
        Factory = createComponentFactory(options);
    component.controller = function (props, children) {
      var instance = new Factory(props, children);
      var ctrl = {
        instance: instance
      };
      ctrl.onunload = instance.onunload.bind(instance, instance.componentWillUnmount);
      if (type(instance.name) === 'string') {
        ctrl.name = instance.name;
      }
      return ctrl;
    };

    component.view = makeView();
    return component;
  }

  function mixinProto(proto, mixins) {
    var mixin;
    if (type(mixins) !== 'array') {
      mixins = slice(arguments, 1);
    }
    mixins = mixins.filter(function (m) {
      return type(m) === 'object';
    });
    while (mixins.length > 0) {
      mixin = mixins.shift();
      /*eslint no-loop-func:0*/
      Object.keys(mixin).forEach(function (propName) {
        if (propName === 'mixins') {
          mixins = _addToHead([].concat(mixin[propName]), mixins);
          return;
        }
        if (ignoreProps.indexOf(propName) !== -1) {
          return;
        }
        if (extendMethods.indexOf(propName) !== -1) {
          if (type(proto[propName]) === 'array') {
            proto[propName].push(mixin[propName]);
          } else {
            proto[propName] = type(proto[propName]) === 'function' ? [proto[propName], mixin[propName]] : [mixin[propName]];
          }
          return;
        }
        proto[propName] = mixin[propName];
      });
    }

    extendMethods.forEach(function (methodName) {
      if (type(proto[methodName]) === 'array') {
        var methods = proto[methodName].filter(function (p) {
          return type(p) === 'function';
        });
        proto[methodName] = _compose(pipedMethods.indexOf(methodName) !== -1, methods);
      }
    });
  }
  function createComponentFactory(options) {
    var factory = function ComponentFactory() {
      Component.apply(this, arguments);
      _bindOnMethods(factory.prototype, this);
    },
        mixins;
    factory.prototype = Object.create(Component.prototype);

    mixins = options.mixins || [];
    delete options.mixins;
    if (type(mixins) === 'array') {
      mixins = mixins.concat(options);
    } else {
      mixins = [mixins, options];
    }
    mixinProto(factory.prototype, mixins);
    return factory;
  }

  function makeView() {
    var cachedValue = {};
    // factory = createComponentFactory(options);
    return function componentView(ctrl, props, children) {
      var instance = ctrl.instance,
          oldProps = cachedValue.props,
          oldState = cachedValue.state,
          config = function config(node, isInitialized, context, cached, redrawData) {
        _executeFn(instance, 'setInternalProps', node, cached, redrawData);
        if (!isInitialized) {
          _executeFn(instance, 'componentDidMount', node);
          if (type(instance.componentWillDetached) === 'function') {
            context.onunload = instance.componentWillDetached.bind(instance, node);
          }
        } else {
          _executeFn(instance, 'componentDidUpdate', node, oldProps, oldState);
        }
      };
      //updateProps
      instance.setProps(props, children);
      //cache previous instance
      cachedValue.props = instance.props;
      cachedValue.state = instance.state;

      if (instance.root != null) {
        if (_executeFn(instance, 'shouldComponentUpdate', oldProps, oldState) === false) {
          return { subtree: 'retain' };
        }
        _executeFn(instance, 'componentWillUpdate', instance.root, oldProps, oldState);
      } else {
        _executeFn(instance, 'componentWillMount', oldProps, oldState);
      }

      var resultView = _executeFn(instance, 'render', instance.props, instance.state);
      resultView.attrs = resultView.attrs || {};
      resultView.attrs.config = config;

      return resultView;
    };
  }

  //heplers
  function _bindOnMethods(proto, component) {
    Object.keys(proto).forEach(function (prop) {
      var val = proto[prop];
      if (type(val) === 'function' || /^on[A-Z]\w*/.test(prop)) {
        component[prop] = val.bind(component);
      }
    });
  }
  function _executeFn(obj, methodName) {
    var args = slice(arguments, 2);
    if (type(obj[methodName]) === 'function') {
      return obj[methodName].apply(obj, args);
    }
  }
  function _addToHead(arrToAdd, targetArr) {
    var i,
        l = arrToAdd.length,
        arr;
    for (i = 0; i < l; i++) {
      arr = arrToAdd[i];
      if (targetArr.indexOf(arr) === -1) {
        targetArr.unshift(arr);
      }
    }
    return targetArr;
  }
  function _compose(isPiped, fns) {
    return function _composed() {
      var args = slice(arguments, 0),
          self = this,
          i = 0,
          l = fns.length,
          fn,
          result = args;
      for (; i < l; i++) {
        fn = fns[i];
        result = fn.apply(self, args);
        args = isPiped ? result : args;
      }
      return result;
    };
  }

  var mReact = m;

  mReact.render = render;
  mReact.redraw = update;
  mReact.mount = mount;
  mReact.component = componentize;
  mReact.createComponent = createComponent;
  mReact.domDelegator = G.domDelegator;
  //[Object.assign] polyfill
  if (typeof Object.assign === 'undefined') {
    Object.assign = _extend;
  }

  return mReact;

}));