(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  global.mReact = factory()
}(this, function () { 'use strict';

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
  function _extend() {
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
  function extend() {
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

  var render_m = m;

  var tagReg = /(?:(^|#|\.)([^#\.\[\]]+))|(\[.+?\])/g,
      attrReg = /\[(.+?)(?:=("|'|)(.*?)\2)?\]/;
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

  var store_map = store_map__Map;

  function store_map__Map() {
    if (!this instanceof store_map__Map) {
      return new store_map__Map();
    }
    this._index = -1;
    this._keys = [];
    this._values = [];
  }

  store_map__Map.prototype = {
    has: function (key) {
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
    clear: function () {
      this._keys.length = 0;
      this._values.length = 0;
      this._index = -1;
    },
    set: function (key, value) {
      if (this.has(key)) {
        this._values[this._index] = value;
      } else {
        this._values[this._keys.push(key) - 1] = value;
      }
      return this;
    },
    get: function (key, defaultValue) {
      if (this.has(key)) {
        return this._values[this._index];
      } else {
        if (arguments.length > 1) {
          this.set(key, defaultValue);
        }
        return defaultValue;
      }
    },
    remove: function (key) {
      var i = this._index;
      if (this.has(key)) {
        this._keys.splice(i, 1);
        this._values.splice(i, 1);
      }
      return i > -1;
    },
    each: function (fn) {
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
    init: function (ev) {
      synthesizeEvProps(this, ev, 'all');
      this.originalEvent = ev;
      this._bubbles = false;
    },
    preventDefault: function () {
      return this.originalEvent.preventDefault();
    },
    startPropagation: function () {
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

  /**
   * dom-delegatore allows you to attach an EventHandler to a dom element.
   * When the correct event occurs, dom-delegator will let the global delegate
   * eventHandler to handle the event and trigger your attached EventHandler.
   */
  function DOMDelegator(doc) {
    if (!this instanceof DOMDelegator) {
      return new DOMDelegator(doc);
    }

    doc = doc || globals__document || { documentElement: 1 }; //enable to run in nodejs;
    if (!doc.documentElement) {
      throw new Error('[DOMDelegator]Invalid parameter "doc", should be a document object! given: ' + doc);
    }
    this.root = doc.documentElement;
    this.listenedEvents = getHash();
    this.eventDispatchers = getHash();
    this.globalListeners = getHash();
    this.domEvHandlerMap = new store_map();
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
      raf__cancelAnimationFrame(this._tick);
    }
    this._tick = raf__requestAnimationFrame(this.flush);
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
    raf__cancelAnimationFrame(this._tick);
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

  var globals__global = typeof window !== 'undefined' ? window : {};
  var globals__document = globals__global.document;
  var globals__runtime = typeof process !== 'undefined' && !process.browser ? 'nodejs' : typeof window !== 'undefined' ? 'browser' : 'unknown';
  var G = {
    forcing: false,
    unloaders: new store_map(),
    computePreRedrawHook: null,
    computePostRedrawHook: null,
    //mount registries
    roots: [],
    recreations: [],
    components: [],
    controllers: [],
    //render registries
    domCacheMap: new store_map(),
    domDelegator: new DOMDelegator(),
    //global batch render queue
    renderQueue: new Batch()
  };

  var lastTime = 0,
      FRAME_BUDGET = 16,
      vendors = ['webkit', 'moz', 'ms', 'o'],
      raf__requestAnimationFrame = globals__global.requestAnimationFrame,
      raf__cancelAnimationFrame = globals__global.cancelAnimationFrame || globals__global.cancelRequestAnimationFrame;
  for (var x = 0, l = vendors.length; x < l && !raf__requestAnimationFrame; ++x) {
    raf__requestAnimationFrame = globals__global[vendors[x] + 'RequestAnimationFrame'];
    raf__cancelAnimationFrame = globals__global[vendors[x] + 'CancelAnimationFrame'] || globals__global[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  if (!raf__requestAnimationFrame) {
    raf__requestAnimationFrame = function (callback) {
      var currTime = Date.now ? Date.now() : new Date().getTime();
      var timeToCall = Math.max(0, FRAME_BUDGET - (currTime - lastTime));
      var id = setTimeout(function () {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  if (!raf__cancelAnimationFrame) {
    raf__cancelAnimationFrame = function (id) {
      return clearTimeout(id);
    };
  }

  var clear__domCacheMap = G.domCacheMap;
  var clear__domDelegator = G.domDelegator;
  function clear(domNodes, vNodes) {
    vNodes = vNodes || [];
    vNodes = [].concat(vNodes);
    for (var i = domNodes.length - 1; i > -1; i--) {
      if (domNodes[i] && domNodes[i].parentNode) {
        if (vNodes[i]) {
          unload(vNodes[i]);
        } // cleanup before dom is removed from dom tree
        clear__domDelegator.off(domNodes[i]);
        clear__domCacheMap.remove(domNodes[i]);
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

  var setAttributes__domDelegator = G.domDelegator;
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
            setAttributes__domDelegator.off(domNode, evType);
            if (isHandler(dataAttr)) {
              setAttributes__domDelegator.on(domNode, evType, dataAttr);
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
            element: cached.nodes[fromIdx] || globals__document.createElement('div')
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
        var dummy = globals__document.createElement('div');
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
      for (var i = 0, node = undefined; node = cached.nodes[i]; i++) {
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
      var callback = function (args) {
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
      domNode = namespace === undefined ? globals__document.createElement(data.tag, data.attrs.is) : globals__document.createElementNS(namespace, data.tag, data.attrs.is);
    } else {
      domNode = namespace === undefined ? globals__document.createElement(data.tag) : globals__document.createElementNS(namespace, data.tag);
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
        nodes = [globals__document.createTextNode(data)];
        if (!parentElement.nodeName.match(VOID_ELEMENTS)) {
          parentElement.insertBefore(nodes[0], parentElement.childNodes[index] || null);
        }
      }
      cached = 'string number boolean'.indexOf(typeof data) > -1 ? new data.constructor(data) : data;
      cached.nodes = nodes;
    } else if (cached.valueOf() !== data.valueOf() || shouldReattach === true) {
      nodes = cached.nodes;
      if (!editable || editable !== globals__document.activeElement) {
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
              nodes = [globals__document.createTextNode(data)];
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
      var placeholder = globals__document.createElement('span');
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
    appendChild: function (node) {
      if (html === undefined) {
        html = globals__document.createElement('html');
      }
      if (globals__document.documentElement && globals__document.documentElement !== node) {
        globals__document.replaceChild(node, globals__document.documentElement);
      } else {
        globals__document.appendChild(node);
      }
      this.childNodes = globals__document.childNodes;
    },
    insertBefore: function (node) {
      this.appendChild(node);
    },
    childNodes: []
  };
  // var domNodeCache = [], vNodeCache = Object.create(null);
  var render_render__domCacheMap = G.domCacheMap;
  function _render(task) {
    var root = task.root;
    var vNode = task.vNode;
    var forceRecreation = task.forceRecreation;

    if (!root) {
      throw new Error('Ensure the DOM element being passed to m.route/m.mount/m.render is not undefined.');
    }
    var configs = [],
        isDocumentRoot = root === globals__document || root === globals__document.documentElement,
        domNode = isDocumentRoot ? documentNode : root,
        vNodeCache;
    if (isDocumentRoot && vNode.tag !== 'html') {
      vNode = { tag: 'html', attrs: {}, children: vNode };
    }

    if (forceRecreation) {
      reset(domNode);
    }
    vNodeCache = build(domNode, null, undefined, undefined, vNode, render_render__domCacheMap.get(domNode), false, 0, null, undefined, configs);
    configs.forEach(function (onRender) {
      onRender();
    });
    render_render__domCacheMap.set(domNode, vNodeCache);
  }

  function reset(root) {
    clear(root.childNodes, render_render__domCacheMap.get(root));
    render_render__domCacheMap.remove(root);
  }



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

  var mount_component = componentize;
  function parameterize(component, args) {
    var controller = function () {
      return (component.controller || NOOP).apply(this, args) || this;
    };

    var view = function (ctrl) {
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
      preventDefault: function () {
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
      var _constructor = component.controller || NOOP;
      var controller = new _constructor();
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

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  // import * as update from '../update';
  var extendMethods = ['componentWillMount', 'componentDidMount', 'componentWillUpdate', 'componentDidUpdate', 'componentWillUnmount', 'componentWillDetached', 'componentWillReceiveProps', 'getInitialProps', 'getInitialState'];
  var pipedMethods = ['getInitialProps', 'getInitialState', 'componentWillReceiveProps'];
  var ignoreProps = ['setState', 'mixins', 'onunload', 'setInternalProps', 'redraw'];

  var Component = (function () {
    function Component(props, children) {
      _classCallCheck(this, Component);

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
      if (!silence && globals__runtime === 'browser') {
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
          config = function (node, isInitialized, context, cached, redrawData) {
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



  var mReact = render_m;

  mReact.render = render;
  mReact.redraw = update;
  mReact.mount = mount;
  mReact.component = mount_component;
  mReact.createComponent = createComponent;
  mReact.domDelegator = G.domDelegator;
  //[Object.assign] polyfill
  if (typeof Object.assign === 'undefined') {
    Object.assign = _extend;
  }
  var _index = mReact;

  return _index;

}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIi9ob21lL2p6aGVuZy9NeVdvcmtwbGFjZS9naXRodWJfcHJvanMvbS1yZWFjdC90bXAvdXRpbHMuanMiLCIvaG9tZS9qemhlbmcvTXlXb3JrcGxhY2UvZ2l0aHViX3Byb2pzL20tcmVhY3QvdG1wL3JlbmRlci9tLmpzIiwiL2hvbWUvanpoZW5nL015V29ya3BsYWNlL2dpdGh1Yl9wcm9qcy9tLXJlYWN0L3RtcC9zdG9yZS9tYXAuanMiLCIvaG9tZS9qemhlbmcvTXlXb3JrcGxhY2UvZ2l0aHViX3Byb2pzL20tcmVhY3QvdG1wL3N0b3JlL2luZGV4LmpzIiwiL2hvbWUvanpoZW5nL015V29ya3BsYWNlL2dpdGh1Yl9wcm9qcy9tLXJlYWN0L3RtcC9kb20tZGVsZWdhdG9yL2FkZEV2ZW50LmpzIiwiL2hvbWUvanpoZW5nL015V29ya3BsYWNlL2dpdGh1Yl9wcm9qcy9tLXJlYWN0L3RtcC9kb20tZGVsZWdhdG9yL3JlbW92ZUV2ZW50LmpzIiwiL2hvbWUvanpoZW5nL015V29ya3BsYWNlL2dpdGh1Yl9wcm9qcy9tLXJlYWN0L3RtcC9kb20tZGVsZWdhdG9yL3Byb3h5RXZlbnQuanMiLCIvaG9tZS9qemhlbmcvTXlXb3JrcGxhY2UvZ2l0aHViX3Byb2pzL20tcmVhY3QvdG1wL2RvbS1kZWxlZ2F0b3IvaW5kZXguanMiLCIvaG9tZS9qemhlbmcvTXlXb3JrcGxhY2UvZ2l0aHViX3Byb2pzL20tcmVhY3QvdG1wL3VwZGF0ZS9iYXRjaC5qcyIsIi9ob21lL2p6aGVuZy9NeVdvcmtwbGFjZS9naXRodWJfcHJvanMvbS1yZWFjdC90bXAvZ2xvYmFscy5qcyIsIi9ob21lL2p6aGVuZy9NeVdvcmtwbGFjZS9naXRodWJfcHJvanMvbS1yZWFjdC90bXAvdXBkYXRlL3JhZi5qcyIsIi9ob21lL2p6aGVuZy9NeVdvcmtwbGFjZS9naXRodWJfcHJvanMvbS1yZWFjdC90bXAvcmVuZGVyL2NsZWFyLmpzIiwiL2hvbWUvanpoZW5nL015V29ya3BsYWNlL2dpdGh1Yl9wcm9qcy9tLXJlYWN0L3RtcC9yZW5kZXIvc2V0QXR0cmlidXRlcy5qcyIsIi9ob21lL2p6aGVuZy9NeVdvcmtwbGFjZS9naXRodWJfcHJvanMvbS1yZWFjdC90bXAvcmVuZGVyL2J1aWxkLmpzIiwiL2hvbWUvanpoZW5nL015V29ya3BsYWNlL2dpdGh1Yl9wcm9qcy9tLXJlYWN0L3RtcC9yZW5kZXIvcmVuZGVyLmpzIiwiL2hvbWUvanpoZW5nL015V29ya3BsYWNlL2dpdGh1Yl9wcm9qcy9tLXJlYWN0L3RtcC9yZW5kZXIvaW5kZXguanMiLCIvaG9tZS9qemhlbmcvTXlXb3JrcGxhY2UvZ2l0aHViX3Byb2pzL20tcmVhY3QvdG1wL3VwZGF0ZS91cGRhdGUuanMiLCIvaG9tZS9qemhlbmcvTXlXb3JrcGxhY2UvZ2l0aHViX3Byb2pzL20tcmVhY3QvdG1wL3VwZGF0ZS9pbmRleC5qcyIsIi9ob21lL2p6aGVuZy9NeVdvcmtwbGFjZS9naXRodWJfcHJvanMvbS1yZWFjdC90bXAvbW91bnQvY29tcG9uZW50LmpzIiwiL2hvbWUvanpoZW5nL015V29ya3BsYWNlL2dpdGh1Yl9wcm9qcy9tLXJlYWN0L3RtcC9tb3VudC9tb3VudC5qcyIsIi9ob21lL2p6aGVuZy9NeVdvcmtwbGFjZS9naXRodWJfcHJvanMvbS1yZWFjdC90bXAvbW91bnQvY3JlYXRlQ29tcG9uZW50LmpzIiwiL2hvbWUvanpoZW5nL015V29ya3BsYWNlL2dpdGh1Yl9wcm9qcy9tLXJlYWN0L3RtcC9tb3VudC9pbmRleC5qcyIsIi9ob21lL2p6aGVuZy9NeVdvcmtwbGFjZS9naXRodWJfcHJvanMvbS1yZWFjdC90bXAvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gTk9PUCgpIHt9XG5cbnZhciB0eXBlUmVnID0gL15cXFtvYmplY3QgKFxcdyspXFxdJC87XG5mdW5jdGlvbiB0eXBlKG8pIHtcbiAgaWYgKG8gPT09IG51bGwpIHtcbiAgICByZXR1cm4gJ251bGwnO1xuICB9XG4gIGlmIChvID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gJ3VuZGVmaW5lZCc7XG4gIH1cbiAgaWYgKG8gIT09IG8pIHtcbiAgICByZXR1cm4gJ05hTic7XG4gIH1cbiAgdmFyIHRtID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pLm1hdGNoKHR5cGVSZWcpO1xuICByZXR1cm4gdG0gPT0gbnVsbCA/ICd1bmtub3duJyA6IHRtWzFdLnRvTG93ZXJDYXNlKCk7XG59XG52YXIgX3NsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xuZnVuY3Rpb24gc2xpY2UoKSB7XG4gIHJldHVybiBfc2xpY2UuYXBwbHkoYXJndW1lbnRzWzBdLCBfc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbn1cblxuZnVuY3Rpb24gaGFzT3duKG8sIGspIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvLCBrKTtcbn1cbmZ1bmN0aW9uIF9leHRlbmQoKSB7XG4gIHZhciBsID0gYXJndW1lbnRzLmxlbmd0aCxcbiAgICAgIGkgPSAwLFxuICAgICAgayxcbiAgICAgIG8sXG4gICAgICB0YXJnZXQ7XG4gIHdoaWxlIChpIDwgbCkge1xuICAgIHRhcmdldCA9IGFyZ3VtZW50c1tpXTtcbiAgICBpZiAodGFyZ2V0ID09PSBPYmplY3QodGFyZ2V0KSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGkrKztcbiAgfVxuICBpZiAoaSA9PT0gbCkge1xuICAgIHJldHVybiB7fTtcbiAgfVxuXG4gIGkrKztcbiAgd2hpbGUgKGkgPCBsKSB7XG4gICAgbyA9IGFyZ3VtZW50c1tpKytdO1xuICAgIGlmIChvICE9PSBPYmplY3QobykpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBmb3IgKGsgaW4gbykge1xuICAgICAgaWYgKGhhc093bihvLCBrKSkge1xuICAgICAgICB0YXJnZXRba10gPSBvW2tdO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gdGFyZ2V0O1xufVxuZnVuY3Rpb24gZXh0ZW5kKCkge1xuICB2YXIgYXJncyA9IHNsaWNlKGFyZ3VtZW50cyk7XG4gIHJldHVybiBfZXh0ZW5kLmFwcGx5KG51bGwsIFt7fV0uY29uY2F0KGFyZ3MpKTtcbn1cbmZ1bmN0aW9uIHJlbW92ZVZvaWRWYWx1ZShvKSB7XG4gIGlmICh0eXBlKG8pICE9PSAnb2JqZWN0Jykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1tyZW1vdmVWb2lkVmFsdWVdcGFyYW0gc2hvdWxkIGJlIGEgb2JqZWN0ISBnaXZlbjogJyArIG8pO1xuICB9XG4gIHZhciByZXN1bHQgPSB7fTtcbiAgT2JqZWN0LmtleXMobykuZm9yRWFjaChmdW5jdGlvbiAoaykge1xuICAgIGlmIChvW2tdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJlc3VsdFtrXSA9IG9ba107XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLy9vbmx5IGZsYXR0ZW4gb25lIGxldmVsLCBzaW5jZSBvdGhlciBjYXNlIGlzIHJhcmVcbmZ1bmN0aW9uIF9mbGF0dGVuKGEpIHtcbiAgdmFyIHJlc3VsdCA9IFtdLFxuICAgICAgbmVlZEZsYXR0ZW4gPSB0cnVlO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IGEubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBhW2ldO1xuICAgIGlmICh0eXBlKGl0ZW0pID09PSAnYXJyYXknKSB7XG4gICAgICByZXN1bHQucHVzaChpdGVtKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmVlZEZsYXR0ZW4gPSBmYWxzZTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICBpZiAobmVlZEZsYXR0ZW4gPT09IGZhbHNlIHx8IGEubGVuZ3RoID09PSAwKSB7XG4gICAgcmVzdWx0ID0gYTtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgPSBbXS5jb25jYXQuYXBwbHkoW10sIHJlc3VsdCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gdG9BcnJheShhKSB7XG4gIHN3aXRjaCAodHlwZShhKSkge1xuICAgIGNhc2UgJ3VuZGVmaW5lZCc6XG4gICAgY2FzZSAnbnVsbCc6XG4gICAgICByZXR1cm4gW107XG4gICAgY2FzZSAnYXJyYXknOlxuICAgICAgcmV0dXJuIF9mbGF0dGVuKGEpO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gW2FdO1xuICB9XG59XG5mdW5jdGlvbiBnZXRIYXNoKCkge1xuICByZXR1cm4gT2JqZWN0LmNyZWF0ZShudWxsKTtcbn1cbmZ1bmN0aW9uIG1hdGNoUmVnKHN0ciwgcmVnKSB7XG4gIGlmICh0eXBlKHN0cikgIT09ICdzdHJpbmcnIHx8IHR5cGUocmVnKSAhPT0gJ3JlZ2V4cCcpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4gc3RyLm1hdGNoKHJlZyk7XG59XG4vLyAqXG4vLyAgKiBmdW5jdGlvbiB0byBleHRyYWN0IHR3byB0eXBlcyByZWxhdGl2ZSB0byBiYXRjaCB1cGRhdGUgYWN0aXZpdHkuXG4vLyAgKiBUYXNrVHlwZSAtIGluZGljYXRlIHRoZSB3YXkgb2YgaGFuZGxpbmcgdGhlIGNvcnJlc3BvbmRpbmcgdGFzay5cbi8vICAqICAgICAgICAgICAgdHlwZSBiaXRtYXNrKDAgPT4gcmVuZGVyOyAxID0+IHJlZHJhdylcbi8vICAqIE1lcmdlVHlwZSAtIGluZGljYXRlIGhvdyB0byBtZXJnZSBjdXJyZW50IHRhc2sgaW50byB0aGUgdGFzayBxdWV1ZS5cbi8vICAqICAgICAgICAgICAgdHlwZSBiaXRtYXNrKDAgPT4gY29udGFpbjsgMSA9PiByZXBsYWNlKVxuLy8gICogQHBhcmFtICB7W1Bvc2l0aXZlIE51bWJlcl19IHRNYXNrLCByZXN1bHQgb2YgYml0d2lzZSBvcGVyYXRpb24gb24gdHlwZSBiaXRtYXNrXG4vLyAgKiBzbywgMCA9PiBUYXNrVHlwZS5yZW5kZXIgfCBNZXJnZVR5cGUuY29udGFpbigwMClcbi8vICAqICAgICAxID0+IFRhc2tUeXBlLnJlbmRlciB8IE1lcmdlVHlwZS5yZXBsYWNlKDAxKVxuLy8gICogICAgIDIgPT4gVGFza1R5cGUucmVkcmF3IHwgTWVyZ2VUeXBlLmNvbnRhaW4oMTApXG4vLyAgKiAgICAgMyA9PiBUYXNrVHlwZS5yZWRyYXcgfCBNZXJnZVR5cGUucmVwbGFjZSgxMSlcbi8vICAqIEByZXR1cm4ge1t0eXBlc119ICAgICAgIFt0YXNrVHlwZSwgbWVyZ2VUeXBlXVxuXG4vLyBmdW5jdGlvbiBleHRyYWN0VGFza1R5cGVzKHRNYXNrKXtcbi8vICAgcmV0dXJuIFsodE1hc2smMik+PjEsICh0TWFzayYxKV07XG4vLyB9XG4vLyB2YXIgaXNBbmNlc3Rvck9mID0gJ2NvbXBhcmVEb2N1bWVudFBvc2l0aW9uJyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgP1xuLy8gICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKGVsLCBjb250YWluZXIpIHtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGNvbnRhaW5lci5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbihlbCkmMTYpID09PSAxNiA7XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICB9IDpcbi8vICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChlbCwgY29udGFpbmVyKSB7XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyID0gY29udGFpbmVyID09PSBkb2N1bWVudCB8fCBjb250YWluZXIgPT09IHdpbmRvdyA/IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCA6IGNvbnRhaW5lcjtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29udGFpbmVyICE9PSBlbCAmJiBjb250YWluZXIuY29udGFpbnMoZWwpO1xuLy8gICAgICAgICAgICAgICAgICAgICAgICAgfTtcbmZ1bmN0aW9uIGdldFBhcmVudEVsRnJvbShpblFFbCwgdGFza0VsKSB7XG4gIGlmIChpblFFbCA9PT0gdGFza0VsKSB7XG4gICAgcmV0dXJuIHRhc2tFbDtcbiAgfVxuICB2YXIgY29tcGFyZVBvc1Jlc3VsdCA9IGluUUVsLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKHRhc2tFbCk7XG4gIGlmIChjb21wYXJlUG9zUmVzdWx0ICYgKDE2IHwgOCkpIHtcbiAgICByZXR1cm4gY29tcGFyZVBvc1Jlc3VsdCAmIDE2ID8gaW5RRWwgOiB0YXNrRWw7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cbmV4cG9ydCB7IE5PT1AsIHR5cGUsIHNsaWNlLCBoYXNPd24sIF9leHRlbmQsIGV4dGVuZCwgcmVtb3ZlVm9pZFZhbHVlLCB0b0FycmF5LCBnZXRIYXNoLCBtYXRjaFJlZywgZ2V0UGFyZW50RWxGcm9tIH07XG4vKm8gLi4uKi8gLypvIC4uLiovIiwiXG5cbmV4cG9ydCBkZWZhdWx0IG07XG5cbmltcG9ydCB7IHNsaWNlLCB0eXBlIH0gZnJvbSAnLi4vdXRpbHMnO1xudmFyIHRhZ1JlZyA9IC8oPzooXnwjfFxcLikoW14jXFwuXFxbXFxdXSspKXwoXFxbLis/XFxdKS9nLFxuICAgIGF0dHJSZWcgPSAvXFxbKC4rPykoPzo9KFwifCd8KSguKj8pXFwyKT9cXF0vO1xuZnVuY3Rpb24gbSgpIHtcbiAgdmFyIHRhZ1N0ciA9IGFyZ3VtZW50c1swXSxcbiAgICAgIGF0dHJzID0gYXJndW1lbnRzWzFdLFxuICAgICAgY2hpbGRyZW4gPSBzbGljZShhcmd1bWVudHMsIDIpO1xuICBpZiAodHlwZSh0YWdTdHIpICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VsZWN0b3IgaW4gbShzZWxlY3RvciwgYXR0cnMsIGNoaWxkcmVuKSBzaG91bGQgYmUgYSBzdHJpbmcnKTtcbiAgfVxuXG4gIHZhciBoYXNBdHRyID0gYXR0cnMgIT0gbnVsbCAmJiB0eXBlKGF0dHJzKSA9PT0gJ29iamVjdCcgJiYgISgndGFnJyBpbiBhdHRycyB8fCAndmlldycgaW4gYXR0cnMpICYmICEoJ3N1YnRyZWUnIGluIGF0dHJzKSxcbiAgICAgIHZOb2RlID0ge1xuICAgIHRhZzogJ2RpdicsXG4gICAgYXR0cnM6IHt9XG4gIH0sXG4gICAgICBtYXRjaCxcbiAgICAgIHBhaXIsXG4gICAgICBjbGFzc0F0dHJOYW1lLFxuICAgICAgY2xhc3NlcyA9IFtdO1xuICAvL25vcm1hbGl6ZSBhcmd1bWVudHNcbiAgYXR0cnMgPSBoYXNBdHRyID8gYXR0cnMgOiB7fTtcbiAgY2xhc3NBdHRyTmFtZSA9ICdjbGFzcycgaW4gYXR0cnMgPyAnY2xhc3MnIDogJ2NsYXNzTmFtZSc7XG4gIGNoaWxkcmVuID0gaGFzQXR0ciA/IGNoaWxkcmVuIDogc2xpY2UoYXJndW1lbnRzLCAxKTtcbiAgdk5vZGUuY2hpbGRyZW4gPSB0eXBlKGNoaWxkcmVuWzBdKSA9PT0gJ2FycmF5JyA/IGNoaWxkcmVuWzBdIDogY2hpbGRyZW47XG5cbiAgLy9wYXJzZSB0YWcgc3RyaW5nXG4gIC8qZXNsaW50IG5vLWNvbmQtYXNzaWduOjAqL1xuICB3aGlsZSAobWF0Y2ggPSB0YWdSZWcuZXhlYyh0YWdTdHIpKSB7XG4gICAgaWYgKG1hdGNoWzFdID09PSAnJyAmJiBtYXRjaFsyXSkge1xuICAgICAgdk5vZGUudGFnID0gbWF0Y2hbMl07XG4gICAgfSBlbHNlIGlmIChtYXRjaFsxXSA9PT0gJyMnKSB7XG4gICAgICB2Tm9kZS5hdHRycy5pZCA9IG1hdGNoWzJdO1xuICAgIH0gZWxzZSBpZiAobWF0Y2hbMV0gPT09ICcuJykge1xuICAgICAgY2xhc3Nlcy5wdXNoKG1hdGNoWzJdKTtcbiAgICB9IGVsc2UgaWYgKG1hdGNoWzNdWzBdID09PSAnWycpIHtcbiAgICAgIHBhaXIgPSBhdHRyUmVnLmV4ZWMobWF0Y2hbM10pO1xuICAgICAgdk5vZGUuYXR0cnNbcGFpclsxXV0gPSBwYWlyWzNdIHx8IChwYWlyWzJdID8gJycgOiB0cnVlKTtcbiAgICB9XG4gIH1cblxuICBpZiAoY2xhc3Nlcy5sZW5ndGggPiAwKSB7XG4gICAgdk5vZGUuYXR0cnNbY2xhc3NBdHRyTmFtZV0gPSBjbGFzc2VzLmpvaW4oJyAnKTtcbiAgfVxuXG4gIE9iamVjdC5rZXlzKGF0dHJzKS5mb3JFYWNoKGZ1bmN0aW9uIChhdHRyTmFtZSkge1xuICAgIHZhciBhdHRyVmFsID0gYXR0cnNbYXR0ck5hbWVdO1xuICAgIGlmIChhdHRyTmFtZSA9PT0gY2xhc3NBdHRyTmFtZSAmJiB0eXBlKGF0dHJWYWwpICE9PSAnc3RyaW5nJyAmJiBhdHRyVmFsLnRyaW0oKSAhPT0gJycpIHtcbiAgICAgIHZOb2RlLmF0dHJzW2F0dHJOYW1lXSA9ICh2Tm9kZS5hdHRyc1thdHRyTmFtZV0gfHwgJycpICsgJyAnICsgYXR0clZhbDtcbiAgICB9IGVsc2Uge1xuICAgICAgdk5vZGUuYXR0cnNbYXR0ck5hbWVdID0gYXR0clZhbDtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiB2Tm9kZTtcbn1cblxubS50cnVzdCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAvKmVzbGludCBuby1uZXctd3JhcHBlcnM6MCovXG4gIHZhbHVlID0gbmV3IFN0cmluZyh2YWx1ZSk7XG4gIHZhbHVlLiR0cnVzdGVkID0gdHJ1ZTtcbiAgcmV0dXJuIHZhbHVlO1xufTsiLCJleHBvcnQgZGVmYXVsdCBNYXA7XG5cbmZ1bmN0aW9uIE1hcCgpIHtcbiAgaWYgKCF0aGlzIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgcmV0dXJuIG5ldyBNYXAoKTtcbiAgfVxuICB0aGlzLl9pbmRleCA9IC0xO1xuICB0aGlzLl9rZXlzID0gW107XG4gIHRoaXMuX3ZhbHVlcyA9IFtdO1xufVxuXG5NYXAucHJvdG90eXBlID0ge1xuICBoYXM6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICB2YWxpZGF0ZUtleShrZXkpO1xuICAgIHZhciBsaXN0ID0gdGhpcy5fa2V5cyxcbiAgICAgICAgaTtcbiAgICBpZiAoa2V5ICE9IGtleSB8fCBrZXkgPT09IDApIHtcbiAgICAgIC8vTmFOIG9yIDBcbiAgICAgIGZvciAoaSA9IGxpc3QubGVuZ3RoOyBpLS07KSB7XG4gICAgICAgIGlmIChpcyhsaXN0W2ldLCBrZXkpKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaSA9IGxpc3QuaW5kZXhPZihrZXkpO1xuICAgIH1cbiAgICAvL3VwZGF0ZSBpbmRleFxuICAgIHRoaXMuX2luZGV4ID0gaTtcbiAgICByZXR1cm4gaSA+IC0xO1xuICB9LFxuICBjbGVhcjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuX2tleXMubGVuZ3RoID0gMDtcbiAgICB0aGlzLl92YWx1ZXMubGVuZ3RoID0gMDtcbiAgICB0aGlzLl9pbmRleCA9IC0xO1xuICB9LFxuICBzZXQ6IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuaGFzKGtleSkpIHtcbiAgICAgIHRoaXMuX3ZhbHVlc1t0aGlzLl9pbmRleF0gPSB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fdmFsdWVzW3RoaXMuX2tleXMucHVzaChrZXkpIC0gMV0gPSB2YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIGdldDogZnVuY3Rpb24gKGtleSwgZGVmYXVsdFZhbHVlKSB7XG4gICAgaWYgKHRoaXMuaGFzKGtleSkpIHtcbiAgICAgIHJldHVybiB0aGlzLl92YWx1ZXNbdGhpcy5faW5kZXhdO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgdGhpcy5zZXQoa2V5LCBkZWZhdWx0VmFsdWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICB9XG4gIH0sXG4gIHJlbW92ZTogZnVuY3Rpb24gKGtleSkge1xuICAgIHZhciBpID0gdGhpcy5faW5kZXg7XG4gICAgaWYgKHRoaXMuaGFzKGtleSkpIHtcbiAgICAgIHRoaXMuX2tleXMuc3BsaWNlKGksIDEpO1xuICAgICAgdGhpcy5fdmFsdWVzLnNwbGljZShpLCAxKTtcbiAgICB9XG4gICAgcmV0dXJuIGkgPiAtMTtcbiAgfSxcbiAgZWFjaDogZnVuY3Rpb24gKGZuKSB7XG4gICAgaWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgaSA9IDAsXG4gICAgICAgIGwgPSB0aGlzLl9rZXlzLmxlbmd0aDtcbiAgICBmb3IgKDsgaSA8IGw7IGkrKykge1xuICAgICAgZm4odGhpcy5fdmFsdWVzW2ldLCB0aGlzLl9rZXlzW2ldKTtcbiAgICB9XG4gIH1cbn07XG4vL2RldGVjdCBOYU4vMCBlcXVhbGl0eVxuZnVuY3Rpb24gaXMoYSwgYikge1xuICByZXR1cm4gaXNOYU4oYSkgPyBpc05hTihiKSA6IGEgPT09IGI7XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlS2V5KGtleSkge1xuICBpZiAoa2V5ICE9PSBPYmplY3Qoa2V5KSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1tNYXBdSW52YWxpZCB2YWx1ZSB1c2VkIGFzIGEgbWFwIGtleSEgZ2l2ZW46ICcgKyBrZXkpO1xuICB9XG59IiwiaW1wb3J0IE1hcCBmcm9tICcuL21hcCc7XG5leHBvcnQgeyBNYXAgfTsiLCJcbmV4cG9ydCBkZWZhdWx0IGFkZEV2ZW50TGlzdGVuZXI7XG4vL2xpc3RlbiBhbGwgZXZlbnQgYXQgY2FwdHVyZSBwaGFzZVxuXG5mdW5jdGlvbiBhZGRFdmVudExpc3RlbmVyKGVsLCB0eXBlLCBoYW5kbGVyKSB7XG4gIHJldHVybiBlbC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGhhbmRsZXIsIHRydWUpO1xufSIsIlxuZXhwb3J0IGRlZmF1bHQgcmVtb3ZlRXZlbnRMaXN0ZW5lcjtcbi8vbGlzdGVuIGFsbCBldmVudCBhdCBjYXB0dXJlIHBoYXNlXG5cbmZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXIoZWwsIHR5cGUsIGhhbmRsZXIpIHtcbiAgcmV0dXJuIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgaGFuZGxlciwgdHJ1ZSk7XG59IiwiXG5pbXBvcnQgeyBleHRlbmQgfSBmcm9tICcuLi91dGlscyc7XG52YXIgRVZfUFJPUFMgPSB7XG4gIGFsbDogWydhbHRLZXknLCAnYnViYmxlcycsICdjYW5jZWxhYmxlJywgJ2N0cmxLZXknLCAnZXZlbnRQaGFzZScsICdtZXRhS2V5JywgJ3JlbGF0ZWRUYXJnZXQnLCAnc2hpZnRLZXknLCAndGFyZ2V0JywgJ3RpbWVTdGFtcCcsICd0eXBlJywgJ3ZpZXcnLCAnd2hpY2gnXSxcbiAgbW91c2U6IFsnYnV0dG9uJywgJ2J1dHRvbnMnLCAnY2xpZW50WCcsICdjbGllbnRZJywgJ2xheWVyWCcsICdsYXllclknLCAnb2Zmc2V0WCcsICdvZmZzZXRZJywgJ3BhZ2VYJywgJ3BhZ2VZJywgJ3NjcmVlblgnLCAnc2NyZWVuWScsICd0b0VsZW1lbnQnXSxcbiAga2V5OiBbJ2NoYXInLCAnY2hhckNvZGUnLCAna2V5JywgJ2tleUNvZGUnXVxufTtcbnZhciBya2V5RXZlbnQgPSAvXmtleXxpbnB1dC87XG52YXIgcm1vdXNlRXZlbnQgPSAvXig/Om1vdXNlfHBvaW50ZXJ8Y29udGV4dG1lbnUpfGNsaWNrLztleHBvcnQgZGVmYXVsdCBQcm94eUV2ZW50O1xuXG5mdW5jdGlvbiBQcm94eUV2ZW50KGV2KSB7XG4gIGlmICghdGhpcyBpbnN0YW5jZW9mIFByb3h5RXZlbnQpIHtcbiAgICByZXR1cm4gbmV3IFByb3h5RXZlbnQoZXYpO1xuICB9XG4gIHRoaXMuaW5pdChldik7XG5cbiAgaWYgKHJrZXlFdmVudC50ZXN0KGV2LnR5cGUpKSB7XG4gICAgc3ludGhlc2l6ZUV2UHJvcHModGhpcywgZXYsICdrZXknKTtcbiAgfSBlbHNlIGlmIChybW91c2VFdmVudC50ZXN0KGV2LnR5cGUpKSB7XG4gICAgc3ludGhlc2l6ZUV2UHJvcHModGhpcywgZXYsICdtb3VzZScpO1xuICB9XG59XG5Qcm94eUV2ZW50LnByb3RvdHlwZSA9IGV4dGVuZChQcm94eUV2ZW50LnByb3RvdHlwZSwge1xuICBpbml0OiBmdW5jdGlvbiAoZXYpIHtcbiAgICBzeW50aGVzaXplRXZQcm9wcyh0aGlzLCBldiwgJ2FsbCcpO1xuICAgIHRoaXMub3JpZ2luYWxFdmVudCA9IGV2O1xuICAgIHRoaXMuX2J1YmJsZXMgPSBmYWxzZTtcbiAgfSxcbiAgcHJldmVudERlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5vcmlnaW5hbEV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIH0sXG4gIHN0YXJ0UHJvcGFnYXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLl9idWJibGVzID0gdHJ1ZTtcbiAgfVxufSk7XG5cbmZ1bmN0aW9uIHN5bnRoZXNpemVFdlByb3BzKHByb3h5LCBldiwgY2F0ZWdvcnkpIHtcbiAgdmFyIGV2UHJvcHMgPSBFVl9QUk9QU1tjYXRlZ29yeV07XG4gIGZvciAodmFyIGkgPSAwLCBsID0gZXZQcm9wcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICB2YXIgcHJvcCA9IGV2UHJvcHNbaV07XG4gICAgcHJveHlbcHJvcF0gPSBldltwcm9wXTtcbiAgfVxufSIsIlxuXG5leHBvcnQgZGVmYXVsdCBET01EZWxlZ2F0b3I7XG4vKipcbiAqIGRvbS1kZWxlZ2F0b3JlIGFsbG93cyB5b3UgdG8gYXR0YWNoIGFuIEV2ZW50SGFuZGxlciB0byBhIGRvbSBlbGVtZW50LlxuICogV2hlbiB0aGUgY29ycmVjdCBldmVudCBvY2N1cnMsIGRvbS1kZWxlZ2F0b3Igd2lsbCBsZXQgdGhlIGdsb2JhbCBkZWxlZ2F0ZVxuICogZXZlbnRIYW5kbGVyIHRvIGhhbmRsZSB0aGUgZXZlbnQgYW5kIHRyaWdnZXIgeW91ciBhdHRhY2hlZCBFdmVudEhhbmRsZXIuXG4gKi9cbmltcG9ydCB7IGRvY3VtZW50IGFzICRkb2N1bWVudCB9IGZyb20gJy4uL2dsb2JhbHMnO1xuXG5pbXBvcnQgYWRkRXZlbnRMaXN0ZW5lciBmcm9tICcuL2FkZEV2ZW50JztcbmltcG9ydCByZW1vdmVFdmVudExpc3RlbmVyIGZyb20gJy4vcmVtb3ZlRXZlbnQnO1xuaW1wb3J0IFByb3h5RXZlbnQgZnJvbSAnLi9wcm94eUV2ZW50JztcbmltcG9ydCB7IHR5cGUsIGdldEhhc2ggfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgeyBNYXAgfSBmcm9tICcuLi9zdG9yZSc7XG5mdW5jdGlvbiBET01EZWxlZ2F0b3IoZG9jKSB7XG4gIGlmICghdGhpcyBpbnN0YW5jZW9mIERPTURlbGVnYXRvcikge1xuICAgIHJldHVybiBuZXcgRE9NRGVsZWdhdG9yKGRvYyk7XG4gIH1cblxuICBkb2MgPSBkb2MgfHwgJGRvY3VtZW50IHx8IHsgZG9jdW1lbnRFbGVtZW50OiAxIH07IC8vZW5hYmxlIHRvIHJ1biBpbiBub2RlanM7XG4gIGlmICghZG9jLmRvY3VtZW50RWxlbWVudCkge1xuICAgIHRocm93IG5ldyBFcnJvcignW0RPTURlbGVnYXRvcl1JbnZhbGlkIHBhcmFtZXRlciBcImRvY1wiLCBzaG91bGQgYmUgYSBkb2N1bWVudCBvYmplY3QhIGdpdmVuOiAnICsgZG9jKTtcbiAgfVxuICB0aGlzLnJvb3QgPSBkb2MuZG9jdW1lbnRFbGVtZW50O1xuICB0aGlzLmxpc3RlbmVkRXZlbnRzID0gZ2V0SGFzaCgpO1xuICB0aGlzLmV2ZW50RGlzcGF0Y2hlcnMgPSBnZXRIYXNoKCk7XG4gIHRoaXMuZ2xvYmFsTGlzdGVuZXJzID0gZ2V0SGFzaCgpO1xuICB0aGlzLmRvbUV2SGFuZGxlck1hcCA9IG5ldyBNYXAoKTtcbn1cblxudmFyIHByb3RvID0gRE9NRGVsZWdhdG9yLnByb3RvdHlwZTtcblxucHJvdG8ub24gPSBmdW5jdGlvbiBvbihlbCwgZXZUeXBlLCBoYW5kbGVyKSB7XG4gIHZhciBldlN0b3JlID0gZ2V0RXZTdG9yZSh0aGlzLmRvbUV2SGFuZGxlck1hcCwgZWwsIGdldEhhc2goKSk7XG4gIGFkZExpc3RlbmVyKGV2U3RvcmUsIGV2VHlwZSwgdGhpcywgaGFuZGxlcik7XG4gIHJldHVybiB0aGlzO1xufTtcblxucHJvdG8ub2ZmID0gZnVuY3Rpb24gb2ZmKGVsLCBldlR5cGUsIGhhbmRsZXIpIHtcbiAgdmFyIGV2U3RvcmUgPSBnZXRFdlN0b3JlKHRoaXMuZG9tRXZIYW5kbGVyTWFwLCBlbCk7XG4gIGlmICghZXZTdG9yZSkge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDMpIHtcbiAgICByZW1vdmVMaXN0ZW5lcihldlN0b3JlLCBldlR5cGUsIHRoaXMsIGhhbmRsZXIpO1xuICB9IGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICByZW1vdmVMaXN0ZW5lcihldlN0b3JlLCBldlR5cGUsIHRoaXMpO1xuICB9IGVsc2Uge1xuICAgIHJlbW92ZUFsbExpc3RlbmVyKGV2U3RvcmUsIHRoaXMpO1xuICB9XG5cbiAgaWYgKE9iamVjdC5rZXlzKGV2U3RvcmUpLmxlbmd0aCA9PT0gMCkge1xuICAgIHRoaXMuZG9tRXZIYW5kbGVyTWFwLnJlbW92ZShlbCk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5wcm90by5hZGRHbG9iYWxFdmVudExpc3RlbmVyID0gZnVuY3Rpb24gYWRkR2xvYmFsRXZlbnRMaXN0ZW5lcihldlR5cGUsIGhhbmRsZXIpIHtcbiAgYWRkTGlzdGVuZXIodGhpcy5nbG9iYWxMaXN0ZW5lcnMsIGV2VHlwZSwgdGhpcywgaGFuZGxlcik7XG4gIHJldHVybiB0aGlzO1xufTtcbnByb3RvLnJlbW92ZUdsb2JhbEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbiByZW1vdmVHbG9iYWxFdmVudExpc3RlbmVyKGV2VHlwZSwgaGFuZGxlcikge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAyKSB7XG4gICAgcmVtb3ZlTGlzdGVuZXIodGhpcy5nbG9iYWxMaXN0ZW5lcnMsIGV2VHlwZSwgdGhpcywgaGFuZGxlcik7XG4gIH0gZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIHJlbW92ZUxpc3RlbmVyKHRoaXMuZ2xvYmFsTGlzdGVuZXJzLCBldlR5cGUsIHRoaXMpO1xuICB9IGVsc2Uge1xuICAgIHJlbW92ZUFsbExpc3RlbmVyKHRoaXMuZ2xvYmFsTGlzdGVuZXJzLCB0aGlzKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5wcm90by5kZXN0cm95ID0gZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgdGhpcy51bmxpc3RlblRvKCk7XG4gIHRoaXMubGlzdGVuZWRFdmVudHMgPSBudWxsO1xuICB0aGlzLmV2ZW50RGlzcGF0Y2hlcnMgPSBudWxsO1xuICB0aGlzLmdsb2JhbExpc3RlbmVycyA9IG51bGw7XG4gIHRoaXMuZG9tRXZIYW5kbGVyTWFwLmNsZWFyKCk7XG59O1xuXG4vL2ZvciBlYWNoIGV2VHlwZSwgaW5jcmVhc2UgYnkgMSBpZiB0aGVyZSBpcyBhIG5ldyBlbCBzdGFydCB0byBsaXN0ZW5cbi8vIHRvIHRoaXMgdHlwZSBvZiBldmVudFxucHJvdG8ubGlzdGVuVG8gPSBmdW5jdGlvbiBsaXN0ZW5UbyhldlR5cGUpIHtcbiAgaWYgKCEoZXZUeXBlIGluIHRoaXMubGlzdGVuZWRFdmVudHMpKSB7XG4gICAgdGhpcy5saXN0ZW5lZEV2ZW50c1tldlR5cGVdID0gMDtcbiAgfVxuICB0aGlzLmxpc3RlbmVkRXZlbnRzW2V2VHlwZV0rKztcblxuICBpZiAodGhpcy5saXN0ZW5lZEV2ZW50c1tldlR5cGVdICE9PSAxKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgdmFyIGxpc3RlbmVyID0gdGhpcy5ldmVudERpc3BhdGNoZXJzW2V2VHlwZV07XG4gIGlmICghbGlzdGVuZXIpIHtcbiAgICBsaXN0ZW5lciA9IHRoaXMuZXZlbnREaXNwYXRjaGVyc1tldlR5cGVdID0gY3JlYXRlRGlzcGF0Y2hlcihldlR5cGUsIHRoaXMpO1xuICB9XG4gIGFkZEV2ZW50TGlzdGVuZXIodGhpcy5yb290LCBldlR5cGUsIGxpc3RlbmVyKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuLy9mb3IgZWFjaCBldlR5cGUsIGRlY3JlYXNlIGJ5IDEgaWYgdGhlcmUgaXMgYSBlbCBzdG9wIHRvIGxpc3RlblxuLy8gdG8gdGhpcyB0eXBlIG9mIGV2ZW50XG5wcm90by51bmxpc3RlblRvID0gZnVuY3Rpb24gdW5saXN0ZW5UbyhldlR5cGUpIHtcbiAgdmFyIGV2ZW50RGlzcGF0Y2hlcnMgPSB0aGlzLmV2ZW50RGlzcGF0Y2hlcnMsXG4gICAgICBkZWxlZ2F0b3IgPSB0aGlzO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIC8vcmVtb3ZlIGFsbCBkaXNwYXRjaCBsaXN0ZW5lcnNcbiAgICBPYmplY3Qua2V5cyhldmVudERpc3BhdGNoZXJzKS5maWx0ZXIoZnVuY3Rpb24gKGV0eXBlKSB7XG4gICAgICB2YXIgcnRuID0gISFldmVudERpc3BhdGNoZXJzW2V0eXBlXTtcbiAgICAgIGlmIChydG4pIHtcbiAgICAgICAgLy9mb3JjZSB0byBjYWxsIHJlbW92ZUV2ZW50TGlzdGVuZXIgbWV0aG9kXG4gICAgICAgIGV2ZW50RGlzcGF0Y2hlcnNbZXR5cGVdID0gMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBydG47XG4gICAgfSkuZm9yRWFjaChmdW5jdGlvbiAoZXR5cGUpIHtcbiAgICAgIGRlbGVnYXRvci51bmxpc3RlblRvKGV0eXBlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBpZiAoIShldlR5cGUgaW4gdGhpcy5saXN0ZW5lZEV2ZW50cykgfHwgdGhpcy5saXN0ZW5lZEV2ZW50c1tldlR5cGVdID09PSAwKSB7XG4gICAgY29uc29sZS5sb2coJ1tET01EZWxlZ2F0b3IgdW5saXN0ZW5Ub11ldmVudCBcIicgKyBldlR5cGUgKyAnXCIgaXMgYWxyZWFkeSB1bmxpc3RlbmVkIScpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHRoaXMubGlzdGVuZWRFdmVudHNbZXZUeXBlXS0tO1xuICBpZiAodGhpcy5saXN0ZW5lZEV2ZW50c1tldlR5cGVdID4gMCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHZhciBsaXN0ZW5lciA9IHRoaXMuZXZlbnREaXNwYXRjaGVyc1tldlR5cGVdO1xuICBpZiAoIWxpc3RlbmVyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdbRE9NRGVsZWdhdG9yIHVubGlzdGVuVG9dOiBjYW5ub3QgJyArICd1bmxpc3RlbiB0byAnICsgZXZUeXBlKTtcbiAgfVxuICByZW1vdmVFdmVudExpc3RlbmVyKHRoaXMucm9vdCwgZXZUeXBlLCBsaXN0ZW5lcik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuZnVuY3Rpb24gY3JlYXRlRGlzcGF0Y2hlcihldlR5cGUsIGRlbGVnYXRvcikge1xuICB2YXIgZ2xvYmFsTGlzdGVuZXJzID0gZGVsZWdhdG9yLmdsb2JhbExpc3RlbmVycyxcbiAgICAgIGRlbGVnYXRvclJvb3QgPSBkZWxlZ2F0b3Iucm9vdDtcbiAgcmV0dXJuIGZ1bmN0aW9uIGRpc3BhdGNoZXIoZXYpIHtcbiAgICB2YXIgZ2xvYmFsSGFuZGxlcnMgPSBnbG9iYWxMaXN0ZW5lcnNbZXZUeXBlXSB8fCBbXTtcbiAgICBpZiAoZ2xvYmFsSGFuZGxlcnMgJiYgZ2xvYmFsSGFuZGxlcnMubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIGdsb2JhbEV2ZW50ID0gbmV3IFByb3h5RXZlbnQoZXYpO1xuICAgICAgZ2xvYmFsRXZlbnQudGFyZ2V0ID0gZGVsZWdhdG9yUm9vdDtcbiAgICAgIGNhbGxMaXN0ZW5lcnMoZ2xvYmFsSGFuZGxlcnMsIGdsb2JhbEV2ZW50KTtcbiAgICB9XG5cbiAgICBmaW5kQW5kSW52b2tlTGlzdGVuZXJzKGV2LnRhcmdldCwgZXYsIGV2VHlwZSwgZGVsZWdhdG9yKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZmluZEFuZEludm9rZUxpc3RlbmVycyhlbCwgZXYsIGV2VHlwZSwgZGVsZWdhdG9yKSB7XG4gIHZhciBsaXN0ZW5lciA9IGdldExpc3RlbmVyKGVsLCBldlR5cGUsIGRlbGVnYXRvcik7XG4gIGlmIChsaXN0ZW5lciAmJiBsaXN0ZW5lci5oYW5kbGVycy5sZW5ndGggPiAwKSB7XG4gICAgdmFyIGxpc3RlbmVyRXZlbnQgPSBuZXcgUHJveHlFdmVudChldik7XG4gICAgbGlzdGVuZXJFdmVudC5jdXJyZW50VGFyZ2V0ID0gbGlzdGVuZXIuY3VycmVudFRhcmdldDtcbiAgICBjYWxsTGlzdGVuZXJzKGxpc3RlbmVyLmhhbmRsZXJzLCBsaXN0ZW5lckV2ZW50KTtcbiAgICBpZiAobGlzdGVuZXJFdmVudC5fYnViYmxlcykge1xuICAgICAgZmluZEFuZEludm9rZUxpc3RlbmVycyhsaXN0ZW5lci5jdXJyZW50VGFyZ2V0LnBhcmVudE5vZGUsIGV2LCBldlR5cGUsIGRlbGVnYXRvcik7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGdldExpc3RlbmVyKHRhcmdldCwgZXZUeXBlLCBkZWxlZ2F0b3IpIHtcbiAgaWYgKHRhcmdldCA9PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmFyIGV2U3RvcmUgPSBnZXRFdlN0b3JlKGRlbGVnYXRvci5kb21FdkhhbmRsZXJNYXAsIHRhcmdldCksXG4gICAgICBoYW5kbGVycztcbiAgaWYgKCFldlN0b3JlIHx8ICEoaGFuZGxlcnMgPSBldlN0b3JlW2V2VHlwZV0pIHx8IGhhbmRsZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBnZXRMaXN0ZW5lcih0YXJnZXQucGFyZW50Tm9kZSwgZXZUeXBlLCBkZWxlZ2F0b3IpO1xuICB9XG4gIHJldHVybiB7XG4gICAgY3VycmVudFRhcmdldDogdGFyZ2V0LFxuICAgIGhhbmRsZXJzOiBoYW5kbGVyc1xuICB9O1xufVxuXG5mdW5jdGlvbiBjYWxsTGlzdGVuZXJzKGhhbmRsZXJzLCBldikge1xuICBoYW5kbGVycy5mb3JFYWNoKGZ1bmN0aW9uIChoYW5kbGVyKSB7XG4gICAgaWYgKHR5cGUoaGFuZGxlcikgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGhhbmRsZXIoZXYpO1xuICAgIH0gZWxzZSBpZiAodHlwZShoYW5kbGVyLmhhbmRsZUV2ZW50KSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgaGFuZGxlci5oYW5kbGVFdmVudChldik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignW0RPTURlbGVnYXRvciBjYWxsTGlzdGVuZXJzXSB1bmtub3duIGhhbmRsZXIgJyArICdmb3VuZDogJyArIEpTT04uc3RyaW5naWZ5KGhhbmRsZXJzKSk7XG4gICAgfVxuICB9KTtcbn1cbi8vaGVscGVyc1xuZnVuY3Rpb24gZ2V0RXZTdG9yZShtYXAsIGVsLCBkZWZhdWx0U3RvcmUpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPiAyID8gbWFwLmdldChlbCwgZGVmYXVsdFN0b3JlKSA6IG1hcC5nZXQoZWwpO1xufVxuXG5mdW5jdGlvbiBhZGRMaXN0ZW5lcihldkhhc2gsIGV2VHlwZSwgZGVsZWdhdG9yLCBoYW5kbGVyKSB7XG4gIHZhciBoYW5kbGVycyA9IGV2SGFzaFtldlR5cGVdIHx8IFtdO1xuICBpZiAoaGFuZGxlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgLy9pdCdzIGZpcnN0IHRpbWUgZm9yIHRoaXMgZWwgdG8gbGlzdGVuIHRvIGV2ZW50IG9mIGV2VHlwZVxuICAgIGRlbGVnYXRvci5saXN0ZW5UbyhldlR5cGUpO1xuICB9XG4gIGlmIChoYW5kbGVycy5pbmRleE9mKGhhbmRsZXIpID09PSAtMSkge1xuICAgIGhhbmRsZXJzLnB1c2goaGFuZGxlcik7XG4gIH1cbiAgZXZIYXNoW2V2VHlwZV0gPSBoYW5kbGVycztcbiAgcmV0dXJuIGhhbmRsZXI7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKGV2SGFzaCwgZXZUeXBlLCBkZWxlZ2F0b3IsIGhhbmRsZXIpIHtcbiAgdmFyIGhhbmRsZXJzID0gZXZIYXNoW2V2VHlwZV07XG4gIGlmICghaGFuZGxlcnMgfHwgaGFuZGxlcnMubGVuZ3RoID09PSAwIHx8IGFyZ3VtZW50cy5sZW5ndGggPT09IDMpIHtcbiAgICBpZiAoaGFuZGxlcnMgJiYgaGFuZGxlcnMubGVuZ3RoKSB7XG4gICAgICAvL3RoaXMgZWwgc3RvcCB0byBsaXN0ZW4gdG8gZXZlbnQgb2YgZXZUeXBlXG4gICAgICBkZWxlZ2F0b3IudW5saXN0ZW5UbyhldlR5cGUpO1xuICAgIH1cbiAgICBkZWxldGUgZXZIYXNoW2V2VHlwZV07XG4gICAgcmV0dXJuIGhhbmRsZXI7XG4gIH1cbiAgdmFyIGluZGV4ID0gaGFuZGxlcnMuaW5kZXhPZihoYW5kbGVyKTtcbiAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgIGhhbmRsZXJzLnNwbGljZShpbmRleCwgMSk7XG4gIH1cbiAgZXZIYXNoW2V2VHlwZV0gPSBoYW5kbGVycztcbiAgaWYgKGhhbmRsZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgIC8vdGhpcyBlbCBzdG9wIHRvIGxpc3RlbiB0byBldmVudCBvZiBldlR5cGVcbiAgICBkZWxlZ2F0b3IudW5saXN0ZW5UbyhldlR5cGUpO1xuICAgIGRlbGV0ZSBldkhhc2hbZXZUeXBlXTtcbiAgfVxuICByZXR1cm4gaGFuZGxlcjtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlQWxsTGlzdGVuZXIoZXZIYXNoLCBkZWxlZ2F0b3IpIHtcbiAgT2JqZWN0LmtleXMoZXZIYXNoKS5mb3JFYWNoKGZ1bmN0aW9uIChldlR5cGUpIHtcbiAgICByZW1vdmVMaXN0ZW5lcihldkhhc2gsIGV2VHlwZSwgZGVsZWdhdG9yKTtcbiAgfSk7XG4gIHJldHVybiBldkhhc2g7XG59IiwiaW1wb3J0IHsgcmVxdWVzdEFuaW1hdGlvbkZyYW1lIGFzIHJhZiwgY2FuY2VsQW5pbWF0aW9uRnJhbWUgYXMgY2FuY2VsUmFmLCBGUkFNRV9CVURHRVQgfSBmcm9tICcuL3JhZic7XG5pbXBvcnQgeyB0eXBlLCBOT09QIH0gZnJvbSAnLi4vdXRpbHMnO1xuZnVuY3Rpb24gQmF0Y2gob3B0cykge1xuICB0aGlzLm9wdGlvbnMgPSBvcHRzIHx8IHt9O1xuICB2YXIgY2IgPSB0aGlzLm9wdGlvbnMub25GbHVzaDtcbiAgdGhpcy5fY2IgPSB0eXBlKGNiKSA9PT0gJ2Z1bmN0aW9uJyA/IGNiIDogTk9PUDtcbiAgdGhpcy5fcXVldWUgPSBbXTtcbiAgdGhpcy5fc3RhcnRQb3MgPSAwO1xuICB0aGlzLmZsdXNoID0gdGhpcy5mbHVzaC5iaW5kKHRoaXMpO1xufVxuQmF0Y2gucHJvdG90eXBlLmFkZFRhcmdldCA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgdmFyIG9sZExlbiA9IHRoaXMuX3F1ZXVlLmxlbmd0aDtcbiAgaWYgKHR5cGUodGhpcy5vcHRpb25zLm9uQWRkVGFyZ2V0KSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHRoaXMuX3F1ZXVlID0gdGhpcy5vcHRpb25zLm9uQWRkVGFyZ2V0LmNhbGwodGhpcywgdGhpcy5fcXVldWUsIHRhcmdldCk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fcXVldWUucHVzaCh0YXJnZXQpO1xuICB9XG5cbiAgaWYgKG9sZExlbiA9PT0gMCAmJiB0aGlzLl9xdWV1ZS5sZW5ndGggPT09IDEpIHtcbiAgICB0aGlzLnNjaGVkdWxlRmx1c2goKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5CYXRjaC5wcm90b3R5cGUucmVtb3ZlVGFyZ2V0ID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICB2YXIgaWR4ID0gdGhpcy5fcXVldWUuaW5kZXhPZih0YXJnZXQpO1xuICBpZiAoaWR4ICE9PSAtMSkge1xuICAgIHRoaXMuX3F1ZXVlLnNwbGljZShpZHgsIDEpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcbkJhdGNoLnByb3RvdHlwZS5mbHVzaCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHN0YXJ0VGltZSA9IG5ldyBEYXRlKCksXG4gICAgICBlbGFwc2VkVGltZSxcbiAgICAgIGNiID0gdGhpcy5fY2IsXG4gICAgICBzdGFydFBvcyA9IHRoaXMuX3N0YXJ0UG9zLFxuICAgICAgdGFzayxcbiAgICAgIF9pLFxuICAgICAgX2xlbixcbiAgICAgIF9yZWY7XG4gIF9yZWYgPSB0aGlzLl9xdWV1ZTtcbiAgZm9yIChfaSA9IHN0YXJ0UG9zLCBfbGVuID0gX3JlZi5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgIHRhc2sgPSBfcmVmW19pXTtcbiAgICBjYi5jYWxsKG51bGwsIHRhc2spO1xuICAgIGVsYXBzZWRUaW1lID0gbmV3IERhdGUoKSAtIHN0YXJ0VGltZTtcbiAgICBpZiAoZWxhcHNlZFRpbWUgPiBGUkFNRV9CVURHRVQpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdmcmFtZSBidWRnZXQgb3ZlcmZsb3c6JywgZWxhcHNlZFRpbWUpO1xuICAgICAgX2krKztcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHRoaXMuX3F1ZXVlLnNwbGljZSgwLCBfaSk7XG4gIHRoaXMuX3N0YXJ0UG9zID0gMDtcblxuICBpZiAodGhpcy5fcXVldWUubGVuZ3RoKSB7XG4gICAgdGhpcy5zY2hlZHVsZUZsdXNoKCk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHR5cGUodGhpcy5vcHRpb25zLm9uRmluaXNoKSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5vcHRpb25zLm9uRmluaXNoLmNhbGwobnVsbCk7XG4gICAgfVxuICB9XG59O1xuQmF0Y2gucHJvdG90eXBlLnNjaGVkdWxlRmx1c2ggPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLl90aWNrKSB7XG4gICAgY2FuY2VsUmFmKHRoaXMuX3RpY2spO1xuICB9XG4gIHRoaXMuX3RpY2sgPSByYWYodGhpcy5mbHVzaCk7XG4gIHJldHVybiB0aGlzLl90aWNrO1xufTtcbkJhdGNoLnByb3RvdHlwZS5vbkZsdXNoID0gZnVuY3Rpb24gKGZuKSB7XG4gIGlmICh0eXBlKGZuKSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1tCYXRjaC5wcm90b3R5cGUub25GbHVzaF1uZWVkIGEgRnVuY3Rpb24gaGVyZSwgYnV0IGdpdmVuICcgKyBmbik7XG4gIH1cbiAgdGhpcy5fY2IgPSBmbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuQmF0Y2gucHJvdG90eXBlLmxlbmd0aCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuX3F1ZXVlLmxlbmd0aDtcbn07XG5CYXRjaC5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uICgpIHtcbiAgY2FuY2VsUmFmKHRoaXMuX3RpY2spO1xuICB0aGlzLl9xdWV1ZS5sZW5ndGggPSAwO1xuICByZXR1cm4gdGhpcztcbn07XG5bJ29uQWRkVGFyZ2V0JywgJ29uRmluaXNoJ10uZm9yRWFjaChmdW5jdGlvbiAobW5hbWUpIHtcbiAgQmF0Y2gucHJvdG90eXBlW21uYW1lXSA9IGZ1bmN0aW9uIChmbikge1xuICAgIGlmICh0eXBlKGZuKSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignW0JhdGNoLnByb3RvdHlwZS4nICsgbW5hbWUgKyAnXW5lZWQgYSBGdW5jdGlvbiBoZXJlLCBidXQgZ2l2ZW4gJyArIGZuKTtcbiAgICB9XG4gICAgdGhpcy5vcHRpb25zW21uYW1lXSA9IGZuO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xufSk7XG5leHBvcnQgZGVmYXVsdCBCYXRjaDsiLCJpbXBvcnQgeyBNYXAgfSBmcm9tICcuL3N0b3JlJztcbmltcG9ydCBET01EZWxlZ2F0b3IgZnJvbSAnLi9kb20tZGVsZWdhdG9yJztcbmltcG9ydCBCYXRjaCBmcm9tICcuL3VwZGF0ZS9iYXRjaCc7XG52YXIgZ2xvYmFsID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB7fTtcbmV4cG9ydCB7IGdsb2JhbCB9O1xudmFyIGRvY3VtZW50ID0gZ2xvYmFsLmRvY3VtZW50O1xuZXhwb3J0IHsgZG9jdW1lbnQgfTtcbnZhciBydW50aW1lID0gdHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmICFwcm9jZXNzLmJyb3dzZXIgPyAnbm9kZWpzJyA6IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gJ2Jyb3dzZXInIDogJ3Vua25vd24nO1xuZXhwb3J0IHsgcnVudGltZSB9O1xudmFyIEcgPSB7XG4gIGZvcmNpbmc6IGZhbHNlLFxuICB1bmxvYWRlcnM6IG5ldyBNYXAoKSxcbiAgY29tcHV0ZVByZVJlZHJhd0hvb2s6IG51bGwsXG4gIGNvbXB1dGVQb3N0UmVkcmF3SG9vazogbnVsbCxcbiAgLy9tb3VudCByZWdpc3RyaWVzXG4gIHJvb3RzOiBbXSxcbiAgcmVjcmVhdGlvbnM6IFtdLFxuICBjb21wb25lbnRzOiBbXSxcbiAgY29udHJvbGxlcnM6IFtdLFxuICAvL3JlbmRlciByZWdpc3RyaWVzXG4gIGRvbUNhY2hlTWFwOiBuZXcgTWFwKCksXG4gIGRvbURlbGVnYXRvcjogbmV3IERPTURlbGVnYXRvcigpLFxuICAvL2dsb2JhbCBiYXRjaCByZW5kZXIgcXVldWVcbiAgcmVuZGVyUXVldWU6IG5ldyBCYXRjaCgpXG59O1xuZXhwb3J0IHsgRyB9OyIsImltcG9ydCB7IGdsb2JhbCBhcyAkZ2xvYmFsIH0gZnJvbSAnLi4vZ2xvYmFscyc7XG52YXIgbGFzdFRpbWUgPSAwLFxuICAgIEZSQU1FX0JVREdFVCA9IDE2LFxuICAgIHZlbmRvcnMgPSBbJ3dlYmtpdCcsICdtb3onLCAnbXMnLCAnbyddLFxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9ICRnbG9iYWwucmVxdWVzdEFuaW1hdGlvbkZyYW1lLFxuICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lID0gJGdsb2JhbC5jYW5jZWxBbmltYXRpb25GcmFtZSB8fCAkZ2xvYmFsLmNhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZTtcbmZvciAodmFyIHggPSAwLCBsID0gdmVuZG9ycy5sZW5ndGg7IHggPCBsICYmICFyZXF1ZXN0QW5pbWF0aW9uRnJhbWU7ICsreCkge1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSAkZ2xvYmFsW3ZlbmRvcnNbeF0gKyAnUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ107XG4gIGNhbmNlbEFuaW1hdGlvbkZyYW1lID0gJGdsb2JhbFt2ZW5kb3JzW3hdICsgJ0NhbmNlbEFuaW1hdGlvbkZyYW1lJ10gfHwgJGdsb2JhbFt2ZW5kb3JzW3hdICsgJ0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSddO1xufVxuXG5pZiAoIXJlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICB2YXIgY3VyclRpbWUgPSBEYXRlLm5vdyA/IERhdGUubm93KCkgOiBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICB2YXIgdGltZVRvQ2FsbCA9IE1hdGgubWF4KDAsIEZSQU1FX0JVREdFVCAtIChjdXJyVGltZSAtIGxhc3RUaW1lKSk7XG4gICAgdmFyIGlkID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBjYWxsYmFjayhjdXJyVGltZSArIHRpbWVUb0NhbGwpO1xuICAgIH0sIHRpbWVUb0NhbGwpO1xuICAgIGxhc3RUaW1lID0gY3VyclRpbWUgKyB0aW1lVG9DYWxsO1xuICAgIHJldHVybiBpZDtcbiAgfTtcbn1cblxuaWYgKCFjYW5jZWxBbmltYXRpb25GcmFtZSkge1xuICBjYW5jZWxBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uIChpZCkge1xuICAgIHJldHVybiBjbGVhclRpbWVvdXQoaWQpO1xuICB9O1xufVxuXG5leHBvcnQgeyByZXF1ZXN0QW5pbWF0aW9uRnJhbWUsIGNhbmNlbEFuaW1hdGlvbkZyYW1lLCBGUkFNRV9CVURHRVQgfTsiLCJcbmV4cG9ydCBkZWZhdWx0IGNsZWFyO1xuXG5pbXBvcnQgeyB0eXBlLCBOT09QIH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHsgRyB9IGZyb20gJy4uL2dsb2JhbHMnO1xudmFyIGRvbUNhY2hlTWFwID0gRy5kb21DYWNoZU1hcDtcbnZhciBkb21EZWxlZ2F0b3IgPSBHLmRvbURlbGVnYXRvcjtcbmZ1bmN0aW9uIGNsZWFyKGRvbU5vZGVzLCB2Tm9kZXMpIHtcbiAgdk5vZGVzID0gdk5vZGVzIHx8IFtdO1xuICB2Tm9kZXMgPSBbXS5jb25jYXQodk5vZGVzKTtcbiAgZm9yICh2YXIgaSA9IGRvbU5vZGVzLmxlbmd0aCAtIDE7IGkgPiAtMTsgaS0tKSB7XG4gICAgaWYgKGRvbU5vZGVzW2ldICYmIGRvbU5vZGVzW2ldLnBhcmVudE5vZGUpIHtcbiAgICAgIGlmICh2Tm9kZXNbaV0pIHtcbiAgICAgICAgdW5sb2FkKHZOb2Rlc1tpXSk7XG4gICAgICB9IC8vIGNsZWFudXAgYmVmb3JlIGRvbSBpcyByZW1vdmVkIGZyb20gZG9tIHRyZWVcbiAgICAgIGRvbURlbGVnYXRvci5vZmYoZG9tTm9kZXNbaV0pO1xuICAgICAgZG9tQ2FjaGVNYXAucmVtb3ZlKGRvbU5vZGVzW2ldKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGRvbU5vZGVzW2ldLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZG9tTm9kZXNbaV0pO1xuICAgICAgICAvKmVzbGludCBuby1lbXB0eTowKi9cbiAgICAgIH0gY2F0Y2ggKGUpIHt9IC8vaWdub3JlIGlmIHRoaXMgZmFpbHMgZHVlIHRvIG9yZGVyIG9mIGV2ZW50cyAoc2VlIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjE5MjYwODMvZmFpbGVkLXRvLWV4ZWN1dGUtcmVtb3ZlY2hpbGQtb24tbm9kZSlcbiAgICB9XG4gIH1cbiAgaWYgKGRvbU5vZGVzLmxlbmd0aCAhPSAwKSB7XG4gICAgZG9tTm9kZXMubGVuZ3RoID0gMDtcbiAgfVxufVxuXG5mdW5jdGlvbiB1bmxvYWQodk5vZGUpIHtcbiAgaWYgKHZOb2RlLmNvbmZpZ0NvbnRleHQgJiYgdHlwZSh2Tm9kZS5jb25maWdDb250ZXh0Lm9udW5sb2FkKSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHZOb2RlLmNvbmZpZ0NvbnRleHQub251bmxvYWQoKTtcbiAgICB2Tm9kZS5jb25maWdDb250ZXh0Lm9udW5sb2FkID0gbnVsbDtcbiAgfVxuICBpZiAodk5vZGUuY29udHJvbGxlcnMpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHZOb2RlLmNvbnRyb2xsZXJzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgdmFyIGNvbnRyb2xsZXIgPSB2Tm9kZS5jb250cm9sbGVyc1tpXTtcbiAgICAgIGlmICh0eXBlKGNvbnRyb2xsZXIub251bmxvYWQpID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNvbnRyb2xsZXIub251bmxvYWQoeyBwcmV2ZW50RGVmYXVsdDogTk9PUCB9KTtcbiAgICAgICAgRy51bmxvYWRlcnMucmVtb3ZlKGNvbnRyb2xsZXIpOyAvL3VubG9hZCBmdW5jdGlvbiBzaG91bGQgb25seSBleGVjdXRlIG9uY2VcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaWYgKHZOb2RlLmNoaWxkcmVuKSB7XG4gICAgaWYgKHR5cGUodk5vZGUuY2hpbGRyZW4pID09PSAnYXJyYXknKSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHZOb2RlLmNoaWxkcmVuLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgY2hpbGQgPSB2Tm9kZS5jaGlsZHJlbltpXTtcbiAgICAgICAgdW5sb2FkKGNoaWxkKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHZOb2RlLmNoaWxkcmVuLnRhZykge1xuICAgICAgdW5sb2FkKHZOb2RlLmNoaWxkcmVuKTtcbiAgICB9XG4gIH1cbn0iLCJcbmV4cG9ydCBkZWZhdWx0IHNldEF0dHJpYnV0ZXM7XG5cbmltcG9ydCB7IHR5cGUsIG1hdGNoUmVnIH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHsgRyB9IGZyb20gJy4uL2dsb2JhbHMnO1xudmFyIGRvbURlbGVnYXRvciA9IEcuZG9tRGVsZWdhdG9yO1xudmFyIGV2QXR0clJlZyA9IC9eZXYoW0EtWl1cXHcqKS87XG5mdW5jdGlvbiBzZXRBdHRyaWJ1dGVzKGRvbU5vZGUsIHRhZywgZGF0YUF0dHJzLCBjYWNoZWRBdHRycywgbmFtZXNwYWNlKSB7XG4gIE9iamVjdC5rZXlzKGRhdGFBdHRycykuZm9yRWFjaChmdW5jdGlvbiAoYXR0ck5hbWUpIHtcbiAgICB2YXIgZGF0YUF0dHIgPSBkYXRhQXR0cnNbYXR0ck5hbWVdLFxuICAgICAgICBjYWNoZWRBdHRyID0gY2FjaGVkQXR0cnNbYXR0ck5hbWVdLFxuICAgICAgICBldk1hdGNoO1xuXG4gICAgaWYgKCEoYXR0ck5hbWUgaW4gY2FjaGVkQXR0cnMpIHx8IGNhY2hlZEF0dHIgIT09IGRhdGFBdHRyKSB7XG4gICAgICBjYWNoZWRBdHRyc1thdHRyTmFtZV0gPSBkYXRhQXR0cjtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vYGNvbmZpZ2AgaXNuJ3QgYSByZWFsIGF0dHJpYnV0ZXMsIHNvIGlnbm9yZSBpdFxuICAgICAgICBpZiAoYXR0ck5hbWUgPT09ICdjb25maWcnIHx8IGF0dHJOYW1lID09ICdrZXknKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vaG9vayBldmVudCBoYW5kbGVycyB0byB0aGUgYXV0by1yZWRyYXdpbmcgc3lzdGVtXG4gICAgICAgIGVsc2UgaWYgKHR5cGUoZGF0YUF0dHIpID09PSAnZnVuY3Rpb24nICYmIGF0dHJOYW1lLmluZGV4T2YoJ29uJykgPT09IDApIHtcbiAgICAgICAgICBkb21Ob2RlW2F0dHJOYW1lXSA9IGRhdGFBdHRyO1xuICAgICAgICAgIC8vIGJpbmQgaGFuZGxlciB0byBkb21Ob2RlIGZvciBhIGRlbGVnYXRpb24gZXZlbnRcbiAgICAgICAgfSBlbHNlIGlmICgoZXZNYXRjaCA9IG1hdGNoUmVnKGF0dHJOYW1lLCBldkF0dHJSZWcpKSAmJiBldk1hdGNoWzFdLmxlbmd0aCkge1xuICAgICAgICAgIHZhciBldlR5cGUgPSBldk1hdGNoWzFdLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgZG9tRGVsZWdhdG9yLm9mZihkb21Ob2RlLCBldlR5cGUpO1xuICAgICAgICAgIGlmIChpc0hhbmRsZXIoZGF0YUF0dHIpKSB7XG4gICAgICAgICAgICBkb21EZWxlZ2F0b3Iub24oZG9tTm9kZSwgZXZUeXBlLCBkYXRhQXR0cik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vaGFuZGxlIGBzdHlsZTogey4uLn1gXG4gICAgICAgIGVsc2UgaWYgKGF0dHJOYW1lID09PSAnc3R5bGUnICYmIGRhdGFBdHRyICE9IG51bGwgJiYgdHlwZShkYXRhQXR0cikgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgT2JqZWN0LmtleXMoZGF0YUF0dHIpLmZvckVhY2goZnVuY3Rpb24gKHJ1bGUpIHtcbiAgICAgICAgICAgIGlmIChjYWNoZWRBdHRyID09IG51bGwgfHwgY2FjaGVkQXR0cltydWxlXSAhPT0gZGF0YUF0dHJbcnVsZV0pIHtcbiAgICAgICAgICAgICAgZG9tTm9kZS5zdHlsZVtydWxlXSA9IGRhdGFBdHRyW3J1bGVdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmICh0eXBlKGNhY2hlZEF0dHIpID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgT2JqZWN0LmtleXMoY2FjaGVkQXR0cikuZm9yRWFjaChmdW5jdGlvbiAocnVsZSkge1xuICAgICAgICAgICAgICBpZiAoIShydWxlIGluIGRhdGFBdHRyKSkge1xuICAgICAgICAgICAgICAgIGRvbU5vZGUuc3R5bGVbcnVsZV0gPSAnJztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vaGFuZGxlIFNWR1xuICAgICAgICBlbHNlIGlmIChuYW1lc3BhY2UgIT0gbnVsbCkge1xuICAgICAgICAgIGlmIChhdHRyTmFtZSA9PT0gJ2hyZWYnKSB7XG4gICAgICAgICAgICBkb21Ob2RlLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ2hyZWYnLCBkYXRhQXR0cik7XG4gICAgICAgICAgfSBlbHNlIGlmIChhdHRyTmFtZSA9PT0gJ2NsYXNzTmFtZScpIHtcbiAgICAgICAgICAgIGRvbU5vZGUuc2V0QXR0cmlidXRlKCdjbGFzcycsIGRhdGFBdHRyKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZG9tTm9kZS5zZXRBdHRyaWJ1dGUoYXR0ck5hbWUsIGRhdGFBdHRyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy9oYW5kbGUgY2FzZXMgdGhhdCBhcmUgcHJvcGVydGllcyAoYnV0IGlnbm9yZSBjYXNlcyB3aGVyZSB3ZSBzaG91bGQgdXNlIHNldEF0dHJpYnV0ZSBpbnN0ZWFkKVxuICAgICAgICAvLy0gbGlzdCBhbmQgZm9ybSBhcmUgdHlwaWNhbGx5IHVzZWQgYXMgc3RyaW5ncywgYnV0IGFyZSBET00gZWxlbWVudCByZWZlcmVuY2VzIGluIGpzXG4gICAgICAgIC8vLSB3aGVuIHVzaW5nIENTUyBzZWxlY3RvcnMgKGUuZy4gYG0oJ1tzdHlsZT0nJ10nKWApLCBzdHlsZSBpcyB1c2VkIGFzIGEgc3RyaW5nLCBidXQgaXQncyBhbiBvYmplY3QgaW4ganNcbiAgICAgICAgZWxzZSBpZiAoYXR0ck5hbWUgaW4gZG9tTm9kZSAmJiAhKGF0dHJOYW1lID09PSAnbGlzdCcgfHwgYXR0ck5hbWUgPT09ICdzdHlsZScgfHwgYXR0ck5hbWUgPT09ICdmb3JtJyB8fCBhdHRyTmFtZSA9PT0gJ3R5cGUnIHx8IGF0dHJOYW1lID09PSAnd2lkdGgnIHx8IGF0dHJOYW1lID09PSAnaGVpZ2h0JykpIHtcbiAgICAgICAgICAvLyMzNDggZG9uJ3Qgc2V0IHRoZSB2YWx1ZSBpZiBub3QgbmVlZGVkIG90aGVyd2lzZSBjdXJzb3IgcGxhY2VtZW50IGJyZWFrcyBpbiBDaHJvbWVcbiAgICAgICAgICBpZiAodGFnICE9PSAnaW5wdXQnIHx8IGRvbU5vZGVbYXR0ck5hbWVdICE9PSBkYXRhQXR0cikge1xuICAgICAgICAgICAgZG9tTm9kZVthdHRyTmFtZV0gPSBkYXRhQXR0cjtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZG9tTm9kZS5zZXRBdHRyaWJ1dGUoYXR0ck5hbWUsIGRhdGFBdHRyKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvL3N3YWxsb3cgSUUncyBpbnZhbGlkIGFyZ3VtZW50IGVycm9ycyB0byBtaW1pYyBIVE1MJ3MgZmFsbGJhY2stdG8tZG9pbmctbm90aGluZy1vbi1pbnZhbGlkLWF0dHJpYnV0ZXMgYmVoYXZpb3JcbiAgICAgICAgaWYgKGUubWVzc2FnZS5pbmRleE9mKCdJbnZhbGlkIGFyZ3VtZW50JykgPCAwKSB7XG4gICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICAvLyMzNDggZGF0YUF0dHIgbWF5IG5vdCBiZSBhIHN0cmluZywgc28gdXNlIGxvb3NlIGNvbXBhcmlzb24gKGRvdWJsZSBlcXVhbCkgaW5zdGVhZCBvZiBzdHJpY3QgKHRyaXBsZSBlcXVhbClcbiAgICBlbHNlIGlmIChhdHRyTmFtZSA9PT0gJ3ZhbHVlJyAmJiB0YWcgPT09ICdpbnB1dCcgJiYgZG9tTm9kZS52YWx1ZSAhPSBkYXRhQXR0cikge1xuICAgICAgZG9tTm9kZS52YWx1ZSA9IGRhdGFBdHRyO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBjYWNoZWRBdHRycztcbn1cblxuZnVuY3Rpb24gaXNIYW5kbGVyKGhhbmRsZXIpIHtcbiAgcmV0dXJuIHR5cGUoaGFuZGxlcikgPT09ICdmdW5jdGlvbicgfHwgaGFuZGxlciAmJiB0eXBlKGhhbmRsZXIuaGFuZGxlRXZlbnQpID09PSAnZnVuY3Rpb24nO1xufSIsIlxuZXhwb3J0IGRlZmF1bHQgYnVpbGQ7XG5pbXBvcnQgeyB0eXBlLCBOT09QIH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IGNsZWFyIGZyb20gJy4vY2xlYXInO1xuaW1wb3J0IHsgZG9jdW1lbnQgYXMgJGRvY3VtZW50LCBHIH0gZnJvbSAnLi4vZ2xvYmFscyc7XG5pbXBvcnQgc2V0QXR0cmlidXRlcyBmcm9tICcuL3NldEF0dHJpYnV0ZXMnO1xuLy9gYnVpbGRgIGlzIGEgcmVjdXJzaXZlIGZ1bmN0aW9uIHRoYXQgbWFuYWdlcyBjcmVhdGlvbi9kaWZmaW5nL3JlbW92YWwgb2YgRE9NIGVsZW1lbnRzIGJhc2VkIG9uIGNvbXBhcmlzb24gYmV0d2VlbiBgZGF0YWAgYW5kIGBjYWNoZWRgXG4vL3RoZSBkaWZmIGFsZ29yaXRobSBjYW4gYmUgc3VtbWFyaXplZCBhcyB0aGlzOlxuLy8xIC0gY29tcGFyZSBgZGF0YWAgYW5kIGBjYWNoZWRgXG4vLzIgLSBpZiB0aGV5IGFyZSBkaWZmZXJlbnQsIGNvcHkgYGRhdGFgIHRvIGBjYWNoZWRgIGFuZCB1cGRhdGUgdGhlIERPTSBiYXNlZCBvbiB3aGF0IHRoZSBkaWZmZXJlbmNlIGlzXG4vLzMgLSByZWN1cnNpdmVseSBhcHBseSB0aGlzIGFsZ29yaXRobSBmb3IgZXZlcnkgYXJyYXkgYW5kIGZvciB0aGUgY2hpbGRyZW4gb2YgZXZlcnkgdmlydHVhbCBlbGVtZW50XG4vL3RoZSBgY2FjaGVkYCBkYXRhIHN0cnVjdHVyZSBpcyBlc3NlbnRpYWxseSB0aGUgc2FtZSBhcyB0aGUgcHJldmlvdXMgcmVkcmF3J3MgYGRhdGFgIGRhdGEgc3RydWN0dXJlLCB3aXRoIGEgZmV3IGFkZGl0aW9uczpcbi8vLSBgY2FjaGVkYCBhbHdheXMgaGFzIGEgcHJvcGVydHkgY2FsbGVkIGBub2Rlc2AsIHdoaWNoIGlzIGEgbGlzdCBvZiBET00gZWxlbWVudHMgdGhhdCBjb3JyZXNwb25kIHRvIHRoZSBkYXRhIHJlcHJlc2VudGVkIGJ5IHRoZSByZXNwZWN0aXZlIHZpcnR1YWwgZWxlbWVudFxuLy8tIGluIG9yZGVyIHRvIHN1cHBvcnQgYXR0YWNoaW5nIGBub2Rlc2AgYXMgYSBwcm9wZXJ0eSBvZiBgY2FjaGVkYCwgYGNhY2hlZGAgaXMgKmFsd2F5cyogYSBub24tcHJpbWl0aXZlIG9iamVjdCwgaS5lLiBpZiB0aGUgZGF0YSB3YXMgYSBzdHJpbmcsIHRoZW4gY2FjaGVkIGlzIGEgU3RyaW5nIGluc3RhbmNlLiBJZiBkYXRhIHdhcyBgbnVsbGAgb3IgYHVuZGVmaW5lZGAsIGNhY2hlZCBpcyBgbmV3IFN0cmluZygnJylgXG4vLy0gYGNhY2hlZCBhbHNvIGhhcyBhIGBjb25maWdDb250ZXh0YCBwcm9wZXJ0eSwgd2hpY2ggaXMgdGhlIHN0YXRlIHN0b3JhZ2Ugb2JqZWN0IGV4cG9zZWQgYnkgY29uZmlnKGVsZW1lbnQsIGlzSW5pdGlhbGl6ZWQsIGNvbnRleHQpXG4vLy0gd2hlbiBgY2FjaGVkYCBpcyBhbiBPYmplY3QsIGl0IHJlcHJlc2VudHMgYSB2aXJ0dWFsIGVsZW1lbnQ7IHdoZW4gaXQncyBhbiBBcnJheSwgaXQgcmVwcmVzZW50cyBhIGxpc3Qgb2YgZWxlbWVudHM7IHdoZW4gaXQncyBhIFN0cmluZywgTnVtYmVyIG9yIEJvb2xlYW4sIGl0IHJlcHJlc2VudHMgYSB0ZXh0IG5vZGVcbi8vYHBhcmVudEVsZW1lbnRgIGlzIGEgRE9NIGVsZW1lbnQgdXNlZCBmb3IgVzNDIERPTSBBUEkgY2FsbHNcbi8vYHBhcmVudFRhZ2AgaXMgb25seSB1c2VkIGZvciBoYW5kbGluZyBhIGNvcm5lciBjYXNlIGZvciB0ZXh0YXJlYSB2YWx1ZXNcbi8vYHBhcmVudENhY2hlYCBpcyB1c2VkIHRvIHJlbW92ZSBub2RlcyBpbiBzb21lIG11bHRpLW5vZGUgY2FzZXNcbi8vYHBhcmVudEluZGV4YCBhbmQgYGluZGV4YCBhcmUgdXNlZCB0byBmaWd1cmUgb3V0IHRoZSBvZmZzZXQgb2Ygbm9kZXMuIFRoZXkncmUgYXJ0aWZhY3RzIGZyb20gYmVmb3JlIGFycmF5cyBzdGFydGVkIGJlaW5nIGZsYXR0ZW5lZCBhbmQgYXJlIGxpa2VseSByZWZhY3RvcmFibGVcbi8vYGRhdGFgIGFuZCBgY2FjaGVkYCBhcmUsIHJlc3BlY3RpdmVseSwgdGhlIG5ldyBhbmQgb2xkIG5vZGVzIGJlaW5nIGRpZmZlZFxuLy9gc2hvdWxkUmVhdHRhY2hgIGlzIGEgZmxhZyBpbmRpY2F0aW5nIHdoZXRoZXIgYSBwYXJlbnQgbm9kZSB3YXMgcmVjcmVhdGVkIChpZiBzbywgYW5kIGlmIHRoaXMgbm9kZSBpcyByZXVzZWQsIHRoZW4gdGhpcyBub2RlIG11c3QgcmVhdHRhY2ggaXRzZWxmIHRvIHRoZSBuZXcgcGFyZW50KVxuLy9gZWRpdGFibGVgIGlzIGEgZmxhZyB0aGF0IGluZGljYXRlcyB3aGV0aGVyIGFuIGFuY2VzdG9yIGlzIGNvbnRlbnRlZGl0YWJsZVxuLy9gbmFtZXNwYWNlYCBpbmRpY2F0ZXMgdGhlIGNsb3Nlc3QgSFRNTCBuYW1lc3BhY2UgYXMgaXQgY2FzY2FkZXMgZG93biBmcm9tIGFuIGFuY2VzdG9yXG4vL2Bjb25maWdzYCBpcyBhIGxpc3Qgb2YgY29uZmlnIGZ1bmN0aW9ucyB0byBydW4gYWZ0ZXIgdGhlIHRvcG1vc3QgYGJ1aWxkYCBjYWxsIGZpbmlzaGVzIHJ1bm5pbmdcbi8vdGhlcmUncyBsb2dpYyB0aGF0IHJlbGllcyBvbiB0aGUgYXNzdW1wdGlvbiB0aGF0IG51bGwgYW5kIHVuZGVmaW5lZCBkYXRhIGFyZSBlcXVpdmFsZW50IHRvIGVtcHR5IHN0cmluZ3Ncbi8vLSB0aGlzIHByZXZlbnRzIGxpZmVjeWNsZSBzdXJwcmlzZXMgZnJvbSBwcm9jZWR1cmFsIGhlbHBlcnMgdGhhdCBtaXggaW1wbGljaXQgYW5kIGV4cGxpY2l0IHJldHVybiBzdGF0ZW1lbnRzIChlLmcuIGZ1bmN0aW9uIGZvbygpIHtpZiAoY29uZCkgcmV0dXJuIG0oJ2RpdicpfVxuLy8tIGl0IHNpbXBsaWZpZXMgZGlmZmluZyBjb2RlXG4vL2RhdGEudG9TdHJpbmcoKSBtaWdodCB0aHJvdyBvciByZXR1cm4gbnVsbCBpZiBkYXRhIGlzIHRoZSByZXR1cm4gdmFsdWUgb2YgQ29uc29sZS5sb2cgaW4gRmlyZWZveCAoYmVoYXZpb3IgZGVwZW5kcyBvbiB2ZXJzaW9uKVxudmFyIFZPSURfRUxFTUVOVFMgPSAvXihBUkVBfEJBU0V8QlJ8Q09MfENPTU1BTkR8RU1CRUR8SFJ8SU1HfElOUFVUfEtFWUdFTnxMSU5LfE1FVEF8UEFSQU18U09VUkNFfFRSQUNLfFdCUikkLztcbmZ1bmN0aW9uIGJ1aWxkKHBhcmVudEVsZW1lbnQsIHBhcmVudFRhZywgcGFyZW50Q2FjaGUsIHBhcmVudEluZGV4LCBkYXRhLCBjYWNoZWQsIHNob3VsZFJlYXR0YWNoLCBpbmRleCwgZWRpdGFibGUsIG5hbWVzcGFjZSwgY29uZmlncykge1xuICAvL2RhdGEudG9TdHJpbmcoKSBtaWdodCB0aHJvdyBvciByZXR1cm4gbnVsbCBpZiBkYXRhIGlzIHRoZSByZXR1cm4gdmFsdWUgb2YgQ29uc29sZS5sb2cgaW4gZmlyZWZveCAoYmVoYXZpb3IgZGVwZW5kcyBvbiB2ZXJzaW9uKVxuICB0cnkge1xuICAgIGlmIChkYXRhID09IG51bGwgfHwgZGF0YS50b1N0cmluZygpID09IG51bGwpIHtcbiAgICAgIGRhdGEgPSAnJztcbiAgICB9XG4gIH0gY2F0Y2ggKF8pIHtcbiAgICBkYXRhID0gJyc7XG4gIH1cbiAgaWYgKGRhdGEuc3VidHJlZSA9PT0gJ3JldGFpbicpIHtcbiAgICByZXR1cm4gY2FjaGVkO1xuICB9XG4gIHZhciBjYWNoZWRUeXBlID0gdHlwZShjYWNoZWQpLFxuICAgICAgZGF0YVR5cGUgPSB0eXBlKGRhdGEpLFxuICAgICAgaW50YWN0O1xuICBpZiAoY2FjaGVkID09IG51bGwgfHwgY2FjaGVkVHlwZSAhPT0gZGF0YVR5cGUpIHtcbiAgICAvLyB2YWxpZGF0ZSBjYWNoZWRcbiAgICBjYWNoZWQgPSBjbGVhckNhY2hlZChkYXRhLCBjYWNoZWQsIGluZGV4LCBwYXJlbnRJbmRleCwgcGFyZW50Q2FjaGUsIGRhdGFUeXBlKTtcbiAgfVxuICBpZiAoZGF0YVR5cGUgPT09ICdhcnJheScpIHtcbiAgICAvLyBjaGlsZHJlbiBkaWZmXG4gICAgZGF0YSA9IF9yZWN1cnNpdmVGbGF0dGVuKGRhdGEpO1xuICAgIGludGFjdCA9IGNhY2hlZC5sZW5ndGggPT09IGRhdGEubGVuZ3RoO1xuICAgIGNhY2hlZCA9IGRpZmZDaGlsZHJlbldpdGhLZXkoZGF0YSwgY2FjaGVkLCBwYXJlbnRFbGVtZW50KTtcbiAgICBjYWNoZWQgPSBkaWZmQXJyYXlJdGVtKGRhdGEsIGNhY2hlZCwgcGFyZW50RWxlbWVudCwgcGFyZW50VGFnLCBpbmRleCwgc2hvdWxkUmVhdHRhY2gsIGludGFjdCwgZWRpdGFibGUsIG5hbWVzcGFjZSwgY29uZmlncyk7XG4gIH0gZWxzZSBpZiAoZGF0YSAhPSBudWxsICYmIGRhdGFUeXBlID09PSAnb2JqZWN0Jykge1xuICAgIC8vIGF0dHJpYnV0ZXMgZGlmZlxuICAgIGNhY2hlZCA9IGRpZmZWTm9kZShkYXRhLCBjYWNoZWQsIHBhcmVudEVsZW1lbnQsIGluZGV4LCBzaG91bGRSZWF0dGFjaCwgZWRpdGFibGUsIG5hbWVzcGFjZSwgY29uZmlncyk7XG4gIH0gZWxzZSBpZiAodHlwZShkYXRhKSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIC8vaGFuZGxlIHRleHQgbm9kZXNcbiAgICBjYWNoZWQgPSBkaWZmVGV4dE5vZGUoZGF0YSwgY2FjaGVkLCBwYXJlbnRFbGVtZW50LCBwYXJlbnRUYWcsIGluZGV4LCBzaG91bGRSZWF0dGFjaCwgZWRpdGFibGUpO1xuICB9XG4gIHJldHVybiBjYWNoZWQ7XG59XG5cbi8vZGlmZiBmdW5jdGlvbnNcbmZ1bmN0aW9uIGNsZWFyQ2FjaGVkKGRhdGEsIGNhY2hlZCwgaW5kZXgsIHBhcmVudEluZGV4LCBwYXJlbnRDYWNoZSwgZGF0YVR5cGUpIHtcbiAgdmFyIG9mZnNldCwgZW5kO1xuICBpZiAoY2FjaGVkICE9IG51bGwpIHtcbiAgICBpZiAocGFyZW50Q2FjaGUgJiYgcGFyZW50Q2FjaGUubm9kZXMpIHtcbiAgICAgIG9mZnNldCA9IGluZGV4IC0gcGFyZW50SW5kZXg7XG4gICAgICBlbmQgPSBvZmZzZXQgKyAoZGF0YVR5cGUgPT09ICdhcnJheScgPyBkYXRhIDogY2FjaGVkLm5vZGVzKS5sZW5ndGg7XG4gICAgICBjbGVhcihwYXJlbnRDYWNoZS5ub2Rlcy5zbGljZShvZmZzZXQsIGVuZCksIHBhcmVudENhY2hlLnNsaWNlKG9mZnNldCwgZW5kKSk7XG4gICAgfSBlbHNlIGlmIChjYWNoZWQubm9kZXMpIHtcbiAgICAgIGNsZWFyKGNhY2hlZC5ub2RlcywgY2FjaGVkKTtcbiAgICB9XG4gIH1cbiAgY2FjaGVkID0gbmV3IGRhdGEuY29uc3RydWN0b3IoKTtcbiAgaWYgKGNhY2hlZC50YWcpIHtcbiAgICBjYWNoZWQgPSB7fTtcbiAgfVxuICBjYWNoZWQubm9kZXMgPSBbXTtcbiAgcmV0dXJuIGNhY2hlZDtcbn1cblxuZnVuY3Rpb24gZGlmZkNoaWxkcmVuV2l0aEtleShkYXRhLCBjYWNoZWQsIHBhcmVudEVsZW1lbnQpIHtcbiAgLy9rZXlzIGFsZ29yaXRobTogc29ydCBlbGVtZW50cyB3aXRob3V0IHJlY3JlYXRpbmcgdGhlbSBpZiBrZXlzIGFyZSBwcmVzZW50XG4gIC8vMSkgY3JlYXRlIGEgbWFwIG9mIGFsbCBleGlzdGluZyBrZXlzLCBhbmQgbWFyayBhbGwgZm9yIGRlbGV0aW9uXG4gIC8vMikgYWRkIG5ldyBrZXlzIHRvIG1hcCBhbmQgbWFyayB0aGVtIGZvciBhZGRpdGlvblxuICAvLzMpIGlmIGtleSBleGlzdHMgaW4gbmV3IGxpc3QsIGNoYW5nZSBhY3Rpb24gZnJvbSBkZWxldGlvbiB0byBhIG1vdmVcbiAgLy80KSBmb3IgZWFjaCBrZXksIGhhbmRsZSBpdHMgY29ycmVzcG9uZGluZyBhY3Rpb24gYXMgbWFya2VkIGluIHByZXZpb3VzIHN0ZXBzXG4gIHZhciBERUxFVElPTiA9IDEsXG4gICAgICBJTlNFUlRJT04gPSAyLFxuICAgICAgTU9WRSA9IDM7XG4gIHZhciBleGlzdGluZyA9IHt9LFxuICAgICAgc2hvdWxkTWFpbnRhaW5JZGVudGl0aWVzID0gZmFsc2U7XG4gIC8vIDEpXG4gIGNhY2hlZC5mb3JFYWNoKGZ1bmN0aW9uIChjYWNoZWROb2RlLCBpZHgpIHtcbiAgICB2YXIga2V5ID0gX2tleShjYWNoZWROb2RlKTtcbiAgICAvL25vcm1hcmxpemUga2V5XG4gICAgX25vcm1hbGl6ZUtleShjYWNoZWROb2RlLCBrZXkpO1xuXG4gICAgaWYgKGtleSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBzaG91bGRNYWludGFpbklkZW50aXRpZXMgPSB0cnVlO1xuICAgICAgZXhpc3Rpbmdba2V5XSA9IHtcbiAgICAgICAgYWN0aW9uOiBERUxFVElPTixcbiAgICAgICAgaW5kZXg6IGlkeFxuICAgICAgfTtcbiAgICB9XG4gIH0pO1xuICAvLyBhZGQga2V5cyB0byBhbGwgaXRlbXMgaWYgYXQgbGVhc3Qgb25lIG9mIGl0ZW1zIGhhcyBhIGtleSBhdHRyaWJ1dGVcbiAgdmFyIGd1aWQgPSAwO1xuICBpZiAoZGF0YS5zb21lKGZ1bmN0aW9uIChkYXRhTm9kZSkge1xuICAgIHZhciBrZXkgPSBfa2V5KGRhdGFOb2RlKTtcbiAgICAvL25vcm1hcmxpemUga2V5XG4gICAgX25vcm1hbGl6ZUtleShkYXRhTm9kZSwga2V5KTtcbiAgICByZXR1cm4ga2V5ICE9PSB1bmRlZmluZWQ7XG4gIH0pKSB7XG4gICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChkYXRhTm9kZSkge1xuICAgICAgaWYgKGRhdGFOb2RlICYmIGRhdGFOb2RlLmF0dHJzICYmIGRhdGFOb2RlLmF0dHJzLmtleSA9PSBudWxsKSB7XG4gICAgICAgIGRhdGFOb2RlLmF0dHJzLmtleSA9ICdfX21pdGhyaWxfXycgKyBndWlkKys7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgaWYgKHNob3VsZE1haW50YWluSWRlbnRpdGllcyAmJiBfaXNLZXlzRGlmZmVyKCkpIHtcbiAgICAvLyAyKSwgMylcbiAgICBkYXRhLmZvckVhY2goX2RhdGFOb2RlVG9FeGlzdGluZyk7XG4gICAgLy8gNClcbiAgICB2YXIgY2hhbmdlcyA9IHVuZGVmaW5lZCxcbiAgICAgICAgbmV3Q2FjaGVkID0gbmV3IEFycmF5KGNhY2hlZC5sZW5ndGgpO1xuICAgIGNoYW5nZXMgPSBPYmplY3Qua2V5cyhleGlzdGluZykubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJldHVybiBleGlzdGluZ1trZXldO1xuICAgIH0pLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgIHJldHVybiBhLmFjdGlvbiAtIGIuYWN0aW9uIHx8IGEuaW5kZXggLSBiLmluZGV4O1xuICAgIH0pO1xuICAgIG5ld0NhY2hlZC5ub2RlcyA9IGNhY2hlZC5ub2Rlcy5zbGljZSgpO1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gY2hhbmdlcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIF9hcHBseUNoYW5nZXMoY2hhbmdlc1tpXSwgbmV3Q2FjaGVkKTtcbiAgICB9XG4gICAgY2FjaGVkID0gbmV3Q2FjaGVkO1xuICB9XG4gIHJldHVybiBjYWNoZWQ7XG4gIC8vaGVscGVyc1xuICBmdW5jdGlvbiBfaXNLZXkoa2V5KSB7XG4gICAgcmV0dXJuIHR5cGUoa2V5KSA9PT0gJ3N0cmluZycgfHwgdHlwZShrZXkpID09PSAnbnVtYmVyJyAmJiB0eXBlKGtleSkgIT09ICdOYU4nO1xuICB9XG5cbiAgZnVuY3Rpb24gX2tleShub2RlSXRlbSkge1xuICAgIHJldHVybiBub2RlSXRlbSAmJiBub2RlSXRlbS5hdHRycyAmJiBfaXNLZXkobm9kZUl0ZW0uYXR0cnMua2V5KSA/IG5vZGVJdGVtLmF0dHJzLmtleSA6IHVuZGVmaW5lZDtcbiAgfVxuICBmdW5jdGlvbiBfbm9ybWFsaXplS2V5KG5vZGUsIGtleSkge1xuICAgIGlmICghbm9kZSB8fCAhbm9kZS5hdHRycykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoa2V5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGRlbGV0ZSBub2RlLmF0dHJzLmtleTtcbiAgICB9IGVsc2Uge1xuICAgICAgbm9kZS5hdHRycy5rZXkgPSBrZXk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gX2lzS2V5c0RpZmZlcigpIHtcbiAgICBpZiAoZGF0YS5sZW5ndGggIT09IGNhY2hlZC5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YS5zb21lKGZ1bmN0aW9uIChkYXRhTm9kZSwgaWR4KSB7XG4gICAgICB2YXIgY2FjaGVkTm9kZSA9IGNhY2hlZFtpZHhdO1xuICAgICAgcmV0dXJuIGNhY2hlZE5vZGUuYXR0cnMgJiYgZGF0YU5vZGUuYXR0cnMgJiYgY2FjaGVkTm9kZS5hdHRycy5rZXkgIT09IGRhdGFOb2RlLmF0dHJzLmtleTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIF9kYXRhTm9kZVRvRXhpc3RpbmcoZGF0YU5vZGUsIG5vZGVJZHgpIHtcbiAgICB2YXIga2V5ID0gX2tleShkYXRhTm9kZSk7XG4gICAgaWYgKGtleSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoIWV4aXN0aW5nW2tleV0pIHtcbiAgICAgICAgZXhpc3Rpbmdba2V5XSA9IHtcbiAgICAgICAgICBhY3Rpb246IElOU0VSVElPTixcbiAgICAgICAgICBpbmRleDogbm9kZUlkeFxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGZyb21JZHggPSBleGlzdGluZ1trZXldLmluZGV4O1xuICAgICAgICBleGlzdGluZ1trZXldID0ge1xuICAgICAgICAgIGFjdGlvbjogTU9WRSxcbiAgICAgICAgICBpbmRleDogbm9kZUlkeCxcbiAgICAgICAgICBmcm9tOiBmcm9tSWR4LFxuICAgICAgICAgIGVsZW1lbnQ6IGNhY2hlZC5ub2Rlc1tmcm9tSWR4XSB8fCAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBfYXBwbHlDaGFuZ2VzKGNoYW5nZSwgbmV3Q2FjaGVkKSB7XG4gICAgdmFyIGNoYW5nZUlkeCA9IGNoYW5nZS5pbmRleCxcbiAgICAgICAgYWN0aW9uID0gY2hhbmdlLmFjdGlvbjtcbiAgICBpZiAoYWN0aW9uID09PSBERUxFVElPTikge1xuICAgICAgY2xlYXIoY2FjaGVkW2NoYW5nZUlkeF0ubm9kZXMsIGNhY2hlZFtjaGFuZ2VJZHhdKTtcbiAgICAgIG5ld0NhY2hlZC5zcGxpY2UoY2hhbmdlSWR4LCAxKTtcbiAgICB9XG4gICAgaWYgKGFjdGlvbiA9PT0gSU5TRVJUSU9OKSB7XG4gICAgICB2YXIgZHVtbXkgPSAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBkdW1teS5zZXRBdHRyaWJ1dGUoJ2RhdGEtbXJlZicsIGNoYW5nZUlkeCk7XG4gICAgICB2YXIga2V5ID0gZGF0YVtjaGFuZ2VJZHhdLmF0dHJzLmtleTtcbiAgICAgIHBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKGR1bW15LCBwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbY2hhbmdlSWR4XSB8fCBudWxsKTtcbiAgICAgIG5ld0NhY2hlZC5zcGxpY2UoY2hhbmdlSWR4LCAwLCB7XG4gICAgICAgIGF0dHJzOiB7IGtleToga2V5IH0sXG4gICAgICAgIG5vZGVzOiBbZHVtbXldXG4gICAgICB9KTtcbiAgICAgIG5ld0NhY2hlZC5ub2Rlc1tjaGFuZ2VJZHhdID0gZHVtbXk7XG4gICAgfVxuXG4gICAgaWYgKGFjdGlvbiA9PT0gTU9WRSkge1xuICAgICAgY2hhbmdlLmVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRhLW1yZWYnLCBjaGFuZ2VJZHgpO1xuICAgICAgaWYgKHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tjaGFuZ2VJZHhdICE9PSBjaGFuZ2UuZWxlbWVudCAmJiBjaGFuZ2UuZWxlbWVudCAhPT0gbnVsbCkge1xuICAgICAgICBwYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZShjaGFuZ2UuZWxlbWVudCwgcGFyZW50RWxlbWVudC5jaGlsZE5vZGVzW2NoYW5nZUlkeF0gfHwgbnVsbCk7XG4gICAgICB9XG4gICAgICBuZXdDYWNoZWRbY2hhbmdlSWR4XSA9IGNhY2hlZFtjaGFuZ2UuZnJvbV07XG4gICAgICBuZXdDYWNoZWQubm9kZXNbY2hhbmdlSWR4XSA9IGNoYW5nZS5lbGVtZW50O1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBkaWZmQXJyYXlJdGVtKGRhdGEsIGNhY2hlZCwgcGFyZW50RWxlbWVudCwgcGFyZW50VGFnLCBpbmRleCwgc2hvdWxkUmVhdHRhY2gsIGludGFjdCwgZWRpdGFibGUsIG5hbWVzcGFjZSwgY29uZmlncykge1xuICB2YXIgc3ViQXJyYXlDb3VudCA9IDAsXG4gICAgICBjYWNoZUNvdW50ID0gMCxcbiAgICAgIG5vZGVzID0gW107XG4gIGRhdGEuZm9yRWFjaChfZGlmZkJ1aWxkSXRlbSk7XG4gIGlmICghaW50YWN0KSB7XG4gICAgLy9kaWZmIHRoZSBhcnJheSBpdHNlbGZcblxuICAgIC8vdXBkYXRlIHRoZSBsaXN0IG9mIERPTSBub2RlcyBieSBjb2xsZWN0aW5nIHRoZSBub2RlcyBmcm9tIGVhY2ggaXRlbVxuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBkYXRhLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBpZiAoY2FjaGVkW2ldICE9IG51bGwpIHtcbiAgICAgICAgbm9kZXMucHVzaC5hcHBseShub2RlcywgY2FjaGVkW2ldLm5vZGVzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy9yZW1vdmUgaXRlbXMgZnJvbSB0aGUgZW5kIG9mIHRoZSBhcnJheSBpZiB0aGUgbmV3IGFycmF5IGlzIHNob3J0ZXIgdGhhbiB0aGUgb2xkIG9uZVxuICAgIC8vaWYgZXJyb3JzIGV2ZXIgaGFwcGVuIGhlcmUsIHRoZSBpc3N1ZSBpcyBtb3N0IGxpa2VseSBhIGJ1ZyBpbiB0aGUgY29uc3RydWN0aW9uIG9mIHRoZSBgY2FjaGVkYCBkYXRhIHN0cnVjdHVyZSBzb21ld2hlcmUgZWFybGllciBpbiB0aGUgcHJvZ3JhbVxuICAgIC8qZXNsaW50IG5vLWNvbmQtYXNzaWduOjAqL1xuICAgIGZvciAodmFyIGkgPSAwLCBub2RlID0gdW5kZWZpbmVkOyBub2RlID0gY2FjaGVkLm5vZGVzW2ldOyBpKyspIHtcbiAgICAgIGlmIChub2RlLnBhcmVudE5vZGUgIT0gbnVsbCAmJiBub2Rlcy5pbmRleE9mKG5vZGUpIDwgMCkge1xuICAgICAgICBjbGVhcihbbm9kZV0sIFtjYWNoZWRbaV1dKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGRhdGEubGVuZ3RoIDwgY2FjaGVkLmxlbmd0aCkge1xuICAgICAgY2FjaGVkLmxlbmd0aCA9IGRhdGEubGVuZ3RoO1xuICAgIH1cbiAgICBjYWNoZWQubm9kZXMgPSBub2RlcztcbiAgfVxuICByZXR1cm4gY2FjaGVkO1xuICAvL2hlbHBlcnNcbiAgZnVuY3Rpb24gX2RpZmZCdWlsZEl0ZW0oZGF0YU5vZGUpIHtcbiAgICB2YXIgaXRlbSA9IGJ1aWxkKHBhcmVudEVsZW1lbnQsIHBhcmVudFRhZywgY2FjaGVkLCBpbmRleCwgZGF0YU5vZGUsIGNhY2hlZFtjYWNoZUNvdW50XSwgc2hvdWxkUmVhdHRhY2gsIGluZGV4ICsgc3ViQXJyYXlDb3VudCB8fCBzdWJBcnJheUNvdW50LCBlZGl0YWJsZSwgbmFtZXNwYWNlLCBjb25maWdzKTtcbiAgICBpZiAoaXRlbSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghaXRlbS5ub2Rlcy5pbnRhY3QpIHtcbiAgICAgIGludGFjdCA9IGZhbHNlO1xuICAgIH1cbiAgICBpZiAoaXRlbS4kdHJ1c3RlZCkge1xuICAgICAgLy9maXggb2Zmc2V0IG9mIG5leHQgZWxlbWVudCBpZiBpdGVtIHdhcyBhIHRydXN0ZWQgc3RyaW5nIHcvIG1vcmUgdGhhbiBvbmUgaHRtbCBlbGVtZW50XG4gICAgICAvL3RoZSBmaXJzdCBjbGF1c2UgaW4gdGhlIHJlZ2V4cCBtYXRjaGVzIGVsZW1lbnRzXG4gICAgICAvL3RoZSBzZWNvbmQgY2xhdXNlIChhZnRlciB0aGUgcGlwZSkgbWF0Y2hlcyB0ZXh0IG5vZGVzXG4gICAgICBzdWJBcnJheUNvdW50ICs9IChpdGVtLm1hdGNoKC88W15cXC9dfFxcPlxccypbXjxdL2cpIHx8IFswXSkubGVuZ3RoO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdWJBcnJheUNvdW50ICs9IHR5cGUoaXRlbSkgPT09ICdhcnJheScgPyBpdGVtLmxlbmd0aCA6IDE7XG4gICAgfVxuICAgIGNhY2hlZFtjYWNoZUNvdW50KytdID0gaXRlbTtcbiAgfVxufVxuXG5mdW5jdGlvbiBkaWZmVk5vZGUoZGF0YSwgY2FjaGVkLCBwYXJlbnRFbGVtZW50LCBpbmRleCwgc2hvdWxkUmVhdHRhY2gsIGVkaXRhYmxlLCBuYW1lc3BhY2UsIGNvbmZpZ3MpIHtcbiAgdmFyIHZpZXdzID0gW10sXG4gICAgICBjb250cm9sbGVycyA9IFtdLFxuICAgICAgY29tcG9uZW50TmFtZSxcbiAgICAgIGNvbXBvbmVudENhY2hlO1xuICAvL3JlY29yZCB0aGUgZmluYWwgY29tcG9uZW50IG5hbWVcbiAgLy9oYW5kbGUgdGhlIHNpdHVhdGlvbiB0aGF0IHZOb2RlIGlzIGEgY29tcG9uZW50KHt2aWV3LCBjb250cm9sbGVyfSk7XG5cbiAgd2hpbGUgKGRhdGEudmlldykge1xuICAgIHZhciBjdXJWaWV3ID0gZGF0YS52aWV3O1xuICAgIHZhciB2aWV3ID0gZGF0YS52aWV3LiRvcmlnaW5hbCB8fCBjdXJWaWV3O1xuICAgIHZhciBjb250cm9sbGVySW5kZXggPSBjYWNoZWQudmlld3MgPyBjYWNoZWQudmlld3MuaW5kZXhPZih2aWV3KSA6IC0xO1xuICAgIHZhciBjb250cm9sbGVyID0gY29udHJvbGxlckluZGV4ID4gLTEgPyBjYWNoZWQuY29udHJvbGxlcnNbY29udHJvbGxlckluZGV4XSA6IG5ldyAoZGF0YS5jb250cm9sbGVyIHx8IE5PT1ApKCk7XG4gICAgdmFyIGNvbXBvbmVudCA9IGNvbnRyb2xsZXIuaW5zdGFuY2U7XG4gICAgaWYgKHR5cGVvZiBjb21wb25lbnQgPT09ICdvYmplY3QnKSB7XG4gICAgICAvLyBoYW5kbGUgY29tcG9uZW50XG4gICAgICBjb21wb25lbnROYW1lID0gY29tcG9uZW50Lm5hbWU7XG4gICAgICBpZiAodHlwZW9mIGNvbXBvbmVudC5jYWNoZWQgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGNvbXBvbmVudENhY2hlID0gY29tcG9uZW50LmNhY2hlZDtcbiAgICAgIH1cbiAgICAgIGNvbXBvbmVudC52aWV3Rm4gPSBbY3VyVmlldywgY29udHJvbGxlcl07XG4gICAgfVxuXG4gICAgdmFyIGtleSA9IGRhdGEgJiYgZGF0YS5hdHRycyAmJiBkYXRhLmF0dHJzLmtleTtcbiAgICBkYXRhID0gZGF0YS52aWV3KGNvbnRyb2xsZXIpO1xuICAgIGlmIChkYXRhLnN1YnRyZWUgPT09ICdyZXRhaW4nKSB7XG4gICAgICByZXR1cm4gY29tcG9uZW50Q2FjaGUgPyBjb21wb25lbnRDYWNoZSA6IGNhY2hlZDtcbiAgICB9XG4gICAgaWYgKGtleSAhPSBudWxsKSB7XG4gICAgICBpZiAoIWRhdGEuYXR0cnMpIHtcbiAgICAgICAgZGF0YS5hdHRycyA9IHt9O1xuICAgICAgfVxuICAgICAgZGF0YS5hdHRycy5rZXkgPSBrZXk7XG4gICAgfVxuICAgIGlmIChjb250cm9sbGVyLm9udW5sb2FkKSB7XG4gICAgICBHLnVubG9hZGVycy5zZXQoY29udHJvbGxlciwgY29udHJvbGxlci5vbnVubG9hZCk7XG4gICAgfVxuICAgIHZpZXdzLnB1c2godmlldyk7XG4gICAgY29udHJvbGxlcnMucHVzaChjb250cm9sbGVyKTtcbiAgfVxuXG4gIC8vdGhlIHJlc3VsdCBvZiB2aWV3IGZ1bmN0aW9uIG11c3QgYmUgYSBzaWdsZSByb290IHZOb2RlLFxuICAvL25vdCBhIGFycmF5IG9yIHN0cmluZ1xuICBpZiAoIWRhdGEudGFnICYmIGNvbnRyb2xsZXJzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBFcnJvcignQ29tcG9uZW50IHRlbXBsYXRlIG11c3QgcmV0dXJuIGEgdmlydHVhbCBlbGVtZW50LCBub3QgYW4gYXJyYXksIHN0cmluZywgZXRjLicpO1xuICB9XG4gIGlmICghZGF0YS5hdHRycykge1xuICAgIGRhdGEuYXR0cnMgPSB7fTtcbiAgfVxuICBpZiAoY29tcG9uZW50Q2FjaGUgIT0gbnVsbCkge1xuICAgIGNhY2hlZCA9IGNvbXBvbmVudENhY2hlO1xuICB9XG4gIGlmICghY2FjaGVkLmF0dHJzKSB7XG4gICAgY2FjaGVkLmF0dHJzID0ge307XG4gIH1cbiAgLy9pZiBhbiBlbGVtZW50IGlzIGRpZmZlcmVudCBlbm91Z2ggZnJvbSB0aGUgb25lIGluIGNhY2hlLCByZWNyZWF0ZSBpdFxuICBpZiAoZGF0YS50YWcgIT0gY2FjaGVkLnRhZyB8fCAhX2hhc1NhbWVLZXlzKGRhdGEuYXR0cnMsIGNhY2hlZC5hdHRycykgfHwgZGF0YS5hdHRycy5pZCAhPSBjYWNoZWQuYXR0cnMuaWQgfHwgZGF0YS5hdHRycy5rZXkgIT0gY2FjaGVkLmF0dHJzLmtleSB8fCB0eXBlKGNvbXBvbmVudE5hbWUpID09PSAnc3RyaW5nJyAmJiBjYWNoZWQuY29tcG9uZW50TmFtZSAhPSBjb21wb25lbnROYW1lKSB7XG4gICAgaWYgKGNhY2hlZC5ub2Rlcy5sZW5ndGgpIHtcbiAgICAgIGNsZWFyKGNhY2hlZC5ub2RlcywgY2FjaGVkKTtcbiAgICB9XG4gIH1cblxuICBpZiAodHlwZShkYXRhLnRhZykgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGNhY2hlZDtcbiAgfVxuXG4gIHZhciBpc05ldyA9IGNhY2hlZC5ub2Rlcy5sZW5ndGggPT09IDAsXG4gICAgICBkYXRhQXR0cktleXMgPSBPYmplY3Qua2V5cyhkYXRhLmF0dHJzKSxcbiAgICAgIGhhc0tleXMgPSBkYXRhQXR0cktleXMubGVuZ3RoID4gKCdrZXknIGluIGRhdGEuYXR0cnMgPyAxIDogMCksXG4gICAgICBkb21Ob2RlLFxuICAgICAgbmV3Tm9kZUlkeDtcbiAgaWYgKGRhdGEuYXR0cnMueG1sbnMpIHtcbiAgICBuYW1lc3BhY2UgPSBkYXRhLmF0dHJzLnhtbG5zO1xuICB9IGVsc2UgaWYgKGRhdGEudGFnID09PSAnc3ZnJykge1xuICAgIG5hbWVzcGFjZSA9ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc7XG4gIH0gZWxzZSBpZiAoZGF0YS50YWcgPT09ICdtYXRoJykge1xuICAgIG5hbWVzcGFjZSA9ICdodHRwOi8vd3d3LnczLm9yZy8xOTk4L01hdGgvTWF0aE1MJztcbiAgfVxuXG4gIGlmIChpc05ldykge1xuICAgIHZhciBfbmV3RWxlbWVudDIgPSBfbmV3RWxlbWVudChwYXJlbnRFbGVtZW50LCBuYW1lc3BhY2UsIGRhdGEsIGluZGV4KTtcblxuICAgIGRvbU5vZGUgPSBfbmV3RWxlbWVudDJbMF07XG4gICAgbmV3Tm9kZUlkeCA9IF9uZXdFbGVtZW50MlsxXTtcblxuICAgIGNhY2hlZCA9IHtcbiAgICAgIHRhZzogZGF0YS50YWcsXG4gICAgICAvL3NldCBhdHRyaWJ1dGVzIGZpcnN0LCB0aGVuIGNyZWF0ZSBjaGlsZHJlblxuICAgICAgYXR0cnM6IGhhc0tleXMgPyBzZXRBdHRyaWJ1dGVzKGRvbU5vZGUsIGRhdGEudGFnLCBkYXRhLmF0dHJzLCB7fSwgbmFtZXNwYWNlKSA6IGRhdGEuYXR0cnMsXG4gICAgICBjaGlsZHJlbjogZGF0YS5jaGlsZHJlbiAhPSBudWxsICYmIGRhdGEuY2hpbGRyZW4ubGVuZ3RoID4gMCA/IGJ1aWxkKGRvbU5vZGUsIGRhdGEudGFnLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgZGF0YS5jaGlsZHJlbiwgY2FjaGVkLmNoaWxkcmVuLCB0cnVlLCAwLCBkYXRhLmF0dHJzLmNvbnRlbnRlZGl0YWJsZSA/IGRvbU5vZGUgOiBlZGl0YWJsZSwgbmFtZXNwYWNlLCBjb25maWdzKSA6IGRhdGEuY2hpbGRyZW4sXG4gICAgICBub2RlczogW2RvbU5vZGVdXG4gICAgfTtcbiAgICBpZiAoY29udHJvbGxlcnMubGVuZ3RoKSB7XG4gICAgICBjYWNoZWQudmlld3MgPSB2aWV3cztcbiAgICAgIGNhY2hlZC5jb250cm9sbGVycyA9IGNvbnRyb2xsZXJzO1xuICAgIH1cblxuICAgIGlmIChjYWNoZWQuY2hpbGRyZW4gJiYgIWNhY2hlZC5jaGlsZHJlbi5ub2Rlcykge1xuICAgICAgY2FjaGVkLmNoaWxkcmVuLm5vZGVzID0gW107XG4gICAgfVxuICAgIC8vZWRnZSBjYXNlOiBzZXR0aW5nIHZhbHVlIG9uIDxzZWxlY3Q+IGRvZXNuJ3Qgd29yayBiZWZvcmUgY2hpbGRyZW4gZXhpc3QsIHNvIHNldCBpdCBhZ2FpbiBhZnRlciBjaGlsZHJlbiBoYXZlIGJlZW4gY3JlYXRlZFxuICAgIGlmIChkYXRhLnRhZyA9PT0gJ3NlbGVjdCcgJiYgJ3ZhbHVlJyBpbiBkYXRhLmF0dHJzKSB7XG4gICAgICBzZXRBdHRyaWJ1dGVzKGRvbU5vZGUsIGRhdGEudGFnLCB7IHZhbHVlOiBkYXRhLmF0dHJzLnZhbHVlIH0sIHt9LCBuYW1lc3BhY2UpO1xuICAgIH1cblxuICAgIGlmIChuZXdOb2RlSWR4ICE9IG51bGwpIHtcbiAgICAgIHBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKGRvbU5vZGUsIHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tuZXdOb2RlSWR4XSB8fCBudWxsKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgZG9tTm9kZSA9IGNhY2hlZC5ub2Rlc1swXTtcbiAgICBpZiAoaGFzS2V5cykge1xuICAgICAgc2V0QXR0cmlidXRlcyhkb21Ob2RlLCBkYXRhLnRhZywgZGF0YS5hdHRycywgY2FjaGVkLmF0dHJzLCBuYW1lc3BhY2UpO1xuICAgIH1cbiAgICBjYWNoZWQuY2hpbGRyZW4gPSBidWlsZChkb21Ob2RlLCBkYXRhLnRhZywgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGRhdGEuY2hpbGRyZW4sIGNhY2hlZC5jaGlsZHJlbiwgZmFsc2UsIDAsIGRhdGEuYXR0cnMuY29udGVudGVkaXRhYmxlID8gZG9tTm9kZSA6IGVkaXRhYmxlLCBuYW1lc3BhY2UsIGNvbmZpZ3MpO1xuICAgIGNhY2hlZC5ub2Rlcy5pbnRhY3QgPSB0cnVlO1xuICAgIGlmIChjb250cm9sbGVycy5sZW5ndGgpIHtcbiAgICAgIGNhY2hlZC52aWV3cyA9IHZpZXdzO1xuICAgICAgY2FjaGVkLmNvbnRyb2xsZXJzID0gY29udHJvbGxlcnM7XG4gICAgfVxuICAgIGlmIChzaG91bGRSZWF0dGFjaCA9PT0gdHJ1ZSAmJiBkb21Ob2RlICE9IG51bGwpIHtcbiAgICAgIHBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKGRvbU5vZGUsIHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tpbmRleF0gfHwgbnVsbCk7XG4gICAgfVxuICB9XG4gIGlmICh0eXBlKGNvbXBvbmVudE5hbWUpID09PSAnc3RyaW5nJykge1xuICAgIGNhY2hlZC5jb21wb25lbnROYW1lID0gY29tcG9uZW50TmFtZTtcbiAgfVxuICAvL3NjaGVkdWxlIGNvbmZpZ3MgdG8gYmUgY2FsbGVkLiBUaGV5IGFyZSBjYWxsZWQgYWZ0ZXIgYGJ1aWxkYCBmaW5pc2hlcyBydW5uaW5nXG4gIGlmICh0eXBlKGRhdGEuYXR0cnMuY29uZmlnKSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHZhciBjb250ZXh0ID0gY2FjaGVkLmNvbmZpZ0NvbnRleHQgPSBjYWNoZWQuY29uZmlnQ29udGV4dCB8fCB7fTtcblxuICAgIC8vIGJpbmRcbiAgICB2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbiAoYXJncykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGRhdGEuYXR0cnMuY29uZmlnLmFwcGx5KGRhdGEsIGFyZ3MpO1xuICAgICAgfTtcbiAgICB9O1xuICAgIGNvbmZpZ3MucHVzaChjYWxsYmFjayhbZG9tTm9kZSwgIWlzTmV3LCBjb250ZXh0LCBjYWNoZWQsIFtwYXJlbnRFbGVtZW50LCBpbmRleCwgZWRpdGFibGUsIG5hbWVzcGFjZV1dKSk7XG4gIH1cbiAgcmV0dXJuIGNhY2hlZDtcbn1cbmZ1bmN0aW9uIF9uZXdFbGVtZW50KHBhcmVudEVsZW1lbnQsIG5hbWVzcGFjZSwgZGF0YSwgaW5kZXgpIHtcbiAgdmFyIGRvbU5vZGUsXG4gICAgICBkb21Ob2RlSW5kZXgsXG4gICAgICBpbnNlcnRJZHggPSBpbmRleDtcbiAgaWYgKHBhcmVudEVsZW1lbnQgJiYgcGFyZW50RWxlbWVudC5jaGlsZE5vZGVzLmxlbmd0aCkge1xuICAgIGRvbU5vZGVJbmRleCA9IF9maW5kRG9tTm9kZUJ5UmVmKHBhcmVudEVsZW1lbnQsIGluZGV4KTtcbiAgICBpZiAoZG9tTm9kZUluZGV4ICYmIGRvbU5vZGVJbmRleFswXSkge1xuICAgICAgaW5zZXJ0SWR4ID0gZG9tTm9kZUluZGV4WzFdO1xuICAgICAgaWYgKGRvbU5vZGVJbmRleFswXS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT0gZGF0YS50YWcudG9Mb3dlckNhc2UoKSkge1xuICAgICAgICByZXR1cm4gW2RvbU5vZGVJbmRleFswXSwgbnVsbF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjbGVhcihbZG9tTm9kZUluZGV4WzBdXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGlmIChkYXRhLmF0dHJzLmlzKSB7XG4gICAgZG9tTm9kZSA9IG5hbWVzcGFjZSA9PT0gdW5kZWZpbmVkID8gJGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoZGF0YS50YWcsIGRhdGEuYXR0cnMuaXMpIDogJGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhuYW1lc3BhY2UsIGRhdGEudGFnLCBkYXRhLmF0dHJzLmlzKTtcbiAgfSBlbHNlIHtcbiAgICBkb21Ob2RlID0gbmFtZXNwYWNlID09PSB1bmRlZmluZWQgPyAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudChkYXRhLnRhZykgOiAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZSwgZGF0YS50YWcpO1xuICB9XG4gIGRvbU5vZGUuc2V0QXR0cmlidXRlKCdkYXRhLW1yZWYnLCBpbmRleCk7XG4gIHJldHVybiBbZG9tTm9kZSwgaW5zZXJ0SWR4XTtcbn1cbmZ1bmN0aW9uIF9maW5kRG9tTm9kZUJ5UmVmKHBhcmVudEVsZW1lbnQsIHJlZikge1xuICB2YXIgaSA9IDAsXG4gICAgICBsID0gcGFyZW50RWxlbWVudC5jaGlsZE5vZGVzLmxlbmd0aCxcbiAgICAgIGNoaWxkTm9kZTtcbiAgZm9yICg7IGkgPCBsOyBpKyspIHtcbiAgICBjaGlsZE5vZGUgPSBwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbaV07XG4gICAgaWYgKGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUgJiYgY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1tcmVmJykgPT0gcmVmKSB7XG4gICAgICByZXR1cm4gW2NoaWxkTm9kZSwgaV07XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBkaWZmVGV4dE5vZGUoZGF0YSwgY2FjaGVkLCBwYXJlbnRFbGVtZW50LCBwYXJlbnRUYWcsIGluZGV4LCBzaG91bGRSZWF0dGFjaCwgZWRpdGFibGUpIHtcbiAgLy9oYW5kbGUgdGV4dCBub2Rlc1xuICB2YXIgbm9kZXM7XG4gIGlmIChjYWNoZWQubm9kZXMubGVuZ3RoID09PSAwKSB7XG4gICAgaWYgKGRhdGEgPT0gJycpIHtcbiAgICAgIHJldHVybiBjYWNoZWQ7XG4gICAgfVxuICAgIGNsZWFyKFtwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbaW5kZXhdXSk7XG4gICAgaWYgKGRhdGEuJHRydXN0ZWQpIHtcbiAgICAgIG5vZGVzID0gaW5qZWN0SFRNTChwYXJlbnRFbGVtZW50LCBpbmRleCwgZGF0YSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vZGVzID0gWyRkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkYXRhKV07XG4gICAgICBpZiAoIXBhcmVudEVsZW1lbnQubm9kZU5hbWUubWF0Y2goVk9JRF9FTEVNRU5UUykpIHtcbiAgICAgICAgcGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUobm9kZXNbMF0sIHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tpbmRleF0gfHwgbnVsbCk7XG4gICAgICB9XG4gICAgfVxuICAgIGNhY2hlZCA9ICdzdHJpbmcgbnVtYmVyIGJvb2xlYW4nLmluZGV4T2YodHlwZW9mIGRhdGEpID4gLTEgPyBuZXcgZGF0YS5jb25zdHJ1Y3RvcihkYXRhKSA6IGRhdGE7XG4gICAgY2FjaGVkLm5vZGVzID0gbm9kZXM7XG4gIH0gZWxzZSBpZiAoY2FjaGVkLnZhbHVlT2YoKSAhPT0gZGF0YS52YWx1ZU9mKCkgfHwgc2hvdWxkUmVhdHRhY2ggPT09IHRydWUpIHtcbiAgICBub2RlcyA9IGNhY2hlZC5ub2RlcztcbiAgICBpZiAoIWVkaXRhYmxlIHx8IGVkaXRhYmxlICE9PSAkZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkge1xuICAgICAgaWYgKGRhdGEuJHRydXN0ZWQpIHtcbiAgICAgICAgY2xlYXIobm9kZXMsIGNhY2hlZCk7XG4gICAgICAgIG5vZGVzID0gaW5qZWN0SFRNTChwYXJlbnRFbGVtZW50LCBpbmRleCwgZGF0YSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvL2Nvcm5lciBjYXNlOiByZXBsYWNpbmcgdGhlIG5vZGVWYWx1ZSBvZiBhIHRleHQgbm9kZSB0aGF0IGlzIGEgY2hpbGQgb2YgYSB0ZXh0YXJlYS9jb250ZW50ZWRpdGFibGUgZG9lc24ndCB3b3JrXG4gICAgICAgIC8vd2UgbmVlZCB0byB1cGRhdGUgdGhlIHZhbHVlIHByb3BlcnR5IG9mIHRoZSBwYXJlbnQgdGV4dGFyZWEgb3IgdGhlIGlubmVySFRNTCBvZiB0aGUgY29udGVudGVkaXRhYmxlIGVsZW1lbnQgaW5zdGVhZFxuICAgICAgICBpZiAocGFyZW50VGFnID09PSAndGV4dGFyZWEnKSB7XG4gICAgICAgICAgcGFyZW50RWxlbWVudC52YWx1ZSA9IGRhdGE7XG4gICAgICAgIH0gZWxzZSBpZiAoZWRpdGFibGUpIHtcbiAgICAgICAgICBlZGl0YWJsZS5pbm5lckhUTUwgPSBkYXRhO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChub2Rlc1swXS5ub2RlVHlwZSA9PT0gMSB8fCBub2Rlcy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAvL3dhcyBhIHRydXN0ZWQgc3RyaW5nXG4gICAgICAgICAgICBjbGVhcihjYWNoZWQubm9kZXMsIGNhY2hlZCk7XG4gICAgICAgICAgICBub2RlcyA9IFskZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGF0YSldO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZShub2Rlc1swXSwgcGFyZW50RWxlbWVudC5jaGlsZE5vZGVzW2luZGV4XSB8fCBudWxsKTtcbiAgICAgICAgICBub2Rlc1swXS5ub2RlVmFsdWUgPSBkYXRhO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGNhY2hlZCA9IG5ldyBkYXRhLmNvbnN0cnVjdG9yKGRhdGEpO1xuICAgIGNhY2hlZC5ub2RlcyA9IG5vZGVzO1xuICB9IGVsc2Uge1xuICAgIGNhY2hlZC5ub2Rlcy5pbnRhY3QgPSB0cnVlO1xuICB9XG4gIHJldHVybiBjYWNoZWQ7XG59XG5cbi8vaGVscGVyc1xuZnVuY3Rpb24gX3JlY3Vyc2l2ZUZsYXR0ZW4oYXJyKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgLy8gYXJyIG1heSBiZSBtb2RpZmllZCwgZXguIG5vZGVsaXN0XG4gICAgaWYgKHR5cGUoYXJyW2ldKSA9PT0gJ2FycmF5Jykge1xuICAgICAgYXJyID0gYXJyLmNvbmNhdC5hcHBseShbXSwgYXJyKTtcbiAgICAgIGktLTsgLy9jaGVjayBjdXJyZW50IGluZGV4IGFnYWluIGFuZCBmbGF0dGVuIHVudGlsIHRoZXJlIGFyZSBubyBtb3JlIG5lc3RlZCBhcnJheXMgYXQgdGhhdCBpbmRleFxuICAgIH1cbiAgfVxuICByZXR1cm4gYXJyO1xufVxuZnVuY3Rpb24gX2hhc1NhbWVLZXlzKG8xLCBvMikge1xuICB2YXIgbzFLZXlzID0gT2JqZWN0LmtleXMobzEpLnNvcnQoKS5qb2luKCksXG4gICAgICBvMktleXMgPSBPYmplY3Qua2V5cyhvMikuc29ydCgpLmpvaW4oKTtcbiAgcmV0dXJuIG8xS2V5cyA9PT0gbzJLZXlzO1xufVxuZnVuY3Rpb24gaW5qZWN0SFRNTChwYXJlbnRFbGVtZW50LCBpbmRleCwgZGF0YSkge1xuICB2YXIgbmV4dFNpYmxpbmcgPSBwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbaW5kZXhdO1xuICBpZiAobmV4dFNpYmxpbmcpIHtcbiAgICB2YXIgaXNFbGVtZW50ID0gbmV4dFNpYmxpbmcubm9kZVR5cGUgIT09IDE7XG4gICAgdmFyIHBsYWNlaG9sZGVyID0gJGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICBpZiAoaXNFbGVtZW50KSB7XG4gICAgICBwYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZShwbGFjZWhvbGRlciwgbmV4dFNpYmxpbmcgfHwgbnVsbCk7XG4gICAgICBwbGFjZWhvbGRlci5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWJlZ2luJywgZGF0YSk7XG4gICAgICBwYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKHBsYWNlaG9sZGVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV4dFNpYmxpbmcuaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmViZWdpbicsIGRhdGEpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBwYXJlbnRFbGVtZW50Lmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlZW5kJywgZGF0YSk7XG4gIH1cbiAgdmFyIG5vZGVzID0gW10sXG4gICAgICBjaGlsZE5vZGU7XG4gIHdoaWxlICgoY2hpbGROb2RlID0gcGFyZW50RWxlbWVudC5jaGlsZE5vZGVzW2luZGV4KytdKSAhPT0gbmV4dFNpYmxpbmcpIHtcbiAgICBub2Rlcy5wdXNoKGNoaWxkTm9kZSk7XG4gIH1cbiAgcmV0dXJuIG5vZGVzO1xufSIsImltcG9ydCB7IGRvY3VtZW50IGFzICRkb2N1bWVudCwgRyB9IGZyb20gJy4uL2dsb2JhbHMnO1xuaW1wb3J0IGJ1aWxkIGZyb20gJy4vYnVpbGQnO1xuaW1wb3J0IGNsZWFyIGZyb20gJy4vY2xlYXInO1xuXG5leHBvcnQgeyByZW5kZXIgfTtcbmZ1bmN0aW9uIHJlbmRlcihyb290LCB2Tm9kZSwgZm9yY2VSZWNyZWF0aW9uLCBmb3JjZSkge1xuICB2YXIgdGFzayA9IHtcbiAgICByb290OiByb290LFxuICAgIHZOb2RlOiB2Tm9kZSxcbiAgICBmb3JjZVJlY3JlYXRpb246IGZvcmNlUmVjcmVhdGlvblxuICB9O1xuICBpZiAoZm9yY2UgPT09IHRydWUpIHtcbiAgICByZXR1cm4gX3JlbmRlcih0YXNrKTtcbiAgfVxuICBHLnJlbmRlclF1ZXVlLmFkZFRhcmdldCh7XG4gICAgbWVyZ2VUeXBlOiAxLCAvLyByZXBsYWNlXG4gICAgcm9vdDogcm9vdCxcbiAgICBwcm9jZXNzb3I6IF9yZW5kZXIsXG4gICAgcGFyYW1zOiBbdGFza11cbiAgfSk7XG59XG52YXIgaHRtbDtcbnZhciBkb2N1bWVudE5vZGUgPSB7XG4gIGFwcGVuZENoaWxkOiBmdW5jdGlvbiAobm9kZSkge1xuICAgIGlmIChodG1sID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGh0bWwgPSAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaHRtbCcpO1xuICAgIH1cbiAgICBpZiAoJGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiAkZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICE9PSBub2RlKSB7XG4gICAgICAkZG9jdW1lbnQucmVwbGFjZUNoaWxkKG5vZGUsICRkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkZG9jdW1lbnQuYXBwZW5kQ2hpbGQobm9kZSk7XG4gICAgfVxuICAgIHRoaXMuY2hpbGROb2RlcyA9ICRkb2N1bWVudC5jaGlsZE5vZGVzO1xuICB9LFxuICBpbnNlcnRCZWZvcmU6IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgdGhpcy5hcHBlbmRDaGlsZChub2RlKTtcbiAgfSxcbiAgY2hpbGROb2RlczogW11cbn07XG4vLyB2YXIgZG9tTm9kZUNhY2hlID0gW10sIHZOb2RlQ2FjaGUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xudmFyIGRvbUNhY2hlTWFwID0gRy5kb21DYWNoZU1hcDtcbmZ1bmN0aW9uIF9yZW5kZXIodGFzaykge1xuICB2YXIgcm9vdCA9IHRhc2sucm9vdDtcbiAgdmFyIHZOb2RlID0gdGFzay52Tm9kZTtcbiAgdmFyIGZvcmNlUmVjcmVhdGlvbiA9IHRhc2suZm9yY2VSZWNyZWF0aW9uO1xuXG4gIGlmICghcm9vdCkge1xuICAgIHRocm93IG5ldyBFcnJvcignRW5zdXJlIHRoZSBET00gZWxlbWVudCBiZWluZyBwYXNzZWQgdG8gbS5yb3V0ZS9tLm1vdW50L20ucmVuZGVyIGlzIG5vdCB1bmRlZmluZWQuJyk7XG4gIH1cbiAgdmFyIGNvbmZpZ3MgPSBbXSxcbiAgICAgIGlzRG9jdW1lbnRSb290ID0gcm9vdCA9PT0gJGRvY3VtZW50IHx8IHJvb3QgPT09ICRkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsXG4gICAgICBkb21Ob2RlID0gaXNEb2N1bWVudFJvb3QgPyBkb2N1bWVudE5vZGUgOiByb290LFxuICAgICAgdk5vZGVDYWNoZTtcbiAgaWYgKGlzRG9jdW1lbnRSb290ICYmIHZOb2RlLnRhZyAhPT0gJ2h0bWwnKSB7XG4gICAgdk5vZGUgPSB7IHRhZzogJ2h0bWwnLCBhdHRyczoge30sIGNoaWxkcmVuOiB2Tm9kZSB9O1xuICB9XG5cbiAgaWYgKGZvcmNlUmVjcmVhdGlvbikge1xuICAgIHJlc2V0KGRvbU5vZGUpO1xuICB9XG4gIHZOb2RlQ2FjaGUgPSBidWlsZChkb21Ob2RlLCBudWxsLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdk5vZGUsIGRvbUNhY2hlTWFwLmdldChkb21Ob2RlKSwgZmFsc2UsIDAsIG51bGwsIHVuZGVmaW5lZCwgY29uZmlncyk7XG4gIGNvbmZpZ3MuZm9yRWFjaChmdW5jdGlvbiAob25SZW5kZXIpIHtcbiAgICBvblJlbmRlcigpO1xuICB9KTtcbiAgZG9tQ2FjaGVNYXAuc2V0KGRvbU5vZGUsIHZOb2RlQ2FjaGUpO1xufVxuXG5mdW5jdGlvbiByZXNldChyb290KSB7XG4gIGNsZWFyKHJvb3QuY2hpbGROb2RlcywgZG9tQ2FjaGVNYXAuZ2V0KHJvb3QpKTtcbiAgZG9tQ2FjaGVNYXAucmVtb3ZlKHJvb3QpO1xufSIsImltcG9ydCBtIGZyb20gJy4vbSc7XG5pbXBvcnQgeyByZW5kZXIgfSBmcm9tICcuL3JlbmRlcic7XG5leHBvcnQgeyBtLCByZW5kZXIgfTsiLCJcbmV4cG9ydCBkZWZhdWx0IHVwZGF0ZTtcbmltcG9ydCB7IHR5cGUgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgeyBHIH0gZnJvbSAnLi4vZ2xvYmFscyc7XG5pbXBvcnQgeyByZW5kZXIgfSBmcm9tICcuLi9yZW5kZXIvcmVuZGVyJztcblxuLy9nbG9iYWwgcmVuZGVyIHF1ZXVlIHNldHRpbmdcbnZhciByZW5kZXJRdWV1ZSA9IEcucmVuZGVyUXVldWUub25GaW5pc2goX29uRmluaXNoKTtcbnZhciByZWRyYXdpbmcgPSBmYWxzZTtcbmZ1bmN0aW9uIHVwZGF0ZShmb3JjZSkge1xuICBpZiAocmVkcmF3aW5nID09PSB0cnVlKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHJlZHJhd2luZyA9IHRydWU7XG4gIGlmIChmb3JjZSA9PT0gdHJ1ZSkge1xuICAgIEcuZm9yY2luZyA9IHRydWU7XG4gIH1cbiAgX3VwZGF0ZVJvb3RzKGZvcmNlKTtcbiAgcmVkcmF3aW5nID0gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIF91cGRhdGVSb290cyhmb3JjZSkge1xuICB2YXIgcm9vdCwgY29tcG9uZW50LCBjb250cm9sbGVyLCBuZWVkUmVjcmVhdGlvbjtcbiAgaWYgKHJlbmRlclF1ZXVlLmxlbmd0aCgpID09PSAwIHx8IGZvcmNlID09PSB0cnVlKSB7XG4gICAgaWYgKHR5cGUoRy5jb21wdXRlUHJlUmVkcmF3SG9vaykgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIEcuY29tcHV0ZVByZVJlZHJhd0hvb2soKTtcbiAgICAgIEcuY29tcHV0ZVByZVJlZHJhd0hvb2sgPSBudWxsO1xuICAgIH1cbiAgfVxuICBpZiAocmVuZGVyUXVldWUubGVuZ3RoKCkgPiAwKSB7XG4gICAgcmVuZGVyUXVldWUuc3RvcCgpO1xuICB9XG4gIGZvciAodmFyIGkgPSAwLCBsID0gRy5yb290cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICByb290ID0gRy5yb290c1tpXTtcbiAgICBjb21wb25lbnQgPSBHLmNvbXBvbmVudHNbaV07XG4gICAgY29udHJvbGxlciA9IEcuY29udHJvbGxlcnNbaV07XG4gICAgbmVlZFJlY3JlYXRpb24gPSBHLnJlY3JlYXRpb25zW2ldO1xuICAgIGlmIChjb250cm9sbGVyKSB7XG4gICAgICBpZiAodHlwZW9mIGNvbnRyb2xsZXIuaW5zdGFuY2UgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIC8vICAgLy8gY29udHJvbGxlci5pbnN0YW5jZS5yZWRyYXcgPSBmdW5jdGlvbiBjb21wb25lbnRSZWRyYXcoKXtcbiAgICAgICAgLy8gICAvLyAgIHJlbmRlclF1ZXVlLmFkZFRhcmdldCh7XG4gICAgICAgIC8vICAgLy8gICAgIG1lcmdlVHlwZTogMCwvLyBjb250YWluXG4gICAgICAgIC8vICAgLy8gICAgIHByb2Nlc3NvcjogX3JlbmRlcixcbiAgICAgICAgLy8gICAvLyAgICAgcm9vdDogcm9vdCxcbiAgICAgICAgLy8gICAvLyAgICAgcGFyYW1zOlt7XG4gICAgICAgIC8vICAgLy8gICAgICAgcm9vdDogcm9vdCxcbiAgICAgICAgLy8gICAvLyAgICAgICB2Tm9kZTogY29tcG9uZW50LnZpZXcgPyBjb21wb25lbnQudmlldyhjb250cm9sbGVyKSA6ICcnLFxuICAgICAgICAvLyAgIC8vICAgICAgIGZvcmNlUmVjcmVhdGlvbjogZmFsc2VcbiAgICAgICAgLy8gICAvLyAgICAgfV1cbiAgICAgICAgLy8gICAvLyAgIH0pO1xuICAgICAgICAvLyAgIC8vIH07XG4gICAgICAgIGNvbnRyb2xsZXIuaW5zdGFuY2Uudmlld0ZuID0gW2NvbXBvbmVudC52aWV3LCBjb250cm9sbGVyXTtcbiAgICAgIH1cbiAgICAgIHJlbmRlcihyb290LCBjb21wb25lbnQudmlldyA/IGNvbXBvbmVudC52aWV3KGNvbnRyb2xsZXIpIDogJycsIG5lZWRSZWNyZWF0aW9uLCBmb3JjZSk7XG4gICAgfVxuICAgIC8vcmVzZXQgYmFjayB0byBub3QgZGVzdHJveSByb290J3MgY2hpbGRyZW5cbiAgICBHLnJlY3JlYXRpb25zW2ldID0gdm9pZCAwO1xuICB9XG4gIGlmIChmb3JjZSA9PT0gdHJ1ZSkge1xuICAgIF9vbkZpbmlzaCgpO1xuICAgIEcuZm9yY2luZyA9IGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9vbkZpbmlzaCgpIHtcbiAgaWYgKHR5cGUoRy5jb21wdXRlUG9zdFJlZHJhd0hvb2spID09PSAnZnVuY3Rpb24nKSB7XG4gICAgRy5jb21wdXRlUG9zdFJlZHJhd0hvb2soKTtcbiAgICBHLmNvbXB1dGVQb3N0UmVkcmF3SG9vayA9IG51bGw7XG4gIH1cbn0iLCJpbXBvcnQgcmVkcmF3IGZyb20gJy4vdXBkYXRlJztcbmltcG9ydCB7IGdldFBhcmVudEVsRnJvbSB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB7IEcgfSBmcm9tICcuLi9nbG9iYWxzJztcbi8vcmVuZGVyIHF1ZXVlIHNldHRpbmdcbkcucmVuZGVyUXVldWUub25GbHVzaChvbkZsdXNoKS5vbkFkZFRhcmdldChvbk1lcmdlVGFzayk7XG5cbmV4cG9ydCB7IHJlZHJhdyB9O1xuXG5mdW5jdGlvbiBvbkZsdXNoKHRhc2spIHtcbiAgdmFyIHByb2Nlc3NvciA9IHRhc2sucHJvY2Vzc29yO1xuICB2YXIgcGFyYW1zID0gdGFzay5wYXJhbXM7XG5cbiAgaWYgKHR5cGVvZiBwcm9jZXNzb3IgPT09ICdmdW5jdGlvbicpIHtcbiAgICBwcm9jZXNzb3IuYXBwbHkobnVsbCwgcGFyYW1zKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBvbk1lcmdlVGFzayhxdWV1ZSwgdGFzaykge1xuICB2YXIgaSwgbCwgcmVtb3ZlSWR4LCB0YXNrVG9QdXNoO1xuICBmb3IgKGkgPSAwLCBsID0gcXVldWUubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgdGFza1RvUHVzaCA9IGNhbkJlTWVyZ2VkKHF1ZXVlW2ldLCB0YXNrKTtcbiAgICBpZiAodGFza1RvUHVzaCkge1xuICAgICAgcmVtb3ZlSWR4ID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICBpZiAocmVtb3ZlSWR4ID4gLTEpIHtcbiAgICBxdWV1ZS5zcGxpY2UocmVtb3ZlSWR4LCAxKTtcbiAgICBxdWV1ZS5wdXNoKHRhc2tUb1B1c2gpO1xuICB9IGVsc2Uge1xuICAgIHF1ZXVlLnB1c2godGFzayk7XG4gIH1cblxuICByZXR1cm4gcXVldWU7XG59XG5mdW5jdGlvbiBjYW5CZU1lcmdlZCh0YXNrSW5RLCB0YXNrKSB7XG4gIHZhciBpblFSb290ID0gdGFza0luUS5yb290LFxuICAgICAgdFJvb3QgPSB0YXNrLnJvb3Q7XG4gIGlmICh0YXNrSW5RLm1lcmdlVHlwZSAmIHRhc2subWVyZ2VUeXBlKSB7XG4gICAgLy8gYXQgbGVhc3Qgb25lIG9mIHRoZW0gYXJlIHJlcGxhY2VcbiAgICByZXR1cm4gaW5RUm9vdCA9PT0gdFJvb3QgPyB0YXNrIDogbnVsbDtcbiAgfSBlbHNlIHtcbiAgICAvLyBib3RoIG9mIHRoZW0gYXJlIGNvbnRhaW5cbiAgICB2YXIgcGFyZW50ID0gZ2V0UGFyZW50RWxGcm9tKGluUVJvb3QsIHRSb290KTtcbiAgICByZXR1cm4gIXBhcmVudCA/IG51bGwgOiBwYXJlbnQgPT09IGluUVJvb3QgPyB0YXNrSW5RIDogdGFzaztcbiAgfVxufSIsIlxuXG5leHBvcnQgZGVmYXVsdCBjb21wb25lbnRpemU7XG5pbXBvcnQgeyBzbGljZSwgTk9PUCB9IGZyb20gJy4uL3V0aWxzJztcbmZ1bmN0aW9uIHBhcmFtZXRlcml6ZShjb21wb25lbnQsIGFyZ3MpIHtcbiAgdmFyIGNvbnRyb2xsZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIChjb21wb25lbnQuY29udHJvbGxlciB8fCBOT09QKS5hcHBseSh0aGlzLCBhcmdzKSB8fCB0aGlzO1xuICB9O1xuXG4gIHZhciB2aWV3ID0gZnVuY3Rpb24gKGN0cmwpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgIGFyZ3MgPSBhcmdzLmNvbmNhdChzbGljZShhcmd1bWVudHMsIDEpKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbXBvbmVudC52aWV3LmFwcGx5KGNvbXBvbmVudCwgYXJncy5sZW5ndGggPyBbY3RybF0uY29uY2F0KGFyZ3MpIDogW2N0cmxdKTtcbiAgfTtcbiAgdmlldy4kb3JpZ2luYWwgPSBjb21wb25lbnQudmlldztcbiAgdmFyIG91dHB1dCA9IHsgY29udHJvbGxlcjogY29udHJvbGxlciwgdmlldzogdmlldyB9O1xuICBpZiAoYXJnc1swXSAmJiBhcmdzWzBdLmtleSAhPSBudWxsKSB7XG4gICAgb3V0cHV0LmF0dHJzID0geyBrZXk6IGFyZ3NbMF0ua2V5IH07XG4gIH1cbiAgcmV0dXJuIG91dHB1dDtcbn1cbmZ1bmN0aW9uIGNvbXBvbmVudGl6ZShjb21wb25lbnQpIHtcbiAgcmV0dXJuIHBhcmFtZXRlcml6ZShjb21wb25lbnQsIHNsaWNlKGFyZ3VtZW50cywgMSkpO1xufSIsIlxuXG5leHBvcnQgZGVmYXVsdCBtb3VudDtcbmltcG9ydCB7IEcgfSBmcm9tICcuLi9nbG9iYWxzJztcblxuaW1wb3J0IHsgcmVkcmF3IH0gZnJvbSAnLi4vdXBkYXRlJztcblxuaW1wb3J0IHsgdHlwZSwgTk9PUCB9IGZyb20gJy4uL3V0aWxzJztcblxudmFyIHRvcENvbXBvbmVudDtcbmZ1bmN0aW9uIG1vdW50KHJvb3QsIGNvbXBvbmVudCwgZm9yY2VSZWNyZWF0aW9uKSB7XG4gIGlmICghcm9vdCkge1xuICAgIHRocm93IG5ldyBFcnJvcignUGxlYXNlIGVuc3VyZSB0aGUgRE9NIGVsZW1lbnQgZXhpc3RzIGJlZm9yZSByZW5kZXJpbmcgYSB0ZW1wbGF0ZSBpbnRvIGl0LicpO1xuICB9XG4gIHZhciBpbmRleCA9IEcucm9vdHMuaW5kZXhPZihyb290KTtcbiAgaWYgKGluZGV4IDwgMCkge1xuICAgIGluZGV4ID0gRy5yb290cy5sZW5ndGg7XG4gIH1cblxuICB2YXIgaXNQcmV2ZW50ZWQgPSBmYWxzZTtcbiAgdmFyIGV2ZW50ID0ge1xuICAgIHByZXZlbnREZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgICBpc1ByZXZlbnRlZCA9IHRydWU7XG4gICAgICBHLmNvbXB1dGVQcmVSZWRyYXdIb29rID0gRy5jb21wdXRlUG9zdFJlZHJhd0hvb2sgPSBudWxsO1xuICAgIH1cbiAgfTtcbiAgRy51bmxvYWRlcnMuZWFjaChmdW5jdGlvbiAodW5sb2FkZXIsIGNvbnRyb2xsZXIpIHtcbiAgICB1bmxvYWRlci5jYWxsKGNvbnRyb2xsZXIsIGV2ZW50KTtcbiAgICBjb250cm9sbGVyLm9udW5sb2FkID0gbnVsbDtcbiAgfSk7XG5cbiAgaWYgKGlzUHJldmVudGVkKSB7XG4gICAgRy51bmxvYWRlcnMuZWFjaChmdW5jdGlvbiAodW5sb2FkZXIsIGNvbnRyb2xsZXIpIHtcbiAgICAgIGNvbnRyb2xsZXIub251bmxvYWQgPSB1bmxvYWRlcjtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBHLnVubG9hZGVycy5jbGVhcigpO1xuICB9XG5cbiAgaWYgKEcuY29udHJvbGxlcnNbaW5kZXhdICYmIHR5cGUoRy5jb250cm9sbGVyc1tpbmRleF0ub251bmxvYWQpID09PSAnZnVuY3Rpb24nKSB7XG4gICAgRy5jb250cm9sbGVyc1tpbmRleF0ub251bmxvYWQoZXZlbnQpO1xuICB9XG5cbiAgaWYgKCFpc1ByZXZlbnRlZCkge1xuICAgIEcucm9vdHNbaW5kZXhdID0gcm9vdDtcbiAgICB2YXIgY3VycmVudENvbXBvbmVudCA9IHRvcENvbXBvbmVudCA9IGNvbXBvbmVudCA9IGNvbXBvbmVudCB8fCB7IGNvbnRyb2xsZXI6IE5PT1AgfTtcbiAgICB2YXIgX2NvbnN0cnVjdG9yID0gY29tcG9uZW50LmNvbnRyb2xsZXIgfHwgTk9PUDtcbiAgICB2YXIgY29udHJvbGxlciA9IG5ldyBfY29uc3RydWN0b3IoKTtcbiAgICAvL2NvbnRyb2xsZXJzIG1heSBjYWxsIG0ubW91bnQgcmVjdXJzaXZlbHkgKHZpYSBtLnJvdXRlIHJlZGlyZWN0cywgZm9yIGV4YW1wbGUpXG4gICAgLy90aGlzIGNvbmRpdGlvbmFsIGVuc3VyZXMgb25seSB0aGUgbGFzdCByZWN1cnNpdmUgbS5tb3VudCBjYWxsIGlzIGFwcGxpZWRcbiAgICBpZiAoY3VycmVudENvbXBvbmVudCA9PT0gdG9wQ29tcG9uZW50KSB7XG4gICAgICBHLmNvbnRyb2xsZXJzW2luZGV4XSA9IGNvbnRyb2xsZXI7XG4gICAgICBHLmNvbXBvbmVudHNbaW5kZXhdID0gY29tcG9uZW50O1xuICAgICAgRy5yZWNyZWF0aW9uc1tpbmRleF0gPSBmb3JjZVJlY3JlYXRpb247XG4gICAgfVxuICAgIHJlZHJhdygpO1xuICAgIHJldHVybiBHLmNvbnRyb2xsZXJzW2luZGV4XTtcbiAgfVxufSIsIlxuZXhwb3J0IGRlZmF1bHQgY3JlYXRlQ29tcG9uZW50O1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuLy8gaW1wb3J0ICogYXMgdXBkYXRlIGZyb20gJy4uL3VwZGF0ZSc7XG5pbXBvcnQgeyB0eXBlLCBleHRlbmQsIHNsaWNlLCByZW1vdmVWb2lkVmFsdWUsIHRvQXJyYXkgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgeyBydW50aW1lIGFzIFJULCBHIH0gZnJvbSAnLi4vZ2xvYmFscyc7XG5pbXBvcnQgYnVpbGQgZnJvbSAnLi4vcmVuZGVyL2J1aWxkJztcbnZhciBleHRlbmRNZXRob2RzID0gWydjb21wb25lbnRXaWxsTW91bnQnLCAnY29tcG9uZW50RGlkTW91bnQnLCAnY29tcG9uZW50V2lsbFVwZGF0ZScsICdjb21wb25lbnREaWRVcGRhdGUnLCAnY29tcG9uZW50V2lsbFVubW91bnQnLCAnY29tcG9uZW50V2lsbERldGFjaGVkJywgJ2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMnLCAnZ2V0SW5pdGlhbFByb3BzJywgJ2dldEluaXRpYWxTdGF0ZSddO1xudmFyIHBpcGVkTWV0aG9kcyA9IFsnZ2V0SW5pdGlhbFByb3BzJywgJ2dldEluaXRpYWxTdGF0ZScsICdjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzJ107XG52YXIgaWdub3JlUHJvcHMgPSBbJ3NldFN0YXRlJywgJ21peGlucycsICdvbnVubG9hZCcsICdzZXRJbnRlcm5hbFByb3BzJywgJ3JlZHJhdyddO1xuXG52YXIgQ29tcG9uZW50ID0gKGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gQ29tcG9uZW50KHByb3BzLCBjaGlsZHJlbikge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBDb21wb25lbnQpO1xuXG4gICAgaWYgKHR5cGUocHJvcHMpICE9PSAnb2JqZWN0JyAmJiBwcm9wcyAhPSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdbQ29tcG9uZW50XXBhcmFtIGZvciBjb25zdHJ1Y3RvciBzaG91bGQgYSBvYmplY3Qgb3IgbnVsbCBvciB1bmRlZmluZWQhIGdpdmVuOiAnICsgcHJvcHMpO1xuICAgIH1cbiAgICB0aGlzLnByb3BzID0gcHJvcHMgfHwge307XG4gICAgdGhpcy5wcm9wcy5jaGlsZHJlbiA9IHRvQXJyYXkoY2hpbGRyZW4pO1xuICAgIHRoaXMucm9vdCA9IG51bGw7XG4gICAgLy8gdGhpcy5zdGF0ZSA9IHt9O1xuICAgIGlmICh0aGlzLmdldEluaXRpYWxQcm9wcykge1xuICAgICAgdGhpcy5wcm9wcyA9IHRoaXMuZ2V0SW5pdGlhbFByb3BzKHRoaXMucHJvcHMpO1xuICAgIH1cbiAgICBpZiAodGhpcy5nZXRJbml0aWFsU3RhdGUpIHtcbiAgICAgIHRoaXMuc3RhdGUgPSB0aGlzLmdldEluaXRpYWxTdGF0ZSh0aGlzLnByb3BzKTtcbiAgICB9XG4gIH1cblxuICBDb21wb25lbnQucHJvdG90eXBlLnNldFByb3BzID0gZnVuY3Rpb24gc2V0UHJvcHMocHJvcHMsIGNoaWxkcmVuKSB7XG4gICAgaWYgKHRoaXMuY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcykge1xuICAgICAgcHJvcHMgPSB0aGlzLmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMocHJvcHMpO1xuICAgIH1cbiAgICB0aGlzLnByb3BzID0gcmVtb3ZlVm9pZFZhbHVlKGV4dGVuZCh0aGlzLnByb3BzLCBwcm9wcywgeyBjaGlsZHJlbjogdG9BcnJheShjaGlsZHJlbikgfSkpO1xuICB9O1xuXG4gIENvbXBvbmVudC5wcm90b3R5cGUub251bmxvYWQgPSBmdW5jdGlvbiBvbnVubG9hZChmbikge1xuICAgIGlmICh0eXBlKGZuKSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgZm4uY2FsbCh0aGlzKTtcbiAgICB9XG4gICAgdGhpcy5yb290ID0gbnVsbDtcbiAgICB0aGlzLmNhY2hlZCA9IG51bGw7XG4gICAgdGhpcy5yZWRyYXdEYXRhID0gbnVsbDtcbiAgfTtcblxuICBDb21wb25lbnQucHJvdG90eXBlLnNldEludGVybmFsUHJvcHMgPSBmdW5jdGlvbiBzZXRJbnRlcm5hbFByb3BzKHJvb3RFbCwgY2FjaGVkLCByZWRyYXdEYXRhKSB7XG4gICAgdGhpcy5yb290ID0gcm9vdEVsO1xuICAgIHRoaXMuY2FjaGVkID0gY2FjaGVkO1xuICAgIHRoaXMucmVkcmF3RGF0YSA9IHJlZHJhd0RhdGE7XG4gIH07XG5cbiAgLy8gZ2V0SW5pdGlhbFByb3BzKHByb3BzKXtcblxuICAvLyB9XG5cbiAgLy8gcmVuZGVyKHByb3BzLCBzdGF0ZXMpe1xuXG4gIC8vIH1cbiAgLy8gZ2V0SW5pdGlhbFN0YXRlKHByb3BzKXtcblxuICAvLyB9XG4gIC8vIGNvbXBvbmVudERpZE1vdW50KGVsKXtcblxuICAvLyB9XG4gIC8vIHNob3VsZENvbXBvbmVudFVwZGF0ZSgpe1xuXG4gIC8vIH1cblxuICAvLyBjb21wb25lbnREaWRVcGRhdGUoKXtcblxuICAvLyB9XG4gIC8vIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMoKXtcblxuICAvLyB9XG4gIC8vIGNvbXBvbmVudFdpbGxVbm1vdW50KGUpe1xuXG4gIC8vIH1cbiAgLy8gY29tcG9uZW50V2lsbERldGFjaGVkKGVsKXtcblxuICAvLyB9XG5cbiAgQ29tcG9uZW50LnByb3RvdHlwZS5yZWRyYXcgPSBmdW5jdGlvbiByZWRyYXcoKSB7XG4gICAgaWYgKHRoaXMucmVkcmF3RGF0YSA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBpbnN0YW5jZSA9IHRoaXM7XG5cbiAgICBHLnJlbmRlclF1ZXVlLmFkZFRhcmdldCh7XG4gICAgICBtZXJnZVR5cGU6IDAsIC8vIGNvbnRhaW5cbiAgICAgIHByb2Nlc3NvcjogX2J1aWxkLFxuICAgICAgcm9vdDogaW5zdGFuY2Uucm9vdCxcbiAgICAgIHBhcmFtczogW2luc3RhbmNlXVxuICAgIH0pO1xuICB9O1xuXG4gIENvbXBvbmVudC5wcm90b3R5cGUuc2V0U3RhdGUgPSBmdW5jdGlvbiBzZXRTdGF0ZShzdGF0ZSwgc2lsZW5jZSkge1xuICAgIGlmICh0aGlzLnN0YXRlID09IG51bGwpIHtcbiAgICAgIHRoaXMuc3RhdGUgPSB7fTtcbiAgICB9XG4gICAgdGhpcy5zdGF0ZSA9IGV4dGVuZCh0aGlzLnN0YXRlLCBzdGF0ZSk7XG4gICAgaWYgKCFzaWxlbmNlICYmIFJUID09PSAnYnJvd3NlcicpIHtcbiAgICAgIHRoaXMucmVkcmF3KCk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBDb21wb25lbnQ7XG59KSgpO1xuXG5mdW5jdGlvbiBfYnVpbGQoaW5zdGFuY2UpIHtcbiAgdmFyIHZpZXdGbiA9IGluc3RhbmNlLnZpZXdGbjtcbiAgdmFyIGRhdGEgPSB2aWV3Rm5bMF0odmlld0ZuWzFdKTtcbiAgdmFyIGtleSA9IGluc3RhbmNlLnByb3BzLmtleTtcbiAgdmFyIF9pbnN0YW5jZSRyZWRyYXdEYXRhID0gaW5zdGFuY2UucmVkcmF3RGF0YTtcbiAgdmFyIHBhcmVudEVsZW1lbnQgPSBfaW5zdGFuY2UkcmVkcmF3RGF0YVswXTtcbiAgdmFyIGluZGV4ID0gX2luc3RhbmNlJHJlZHJhd0RhdGFbMV07XG4gIHZhciBlZGl0YWJsZSA9IF9pbnN0YW5jZSRyZWRyYXdEYXRhWzJdO1xuICB2YXIgbmFtZXNwYWNlID0gX2luc3RhbmNlJHJlZHJhd0RhdGFbM107XG4gIHZhciBjb25maWdzID0gW107XG4gIGlmIChrZXkgIT0gbnVsbCkge1xuICAgIGRhdGEuYXR0cnMgPSBkYXRhLmF0dHJzIHx8IHt9O1xuICAgIGRhdGEuYXR0cnMua2V5ID0ga2V5O1xuICB9XG5cbiAgaW5zdGFuY2UuY2FjaGVkID0gYnVpbGQocGFyZW50RWxlbWVudCwgbnVsbCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGRhdGEsIGluc3RhbmNlLmNhY2hlZCwgZmFsc2UsIGluZGV4LCBlZGl0YWJsZSwgbmFtZXNwYWNlLCBjb25maWdzKTtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBjb25maWdzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGNvbmZpZ3NbaV0oKTtcbiAgfVxufVxuZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50KG9wdGlvbnMpIHtcbiAgaWYgKHR5cGUob3B0aW9ucykgIT09ICdvYmplY3QnKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignW2NyZWF0ZUNvbXBvbmVudF1wYXJhbSBzaG91bGQgYmUgYSBvYmplY3QhIGdpdmVuOiAnICsgb3B0aW9ucyk7XG4gIH1cbiAgdmFyIGNvbXBvbmVudCA9IHt9LFxuICAgICAgRmFjdG9yeSA9IGNyZWF0ZUNvbXBvbmVudEZhY3Rvcnkob3B0aW9ucyk7XG4gIGNvbXBvbmVudC5jb250cm9sbGVyID0gZnVuY3Rpb24gKHByb3BzLCBjaGlsZHJlbikge1xuICAgIHZhciBpbnN0YW5jZSA9IG5ldyBGYWN0b3J5KHByb3BzLCBjaGlsZHJlbik7XG4gICAgdmFyIGN0cmwgPSB7XG4gICAgICBpbnN0YW5jZTogaW5zdGFuY2VcbiAgICB9O1xuICAgIGN0cmwub251bmxvYWQgPSBpbnN0YW5jZS5vbnVubG9hZC5iaW5kKGluc3RhbmNlLCBpbnN0YW5jZS5jb21wb25lbnRXaWxsVW5tb3VudCk7XG4gICAgaWYgKHR5cGUoaW5zdGFuY2UubmFtZSkgPT09ICdzdHJpbmcnKSB7XG4gICAgICBjdHJsLm5hbWUgPSBpbnN0YW5jZS5uYW1lO1xuICAgIH1cbiAgICByZXR1cm4gY3RybDtcbiAgfTtcblxuICBjb21wb25lbnQudmlldyA9IG1ha2VWaWV3KCk7XG4gIHJldHVybiBjb21wb25lbnQ7XG59XG5cbmZ1bmN0aW9uIG1peGluUHJvdG8ocHJvdG8sIG1peGlucykge1xuICB2YXIgbWl4aW47XG4gIGlmICh0eXBlKG1peGlucykgIT09ICdhcnJheScpIHtcbiAgICBtaXhpbnMgPSBzbGljZShhcmd1bWVudHMsIDEpO1xuICB9XG4gIG1peGlucyA9IG1peGlucy5maWx0ZXIoZnVuY3Rpb24gKG0pIHtcbiAgICByZXR1cm4gdHlwZShtKSA9PT0gJ29iamVjdCc7XG4gIH0pO1xuICB3aGlsZSAobWl4aW5zLmxlbmd0aCA+IDApIHtcbiAgICBtaXhpbiA9IG1peGlucy5zaGlmdCgpO1xuICAgIC8qZXNsaW50IG5vLWxvb3AtZnVuYzowKi9cbiAgICBPYmplY3Qua2V5cyhtaXhpbikuZm9yRWFjaChmdW5jdGlvbiAocHJvcE5hbWUpIHtcbiAgICAgIGlmIChwcm9wTmFtZSA9PT0gJ21peGlucycpIHtcbiAgICAgICAgbWl4aW5zID0gX2FkZFRvSGVhZChbXS5jb25jYXQobWl4aW5bcHJvcE5hbWVdKSwgbWl4aW5zKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGlnbm9yZVByb3BzLmluZGV4T2YocHJvcE5hbWUpICE9PSAtMSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoZXh0ZW5kTWV0aG9kcy5pbmRleE9mKHByb3BOYW1lKSAhPT0gLTEpIHtcbiAgICAgICAgaWYgKHR5cGUocHJvdG9bcHJvcE5hbWVdKSA9PT0gJ2FycmF5Jykge1xuICAgICAgICAgIHByb3RvW3Byb3BOYW1lXS5wdXNoKG1peGluW3Byb3BOYW1lXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcHJvdG9bcHJvcE5hbWVdID0gdHlwZShwcm90b1twcm9wTmFtZV0pID09PSAnZnVuY3Rpb24nID8gW3Byb3RvW3Byb3BOYW1lXSwgbWl4aW5bcHJvcE5hbWVdXSA6IFttaXhpbltwcm9wTmFtZV1dO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHByb3RvW3Byb3BOYW1lXSA9IG1peGluW3Byb3BOYW1lXTtcbiAgICB9KTtcbiAgfVxuXG4gIGV4dGVuZE1ldGhvZHMuZm9yRWFjaChmdW5jdGlvbiAobWV0aG9kTmFtZSkge1xuICAgIGlmICh0eXBlKHByb3RvW21ldGhvZE5hbWVdKSA9PT0gJ2FycmF5Jykge1xuICAgICAgdmFyIG1ldGhvZHMgPSBwcm90b1ttZXRob2ROYW1lXS5maWx0ZXIoZnVuY3Rpb24gKHApIHtcbiAgICAgICAgcmV0dXJuIHR5cGUocCkgPT09ICdmdW5jdGlvbic7XG4gICAgICB9KTtcbiAgICAgIHByb3RvW21ldGhvZE5hbWVdID0gX2NvbXBvc2UocGlwZWRNZXRob2RzLmluZGV4T2YobWV0aG9kTmFtZSkgIT09IC0xLCBtZXRob2RzKTtcbiAgICB9XG4gIH0pO1xufVxuZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50RmFjdG9yeShvcHRpb25zKSB7XG4gIHZhciBmYWN0b3J5ID0gZnVuY3Rpb24gQ29tcG9uZW50RmFjdG9yeSgpIHtcbiAgICBDb21wb25lbnQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBfYmluZE9uTWV0aG9kcyhmYWN0b3J5LnByb3RvdHlwZSwgdGhpcyk7XG4gIH0sXG4gICAgICBtaXhpbnM7XG4gIGZhY3RvcnkucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShDb21wb25lbnQucHJvdG90eXBlKTtcblxuICBtaXhpbnMgPSBvcHRpb25zLm1peGlucyB8fCBbXTtcbiAgZGVsZXRlIG9wdGlvbnMubWl4aW5zO1xuICBpZiAodHlwZShtaXhpbnMpID09PSAnYXJyYXknKSB7XG4gICAgbWl4aW5zID0gbWl4aW5zLmNvbmNhdChvcHRpb25zKTtcbiAgfSBlbHNlIHtcbiAgICBtaXhpbnMgPSBbbWl4aW5zLCBvcHRpb25zXTtcbiAgfVxuICBtaXhpblByb3RvKGZhY3RvcnkucHJvdG90eXBlLCBtaXhpbnMpO1xuICByZXR1cm4gZmFjdG9yeTtcbn1cblxuZnVuY3Rpb24gbWFrZVZpZXcoKSB7XG4gIHZhciBjYWNoZWRWYWx1ZSA9IHt9O1xuICAvLyBmYWN0b3J5ID0gY3JlYXRlQ29tcG9uZW50RmFjdG9yeShvcHRpb25zKTtcbiAgcmV0dXJuIGZ1bmN0aW9uIGNvbXBvbmVudFZpZXcoY3RybCwgcHJvcHMsIGNoaWxkcmVuKSB7XG4gICAgdmFyIGluc3RhbmNlID0gY3RybC5pbnN0YW5jZSxcbiAgICAgICAgb2xkUHJvcHMgPSBjYWNoZWRWYWx1ZS5wcm9wcyxcbiAgICAgICAgb2xkU3RhdGUgPSBjYWNoZWRWYWx1ZS5zdGF0ZSxcbiAgICAgICAgY29uZmlnID0gZnVuY3Rpb24gKG5vZGUsIGlzSW5pdGlhbGl6ZWQsIGNvbnRleHQsIGNhY2hlZCwgcmVkcmF3RGF0YSkge1xuICAgICAgX2V4ZWN1dGVGbihpbnN0YW5jZSwgJ3NldEludGVybmFsUHJvcHMnLCBub2RlLCBjYWNoZWQsIHJlZHJhd0RhdGEpO1xuICAgICAgaWYgKCFpc0luaXRpYWxpemVkKSB7XG4gICAgICAgIF9leGVjdXRlRm4oaW5zdGFuY2UsICdjb21wb25lbnREaWRNb3VudCcsIG5vZGUpO1xuICAgICAgICBpZiAodHlwZShpbnN0YW5jZS5jb21wb25lbnRXaWxsRGV0YWNoZWQpID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgY29udGV4dC5vbnVubG9hZCA9IGluc3RhbmNlLmNvbXBvbmVudFdpbGxEZXRhY2hlZC5iaW5kKGluc3RhbmNlLCBub2RlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgX2V4ZWN1dGVGbihpbnN0YW5jZSwgJ2NvbXBvbmVudERpZFVwZGF0ZScsIG5vZGUsIG9sZFByb3BzLCBvbGRTdGF0ZSk7XG4gICAgICB9XG4gICAgfTtcbiAgICAvL3VwZGF0ZVByb3BzXG4gICAgaW5zdGFuY2Uuc2V0UHJvcHMocHJvcHMsIGNoaWxkcmVuKTtcbiAgICAvL2NhY2hlIHByZXZpb3VzIGluc3RhbmNlXG4gICAgY2FjaGVkVmFsdWUucHJvcHMgPSBpbnN0YW5jZS5wcm9wcztcbiAgICBjYWNoZWRWYWx1ZS5zdGF0ZSA9IGluc3RhbmNlLnN0YXRlO1xuXG4gICAgaWYgKGluc3RhbmNlLnJvb3QgIT0gbnVsbCkge1xuICAgICAgaWYgKF9leGVjdXRlRm4oaW5zdGFuY2UsICdzaG91bGRDb21wb25lbnRVcGRhdGUnLCBvbGRQcm9wcywgb2xkU3RhdGUpID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm4geyBzdWJ0cmVlOiAncmV0YWluJyB9O1xuICAgICAgfVxuICAgICAgX2V4ZWN1dGVGbihpbnN0YW5jZSwgJ2NvbXBvbmVudFdpbGxVcGRhdGUnLCBpbnN0YW5jZS5yb290LCBvbGRQcm9wcywgb2xkU3RhdGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBfZXhlY3V0ZUZuKGluc3RhbmNlLCAnY29tcG9uZW50V2lsbE1vdW50Jywgb2xkUHJvcHMsIG9sZFN0YXRlKTtcbiAgICB9XG5cbiAgICB2YXIgcmVzdWx0VmlldyA9IF9leGVjdXRlRm4oaW5zdGFuY2UsICdyZW5kZXInLCBpbnN0YW5jZS5wcm9wcywgaW5zdGFuY2Uuc3RhdGUpO1xuICAgIHJlc3VsdFZpZXcuYXR0cnMgPSByZXN1bHRWaWV3LmF0dHJzIHx8IHt9O1xuICAgIHJlc3VsdFZpZXcuYXR0cnMuY29uZmlnID0gY29uZmlnO1xuXG4gICAgcmV0dXJuIHJlc3VsdFZpZXc7XG4gIH07XG59XG5cbi8vaGVwbGVyc1xuZnVuY3Rpb24gX2JpbmRPbk1ldGhvZHMocHJvdG8sIGNvbXBvbmVudCkge1xuICBPYmplY3Qua2V5cyhwcm90bykuZm9yRWFjaChmdW5jdGlvbiAocHJvcCkge1xuICAgIHZhciB2YWwgPSBwcm90b1twcm9wXTtcbiAgICBpZiAodHlwZSh2YWwpID09PSAnZnVuY3Rpb24nIHx8IC9eb25bQS1aXVxcdyovLnRlc3QocHJvcCkpIHtcbiAgICAgIGNvbXBvbmVudFtwcm9wXSA9IHZhbC5iaW5kKGNvbXBvbmVudCk7XG4gICAgfVxuICB9KTtcbn1cbmZ1bmN0aW9uIF9leGVjdXRlRm4ob2JqLCBtZXRob2ROYW1lKSB7XG4gIHZhciBhcmdzID0gc2xpY2UoYXJndW1lbnRzLCAyKTtcbiAgaWYgKHR5cGUob2JqW21ldGhvZE5hbWVdKSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBvYmpbbWV0aG9kTmFtZV0uYXBwbHkob2JqLCBhcmdzKTtcbiAgfVxufVxuZnVuY3Rpb24gX2FkZFRvSGVhZChhcnJUb0FkZCwgdGFyZ2V0QXJyKSB7XG4gIHZhciBpLFxuICAgICAgbCA9IGFyclRvQWRkLmxlbmd0aCxcbiAgICAgIGFycjtcbiAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgIGFyciA9IGFyclRvQWRkW2ldO1xuICAgIGlmICh0YXJnZXRBcnIuaW5kZXhPZihhcnIpID09PSAtMSkge1xuICAgICAgdGFyZ2V0QXJyLnVuc2hpZnQoYXJyKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRhcmdldEFycjtcbn1cbmZ1bmN0aW9uIF9jb21wb3NlKGlzUGlwZWQsIGZucykge1xuICByZXR1cm4gZnVuY3Rpb24gX2NvbXBvc2VkKCkge1xuICAgIHZhciBhcmdzID0gc2xpY2UoYXJndW1lbnRzLCAwKSxcbiAgICAgICAgc2VsZiA9IHRoaXMsXG4gICAgICAgIGkgPSAwLFxuICAgICAgICBsID0gZm5zLmxlbmd0aCxcbiAgICAgICAgZm4sXG4gICAgICAgIHJlc3VsdCA9IGFyZ3M7XG4gICAgZm9yICg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGZuID0gZm5zW2ldO1xuICAgICAgcmVzdWx0ID0gZm4uYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgICBhcmdzID0gaXNQaXBlZCA/IHJlc3VsdCA6IGFyZ3M7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG59IiwiaW1wb3J0IGNvbXBvbmVudCBmcm9tICcuL2NvbXBvbmVudCc7XG5pbXBvcnQgbW91bnQgZnJvbSAnLi9tb3VudCc7XG5pbXBvcnQgY3JlYXRlQ29tcG9uZW50IGZyb20gJy4vY3JlYXRlQ29tcG9uZW50JztcbmV4cG9ydCB7IGNvbXBvbmVudCwgbW91bnQsIGNyZWF0ZUNvbXBvbmVudCB9OyIsImltcG9ydCB7IHJlbmRlciwgbSB9IGZyb20gJy4vcmVuZGVyJztcbmltcG9ydCB7IHJlZHJhdyB9IGZyb20gJy4vdXBkYXRlJztcbmltcG9ydCB7IG1vdW50LCBjb21wb25lbnQsIGNyZWF0ZUNvbXBvbmVudCB9IGZyb20gJy4vbW91bnQnO1xuaW1wb3J0IHsgRyB9IGZyb20gJy4vZ2xvYmFscyc7XG5pbXBvcnQgeyBfZXh0ZW5kIH0gZnJvbSAnLi91dGlscyc7XG52YXIgbVJlYWN0ID0gbTtcblxubVJlYWN0LnJlbmRlciA9IHJlbmRlcjtcbm1SZWFjdC5yZWRyYXcgPSByZWRyYXc7XG5tUmVhY3QubW91bnQgPSBtb3VudDtcbm1SZWFjdC5jb21wb25lbnQgPSBjb21wb25lbnQ7XG5tUmVhY3QuY3JlYXRlQ29tcG9uZW50ID0gY3JlYXRlQ29tcG9uZW50O1xubVJlYWN0LmRvbURlbGVnYXRvciA9IEcuZG9tRGVsZWdhdG9yO1xuLy9bT2JqZWN0LmFzc2lnbl0gcG9seWZpbGxcbmlmICh0eXBlb2YgT2JqZWN0LmFzc2lnbiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgT2JqZWN0LmFzc2lnbiA9IF9leHRlbmQ7XG59XG5leHBvcnQgZGVmYXVsdCBtUmVhY3Q7Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLEVBQUEsU0FBUyxPQUFPOztBQUFoQixFQUVBLElBQUksVUFBVTtBQUZkLEVBR0EsU0FBUyxLQUFLLEdBQUc7QUFIakIsRUFJQSxFQUFFLElBQUksTUFBTSxNQUFNO0FBSmxCLEVBS0EsSUFBSSxPQUFPO0FBTFgsRUFNQTtBQU5BLEVBT0EsRUFBRSxJQUFJLE1BQU0sV0FBVztBQVB2QixFQVFBLElBQUksT0FBTztBQVJYLEVBU0E7QUFUQSxFQVVBLEVBQUUsSUFBSSxNQUFNLEdBQUc7QUFWZixFQVdBLElBQUksT0FBTztBQVhYLEVBWUE7QUFaQSxFQWFBLEVBQUUsSUFBSSxLQUFLLE9BQU8sVUFBVSxTQUFTLEtBQUssR0FBRyxNQUFNO0FBYm5ELEVBY0EsRUFBRSxPQUFPLE1BQU0sT0FBTyxZQUFZLEdBQUcsR0FBRztB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