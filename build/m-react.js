(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  global.mReact = factory()
}(this, function () { 'use strict';

  function NOOP() {};

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
  };

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
    if (inQEl === taskEl) return taskEl;
    var comparePosResult = inQEl.compareDocumentPosition(taskEl);
    if (comparePosResult & (16 | 8)) {
      return comparePosResult & 16 ? inQEl : taskEl;
    } else {
      return null;
    }
  }
  /*o ...*/ /*o ...*/

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
    while (match = tagReg.exec(tagStr)) {
      if (match[1] === '' && match[2]) vNode.tag = match[2];else if (match[1] === '#') vNode.attrs.id = match[2];else if (match[1] === '.') classes.push(match[2]);else if (match[3][0] === '[') {
        pair = attrReg.exec(match[3]);
        vNode.attrs[pair[1]] = pair[3] || (pair[2] ? '' : true);
      }
    }

    if (classes.length > 0) vNode.attrs[classAttrName] = classes.join(' ');

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
        for (i = list.length; i-- && !is(list[i], key);) {}
      } else {
        i = list.indexOf(key);
      }
      //update index
      this._index = i;
      return -1 < i;
    },
    clear: function () {
      this._keys.length = 0;
      this._values.length = 0;
      this._index = -1;
    },
    set: function (key, value) {
      this.has(key) ? this._values[this._index] = value : this._values[this._keys.push(key) - 1] = value;
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
      return -1 < i;
    },
    each: function (fn) {
      if (typeof fn !== 'function') return;
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
    all: ["altKey", "bubbles", "cancelable", "ctrlKey", "eventPhase", "metaKey", "relatedTarget", "shiftKey", "target", "timeStamp", "type", "view", "which"],
    mouse: ["button", "buttons", "clientX", "clientY", "layerX", "layerY", "offsetX", "offsetY", "pageX", "pageY", "screenX", "screenY", "toElement"],
    key: ["char", "charCode", "key", "keyCode"]
  };
  var rkeyEvent = /^key|input/;
  var rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/;

  function ProxyEvent(ev) {
    if (!this instanceof ProxyEvent) {
      return new ProxyEvent(ev);
    }
    this.init(ev);

    if (rkeyEvent.test(ev.type)) {
      synthesizeEvProps(this, ev, "key");
    } else if (rmouseEvent.test(ev.type)) {
      synthesizeEvProps(this, ev, "mouse");
    }
  }
  ProxyEvent.prototype = extend(ProxyEvent.prototype, {
    init: function (ev) {
      synthesizeEvProps(this, ev, "all");
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
    if (!evStore) return this;
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
      return;
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
      Object.keys(eventDispatchers).filter(function (evType) {
        var rtn = !!eventDispatchers[evType];
        if (rtn) {
          //force to call removeEventListener method
          eventDispatchers[evType] = 1;
        }
        return rtn;
      }).forEach(function (evType) {
        delegator.unlistenTo(evType);
      });
      return this;
    }
    if (!(evType in this.listenedEvents) || this.listenedEvents[evType] === 0) {
      console.log('[DOMDelegator unlistenTo]event "' + evType + '" is already unlistened!');
      return;
    }
    this.listenedEvents[evType]--;
    if (this.listenedEvents[evType] > 0) {
      return;
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
    if (idx !== -1) this._queue.splice(idx, 1);
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

  // import {gettersetter} from './utils';
  var globals__global = typeof window != 'undefined' ? window : {};
  var globals__document = globals__global.document;
  var globals__runtime = typeof process != 'undefined' && !process.browser ? 'nodejs' : typeof window != 'undefined' ? 'browser' : 'unknown';
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
        if (vNodes[i]) unload(vNodes[i]); // cleanup before dom is removed from dom tree
        clear__domDelegator.off(domNodes[i]);
        clear__domCacheMap.remove(domNodes[i]);
        try {
          domNodes[i].parentNode.removeChild(domNodes[i]);
        } catch (e) {} //ignore if this fails due to order of events (see http://stackoverflow.com/questions/21926083/failed-to-execute-removechild-on-node)
      }
    }
    if (domNodes.length != 0) domNodes.length = 0;
  }

  function unload(vNode) {
    if (vNode.configContext && type(vNode.configContext.onunload) === 'function') {
      vNode.configContext.onunload();
      vNode.configContext.onunload = null;
    }
    if (vNode.controllers) {
      for (var i = 0, controller = undefined; controller = vNode.controllers[i]; i++) {
        if (type(controller.onunload) === 'function') {
          controller.onunload({ preventDefault: NOOP });
          G.unloaders.remove(controller); //unload function should only execute once
        }
      }
    }
    if (vNode.children) {
      if (type(vNode.children) === 'array') {
        for (var i = 0, child = undefined; child = vNode.children[i]; i++) {
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
          if (attrName === 'config' || attrName == 'key') return;
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
                if (!(rule in dataAttr)) domNode.style[rule] = '';
              });
            }
          }
          //handle SVG
          else if (namespace != null) {
            if (attrName === 'href') domNode.setAttributeNS('http://www.w3.org/1999/xlink', 'href', dataAttr);else if (attrName === 'className') domNode.setAttribute('class', dataAttr);else domNode.setAttribute(attrName, dataAttr);
          }
          //handle cases that are properties (but ignore cases where we should use setAttribute instead)
          //- list and form are typically used as strings, but are DOM element references in js
          //- when using CSS selectors (e.g. `m("[style='']")`), style is used as a string, but it's an object in js
          else if (attrName in domNode && !(attrName === 'list' || attrName === 'style' || attrName === 'form' || attrName === 'type' || attrName === 'width' || attrName === 'height')) {
            //#348 don't set the value if not needed otherwise cursor placement breaks in Chrome
            if (tag !== 'input' || domNode[attrName] !== dataAttr) domNode[attrName] = dataAttr;
          } else domNode.setAttribute(attrName, dataAttr);
        } catch (e) {
          //swallow IE's invalid argument errors to mimic HTML's fallback-to-doing-nothing-on-invalid-attributes behavior
          if (e.message.indexOf('Invalid argument') < 0) throw e;
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
    if (data.subtree === 'retain') return cached;
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
    if (cached.tag) cached = {};
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
    if (shouldMaintainIdentities && _isKeysDiffer(data, cached)) {
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
      if (!node || !node.attrs) return;
      if (key === undefined) {
        delete node.attrs.key;
      } else {
        node.attrs.key = key;
      }
    }

    function _isKeysDiffer(data, cached) {
      if (data.length !== cached.length) return true;
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
        if (cached[i] != null) nodes.push.apply(nodes, cached[i].nodes);
      }
      //remove items from the end of the array if the new array is shorter than the old one
      //if errors ever happen here, the issue is most likely a bug in the construction of the `cached` data structure somewhere earlier in the program
      for (var i = 0, node = undefined; node = cached.nodes[i]; i++) {
        if (node.parentNode != null && nodes.indexOf(node) < 0) clear([node], [cached[i]]);
      }
      if (data.length < cached.length) cached.length = data.length;
      cached.nodes = nodes;
    }
    return cached;
    //helpers
    function _diffBuildItem(dataNode) {
      var item = build(parentElement, parentTag, cached, index, dataNode, cached[cacheCount], shouldReattach, index + subArrayCount || subArrayCount, editable, namespace, configs);
      if (item === undefined) return;
      if (!item.nodes.intact) intact = false;
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
        if (typeof component.cached === 'object') componentCache = component.cached;
        component.viewFn = [curView, controller];
      }

      var key = data && data.attrs && data.attrs.key;
      data = data.view(controller);
      if (data.subtree === 'retain') return componentCache ? componentCache : cached;
      if (key != null) {
        if (!data.attrs) data.attrs = {};
        data.attrs.key = key;
      }
      if (controller.onunload) G.unloaders.set(controller, controller.onunload);
      views.push(view);
      controllers.push(controller);
    }

    //the result of view function must be a sigle root vNode,
    //not a array or string
    if (!data.tag && controllers.length) throw new Error('Component template must return a virtual element, not an array, string, etc.');
    if (!data.attrs) data.attrs = {};
    if (componentCache != null) cached = componentCache;
    if (!cached.attrs) cached.attrs = {};
    //if an element is different enough from the one in cache, recreate it
    if (data.tag != cached.tag || !_hasSameKeys(data.attrs, cached.attrs) || data.attrs.id != cached.attrs.id || data.attrs.key != cached.attrs.key || type(componentName) === 'string' && cached.componentName != componentName) {
      if (cached.nodes.length) clear(cached.nodes, cached);
    }

    if (type(data.tag) !== 'string') return;

    var isNew = cached.nodes.length === 0,
        dataAttrKeys = Object.keys(data.attrs),
        hasKeys = dataAttrKeys.length > ('key' in data.attrs ? 1 : 0),
        domNode,
        newNodeIdx;
    if (data.attrs.xmlns) namespace = data.attrs.xmlns;else if (data.tag === 'svg') namespace = 'http://www.w3.org/2000/svg';else if (data.tag === 'math') namespace = 'http://www.w3.org/1998/Math/MathML';

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

      if (cached.children && !cached.children.nodes) cached.children.nodes = [];
      //edge case: setting value on <select> doesn't work before children exist, so set it again after children have been created
      if (data.tag === 'select' && 'value' in data.attrs) setAttributes(domNode, data.tag, { value: data.attrs.value }, {}, namespace);

      if (newNodeIdx != null) parentElement.insertBefore(domNode, parentElement.childNodes[newNodeIdx] || null);
    } else {
      domNode = cached.nodes[0];
      if (hasKeys) setAttributes(domNode, data.tag, data.attrs, cached.attrs, namespace);
      cached.children = build(domNode, data.tag, undefined, undefined, data.children, cached.children, false, 0, data.attrs.contenteditable ? domNode : editable, namespace, configs);
      cached.nodes.intact = true;
      if (controllers.length) {
        cached.views = views;
        cached.controllers = controllers;
      }
      if (shouldReattach === true && domNode != null) parentElement.insertBefore(domNode, parentElement.childNodes[index] || null);
    }
    if (type(componentName) === 'string') {
      cached.componentName = componentName;
    }
    //schedule configs to be called. They are called after `build` finishes running
    if (type(data.attrs.config) === 'function') {
      var context = cached.configContext = cached.configContext || {};

      // bind
      var callback = function (data, args) {
        return function () {
          return data.attrs.config.apply(data, args);
        };
      };
      configs.push(callback(data, [domNode, !isNew, context, cached, [parentElement, index, editable, namespace]]));
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
    if (data.attrs.is) domNode = namespace === undefined ? globals__document.createElement(data.tag, data.attrs.is) : globals__document.createElementNS(namespace, data.tag, data.attrs.is);else domNode = namespace === undefined ? globals__document.createElement(data.tag) : globals__document.createElementNS(namespace, data.tag);
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
      if (data == '') return cached;
      clear([parentElement.childNodes[index]]);
      if (data.$trusted) {
        nodes = injectHTML(parentElement, index, data);
      } else {
        nodes = [globals__document.createTextNode(data)];
        if (!parentElement.nodeName.match(VOID_ELEMENTS)) parentElement.insertBefore(nodes[0], parentElement.childNodes[index] || null);
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
          if (parentTag === 'textarea') parentElement.value = data;else if (editable) editable.innerHTML = data;else {
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
    } else cached.nodes.intact = true;
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
      if (html === undefined) html = globals__document.createElement('html');
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
    if (redrawing === true) return;
    redrawing = true;
    if (force === true) G.forcing = true;
    _updateRoots(force);
    redrawing = false;
  }

  ;
  function _updateRoots(force) {
    var root, component, controller, needRecreation, task;
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
          controller.instance.redraw = function componentRedraw() {
            renderQueue.addTarget({
              mergeType: 0, // contain
              processor: _render,
              root: root,
              params: [{
                root: root,
                vNode: component.view ? component.view(controller) : '',
                forceRecreation: false
              }]
            });
          };
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
      if (arguments.length > 1) args = args.concat(slice(arguments, 1));
      return component.view.apply(component, args.length ? [ctrl].concat(args) : [ctrl]);
    };
    view.$original = component.view;
    var output = { controller: controller, view: view };
    if (args[0] && args[0].key != null) output.attrs = { key: args[0].key };
    return output;
  }
  function componentize(component) {
    return parameterize(component, slice(arguments, 1));
  }

  var topComponent;
  function mount(root, component, forceRecreation) {
    if (!root) throw new Error('Please ensure the DOM element exists before rendering a template into it.');
    var index = G.roots.indexOf(root);
    if (index < 0) index = G.roots.length;

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
    } else G.unloaders.clear();

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

  ;

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
      if (typeof this.redrawData == null) return;
      var instance = this;

      G.renderQueue.addTarget({
        mergeType: 0, // contain
        processor: _build,
        root: instance.root,
        params: [instance]
      });
    };

    Component.prototype.setState = function setState(state, silence) {
      if (this.state == null) this.state = {};
      this.state = extend(this.state, state);
      if (!silence && globals__runtime === 'browser') {
        this.redraw();
      }
    };

    return Component;
  })();

  ;
  function _build(instance) {
    var viewFn = instance.viewFn;
    var data = viewFn[0](viewFn[1]);
    var _instance$redrawData = instance.redrawData;
    var parentElement = _instance$redrawData[0];
    var index = _instance$redrawData[1];
    var editable = _instance$redrawData[2];
    var namespace = _instance$redrawData[3];
    var configs = [];
    if (instance.props.key != null) {
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
        factory = createComponentFactory(options);
    component.controller = function (props, children) {
      var instance = new factory(props, children);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIi9ob21lL2p6aGVuZy9NeVdvcmtwbGFjZS9naXRodWJfcHJvanMvbS1yZWFjdC90bXAvdXRpbHMuanMiLCIvaG9tZS9qemhlbmcvTXlXb3JrcGxhY2UvZ2l0aHViX3Byb2pzL20tcmVhY3QvdG1wL3JlbmRlci9tLmpzIiwiL2hvbWUvanpoZW5nL015V29ya3BsYWNlL2dpdGh1Yl9wcm9qcy9tLXJlYWN0L3RtcC9zdG9yZS9tYXAuanMiLCIvaG9tZS9qemhlbmcvTXlXb3JrcGxhY2UvZ2l0aHViX3Byb2pzL20tcmVhY3QvdG1wL3N0b3JlL2luZGV4LmpzIiwiL2hvbWUvanpoZW5nL015V29ya3BsYWNlL2dpdGh1Yl9wcm9qcy9tLXJlYWN0L3RtcC9kb20tZGVsZWdhdG9yL2FkZEV2ZW50LmpzIiwiL2hvbWUvanpoZW5nL015V29ya3BsYWNlL2dpdGh1Yl9wcm9qcy9tLXJlYWN0L3RtcC9kb20tZGVsZWdhdG9yL3JlbW92ZUV2ZW50LmpzIiwiL2hvbWUvanpoZW5nL015V29ya3BsYWNlL2dpdGh1Yl9wcm9qcy9tLXJlYWN0L3RtcC9kb20tZGVsZWdhdG9yL3Byb3h5RXZlbnQuanMiLCIvaG9tZS9qemhlbmcvTXlXb3JrcGxhY2UvZ2l0aHViX3Byb2pzL20tcmVhY3QvdG1wL2RvbS1kZWxlZ2F0b3IvaW5kZXguanMiLCIvaG9tZS9qemhlbmcvTXlXb3JrcGxhY2UvZ2l0aHViX3Byb2pzL20tcmVhY3QvdG1wL3VwZGF0ZS9iYXRjaC5qcyIsIi9ob21lL2p6aGVuZy9NeVdvcmtwbGFjZS9naXRodWJfcHJvanMvbS1yZWFjdC90bXAvZ2xvYmFscy5qcyIsIi9ob21lL2p6aGVuZy9NeVdvcmtwbGFjZS9naXRodWJfcHJvanMvbS1yZWFjdC90bXAvdXBkYXRlL3JhZi5qcyIsIi9ob21lL2p6aGVuZy9NeVdvcmtwbGFjZS9naXRodWJfcHJvanMvbS1yZWFjdC90bXAvcmVuZGVyL2NsZWFyLmpzIiwiL2hvbWUvanpoZW5nL015V29ya3BsYWNlL2dpdGh1Yl9wcm9qcy9tLXJlYWN0L3RtcC9yZW5kZXIvc2V0QXR0cmlidXRlcy5qcyIsIi9ob21lL2p6aGVuZy9NeVdvcmtwbGFjZS9naXRodWJfcHJvanMvbS1yZWFjdC90bXAvcmVuZGVyL2J1aWxkLmpzIiwiL2hvbWUvanpoZW5nL015V29ya3BsYWNlL2dpdGh1Yl9wcm9qcy9tLXJlYWN0L3RtcC9yZW5kZXIvcmVuZGVyLmpzIiwiL2hvbWUvanpoZW5nL015V29ya3BsYWNlL2dpdGh1Yl9wcm9qcy9tLXJlYWN0L3RtcC9yZW5kZXIvaW5kZXguanMiLCIvaG9tZS9qemhlbmcvTXlXb3JrcGxhY2UvZ2l0aHViX3Byb2pzL20tcmVhY3QvdG1wL3VwZGF0ZS91cGRhdGUuanMiLCIvaG9tZS9qemhlbmcvTXlXb3JrcGxhY2UvZ2l0aHViX3Byb2pzL20tcmVhY3QvdG1wL3VwZGF0ZS9pbmRleC5qcyIsIi9ob21lL2p6aGVuZy9NeVdvcmtwbGFjZS9naXRodWJfcHJvanMvbS1yZWFjdC90bXAvbW91bnQvY29tcG9uZW50LmpzIiwiL2hvbWUvanpoZW5nL015V29ya3BsYWNlL2dpdGh1Yl9wcm9qcy9tLXJlYWN0L3RtcC9tb3VudC9tb3VudC5qcyIsIi9ob21lL2p6aGVuZy9NeVdvcmtwbGFjZS9naXRodWJfcHJvanMvbS1yZWFjdC90bXAvbW91bnQvY3JlYXRlQ29tcG9uZW50LmpzIiwiL2hvbWUvanpoZW5nL015V29ya3BsYWNlL2dpdGh1Yl9wcm9qcy9tLXJlYWN0L3RtcC9tb3VudC9pbmRleC5qcyIsIi9ob21lL2p6aGVuZy9NeVdvcmtwbGFjZS9naXRodWJfcHJvanMvbS1yZWFjdC90bXAvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IHsgTk9PUCwgdHlwZSwgc2xpY2UsIGhhc093biwgX2V4dGVuZCwgZXh0ZW5kLCByZW1vdmVWb2lkVmFsdWUsIHRvQXJyYXksIGdldEhhc2gsIG1hdGNoUmVnLCBnZXRQYXJlbnRFbEZyb20gfTtcblxuZnVuY3Rpb24gTk9PUCgpIHt9O1xuXG52YXIgdHlwZVJlZyA9IC9eXFxbb2JqZWN0IChcXHcrKVxcXSQvO1xuZnVuY3Rpb24gdHlwZShvKSB7XG4gIGlmIChvID09PSBudWxsKSB7XG4gICAgcmV0dXJuICdudWxsJztcbiAgfVxuICBpZiAobyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuICd1bmRlZmluZWQnO1xuICB9XG4gIGlmIChvICE9PSBvKSB7XG4gICAgcmV0dXJuICdOYU4nO1xuICB9XG4gIHZhciB0bSA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKS5tYXRjaCh0eXBlUmVnKTtcbiAgcmV0dXJuIHRtID09IG51bGwgPyAndW5rbm93bicgOiB0bVsxXS50b0xvd2VyQ2FzZSgpO1xufVxudmFyIF9zbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcbmZ1bmN0aW9uIHNsaWNlKCkge1xuICByZXR1cm4gX3NsaWNlLmFwcGx5KGFyZ3VtZW50c1swXSwgX3NsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG59O1xuXG5mdW5jdGlvbiBoYXNPd24obywgaykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG8sIGspO1xufVxuZnVuY3Rpb24gX2V4dGVuZCgpIHtcbiAgdmFyIGwgPSBhcmd1bWVudHMubGVuZ3RoLFxuICAgICAgaSA9IDAsXG4gICAgICBrLFxuICAgICAgbyxcbiAgICAgIHRhcmdldDtcbiAgd2hpbGUgKGkgPCBsKSB7XG4gICAgdGFyZ2V0ID0gYXJndW1lbnRzW2ldO1xuICAgIGlmICh0YXJnZXQgPT09IE9iamVjdCh0YXJnZXQpKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgaSsrO1xuICB9XG4gIGlmIChpID09PSBsKSB7XG4gICAgcmV0dXJuIHt9O1xuICB9XG5cbiAgaSsrO1xuICB3aGlsZSAoaSA8IGwpIHtcbiAgICBvID0gYXJndW1lbnRzW2krK107XG4gICAgaWYgKG8gIT09IE9iamVjdChvKSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGZvciAoayBpbiBvKSB7XG4gICAgICBpZiAoaGFzT3duKG8sIGspKSB7XG4gICAgICAgIHRhcmdldFtrXSA9IG9ba107XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiB0YXJnZXQ7XG59XG5mdW5jdGlvbiBleHRlbmQoKSB7XG4gIHZhciBhcmdzID0gc2xpY2UoYXJndW1lbnRzKTtcbiAgcmV0dXJuIF9leHRlbmQuYXBwbHkobnVsbCwgW3t9XS5jb25jYXQoYXJncykpO1xufVxuZnVuY3Rpb24gcmVtb3ZlVm9pZFZhbHVlKG8pIHtcbiAgaWYgKHR5cGUobykgIT09ICdvYmplY3QnKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignW3JlbW92ZVZvaWRWYWx1ZV1wYXJhbSBzaG91bGQgYmUgYSBvYmplY3QhIGdpdmVuOiAnICsgbyk7XG4gIH1cbiAgdmFyIHJlc3VsdCA9IHt9O1xuICBPYmplY3Qua2V5cyhvKS5mb3JFYWNoKGZ1bmN0aW9uIChrKSB7XG4gICAgaWYgKG9ba10gIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmVzdWx0W2tdID0gb1trXTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vL29ubHkgZmxhdHRlbiBvbmUgbGV2ZWwsIHNpbmNlIG90aGVyIGNhc2UgaXMgcmFyZVxuZnVuY3Rpb24gX2ZsYXR0ZW4oYSkge1xuICB2YXIgcmVzdWx0ID0gW10sXG4gICAgICBuZWVkRmxhdHRlbiA9IHRydWU7XG4gIGZvciAodmFyIGkgPSAwLCBsID0gYS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGFbaV07XG4gICAgaWYgKHR5cGUoaXRlbSkgPT09ICdhcnJheScpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGl0ZW0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZWVkRmxhdHRlbiA9IGZhbHNlO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIGlmIChuZWVkRmxhdHRlbiA9PT0gZmFsc2UgfHwgYS5sZW5ndGggPT09IDApIHtcbiAgICByZXN1bHQgPSBhO1xuICB9IGVsc2Uge1xuICAgIHJlc3VsdCA9IFtdLmNvbmNhdC5hcHBseShbXSwgcmVzdWx0KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiB0b0FycmF5KGEpIHtcbiAgc3dpdGNoICh0eXBlKGEpKSB7XG4gICAgY2FzZSAndW5kZWZpbmVkJzpcbiAgICBjYXNlICdudWxsJzpcbiAgICAgIHJldHVybiBbXTtcbiAgICBjYXNlICdhcnJheSc6XG4gICAgICByZXR1cm4gX2ZsYXR0ZW4oYSk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBbYV07XG4gIH1cbn1cbmZ1bmN0aW9uIGdldEhhc2goKSB7XG4gIHJldHVybiBPYmplY3QuY3JlYXRlKG51bGwpO1xufVxuZnVuY3Rpb24gbWF0Y2hSZWcoc3RyLCByZWcpIHtcbiAgaWYgKHR5cGUoc3RyKSAhPT0gJ3N0cmluZycgfHwgdHlwZShyZWcpICE9PSAncmVnZXhwJykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiBzdHIubWF0Y2gocmVnKTtcbn1cbi8vICpcbi8vICAqIGZ1bmN0aW9uIHRvIGV4dHJhY3QgdHdvIHR5cGVzIHJlbGF0aXZlIHRvIGJhdGNoIHVwZGF0ZSBhY3Rpdml0eS5cbi8vICAqIFRhc2tUeXBlIC0gaW5kaWNhdGUgdGhlIHdheSBvZiBoYW5kbGluZyB0aGUgY29ycmVzcG9uZGluZyB0YXNrLlxuLy8gICogICAgICAgICAgICB0eXBlIGJpdG1hc2soMCA9PiByZW5kZXI7IDEgPT4gcmVkcmF3KVxuLy8gICogTWVyZ2VUeXBlIC0gaW5kaWNhdGUgaG93IHRvIG1lcmdlIGN1cnJlbnQgdGFzayBpbnRvIHRoZSB0YXNrIHF1ZXVlLlxuLy8gICogICAgICAgICAgICB0eXBlIGJpdG1hc2soMCA9PiBjb250YWluOyAxID0+IHJlcGxhY2UpXG4vLyAgKiBAcGFyYW0gIHtbUG9zaXRpdmUgTnVtYmVyXX0gdE1hc2ssIHJlc3VsdCBvZiBiaXR3aXNlIG9wZXJhdGlvbiBvbiB0eXBlIGJpdG1hc2tcbi8vICAqIHNvLCAwID0+IFRhc2tUeXBlLnJlbmRlciB8IE1lcmdlVHlwZS5jb250YWluKDAwKVxuLy8gICogICAgIDEgPT4gVGFza1R5cGUucmVuZGVyIHwgTWVyZ2VUeXBlLnJlcGxhY2UoMDEpXG4vLyAgKiAgICAgMiA9PiBUYXNrVHlwZS5yZWRyYXcgfCBNZXJnZVR5cGUuY29udGFpbigxMClcbi8vICAqICAgICAzID0+IFRhc2tUeXBlLnJlZHJhdyB8IE1lcmdlVHlwZS5yZXBsYWNlKDExKVxuLy8gICogQHJldHVybiB7W3R5cGVzXX0gICAgICAgW3Rhc2tUeXBlLCBtZXJnZVR5cGVdXG5cbi8vIGZ1bmN0aW9uIGV4dHJhY3RUYXNrVHlwZXModE1hc2spe1xuLy8gICByZXR1cm4gWyh0TWFzayYyKT4+MSwgKHRNYXNrJjEpXTtcbi8vIH1cbi8vIHZhciBpc0FuY2VzdG9yT2YgPSAnY29tcGFyZURvY3VtZW50UG9zaXRpb24nIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCA/XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoZWwsIGNvbnRhaW5lcikge1xuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoY29udGFpbmVyLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKGVsKSYxNikgPT09IDE2IDtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgIH0gOlxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKGVsLCBjb250YWluZXIpIHtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXIgPSBjb250YWluZXIgPT09IGRvY3VtZW50IHx8IGNvbnRhaW5lciA9PT0gd2luZG93ID8gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IDogY29udGFpbmVyO1xuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjb250YWluZXIgIT09IGVsICYmIGNvbnRhaW5lci5jb250YWlucyhlbCk7XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuZnVuY3Rpb24gZ2V0UGFyZW50RWxGcm9tKGluUUVsLCB0YXNrRWwpIHtcbiAgaWYgKGluUUVsID09PSB0YXNrRWwpIHJldHVybiB0YXNrRWw7XG4gIHZhciBjb21wYXJlUG9zUmVzdWx0ID0gaW5RRWwuY29tcGFyZURvY3VtZW50UG9zaXRpb24odGFza0VsKTtcbiAgaWYgKGNvbXBhcmVQb3NSZXN1bHQgJiAoMTYgfCA4KSkge1xuICAgIHJldHVybiBjb21wYXJlUG9zUmVzdWx0ICYgMTYgPyBpblFFbCA6IHRhc2tFbDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuLypvIC4uLiovIC8qbyAuLi4qLyIsIlxuXG5leHBvcnQgZGVmYXVsdCBtO1xuXG5pbXBvcnQgeyBzbGljZSwgdHlwZSB9IGZyb20gJy4uL3V0aWxzJztcbnZhciB0YWdSZWcgPSAvKD86KF58I3xcXC4pKFteI1xcLlxcW1xcXV0rKSl8KFxcWy4rP1xcXSkvZyxcbiAgICBhdHRyUmVnID0gL1xcWyguKz8pKD86PShcInwnfCkoLio/KVxcMik/XFxdLztcbmZ1bmN0aW9uIG0oKSB7XG4gIHZhciB0YWdTdHIgPSBhcmd1bWVudHNbMF0sXG4gICAgICBhdHRycyA9IGFyZ3VtZW50c1sxXSxcbiAgICAgIGNoaWxkcmVuID0gc2xpY2UoYXJndW1lbnRzLCAyKTtcbiAgaWYgKHR5cGUodGFnU3RyKSAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlbGVjdG9yIGluIG0oc2VsZWN0b3IsIGF0dHJzLCBjaGlsZHJlbikgc2hvdWxkIGJlIGEgc3RyaW5nJyk7XG4gIH1cblxuICB2YXIgaGFzQXR0ciA9IGF0dHJzICE9IG51bGwgJiYgdHlwZShhdHRycykgPT09ICdvYmplY3QnICYmICEoJ3RhZycgaW4gYXR0cnMgfHwgJ3ZpZXcnIGluIGF0dHJzKSAmJiAhKCdzdWJ0cmVlJyBpbiBhdHRycyksXG4gICAgICB2Tm9kZSA9IHtcbiAgICB0YWc6ICdkaXYnLFxuICAgIGF0dHJzOiB7fVxuICB9LFxuICAgICAgbWF0Y2gsXG4gICAgICBwYWlyLFxuICAgICAgY2xhc3NBdHRyTmFtZSxcbiAgICAgIGNsYXNzZXMgPSBbXTtcbiAgLy9ub3JtYWxpemUgYXJndW1lbnRzXG4gIGF0dHJzID0gaGFzQXR0ciA/IGF0dHJzIDoge307XG4gIGNsYXNzQXR0ck5hbWUgPSAnY2xhc3MnIGluIGF0dHJzID8gJ2NsYXNzJyA6ICdjbGFzc05hbWUnO1xuICBjaGlsZHJlbiA9IGhhc0F0dHIgPyBjaGlsZHJlbiA6IHNsaWNlKGFyZ3VtZW50cywgMSk7XG4gIHZOb2RlLmNoaWxkcmVuID0gdHlwZShjaGlsZHJlblswXSkgPT09ICdhcnJheScgPyBjaGlsZHJlblswXSA6IGNoaWxkcmVuO1xuXG4gIC8vcGFyc2UgdGFnIHN0cmluZ1xuICB3aGlsZSAobWF0Y2ggPSB0YWdSZWcuZXhlYyh0YWdTdHIpKSB7XG4gICAgaWYgKG1hdGNoWzFdID09PSAnJyAmJiBtYXRjaFsyXSkgdk5vZGUudGFnID0gbWF0Y2hbMl07ZWxzZSBpZiAobWF0Y2hbMV0gPT09ICcjJykgdk5vZGUuYXR0cnMuaWQgPSBtYXRjaFsyXTtlbHNlIGlmIChtYXRjaFsxXSA9PT0gJy4nKSBjbGFzc2VzLnB1c2gobWF0Y2hbMl0pO2Vsc2UgaWYgKG1hdGNoWzNdWzBdID09PSAnWycpIHtcbiAgICAgIHBhaXIgPSBhdHRyUmVnLmV4ZWMobWF0Y2hbM10pO1xuICAgICAgdk5vZGUuYXR0cnNbcGFpclsxXV0gPSBwYWlyWzNdIHx8IChwYWlyWzJdID8gJycgOiB0cnVlKTtcbiAgICB9XG4gIH1cblxuICBpZiAoY2xhc3Nlcy5sZW5ndGggPiAwKSB2Tm9kZS5hdHRyc1tjbGFzc0F0dHJOYW1lXSA9IGNsYXNzZXMuam9pbignICcpO1xuXG4gIE9iamVjdC5rZXlzKGF0dHJzKS5mb3JFYWNoKGZ1bmN0aW9uIChhdHRyTmFtZSkge1xuICAgIHZhciBhdHRyVmFsID0gYXR0cnNbYXR0ck5hbWVdO1xuICAgIGlmIChhdHRyTmFtZSA9PT0gY2xhc3NBdHRyTmFtZSAmJiB0eXBlKGF0dHJWYWwpICE9PSAnc3RyaW5nJyAmJiBhdHRyVmFsLnRyaW0oKSAhPT0gJycpIHtcbiAgICAgIHZOb2RlLmF0dHJzW2F0dHJOYW1lXSA9ICh2Tm9kZS5hdHRyc1thdHRyTmFtZV0gfHwgJycpICsgJyAnICsgYXR0clZhbDtcbiAgICB9IGVsc2Uge1xuICAgICAgdk5vZGUuYXR0cnNbYXR0ck5hbWVdID0gYXR0clZhbDtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiB2Tm9kZTtcbn1cblxubS50cnVzdCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICB2YWx1ZSA9IG5ldyBTdHJpbmcodmFsdWUpO1xuICB2YWx1ZS4kdHJ1c3RlZCA9IHRydWU7XG4gIHJldHVybiB2YWx1ZTtcbn07IiwiZXhwb3J0IGRlZmF1bHQgTWFwO1xuXG5mdW5jdGlvbiBNYXAoKSB7XG4gIGlmICghdGhpcyBpbnN0YW5jZW9mIE1hcCkge1xuICAgIHJldHVybiBuZXcgTWFwKCk7XG4gIH1cbiAgdGhpcy5faW5kZXggPSAtMTtcbiAgdGhpcy5fa2V5cyA9IFtdO1xuICB0aGlzLl92YWx1ZXMgPSBbXTtcbn1cblxuTWFwLnByb3RvdHlwZSA9IHtcbiAgaGFzOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFsaWRhdGVLZXkoa2V5KTtcbiAgICB2YXIgbGlzdCA9IHRoaXMuX2tleXMsXG4gICAgICAgIGk7XG4gICAgaWYgKGtleSAhPSBrZXkgfHwga2V5ID09PSAwKSB7XG4gICAgICAvL05hTiBvciAwXG4gICAgICBmb3IgKGkgPSBsaXN0Lmxlbmd0aDsgaS0tICYmICFpcyhsaXN0W2ldLCBrZXkpOykge31cbiAgICB9IGVsc2Uge1xuICAgICAgaSA9IGxpc3QuaW5kZXhPZihrZXkpO1xuICAgIH1cbiAgICAvL3VwZGF0ZSBpbmRleFxuICAgIHRoaXMuX2luZGV4ID0gaTtcbiAgICByZXR1cm4gLTEgPCBpO1xuICB9LFxuICBjbGVhcjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuX2tleXMubGVuZ3RoID0gMDtcbiAgICB0aGlzLl92YWx1ZXMubGVuZ3RoID0gMDtcbiAgICB0aGlzLl9pbmRleCA9IC0xO1xuICB9LFxuICBzZXQ6IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgdGhpcy5oYXMoa2V5KSA/IHRoaXMuX3ZhbHVlc1t0aGlzLl9pbmRleF0gPSB2YWx1ZSA6IHRoaXMuX3ZhbHVlc1t0aGlzLl9rZXlzLnB1c2goa2V5KSAtIDFdID0gdmFsdWU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIGdldDogZnVuY3Rpb24gKGtleSwgZGVmYXVsdFZhbHVlKSB7XG4gICAgaWYgKHRoaXMuaGFzKGtleSkpIHtcbiAgICAgIHJldHVybiB0aGlzLl92YWx1ZXNbdGhpcy5faW5kZXhdO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgdGhpcy5zZXQoa2V5LCBkZWZhdWx0VmFsdWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICB9XG4gIH0sXG4gIHJlbW92ZTogZnVuY3Rpb24gKGtleSkge1xuICAgIHZhciBpID0gdGhpcy5faW5kZXg7XG4gICAgaWYgKHRoaXMuaGFzKGtleSkpIHtcbiAgICAgIHRoaXMuX2tleXMuc3BsaWNlKGksIDEpO1xuICAgICAgdGhpcy5fdmFsdWVzLnNwbGljZShpLCAxKTtcbiAgICB9XG4gICAgcmV0dXJuIC0xIDwgaTtcbiAgfSxcbiAgZWFjaDogZnVuY3Rpb24gKGZuKSB7XG4gICAgaWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuO1xuICAgIHZhciBpID0gMCxcbiAgICAgICAgbCA9IHRoaXMuX2tleXMubGVuZ3RoO1xuICAgIGZvciAoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBmbih0aGlzLl92YWx1ZXNbaV0sIHRoaXMuX2tleXNbaV0pO1xuICAgIH1cbiAgfVxufTtcbi8vZGV0ZWN0IE5hTi8wIGVxdWFsaXR5XG5mdW5jdGlvbiBpcyhhLCBiKSB7XG4gIHJldHVybiBpc05hTihhKSA/IGlzTmFOKGIpIDogYSA9PT0gYjtcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVLZXkoa2V5KSB7XG4gIGlmIChrZXkgIT09IE9iamVjdChrZXkpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignW01hcF1JbnZhbGlkIHZhbHVlIHVzZWQgYXMgYSBtYXAga2V5ISBnaXZlbjogJyArIGtleSk7XG4gIH1cbn0iLCJpbXBvcnQgTWFwIGZyb20gJy4vbWFwJztcbmV4cG9ydCB7IE1hcCB9OyIsIlxuZXhwb3J0IGRlZmF1bHQgYWRkRXZlbnRMaXN0ZW5lcjtcbi8vbGlzdGVuIGFsbCBldmVudCBhdCBjYXB0dXJlIHBoYXNlXG5cbmZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXIoZWwsIHR5cGUsIGhhbmRsZXIpIHtcbiAgcmV0dXJuIGVsLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgaGFuZGxlciwgdHJ1ZSk7XG59IiwiXG5leHBvcnQgZGVmYXVsdCByZW1vdmVFdmVudExpc3RlbmVyO1xuLy9saXN0ZW4gYWxsIGV2ZW50IGF0IGNhcHR1cmUgcGhhc2VcblxuZnVuY3Rpb24gcmVtb3ZlRXZlbnRMaXN0ZW5lcihlbCwgdHlwZSwgaGFuZGxlcikge1xuICByZXR1cm4gZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBoYW5kbGVyLCB0cnVlKTtcbn0iLCJcbmltcG9ydCB7IGV4dGVuZCB9IGZyb20gXCIuLi91dGlsc1wiO1xudmFyIEVWX1BST1BTID0ge1xuICBhbGw6IFtcImFsdEtleVwiLCBcImJ1YmJsZXNcIiwgXCJjYW5jZWxhYmxlXCIsIFwiY3RybEtleVwiLCBcImV2ZW50UGhhc2VcIiwgXCJtZXRhS2V5XCIsIFwicmVsYXRlZFRhcmdldFwiLCBcInNoaWZ0S2V5XCIsIFwidGFyZ2V0XCIsIFwidGltZVN0YW1wXCIsIFwidHlwZVwiLCBcInZpZXdcIiwgXCJ3aGljaFwiXSxcbiAgbW91c2U6IFtcImJ1dHRvblwiLCBcImJ1dHRvbnNcIiwgXCJjbGllbnRYXCIsIFwiY2xpZW50WVwiLCBcImxheWVyWFwiLCBcImxheWVyWVwiLCBcIm9mZnNldFhcIiwgXCJvZmZzZXRZXCIsIFwicGFnZVhcIiwgXCJwYWdlWVwiLCBcInNjcmVlblhcIiwgXCJzY3JlZW5ZXCIsIFwidG9FbGVtZW50XCJdLFxuICBrZXk6IFtcImNoYXJcIiwgXCJjaGFyQ29kZVwiLCBcImtleVwiLCBcImtleUNvZGVcIl1cbn07XG52YXIgcmtleUV2ZW50ID0gL15rZXl8aW5wdXQvO1xudmFyIHJtb3VzZUV2ZW50ID0gL14oPzptb3VzZXxwb2ludGVyfGNvbnRleHRtZW51KXxjbGljay87ZXhwb3J0IGRlZmF1bHQgUHJveHlFdmVudDtcblxuZnVuY3Rpb24gUHJveHlFdmVudChldikge1xuICBpZiAoIXRoaXMgaW5zdGFuY2VvZiBQcm94eUV2ZW50KSB7XG4gICAgcmV0dXJuIG5ldyBQcm94eUV2ZW50KGV2KTtcbiAgfVxuICB0aGlzLmluaXQoZXYpO1xuXG4gIGlmIChya2V5RXZlbnQudGVzdChldi50eXBlKSkge1xuICAgIHN5bnRoZXNpemVFdlByb3BzKHRoaXMsIGV2LCBcImtleVwiKTtcbiAgfSBlbHNlIGlmIChybW91c2VFdmVudC50ZXN0KGV2LnR5cGUpKSB7XG4gICAgc3ludGhlc2l6ZUV2UHJvcHModGhpcywgZXYsIFwibW91c2VcIik7XG4gIH1cbn1cblByb3h5RXZlbnQucHJvdG90eXBlID0gZXh0ZW5kKFByb3h5RXZlbnQucHJvdG90eXBlLCB7XG4gIGluaXQ6IGZ1bmN0aW9uIChldikge1xuICAgIHN5bnRoZXNpemVFdlByb3BzKHRoaXMsIGV2LCBcImFsbFwiKTtcbiAgICB0aGlzLm9yaWdpbmFsRXZlbnQgPSBldjtcbiAgICB0aGlzLl9idWJibGVzID0gZmFsc2U7XG4gIH0sXG4gIHByZXZlbnREZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMub3JpZ2luYWxFdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICB9LFxuICBzdGFydFByb3BhZ2F0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5fYnViYmxlcyA9IHRydWU7XG4gIH1cbn0pO1xuXG5mdW5jdGlvbiBzeW50aGVzaXplRXZQcm9wcyhwcm94eSwgZXYsIGNhdGVnb3J5KSB7XG4gIHZhciBldlByb3BzID0gRVZfUFJPUFNbY2F0ZWdvcnldO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IGV2UHJvcHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgdmFyIHByb3AgPSBldlByb3BzW2ldO1xuICAgIHByb3h5W3Byb3BdID0gZXZbcHJvcF07XG4gIH1cbn0iLCJcblxuZXhwb3J0IGRlZmF1bHQgRE9NRGVsZWdhdG9yO1xuLyoqXG4gKiBkb20tZGVsZWdhdG9yZSBhbGxvd3MgeW91IHRvIGF0dGFjaCBhbiBFdmVudEhhbmRsZXIgdG8gYSBkb20gZWxlbWVudC5cbiAqIFdoZW4gdGhlIGNvcnJlY3QgZXZlbnQgb2NjdXJzLCBkb20tZGVsZWdhdG9yIHdpbGwgbGV0IHRoZSBnbG9iYWwgZGVsZWdhdGVcbiAqIGV2ZW50SGFuZGxlciB0byBoYW5kbGUgdGhlIGV2ZW50IGFuZCB0cmlnZ2VyIHlvdXIgYXR0YWNoZWQgRXZlbnRIYW5kbGVyLlxuICovXG5pbXBvcnQgeyBkb2N1bWVudCBhcyAkZG9jdW1lbnQgfSBmcm9tICcuLi9nbG9iYWxzJztcblxuaW1wb3J0IGFkZEV2ZW50TGlzdGVuZXIgZnJvbSAnLi9hZGRFdmVudCc7XG5pbXBvcnQgcmVtb3ZlRXZlbnRMaXN0ZW5lciBmcm9tICcuL3JlbW92ZUV2ZW50JztcbmltcG9ydCBQcm94eUV2ZW50IGZyb20gJy4vcHJveHlFdmVudCc7XG5pbXBvcnQgeyB0eXBlLCBnZXRIYXNoIH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHsgTWFwIH0gZnJvbSAnLi4vc3RvcmUnO1xuZnVuY3Rpb24gRE9NRGVsZWdhdG9yKGRvYykge1xuICBpZiAoIXRoaXMgaW5zdGFuY2VvZiBET01EZWxlZ2F0b3IpIHtcbiAgICByZXR1cm4gbmV3IERPTURlbGVnYXRvcihkb2MpO1xuICB9XG5cbiAgZG9jID0gZG9jIHx8ICRkb2N1bWVudCB8fCB7IGRvY3VtZW50RWxlbWVudDogMSB9OyAvL2VuYWJsZSB0byBydW4gaW4gbm9kZWpzO1xuICBpZiAoIWRvYy5kb2N1bWVudEVsZW1lbnQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1tET01EZWxlZ2F0b3JdSW52YWxpZCBwYXJhbWV0ZXIgXCJkb2NcIiwgc2hvdWxkIGJlIGEgZG9jdW1lbnQgb2JqZWN0ISBnaXZlbjogJyArIGRvYyk7XG4gIH1cbiAgdGhpcy5yb290ID0gZG9jLmRvY3VtZW50RWxlbWVudDtcbiAgdGhpcy5saXN0ZW5lZEV2ZW50cyA9IGdldEhhc2goKTtcbiAgdGhpcy5ldmVudERpc3BhdGNoZXJzID0gZ2V0SGFzaCgpO1xuICB0aGlzLmdsb2JhbExpc3RlbmVycyA9IGdldEhhc2goKTtcbiAgdGhpcy5kb21FdkhhbmRsZXJNYXAgPSBuZXcgTWFwKCk7XG59XG5cbnZhciBwcm90byA9IERPTURlbGVnYXRvci5wcm90b3R5cGU7XG5cbnByb3RvLm9uID0gZnVuY3Rpb24gb24oZWwsIGV2VHlwZSwgaGFuZGxlcikge1xuICB2YXIgZXZTdG9yZSA9IGdldEV2U3RvcmUodGhpcy5kb21FdkhhbmRsZXJNYXAsIGVsLCBnZXRIYXNoKCkpO1xuICBhZGRMaXN0ZW5lcihldlN0b3JlLCBldlR5cGUsIHRoaXMsIGhhbmRsZXIpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbnByb3RvLm9mZiA9IGZ1bmN0aW9uIG9mZihlbCwgZXZUeXBlLCBoYW5kbGVyKSB7XG4gIHZhciBldlN0b3JlID0gZ2V0RXZTdG9yZSh0aGlzLmRvbUV2SGFuZGxlck1hcCwgZWwpO1xuICBpZiAoIWV2U3RvcmUpIHJldHVybiB0aGlzO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAzKSB7XG4gICAgcmVtb3ZlTGlzdGVuZXIoZXZTdG9yZSwgZXZUeXBlLCB0aGlzLCBoYW5kbGVyKTtcbiAgfSBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgcmVtb3ZlTGlzdGVuZXIoZXZTdG9yZSwgZXZUeXBlLCB0aGlzKTtcbiAgfSBlbHNlIHtcbiAgICByZW1vdmVBbGxMaXN0ZW5lcihldlN0b3JlLCB0aGlzKTtcbiAgfVxuXG4gIGlmIChPYmplY3Qua2V5cyhldlN0b3JlKS5sZW5ndGggPT09IDApIHtcbiAgICB0aGlzLmRvbUV2SGFuZGxlck1hcC5yZW1vdmUoZWwpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxucHJvdG8uYWRkR2xvYmFsRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uIGFkZEdsb2JhbEV2ZW50TGlzdGVuZXIoZXZUeXBlLCBoYW5kbGVyKSB7XG4gIGFkZExpc3RlbmVyKHRoaXMuZ2xvYmFsTGlzdGVuZXJzLCBldlR5cGUsIHRoaXMsIGhhbmRsZXIpO1xuICByZXR1cm4gdGhpcztcbn07XG5wcm90by5yZW1vdmVHbG9iYWxFdmVudExpc3RlbmVyID0gZnVuY3Rpb24gcmVtb3ZlR2xvYmFsRXZlbnRMaXN0ZW5lcihldlR5cGUsIGhhbmRsZXIpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMikge1xuICAgIHJlbW92ZUxpc3RlbmVyKHRoaXMuZ2xvYmFsTGlzdGVuZXJzLCBldlR5cGUsIHRoaXMsIGhhbmRsZXIpO1xuICB9IGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICByZW1vdmVMaXN0ZW5lcih0aGlzLmdsb2JhbExpc3RlbmVycywgZXZUeXBlLCB0aGlzKTtcbiAgfSBlbHNlIHtcbiAgICByZW1vdmVBbGxMaXN0ZW5lcih0aGlzLmdsb2JhbExpc3RlbmVycywgdGhpcyk7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5wcm90by5kZXN0cm95ID0gZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgdGhpcy51bmxpc3RlblRvKCk7XG4gIHRoaXMubGlzdGVuZWRFdmVudHMgPSBudWxsO1xuICB0aGlzLmV2ZW50RGlzcGF0Y2hlcnMgPSBudWxsO1xuICB0aGlzLmdsb2JhbExpc3RlbmVycyA9IG51bGw7XG4gIHRoaXMuZG9tRXZIYW5kbGVyTWFwLmNsZWFyKCk7XG59O1xuXG4vL2ZvciBlYWNoIGV2VHlwZSwgaW5jcmVhc2UgYnkgMSBpZiB0aGVyZSBpcyBhIG5ldyBlbCBzdGFydCB0byBsaXN0ZW5cbi8vIHRvIHRoaXMgdHlwZSBvZiBldmVudFxucHJvdG8ubGlzdGVuVG8gPSBmdW5jdGlvbiBsaXN0ZW5UbyhldlR5cGUpIHtcbiAgaWYgKCEoZXZUeXBlIGluIHRoaXMubGlzdGVuZWRFdmVudHMpKSB7XG4gICAgdGhpcy5saXN0ZW5lZEV2ZW50c1tldlR5cGVdID0gMDtcbiAgfVxuICB0aGlzLmxpc3RlbmVkRXZlbnRzW2V2VHlwZV0rKztcblxuICBpZiAodGhpcy5saXN0ZW5lZEV2ZW50c1tldlR5cGVdICE9PSAxKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBsaXN0ZW5lciA9IHRoaXMuZXZlbnREaXNwYXRjaGVyc1tldlR5cGVdO1xuICBpZiAoIWxpc3RlbmVyKSB7XG4gICAgbGlzdGVuZXIgPSB0aGlzLmV2ZW50RGlzcGF0Y2hlcnNbZXZUeXBlXSA9IGNyZWF0ZURpc3BhdGNoZXIoZXZUeXBlLCB0aGlzKTtcbiAgfVxuICBhZGRFdmVudExpc3RlbmVyKHRoaXMucm9vdCwgZXZUeXBlLCBsaXN0ZW5lcik7XG4gIHJldHVybiB0aGlzO1xufTtcbi8vZm9yIGVhY2ggZXZUeXBlLCBkZWNyZWFzZSBieSAxIGlmIHRoZXJlIGlzIGEgZWwgc3RvcCB0byBsaXN0ZW5cbi8vIHRvIHRoaXMgdHlwZSBvZiBldmVudFxucHJvdG8udW5saXN0ZW5UbyA9IGZ1bmN0aW9uIHVubGlzdGVuVG8oZXZUeXBlKSB7XG4gIHZhciBldmVudERpc3BhdGNoZXJzID0gdGhpcy5ldmVudERpc3BhdGNoZXJzLFxuICAgICAgZGVsZWdhdG9yID0gdGhpcztcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAvL3JlbW92ZSBhbGwgZGlzcGF0Y2ggbGlzdGVuZXJzXG4gICAgT2JqZWN0LmtleXMoZXZlbnREaXNwYXRjaGVycykuZmlsdGVyKGZ1bmN0aW9uIChldlR5cGUpIHtcbiAgICAgIHZhciBydG4gPSAhIWV2ZW50RGlzcGF0Y2hlcnNbZXZUeXBlXTtcbiAgICAgIGlmIChydG4pIHtcbiAgICAgICAgLy9mb3JjZSB0byBjYWxsIHJlbW92ZUV2ZW50TGlzdGVuZXIgbWV0aG9kXG4gICAgICAgIGV2ZW50RGlzcGF0Y2hlcnNbZXZUeXBlXSA9IDE7XG4gICAgICB9XG4gICAgICByZXR1cm4gcnRuO1xuICAgIH0pLmZvckVhY2goZnVuY3Rpb24gKGV2VHlwZSkge1xuICAgICAgZGVsZWdhdG9yLnVubGlzdGVuVG8oZXZUeXBlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBpZiAoIShldlR5cGUgaW4gdGhpcy5saXN0ZW5lZEV2ZW50cykgfHwgdGhpcy5saXN0ZW5lZEV2ZW50c1tldlR5cGVdID09PSAwKSB7XG4gICAgY29uc29sZS5sb2coJ1tET01EZWxlZ2F0b3IgdW5saXN0ZW5Ub11ldmVudCBcIicgKyBldlR5cGUgKyAnXCIgaXMgYWxyZWFkeSB1bmxpc3RlbmVkIScpO1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLmxpc3RlbmVkRXZlbnRzW2V2VHlwZV0tLTtcbiAgaWYgKHRoaXMubGlzdGVuZWRFdmVudHNbZXZUeXBlXSA+IDApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGxpc3RlbmVyID0gdGhpcy5ldmVudERpc3BhdGNoZXJzW2V2VHlwZV07XG4gIGlmICghbGlzdGVuZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1tET01EZWxlZ2F0b3IgdW5saXN0ZW5Ub106IGNhbm5vdCAnICsgJ3VubGlzdGVuIHRvICcgKyBldlR5cGUpO1xuICB9XG4gIHJlbW92ZUV2ZW50TGlzdGVuZXIodGhpcy5yb290LCBldlR5cGUsIGxpc3RlbmVyKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5mdW5jdGlvbiBjcmVhdGVEaXNwYXRjaGVyKGV2VHlwZSwgZGVsZWdhdG9yKSB7XG4gIHZhciBnbG9iYWxMaXN0ZW5lcnMgPSBkZWxlZ2F0b3IuZ2xvYmFsTGlzdGVuZXJzLFxuICAgICAgZGVsZWdhdG9yUm9vdCA9IGRlbGVnYXRvci5yb290O1xuICByZXR1cm4gZnVuY3Rpb24gZGlzcGF0Y2hlcihldikge1xuICAgIHZhciBnbG9iYWxIYW5kbGVycyA9IGdsb2JhbExpc3RlbmVyc1tldlR5cGVdIHx8IFtdO1xuICAgIGlmIChnbG9iYWxIYW5kbGVycyAmJiBnbG9iYWxIYW5kbGVycy5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgZ2xvYmFsRXZlbnQgPSBuZXcgUHJveHlFdmVudChldik7XG4gICAgICBnbG9iYWxFdmVudC50YXJnZXQgPSBkZWxlZ2F0b3JSb290O1xuICAgICAgY2FsbExpc3RlbmVycyhnbG9iYWxIYW5kbGVycywgZ2xvYmFsRXZlbnQpO1xuICAgIH1cblxuICAgIGZpbmRBbmRJbnZva2VMaXN0ZW5lcnMoZXYudGFyZ2V0LCBldiwgZXZUeXBlLCBkZWxlZ2F0b3IpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBmaW5kQW5kSW52b2tlTGlzdGVuZXJzKGVsLCBldiwgZXZUeXBlLCBkZWxlZ2F0b3IpIHtcbiAgdmFyIGxpc3RlbmVyID0gZ2V0TGlzdGVuZXIoZWwsIGV2VHlwZSwgZGVsZWdhdG9yKTtcbiAgaWYgKGxpc3RlbmVyICYmIGxpc3RlbmVyLmhhbmRsZXJzLmxlbmd0aCA+IDApIHtcbiAgICB2YXIgbGlzdGVuZXJFdmVudCA9IG5ldyBQcm94eUV2ZW50KGV2KTtcbiAgICBsaXN0ZW5lckV2ZW50LmN1cnJlbnRUYXJnZXQgPSBsaXN0ZW5lci5jdXJyZW50VGFyZ2V0O1xuICAgIGNhbGxMaXN0ZW5lcnMobGlzdGVuZXIuaGFuZGxlcnMsIGxpc3RlbmVyRXZlbnQpO1xuICAgIGlmIChsaXN0ZW5lckV2ZW50Ll9idWJibGVzKSB7XG4gICAgICBmaW5kQW5kSW52b2tlTGlzdGVuZXJzKGxpc3RlbmVyLmN1cnJlbnRUYXJnZXQucGFyZW50Tm9kZSwgZXYsIGV2VHlwZSwgZGVsZWdhdG9yKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0TGlzdGVuZXIodGFyZ2V0LCBldlR5cGUsIGRlbGVnYXRvcikge1xuICBpZiAodGFyZ2V0ID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2YXIgZXZTdG9yZSA9IGdldEV2U3RvcmUoZGVsZWdhdG9yLmRvbUV2SGFuZGxlck1hcCwgdGFyZ2V0KSxcbiAgICAgIGhhbmRsZXJzO1xuICBpZiAoIWV2U3RvcmUgfHwgIShoYW5kbGVycyA9IGV2U3RvcmVbZXZUeXBlXSkgfHwgaGFuZGxlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIGdldExpc3RlbmVyKHRhcmdldC5wYXJlbnROb2RlLCBldlR5cGUsIGRlbGVnYXRvcik7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBjdXJyZW50VGFyZ2V0OiB0YXJnZXQsXG4gICAgaGFuZGxlcnM6IGhhbmRsZXJzXG4gIH07XG59XG5cbmZ1bmN0aW9uIGNhbGxMaXN0ZW5lcnMoaGFuZGxlcnMsIGV2KSB7XG4gIGhhbmRsZXJzLmZvckVhY2goZnVuY3Rpb24gKGhhbmRsZXIpIHtcbiAgICBpZiAodHlwZShoYW5kbGVyKSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgaGFuZGxlcihldik7XG4gICAgfSBlbHNlIGlmICh0eXBlKGhhbmRsZXIuaGFuZGxlRXZlbnQpID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBoYW5kbGVyLmhhbmRsZUV2ZW50KGV2KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdbRE9NRGVsZWdhdG9yIGNhbGxMaXN0ZW5lcnNdIHVua25vd24gaGFuZGxlciAnICsgJ2ZvdW5kOiAnICsgSlNPTi5zdHJpbmdpZnkoaGFuZGxlcnMpKTtcbiAgICB9XG4gIH0pO1xufVxuLy9oZWxwZXJzXG5mdW5jdGlvbiBnZXRFdlN0b3JlKG1hcCwgZWwsIGRlZmF1bHRTdG9yZSkge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA+IDIgPyBtYXAuZ2V0KGVsLCBkZWZhdWx0U3RvcmUpIDogbWFwLmdldChlbCk7XG59XG5cbmZ1bmN0aW9uIGFkZExpc3RlbmVyKGV2SGFzaCwgZXZUeXBlLCBkZWxlZ2F0b3IsIGhhbmRsZXIpIHtcbiAgdmFyIGhhbmRsZXJzID0gZXZIYXNoW2V2VHlwZV0gfHwgW107XG4gIGlmIChoYW5kbGVycy5sZW5ndGggPT09IDApIHtcbiAgICAvL2l0J3MgZmlyc3QgdGltZSBmb3IgdGhpcyBlbCB0byBsaXN0ZW4gdG8gZXZlbnQgb2YgZXZUeXBlXG4gICAgZGVsZWdhdG9yLmxpc3RlblRvKGV2VHlwZSk7XG4gIH1cbiAgaWYgKGhhbmRsZXJzLmluZGV4T2YoaGFuZGxlcikgPT09IC0xKSB7XG4gICAgaGFuZGxlcnMucHVzaChoYW5kbGVyKTtcbiAgfVxuICBldkhhc2hbZXZUeXBlXSA9IGhhbmRsZXJzO1xuICByZXR1cm4gaGFuZGxlcjtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIoZXZIYXNoLCBldlR5cGUsIGRlbGVnYXRvciwgaGFuZGxlcikge1xuICB2YXIgaGFuZGxlcnMgPSBldkhhc2hbZXZUeXBlXTtcbiAgaWYgKCFoYW5kbGVycyB8fCBoYW5kbGVycy5sZW5ndGggPT09IDAgfHwgYXJndW1lbnRzLmxlbmd0aCA9PT0gMykge1xuICAgIGlmIChoYW5kbGVycyAmJiBoYW5kbGVycy5sZW5ndGgpIHtcbiAgICAgIC8vdGhpcyBlbCBzdG9wIHRvIGxpc3RlbiB0byBldmVudCBvZiBldlR5cGVcbiAgICAgIGRlbGVnYXRvci51bmxpc3RlblRvKGV2VHlwZSk7XG4gICAgfVxuICAgIGRlbGV0ZSBldkhhc2hbZXZUeXBlXTtcbiAgICByZXR1cm4gaGFuZGxlcjtcbiAgfVxuICB2YXIgaW5kZXggPSBoYW5kbGVycy5pbmRleE9mKGhhbmRsZXIpO1xuICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgaGFuZGxlcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgfVxuICBldkhhc2hbZXZUeXBlXSA9IGhhbmRsZXJzO1xuICBpZiAoaGFuZGxlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgLy90aGlzIGVsIHN0b3AgdG8gbGlzdGVuIHRvIGV2ZW50IG9mIGV2VHlwZVxuICAgIGRlbGVnYXRvci51bmxpc3RlblRvKGV2VHlwZSk7XG4gICAgZGVsZXRlIGV2SGFzaFtldlR5cGVdO1xuICB9XG4gIHJldHVybiBoYW5kbGVyO1xufVxuXG5mdW5jdGlvbiByZW1vdmVBbGxMaXN0ZW5lcihldkhhc2gsIGRlbGVnYXRvcikge1xuICBPYmplY3Qua2V5cyhldkhhc2gpLmZvckVhY2goZnVuY3Rpb24gKGV2VHlwZSkge1xuICAgIHJlbW92ZUxpc3RlbmVyKGV2SGFzaCwgZXZUeXBlLCBkZWxlZ2F0b3IpO1xuICB9KTtcbiAgcmV0dXJuIGV2SGFzaDtcbn0iLCJpbXBvcnQgeyByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgYXMgcmFmLCBjYW5jZWxBbmltYXRpb25GcmFtZSBhcyBjYW5jZWxSYWYsIEZSQU1FX0JVREdFVCB9IGZyb20gJy4vcmFmJztcbmltcG9ydCB7IHR5cGUsIE5PT1AgfSBmcm9tICcuLi91dGlscyc7XG5mdW5jdGlvbiBCYXRjaChvcHRzKSB7XG4gIHRoaXMub3B0aW9ucyA9IG9wdHMgfHwge307XG4gIHZhciBjYiA9IHRoaXMub3B0aW9ucy5vbkZsdXNoO1xuICB0aGlzLl9jYiA9IHR5cGUoY2IpID09PSAnZnVuY3Rpb24nID8gY2IgOiBOT09QO1xuICB0aGlzLl9xdWV1ZSA9IFtdO1xuICB0aGlzLl9zdGFydFBvcyA9IDA7XG4gIHRoaXMuZmx1c2ggPSB0aGlzLmZsdXNoLmJpbmQodGhpcyk7XG59XG5CYXRjaC5wcm90b3R5cGUuYWRkVGFyZ2V0ID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICB2YXIgb2xkTGVuID0gdGhpcy5fcXVldWUubGVuZ3RoO1xuICBpZiAodHlwZSh0aGlzLm9wdGlvbnMub25BZGRUYXJnZXQpID09PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhpcy5fcXVldWUgPSB0aGlzLm9wdGlvbnMub25BZGRUYXJnZXQuY2FsbCh0aGlzLCB0aGlzLl9xdWV1ZSwgdGFyZ2V0KTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLl9xdWV1ZS5wdXNoKHRhcmdldCk7XG4gIH1cblxuICBpZiAob2xkTGVuID09PSAwICYmIHRoaXMuX3F1ZXVlLmxlbmd0aCA9PT0gMSkge1xuICAgIHRoaXMuc2NoZWR1bGVGbHVzaCgpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcbkJhdGNoLnByb3RvdHlwZS5yZW1vdmVUYXJnZXQgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gIHZhciBpZHggPSB0aGlzLl9xdWV1ZS5pbmRleE9mKHRhcmdldCk7XG4gIGlmIChpZHggIT09IC0xKSB0aGlzLl9xdWV1ZS5zcGxpY2UoaWR4LCAxKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuQmF0Y2gucHJvdG90eXBlLmZsdXNoID0gZnVuY3Rpb24gKCkge1xuICB2YXIgc3RhcnRUaW1lID0gbmV3IERhdGUoKSxcbiAgICAgIGVsYXBzZWRUaW1lLFxuICAgICAgY2IgPSB0aGlzLl9jYixcbiAgICAgIHN0YXJ0UG9zID0gdGhpcy5fc3RhcnRQb3MsXG4gICAgICB0YXNrLFxuICAgICAgX2ksXG4gICAgICBfbGVuLFxuICAgICAgX3JlZjtcbiAgX3JlZiA9IHRoaXMuX3F1ZXVlO1xuICBmb3IgKF9pID0gc3RhcnRQb3MsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgdGFzayA9IF9yZWZbX2ldO1xuICAgIGNiLmNhbGwobnVsbCwgdGFzayk7XG4gICAgZWxhcHNlZFRpbWUgPSBuZXcgRGF0ZSgpIC0gc3RhcnRUaW1lO1xuICAgIGlmIChlbGFwc2VkVGltZSA+IEZSQU1FX0JVREdFVCkge1xuICAgICAgY29uc29sZS5sb2coJ2ZyYW1lIGJ1ZGdldCBvdmVyZmxvdzonLCBlbGFwc2VkVGltZSk7XG4gICAgICBfaSsrO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgdGhpcy5fcXVldWUuc3BsaWNlKDAsIF9pKTtcbiAgdGhpcy5fc3RhcnRQb3MgPSAwO1xuXG4gIGlmICh0aGlzLl9xdWV1ZS5sZW5ndGgpIHtcbiAgICB0aGlzLnNjaGVkdWxlRmx1c2goKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAodHlwZSh0aGlzLm9wdGlvbnMub25GaW5pc2gpID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLm9wdGlvbnMub25GaW5pc2guY2FsbChudWxsKTtcbiAgICB9XG4gIH1cbn07XG5CYXRjaC5wcm90b3R5cGUuc2NoZWR1bGVGbHVzaCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuX3RpY2spIHtcbiAgICBjYW5jZWxSYWYodGhpcy5fdGljayk7XG4gIH1cbiAgdGhpcy5fdGljayA9IHJhZih0aGlzLmZsdXNoKTtcbiAgcmV0dXJuIHRoaXMuX3RpY2s7XG59O1xuQmF0Y2gucHJvdG90eXBlLm9uRmx1c2ggPSBmdW5jdGlvbiAoZm4pIHtcbiAgaWYgKHR5cGUoZm4pICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignW0JhdGNoLnByb3RvdHlwZS5vbkZsdXNoXW5lZWQgYSBGdW5jdGlvbiBoZXJlLCBidXQgZ2l2ZW4gJyArIGZuKTtcbiAgfVxuICB0aGlzLl9jYiA9IGZuO1xuICByZXR1cm4gdGhpcztcbn07XG5CYXRjaC5wcm90b3R5cGUubGVuZ3RoID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5fcXVldWUubGVuZ3RoO1xufTtcbkJhdGNoLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24gKCkge1xuICBjYW5jZWxSYWYodGhpcy5fdGljayk7XG4gIHRoaXMuX3F1ZXVlLmxlbmd0aCA9IDA7XG4gIHJldHVybiB0aGlzO1xufTtcblsnb25BZGRUYXJnZXQnLCAnb25GaW5pc2gnXS5mb3JFYWNoKGZ1bmN0aW9uIChtbmFtZSkge1xuICBCYXRjaC5wcm90b3R5cGVbbW5hbWVdID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgaWYgKHR5cGUoZm4pICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdbQmF0Y2gucHJvdG90eXBlLicgKyBtbmFtZSArICddbmVlZCBhIEZ1bmN0aW9uIGhlcmUsIGJ1dCBnaXZlbiAnICsgZm4pO1xuICAgIH1cbiAgICB0aGlzLm9wdGlvbnNbbW5hbWVdID0gZm47XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG59KTtcbmV4cG9ydCBkZWZhdWx0IEJhdGNoOyIsIi8vIGltcG9ydCB7Z2V0dGVyc2V0dGVyfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IE1hcCB9IGZyb20gJy4vc3RvcmUnO1xuaW1wb3J0IERPTURlbGVnYXRvciBmcm9tICcuL2RvbS1kZWxlZ2F0b3InO1xuaW1wb3J0IEJhdGNoIGZyb20gJy4vdXBkYXRlL2JhdGNoJztcbnZhciBnbG9iYWwgPSB0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnID8gd2luZG93IDoge307XG5leHBvcnQgeyBnbG9iYWwgfTtcbnZhciBkb2N1bWVudCA9IGdsb2JhbC5kb2N1bWVudDtcbmV4cG9ydCB7IGRvY3VtZW50IH07XG52YXIgcnVudGltZSA9IHR5cGVvZiBwcm9jZXNzICE9ICd1bmRlZmluZWQnICYmICFwcm9jZXNzLmJyb3dzZXIgPyAnbm9kZWpzJyA6IHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgPyAnYnJvd3NlcicgOiAndW5rbm93bic7XG5leHBvcnQgeyBydW50aW1lIH07XG52YXIgRyA9IHtcbiAgZm9yY2luZzogZmFsc2UsXG4gIHVubG9hZGVyczogbmV3IE1hcCgpLFxuICBjb21wdXRlUHJlUmVkcmF3SG9vazogbnVsbCxcbiAgY29tcHV0ZVBvc3RSZWRyYXdIb29rOiBudWxsLFxuICAvL21vdW50IHJlZ2lzdHJpZXNcbiAgcm9vdHM6IFtdLFxuICByZWNyZWF0aW9uczogW10sXG4gIGNvbXBvbmVudHM6IFtdLFxuICBjb250cm9sbGVyczogW10sXG4gIC8vcmVuZGVyIHJlZ2lzdHJpZXNcbiAgZG9tQ2FjaGVNYXA6IG5ldyBNYXAoKSxcbiAgZG9tRGVsZWdhdG9yOiBuZXcgRE9NRGVsZWdhdG9yKCksXG4gIC8vZ2xvYmFsIGJhdGNoIHJlbmRlciBxdWV1ZVxuICByZW5kZXJRdWV1ZTogbmV3IEJhdGNoKClcbn07XG5leHBvcnQgeyBHIH07IiwiaW1wb3J0IHsgZ2xvYmFsIGFzICRnbG9iYWwgfSBmcm9tICcuLi9nbG9iYWxzJztcbnZhciBsYXN0VGltZSA9IDAsXG4gICAgRlJBTUVfQlVER0VUID0gMTYsXG4gICAgdmVuZG9ycyA9IFsnd2Via2l0JywgJ21veicsICdtcycsICdvJ10sXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gJGdsb2JhbC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUsXG4gICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSAkZ2xvYmFsLmNhbmNlbEFuaW1hdGlvbkZyYW1lIHx8ICRnbG9iYWwuY2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuZm9yICh2YXIgeCA9IDAsIGwgPSB2ZW5kb3JzLmxlbmd0aDsgeCA8IGwgJiYgIXJlcXVlc3RBbmltYXRpb25GcmFtZTsgKyt4KSB7XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9ICRnbG9iYWxbdmVuZG9yc1t4XSArICdSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcbiAgY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSAkZ2xvYmFsW3ZlbmRvcnNbeF0gKyAnQ2FuY2VsQW5pbWF0aW9uRnJhbWUnXSB8fCAkZ2xvYmFsW3ZlbmRvcnNbeF0gKyAnQ2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ107XG59XG5cbmlmICghcmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgIHZhciBjdXJyVGltZSA9IERhdGUubm93ID8gRGF0ZS5ub3coKSA6IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIHZhciB0aW1lVG9DYWxsID0gTWF0aC5tYXgoMCwgRlJBTUVfQlVER0VUIC0gKGN1cnJUaW1lIC0gbGFzdFRpbWUpKTtcbiAgICB2YXIgaWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGNhbGxiYWNrKGN1cnJUaW1lICsgdGltZVRvQ2FsbCk7XG4gICAgfSwgdGltZVRvQ2FsbCk7XG4gICAgbGFzdFRpbWUgPSBjdXJyVGltZSArIHRpbWVUb0NhbGw7XG4gICAgcmV0dXJuIGlkO1xuICB9O1xufVxuXG5pZiAoIWNhbmNlbEFuaW1hdGlvbkZyYW1lKSB7XG4gIGNhbmNlbEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgcmV0dXJuIGNsZWFyVGltZW91dChpZCk7XG4gIH07XG59XG5cbmV4cG9ydCB7IHJlcXVlc3RBbmltYXRpb25GcmFtZSwgY2FuY2VsQW5pbWF0aW9uRnJhbWUsIEZSQU1FX0JVREdFVCB9OyIsIlxuZXhwb3J0IGRlZmF1bHQgY2xlYXI7XG5cbmltcG9ydCB7IHR5cGUsIE5PT1AgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgeyBHIH0gZnJvbSAnLi4vZ2xvYmFscyc7XG52YXIgZG9tQ2FjaGVNYXAgPSBHLmRvbUNhY2hlTWFwO1xudmFyIGRvbURlbGVnYXRvciA9IEcuZG9tRGVsZWdhdG9yO1xuZnVuY3Rpb24gY2xlYXIoZG9tTm9kZXMsIHZOb2Rlcykge1xuICB2Tm9kZXMgPSB2Tm9kZXMgfHwgW107XG4gIHZOb2RlcyA9IFtdLmNvbmNhdCh2Tm9kZXMpO1xuICBmb3IgKHZhciBpID0gZG9tTm9kZXMubGVuZ3RoIC0gMTsgaSA+IC0xOyBpLS0pIHtcbiAgICBpZiAoZG9tTm9kZXNbaV0gJiYgZG9tTm9kZXNbaV0ucGFyZW50Tm9kZSkge1xuICAgICAgaWYgKHZOb2Rlc1tpXSkgdW5sb2FkKHZOb2Rlc1tpXSk7IC8vIGNsZWFudXAgYmVmb3JlIGRvbSBpcyByZW1vdmVkIGZyb20gZG9tIHRyZWVcbiAgICAgIGRvbURlbGVnYXRvci5vZmYoZG9tTm9kZXNbaV0pO1xuICAgICAgZG9tQ2FjaGVNYXAucmVtb3ZlKGRvbU5vZGVzW2ldKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGRvbU5vZGVzW2ldLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZG9tTm9kZXNbaV0pO1xuICAgICAgfSBjYXRjaCAoZSkge30gLy9pZ25vcmUgaWYgdGhpcyBmYWlscyBkdWUgdG8gb3JkZXIgb2YgZXZlbnRzIChzZWUgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yMTkyNjA4My9mYWlsZWQtdG8tZXhlY3V0ZS1yZW1vdmVjaGlsZC1vbi1ub2RlKVxuICAgIH1cbiAgfVxuICBpZiAoZG9tTm9kZXMubGVuZ3RoICE9IDApIGRvbU5vZGVzLmxlbmd0aCA9IDA7XG59XG5cbmZ1bmN0aW9uIHVubG9hZCh2Tm9kZSkge1xuICBpZiAodk5vZGUuY29uZmlnQ29udGV4dCAmJiB0eXBlKHZOb2RlLmNvbmZpZ0NvbnRleHQub251bmxvYWQpID09PSAnZnVuY3Rpb24nKSB7XG4gICAgdk5vZGUuY29uZmlnQ29udGV4dC5vbnVubG9hZCgpO1xuICAgIHZOb2RlLmNvbmZpZ0NvbnRleHQub251bmxvYWQgPSBudWxsO1xuICB9XG4gIGlmICh2Tm9kZS5jb250cm9sbGVycykge1xuICAgIGZvciAodmFyIGkgPSAwLCBjb250cm9sbGVyID0gdW5kZWZpbmVkOyBjb250cm9sbGVyID0gdk5vZGUuY29udHJvbGxlcnNbaV07IGkrKykge1xuICAgICAgaWYgKHR5cGUoY29udHJvbGxlci5vbnVubG9hZCkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY29udHJvbGxlci5vbnVubG9hZCh7IHByZXZlbnREZWZhdWx0OiBOT09QIH0pO1xuICAgICAgICBHLnVubG9hZGVycy5yZW1vdmUoY29udHJvbGxlcik7IC8vdW5sb2FkIGZ1bmN0aW9uIHNob3VsZCBvbmx5IGV4ZWN1dGUgb25jZVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBpZiAodk5vZGUuY2hpbGRyZW4pIHtcbiAgICBpZiAodHlwZSh2Tm9kZS5jaGlsZHJlbikgPT09ICdhcnJheScpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBjaGlsZCA9IHVuZGVmaW5lZDsgY2hpbGQgPSB2Tm9kZS5jaGlsZHJlbltpXTsgaSsrKSB7XG4gICAgICAgIHVubG9hZChjaGlsZCk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh2Tm9kZS5jaGlsZHJlbi50YWcpIHtcbiAgICAgIHVubG9hZCh2Tm9kZS5jaGlsZHJlbik7XG4gICAgfVxuICB9XG59IiwiXG5leHBvcnQgZGVmYXVsdCBzZXRBdHRyaWJ1dGVzO1xuXG5pbXBvcnQgeyB0eXBlLCBtYXRjaFJlZyB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB7IEcgfSBmcm9tICcuLi9nbG9iYWxzJztcbnZhciBkb21EZWxlZ2F0b3IgPSBHLmRvbURlbGVnYXRvcjtcbnZhciBldkF0dHJSZWcgPSAvXmV2KFtBLVpdXFx3KikvO1xuZnVuY3Rpb24gc2V0QXR0cmlidXRlcyhkb21Ob2RlLCB0YWcsIGRhdGFBdHRycywgY2FjaGVkQXR0cnMsIG5hbWVzcGFjZSkge1xuICBPYmplY3Qua2V5cyhkYXRhQXR0cnMpLmZvckVhY2goZnVuY3Rpb24gKGF0dHJOYW1lKSB7XG4gICAgdmFyIGRhdGFBdHRyID0gZGF0YUF0dHJzW2F0dHJOYW1lXSxcbiAgICAgICAgY2FjaGVkQXR0ciA9IGNhY2hlZEF0dHJzW2F0dHJOYW1lXSxcbiAgICAgICAgZXZNYXRjaDtcblxuICAgIGlmICghKGF0dHJOYW1lIGluIGNhY2hlZEF0dHJzKSB8fCBjYWNoZWRBdHRyICE9PSBkYXRhQXR0cikge1xuICAgICAgY2FjaGVkQXR0cnNbYXR0ck5hbWVdID0gZGF0YUF0dHI7XG4gICAgICB0cnkge1xuICAgICAgICAvL2Bjb25maWdgIGlzbid0IGEgcmVhbCBhdHRyaWJ1dGVzLCBzbyBpZ25vcmUgaXRcbiAgICAgICAgaWYgKGF0dHJOYW1lID09PSAnY29uZmlnJyB8fCBhdHRyTmFtZSA9PSAna2V5JykgcmV0dXJuO1xuICAgICAgICAvL2hvb2sgZXZlbnQgaGFuZGxlcnMgdG8gdGhlIGF1dG8tcmVkcmF3aW5nIHN5c3RlbVxuICAgICAgICBlbHNlIGlmICh0eXBlKGRhdGFBdHRyKSA9PT0gJ2Z1bmN0aW9uJyAmJiBhdHRyTmFtZS5pbmRleE9mKCdvbicpID09PSAwKSB7XG4gICAgICAgICAgZG9tTm9kZVthdHRyTmFtZV0gPSBkYXRhQXR0cjtcbiAgICAgICAgICAvLyBiaW5kIGhhbmRsZXIgdG8gZG9tTm9kZSBmb3IgYSBkZWxlZ2F0aW9uIGV2ZW50XG4gICAgICAgIH0gZWxzZSBpZiAoKGV2TWF0Y2ggPSBtYXRjaFJlZyhhdHRyTmFtZSwgZXZBdHRyUmVnKSkgJiYgZXZNYXRjaFsxXS5sZW5ndGgpIHtcbiAgICAgICAgICB2YXIgZXZUeXBlID0gZXZNYXRjaFsxXS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIGRvbURlbGVnYXRvci5vZmYoZG9tTm9kZSwgZXZUeXBlKTtcbiAgICAgICAgICBpZiAoaXNIYW5kbGVyKGRhdGFBdHRyKSkge1xuICAgICAgICAgICAgZG9tRGVsZWdhdG9yLm9uKGRvbU5vZGUsIGV2VHlwZSwgZGF0YUF0dHIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvL2hhbmRsZSBgc3R5bGU6IHsuLi59YFxuICAgICAgICBlbHNlIGlmIChhdHRyTmFtZSA9PT0gJ3N0eWxlJyAmJiBkYXRhQXR0ciAhPSBudWxsICYmIHR5cGUoZGF0YUF0dHIpID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgIE9iamVjdC5rZXlzKGRhdGFBdHRyKS5mb3JFYWNoKGZ1bmN0aW9uIChydWxlKSB7XG4gICAgICAgICAgICBpZiAoY2FjaGVkQXR0ciA9PSBudWxsIHx8IGNhY2hlZEF0dHJbcnVsZV0gIT09IGRhdGFBdHRyW3J1bGVdKSB7XG4gICAgICAgICAgICAgIGRvbU5vZGUuc3R5bGVbcnVsZV0gPSBkYXRhQXR0cltydWxlXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAodHlwZShjYWNoZWRBdHRyKSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGNhY2hlZEF0dHIpLmZvckVhY2goZnVuY3Rpb24gKHJ1bGUpIHtcbiAgICAgICAgICAgICAgaWYgKCEocnVsZSBpbiBkYXRhQXR0cikpIGRvbU5vZGUuc3R5bGVbcnVsZV0gPSAnJztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvL2hhbmRsZSBTVkdcbiAgICAgICAgZWxzZSBpZiAobmFtZXNwYWNlICE9IG51bGwpIHtcbiAgICAgICAgICBpZiAoYXR0ck5hbWUgPT09ICdocmVmJykgZG9tTm9kZS5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICdocmVmJywgZGF0YUF0dHIpO2Vsc2UgaWYgKGF0dHJOYW1lID09PSAnY2xhc3NOYW1lJykgZG9tTm9kZS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgZGF0YUF0dHIpO2Vsc2UgZG9tTm9kZS5zZXRBdHRyaWJ1dGUoYXR0ck5hbWUsIGRhdGFBdHRyKTtcbiAgICAgICAgfVxuICAgICAgICAvL2hhbmRsZSBjYXNlcyB0aGF0IGFyZSBwcm9wZXJ0aWVzIChidXQgaWdub3JlIGNhc2VzIHdoZXJlIHdlIHNob3VsZCB1c2Ugc2V0QXR0cmlidXRlIGluc3RlYWQpXG4gICAgICAgIC8vLSBsaXN0IGFuZCBmb3JtIGFyZSB0eXBpY2FsbHkgdXNlZCBhcyBzdHJpbmdzLCBidXQgYXJlIERPTSBlbGVtZW50IHJlZmVyZW5jZXMgaW4ganNcbiAgICAgICAgLy8tIHdoZW4gdXNpbmcgQ1NTIHNlbGVjdG9ycyAoZS5nLiBgbShcIltzdHlsZT0nJ11cIilgKSwgc3R5bGUgaXMgdXNlZCBhcyBhIHN0cmluZywgYnV0IGl0J3MgYW4gb2JqZWN0IGluIGpzXG4gICAgICAgIGVsc2UgaWYgKGF0dHJOYW1lIGluIGRvbU5vZGUgJiYgIShhdHRyTmFtZSA9PT0gJ2xpc3QnIHx8IGF0dHJOYW1lID09PSAnc3R5bGUnIHx8IGF0dHJOYW1lID09PSAnZm9ybScgfHwgYXR0ck5hbWUgPT09ICd0eXBlJyB8fCBhdHRyTmFtZSA9PT0gJ3dpZHRoJyB8fCBhdHRyTmFtZSA9PT0gJ2hlaWdodCcpKSB7XG4gICAgICAgICAgLy8jMzQ4IGRvbid0IHNldCB0aGUgdmFsdWUgaWYgbm90IG5lZWRlZCBvdGhlcndpc2UgY3Vyc29yIHBsYWNlbWVudCBicmVha3MgaW4gQ2hyb21lXG4gICAgICAgICAgaWYgKHRhZyAhPT0gJ2lucHV0JyB8fCBkb21Ob2RlW2F0dHJOYW1lXSAhPT0gZGF0YUF0dHIpIGRvbU5vZGVbYXR0ck5hbWVdID0gZGF0YUF0dHI7XG4gICAgICAgIH0gZWxzZSBkb21Ob2RlLnNldEF0dHJpYnV0ZShhdHRyTmFtZSwgZGF0YUF0dHIpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvL3N3YWxsb3cgSUUncyBpbnZhbGlkIGFyZ3VtZW50IGVycm9ycyB0byBtaW1pYyBIVE1MJ3MgZmFsbGJhY2stdG8tZG9pbmctbm90aGluZy1vbi1pbnZhbGlkLWF0dHJpYnV0ZXMgYmVoYXZpb3JcbiAgICAgICAgaWYgKGUubWVzc2FnZS5pbmRleE9mKCdJbnZhbGlkIGFyZ3VtZW50JykgPCAwKSB0aHJvdyBlO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyMzNDggZGF0YUF0dHIgbWF5IG5vdCBiZSBhIHN0cmluZywgc28gdXNlIGxvb3NlIGNvbXBhcmlzb24gKGRvdWJsZSBlcXVhbCkgaW5zdGVhZCBvZiBzdHJpY3QgKHRyaXBsZSBlcXVhbClcbiAgICBlbHNlIGlmIChhdHRyTmFtZSA9PT0gJ3ZhbHVlJyAmJiB0YWcgPT09ICdpbnB1dCcgJiYgZG9tTm9kZS52YWx1ZSAhPSBkYXRhQXR0cikge1xuICAgICAgZG9tTm9kZS52YWx1ZSA9IGRhdGFBdHRyO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBjYWNoZWRBdHRycztcbn1cblxuZnVuY3Rpb24gaXNIYW5kbGVyKGhhbmRsZXIpIHtcbiAgcmV0dXJuIHR5cGUoaGFuZGxlcikgPT09ICdmdW5jdGlvbicgfHwgaGFuZGxlciAmJiB0eXBlKGhhbmRsZXIuaGFuZGxlRXZlbnQpID09PSAnZnVuY3Rpb24nO1xufSIsIlxuZXhwb3J0IGRlZmF1bHQgYnVpbGQ7XG5pbXBvcnQgeyB0eXBlLCBOT09QLCBzbGljZSwgZ2V0SGFzaCB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCBjbGVhciBmcm9tICcuL2NsZWFyJztcbmltcG9ydCB7IGRvY3VtZW50IGFzICRkb2N1bWVudCwgRyB9IGZyb20gJy4uL2dsb2JhbHMnO1xuaW1wb3J0IHNldEF0dHJpYnV0ZXMgZnJvbSAnLi9zZXRBdHRyaWJ1dGVzJztcbi8vYGJ1aWxkYCBpcyBhIHJlY3Vyc2l2ZSBmdW5jdGlvbiB0aGF0IG1hbmFnZXMgY3JlYXRpb24vZGlmZmluZy9yZW1vdmFsIG9mIERPTSBlbGVtZW50cyBiYXNlZCBvbiBjb21wYXJpc29uIGJldHdlZW4gYGRhdGFgIGFuZCBgY2FjaGVkYFxuLy90aGUgZGlmZiBhbGdvcml0aG0gY2FuIGJlIHN1bW1hcml6ZWQgYXMgdGhpczpcbi8vMSAtIGNvbXBhcmUgYGRhdGFgIGFuZCBgY2FjaGVkYFxuLy8yIC0gaWYgdGhleSBhcmUgZGlmZmVyZW50LCBjb3B5IGBkYXRhYCB0byBgY2FjaGVkYCBhbmQgdXBkYXRlIHRoZSBET00gYmFzZWQgb24gd2hhdCB0aGUgZGlmZmVyZW5jZSBpc1xuLy8zIC0gcmVjdXJzaXZlbHkgYXBwbHkgdGhpcyBhbGdvcml0aG0gZm9yIGV2ZXJ5IGFycmF5IGFuZCBmb3IgdGhlIGNoaWxkcmVuIG9mIGV2ZXJ5IHZpcnR1YWwgZWxlbWVudFxuLy90aGUgYGNhY2hlZGAgZGF0YSBzdHJ1Y3R1cmUgaXMgZXNzZW50aWFsbHkgdGhlIHNhbWUgYXMgdGhlIHByZXZpb3VzIHJlZHJhdydzIGBkYXRhYCBkYXRhIHN0cnVjdHVyZSwgd2l0aCBhIGZldyBhZGRpdGlvbnM6XG4vLy0gYGNhY2hlZGAgYWx3YXlzIGhhcyBhIHByb3BlcnR5IGNhbGxlZCBgbm9kZXNgLCB3aGljaCBpcyBhIGxpc3Qgb2YgRE9NIGVsZW1lbnRzIHRoYXQgY29ycmVzcG9uZCB0byB0aGUgZGF0YSByZXByZXNlbnRlZCBieSB0aGUgcmVzcGVjdGl2ZSB2aXJ0dWFsIGVsZW1lbnRcbi8vLSBpbiBvcmRlciB0byBzdXBwb3J0IGF0dGFjaGluZyBgbm9kZXNgIGFzIGEgcHJvcGVydHkgb2YgYGNhY2hlZGAsIGBjYWNoZWRgIGlzICphbHdheXMqIGEgbm9uLXByaW1pdGl2ZSBvYmplY3QsIGkuZS4gaWYgdGhlIGRhdGEgd2FzIGEgc3RyaW5nLCB0aGVuIGNhY2hlZCBpcyBhIFN0cmluZyBpbnN0YW5jZS4gSWYgZGF0YSB3YXMgYG51bGxgIG9yIGB1bmRlZmluZWRgLCBjYWNoZWQgaXMgYG5ldyBTdHJpbmcoXCJcIilgXG4vLy0gYGNhY2hlZCBhbHNvIGhhcyBhIGBjb25maWdDb250ZXh0YCBwcm9wZXJ0eSwgd2hpY2ggaXMgdGhlIHN0YXRlIHN0b3JhZ2Ugb2JqZWN0IGV4cG9zZWQgYnkgY29uZmlnKGVsZW1lbnQsIGlzSW5pdGlhbGl6ZWQsIGNvbnRleHQpXG4vLy0gd2hlbiBgY2FjaGVkYCBpcyBhbiBPYmplY3QsIGl0IHJlcHJlc2VudHMgYSB2aXJ0dWFsIGVsZW1lbnQ7IHdoZW4gaXQncyBhbiBBcnJheSwgaXQgcmVwcmVzZW50cyBhIGxpc3Qgb2YgZWxlbWVudHM7IHdoZW4gaXQncyBhIFN0cmluZywgTnVtYmVyIG9yIEJvb2xlYW4sIGl0IHJlcHJlc2VudHMgYSB0ZXh0IG5vZGVcbi8vYHBhcmVudEVsZW1lbnRgIGlzIGEgRE9NIGVsZW1lbnQgdXNlZCBmb3IgVzNDIERPTSBBUEkgY2FsbHNcbi8vYHBhcmVudFRhZ2AgaXMgb25seSB1c2VkIGZvciBoYW5kbGluZyBhIGNvcm5lciBjYXNlIGZvciB0ZXh0YXJlYSB2YWx1ZXNcbi8vYHBhcmVudENhY2hlYCBpcyB1c2VkIHRvIHJlbW92ZSBub2RlcyBpbiBzb21lIG11bHRpLW5vZGUgY2FzZXNcbi8vYHBhcmVudEluZGV4YCBhbmQgYGluZGV4YCBhcmUgdXNlZCB0byBmaWd1cmUgb3V0IHRoZSBvZmZzZXQgb2Ygbm9kZXMuIFRoZXkncmUgYXJ0aWZhY3RzIGZyb20gYmVmb3JlIGFycmF5cyBzdGFydGVkIGJlaW5nIGZsYXR0ZW5lZCBhbmQgYXJlIGxpa2VseSByZWZhY3RvcmFibGVcbi8vYGRhdGFgIGFuZCBgY2FjaGVkYCBhcmUsIHJlc3BlY3RpdmVseSwgdGhlIG5ldyBhbmQgb2xkIG5vZGVzIGJlaW5nIGRpZmZlZFxuLy9gc2hvdWxkUmVhdHRhY2hgIGlzIGEgZmxhZyBpbmRpY2F0aW5nIHdoZXRoZXIgYSBwYXJlbnQgbm9kZSB3YXMgcmVjcmVhdGVkIChpZiBzbywgYW5kIGlmIHRoaXMgbm9kZSBpcyByZXVzZWQsIHRoZW4gdGhpcyBub2RlIG11c3QgcmVhdHRhY2ggaXRzZWxmIHRvIHRoZSBuZXcgcGFyZW50KVxuLy9gZWRpdGFibGVgIGlzIGEgZmxhZyB0aGF0IGluZGljYXRlcyB3aGV0aGVyIGFuIGFuY2VzdG9yIGlzIGNvbnRlbnRlZGl0YWJsZVxuLy9gbmFtZXNwYWNlYCBpbmRpY2F0ZXMgdGhlIGNsb3Nlc3QgSFRNTCBuYW1lc3BhY2UgYXMgaXQgY2FzY2FkZXMgZG93biBmcm9tIGFuIGFuY2VzdG9yXG4vL2Bjb25maWdzYCBpcyBhIGxpc3Qgb2YgY29uZmlnIGZ1bmN0aW9ucyB0byBydW4gYWZ0ZXIgdGhlIHRvcG1vc3QgYGJ1aWxkYCBjYWxsIGZpbmlzaGVzIHJ1bm5pbmdcbi8vdGhlcmUncyBsb2dpYyB0aGF0IHJlbGllcyBvbiB0aGUgYXNzdW1wdGlvbiB0aGF0IG51bGwgYW5kIHVuZGVmaW5lZCBkYXRhIGFyZSBlcXVpdmFsZW50IHRvIGVtcHR5IHN0cmluZ3Ncbi8vLSB0aGlzIHByZXZlbnRzIGxpZmVjeWNsZSBzdXJwcmlzZXMgZnJvbSBwcm9jZWR1cmFsIGhlbHBlcnMgdGhhdCBtaXggaW1wbGljaXQgYW5kIGV4cGxpY2l0IHJldHVybiBzdGF0ZW1lbnRzIChlLmcuIGZ1bmN0aW9uIGZvbygpIHtpZiAoY29uZCkgcmV0dXJuIG0oXCJkaXZcIil9XG4vLy0gaXQgc2ltcGxpZmllcyBkaWZmaW5nIGNvZGVcbi8vZGF0YS50b1N0cmluZygpIG1pZ2h0IHRocm93IG9yIHJldHVybiBudWxsIGlmIGRhdGEgaXMgdGhlIHJldHVybiB2YWx1ZSBvZiBDb25zb2xlLmxvZyBpbiBGaXJlZm94IChiZWhhdmlvciBkZXBlbmRzIG9uIHZlcnNpb24pXG52YXIgVk9JRF9FTEVNRU5UUyA9IC9eKEFSRUF8QkFTRXxCUnxDT0x8Q09NTUFORHxFTUJFRHxIUnxJTUd8SU5QVVR8S0VZR0VOfExJTkt8TUVUQXxQQVJBTXxTT1VSQ0V8VFJBQ0t8V0JSKSQvO1xuZnVuY3Rpb24gYnVpbGQocGFyZW50RWxlbWVudCwgcGFyZW50VGFnLCBwYXJlbnRDYWNoZSwgcGFyZW50SW5kZXgsIGRhdGEsIGNhY2hlZCwgc2hvdWxkUmVhdHRhY2gsIGluZGV4LCBlZGl0YWJsZSwgbmFtZXNwYWNlLCBjb25maWdzKSB7XG4gIC8vZGF0YS50b1N0cmluZygpIG1pZ2h0IHRocm93IG9yIHJldHVybiBudWxsIGlmIGRhdGEgaXMgdGhlIHJldHVybiB2YWx1ZSBvZiBDb25zb2xlLmxvZyBpbiBmaXJlZm94IChiZWhhdmlvciBkZXBlbmRzIG9uIHZlcnNpb24pXG4gIHRyeSB7XG4gICAgaWYgKGRhdGEgPT0gbnVsbCB8fCBkYXRhLnRvU3RyaW5nKCkgPT0gbnVsbCkge1xuICAgICAgZGF0YSA9ICcnO1xuICAgIH1cbiAgfSBjYXRjaCAoXykge1xuICAgIGRhdGEgPSAnJztcbiAgfVxuICBpZiAoZGF0YS5zdWJ0cmVlID09PSAncmV0YWluJykgcmV0dXJuIGNhY2hlZDtcbiAgdmFyIGNhY2hlZFR5cGUgPSB0eXBlKGNhY2hlZCksXG4gICAgICBkYXRhVHlwZSA9IHR5cGUoZGF0YSksXG4gICAgICBpbnRhY3Q7XG4gIGlmIChjYWNoZWQgPT0gbnVsbCB8fCBjYWNoZWRUeXBlICE9PSBkYXRhVHlwZSkge1xuICAgIC8vIHZhbGlkYXRlIGNhY2hlZFxuICAgIGNhY2hlZCA9IGNsZWFyQ2FjaGVkKGRhdGEsIGNhY2hlZCwgaW5kZXgsIHBhcmVudEluZGV4LCBwYXJlbnRDYWNoZSwgZGF0YVR5cGUpO1xuICB9XG4gIGlmIChkYXRhVHlwZSA9PT0gJ2FycmF5Jykge1xuICAgIC8vIGNoaWxkcmVuIGRpZmZcbiAgICBkYXRhID0gX3JlY3Vyc2l2ZUZsYXR0ZW4oZGF0YSk7XG4gICAgaW50YWN0ID0gY2FjaGVkLmxlbmd0aCA9PT0gZGF0YS5sZW5ndGg7XG4gICAgY2FjaGVkID0gZGlmZkNoaWxkcmVuV2l0aEtleShkYXRhLCBjYWNoZWQsIHBhcmVudEVsZW1lbnQpO1xuICAgIGNhY2hlZCA9IGRpZmZBcnJheUl0ZW0oZGF0YSwgY2FjaGVkLCBwYXJlbnRFbGVtZW50LCBwYXJlbnRUYWcsIGluZGV4LCBzaG91bGRSZWF0dGFjaCwgaW50YWN0LCBlZGl0YWJsZSwgbmFtZXNwYWNlLCBjb25maWdzKTtcbiAgfSBlbHNlIGlmIChkYXRhICE9IG51bGwgJiYgZGF0YVR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgLy8gYXR0cmlidXRlcyBkaWZmXG4gICAgY2FjaGVkID0gZGlmZlZOb2RlKGRhdGEsIGNhY2hlZCwgcGFyZW50RWxlbWVudCwgaW5kZXgsIHNob3VsZFJlYXR0YWNoLCBlZGl0YWJsZSwgbmFtZXNwYWNlLCBjb25maWdzKTtcbiAgfSBlbHNlIGlmICh0eXBlKGRhdGEpICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgLy9oYW5kbGUgdGV4dCBub2Rlc1xuICAgIGNhY2hlZCA9IGRpZmZUZXh0Tm9kZShkYXRhLCBjYWNoZWQsIHBhcmVudEVsZW1lbnQsIHBhcmVudFRhZywgaW5kZXgsIHNob3VsZFJlYXR0YWNoLCBlZGl0YWJsZSk7XG4gIH1cbiAgcmV0dXJuIGNhY2hlZDtcbn1cblxuLy9kaWZmIGZ1bmN0aW9uc1xuZnVuY3Rpb24gY2xlYXJDYWNoZWQoZGF0YSwgY2FjaGVkLCBpbmRleCwgcGFyZW50SW5kZXgsIHBhcmVudENhY2hlLCBkYXRhVHlwZSkge1xuICB2YXIgb2Zmc2V0LCBlbmQ7XG4gIGlmIChjYWNoZWQgIT0gbnVsbCkge1xuICAgIGlmIChwYXJlbnRDYWNoZSAmJiBwYXJlbnRDYWNoZS5ub2Rlcykge1xuICAgICAgb2Zmc2V0ID0gaW5kZXggLSBwYXJlbnRJbmRleDtcbiAgICAgIGVuZCA9IG9mZnNldCArIChkYXRhVHlwZSA9PT0gJ2FycmF5JyA/IGRhdGEgOiBjYWNoZWQubm9kZXMpLmxlbmd0aDtcbiAgICAgIGNsZWFyKHBhcmVudENhY2hlLm5vZGVzLnNsaWNlKG9mZnNldCwgZW5kKSwgcGFyZW50Q2FjaGUuc2xpY2Uob2Zmc2V0LCBlbmQpKTtcbiAgICB9IGVsc2UgaWYgKGNhY2hlZC5ub2Rlcykge1xuICAgICAgY2xlYXIoY2FjaGVkLm5vZGVzLCBjYWNoZWQpO1xuICAgIH1cbiAgfVxuICBjYWNoZWQgPSBuZXcgZGF0YS5jb25zdHJ1Y3RvcigpO1xuICBpZiAoY2FjaGVkLnRhZykgY2FjaGVkID0ge307XG4gIGNhY2hlZC5ub2RlcyA9IFtdO1xuICByZXR1cm4gY2FjaGVkO1xufVxuXG5mdW5jdGlvbiBkaWZmQ2hpbGRyZW5XaXRoS2V5KGRhdGEsIGNhY2hlZCwgcGFyZW50RWxlbWVudCkge1xuICAvL2tleXMgYWxnb3JpdGhtOiBzb3J0IGVsZW1lbnRzIHdpdGhvdXQgcmVjcmVhdGluZyB0aGVtIGlmIGtleXMgYXJlIHByZXNlbnRcbiAgLy8xKSBjcmVhdGUgYSBtYXAgb2YgYWxsIGV4aXN0aW5nIGtleXMsIGFuZCBtYXJrIGFsbCBmb3IgZGVsZXRpb25cbiAgLy8yKSBhZGQgbmV3IGtleXMgdG8gbWFwIGFuZCBtYXJrIHRoZW0gZm9yIGFkZGl0aW9uXG4gIC8vMykgaWYga2V5IGV4aXN0cyBpbiBuZXcgbGlzdCwgY2hhbmdlIGFjdGlvbiBmcm9tIGRlbGV0aW9uIHRvIGEgbW92ZVxuICAvLzQpIGZvciBlYWNoIGtleSwgaGFuZGxlIGl0cyBjb3JyZXNwb25kaW5nIGFjdGlvbiBhcyBtYXJrZWQgaW4gcHJldmlvdXMgc3RlcHNcbiAgdmFyIERFTEVUSU9OID0gMSxcbiAgICAgIElOU0VSVElPTiA9IDIsXG4gICAgICBNT1ZFID0gMztcbiAgdmFyIGV4aXN0aW5nID0ge30sXG4gICAgICBzaG91bGRNYWludGFpbklkZW50aXRpZXMgPSBmYWxzZTtcbiAgLy8gMSlcbiAgY2FjaGVkLmZvckVhY2goZnVuY3Rpb24gKGNhY2hlZE5vZGUsIGlkeCkge1xuICAgIHZhciBrZXkgPSBfa2V5KGNhY2hlZE5vZGUpO1xuICAgIC8vbm9ybWFybGl6ZSBrZXlcbiAgICBfbm9ybWFsaXplS2V5KGNhY2hlZE5vZGUsIGtleSk7XG5cbiAgICBpZiAoa2V5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHNob3VsZE1haW50YWluSWRlbnRpdGllcyA9IHRydWU7XG4gICAgICBleGlzdGluZ1trZXldID0ge1xuICAgICAgICBhY3Rpb246IERFTEVUSU9OLFxuICAgICAgICBpbmRleDogaWR4XG4gICAgICB9O1xuICAgIH1cbiAgfSk7XG4gIC8vIGFkZCBrZXlzIHRvIGFsbCBpdGVtcyBpZiBhdCBsZWFzdCBvbmUgb2YgaXRlbXMgaGFzIGEga2V5IGF0dHJpYnV0ZVxuICB2YXIgZ3VpZCA9IDA7XG4gIGlmIChkYXRhLnNvbWUoZnVuY3Rpb24gKGRhdGFOb2RlKSB7XG4gICAgdmFyIGtleSA9IF9rZXkoZGF0YU5vZGUpO1xuICAgIC8vbm9ybWFybGl6ZSBrZXlcbiAgICBfbm9ybWFsaXplS2V5KGRhdGFOb2RlLCBrZXkpO1xuICAgIHJldHVybiBrZXkgIT09IHVuZGVmaW5lZDtcbiAgfSkpIHtcbiAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKGRhdGFOb2RlKSB7XG4gICAgICBpZiAoZGF0YU5vZGUgJiYgZGF0YU5vZGUuYXR0cnMgJiYgZGF0YU5vZGUuYXR0cnMua2V5ID09IG51bGwpIHtcbiAgICAgICAgZGF0YU5vZGUuYXR0cnMua2V5ID0gJ19fbWl0aHJpbF9fJyArIGd1aWQrKztcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICBpZiAoc2hvdWxkTWFpbnRhaW5JZGVudGl0aWVzICYmIF9pc0tleXNEaWZmZXIoZGF0YSwgY2FjaGVkKSkge1xuICAgIC8vIDIpLCAzKVxuICAgIGRhdGEuZm9yRWFjaChfZGF0YU5vZGVUb0V4aXN0aW5nKTtcbiAgICAvLyA0KVxuICAgIHZhciBjaGFuZ2VzID0gdW5kZWZpbmVkLFxuICAgICAgICBuZXdDYWNoZWQgPSBuZXcgQXJyYXkoY2FjaGVkLmxlbmd0aCk7XG4gICAgY2hhbmdlcyA9IE9iamVjdC5rZXlzKGV4aXN0aW5nKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgcmV0dXJuIGV4aXN0aW5nW2tleV07XG4gICAgfSkuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgcmV0dXJuIGEuYWN0aW9uIC0gYi5hY3Rpb24gfHwgYS5pbmRleCAtIGIuaW5kZXg7XG4gICAgfSk7XG4gICAgbmV3Q2FjaGVkLm5vZGVzID0gY2FjaGVkLm5vZGVzLnNsaWNlKCk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBjaGFuZ2VzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgX2FwcGx5Q2hhbmdlcyhjaGFuZ2VzW2ldLCBuZXdDYWNoZWQpO1xuICAgIH1cbiAgICBjYWNoZWQgPSBuZXdDYWNoZWQ7XG4gIH1cbiAgcmV0dXJuIGNhY2hlZDtcbiAgLy9oZWxwZXJzXG4gIGZ1bmN0aW9uIF9pc0tleShrZXkpIHtcbiAgICByZXR1cm4gdHlwZShrZXkpID09PSAnc3RyaW5nJyB8fCB0eXBlKGtleSkgPT09ICdudW1iZXInICYmIHR5cGUoa2V5KSAhPT0gJ05hTic7XG4gIH1cblxuICBmdW5jdGlvbiBfa2V5KG5vZGVJdGVtKSB7XG4gICAgcmV0dXJuIG5vZGVJdGVtICYmIG5vZGVJdGVtLmF0dHJzICYmIF9pc0tleShub2RlSXRlbS5hdHRycy5rZXkpID8gbm9kZUl0ZW0uYXR0cnMua2V5IDogdW5kZWZpbmVkO1xuICB9XG4gIGZ1bmN0aW9uIF9ub3JtYWxpemVLZXkobm9kZSwga2V5KSB7XG4gICAgaWYgKCFub2RlIHx8ICFub2RlLmF0dHJzKSByZXR1cm47XG4gICAgaWYgKGtleSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBkZWxldGUgbm9kZS5hdHRycy5rZXk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vZGUuYXR0cnMua2V5ID0ga2V5O1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIF9pc0tleXNEaWZmZXIoZGF0YSwgY2FjaGVkKSB7XG4gICAgaWYgKGRhdGEubGVuZ3RoICE9PSBjYWNoZWQubGVuZ3RoKSByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gZGF0YS5zb21lKGZ1bmN0aW9uIChkYXRhTm9kZSwgaWR4KSB7XG4gICAgICB2YXIgY2FjaGVkTm9kZSA9IGNhY2hlZFtpZHhdO1xuICAgICAgcmV0dXJuIGNhY2hlZE5vZGUuYXR0cnMgJiYgZGF0YU5vZGUuYXR0cnMgJiYgY2FjaGVkTm9kZS5hdHRycy5rZXkgIT09IGRhdGFOb2RlLmF0dHJzLmtleTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIF9kYXRhTm9kZVRvRXhpc3RpbmcoZGF0YU5vZGUsIG5vZGVJZHgpIHtcbiAgICB2YXIga2V5ID0gX2tleShkYXRhTm9kZSk7XG4gICAgaWYgKGtleSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoIWV4aXN0aW5nW2tleV0pIHtcbiAgICAgICAgZXhpc3Rpbmdba2V5XSA9IHtcbiAgICAgICAgICBhY3Rpb246IElOU0VSVElPTixcbiAgICAgICAgICBpbmRleDogbm9kZUlkeFxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGZyb21JZHggPSBleGlzdGluZ1trZXldLmluZGV4O1xuICAgICAgICBleGlzdGluZ1trZXldID0ge1xuICAgICAgICAgIGFjdGlvbjogTU9WRSxcbiAgICAgICAgICBpbmRleDogbm9kZUlkeCxcbiAgICAgICAgICBmcm9tOiBmcm9tSWR4LFxuICAgICAgICAgIGVsZW1lbnQ6IGNhY2hlZC5ub2Rlc1tmcm9tSWR4XSB8fCAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBfYXBwbHlDaGFuZ2VzKGNoYW5nZSwgbmV3Q2FjaGVkKSB7XG4gICAgdmFyIGNoYW5nZUlkeCA9IGNoYW5nZS5pbmRleCxcbiAgICAgICAgYWN0aW9uID0gY2hhbmdlLmFjdGlvbjtcbiAgICBpZiAoYWN0aW9uID09PSBERUxFVElPTikge1xuICAgICAgY2xlYXIoY2FjaGVkW2NoYW5nZUlkeF0ubm9kZXMsIGNhY2hlZFtjaGFuZ2VJZHhdKTtcbiAgICAgIG5ld0NhY2hlZC5zcGxpY2UoY2hhbmdlSWR4LCAxKTtcbiAgICB9XG4gICAgaWYgKGFjdGlvbiA9PT0gSU5TRVJUSU9OKSB7XG4gICAgICB2YXIgZHVtbXkgPSAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBkdW1teS5zZXRBdHRyaWJ1dGUoJ2RhdGEtbXJlZicsIGNoYW5nZUlkeCk7XG4gICAgICB2YXIga2V5ID0gZGF0YVtjaGFuZ2VJZHhdLmF0dHJzLmtleTtcbiAgICAgIHBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKGR1bW15LCBwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbY2hhbmdlSWR4XSB8fCBudWxsKTtcbiAgICAgIG5ld0NhY2hlZC5zcGxpY2UoY2hhbmdlSWR4LCAwLCB7XG4gICAgICAgIGF0dHJzOiB7IGtleToga2V5IH0sXG4gICAgICAgIG5vZGVzOiBbZHVtbXldXG4gICAgICB9KTtcbiAgICAgIG5ld0NhY2hlZC5ub2Rlc1tjaGFuZ2VJZHhdID0gZHVtbXk7XG4gICAgfVxuXG4gICAgaWYgKGFjdGlvbiA9PT0gTU9WRSkge1xuICAgICAgY2hhbmdlLmVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRhLW1yZWYnLCBjaGFuZ2VJZHgpO1xuICAgICAgaWYgKHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tjaGFuZ2VJZHhdICE9PSBjaGFuZ2UuZWxlbWVudCAmJiBjaGFuZ2UuZWxlbWVudCAhPT0gbnVsbCkge1xuICAgICAgICBwYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZShjaGFuZ2UuZWxlbWVudCwgcGFyZW50RWxlbWVudC5jaGlsZE5vZGVzW2NoYW5nZUlkeF0gfHwgbnVsbCk7XG4gICAgICB9XG4gICAgICBuZXdDYWNoZWRbY2hhbmdlSWR4XSA9IGNhY2hlZFtjaGFuZ2UuZnJvbV07XG4gICAgICBuZXdDYWNoZWQubm9kZXNbY2hhbmdlSWR4XSA9IGNoYW5nZS5lbGVtZW50O1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBkaWZmQXJyYXlJdGVtKGRhdGEsIGNhY2hlZCwgcGFyZW50RWxlbWVudCwgcGFyZW50VGFnLCBpbmRleCwgc2hvdWxkUmVhdHRhY2gsIGludGFjdCwgZWRpdGFibGUsIG5hbWVzcGFjZSwgY29uZmlncykge1xuICB2YXIgc3ViQXJyYXlDb3VudCA9IDAsXG4gICAgICBjYWNoZUNvdW50ID0gMCxcbiAgICAgIG5vZGVzID0gW107XG4gIGRhdGEuZm9yRWFjaChfZGlmZkJ1aWxkSXRlbSk7XG4gIGlmICghaW50YWN0KSB7XG4gICAgLy9kaWZmIHRoZSBhcnJheSBpdHNlbGZcblxuICAgIC8vdXBkYXRlIHRoZSBsaXN0IG9mIERPTSBub2RlcyBieSBjb2xsZWN0aW5nIHRoZSBub2RlcyBmcm9tIGVhY2ggaXRlbVxuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBkYXRhLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBpZiAoY2FjaGVkW2ldICE9IG51bGwpIG5vZGVzLnB1c2guYXBwbHkobm9kZXMsIGNhY2hlZFtpXS5ub2Rlcyk7XG4gICAgfVxuICAgIC8vcmVtb3ZlIGl0ZW1zIGZyb20gdGhlIGVuZCBvZiB0aGUgYXJyYXkgaWYgdGhlIG5ldyBhcnJheSBpcyBzaG9ydGVyIHRoYW4gdGhlIG9sZCBvbmVcbiAgICAvL2lmIGVycm9ycyBldmVyIGhhcHBlbiBoZXJlLCB0aGUgaXNzdWUgaXMgbW9zdCBsaWtlbHkgYSBidWcgaW4gdGhlIGNvbnN0cnVjdGlvbiBvZiB0aGUgYGNhY2hlZGAgZGF0YSBzdHJ1Y3R1cmUgc29tZXdoZXJlIGVhcmxpZXIgaW4gdGhlIHByb2dyYW1cbiAgICBmb3IgKHZhciBpID0gMCwgbm9kZSA9IHVuZGVmaW5lZDsgbm9kZSA9IGNhY2hlZC5ub2Rlc1tpXTsgaSsrKSB7XG4gICAgICBpZiAobm9kZS5wYXJlbnROb2RlICE9IG51bGwgJiYgbm9kZXMuaW5kZXhPZihub2RlKSA8IDApIGNsZWFyKFtub2RlXSwgW2NhY2hlZFtpXV0pO1xuICAgIH1cbiAgICBpZiAoZGF0YS5sZW5ndGggPCBjYWNoZWQubGVuZ3RoKSBjYWNoZWQubGVuZ3RoID0gZGF0YS5sZW5ndGg7XG4gICAgY2FjaGVkLm5vZGVzID0gbm9kZXM7XG4gIH1cbiAgcmV0dXJuIGNhY2hlZDtcbiAgLy9oZWxwZXJzXG4gIGZ1bmN0aW9uIF9kaWZmQnVpbGRJdGVtKGRhdGFOb2RlKSB7XG4gICAgdmFyIGl0ZW0gPSBidWlsZChwYXJlbnRFbGVtZW50LCBwYXJlbnRUYWcsIGNhY2hlZCwgaW5kZXgsIGRhdGFOb2RlLCBjYWNoZWRbY2FjaGVDb3VudF0sIHNob3VsZFJlYXR0YWNoLCBpbmRleCArIHN1YkFycmF5Q291bnQgfHwgc3ViQXJyYXlDb3VudCwgZWRpdGFibGUsIG5hbWVzcGFjZSwgY29uZmlncyk7XG4gICAgaWYgKGl0ZW0gPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuICAgIGlmICghaXRlbS5ub2Rlcy5pbnRhY3QpIGludGFjdCA9IGZhbHNlO1xuICAgIGlmIChpdGVtLiR0cnVzdGVkKSB7XG4gICAgICAvL2ZpeCBvZmZzZXQgb2YgbmV4dCBlbGVtZW50IGlmIGl0ZW0gd2FzIGEgdHJ1c3RlZCBzdHJpbmcgdy8gbW9yZSB0aGFuIG9uZSBodG1sIGVsZW1lbnRcbiAgICAgIC8vdGhlIGZpcnN0IGNsYXVzZSBpbiB0aGUgcmVnZXhwIG1hdGNoZXMgZWxlbWVudHNcbiAgICAgIC8vdGhlIHNlY29uZCBjbGF1c2UgKGFmdGVyIHRoZSBwaXBlKSBtYXRjaGVzIHRleHQgbm9kZXNcbiAgICAgIHN1YkFycmF5Q291bnQgKz0gKGl0ZW0ubWF0Y2goLzxbXlxcL118XFw+XFxzKltePF0vZykgfHwgWzBdKS5sZW5ndGg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN1YkFycmF5Q291bnQgKz0gdHlwZShpdGVtKSA9PT0gJ2FycmF5JyA/IGl0ZW0ubGVuZ3RoIDogMTtcbiAgICB9XG4gICAgY2FjaGVkW2NhY2hlQ291bnQrK10gPSBpdGVtO1xuICB9XG59XG5cbmZ1bmN0aW9uIGRpZmZWTm9kZShkYXRhLCBjYWNoZWQsIHBhcmVudEVsZW1lbnQsIGluZGV4LCBzaG91bGRSZWF0dGFjaCwgZWRpdGFibGUsIG5hbWVzcGFjZSwgY29uZmlncykge1xuICB2YXIgdmlld3MgPSBbXSxcbiAgICAgIGNvbnRyb2xsZXJzID0gW10sXG4gICAgICBjb21wb25lbnROYW1lLFxuICAgICAgY29tcG9uZW50Q2FjaGU7XG4gIC8vcmVjb3JkIHRoZSBmaW5hbCBjb21wb25lbnQgbmFtZVxuICAvL2hhbmRsZSB0aGUgc2l0dWF0aW9uIHRoYXQgdk5vZGUgaXMgYSBjb21wb25lbnQoe3ZpZXcsIGNvbnRyb2xsZXJ9KTtcblxuICB3aGlsZSAoZGF0YS52aWV3KSB7XG4gICAgdmFyIGN1clZpZXcgPSBkYXRhLnZpZXc7XG4gICAgdmFyIHZpZXcgPSBkYXRhLnZpZXcuJG9yaWdpbmFsIHx8IGN1clZpZXc7XG4gICAgdmFyIGNvbnRyb2xsZXJJbmRleCA9IGNhY2hlZC52aWV3cyA/IGNhY2hlZC52aWV3cy5pbmRleE9mKHZpZXcpIDogLTE7XG4gICAgdmFyIGNvbnRyb2xsZXIgPSBjb250cm9sbGVySW5kZXggPiAtMSA/IGNhY2hlZC5jb250cm9sbGVyc1tjb250cm9sbGVySW5kZXhdIDogbmV3IChkYXRhLmNvbnRyb2xsZXIgfHwgTk9PUCkoKTtcbiAgICB2YXIgY29tcG9uZW50ID0gY29udHJvbGxlci5pbnN0YW5jZTtcbiAgICBpZiAodHlwZW9mIGNvbXBvbmVudCA9PT0gJ29iamVjdCcpIHtcbiAgICAgIC8vIGhhbmRsZSBjb21wb25lbnRcbiAgICAgIGNvbXBvbmVudE5hbWUgPSBjb21wb25lbnQubmFtZTtcbiAgICAgIGlmICh0eXBlb2YgY29tcG9uZW50LmNhY2hlZCA9PT0gJ29iamVjdCcpIGNvbXBvbmVudENhY2hlID0gY29tcG9uZW50LmNhY2hlZDtcbiAgICAgIGNvbXBvbmVudC52aWV3Rm4gPSBbY3VyVmlldywgY29udHJvbGxlcl07XG4gICAgfVxuXG4gICAgdmFyIGtleSA9IGRhdGEgJiYgZGF0YS5hdHRycyAmJiBkYXRhLmF0dHJzLmtleTtcbiAgICBkYXRhID0gZGF0YS52aWV3KGNvbnRyb2xsZXIpO1xuICAgIGlmIChkYXRhLnN1YnRyZWUgPT09ICdyZXRhaW4nKSByZXR1cm4gY29tcG9uZW50Q2FjaGUgPyBjb21wb25lbnRDYWNoZSA6IGNhY2hlZDtcbiAgICBpZiAoa2V5ICE9IG51bGwpIHtcbiAgICAgIGlmICghZGF0YS5hdHRycykgZGF0YS5hdHRycyA9IHt9O1xuICAgICAgZGF0YS5hdHRycy5rZXkgPSBrZXk7XG4gICAgfVxuICAgIGlmIChjb250cm9sbGVyLm9udW5sb2FkKSBHLnVubG9hZGVycy5zZXQoY29udHJvbGxlciwgY29udHJvbGxlci5vbnVubG9hZCk7XG4gICAgdmlld3MucHVzaCh2aWV3KTtcbiAgICBjb250cm9sbGVycy5wdXNoKGNvbnRyb2xsZXIpO1xuICB9XG5cbiAgLy90aGUgcmVzdWx0IG9mIHZpZXcgZnVuY3Rpb24gbXVzdCBiZSBhIHNpZ2xlIHJvb3Qgdk5vZGUsXG4gIC8vbm90IGEgYXJyYXkgb3Igc3RyaW5nXG4gIGlmICghZGF0YS50YWcgJiYgY29udHJvbGxlcnMubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoJ0NvbXBvbmVudCB0ZW1wbGF0ZSBtdXN0IHJldHVybiBhIHZpcnR1YWwgZWxlbWVudCwgbm90IGFuIGFycmF5LCBzdHJpbmcsIGV0Yy4nKTtcbiAgaWYgKCFkYXRhLmF0dHJzKSBkYXRhLmF0dHJzID0ge307XG4gIGlmIChjb21wb25lbnRDYWNoZSAhPSBudWxsKSBjYWNoZWQgPSBjb21wb25lbnRDYWNoZTtcbiAgaWYgKCFjYWNoZWQuYXR0cnMpIGNhY2hlZC5hdHRycyA9IHt9O1xuICAvL2lmIGFuIGVsZW1lbnQgaXMgZGlmZmVyZW50IGVub3VnaCBmcm9tIHRoZSBvbmUgaW4gY2FjaGUsIHJlY3JlYXRlIGl0XG4gIGlmIChkYXRhLnRhZyAhPSBjYWNoZWQudGFnIHx8ICFfaGFzU2FtZUtleXMoZGF0YS5hdHRycywgY2FjaGVkLmF0dHJzKSB8fCBkYXRhLmF0dHJzLmlkICE9IGNhY2hlZC5hdHRycy5pZCB8fCBkYXRhLmF0dHJzLmtleSAhPSBjYWNoZWQuYXR0cnMua2V5IHx8IHR5cGUoY29tcG9uZW50TmFtZSkgPT09ICdzdHJpbmcnICYmIGNhY2hlZC5jb21wb25lbnROYW1lICE9IGNvbXBvbmVudE5hbWUpIHtcbiAgICBpZiAoY2FjaGVkLm5vZGVzLmxlbmd0aCkgY2xlYXIoY2FjaGVkLm5vZGVzLCBjYWNoZWQpO1xuICB9XG5cbiAgaWYgKHR5cGUoZGF0YS50YWcpICE9PSAnc3RyaW5nJykgcmV0dXJuO1xuXG4gIHZhciBpc05ldyA9IGNhY2hlZC5ub2Rlcy5sZW5ndGggPT09IDAsXG4gICAgICBkYXRhQXR0cktleXMgPSBPYmplY3Qua2V5cyhkYXRhLmF0dHJzKSxcbiAgICAgIGhhc0tleXMgPSBkYXRhQXR0cktleXMubGVuZ3RoID4gKCdrZXknIGluIGRhdGEuYXR0cnMgPyAxIDogMCksXG4gICAgICBkb21Ob2RlLFxuICAgICAgbmV3Tm9kZUlkeDtcbiAgaWYgKGRhdGEuYXR0cnMueG1sbnMpIG5hbWVzcGFjZSA9IGRhdGEuYXR0cnMueG1sbnM7ZWxzZSBpZiAoZGF0YS50YWcgPT09ICdzdmcnKSBuYW1lc3BhY2UgPSAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnO2Vsc2UgaWYgKGRhdGEudGFnID09PSAnbWF0aCcpIG5hbWVzcGFjZSA9ICdodHRwOi8vd3d3LnczLm9yZy8xOTk4L01hdGgvTWF0aE1MJztcblxuICBpZiAoaXNOZXcpIHtcbiAgICB2YXIgX25ld0VsZW1lbnQyID0gX25ld0VsZW1lbnQocGFyZW50RWxlbWVudCwgbmFtZXNwYWNlLCBkYXRhLCBpbmRleCk7XG5cbiAgICBkb21Ob2RlID0gX25ld0VsZW1lbnQyWzBdO1xuICAgIG5ld05vZGVJZHggPSBfbmV3RWxlbWVudDJbMV07XG5cbiAgICBjYWNoZWQgPSB7XG4gICAgICB0YWc6IGRhdGEudGFnLFxuICAgICAgLy9zZXQgYXR0cmlidXRlcyBmaXJzdCwgdGhlbiBjcmVhdGUgY2hpbGRyZW5cbiAgICAgIGF0dHJzOiBoYXNLZXlzID8gc2V0QXR0cmlidXRlcyhkb21Ob2RlLCBkYXRhLnRhZywgZGF0YS5hdHRycywge30sIG5hbWVzcGFjZSkgOiBkYXRhLmF0dHJzLFxuICAgICAgY2hpbGRyZW46IGRhdGEuY2hpbGRyZW4gIT0gbnVsbCAmJiBkYXRhLmNoaWxkcmVuLmxlbmd0aCA+IDAgPyBidWlsZChkb21Ob2RlLCBkYXRhLnRhZywgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGRhdGEuY2hpbGRyZW4sIGNhY2hlZC5jaGlsZHJlbiwgdHJ1ZSwgMCwgZGF0YS5hdHRycy5jb250ZW50ZWRpdGFibGUgPyBkb21Ob2RlIDogZWRpdGFibGUsIG5hbWVzcGFjZSwgY29uZmlncykgOiBkYXRhLmNoaWxkcmVuLFxuICAgICAgbm9kZXM6IFtkb21Ob2RlXVxuICAgIH07XG4gICAgaWYgKGNvbnRyb2xsZXJzLmxlbmd0aCkge1xuICAgICAgY2FjaGVkLnZpZXdzID0gdmlld3M7XG4gICAgICBjYWNoZWQuY29udHJvbGxlcnMgPSBjb250cm9sbGVycztcbiAgICB9XG5cbiAgICBpZiAoY2FjaGVkLmNoaWxkcmVuICYmICFjYWNoZWQuY2hpbGRyZW4ubm9kZXMpIGNhY2hlZC5jaGlsZHJlbi5ub2RlcyA9IFtdO1xuICAgIC8vZWRnZSBjYXNlOiBzZXR0aW5nIHZhbHVlIG9uIDxzZWxlY3Q+IGRvZXNuJ3Qgd29yayBiZWZvcmUgY2hpbGRyZW4gZXhpc3QsIHNvIHNldCBpdCBhZ2FpbiBhZnRlciBjaGlsZHJlbiBoYXZlIGJlZW4gY3JlYXRlZFxuICAgIGlmIChkYXRhLnRhZyA9PT0gJ3NlbGVjdCcgJiYgJ3ZhbHVlJyBpbiBkYXRhLmF0dHJzKSBzZXRBdHRyaWJ1dGVzKGRvbU5vZGUsIGRhdGEudGFnLCB7IHZhbHVlOiBkYXRhLmF0dHJzLnZhbHVlIH0sIHt9LCBuYW1lc3BhY2UpO1xuXG4gICAgaWYgKG5ld05vZGVJZHggIT0gbnVsbCkgcGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUoZG9tTm9kZSwgcGFyZW50RWxlbWVudC5jaGlsZE5vZGVzW25ld05vZGVJZHhdIHx8IG51bGwpO1xuICB9IGVsc2Uge1xuICAgIGRvbU5vZGUgPSBjYWNoZWQubm9kZXNbMF07XG4gICAgaWYgKGhhc0tleXMpIHNldEF0dHJpYnV0ZXMoZG9tTm9kZSwgZGF0YS50YWcsIGRhdGEuYXR0cnMsIGNhY2hlZC5hdHRycywgbmFtZXNwYWNlKTtcbiAgICBjYWNoZWQuY2hpbGRyZW4gPSBidWlsZChkb21Ob2RlLCBkYXRhLnRhZywgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGRhdGEuY2hpbGRyZW4sIGNhY2hlZC5jaGlsZHJlbiwgZmFsc2UsIDAsIGRhdGEuYXR0cnMuY29udGVudGVkaXRhYmxlID8gZG9tTm9kZSA6IGVkaXRhYmxlLCBuYW1lc3BhY2UsIGNvbmZpZ3MpO1xuICAgIGNhY2hlZC5ub2Rlcy5pbnRhY3QgPSB0cnVlO1xuICAgIGlmIChjb250cm9sbGVycy5sZW5ndGgpIHtcbiAgICAgIGNhY2hlZC52aWV3cyA9IHZpZXdzO1xuICAgICAgY2FjaGVkLmNvbnRyb2xsZXJzID0gY29udHJvbGxlcnM7XG4gICAgfVxuICAgIGlmIChzaG91bGRSZWF0dGFjaCA9PT0gdHJ1ZSAmJiBkb21Ob2RlICE9IG51bGwpIHBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKGRvbU5vZGUsIHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tpbmRleF0gfHwgbnVsbCk7XG4gIH1cbiAgaWYgKHR5cGUoY29tcG9uZW50TmFtZSkgPT09ICdzdHJpbmcnKSB7XG4gICAgY2FjaGVkLmNvbXBvbmVudE5hbWUgPSBjb21wb25lbnROYW1lO1xuICB9XG4gIC8vc2NoZWR1bGUgY29uZmlncyB0byBiZSBjYWxsZWQuIFRoZXkgYXJlIGNhbGxlZCBhZnRlciBgYnVpbGRgIGZpbmlzaGVzIHJ1bm5pbmdcbiAgaWYgKHR5cGUoZGF0YS5hdHRycy5jb25maWcpID09PSAnZnVuY3Rpb24nKSB7XG4gICAgdmFyIGNvbnRleHQgPSBjYWNoZWQuY29uZmlnQ29udGV4dCA9IGNhY2hlZC5jb25maWdDb250ZXh0IHx8IHt9O1xuXG4gICAgLy8gYmluZFxuICAgIHZhciBjYWxsYmFjayA9IGZ1bmN0aW9uIChkYXRhLCBhcmdzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gZGF0YS5hdHRycy5jb25maWcuYXBwbHkoZGF0YSwgYXJncyk7XG4gICAgICB9O1xuICAgIH07XG4gICAgY29uZmlncy5wdXNoKGNhbGxiYWNrKGRhdGEsIFtkb21Ob2RlLCAhaXNOZXcsIGNvbnRleHQsIGNhY2hlZCwgW3BhcmVudEVsZW1lbnQsIGluZGV4LCBlZGl0YWJsZSwgbmFtZXNwYWNlXV0pKTtcbiAgfVxuICByZXR1cm4gY2FjaGVkO1xufVxuZnVuY3Rpb24gX25ld0VsZW1lbnQocGFyZW50RWxlbWVudCwgbmFtZXNwYWNlLCBkYXRhLCBpbmRleCkge1xuICB2YXIgZG9tTm9kZSxcbiAgICAgIGRvbU5vZGVJbmRleCxcbiAgICAgIGluc2VydElkeCA9IGluZGV4O1xuICBpZiAocGFyZW50RWxlbWVudCAmJiBwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXMubGVuZ3RoKSB7XG4gICAgZG9tTm9kZUluZGV4ID0gX2ZpbmREb21Ob2RlQnlSZWYocGFyZW50RWxlbWVudCwgaW5kZXgpO1xuICAgIGlmIChkb21Ob2RlSW5kZXggJiYgZG9tTm9kZUluZGV4WzBdKSB7XG4gICAgICBpbnNlcnRJZHggPSBkb21Ob2RlSW5kZXhbMV07XG4gICAgICBpZiAoZG9tTm9kZUluZGV4WzBdLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PSBkYXRhLnRhZy50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgIHJldHVybiBbZG9tTm9kZUluZGV4WzBdLCBudWxsXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNsZWFyKFtkb21Ob2RlSW5kZXhbMF1dKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaWYgKGRhdGEuYXR0cnMuaXMpIGRvbU5vZGUgPSBuYW1lc3BhY2UgPT09IHVuZGVmaW5lZCA/ICRkb2N1bWVudC5jcmVhdGVFbGVtZW50KGRhdGEudGFnLCBkYXRhLmF0dHJzLmlzKSA6ICRkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobmFtZXNwYWNlLCBkYXRhLnRhZywgZGF0YS5hdHRycy5pcyk7ZWxzZSBkb21Ob2RlID0gbmFtZXNwYWNlID09PSB1bmRlZmluZWQgPyAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudChkYXRhLnRhZykgOiAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZSwgZGF0YS50YWcpO1xuICBkb21Ob2RlLnNldEF0dHJpYnV0ZSgnZGF0YS1tcmVmJywgaW5kZXgpO1xuICByZXR1cm4gW2RvbU5vZGUsIGluc2VydElkeF07XG59XG5mdW5jdGlvbiBfZmluZERvbU5vZGVCeVJlZihwYXJlbnRFbGVtZW50LCByZWYpIHtcbiAgdmFyIGkgPSAwLFxuICAgICAgbCA9IHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlcy5sZW5ndGgsXG4gICAgICBjaGlsZE5vZGU7XG4gIGZvciAoOyBpIDwgbDsgaSsrKSB7XG4gICAgY2hpbGROb2RlID0gcGFyZW50RWxlbWVudC5jaGlsZE5vZGVzW2ldO1xuICAgIGlmIChjaGlsZE5vZGUuZ2V0QXR0cmlidXRlICYmIGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbXJlZicpID09IHJlZikge1xuICAgICAgcmV0dXJuIFtjaGlsZE5vZGUsIGldO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gZGlmZlRleHROb2RlKGRhdGEsIGNhY2hlZCwgcGFyZW50RWxlbWVudCwgcGFyZW50VGFnLCBpbmRleCwgc2hvdWxkUmVhdHRhY2gsIGVkaXRhYmxlKSB7XG4gIC8vaGFuZGxlIHRleHQgbm9kZXNcbiAgdmFyIG5vZGVzO1xuICBpZiAoY2FjaGVkLm5vZGVzLmxlbmd0aCA9PT0gMCkge1xuICAgIGlmIChkYXRhID09ICcnKSByZXR1cm4gY2FjaGVkO1xuICAgIGNsZWFyKFtwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbaW5kZXhdXSk7XG4gICAgaWYgKGRhdGEuJHRydXN0ZWQpIHtcbiAgICAgIG5vZGVzID0gaW5qZWN0SFRNTChwYXJlbnRFbGVtZW50LCBpbmRleCwgZGF0YSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vZGVzID0gWyRkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkYXRhKV07XG4gICAgICBpZiAoIXBhcmVudEVsZW1lbnQubm9kZU5hbWUubWF0Y2goVk9JRF9FTEVNRU5UUykpIHBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKG5vZGVzWzBdLCBwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbaW5kZXhdIHx8IG51bGwpO1xuICAgIH1cbiAgICBjYWNoZWQgPSAnc3RyaW5nIG51bWJlciBib29sZWFuJy5pbmRleE9mKHR5cGVvZiBkYXRhKSA+IC0xID8gbmV3IGRhdGEuY29uc3RydWN0b3IoZGF0YSkgOiBkYXRhO1xuICAgIGNhY2hlZC5ub2RlcyA9IG5vZGVzO1xuICB9IGVsc2UgaWYgKGNhY2hlZC52YWx1ZU9mKCkgIT09IGRhdGEudmFsdWVPZigpIHx8IHNob3VsZFJlYXR0YWNoID09PSB0cnVlKSB7XG4gICAgbm9kZXMgPSBjYWNoZWQubm9kZXM7XG4gICAgaWYgKCFlZGl0YWJsZSB8fCBlZGl0YWJsZSAhPT0gJGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpIHtcbiAgICAgIGlmIChkYXRhLiR0cnVzdGVkKSB7XG4gICAgICAgIGNsZWFyKG5vZGVzLCBjYWNoZWQpO1xuICAgICAgICBub2RlcyA9IGluamVjdEhUTUwocGFyZW50RWxlbWVudCwgaW5kZXgsIGRhdGEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy9jb3JuZXIgY2FzZTogcmVwbGFjaW5nIHRoZSBub2RlVmFsdWUgb2YgYSB0ZXh0IG5vZGUgdGhhdCBpcyBhIGNoaWxkIG9mIGEgdGV4dGFyZWEvY29udGVudGVkaXRhYmxlIGRvZXNuJ3Qgd29ya1xuICAgICAgICAvL3dlIG5lZWQgdG8gdXBkYXRlIHRoZSB2YWx1ZSBwcm9wZXJ0eSBvZiB0aGUgcGFyZW50IHRleHRhcmVhIG9yIHRoZSBpbm5lckhUTUwgb2YgdGhlIGNvbnRlbnRlZGl0YWJsZSBlbGVtZW50IGluc3RlYWRcbiAgICAgICAgaWYgKHBhcmVudFRhZyA9PT0gJ3RleHRhcmVhJykgcGFyZW50RWxlbWVudC52YWx1ZSA9IGRhdGE7ZWxzZSBpZiAoZWRpdGFibGUpIGVkaXRhYmxlLmlubmVySFRNTCA9IGRhdGE7ZWxzZSB7XG4gICAgICAgICAgaWYgKG5vZGVzWzBdLm5vZGVUeXBlID09PSAxIHx8IG5vZGVzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIC8vd2FzIGEgdHJ1c3RlZCBzdHJpbmdcbiAgICAgICAgICAgIGNsZWFyKGNhY2hlZC5ub2RlcywgY2FjaGVkKTtcbiAgICAgICAgICAgIG5vZGVzID0gWyRkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkYXRhKV07XG4gICAgICAgICAgfVxuICAgICAgICAgIHBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKG5vZGVzWzBdLCBwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbaW5kZXhdIHx8IG51bGwpO1xuICAgICAgICAgIG5vZGVzWzBdLm5vZGVWYWx1ZSA9IGRhdGE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgY2FjaGVkID0gbmV3IGRhdGEuY29uc3RydWN0b3IoZGF0YSk7XG4gICAgY2FjaGVkLm5vZGVzID0gbm9kZXM7XG4gIH0gZWxzZSBjYWNoZWQubm9kZXMuaW50YWN0ID0gdHJ1ZTtcbiAgcmV0dXJuIGNhY2hlZDtcbn1cblxuLy9oZWxwZXJzXG5mdW5jdGlvbiBfcmVjdXJzaXZlRmxhdHRlbihhcnIpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBhcnIgbWF5IGJlIG1vZGlmaWVkLCBleC4gbm9kZWxpc3RcbiAgICBpZiAodHlwZShhcnJbaV0pID09PSAnYXJyYXknKSB7XG4gICAgICBhcnIgPSBhcnIuY29uY2F0LmFwcGx5KFtdLCBhcnIpO1xuICAgICAgaS0tOyAvL2NoZWNrIGN1cnJlbnQgaW5kZXggYWdhaW4gYW5kIGZsYXR0ZW4gdW50aWwgdGhlcmUgYXJlIG5vIG1vcmUgbmVzdGVkIGFycmF5cyBhdCB0aGF0IGluZGV4XG4gICAgfVxuICB9XG4gIHJldHVybiBhcnI7XG59XG5mdW5jdGlvbiBfaGFzU2FtZUtleXMobzEsIG8yKSB7XG4gIHZhciBvMUtleXMgPSBPYmplY3Qua2V5cyhvMSkuc29ydCgpLmpvaW4oKSxcbiAgICAgIG8yS2V5cyA9IE9iamVjdC5rZXlzKG8yKS5zb3J0KCkuam9pbigpO1xuICByZXR1cm4gbzFLZXlzID09PSBvMktleXM7XG59XG5mdW5jdGlvbiBpbmplY3RIVE1MKHBhcmVudEVsZW1lbnQsIGluZGV4LCBkYXRhKSB7XG4gIHZhciBuZXh0U2libGluZyA9IHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tpbmRleF07XG4gIGlmIChuZXh0U2libGluZykge1xuICAgIHZhciBpc0VsZW1lbnQgPSBuZXh0U2libGluZy5ub2RlVHlwZSAhPT0gMTtcbiAgICB2YXIgcGxhY2Vob2xkZXIgPSAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgIGlmIChpc0VsZW1lbnQpIHtcbiAgICAgIHBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKHBsYWNlaG9sZGVyLCBuZXh0U2libGluZyB8fCBudWxsKTtcbiAgICAgIHBsYWNlaG9sZGVyLmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlYmVnaW4nLCBkYXRhKTtcbiAgICAgIHBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQocGxhY2Vob2xkZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXh0U2libGluZy5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWJlZ2luJywgZGF0YSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHBhcmVudEVsZW1lbnQuaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmVlbmQnLCBkYXRhKTtcbiAgfVxuICB2YXIgbm9kZXMgPSBbXSxcbiAgICAgIGNoaWxkTm9kZTtcbiAgd2hpbGUgKChjaGlsZE5vZGUgPSBwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbaW5kZXgrK10pICE9PSBuZXh0U2libGluZykge1xuICAgIG5vZGVzLnB1c2goY2hpbGROb2RlKTtcbiAgfVxuICByZXR1cm4gbm9kZXM7XG59IiwiaW1wb3J0IHsgZG9jdW1lbnQgYXMgJGRvY3VtZW50LCBHIH0gZnJvbSAnLi4vZ2xvYmFscyc7XG5pbXBvcnQgYnVpbGQgZnJvbSAnLi9idWlsZCc7XG5pbXBvcnQgY2xlYXIgZnJvbSAnLi9jbGVhcic7XG5cbmV4cG9ydCB7IHJlbmRlciwgX3JlbmRlciB9O1xuZnVuY3Rpb24gcmVuZGVyKHJvb3QsIHZOb2RlLCBmb3JjZVJlY3JlYXRpb24sIGZvcmNlKSB7XG4gIHZhciB0YXNrID0ge1xuICAgIHJvb3Q6IHJvb3QsXG4gICAgdk5vZGU6IHZOb2RlLFxuICAgIGZvcmNlUmVjcmVhdGlvbjogZm9yY2VSZWNyZWF0aW9uXG4gIH07XG4gIGlmIChmb3JjZSA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiBfcmVuZGVyKHRhc2spO1xuICB9XG4gIEcucmVuZGVyUXVldWUuYWRkVGFyZ2V0KHtcbiAgICBtZXJnZVR5cGU6IDEsIC8vIHJlcGxhY2VcbiAgICByb290OiByb290LFxuICAgIHByb2Nlc3NvcjogX3JlbmRlcixcbiAgICBwYXJhbXM6IFt0YXNrXVxuICB9KTtcbn1cbnZhciBodG1sO1xudmFyIGRvY3VtZW50Tm9kZSA9IHtcbiAgYXBwZW5kQ2hpbGQ6IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgaWYgKGh0bWwgPT09IHVuZGVmaW5lZCkgaHRtbCA9ICRkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdodG1sJyk7XG4gICAgaWYgKCRkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgJGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAhPT0gbm9kZSkge1xuICAgICAgJGRvY3VtZW50LnJlcGxhY2VDaGlsZChub2RlLCAkZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgJGRvY3VtZW50LmFwcGVuZENoaWxkKG5vZGUpO1xuICAgIH1cbiAgICB0aGlzLmNoaWxkTm9kZXMgPSAkZG9jdW1lbnQuY2hpbGROb2RlcztcbiAgfSxcbiAgaW5zZXJ0QmVmb3JlOiBmdW5jdGlvbiAobm9kZSkge1xuICAgIHRoaXMuYXBwZW5kQ2hpbGQobm9kZSk7XG4gIH0sXG4gIGNoaWxkTm9kZXM6IFtdXG59O1xuLy8gdmFyIGRvbU5vZGVDYWNoZSA9IFtdLCB2Tm9kZUNhY2hlID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbnZhciBkb21DYWNoZU1hcCA9IEcuZG9tQ2FjaGVNYXA7XG5mdW5jdGlvbiBfcmVuZGVyKHRhc2spIHtcbiAgdmFyIHJvb3QgPSB0YXNrLnJvb3Q7XG4gIHZhciB2Tm9kZSA9IHRhc2sudk5vZGU7XG4gIHZhciBmb3JjZVJlY3JlYXRpb24gPSB0YXNrLmZvcmNlUmVjcmVhdGlvbjtcblxuICBpZiAoIXJvb3QpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0Vuc3VyZSB0aGUgRE9NIGVsZW1lbnQgYmVpbmcgcGFzc2VkIHRvIG0ucm91dGUvbS5tb3VudC9tLnJlbmRlciBpcyBub3QgdW5kZWZpbmVkLicpO1xuICB9XG4gIHZhciBjb25maWdzID0gW10sXG4gICAgICBpc0RvY3VtZW50Um9vdCA9IHJvb3QgPT09ICRkb2N1bWVudCB8fCByb290ID09PSAkZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LFxuICAgICAgZG9tTm9kZSA9IGlzRG9jdW1lbnRSb290ID8gZG9jdW1lbnROb2RlIDogcm9vdCxcbiAgICAgIHZOb2RlQ2FjaGU7XG4gIGlmIChpc0RvY3VtZW50Um9vdCAmJiB2Tm9kZS50YWcgIT09ICdodG1sJykge1xuICAgIHZOb2RlID0geyB0YWc6ICdodG1sJywgYXR0cnM6IHt9LCBjaGlsZHJlbjogdk5vZGUgfTtcbiAgfVxuXG4gIGlmIChmb3JjZVJlY3JlYXRpb24pIHtcbiAgICByZXNldChkb21Ob2RlKTtcbiAgfVxuICB2Tm9kZUNhY2hlID0gYnVpbGQoZG9tTm9kZSwgbnVsbCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHZOb2RlLCBkb21DYWNoZU1hcC5nZXQoZG9tTm9kZSksIGZhbHNlLCAwLCBudWxsLCB1bmRlZmluZWQsIGNvbmZpZ3MpO1xuICBjb25maWdzLmZvckVhY2goZnVuY3Rpb24gKG9uUmVuZGVyKSB7XG4gICAgb25SZW5kZXIoKTtcbiAgfSk7XG4gIGRvbUNhY2hlTWFwLnNldChkb21Ob2RlLCB2Tm9kZUNhY2hlKTtcbn1cblxuZnVuY3Rpb24gcmVzZXQocm9vdCkge1xuICBjbGVhcihyb290LmNoaWxkTm9kZXMsIGRvbUNhY2hlTWFwLmdldChyb290KSk7XG4gIGRvbUNhY2hlTWFwLnJlbW92ZShyb290KTtcbn0iLCJpbXBvcnQgbSBmcm9tICcuL20nO1xuaW1wb3J0IHsgcmVuZGVyIH0gZnJvbSAnLi9yZW5kZXInO1xuZXhwb3J0IHsgbSwgcmVuZGVyIH07IiwiXG5leHBvcnQgZGVmYXVsdCB1cGRhdGU7aW1wb3J0IHsgdHlwZSB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB7IEcgfSBmcm9tICcuLi9nbG9iYWxzJztcbmltcG9ydCB7IHJlbmRlciwgX3JlbmRlciB9IGZyb20gJy4uL3JlbmRlci9yZW5kZXInO1xuaW1wb3J0IHsgRlJBTUVfQlVER0VUIH0gZnJvbSAnLi9yYWYnO1xuLy9nbG9iYWwgcmVuZGVyIHF1ZXVlIHNldHRpbmdcbnZhciByZW5kZXJRdWV1ZSA9IEcucmVuZGVyUXVldWUub25GaW5pc2goX29uRmluaXNoKTtcbnZhciByZWRyYXdpbmcgPSBmYWxzZTtcbmZ1bmN0aW9uIHVwZGF0ZShmb3JjZSkge1xuICBpZiAocmVkcmF3aW5nID09PSB0cnVlKSByZXR1cm47XG4gIHJlZHJhd2luZyA9IHRydWU7XG4gIGlmIChmb3JjZSA9PT0gdHJ1ZSkgRy5mb3JjaW5nID0gdHJ1ZTtcbiAgX3VwZGF0ZVJvb3RzKGZvcmNlKTtcbiAgcmVkcmF3aW5nID0gZmFsc2U7XG59XG5cbjtcbmZ1bmN0aW9uIF91cGRhdGVSb290cyhmb3JjZSkge1xuICB2YXIgcm9vdCwgY29tcG9uZW50LCBjb250cm9sbGVyLCBuZWVkUmVjcmVhdGlvbiwgdGFzaztcbiAgaWYgKHJlbmRlclF1ZXVlLmxlbmd0aCgpID09PSAwIHx8IGZvcmNlID09PSB0cnVlKSB7XG4gICAgaWYgKHR5cGUoRy5jb21wdXRlUHJlUmVkcmF3SG9vaykgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIEcuY29tcHV0ZVByZVJlZHJhd0hvb2soKTtcbiAgICAgIEcuY29tcHV0ZVByZVJlZHJhd0hvb2sgPSBudWxsO1xuICAgIH1cbiAgfVxuICBpZiAocmVuZGVyUXVldWUubGVuZ3RoKCkgPiAwKSB7XG4gICAgcmVuZGVyUXVldWUuc3RvcCgpO1xuICB9XG4gIGZvciAodmFyIGkgPSAwLCBsID0gRy5yb290cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICByb290ID0gRy5yb290c1tpXTtcbiAgICBjb21wb25lbnQgPSBHLmNvbXBvbmVudHNbaV07XG4gICAgY29udHJvbGxlciA9IEcuY29udHJvbGxlcnNbaV07XG4gICAgbmVlZFJlY3JlYXRpb24gPSBHLnJlY3JlYXRpb25zW2ldO1xuICAgIGlmIChjb250cm9sbGVyKSB7XG4gICAgICBpZiAodHlwZW9mIGNvbnRyb2xsZXIuaW5zdGFuY2UgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGNvbnRyb2xsZXIuaW5zdGFuY2UucmVkcmF3ID0gZnVuY3Rpb24gY29tcG9uZW50UmVkcmF3KCkge1xuICAgICAgICAgIHJlbmRlclF1ZXVlLmFkZFRhcmdldCh7XG4gICAgICAgICAgICBtZXJnZVR5cGU6IDAsIC8vIGNvbnRhaW5cbiAgICAgICAgICAgIHByb2Nlc3NvcjogX3JlbmRlcixcbiAgICAgICAgICAgIHJvb3Q6IHJvb3QsXG4gICAgICAgICAgICBwYXJhbXM6IFt7XG4gICAgICAgICAgICAgIHJvb3Q6IHJvb3QsXG4gICAgICAgICAgICAgIHZOb2RlOiBjb21wb25lbnQudmlldyA/IGNvbXBvbmVudC52aWV3KGNvbnRyb2xsZXIpIDogJycsXG4gICAgICAgICAgICAgIGZvcmNlUmVjcmVhdGlvbjogZmFsc2VcbiAgICAgICAgICAgIH1dXG4gICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZW5kZXIocm9vdCwgY29tcG9uZW50LnZpZXcgPyBjb21wb25lbnQudmlldyhjb250cm9sbGVyKSA6ICcnLCBuZWVkUmVjcmVhdGlvbiwgZm9yY2UpO1xuICAgIH1cbiAgICAvL3Jlc2V0IGJhY2sgdG8gbm90IGRlc3Ryb3kgcm9vdCdzIGNoaWxkcmVuXG4gICAgRy5yZWNyZWF0aW9uc1tpXSA9IHZvaWQgMDtcbiAgfVxuICBpZiAoZm9yY2UgPT09IHRydWUpIHtcbiAgICBfb25GaW5pc2goKTtcbiAgICBHLmZvcmNpbmcgPSBmYWxzZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfb25GaW5pc2goKSB7XG4gIGlmICh0eXBlKEcuY29tcHV0ZVBvc3RSZWRyYXdIb29rKSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIEcuY29tcHV0ZVBvc3RSZWRyYXdIb29rKCk7XG4gICAgRy5jb21wdXRlUG9zdFJlZHJhd0hvb2sgPSBudWxsO1xuICB9XG59IiwiaW1wb3J0IHJlZHJhdyBmcm9tICcuL3VwZGF0ZSc7XG5pbXBvcnQgeyBnZXRQYXJlbnRFbEZyb20gfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgeyBHIH0gZnJvbSAnLi4vZ2xvYmFscyc7XG4vL3JlbmRlciBxdWV1ZSBzZXR0aW5nXG5HLnJlbmRlclF1ZXVlLm9uRmx1c2gob25GbHVzaCkub25BZGRUYXJnZXQob25NZXJnZVRhc2spO1xuXG5leHBvcnQgeyByZWRyYXcgfTtcblxuZnVuY3Rpb24gb25GbHVzaCh0YXNrKSB7XG4gIHZhciBwcm9jZXNzb3IgPSB0YXNrLnByb2Nlc3NvcjtcbiAgdmFyIHBhcmFtcyA9IHRhc2sucGFyYW1zO1xuXG4gIGlmICh0eXBlb2YgcHJvY2Vzc29yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcHJvY2Vzc29yLmFwcGx5KG51bGwsIHBhcmFtcyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gb25NZXJnZVRhc2socXVldWUsIHRhc2spIHtcbiAgdmFyIGksIGwsIHJlbW92ZUlkeCwgdGFza1RvUHVzaDtcbiAgZm9yIChpID0gMCwgbCA9IHF1ZXVlLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIHRhc2tUb1B1c2ggPSBjYW5CZU1lcmdlZChxdWV1ZVtpXSwgdGFzayk7XG4gICAgaWYgKHRhc2tUb1B1c2gpIHtcbiAgICAgIHJlbW92ZUlkeCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgaWYgKHJlbW92ZUlkeCA+IC0xKSB7XG4gICAgcXVldWUuc3BsaWNlKHJlbW92ZUlkeCwgMSk7XG4gICAgcXVldWUucHVzaCh0YXNrVG9QdXNoKTtcbiAgfSBlbHNlIHtcbiAgICBxdWV1ZS5wdXNoKHRhc2spO1xuICB9XG5cbiAgcmV0dXJuIHF1ZXVlO1xufVxuZnVuY3Rpb24gY2FuQmVNZXJnZWQodGFza0luUSwgdGFzaykge1xuICB2YXIgaW5RUm9vdCA9IHRhc2tJblEucm9vdCxcbiAgICAgIHRSb290ID0gdGFzay5yb290O1xuICBpZiAodGFza0luUS5tZXJnZVR5cGUgJiB0YXNrLm1lcmdlVHlwZSkge1xuICAgIC8vIGF0IGxlYXN0IG9uZSBvZiB0aGVtIGFyZSByZXBsYWNlXG4gICAgcmV0dXJuIGluUVJvb3QgPT09IHRSb290ID8gdGFzayA6IG51bGw7XG4gIH0gZWxzZSB7XG4gICAgLy8gYm90aCBvZiB0aGVtIGFyZSBjb250YWluXG4gICAgdmFyIHBhcmVudCA9IGdldFBhcmVudEVsRnJvbShpblFSb290LCB0Um9vdCk7XG4gICAgcmV0dXJuICFwYXJlbnQgPyBudWxsIDogcGFyZW50ID09PSBpblFSb290ID8gdGFza0luUSA6IHRhc2s7XG4gIH1cbn0iLCJcblxuZXhwb3J0IGRlZmF1bHQgY29tcG9uZW50aXplO1xuaW1wb3J0IHsgc2xpY2UsIE5PT1AgfSBmcm9tICcuLi91dGlscyc7XG5mdW5jdGlvbiBwYXJhbWV0ZXJpemUoY29tcG9uZW50LCBhcmdzKSB7XG4gIHZhciBjb250cm9sbGVyID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAoY29tcG9uZW50LmNvbnRyb2xsZXIgfHwgTk9PUCkuYXBwbHkodGhpcywgYXJncykgfHwgdGhpcztcbiAgfTtcblxuICB2YXIgdmlldyA9IGZ1bmN0aW9uIChjdHJsKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSBhcmdzID0gYXJncy5jb25jYXQoc2xpY2UoYXJndW1lbnRzLCAxKSk7XG4gICAgcmV0dXJuIGNvbXBvbmVudC52aWV3LmFwcGx5KGNvbXBvbmVudCwgYXJncy5sZW5ndGggPyBbY3RybF0uY29uY2F0KGFyZ3MpIDogW2N0cmxdKTtcbiAgfTtcbiAgdmlldy4kb3JpZ2luYWwgPSBjb21wb25lbnQudmlldztcbiAgdmFyIG91dHB1dCA9IHsgY29udHJvbGxlcjogY29udHJvbGxlciwgdmlldzogdmlldyB9O1xuICBpZiAoYXJnc1swXSAmJiBhcmdzWzBdLmtleSAhPSBudWxsKSBvdXRwdXQuYXR0cnMgPSB7IGtleTogYXJnc1swXS5rZXkgfTtcbiAgcmV0dXJuIG91dHB1dDtcbn1cbmZ1bmN0aW9uIGNvbXBvbmVudGl6ZShjb21wb25lbnQpIHtcbiAgcmV0dXJuIHBhcmFtZXRlcml6ZShjb21wb25lbnQsIHNsaWNlKGFyZ3VtZW50cywgMSkpO1xufSIsIlxuXG5leHBvcnQgZGVmYXVsdCBtb3VudDtpbXBvcnQgeyBHIH0gZnJvbSAnLi4vZ2xvYmFscyc7XG5cbmltcG9ydCB7IHJlZHJhdyB9IGZyb20gJy4uL3VwZGF0ZSc7XG5cbmltcG9ydCB7IHR5cGUsIHNsaWNlLCBOT09QIH0gZnJvbSAnLi4vdXRpbHMnO1xuXG52YXIgdG9wQ29tcG9uZW50O1xuZnVuY3Rpb24gbW91bnQocm9vdCwgY29tcG9uZW50LCBmb3JjZVJlY3JlYXRpb24pIHtcbiAgaWYgKCFyb290KSB0aHJvdyBuZXcgRXJyb3IoJ1BsZWFzZSBlbnN1cmUgdGhlIERPTSBlbGVtZW50IGV4aXN0cyBiZWZvcmUgcmVuZGVyaW5nIGEgdGVtcGxhdGUgaW50byBpdC4nKTtcbiAgdmFyIGluZGV4ID0gRy5yb290cy5pbmRleE9mKHJvb3QpO1xuICBpZiAoaW5kZXggPCAwKSBpbmRleCA9IEcucm9vdHMubGVuZ3RoO1xuXG4gIHZhciBpc1ByZXZlbnRlZCA9IGZhbHNlO1xuICB2YXIgZXZlbnQgPSB7XG4gICAgcHJldmVudERlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlzUHJldmVudGVkID0gdHJ1ZTtcbiAgICAgIEcuY29tcHV0ZVByZVJlZHJhd0hvb2sgPSBHLmNvbXB1dGVQb3N0UmVkcmF3SG9vayA9IG51bGw7XG4gICAgfVxuICB9O1xuICBHLnVubG9hZGVycy5lYWNoKGZ1bmN0aW9uICh1bmxvYWRlciwgY29udHJvbGxlcikge1xuICAgIHVubG9hZGVyLmNhbGwoY29udHJvbGxlciwgZXZlbnQpO1xuICAgIGNvbnRyb2xsZXIub251bmxvYWQgPSBudWxsO1xuICB9KTtcblxuICBpZiAoaXNQcmV2ZW50ZWQpIHtcbiAgICBHLnVubG9hZGVycy5lYWNoKGZ1bmN0aW9uICh1bmxvYWRlciwgY29udHJvbGxlcikge1xuICAgICAgY29udHJvbGxlci5vbnVubG9hZCA9IHVubG9hZGVyO1xuICAgIH0pO1xuICB9IGVsc2UgRy51bmxvYWRlcnMuY2xlYXIoKTtcblxuICBpZiAoRy5jb250cm9sbGVyc1tpbmRleF0gJiYgdHlwZShHLmNvbnRyb2xsZXJzW2luZGV4XS5vbnVubG9hZCkgPT09ICdmdW5jdGlvbicpIHtcbiAgICBHLmNvbnRyb2xsZXJzW2luZGV4XS5vbnVubG9hZChldmVudCk7XG4gIH1cblxuICBpZiAoIWlzUHJldmVudGVkKSB7XG4gICAgRy5yb290c1tpbmRleF0gPSByb290O1xuICAgIHZhciBjdXJyZW50Q29tcG9uZW50ID0gdG9wQ29tcG9uZW50ID0gY29tcG9uZW50ID0gY29tcG9uZW50IHx8IHsgY29udHJvbGxlcjogTk9PUCB9O1xuICAgIHZhciBfY29uc3RydWN0b3IgPSBjb21wb25lbnQuY29udHJvbGxlciB8fCBOT09QO1xuICAgIHZhciBjb250cm9sbGVyID0gbmV3IF9jb25zdHJ1Y3RvcigpO1xuICAgIC8vY29udHJvbGxlcnMgbWF5IGNhbGwgbS5tb3VudCByZWN1cnNpdmVseSAodmlhIG0ucm91dGUgcmVkaXJlY3RzLCBmb3IgZXhhbXBsZSlcbiAgICAvL3RoaXMgY29uZGl0aW9uYWwgZW5zdXJlcyBvbmx5IHRoZSBsYXN0IHJlY3Vyc2l2ZSBtLm1vdW50IGNhbGwgaXMgYXBwbGllZFxuICAgIGlmIChjdXJyZW50Q29tcG9uZW50ID09PSB0b3BDb21wb25lbnQpIHtcbiAgICAgIEcuY29udHJvbGxlcnNbaW5kZXhdID0gY29udHJvbGxlcjtcbiAgICAgIEcuY29tcG9uZW50c1tpbmRleF0gPSBjb21wb25lbnQ7XG4gICAgICBHLnJlY3JlYXRpb25zW2luZGV4XSA9IGZvcmNlUmVjcmVhdGlvbjtcbiAgICB9XG4gICAgcmVkcmF3KCk7XG4gICAgcmV0dXJuIEcuY29udHJvbGxlcnNbaW5kZXhdO1xuICB9XG59XG5cbjsiLCJcbmV4cG9ydCBkZWZhdWx0IGNyZWF0ZUNvbXBvbmVudDtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbi8vIGltcG9ydCAqIGFzIHVwZGF0ZSBmcm9tICcuLi91cGRhdGUnO1xuaW1wb3J0IHsgdHlwZSwgZXh0ZW5kLCBzbGljZSwgcmVtb3ZlVm9pZFZhbHVlLCB0b0FycmF5IH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHsgcnVudGltZSBhcyBSVCwgRyB9IGZyb20gJy4uL2dsb2JhbHMnO1xuaW1wb3J0IGJ1aWxkIGZyb20gJy4uL3JlbmRlci9idWlsZCc7XG52YXIgZXh0ZW5kTWV0aG9kcyA9IFsnY29tcG9uZW50V2lsbE1vdW50JywgJ2NvbXBvbmVudERpZE1vdW50JywgJ2NvbXBvbmVudFdpbGxVcGRhdGUnLCAnY29tcG9uZW50RGlkVXBkYXRlJywgJ2NvbXBvbmVudFdpbGxVbm1vdW50JywgJ2NvbXBvbmVudFdpbGxEZXRhY2hlZCcsICdjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzJywgJ2dldEluaXRpYWxQcm9wcycsICdnZXRJbml0aWFsU3RhdGUnXTtcbnZhciBwaXBlZE1ldGhvZHMgPSBbJ2dldEluaXRpYWxQcm9wcycsICdnZXRJbml0aWFsU3RhdGUnLCAnY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyddO1xudmFyIGlnbm9yZVByb3BzID0gWydzZXRTdGF0ZScsICdtaXhpbnMnLCAnb251bmxvYWQnLCAnc2V0SW50ZXJuYWxQcm9wcycsICdyZWRyYXcnXTtcblxudmFyIENvbXBvbmVudCA9IChmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIENvbXBvbmVudChwcm9wcywgY2hpbGRyZW4pIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQ29tcG9uZW50KTtcblxuICAgIGlmICh0eXBlKHByb3BzKSAhPT0gJ29iamVjdCcgJiYgcHJvcHMgIT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignW0NvbXBvbmVudF1wYXJhbSBmb3IgY29uc3RydWN0b3Igc2hvdWxkIGEgb2JqZWN0IG9yIG51bGwgb3IgdW5kZWZpbmVkISBnaXZlbjogJyArIHByb3BzKTtcbiAgICB9XG4gICAgdGhpcy5wcm9wcyA9IHByb3BzIHx8IHt9O1xuICAgIHRoaXMucHJvcHMuY2hpbGRyZW4gPSB0b0FycmF5KGNoaWxkcmVuKTtcbiAgICB0aGlzLnJvb3QgPSBudWxsO1xuICAgIC8vIHRoaXMuc3RhdGUgPSB7fTtcbiAgICBpZiAodGhpcy5nZXRJbml0aWFsUHJvcHMpIHtcbiAgICAgIHRoaXMucHJvcHMgPSB0aGlzLmdldEluaXRpYWxQcm9wcyh0aGlzLnByb3BzKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuZ2V0SW5pdGlhbFN0YXRlKSB7XG4gICAgICB0aGlzLnN0YXRlID0gdGhpcy5nZXRJbml0aWFsU3RhdGUodGhpcy5wcm9wcyk7XG4gICAgfVxuICB9XG5cbiAgQ29tcG9uZW50LnByb3RvdHlwZS5zZXRQcm9wcyA9IGZ1bmN0aW9uIHNldFByb3BzKHByb3BzLCBjaGlsZHJlbikge1xuICAgIGlmICh0aGlzLmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMpIHtcbiAgICAgIHByb3BzID0gdGhpcy5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKHByb3BzKTtcbiAgICB9XG4gICAgdGhpcy5wcm9wcyA9IHJlbW92ZVZvaWRWYWx1ZShleHRlbmQodGhpcy5wcm9wcywgcHJvcHMsIHsgY2hpbGRyZW46IHRvQXJyYXkoY2hpbGRyZW4pIH0pKTtcbiAgfTtcblxuICBDb21wb25lbnQucHJvdG90eXBlLm9udW5sb2FkID0gZnVuY3Rpb24gb251bmxvYWQoZm4pIHtcbiAgICBpZiAodHlwZShmbikgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGZuLmNhbGwodGhpcyk7XG4gICAgfVxuICAgIHRoaXMucm9vdCA9IG51bGw7XG4gICAgdGhpcy5jYWNoZWQgPSBudWxsO1xuICAgIHRoaXMucmVkcmF3RGF0YSA9IG51bGw7XG4gIH07XG5cbiAgQ29tcG9uZW50LnByb3RvdHlwZS5zZXRJbnRlcm5hbFByb3BzID0gZnVuY3Rpb24gc2V0SW50ZXJuYWxQcm9wcyhyb290RWwsIGNhY2hlZCwgcmVkcmF3RGF0YSkge1xuICAgIHRoaXMucm9vdCA9IHJvb3RFbDtcbiAgICB0aGlzLmNhY2hlZCA9IGNhY2hlZDtcbiAgICB0aGlzLnJlZHJhd0RhdGEgPSByZWRyYXdEYXRhO1xuICB9O1xuXG4gIC8vIGdldEluaXRpYWxQcm9wcyhwcm9wcyl7XG5cbiAgLy8gfVxuXG4gIC8vIHJlbmRlcihwcm9wcywgc3RhdGVzKXtcblxuICAvLyB9XG4gIC8vIGdldEluaXRpYWxTdGF0ZShwcm9wcyl7XG5cbiAgLy8gfVxuICAvLyBjb21wb25lbnREaWRNb3VudChlbCl7XG5cbiAgLy8gfVxuICAvLyBzaG91bGRDb21wb25lbnRVcGRhdGUoKXtcblxuICAvLyB9XG5cbiAgLy8gY29tcG9uZW50RGlkVXBkYXRlKCl7XG5cbiAgLy8gfVxuICAvLyBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKCl7XG5cbiAgLy8gfVxuICAvLyBjb21wb25lbnRXaWxsVW5tb3VudChlKXtcblxuICAvLyB9XG4gIC8vIGNvbXBvbmVudFdpbGxEZXRhY2hlZChlbCl7XG5cbiAgLy8gfVxuXG4gIENvbXBvbmVudC5wcm90b3R5cGUucmVkcmF3ID0gZnVuY3Rpb24gcmVkcmF3KCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5yZWRyYXdEYXRhID09IG51bGwpIHJldHVybjtcbiAgICB2YXIgaW5zdGFuY2UgPSB0aGlzO1xuXG4gICAgRy5yZW5kZXJRdWV1ZS5hZGRUYXJnZXQoe1xuICAgICAgbWVyZ2VUeXBlOiAwLCAvLyBjb250YWluXG4gICAgICBwcm9jZXNzb3I6IF9idWlsZCxcbiAgICAgIHJvb3Q6IGluc3RhbmNlLnJvb3QsXG4gICAgICBwYXJhbXM6IFtpbnN0YW5jZV1cbiAgICB9KTtcbiAgfTtcblxuICBDb21wb25lbnQucHJvdG90eXBlLnNldFN0YXRlID0gZnVuY3Rpb24gc2V0U3RhdGUoc3RhdGUsIHNpbGVuY2UpIHtcbiAgICBpZiAodGhpcy5zdGF0ZSA9PSBudWxsKSB0aGlzLnN0YXRlID0ge307XG4gICAgdGhpcy5zdGF0ZSA9IGV4dGVuZCh0aGlzLnN0YXRlLCBzdGF0ZSk7XG4gICAgaWYgKCFzaWxlbmNlICYmIFJUID09PSAnYnJvd3NlcicpIHtcbiAgICAgIHRoaXMucmVkcmF3KCk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBDb21wb25lbnQ7XG59KSgpO1xuXG47XG5mdW5jdGlvbiBfYnVpbGQoaW5zdGFuY2UpIHtcbiAgdmFyIHZpZXdGbiA9IGluc3RhbmNlLnZpZXdGbjtcbiAgdmFyIGRhdGEgPSB2aWV3Rm5bMF0odmlld0ZuWzFdKTtcbiAgdmFyIF9pbnN0YW5jZSRyZWRyYXdEYXRhID0gaW5zdGFuY2UucmVkcmF3RGF0YTtcbiAgdmFyIHBhcmVudEVsZW1lbnQgPSBfaW5zdGFuY2UkcmVkcmF3RGF0YVswXTtcbiAgdmFyIGluZGV4ID0gX2luc3RhbmNlJHJlZHJhd0RhdGFbMV07XG4gIHZhciBlZGl0YWJsZSA9IF9pbnN0YW5jZSRyZWRyYXdEYXRhWzJdO1xuICB2YXIgbmFtZXNwYWNlID0gX2luc3RhbmNlJHJlZHJhd0RhdGFbM107XG4gIHZhciBjb25maWdzID0gW107XG4gIGlmIChpbnN0YW5jZS5wcm9wcy5rZXkgIT0gbnVsbCkge1xuICAgIGRhdGEuYXR0cnMgPSBkYXRhLmF0dHJzIHx8IHt9O1xuICAgIGRhdGEuYXR0cnMua2V5ID0ga2V5O1xuICB9XG5cbiAgaW5zdGFuY2UuY2FjaGVkID0gYnVpbGQocGFyZW50RWxlbWVudCwgbnVsbCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGRhdGEsIGluc3RhbmNlLmNhY2hlZCwgZmFsc2UsIGluZGV4LCBlZGl0YWJsZSwgbmFtZXNwYWNlLCBjb25maWdzKTtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBjb25maWdzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGNvbmZpZ3NbaV0oKTtcbiAgfVxufVxuZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50KG9wdGlvbnMpIHtcbiAgaWYgKHR5cGUob3B0aW9ucykgIT09ICdvYmplY3QnKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignW2NyZWF0ZUNvbXBvbmVudF1wYXJhbSBzaG91bGQgYmUgYSBvYmplY3QhIGdpdmVuOiAnICsgb3B0aW9ucyk7XG4gIH1cbiAgdmFyIGNvbXBvbmVudCA9IHt9LFxuICAgICAgZmFjdG9yeSA9IGNyZWF0ZUNvbXBvbmVudEZhY3Rvcnkob3B0aW9ucyk7XG4gIGNvbXBvbmVudC5jb250cm9sbGVyID0gZnVuY3Rpb24gKHByb3BzLCBjaGlsZHJlbikge1xuICAgIHZhciBpbnN0YW5jZSA9IG5ldyBmYWN0b3J5KHByb3BzLCBjaGlsZHJlbik7XG4gICAgdmFyIGN0cmwgPSB7XG4gICAgICBpbnN0YW5jZTogaW5zdGFuY2VcbiAgICB9O1xuICAgIGN0cmwub251bmxvYWQgPSBpbnN0YW5jZS5vbnVubG9hZC5iaW5kKGluc3RhbmNlLCBpbnN0YW5jZS5jb21wb25lbnRXaWxsVW5tb3VudCk7XG4gICAgaWYgKHR5cGUoaW5zdGFuY2UubmFtZSkgPT09ICdzdHJpbmcnKSB7XG4gICAgICBjdHJsLm5hbWUgPSBpbnN0YW5jZS5uYW1lO1xuICAgIH1cbiAgICByZXR1cm4gY3RybDtcbiAgfTtcblxuICBjb21wb25lbnQudmlldyA9IG1ha2VWaWV3KCk7XG4gIHJldHVybiBjb21wb25lbnQ7XG59XG5cbmZ1bmN0aW9uIG1peGluUHJvdG8ocHJvdG8sIG1peGlucykge1xuICB2YXIgbWl4aW47XG4gIGlmICh0eXBlKG1peGlucykgIT09ICdhcnJheScpIHtcbiAgICBtaXhpbnMgPSBzbGljZShhcmd1bWVudHMsIDEpO1xuICB9XG4gIG1peGlucyA9IG1peGlucy5maWx0ZXIoZnVuY3Rpb24gKG0pIHtcbiAgICByZXR1cm4gdHlwZShtKSA9PT0gJ29iamVjdCc7XG4gIH0pO1xuICB3aGlsZSAobWl4aW5zLmxlbmd0aCA+IDApIHtcbiAgICBtaXhpbiA9IG1peGlucy5zaGlmdCgpO1xuICAgIE9iamVjdC5rZXlzKG1peGluKS5mb3JFYWNoKGZ1bmN0aW9uIChwcm9wTmFtZSkge1xuICAgICAgaWYgKHByb3BOYW1lID09PSAnbWl4aW5zJykge1xuICAgICAgICBtaXhpbnMgPSBfYWRkVG9IZWFkKFtdLmNvbmNhdChtaXhpbltwcm9wTmFtZV0pLCBtaXhpbnMpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoaWdub3JlUHJvcHMuaW5kZXhPZihwcm9wTmFtZSkgIT09IC0xKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChleHRlbmRNZXRob2RzLmluZGV4T2YocHJvcE5hbWUpICE9PSAtMSkge1xuICAgICAgICBpZiAodHlwZShwcm90b1twcm9wTmFtZV0pID09PSAnYXJyYXknKSB7XG4gICAgICAgICAgcHJvdG9bcHJvcE5hbWVdLnB1c2gobWl4aW5bcHJvcE5hbWVdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwcm90b1twcm9wTmFtZV0gPSB0eXBlKHByb3RvW3Byb3BOYW1lXSkgPT09ICdmdW5jdGlvbicgPyBbcHJvdG9bcHJvcE5hbWVdLCBtaXhpbltwcm9wTmFtZV1dIDogW21peGluW3Byb3BOYW1lXV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcHJvdG9bcHJvcE5hbWVdID0gbWl4aW5bcHJvcE5hbWVdO1xuICAgIH0pO1xuICB9XG5cbiAgZXh0ZW5kTWV0aG9kcy5mb3JFYWNoKGZ1bmN0aW9uIChtZXRob2ROYW1lKSB7XG4gICAgaWYgKHR5cGUocHJvdG9bbWV0aG9kTmFtZV0pID09PSAnYXJyYXknKSB7XG4gICAgICB2YXIgbWV0aG9kcyA9IHByb3RvW21ldGhvZE5hbWVdLmZpbHRlcihmdW5jdGlvbiAocCkge1xuICAgICAgICByZXR1cm4gdHlwZShwKSA9PT0gJ2Z1bmN0aW9uJztcbiAgICAgIH0pO1xuICAgICAgcHJvdG9bbWV0aG9kTmFtZV0gPSBfY29tcG9zZShwaXBlZE1ldGhvZHMuaW5kZXhPZihtZXRob2ROYW1lKSAhPT0gLTEsIG1ldGhvZHMpO1xuICAgIH1cbiAgfSk7XG59XG5mdW5jdGlvbiBjcmVhdGVDb21wb25lbnRGYWN0b3J5KG9wdGlvbnMpIHtcbiAgdmFyIGZhY3RvcnkgPSBmdW5jdGlvbiBDb21wb25lbnRGYWN0b3J5KCkge1xuICAgIENvbXBvbmVudC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIF9iaW5kT25NZXRob2RzKGZhY3RvcnkucHJvdG90eXBlLCB0aGlzKTtcbiAgfSxcbiAgICAgIG1peGlucztcbiAgZmFjdG9yeS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKENvbXBvbmVudC5wcm90b3R5cGUpO1xuXG4gIG1peGlucyA9IG9wdGlvbnMubWl4aW5zIHx8IFtdO1xuICBkZWxldGUgb3B0aW9ucy5taXhpbnM7XG4gIGlmICh0eXBlKG1peGlucykgPT09ICdhcnJheScpIHtcbiAgICBtaXhpbnMgPSBtaXhpbnMuY29uY2F0KG9wdGlvbnMpO1xuICB9IGVsc2Uge1xuICAgIG1peGlucyA9IFttaXhpbnMsIG9wdGlvbnNdO1xuICB9XG4gIG1peGluUHJvdG8oZmFjdG9yeS5wcm90b3R5cGUsIG1peGlucyk7XG4gIHJldHVybiBmYWN0b3J5O1xufVxuXG5mdW5jdGlvbiBtYWtlVmlldygpIHtcbiAgdmFyIGNhY2hlZFZhbHVlID0ge307XG4gIC8vIGZhY3RvcnkgPSBjcmVhdGVDb21wb25lbnRGYWN0b3J5KG9wdGlvbnMpO1xuICByZXR1cm4gZnVuY3Rpb24gY29tcG9uZW50VmlldyhjdHJsLCBwcm9wcywgY2hpbGRyZW4pIHtcbiAgICB2YXIgaW5zdGFuY2UgPSBjdHJsLmluc3RhbmNlLFxuICAgICAgICBvbGRQcm9wcyA9IGNhY2hlZFZhbHVlLnByb3BzLFxuICAgICAgICBvbGRTdGF0ZSA9IGNhY2hlZFZhbHVlLnN0YXRlLFxuICAgICAgICBjb25maWcgPSBmdW5jdGlvbiAobm9kZSwgaXNJbml0aWFsaXplZCwgY29udGV4dCwgY2FjaGVkLCByZWRyYXdEYXRhKSB7XG4gICAgICBfZXhlY3V0ZUZuKGluc3RhbmNlLCAnc2V0SW50ZXJuYWxQcm9wcycsIG5vZGUsIGNhY2hlZCwgcmVkcmF3RGF0YSk7XG4gICAgICBpZiAoIWlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgX2V4ZWN1dGVGbihpbnN0YW5jZSwgJ2NvbXBvbmVudERpZE1vdW50Jywgbm9kZSk7XG4gICAgICAgIGlmICh0eXBlKGluc3RhbmNlLmNvbXBvbmVudFdpbGxEZXRhY2hlZCkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBjb250ZXh0Lm9udW5sb2FkID0gaW5zdGFuY2UuY29tcG9uZW50V2lsbERldGFjaGVkLmJpbmQoaW5zdGFuY2UsIG5vZGUpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBfZXhlY3V0ZUZuKGluc3RhbmNlLCAnY29tcG9uZW50RGlkVXBkYXRlJywgbm9kZSwgb2xkUHJvcHMsIG9sZFN0YXRlKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIC8vdXBkYXRlUHJvcHNcbiAgICBpbnN0YW5jZS5zZXRQcm9wcyhwcm9wcywgY2hpbGRyZW4pO1xuICAgIC8vY2FjaGUgcHJldmlvdXMgaW5zdGFuY2VcbiAgICBjYWNoZWRWYWx1ZS5wcm9wcyA9IGluc3RhbmNlLnByb3BzO1xuICAgIGNhY2hlZFZhbHVlLnN0YXRlID0gaW5zdGFuY2Uuc3RhdGU7XG5cbiAgICBpZiAoaW5zdGFuY2Uucm9vdCAhPSBudWxsKSB7XG4gICAgICBpZiAoX2V4ZWN1dGVGbihpbnN0YW5jZSwgJ3Nob3VsZENvbXBvbmVudFVwZGF0ZScsIG9sZFByb3BzLCBvbGRTdGF0ZSkgPT09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybiB7IHN1YnRyZWU6ICdyZXRhaW4nIH07XG4gICAgICB9XG4gICAgICBfZXhlY3V0ZUZuKGluc3RhbmNlLCAnY29tcG9uZW50V2lsbFVwZGF0ZScsIGluc3RhbmNlLnJvb3QsIG9sZFByb3BzLCBvbGRTdGF0ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIF9leGVjdXRlRm4oaW5zdGFuY2UsICdjb21wb25lbnRXaWxsTW91bnQnLCBvbGRQcm9wcywgb2xkU3RhdGUpO1xuICAgIH1cblxuICAgIHZhciByZXN1bHRWaWV3ID0gX2V4ZWN1dGVGbihpbnN0YW5jZSwgJ3JlbmRlcicsIGluc3RhbmNlLnByb3BzLCBpbnN0YW5jZS5zdGF0ZSk7XG4gICAgcmVzdWx0Vmlldy5hdHRycyA9IHJlc3VsdFZpZXcuYXR0cnMgfHwge307XG4gICAgcmVzdWx0Vmlldy5hdHRycy5jb25maWcgPSBjb25maWc7XG5cbiAgICByZXR1cm4gcmVzdWx0VmlldztcbiAgfTtcbn1cblxuLy9oZXBsZXJzXG5mdW5jdGlvbiBfYmluZE9uTWV0aG9kcyhwcm90bywgY29tcG9uZW50KSB7XG4gIE9iamVjdC5rZXlzKHByb3RvKS5mb3JFYWNoKGZ1bmN0aW9uIChwcm9wKSB7XG4gICAgdmFyIHZhbCA9IHByb3RvW3Byb3BdO1xuICAgIGlmICh0eXBlKHZhbCkgPT09ICdmdW5jdGlvbicgfHwgL15vbltBLVpdXFx3Ki8udGVzdChwcm9wKSkge1xuICAgICAgY29tcG9uZW50W3Byb3BdID0gdmFsLmJpbmQoY29tcG9uZW50KTtcbiAgICB9XG4gIH0pO1xufVxuZnVuY3Rpb24gX2V4ZWN1dGVGbihvYmosIG1ldGhvZE5hbWUpIHtcbiAgdmFyIGFyZ3MgPSBzbGljZShhcmd1bWVudHMsIDIpO1xuICBpZiAodHlwZShvYmpbbWV0aG9kTmFtZV0pID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIG9ialttZXRob2ROYW1lXS5hcHBseShvYmosIGFyZ3MpO1xuICB9XG59XG5mdW5jdGlvbiBfYWRkVG9IZWFkKGFyclRvQWRkLCB0YXJnZXRBcnIpIHtcbiAgdmFyIGksXG4gICAgICBsID0gYXJyVG9BZGQubGVuZ3RoLFxuICAgICAgYXJyO1xuICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgYXJyID0gYXJyVG9BZGRbaV07XG4gICAgaWYgKHRhcmdldEFyci5pbmRleE9mKGFycikgPT09IC0xKSB7XG4gICAgICB0YXJnZXRBcnIudW5zaGlmdChhcnIpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdGFyZ2V0QXJyO1xufVxuZnVuY3Rpb24gX2NvbXBvc2UoaXNQaXBlZCwgZm5zKSB7XG4gIHJldHVybiBmdW5jdGlvbiBfY29tcG9zZWQoKSB7XG4gICAgdmFyIGFyZ3MgPSBzbGljZShhcmd1bWVudHMsIDApLFxuICAgICAgICBzZWxmID0gdGhpcyxcbiAgICAgICAgaSA9IDAsXG4gICAgICAgIGwgPSBmbnMubGVuZ3RoLFxuICAgICAgICBmbixcbiAgICAgICAgcmVzdWx0ID0gYXJncztcbiAgICBmb3IgKDsgaSA8IGw7IGkrKykge1xuICAgICAgZm4gPSBmbnNbaV07XG4gICAgICByZXN1bHQgPSBmbi5hcHBseShzZWxmLCBhcmdzKTtcbiAgICAgIGFyZ3MgPSBpc1BpcGVkID8gcmVzdWx0IDogYXJncztcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbn0iLCJpbXBvcnQgY29tcG9uZW50IGZyb20gJy4vY29tcG9uZW50JztcbmltcG9ydCBtb3VudCBmcm9tICcuL21vdW50JztcbmltcG9ydCBjcmVhdGVDb21wb25lbnQgZnJvbSAnLi9jcmVhdGVDb21wb25lbnQnO1xuZXhwb3J0IHsgY29tcG9uZW50LCBtb3VudCwgY3JlYXRlQ29tcG9uZW50IH07IiwiaW1wb3J0IHsgcmVuZGVyLCBtIH0gZnJvbSAnLi9yZW5kZXInO1xuaW1wb3J0IHsgcmVkcmF3IH0gZnJvbSAnLi91cGRhdGUnO1xuaW1wb3J0IHsgbW91bnQsIGNvbXBvbmVudCwgY3JlYXRlQ29tcG9uZW50IH0gZnJvbSAnLi9tb3VudCc7XG5pbXBvcnQgeyBHIH0gZnJvbSAnLi9nbG9iYWxzJztcbmltcG9ydCB7IF9leHRlbmQgfSBmcm9tICcuL3V0aWxzJztcbnZhciBtUmVhY3QgPSBtO1xuXG5tUmVhY3QucmVuZGVyID0gcmVuZGVyO1xubVJlYWN0LnJlZHJhdyA9IHJlZHJhdztcbm1SZWFjdC5tb3VudCA9IG1vdW50O1xubVJlYWN0LmNvbXBvbmVudCA9IGNvbXBvbmVudDtcbm1SZWFjdC5jcmVhdGVDb21wb25lbnQgPSBjcmVhdGVDb21wb25lbnQ7XG5tUmVhY3QuZG9tRGVsZWdhdG9yID0gRy5kb21EZWxlZ2F0b3I7XG4vL1tPYmplY3QuYXNzaWduXSBwb2x5ZmlsbFxuaWYgKHR5cGVvZiBPYmplY3QuYXNzaWduID09PSAndW5kZWZpbmVkJykge1xuICBPYmplY3QuYXNzaWduID0gX2V4dGVuZDtcbn1cbmV4cG9ydCBkZWZhdWx0IG1SZWFjdDsiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsRUFFQSxTQUFTLE9BQU8sRUFBRTs7QUFGbEIsRUFJQSxJQUFJLFVBQVU7QUFKZCxFQUtBLFNBQVMsS0FBSyxHQUFHO0FBTGpCLEVBTUEsRUFBRSxJQUFJLE1BQU0sTUFBTTtBQU5sQixFQU9BLElBQUksT0FBTztBQVBYLEVBUUE7QUFSQSxFQVNBLEVBQUUsSUFBSSxNQUFNLFdBQVc7QUFUdkIsRUFVQSxJQUFJLE9BQU87QUFWWCxFQVdBO0FBWEEsRUFZQSxFQUFFLElBQUksTUFBTSxHQUFHO0FBWmYsRUFhQSxJQUFJLE9BQU87QUFiWCxFQWNBO0FBZEEsRUFlQSxFQUFFLElBQUksS0FBSyxPQUFPLFVBQVUsU0FBUyxLQUFLLEdBQUcsTUFBTTtBQWZuRCxFQWdCQSxFQUFFLE9BQU8sTUFBTSxPQUFPLFlBQVksR0FBRyxHQUFHO0FBaEJ4QyxFQWlCQTtBQWpCQSxFQWtCQSxJQUFJLFNBQVMsTUFBTSxVQUFVO0FBbEI3QixFQW1CQSxTQUFTLFFBQVE7QUFuQmpCLEVBb0JBLEVBQUUsT0FBTyxPQUFPLE1BQU0sVUFBVSxJQUFJLE9BQU8sS0FBSyxXQUFXO0FBcEIzRCxFQXFCQSxDQUFDOztBQXJCRCxFQXVCQSxTQUFTLE9BQU8sR0FBRyxHQUFHO0FBdkJ0QixFQXdCQSxFQUFFLE9BQU8sT0FBTyxVQUFVLGVBQWUsS0FBSyxHQUFHO0FBeEJqRCxFQXlCQTtBQXpCQSxFQTBCQSxTQUFTLFVBQVU7QUExQm5CLEVBMkJBLEVBQUUsSUFBSSxJQUFJLFVBQVU7QUEzQnBCLEVBNEJBLE1BQU0sSUFBSTtBQTVCVixFQTZCQSxNQUFNO0FBN0JOLEVBOEJBLE1BQU07QUE5Qk4sRUErQkEsTUFBTTtBQS9CTixF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