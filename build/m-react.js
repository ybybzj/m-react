(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  global.mReact = factory()
}(this, function () { 'use strict';

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
    var prop = function () {
      if (arguments.length) store = arguments[0];
      return store;
    };
    prop.toJSON = function () {
      return store;
    };
    return prop;
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

  var globals__global = typeof window != 'undefined' ? window : {};
  var globals__document = globals__global.document;
  var globals__runtime = typeof process != 'undefined' && !process.browser ? 'nodejs' : typeof window != 'undefined' ? 'browser' : 'unknown';
  var G = {
    pendingRequests: 0,
    forcing: false,
    unloaders: [],
    //default update strategy is 'diff', so render method will diff update
    updateStrategy: gettersetter('diff'),
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
        // vNodes = [].concat(vNodes);
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
        if (type(controller.onunload) === 'function') controller.onunload({
          preventDefault: NOOP
        });
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
      cached = validateCached(data, cached, index, parentIndex, parentCache, dataType);
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
  function validateCached(data, cached, index, parentIndex, parentCache, dataType) {
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
          _newCached = new Array(cached.length);
      changes = Object.keys(existing).map(function (key) {
        return existing[key];
      }).sort(function (a, b) {
        return a.action - b.action || a.index - b.index;
      });
      _newCached.nodes = cached.nodes.slice();

      changes.forEach(_applyChanges);
      cached = _newCached;
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

    function _applyChanges(change) {
      var changeIdx = change.index,
          action = action;
      if (action === DELETION) {
        clear(cached[changeIdx].nodes, cached[changeIdx]);
        newCached.splice(changeIdx, 1);
      }
      if (action === INSERTION) {
        var dummy = globals__document.createElement('div');
        dummy.key = data[changeIdx].attrs.key;
        parentElement.insertBefore(dummy, parentElement.childNodes[changeIdx] || null);
        newCached.splice(changeIdx, 0, {
          attrs: { key: dummy.key }, nodes: [dummy]
        });
        newCached.nodes[changeIdx] = dummy;
      }

      if (action === MOVE) {
        if (parentElement.childNodes[changeIdx] !== change.element && change.element !== null) {
          parentElement.insertBefore(change.element, parentElement.childNodes[changeIdx] || null);
        }
        newCached[changeIdx] = cached[change.from];
        mewCached.nodes[changeIdx] = change.element;
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
        componentName;
    //record the final component name
    //handle the situation that vNode is a component({view, controller});

    while (data.view) {
      var view = data.view.$original || data.view;
      var controllerIndex = cached.views ? cached.views.indexOf(view) : -1;
      var controller = controllerIndex > -1 ? cached.controllers[controllerIndex] : new (data.controller || NOOP)();
      componentName = controller.name;
      var key = data && data.attrs && data.attrs.key;
      data = G.pendingRequests == 0 || G.forcing || cached && cached.controllers && cached.controllers.indexOf(controller) > -1 ? data.view(controller) : { tag: 'placeholder' };
      if (data.subtree === 'retain') return cached;
      if (key != null) {
        if (!data.attrs) data.attrs = {};
        data.attrs.key = key;
      }
      if (controller.onunload) G.unloaders.push({ controller: controller, handler: controller.onunload });
      views.push(view);
      controllers.push(controller);
    }

    //the result of view function must be a sigle root vNode,
    //not a array or string
    if (!data.tag && controllers.length) throw new Error('Component template must return a virtual element, not an array, string, etc.');
    if (!data.attrs) data.attrs = {};
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
        for (var i = 0, controller = undefined; controller = controllers[i]; i++) {
          if (controller.onunload && controller.onunload.$old) controller.onunload = controller.onunload.$old;
          if (G.pendingRequests && controller.onunload) {
            var _onunload = controller.onunload;
            controller.onunload = NOOP;
            controller.onunload.$old = _onunload;
          }
        }
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
    //schedule configs to be called. They are called after `build` finishes running
    if (type(data.attrs.config) === 'function') {
      var context = cached.configContext = cached.configContext || {};

      // bind
      var callback = function (data, args) {
        return function () {
          return data.attrs.config.apply(data, args);
        };
      };
      configs.push(callback(data, [domNode, !isNew, context, cached]));
    }
    if (type(componentName) === 'string') {
      cached.componentName = componentName;
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

  G.renderQueue.onFlush(_render).onAddTarget(_mergeTask);

  function render(root, vNode, forceRecreation, force) {
    var task = {
      root: root,
      vNode: vNode,
      forceRecreation: forceRecreation
    };
    if (force === true) {
      return _render(task);
    }
    G.renderQueue.addTarget(task);
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
  var render__domCacheMap = G.domCacheMap;
  function _render(task) {
    var root = task.root;
    var vNode = task.vNode;
    var forceRecreation = task.forceRecreation;

    if (!root) {
      throw new Error('Ensure the DOM element being passed to m.route/m.mount/m.render is not undefined.');
    }
    var configs = [],
        isDocumentRoot = root === globals__document,
        domNode = isDocumentRoot || root === globals__document.documentElement ? documentNode : root,
        vNodeCache;
    if (isDocumentRoot && vNode.tag !== 'html') {
      vNode = { tag: 'html', attrs: {}, children: vNode };
    }

    if (forceRecreation) {
      reset(domNode);
    }
    vNodeCache = build(domNode, null, undefined, undefined, vNode, render__domCacheMap.get(domNode), false, 0, null, undefined, configs);
    configs.forEach(function (onRender) {
      onRender();
    });
    render__domCacheMap.set(domNode, vNodeCache);
  }

  //helpers

  function _mergeTask(queue, task) {
    var i,
        l,
        rootIdx = -1;
    for (i = 0, l = queue.length; i < l; i++) {
      if (queue[i].root === task.root) {
        rootIdx = i;
        break;
      }
    }
    if (rootIdx > -1) {
      queue.splice(rootIdx, 1);
    }
    queue.push(task);
    return queue;
  }

  function reset(root) {
    clear(root.childNodes, render__domCacheMap.get(root));
    render__domCacheMap.remove(root);
  }



  var redraw = redraw__update;var renderQueue = G.renderQueue.onFinish(_onFinish);
  var redrawing = false;
  function redraw__update(force) {
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
        var args = component.controller && component.controller.$$args ? [controller].concat(component.controller.$$args) : [controller];
        if (force !== true) {
          render(root, component.view ? component.view.apply(component, args) : '', needRecreation);
        } else {
          render(root, component.view ? component.view.apply(component, args) : '', needRecreation, true);
        }
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

  var update = {
    get redraw () { return redraw; },
    get startComputation () { return startComputation; },
    get endComputation () { return endComputation; }
  };

  redraw.strategy = G.updateStrategy;
  function startComputation() {
    G.pendingRequests++;
  }
  function endComputation() {
    G.pendingRequests = Math.max(G.pendingRequests - 1, 0);
    if (G.pendingRequests === 0) redraw();
  }
  // function endFirstComputation() {
  // if (redraw.strategy() === "none") {
  //   G.pendingRequests--;
  //   redraw.strategy("diff");
  // }
  //   else endComputation();
  // }

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
    for (var i = 0, unloader = undefined; unloader = G.unloaders[i]; i++) {
      unloader.handler.call(unloader.controller, event);
      unloader.controller.onunload = null;
    }

    if (isPrevented) {
      for (var i = 0, unloader = undefined; unloader = G.unloaders[i]; i++) {
        unloader.controller.onunload = unloader.handler;
      }
    } else G.unloaders = [];

    if (G.controllers[index] && type(G.controllers[index].onunload) === 'function') {
      G.controllers[index].onunload(event);
    }

    if (!isPrevented) {
      // redraw.strategy("all");
      startComputation();
      G.roots[index] = root;
      // if (arguments.length > 2) component = componentize(component, slice(arguments, 2));
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
      endComputation();
      return G.controllers[index];
    }
  }

  ;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var extendMethods = ['componentWillMount', 'componentDidMount', 'componentWillUpdate', 'componentDidUpdate', 'componentWillUnmount', 'componentWillDetached', 'componentWillReceiveProps', 'getInitialProps', 'getInitialState'];
  var pipedMethods = ['getInitialProps', 'getInitialState', 'componentWillReceiveProps'];
  var ignoreProps = ['setState', 'mixins', 'onunload', 'setRoot'];

  var Component = (function () {
    function Component(props, children) {
      _classCallCheck(this, Component);

      if (type(props) !== 'object' && props != null) {
        throw new TypeError('[Component]param for constructor should a object or null or undefined! given: ' + props);
      }
      this.props = props || {};
      this.state = {};
      this.props.children = toArray(children);
      this.root = null;
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
    };

    Component.prototype.setRoot = function setRoot(rootEl) {
      this.root = rootEl;
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

    Component.prototype.setState = function setState(state, silence) {
      if (!silence && globals__runtime === 'browser') {
        update.startComputation();
      }
      this.state = extend(this.state, state);
      if (!silence && globals__runtime === 'browser') {
        update.endComputation();
      }
    };

    return Component;
  })();

  ;
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
      if (type(instance.componentWillUnmount) === 'function') {
        ctrl.onunload = instance.onunload.bind(instance, instance.componentWillUnmount);
      }
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
          config = function (node, isInitialized, context) {
        _executeFn(instance, 'setRoot', node);
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
  // var commonEvents = [
  //     "blur", "change", "click",  "contextmenu", "dblclick",
  //     "error","focus", "focusin", "focusout", "input", "keydown",
  //     "keypress", "keyup", "load", "mousedown", "mouseup",
  //     "resize", "select", "submit", "unload"
  // ];
  mReact.render = render;
  mReact.redraw = redraw;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIi9ob21lL2p6aGVuZy9NeVdvcmtwbGFjZS9naXRodWJfcHJvanMvbS1yZWFjdC90bXAvdXRpbHMuanMiLCIvaG9tZS9qemhlbmcvTXlXb3JrcGxhY2UvZ2l0aHViX3Byb2pzL20tcmVhY3QvdG1wL3JlbmRlci9tLmpzIiwiL2hvbWUvanpoZW5nL015V29ya3BsYWNlL2dpdGh1Yl9wcm9qcy9tLXJlYWN0L3RtcC9zdG9yZS9tYXAuanMiLCIvaG9tZS9qemhlbmcvTXlXb3JrcGxhY2UvZ2l0aHViX3Byb2pzL20tcmVhY3QvdG1wL3N0b3JlL2luZGV4LmpzIiwiL2hvbWUvanpoZW5nL015V29ya3BsYWNlL2dpdGh1Yl9wcm9qcy9tLXJlYWN0L3RtcC9kb20tZGVsZWdhdG9yL2FkZEV2ZW50LmpzIiwiL2hvbWUvanpoZW5nL015V29ya3BsYWNlL2dpdGh1Yl9wcm9qcy9tLXJlYWN0L3RtcC9kb20tZGVsZWdhdG9yL3JlbW92ZUV2ZW50LmpzIiwiL2hvbWUvanpoZW5nL015V29ya3BsYWNlL2dpdGh1Yl9wcm9qcy9tLXJlYWN0L3RtcC9kb20tZGVsZWdhdG9yL3Byb3h5RXZlbnQuanMiLCIvaG9tZS9qemhlbmcvTXlXb3JrcGxhY2UvZ2l0aHViX3Byb2pzL20tcmVhY3QvdG1wL2RvbS1kZWxlZ2F0b3IvaW5kZXguanMiLCIvaG9tZS9qemhlbmcvTXlXb3JrcGxhY2UvZ2l0aHViX3Byb2pzL20tcmVhY3QvdG1wL3VwZGF0ZS9iYXRjaC5qcyIsIi9ob21lL2p6aGVuZy9NeVdvcmtwbGFjZS9naXRodWJfcHJvanMvbS1yZWFjdC90bXAvZ2xvYmFscy5qcyIsIi9ob21lL2p6aGVuZy9NeVdvcmtwbGFjZS9naXRodWJfcHJvanMvbS1yZWFjdC90bXAvdXBkYXRlL3JhZi5qcyIsIi9ob21lL2p6aGVuZy9NeVdvcmtwbGFjZS9naXRodWJfcHJvanMvbS1yZWFjdC90bXAvcmVuZGVyL2NsZWFyLmpzIiwiL2hvbWUvanpoZW5nL015V29ya3BsYWNlL2dpdGh1Yl9wcm9qcy9tLXJlYWN0L3RtcC9yZW5kZXIvc2V0QXR0cmlidXRlcy5qcyIsIi9ob21lL2p6aGVuZy9NeVdvcmtwbGFjZS9naXRodWJfcHJvanMvbS1yZWFjdC90bXAvcmVuZGVyL2J1aWxkLmpzIiwiL2hvbWUvanpoZW5nL015V29ya3BsYWNlL2dpdGh1Yl9wcm9qcy9tLXJlYWN0L3RtcC9yZW5kZXIvcmVuZGVyLmpzIiwiL2hvbWUvanpoZW5nL015V29ya3BsYWNlL2dpdGh1Yl9wcm9qcy9tLXJlYWN0L3RtcC9yZW5kZXIvaW5kZXguanMiLCIvaG9tZS9qemhlbmcvTXlXb3JrcGxhY2UvZ2l0aHViX3Byb2pzL20tcmVhY3QvdG1wL3VwZGF0ZS91cGRhdGUuanMiLCIvaG9tZS9qemhlbmcvTXlXb3JrcGxhY2UvZ2l0aHViX3Byb2pzL20tcmVhY3QvdG1wL3VwZGF0ZS9pbmRleC5qcyIsIi9ob21lL2p6aGVuZy9NeVdvcmtwbGFjZS9naXRodWJfcHJvanMvbS1yZWFjdC90bXAvbW91bnQvY29tcG9uZW50LmpzIiwiL2hvbWUvanpoZW5nL015V29ya3BsYWNlL2dpdGh1Yl9wcm9qcy9tLXJlYWN0L3RtcC9tb3VudC9tb3VudC5qcyIsIi9ob21lL2p6aGVuZy9NeVdvcmtwbGFjZS9naXRodWJfcHJvanMvbS1yZWFjdC90bXAvbW91bnQvY3JlYXRlQ29tcG9uZW50LmpzIiwiL2hvbWUvanpoZW5nL015V29ya3BsYWNlL2dpdGh1Yl9wcm9qcy9tLXJlYWN0L3RtcC9tb3VudC9pbmRleC5qcyIsIi9ob21lL2p6aGVuZy9NeVdvcmtwbGFjZS9naXRodWJfcHJvanMvbS1yZWFjdC90bXAvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IHsgTk9PUCwgdHlwZSwgc2xpY2UsIGdldHRlcnNldHRlciwgaGFzT3duLCBfZXh0ZW5kLCBleHRlbmQsIHJlbW92ZVZvaWRWYWx1ZSwgdG9BcnJheSwgZ2V0SGFzaCwgbWF0Y2hSZWcgfTtcblxuZnVuY3Rpb24gTk9PUCgpIHt9O1xuXG5mdW5jdGlvbiB0eXBlKG8pIHtcbiAgaWYgKG8gPT09IG51bGwpIHtcbiAgICByZXR1cm4gJ251bGwnO1xuICB9XG4gIGlmIChvID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gJ3VuZGVmaW5lZCc7XG4gIH1cbiAgaWYgKG8gIT09IG8pIHtcbiAgICByZXR1cm4gJ05hTic7XG4gIH1cbiAgdmFyIHR5cGVTdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyk7XG4gIHN3aXRjaCAodHlwZVN0cikge1xuICAgIGNhc2UgJ1tvYmplY3QgT2JqZWN0XSc6XG4gICAgICByZXR1cm4gJ29iamVjdCc7XG4gICAgY2FzZSAnW29iamVjdCBBcnJheV0nOlxuICAgICAgcmV0dXJuICdhcnJheSc7XG4gICAgY2FzZSAnW29iamVjdCBTdHJpbmddJzpcbiAgICAgIHJldHVybiAnc3RyaW5nJztcbiAgICBjYXNlICdbb2JqZWN0IEZ1bmN0aW9uXSc6XG4gICAgICByZXR1cm4gJ2Z1bmN0aW9uJztcbiAgICBjYXNlICdbb2JqZWN0IE51bWJlcl0nOlxuICAgICAgcmV0dXJuICdudW1iZXInO1xuICAgIGNhc2UgJ1tvYmplY3QgUmVnRXhwXSc6XG4gICAgICByZXR1cm4gJ3JlZ2V4cCc7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiAndW5rbm93bic7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2xpY2UoKSB7XG4gIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICByZXR1cm4gW10uc2xpY2UuYXBwbHkoYXJndW1lbnRzWzBdLCBhcmdzKTtcbn07XG5cbmZ1bmN0aW9uIGdldHRlcnNldHRlcihzdG9yZSkge1xuICB2YXIgcHJvcCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCkgc3RvcmUgPSBhcmd1bWVudHNbMF07XG4gICAgcmV0dXJuIHN0b3JlO1xuICB9O1xuICBwcm9wLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gc3RvcmU7XG4gIH07XG4gIHJldHVybiBwcm9wO1xufVxuXG5mdW5jdGlvbiBoYXNPd24obywgaykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG8sIGspO1xufVxuZnVuY3Rpb24gX2V4dGVuZCgpIHtcbiAgdmFyIGwgPSBhcmd1bWVudHMubGVuZ3RoLFxuICAgICAgaSA9IDAsXG4gICAgICBrLFxuICAgICAgbyxcbiAgICAgIHRhcmdldDtcbiAgd2hpbGUgKGkgPCBsKSB7XG4gICAgdGFyZ2V0ID0gYXJndW1lbnRzW2ldO1xuICAgIGlmICh0YXJnZXQgPT09IE9iamVjdCh0YXJnZXQpKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgaSsrO1xuICB9XG4gIGlmIChpID09PSBsKSB7XG4gICAgcmV0dXJuIHt9O1xuICB9XG5cbiAgaSsrO1xuICB3aGlsZSAoaSA8IGwpIHtcbiAgICBvID0gYXJndW1lbnRzW2krK107XG4gICAgaWYgKG8gIT09IE9iamVjdChvKSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGZvciAoayBpbiBvKSB7XG4gICAgICBpZiAoaGFzT3duKG8sIGspKSB7XG4gICAgICAgIHRhcmdldFtrXSA9IG9ba107XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiB0YXJnZXQ7XG59XG5mdW5jdGlvbiBleHRlbmQoKSB7XG4gIHZhciBhcmdzID0gc2xpY2UoYXJndW1lbnRzKTtcbiAgcmV0dXJuIF9leHRlbmQuYXBwbHkobnVsbCwgW3t9XS5jb25jYXQoYXJncykpO1xufVxuZnVuY3Rpb24gcmVtb3ZlVm9pZFZhbHVlKG8pIHtcbiAgaWYgKHR5cGUobykgIT09ICdvYmplY3QnKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignW3JlbW92ZVZvaWRWYWx1ZV1wYXJhbSBzaG91bGQgYmUgYSBvYmplY3QhIGdpdmVuOiAnICsgbyk7XG4gIH1cbiAgdmFyIHJlc3VsdCA9IHt9O1xuICBPYmplY3Qua2V5cyhvKS5mb3JFYWNoKGZ1bmN0aW9uIChrKSB7XG4gICAgaWYgKG9ba10gIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmVzdWx0W2tdID0gb1trXTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vL29ubHkgZmxhdHRlbiBvbmUgbGV2ZWwsIHNpbmNlIG90aGVyIGNhc2UgaXMgcmFyZVxuZnVuY3Rpb24gX2ZsYXR0ZW4oYSkge1xuICB2YXIgcmVzdWx0ID0gW10sXG4gICAgICBuZWVkRmxhdHRlbiA9IHRydWU7XG4gIGZvciAodmFyIGkgPSAwLCBsID0gYS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGFbaV07XG4gICAgaWYgKHR5cGUoaXRlbSkgPT09ICdhcnJheScpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGl0ZW0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZWVkRmxhdHRlbiA9IGZhbHNlO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIGlmIChuZWVkRmxhdHRlbiA9PT0gZmFsc2UgfHwgYS5sZW5ndGggPT09IDApIHtcbiAgICByZXN1bHQgPSBhO1xuICB9IGVsc2Uge1xuICAgIHJlc3VsdCA9IFtdLmNvbmNhdC5hcHBseShbXSwgcmVzdWx0KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiB0b0FycmF5KGEpIHtcbiAgc3dpdGNoICh0eXBlKGEpKSB7XG4gICAgY2FzZSAndW5kZWZpbmVkJzpcbiAgICBjYXNlICdudWxsJzpcbiAgICAgIHJldHVybiBbXTtcbiAgICBjYXNlICdhcnJheSc6XG4gICAgICByZXR1cm4gX2ZsYXR0ZW4oYSk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBbYV07XG4gIH1cbn1cbmZ1bmN0aW9uIGdldEhhc2goKSB7XG4gIHJldHVybiBPYmplY3QuY3JlYXRlKG51bGwpO1xufVxuZnVuY3Rpb24gbWF0Y2hSZWcoc3RyLCByZWcpIHtcbiAgaWYgKHR5cGUoc3RyKSAhPT0gJ3N0cmluZycgfHwgdHlwZShyZWcpICE9PSAncmVnZXhwJykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiBzdHIubWF0Y2gocmVnKTtcbn1cbi8qbyAuLi4qLyAvKm8gLi4uKi8iLCJcblxuZXhwb3J0IGRlZmF1bHQgbTtcblxuaW1wb3J0IHsgc2xpY2UsIHR5cGUgfSBmcm9tICcuLi91dGlscyc7XG52YXIgdGFnUmVnID0gLyg/OihefCN8XFwuKShbXiNcXC5cXFtcXF1dKykpfChcXFsuKz9cXF0pL2csXG4gICAgYXR0clJlZyA9IC9cXFsoLis/KSg/Oj0oXCJ8J3wpKC4qPylcXDIpP1xcXS87XG5mdW5jdGlvbiBtKCkge1xuICB2YXIgdGFnU3RyID0gYXJndW1lbnRzWzBdLFxuICAgICAgYXR0cnMgPSBhcmd1bWVudHNbMV0sXG4gICAgICBjaGlsZHJlbiA9IHNsaWNlKGFyZ3VtZW50cywgMik7XG4gIGlmICh0eXBlKHRhZ1N0cikgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZWxlY3RvciBpbiBtKHNlbGVjdG9yLCBhdHRycywgY2hpbGRyZW4pIHNob3VsZCBiZSBhIHN0cmluZycpO1xuICB9XG5cbiAgdmFyIGhhc0F0dHIgPSBhdHRycyAhPSBudWxsICYmIHR5cGUoYXR0cnMpID09PSAnb2JqZWN0JyAmJiAhKCd0YWcnIGluIGF0dHJzIHx8ICd2aWV3JyBpbiBhdHRycykgJiYgISgnc3VidHJlZScgaW4gYXR0cnMpLFxuICAgICAgdk5vZGUgPSB7XG4gICAgdGFnOiAnZGl2JyxcbiAgICBhdHRyczoge31cbiAgfSxcbiAgICAgIG1hdGNoLFxuICAgICAgcGFpcixcbiAgICAgIGNsYXNzQXR0ck5hbWUsXG4gICAgICBjbGFzc2VzID0gW107XG4gIC8vbm9ybWFsaXplIGFyZ3VtZW50c1xuICBhdHRycyA9IGhhc0F0dHIgPyBhdHRycyA6IHt9O1xuICBjbGFzc0F0dHJOYW1lID0gJ2NsYXNzJyBpbiBhdHRycyA/ICdjbGFzcycgOiAnY2xhc3NOYW1lJztcbiAgY2hpbGRyZW4gPSBoYXNBdHRyID8gY2hpbGRyZW4gOiBzbGljZShhcmd1bWVudHMsIDEpO1xuICB2Tm9kZS5jaGlsZHJlbiA9IHR5cGUoY2hpbGRyZW5bMF0pID09PSAnYXJyYXknID8gY2hpbGRyZW5bMF0gOiBjaGlsZHJlbjtcblxuICAvL3BhcnNlIHRhZyBzdHJpbmdcbiAgd2hpbGUgKG1hdGNoID0gdGFnUmVnLmV4ZWModGFnU3RyKSkge1xuICAgIGlmIChtYXRjaFsxXSA9PT0gJycgJiYgbWF0Y2hbMl0pIHZOb2RlLnRhZyA9IG1hdGNoWzJdO2Vsc2UgaWYgKG1hdGNoWzFdID09PSAnIycpIHZOb2RlLmF0dHJzLmlkID0gbWF0Y2hbMl07ZWxzZSBpZiAobWF0Y2hbMV0gPT09ICcuJykgY2xhc3Nlcy5wdXNoKG1hdGNoWzJdKTtlbHNlIGlmIChtYXRjaFszXVswXSA9PT0gJ1snKSB7XG4gICAgICBwYWlyID0gYXR0clJlZy5leGVjKG1hdGNoWzNdKTtcbiAgICAgIHZOb2RlLmF0dHJzW3BhaXJbMV1dID0gcGFpclszXSB8fCAocGFpclsyXSA/ICcnIDogdHJ1ZSk7XG4gICAgfVxuICB9XG5cbiAgaWYgKGNsYXNzZXMubGVuZ3RoID4gMCkgdk5vZGUuYXR0cnNbY2xhc3NBdHRyTmFtZV0gPSBjbGFzc2VzLmpvaW4oJyAnKTtcblxuICBPYmplY3Qua2V5cyhhdHRycykuZm9yRWFjaChmdW5jdGlvbiAoYXR0ck5hbWUpIHtcbiAgICB2YXIgYXR0clZhbCA9IGF0dHJzW2F0dHJOYW1lXTtcbiAgICBpZiAoYXR0ck5hbWUgPT09IGNsYXNzQXR0ck5hbWUgJiYgdHlwZShhdHRyVmFsKSAhPT0gJ3N0cmluZycgJiYgYXR0clZhbC50cmltKCkgIT09ICcnKSB7XG4gICAgICB2Tm9kZS5hdHRyc1thdHRyTmFtZV0gPSAodk5vZGUuYXR0cnNbYXR0ck5hbWVdIHx8ICcnKSArICcgJyArIGF0dHJWYWw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZOb2RlLmF0dHJzW2F0dHJOYW1lXSA9IGF0dHJWYWw7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gdk5vZGU7XG59XG5cbm0udHJ1c3QgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgdmFsdWUgPSBuZXcgU3RyaW5nKHZhbHVlKTtcbiAgdmFsdWUuJHRydXN0ZWQgPSB0cnVlO1xuICByZXR1cm4gdmFsdWU7XG59OyIsImV4cG9ydCBkZWZhdWx0IE1hcDtcblxuZnVuY3Rpb24gTWFwKCkge1xuICBpZiAoIXRoaXMgaW5zdGFuY2VvZiBNYXApIHtcbiAgICByZXR1cm4gbmV3IE1hcCgpO1xuICB9XG4gIHRoaXMuX2luZGV4ID0gLTE7XG4gIHRoaXMuX2tleXMgPSBbXTtcbiAgdGhpcy5fdmFsdWVzID0gW107XG59XG5cbk1hcC5wcm90b3R5cGUgPSB7XG4gIGhhczogZnVuY3Rpb24gKGtleSkge1xuICAgIHZhbGlkYXRlS2V5KGtleSk7XG4gICAgdmFyIGxpc3QgPSB0aGlzLl9rZXlzLFxuICAgICAgICBpO1xuICAgIGlmIChrZXkgIT0ga2V5IHx8IGtleSA9PT0gMCkge1xuICAgICAgLy9OYU4gb3IgMFxuICAgICAgZm9yIChpID0gbGlzdC5sZW5ndGg7IGktLSAmJiAhaXMobGlzdFtpXSwga2V5KTspIHt9XG4gICAgfSBlbHNlIHtcbiAgICAgIGkgPSBsaXN0LmluZGV4T2Yoa2V5KTtcbiAgICB9XG4gICAgLy91cGRhdGUgaW5kZXhcbiAgICB0aGlzLl9pbmRleCA9IGk7XG4gICAgcmV0dXJuIC0xIDwgaTtcbiAgfSxcbiAgY2xlYXI6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLl9rZXlzLmxlbmd0aCA9IDA7XG4gICAgdGhpcy5fdmFsdWVzLmxlbmd0aCA9IDA7XG4gICAgdGhpcy5faW5kZXggPSAtMTtcbiAgfSxcbiAgc2V0OiBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgIHRoaXMuaGFzKGtleSkgPyB0aGlzLl92YWx1ZXNbdGhpcy5faW5kZXhdID0gdmFsdWUgOiB0aGlzLl92YWx1ZXNbdGhpcy5fa2V5cy5wdXNoKGtleSkgLSAxXSA9IHZhbHVlO1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuICBnZXQ6IGZ1bmN0aW9uIChrZXksIGRlZmF1bHRWYWx1ZSkge1xuICAgIGlmICh0aGlzLmhhcyhrZXkpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdmFsdWVzW3RoaXMuX2luZGV4XTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIHRoaXMuc2V0KGtleSwgZGVmYXVsdFZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XG4gICAgfVxuICB9LFxuICByZW1vdmU6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICB2YXIgaSA9IHRoaXMuX2luZGV4O1xuICAgIGlmICh0aGlzLmhhcyhrZXkpKSB7XG4gICAgICB0aGlzLl9rZXlzLnNwbGljZShpLCAxKTtcbiAgICAgIHRoaXMuX3ZhbHVlcy5zcGxpY2UoaSwgMSk7XG4gICAgfVxuICAgIHJldHVybiAtMSA8IGk7XG4gIH1cbn07XG4vL2RldGVjdCBOYU4vMCBlcXVhbGl0eVxuZnVuY3Rpb24gaXMoYSwgYikge1xuICByZXR1cm4gaXNOYU4oYSkgPyBpc05hTihiKSA6IGEgPT09IGI7XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlS2V5KGtleSkge1xuICBpZiAoa2V5ICE9PSBPYmplY3Qoa2V5KSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1tNYXBdSW52YWxpZCB2YWx1ZSB1c2VkIGFzIGEgbWFwIGtleSEgZ2l2ZW46ICcgKyBrZXkpO1xuICB9XG59IiwiaW1wb3J0IE1hcCBmcm9tICcuL21hcCc7XG5leHBvcnQgeyBNYXAgfTsiLCJcbmV4cG9ydCBkZWZhdWx0IGFkZEV2ZW50TGlzdGVuZXI7XG4vL2xpc3RlbiBhbGwgZXZlbnQgYXQgY2FwdHVyZSBwaGFzZVxuXG5mdW5jdGlvbiBhZGRFdmVudExpc3RlbmVyKGVsLCB0eXBlLCBoYW5kbGVyKSB7XG4gIHJldHVybiBlbC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGhhbmRsZXIsIHRydWUpO1xufSIsIlxuZXhwb3J0IGRlZmF1bHQgcmVtb3ZlRXZlbnRMaXN0ZW5lcjtcbi8vbGlzdGVuIGFsbCBldmVudCBhdCBjYXB0dXJlIHBoYXNlXG5cbmZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXIoZWwsIHR5cGUsIGhhbmRsZXIpIHtcbiAgcmV0dXJuIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgaGFuZGxlciwgdHJ1ZSk7XG59IiwiXG5pbXBvcnQgeyBleHRlbmQgfSBmcm9tIFwiLi4vdXRpbHNcIjtcbnZhciBFVl9QUk9QUyA9IHtcbiAgYWxsOiBbXCJhbHRLZXlcIiwgXCJidWJibGVzXCIsIFwiY2FuY2VsYWJsZVwiLCBcImN0cmxLZXlcIiwgXCJldmVudFBoYXNlXCIsIFwibWV0YUtleVwiLCBcInJlbGF0ZWRUYXJnZXRcIiwgXCJzaGlmdEtleVwiLCBcInRhcmdldFwiLCBcInRpbWVTdGFtcFwiLCBcInR5cGVcIiwgXCJ2aWV3XCIsIFwid2hpY2hcIl0sXG4gIG1vdXNlOiBbXCJidXR0b25cIiwgXCJidXR0b25zXCIsIFwiY2xpZW50WFwiLCBcImNsaWVudFlcIiwgXCJsYXllclhcIiwgXCJsYXllcllcIiwgXCJvZmZzZXRYXCIsIFwib2Zmc2V0WVwiLCBcInBhZ2VYXCIsIFwicGFnZVlcIiwgXCJzY3JlZW5YXCIsIFwic2NyZWVuWVwiLCBcInRvRWxlbWVudFwiXSxcbiAga2V5OiBbXCJjaGFyXCIsIFwiY2hhckNvZGVcIiwgXCJrZXlcIiwgXCJrZXlDb2RlXCJdXG59O1xudmFyIHJrZXlFdmVudCA9IC9ea2V5fGlucHV0LztcbnZhciBybW91c2VFdmVudCA9IC9eKD86bW91c2V8cG9pbnRlcnxjb250ZXh0bWVudSl8Y2xpY2svO2V4cG9ydCBkZWZhdWx0IFByb3h5RXZlbnQ7XG5cbmZ1bmN0aW9uIFByb3h5RXZlbnQoZXYpIHtcbiAgaWYgKCF0aGlzIGluc3RhbmNlb2YgUHJveHlFdmVudCkge1xuICAgIHJldHVybiBuZXcgUHJveHlFdmVudChldik7XG4gIH1cbiAgdGhpcy5pbml0KGV2KTtcblxuICBpZiAocmtleUV2ZW50LnRlc3QoZXYudHlwZSkpIHtcbiAgICBzeW50aGVzaXplRXZQcm9wcyh0aGlzLCBldiwgXCJrZXlcIik7XG4gIH0gZWxzZSBpZiAocm1vdXNlRXZlbnQudGVzdChldi50eXBlKSkge1xuICAgIHN5bnRoZXNpemVFdlByb3BzKHRoaXMsIGV2LCBcIm1vdXNlXCIpO1xuICB9XG59XG5Qcm94eUV2ZW50LnByb3RvdHlwZSA9IGV4dGVuZChQcm94eUV2ZW50LnByb3RvdHlwZSwge1xuICBpbml0OiBmdW5jdGlvbiAoZXYpIHtcbiAgICBzeW50aGVzaXplRXZQcm9wcyh0aGlzLCBldiwgXCJhbGxcIik7XG4gICAgdGhpcy5vcmlnaW5hbEV2ZW50ID0gZXY7XG4gICAgdGhpcy5fYnViYmxlcyA9IGZhbHNlO1xuICB9LFxuICBwcmV2ZW50RGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLm9yaWdpbmFsRXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgfSxcbiAgc3RhcnRQcm9wYWdhdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuX2J1YmJsZXMgPSB0cnVlO1xuICB9XG59KTtcblxuZnVuY3Rpb24gc3ludGhlc2l6ZUV2UHJvcHMocHJveHksIGV2LCBjYXRlZ29yeSkge1xuICB2YXIgZXZQcm9wcyA9IEVWX1BST1BTW2NhdGVnb3J5XTtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBldlByb3BzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIHZhciBwcm9wID0gZXZQcm9wc1tpXTtcbiAgICBwcm94eVtwcm9wXSA9IGV2W3Byb3BdO1xuICB9XG59IiwiXG5cbmV4cG9ydCBkZWZhdWx0IERPTURlbGVnYXRvcjtcbi8qKlxuICogZG9tLWRlbGVnYXRvcmUgYWxsb3dzIHlvdSB0byBhdHRhY2ggYW4gRXZlbnRIYW5kbGVyIHRvIGEgZG9tIGVsZW1lbnQuXG4gKiBXaGVuIHRoZSBjb3JyZWN0IGV2ZW50IG9jY3VycywgZG9tLWRlbGVnYXRvciB3aWxsIGxldCB0aGUgZ2xvYmFsIGRlbGVnYXRlXG4gKiBldmVudEhhbmRsZXIgdG8gaGFuZGxlIHRoZSBldmVudCBhbmQgdHJpZ2dlciB5b3VyIGF0dGFjaGVkIEV2ZW50SGFuZGxlci5cbiAqL1xuaW1wb3J0IHsgZG9jdW1lbnQgYXMgJGRvY3VtZW50IH0gZnJvbSAnLi4vZ2xvYmFscyc7XG5cbmltcG9ydCBhZGRFdmVudExpc3RlbmVyIGZyb20gJy4vYWRkRXZlbnQnO1xuaW1wb3J0IHJlbW92ZUV2ZW50TGlzdGVuZXIgZnJvbSAnLi9yZW1vdmVFdmVudCc7XG5pbXBvcnQgUHJveHlFdmVudCBmcm9tICcuL3Byb3h5RXZlbnQnO1xuaW1wb3J0IHsgdHlwZSwgZ2V0SGFzaCB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB7IE1hcCB9IGZyb20gJy4uL3N0b3JlJztcbmZ1bmN0aW9uIERPTURlbGVnYXRvcihkb2MpIHtcbiAgaWYgKCF0aGlzIGluc3RhbmNlb2YgRE9NRGVsZWdhdG9yKSB7XG4gICAgcmV0dXJuIG5ldyBET01EZWxlZ2F0b3IoZG9jKTtcbiAgfVxuXG4gIGRvYyA9IGRvYyB8fCAkZG9jdW1lbnQgfHwgeyBkb2N1bWVudEVsZW1lbnQ6IDEgfTsgLy9lbmFibGUgdG8gcnVuIGluIG5vZGVqcztcbiAgaWYgKCFkb2MuZG9jdW1lbnRFbGVtZW50KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdbRE9NRGVsZWdhdG9yXUludmFsaWQgcGFyYW1ldGVyIFwiZG9jXCIsIHNob3VsZCBiZSBhIGRvY3VtZW50IG9iamVjdCEgZ2l2ZW46ICcgKyBkb2MpO1xuICB9XG4gIHRoaXMucm9vdCA9IGRvYy5kb2N1bWVudEVsZW1lbnQ7XG4gIHRoaXMubGlzdGVuZWRFdmVudHMgPSBnZXRIYXNoKCk7XG4gIHRoaXMuZXZlbnREaXNwYXRjaGVycyA9IGdldEhhc2goKTtcbiAgdGhpcy5nbG9iYWxMaXN0ZW5lcnMgPSBnZXRIYXNoKCk7XG4gIHRoaXMuZG9tRXZIYW5kbGVyTWFwID0gbmV3IE1hcCgpO1xufVxuXG52YXIgcHJvdG8gPSBET01EZWxlZ2F0b3IucHJvdG90eXBlO1xuXG5wcm90by5vbiA9IGZ1bmN0aW9uIG9uKGVsLCBldlR5cGUsIGhhbmRsZXIpIHtcbiAgdmFyIGV2U3RvcmUgPSBnZXRFdlN0b3JlKHRoaXMuZG9tRXZIYW5kbGVyTWFwLCBlbCwgZ2V0SGFzaCgpKTtcbiAgYWRkTGlzdGVuZXIoZXZTdG9yZSwgZXZUeXBlLCB0aGlzLCBoYW5kbGVyKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5wcm90by5vZmYgPSBmdW5jdGlvbiBvZmYoZWwsIGV2VHlwZSwgaGFuZGxlcikge1xuICB2YXIgZXZTdG9yZSA9IGdldEV2U3RvcmUodGhpcy5kb21FdkhhbmRsZXJNYXAsIGVsKTtcbiAgaWYgKCFldlN0b3JlKSByZXR1cm4gdGhpcztcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMykge1xuICAgIHJlbW92ZUxpc3RlbmVyKGV2U3RvcmUsIGV2VHlwZSwgdGhpcywgaGFuZGxlcik7XG4gIH0gZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgIHJlbW92ZUxpc3RlbmVyKGV2U3RvcmUsIGV2VHlwZSwgdGhpcyk7XG4gIH0gZWxzZSB7XG4gICAgcmVtb3ZlQWxsTGlzdGVuZXIoZXZTdG9yZSwgdGhpcyk7XG4gIH1cblxuICBpZiAoT2JqZWN0LmtleXMoZXZTdG9yZSkubGVuZ3RoID09PSAwKSB7XG4gICAgdGhpcy5kb21FdkhhbmRsZXJNYXAucmVtb3ZlKGVsKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbnByb3RvLmFkZEdsb2JhbEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbiBhZGRHbG9iYWxFdmVudExpc3RlbmVyKGV2VHlwZSwgaGFuZGxlcikge1xuICBhZGRMaXN0ZW5lcih0aGlzLmdsb2JhbExpc3RlbmVycywgZXZUeXBlLCB0aGlzLCBoYW5kbGVyKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xucHJvdG8ucmVtb3ZlR2xvYmFsRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uIHJlbW92ZUdsb2JhbEV2ZW50TGlzdGVuZXIoZXZUeXBlLCBoYW5kbGVyKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDIpIHtcbiAgICByZW1vdmVMaXN0ZW5lcih0aGlzLmdsb2JhbExpc3RlbmVycywgZXZUeXBlLCB0aGlzLCBoYW5kbGVyKTtcbiAgfSBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgcmVtb3ZlTGlzdGVuZXIodGhpcy5nbG9iYWxMaXN0ZW5lcnMsIGV2VHlwZSwgdGhpcyk7XG4gIH0gZWxzZSB7XG4gICAgcmVtb3ZlQWxsTGlzdGVuZXIodGhpcy5nbG9iYWxMaXN0ZW5lcnMsIHRoaXMpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xucHJvdG8uZGVzdHJveSA9IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gIHRoaXMudW5saXN0ZW5UbygpO1xuICB0aGlzLmxpc3RlbmVkRXZlbnRzID0gbnVsbDtcbiAgdGhpcy5ldmVudERpc3BhdGNoZXJzID0gbnVsbDtcbiAgdGhpcy5nbG9iYWxMaXN0ZW5lcnMgPSBudWxsO1xuICB0aGlzLmRvbUV2SGFuZGxlck1hcC5jbGVhcigpO1xufTtcblxuLy9mb3IgZWFjaCBldlR5cGUsIGluY3JlYXNlIGJ5IDEgaWYgdGhlcmUgaXMgYSBuZXcgZWwgc3RhcnQgdG8gbGlzdGVuXG4vLyB0byB0aGlzIHR5cGUgb2YgZXZlbnRcbnByb3RvLmxpc3RlblRvID0gZnVuY3Rpb24gbGlzdGVuVG8oZXZUeXBlKSB7XG4gIGlmICghKGV2VHlwZSBpbiB0aGlzLmxpc3RlbmVkRXZlbnRzKSkge1xuICAgIHRoaXMubGlzdGVuZWRFdmVudHNbZXZUeXBlXSA9IDA7XG4gIH1cbiAgdGhpcy5saXN0ZW5lZEV2ZW50c1tldlR5cGVdKys7XG5cbiAgaWYgKHRoaXMubGlzdGVuZWRFdmVudHNbZXZUeXBlXSAhPT0gMSkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgbGlzdGVuZXIgPSB0aGlzLmV2ZW50RGlzcGF0Y2hlcnNbZXZUeXBlXTtcbiAgaWYgKCFsaXN0ZW5lcikge1xuICAgIGxpc3RlbmVyID0gdGhpcy5ldmVudERpc3BhdGNoZXJzW2V2VHlwZV0gPSBjcmVhdGVEaXNwYXRjaGVyKGV2VHlwZSwgdGhpcyk7XG4gIH1cbiAgYWRkRXZlbnRMaXN0ZW5lcih0aGlzLnJvb3QsIGV2VHlwZSwgbGlzdGVuZXIpO1xuICByZXR1cm4gdGhpcztcbn07XG4vL2ZvciBlYWNoIGV2VHlwZSwgZGVjcmVhc2UgYnkgMSBpZiB0aGVyZSBpcyBhIGVsIHN0b3AgdG8gbGlzdGVuXG4vLyB0byB0aGlzIHR5cGUgb2YgZXZlbnRcbnByb3RvLnVubGlzdGVuVG8gPSBmdW5jdGlvbiB1bmxpc3RlblRvKGV2VHlwZSkge1xuICB2YXIgZXZlbnREaXNwYXRjaGVycyA9IHRoaXMuZXZlbnREaXNwYXRjaGVycyxcbiAgICAgIGRlbGVnYXRvciA9IHRoaXM7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgLy9yZW1vdmUgYWxsIGRpc3BhdGNoIGxpc3RlbmVyc1xuICAgIE9iamVjdC5rZXlzKGV2ZW50RGlzcGF0Y2hlcnMpLmZpbHRlcihmdW5jdGlvbiAoZXZUeXBlKSB7XG4gICAgICB2YXIgcnRuID0gISFldmVudERpc3BhdGNoZXJzW2V2VHlwZV07XG4gICAgICBpZiAocnRuKSB7XG4gICAgICAgIC8vZm9yY2UgdG8gY2FsbCByZW1vdmVFdmVudExpc3RlbmVyIG1ldGhvZFxuICAgICAgICBldmVudERpc3BhdGNoZXJzW2V2VHlwZV0gPSAxO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJ0bjtcbiAgICB9KS5mb3JFYWNoKGZ1bmN0aW9uIChldlR5cGUpIHtcbiAgICAgIGRlbGVnYXRvci51bmxpc3RlblRvKGV2VHlwZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgaWYgKCEoZXZUeXBlIGluIHRoaXMubGlzdGVuZWRFdmVudHMpIHx8IHRoaXMubGlzdGVuZWRFdmVudHNbZXZUeXBlXSA9PT0gMCkge1xuICAgIGNvbnNvbGUubG9nKCdbRE9NRGVsZWdhdG9yIHVubGlzdGVuVG9dZXZlbnQgXCInICsgZXZUeXBlICsgJ1wiIGlzIGFscmVhZHkgdW5saXN0ZW5lZCEnKTtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5saXN0ZW5lZEV2ZW50c1tldlR5cGVdLS07XG4gIGlmICh0aGlzLmxpc3RlbmVkRXZlbnRzW2V2VHlwZV0gPiAwKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBsaXN0ZW5lciA9IHRoaXMuZXZlbnREaXNwYXRjaGVyc1tldlR5cGVdO1xuICBpZiAoIWxpc3RlbmVyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdbRE9NRGVsZWdhdG9yIHVubGlzdGVuVG9dOiBjYW5ub3QgJyArICd1bmxpc3RlbiB0byAnICsgZXZUeXBlKTtcbiAgfVxuICByZW1vdmVFdmVudExpc3RlbmVyKHRoaXMucm9vdCwgZXZUeXBlLCBsaXN0ZW5lcik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuZnVuY3Rpb24gY3JlYXRlRGlzcGF0Y2hlcihldlR5cGUsIGRlbGVnYXRvcikge1xuICB2YXIgZ2xvYmFsTGlzdGVuZXJzID0gZGVsZWdhdG9yLmdsb2JhbExpc3RlbmVycyxcbiAgICAgIGRlbGVnYXRvclJvb3QgPSBkZWxlZ2F0b3Iucm9vdDtcbiAgcmV0dXJuIGZ1bmN0aW9uIGRpc3BhdGNoZXIoZXYpIHtcbiAgICB2YXIgZ2xvYmFsSGFuZGxlcnMgPSBnbG9iYWxMaXN0ZW5lcnNbZXZUeXBlXSB8fCBbXTtcbiAgICBpZiAoZ2xvYmFsSGFuZGxlcnMgJiYgZ2xvYmFsSGFuZGxlcnMubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIGdsb2JhbEV2ZW50ID0gbmV3IFByb3h5RXZlbnQoZXYpO1xuICAgICAgZ2xvYmFsRXZlbnQudGFyZ2V0ID0gZGVsZWdhdG9yUm9vdDtcbiAgICAgIGNhbGxMaXN0ZW5lcnMoZ2xvYmFsSGFuZGxlcnMsIGdsb2JhbEV2ZW50KTtcbiAgICB9XG5cbiAgICBmaW5kQW5kSW52b2tlTGlzdGVuZXJzKGV2LnRhcmdldCwgZXYsIGV2VHlwZSwgZGVsZWdhdG9yKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZmluZEFuZEludm9rZUxpc3RlbmVycyhlbCwgZXYsIGV2VHlwZSwgZGVsZWdhdG9yKSB7XG4gIHZhciBsaXN0ZW5lciA9IGdldExpc3RlbmVyKGVsLCBldlR5cGUsIGRlbGVnYXRvcik7XG4gIGlmIChsaXN0ZW5lciAmJiBsaXN0ZW5lci5oYW5kbGVycy5sZW5ndGggPiAwKSB7XG4gICAgdmFyIGxpc3RlbmVyRXZlbnQgPSBuZXcgUHJveHlFdmVudChldik7XG4gICAgbGlzdGVuZXJFdmVudC5jdXJyZW50VGFyZ2V0ID0gbGlzdGVuZXIuY3VycmVudFRhcmdldDtcbiAgICBjYWxsTGlzdGVuZXJzKGxpc3RlbmVyLmhhbmRsZXJzLCBsaXN0ZW5lckV2ZW50KTtcbiAgICBpZiAobGlzdGVuZXJFdmVudC5fYnViYmxlcykge1xuICAgICAgZmluZEFuZEludm9rZUxpc3RlbmVycyhsaXN0ZW5lci5jdXJyZW50VGFyZ2V0LnBhcmVudE5vZGUsIGV2LCBldlR5cGUsIGRlbGVnYXRvcik7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGdldExpc3RlbmVyKHRhcmdldCwgZXZUeXBlLCBkZWxlZ2F0b3IpIHtcbiAgaWYgKHRhcmdldCA9PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmFyIGV2U3RvcmUgPSBnZXRFdlN0b3JlKGRlbGVnYXRvci5kb21FdkhhbmRsZXJNYXAsIHRhcmdldCksXG4gICAgICBoYW5kbGVycztcbiAgaWYgKCFldlN0b3JlIHx8ICEoaGFuZGxlcnMgPSBldlN0b3JlW2V2VHlwZV0pIHx8IGhhbmRsZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBnZXRMaXN0ZW5lcih0YXJnZXQucGFyZW50Tm9kZSwgZXZUeXBlLCBkZWxlZ2F0b3IpO1xuICB9XG4gIHJldHVybiB7XG4gICAgY3VycmVudFRhcmdldDogdGFyZ2V0LFxuICAgIGhhbmRsZXJzOiBoYW5kbGVyc1xuICB9O1xufVxuXG5mdW5jdGlvbiBjYWxsTGlzdGVuZXJzKGhhbmRsZXJzLCBldikge1xuICBoYW5kbGVycy5mb3JFYWNoKGZ1bmN0aW9uIChoYW5kbGVyKSB7XG4gICAgaWYgKHR5cGUoaGFuZGxlcikgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGhhbmRsZXIoZXYpO1xuICAgIH0gZWxzZSBpZiAodHlwZShoYW5kbGVyLmhhbmRsZUV2ZW50KSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgaGFuZGxlci5oYW5kbGVFdmVudChldik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignW0RPTURlbGVnYXRvciBjYWxsTGlzdGVuZXJzXSB1bmtub3duIGhhbmRsZXIgJyArICdmb3VuZDogJyArIEpTT04uc3RyaW5naWZ5KGhhbmRsZXJzKSk7XG4gICAgfVxuICB9KTtcbn1cbi8vaGVscGVyc1xuZnVuY3Rpb24gZ2V0RXZTdG9yZShtYXAsIGVsLCBkZWZhdWx0U3RvcmUpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPiAyID8gbWFwLmdldChlbCwgZGVmYXVsdFN0b3JlKSA6IG1hcC5nZXQoZWwpO1xufVxuXG5mdW5jdGlvbiBhZGRMaXN0ZW5lcihldkhhc2gsIGV2VHlwZSwgZGVsZWdhdG9yLCBoYW5kbGVyKSB7XG4gIHZhciBoYW5kbGVycyA9IGV2SGFzaFtldlR5cGVdIHx8IFtdO1xuICBpZiAoaGFuZGxlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgLy9pdCdzIGZpcnN0IHRpbWUgZm9yIHRoaXMgZWwgdG8gbGlzdGVuIHRvIGV2ZW50IG9mIGV2VHlwZVxuICAgIGRlbGVnYXRvci5saXN0ZW5UbyhldlR5cGUpO1xuICB9XG4gIGlmIChoYW5kbGVycy5pbmRleE9mKGhhbmRsZXIpID09PSAtMSkge1xuICAgIGhhbmRsZXJzLnB1c2goaGFuZGxlcik7XG4gIH1cbiAgZXZIYXNoW2V2VHlwZV0gPSBoYW5kbGVycztcbiAgcmV0dXJuIGhhbmRsZXI7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKGV2SGFzaCwgZXZUeXBlLCBkZWxlZ2F0b3IsIGhhbmRsZXIpIHtcbiAgdmFyIGhhbmRsZXJzID0gZXZIYXNoW2V2VHlwZV07XG4gIGlmICghaGFuZGxlcnMgfHwgaGFuZGxlcnMubGVuZ3RoID09PSAwIHx8IGFyZ3VtZW50cy5sZW5ndGggPT09IDMpIHtcbiAgICBpZiAoaGFuZGxlcnMgJiYgaGFuZGxlcnMubGVuZ3RoKSB7XG4gICAgICAvL3RoaXMgZWwgc3RvcCB0byBsaXN0ZW4gdG8gZXZlbnQgb2YgZXZUeXBlXG4gICAgICBkZWxlZ2F0b3IudW5saXN0ZW5UbyhldlR5cGUpO1xuICAgIH1cbiAgICBkZWxldGUgZXZIYXNoW2V2VHlwZV07XG4gICAgcmV0dXJuIGhhbmRsZXI7XG4gIH1cbiAgdmFyIGluZGV4ID0gaGFuZGxlcnMuaW5kZXhPZihoYW5kbGVyKTtcbiAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgIGhhbmRsZXJzLnNwbGljZShpbmRleCwgMSk7XG4gIH1cbiAgZXZIYXNoW2V2VHlwZV0gPSBoYW5kbGVycztcbiAgaWYgKGhhbmRsZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgIC8vdGhpcyBlbCBzdG9wIHRvIGxpc3RlbiB0byBldmVudCBvZiBldlR5cGVcbiAgICBkZWxlZ2F0b3IudW5saXN0ZW5UbyhldlR5cGUpO1xuICAgIGRlbGV0ZSBldkhhc2hbZXZUeXBlXTtcbiAgfVxuICByZXR1cm4gaGFuZGxlcjtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlQWxsTGlzdGVuZXIoZXZIYXNoLCBkZWxlZ2F0b3IpIHtcbiAgT2JqZWN0LmtleXMoZXZIYXNoKS5mb3JFYWNoKGZ1bmN0aW9uIChldlR5cGUpIHtcbiAgICByZW1vdmVMaXN0ZW5lcihldkhhc2gsIGV2VHlwZSwgZGVsZWdhdG9yKTtcbiAgfSk7XG4gIHJldHVybiBldkhhc2g7XG59IiwiaW1wb3J0IHsgcmVxdWVzdEFuaW1hdGlvbkZyYW1lIGFzIHJhZiwgY2FuY2VsQW5pbWF0aW9uRnJhbWUgYXMgY2FuY2VsUmFmLCBGUkFNRV9CVURHRVQgfSBmcm9tICcuL3JhZic7XG5pbXBvcnQgeyB0eXBlLCBOT09QIH0gZnJvbSAnLi4vdXRpbHMnO1xuZnVuY3Rpb24gQmF0Y2gob3B0cykge1xuICB0aGlzLm9wdGlvbnMgPSBvcHRzIHx8IHt9O1xuICB2YXIgY2IgPSB0aGlzLm9wdGlvbnMub25GbHVzaDtcbiAgdGhpcy5fY2IgPSB0eXBlKGNiKSA9PT0gJ2Z1bmN0aW9uJyA/IGNiIDogTk9PUDtcbiAgdGhpcy5fcXVldWUgPSBbXTtcbiAgdGhpcy5fc3RhcnRQb3MgPSAwO1xuICB0aGlzLmZsdXNoID0gdGhpcy5mbHVzaC5iaW5kKHRoaXMpO1xufVxuQmF0Y2gucHJvdG90eXBlLmFkZFRhcmdldCA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgdmFyIG9sZExlbiA9IHRoaXMuX3F1ZXVlLmxlbmd0aDtcbiAgaWYgKHR5cGUodGhpcy5vcHRpb25zLm9uQWRkVGFyZ2V0KSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHRoaXMuX3F1ZXVlID0gdGhpcy5vcHRpb25zLm9uQWRkVGFyZ2V0LmNhbGwodGhpcywgdGhpcy5fcXVldWUsIHRhcmdldCk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fcXVldWUucHVzaCh0YXJnZXQpO1xuICB9XG5cbiAgaWYgKG9sZExlbiA9PT0gMCAmJiB0aGlzLl9xdWV1ZS5sZW5ndGggPT09IDEpIHtcbiAgICB0aGlzLnNjaGVkdWxlRmx1c2goKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5CYXRjaC5wcm90b3R5cGUucmVtb3ZlVGFyZ2V0ID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICB2YXIgaWR4ID0gdGhpcy5fcXVldWUuaW5kZXhPZih0YXJnZXQpO1xuICBpZiAoaWR4ICE9PSAtMSkgdGhpcy5fcXVldWUuc3BsaWNlKGlkeCwgMSk7XG4gIHJldHVybiB0aGlzO1xufTtcbkJhdGNoLnByb3RvdHlwZS5mbHVzaCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHN0YXJ0VGltZSA9IG5ldyBEYXRlKCksXG4gICAgICBlbGFwc2VkVGltZSxcbiAgICAgIGNiID0gdGhpcy5fY2IsXG4gICAgICBzdGFydFBvcyA9IHRoaXMuX3N0YXJ0UG9zLFxuICAgICAgdGFzayxcbiAgICAgIF9pLFxuICAgICAgX2xlbixcbiAgICAgIF9yZWY7XG4gIF9yZWYgPSB0aGlzLl9xdWV1ZTtcbiAgZm9yIChfaSA9IHN0YXJ0UG9zLCBfbGVuID0gX3JlZi5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgIHRhc2sgPSBfcmVmW19pXTtcbiAgICBjYi5jYWxsKG51bGwsIHRhc2spO1xuICAgIGVsYXBzZWRUaW1lID0gbmV3IERhdGUoKSAtIHN0YXJ0VGltZTtcbiAgICBpZiAoZWxhcHNlZFRpbWUgPiBGUkFNRV9CVURHRVQpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdmcmFtZSBidWRnZXQgb3ZlcmZsb3c6JywgZWxhcHNlZFRpbWUpO1xuICAgICAgX2krKztcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHRoaXMuX3F1ZXVlLnNwbGljZSgwLCBfaSk7XG4gIHRoaXMuX3N0YXJ0UG9zID0gMDtcblxuICBpZiAodGhpcy5fcXVldWUubGVuZ3RoKSB7XG4gICAgdGhpcy5zY2hlZHVsZUZsdXNoKCk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHR5cGUodGhpcy5vcHRpb25zLm9uRmluaXNoKSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5vcHRpb25zLm9uRmluaXNoLmNhbGwobnVsbCk7XG4gICAgfVxuICB9XG59O1xuQmF0Y2gucHJvdG90eXBlLnNjaGVkdWxlRmx1c2ggPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuX3RpY2sgPSByYWYodGhpcy5mbHVzaCk7XG4gIHJldHVybiB0aGlzLl90aWNrO1xufTtcbkJhdGNoLnByb3RvdHlwZS5vbkZsdXNoID0gZnVuY3Rpb24gKGZuKSB7XG4gIGlmICh0eXBlKGZuKSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1tCYXRjaC5wcm90b3R5cGUub25GbHVzaF1uZWVkIGEgRnVuY3Rpb24gaGVyZSwgYnV0IGdpdmVuICcgKyBmbik7XG4gIH1cbiAgdGhpcy5fY2IgPSBmbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuQmF0Y2gucHJvdG90eXBlLmxlbmd0aCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuX3F1ZXVlLmxlbmd0aDtcbn07XG5CYXRjaC5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uICgpIHtcbiAgY2FuY2VsUmFmKHRoaXMuX3RpY2spO1xuICB0aGlzLl9xdWV1ZS5sZW5ndGggPSAwO1xuICByZXR1cm4gdGhpcztcbn07XG5bJ29uQWRkVGFyZ2V0JywgJ29uRmluaXNoJ10uZm9yRWFjaChmdW5jdGlvbiAobW5hbWUpIHtcbiAgQmF0Y2gucHJvdG90eXBlW21uYW1lXSA9IGZ1bmN0aW9uIChmbikge1xuICAgIGlmICh0eXBlKGZuKSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignW0JhdGNoLnByb3RvdHlwZS4nICsgbW5hbWUgKyAnXW5lZWQgYSBGdW5jdGlvbiBoZXJlLCBidXQgZ2l2ZW4gJyArIGZuKTtcbiAgICB9XG4gICAgdGhpcy5vcHRpb25zW21uYW1lXSA9IGZuO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xufSk7XG5leHBvcnQgZGVmYXVsdCBCYXRjaDsiLCJpbXBvcnQgeyBnZXR0ZXJzZXR0ZXIgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IE1hcCB9IGZyb20gJy4vc3RvcmUnO1xuaW1wb3J0IERPTURlbGVnYXRvciBmcm9tICcuL2RvbS1kZWxlZ2F0b3InO1xuaW1wb3J0IEJhdGNoIGZyb20gJy4vdXBkYXRlL2JhdGNoJztcbnZhciBnbG9iYWwgPSB0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnID8gd2luZG93IDoge307XG5leHBvcnQgeyBnbG9iYWwgfTtcbnZhciBkb2N1bWVudCA9IGdsb2JhbC5kb2N1bWVudDtcbmV4cG9ydCB7IGRvY3VtZW50IH07XG52YXIgcnVudGltZSA9IHR5cGVvZiBwcm9jZXNzICE9ICd1bmRlZmluZWQnICYmICFwcm9jZXNzLmJyb3dzZXIgPyAnbm9kZWpzJyA6IHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgPyAnYnJvd3NlcicgOiAndW5rbm93bic7XG5leHBvcnQgeyBydW50aW1lIH07XG52YXIgRyA9IHtcbiAgcGVuZGluZ1JlcXVlc3RzOiAwLFxuICBmb3JjaW5nOiBmYWxzZSxcbiAgdW5sb2FkZXJzOiBbXSxcbiAgLy9kZWZhdWx0IHVwZGF0ZSBzdHJhdGVneSBpcyAnZGlmZicsIHNvIHJlbmRlciBtZXRob2Qgd2lsbCBkaWZmIHVwZGF0ZVxuICB1cGRhdGVTdHJhdGVneTogZ2V0dGVyc2V0dGVyKCdkaWZmJyksXG4gIGNvbXB1dGVQcmVSZWRyYXdIb29rOiBudWxsLFxuICBjb21wdXRlUG9zdFJlZHJhd0hvb2s6IG51bGwsXG4gIC8vbW91bnQgcmVnaXN0cmllc1xuICByb290czogW10sXG4gIHJlY3JlYXRpb25zOiBbXSxcbiAgY29tcG9uZW50czogW10sXG4gIGNvbnRyb2xsZXJzOiBbXSxcbiAgLy9yZW5kZXIgcmVnaXN0cmllc1xuICBkb21DYWNoZU1hcDogbmV3IE1hcCgpLFxuICBkb21EZWxlZ2F0b3I6IG5ldyBET01EZWxlZ2F0b3IoKSxcbiAgLy9nbG9iYWwgYmF0Y2ggcmVuZGVyIHF1ZXVlXG4gIHJlbmRlclF1ZXVlOiBuZXcgQmF0Y2goKVxufTtcbmV4cG9ydCB7IEcgfTsiLCJpbXBvcnQgeyBnbG9iYWwgYXMgJGdsb2JhbCB9IGZyb20gJy4uL2dsb2JhbHMnO1xudmFyIGxhc3RUaW1lID0gMCxcbiAgICBGUkFNRV9CVURHRVQgPSAxNixcbiAgICB2ZW5kb3JzID0gWyd3ZWJraXQnLCAnbW96JywgJ21zJywgJ28nXSxcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSAkZ2xvYmFsLnJlcXVlc3RBbmltYXRpb25GcmFtZSxcbiAgICBjYW5jZWxBbmltYXRpb25GcmFtZSA9ICRnbG9iYWwuY2FuY2VsQW5pbWF0aW9uRnJhbWUgfHwgJGdsb2JhbC5jYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG5mb3IgKHZhciB4ID0gMCwgbCA9IHZlbmRvcnMubGVuZ3RoOyB4IDwgbCAmJiAhcmVxdWVzdEFuaW1hdGlvbkZyYW1lOyArK3gpIHtcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gJGdsb2JhbFt2ZW5kb3JzW3hdICsgJ1JlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuICBjYW5jZWxBbmltYXRpb25GcmFtZSA9ICRnbG9iYWxbdmVuZG9yc1t4XSArICdDYW5jZWxBbmltYXRpb25GcmFtZSddIHx8ICRnbG9iYWxbdmVuZG9yc1t4XSArICdDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcbn1cblxuaWYgKCFyZXF1ZXN0QW5pbWF0aW9uRnJhbWUpIHtcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgdmFyIGN1cnJUaW1lID0gRGF0ZS5ub3cgPyBEYXRlLm5vdygpIDogbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgdmFyIHRpbWVUb0NhbGwgPSBNYXRoLm1heCgwLCBGUkFNRV9CVURHRVQgLSAoY3VyclRpbWUgLSBsYXN0VGltZSkpO1xuICAgIHZhciBpZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgY2FsbGJhY2soY3VyclRpbWUgKyB0aW1lVG9DYWxsKTtcbiAgICB9LCB0aW1lVG9DYWxsKTtcbiAgICBsYXN0VGltZSA9IGN1cnJUaW1lICsgdGltZVRvQ2FsbDtcbiAgICByZXR1cm4gaWQ7XG4gIH07XG59XG5cbmlmICghY2FuY2VsQW5pbWF0aW9uRnJhbWUpIHtcbiAgY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICByZXR1cm4gY2xlYXJUaW1lb3V0KGlkKTtcbiAgfTtcbn1cblxuZXhwb3J0IHsgcmVxdWVzdEFuaW1hdGlvbkZyYW1lLCBjYW5jZWxBbmltYXRpb25GcmFtZSwgRlJBTUVfQlVER0VUIH07IiwiXG5leHBvcnQgZGVmYXVsdCBjbGVhcjtcblxuaW1wb3J0IHsgdHlwZSwgTk9PUCB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB7IEcgfSBmcm9tICcuLi9nbG9iYWxzJztcbnZhciBkb21DYWNoZU1hcCA9IEcuZG9tQ2FjaGVNYXA7XG52YXIgZG9tRGVsZWdhdG9yID0gRy5kb21EZWxlZ2F0b3I7XG5mdW5jdGlvbiBjbGVhcihkb21Ob2Rlcywgdk5vZGVzKSB7XG4gIHZOb2RlcyA9IHZOb2RlcyB8fCBbXTtcbiAgdk5vZGVzID0gW10uY29uY2F0KHZOb2Rlcyk7XG4gIGZvciAodmFyIGkgPSBkb21Ob2Rlcy5sZW5ndGggLSAxOyBpID4gLTE7IGktLSkge1xuICAgIGlmIChkb21Ob2Rlc1tpXSAmJiBkb21Ob2Rlc1tpXS5wYXJlbnROb2RlKSB7XG4gICAgICBpZiAodk5vZGVzW2ldKSB1bmxvYWQodk5vZGVzW2ldKTsgLy8gY2xlYW51cCBiZWZvcmUgZG9tIGlzIHJlbW92ZWQgZnJvbSBkb20gdHJlZVxuICAgICAgZG9tRGVsZWdhdG9yLm9mZihkb21Ob2Rlc1tpXSk7XG4gICAgICBkb21DYWNoZU1hcC5yZW1vdmUoZG9tTm9kZXNbaV0pO1xuICAgICAgdHJ5IHtcbiAgICAgICAgZG9tTm9kZXNbaV0ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChkb21Ob2Rlc1tpXSk7XG4gICAgICB9IGNhdGNoIChlKSB7fSAvL2lnbm9yZSBpZiB0aGlzIGZhaWxzIGR1ZSB0byBvcmRlciBvZiBldmVudHMgKHNlZSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzIxOTI2MDgzL2ZhaWxlZC10by1leGVjdXRlLXJlbW92ZWNoaWxkLW9uLW5vZGUpXG4gICAgICAvLyB2Tm9kZXMgPSBbXS5jb25jYXQodk5vZGVzKTtcbiAgICB9XG4gIH1cbiAgaWYgKGRvbU5vZGVzLmxlbmd0aCAhPSAwKSBkb21Ob2Rlcy5sZW5ndGggPSAwO1xufVxuXG5mdW5jdGlvbiB1bmxvYWQodk5vZGUpIHtcbiAgaWYgKHZOb2RlLmNvbmZpZ0NvbnRleHQgJiYgdHlwZSh2Tm9kZS5jb25maWdDb250ZXh0Lm9udW5sb2FkKSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHZOb2RlLmNvbmZpZ0NvbnRleHQub251bmxvYWQoKTtcbiAgICB2Tm9kZS5jb25maWdDb250ZXh0Lm9udW5sb2FkID0gbnVsbDtcbiAgfVxuICBpZiAodk5vZGUuY29udHJvbGxlcnMpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgY29udHJvbGxlciA9IHVuZGVmaW5lZDsgY29udHJvbGxlciA9IHZOb2RlLmNvbnRyb2xsZXJzW2ldOyBpKyspIHtcbiAgICAgIGlmICh0eXBlKGNvbnRyb2xsZXIub251bmxvYWQpID09PSAnZnVuY3Rpb24nKSBjb250cm9sbGVyLm9udW5sb2FkKHtcbiAgICAgICAgcHJldmVudERlZmF1bHQ6IE5PT1BcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICBpZiAodk5vZGUuY2hpbGRyZW4pIHtcbiAgICBpZiAodHlwZSh2Tm9kZS5jaGlsZHJlbikgPT09ICdhcnJheScpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBjaGlsZCA9IHVuZGVmaW5lZDsgY2hpbGQgPSB2Tm9kZS5jaGlsZHJlbltpXTsgaSsrKSB7XG4gICAgICAgIHVubG9hZChjaGlsZCk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh2Tm9kZS5jaGlsZHJlbi50YWcpIHtcbiAgICAgIHVubG9hZCh2Tm9kZS5jaGlsZHJlbik7XG4gICAgfVxuICB9XG59IiwiXG5leHBvcnQgZGVmYXVsdCBzZXRBdHRyaWJ1dGVzO1xuXG5pbXBvcnQgeyB0eXBlLCBtYXRjaFJlZyB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB7IEcgfSBmcm9tICcuLi9nbG9iYWxzJztcbnZhciBkb21EZWxlZ2F0b3IgPSBHLmRvbURlbGVnYXRvcjtcbnZhciBldkF0dHJSZWcgPSAvXmV2KFtBLVpdXFx3KikvO1xuZnVuY3Rpb24gc2V0QXR0cmlidXRlcyhkb21Ob2RlLCB0YWcsIGRhdGFBdHRycywgY2FjaGVkQXR0cnMsIG5hbWVzcGFjZSkge1xuICBPYmplY3Qua2V5cyhkYXRhQXR0cnMpLmZvckVhY2goZnVuY3Rpb24gKGF0dHJOYW1lKSB7XG4gICAgdmFyIGRhdGFBdHRyID0gZGF0YUF0dHJzW2F0dHJOYW1lXSxcbiAgICAgICAgY2FjaGVkQXR0ciA9IGNhY2hlZEF0dHJzW2F0dHJOYW1lXSxcbiAgICAgICAgZXZNYXRjaDtcblxuICAgIGlmICghKGF0dHJOYW1lIGluIGNhY2hlZEF0dHJzKSB8fCBjYWNoZWRBdHRyICE9PSBkYXRhQXR0cikge1xuICAgICAgY2FjaGVkQXR0cnNbYXR0ck5hbWVdID0gZGF0YUF0dHI7XG4gICAgICB0cnkge1xuICAgICAgICAvL2Bjb25maWdgIGlzbid0IGEgcmVhbCBhdHRyaWJ1dGVzLCBzbyBpZ25vcmUgaXRcbiAgICAgICAgaWYgKGF0dHJOYW1lID09PSAnY29uZmlnJyB8fCBhdHRyTmFtZSA9PSAna2V5JykgcmV0dXJuO1xuICAgICAgICAvL2hvb2sgZXZlbnQgaGFuZGxlcnMgdG8gdGhlIGF1dG8tcmVkcmF3aW5nIHN5c3RlbVxuICAgICAgICBlbHNlIGlmICh0eXBlKGRhdGFBdHRyKSA9PT0gJ2Z1bmN0aW9uJyAmJiBhdHRyTmFtZS5pbmRleE9mKCdvbicpID09PSAwKSB7XG4gICAgICAgICAgZG9tTm9kZVthdHRyTmFtZV0gPSBkYXRhQXR0cjtcbiAgICAgICAgICAvLyBiaW5kIGhhbmRsZXIgdG8gZG9tTm9kZSBmb3IgYSBkZWxlZ2F0aW9uIGV2ZW50XG4gICAgICAgIH0gZWxzZSBpZiAoKGV2TWF0Y2ggPSBtYXRjaFJlZyhhdHRyTmFtZSwgZXZBdHRyUmVnKSkgJiYgZXZNYXRjaFsxXS5sZW5ndGgpIHtcbiAgICAgICAgICB2YXIgZXZUeXBlID0gZXZNYXRjaFsxXS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIGRvbURlbGVnYXRvci5vZmYoZG9tTm9kZSwgZXZUeXBlKTtcbiAgICAgICAgICBpZiAoaXNIYW5kbGVyKGRhdGFBdHRyKSkge1xuICAgICAgICAgICAgZG9tRGVsZWdhdG9yLm9uKGRvbU5vZGUsIGV2VHlwZSwgZGF0YUF0dHIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvL2hhbmRsZSBgc3R5bGU6IHsuLi59YFxuICAgICAgICBlbHNlIGlmIChhdHRyTmFtZSA9PT0gJ3N0eWxlJyAmJiBkYXRhQXR0ciAhPSBudWxsICYmIHR5cGUoZGF0YUF0dHIpID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgIE9iamVjdC5rZXlzKGRhdGFBdHRyKS5mb3JFYWNoKGZ1bmN0aW9uIChydWxlKSB7XG4gICAgICAgICAgICBpZiAoY2FjaGVkQXR0ciA9PSBudWxsIHx8IGNhY2hlZEF0dHJbcnVsZV0gIT09IGRhdGFBdHRyW3J1bGVdKSB7XG4gICAgICAgICAgICAgIGRvbU5vZGUuc3R5bGVbcnVsZV0gPSBkYXRhQXR0cltydWxlXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAodHlwZShjYWNoZWRBdHRyKSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGNhY2hlZEF0dHIpLmZvckVhY2goZnVuY3Rpb24gKHJ1bGUpIHtcbiAgICAgICAgICAgICAgaWYgKCEocnVsZSBpbiBkYXRhQXR0cikpIGRvbU5vZGUuc3R5bGVbcnVsZV0gPSAnJztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvL2hhbmRsZSBTVkdcbiAgICAgICAgZWxzZSBpZiAobmFtZXNwYWNlICE9IG51bGwpIHtcbiAgICAgICAgICBpZiAoYXR0ck5hbWUgPT09ICdocmVmJykgZG9tTm9kZS5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICdocmVmJywgZGF0YUF0dHIpO2Vsc2UgaWYgKGF0dHJOYW1lID09PSAnY2xhc3NOYW1lJykgZG9tTm9kZS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgZGF0YUF0dHIpO2Vsc2UgZG9tTm9kZS5zZXRBdHRyaWJ1dGUoYXR0ck5hbWUsIGRhdGFBdHRyKTtcbiAgICAgICAgfVxuICAgICAgICAvL2hhbmRsZSBjYXNlcyB0aGF0IGFyZSBwcm9wZXJ0aWVzIChidXQgaWdub3JlIGNhc2VzIHdoZXJlIHdlIHNob3VsZCB1c2Ugc2V0QXR0cmlidXRlIGluc3RlYWQpXG4gICAgICAgIC8vLSBsaXN0IGFuZCBmb3JtIGFyZSB0eXBpY2FsbHkgdXNlZCBhcyBzdHJpbmdzLCBidXQgYXJlIERPTSBlbGVtZW50IHJlZmVyZW5jZXMgaW4ganNcbiAgICAgICAgLy8tIHdoZW4gdXNpbmcgQ1NTIHNlbGVjdG9ycyAoZS5nLiBgbShcIltzdHlsZT0nJ11cIilgKSwgc3R5bGUgaXMgdXNlZCBhcyBhIHN0cmluZywgYnV0IGl0J3MgYW4gb2JqZWN0IGluIGpzXG4gICAgICAgIGVsc2UgaWYgKGF0dHJOYW1lIGluIGRvbU5vZGUgJiYgIShhdHRyTmFtZSA9PT0gJ2xpc3QnIHx8IGF0dHJOYW1lID09PSAnc3R5bGUnIHx8IGF0dHJOYW1lID09PSAnZm9ybScgfHwgYXR0ck5hbWUgPT09ICd0eXBlJyB8fCBhdHRyTmFtZSA9PT0gJ3dpZHRoJyB8fCBhdHRyTmFtZSA9PT0gJ2hlaWdodCcpKSB7XG4gICAgICAgICAgLy8jMzQ4IGRvbid0IHNldCB0aGUgdmFsdWUgaWYgbm90IG5lZWRlZCBvdGhlcndpc2UgY3Vyc29yIHBsYWNlbWVudCBicmVha3MgaW4gQ2hyb21lXG4gICAgICAgICAgaWYgKHRhZyAhPT0gJ2lucHV0JyB8fCBkb21Ob2RlW2F0dHJOYW1lXSAhPT0gZGF0YUF0dHIpIGRvbU5vZGVbYXR0ck5hbWVdID0gZGF0YUF0dHI7XG4gICAgICAgIH0gZWxzZSBkb21Ob2RlLnNldEF0dHJpYnV0ZShhdHRyTmFtZSwgZGF0YUF0dHIpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvL3N3YWxsb3cgSUUncyBpbnZhbGlkIGFyZ3VtZW50IGVycm9ycyB0byBtaW1pYyBIVE1MJ3MgZmFsbGJhY2stdG8tZG9pbmctbm90aGluZy1vbi1pbnZhbGlkLWF0dHJpYnV0ZXMgYmVoYXZpb3JcbiAgICAgICAgaWYgKGUubWVzc2FnZS5pbmRleE9mKCdJbnZhbGlkIGFyZ3VtZW50JykgPCAwKSB0aHJvdyBlO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyMzNDggZGF0YUF0dHIgbWF5IG5vdCBiZSBhIHN0cmluZywgc28gdXNlIGxvb3NlIGNvbXBhcmlzb24gKGRvdWJsZSBlcXVhbCkgaW5zdGVhZCBvZiBzdHJpY3QgKHRyaXBsZSBlcXVhbClcbiAgICBlbHNlIGlmIChhdHRyTmFtZSA9PT0gJ3ZhbHVlJyAmJiB0YWcgPT09ICdpbnB1dCcgJiYgZG9tTm9kZS52YWx1ZSAhPSBkYXRhQXR0cikge1xuICAgICAgZG9tTm9kZS52YWx1ZSA9IGRhdGFBdHRyO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBjYWNoZWRBdHRycztcbn1cblxuZnVuY3Rpb24gaXNIYW5kbGVyKGhhbmRsZXIpIHtcbiAgcmV0dXJuIHR5cGUoaGFuZGxlcikgPT09ICdmdW5jdGlvbicgfHwgaGFuZGxlciAmJiB0eXBlKGhhbmRsZXIuaGFuZGxlRXZlbnQpID09PSAnZnVuY3Rpb24nO1xufSIsIlxuZXhwb3J0IGRlZmF1bHQgYnVpbGQ7XG5pbXBvcnQgeyB0eXBlLCBOT09QLCBzbGljZSB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCBjbGVhciBmcm9tICcuL2NsZWFyJztcbmltcG9ydCB7IGRvY3VtZW50IGFzICRkb2N1bWVudCwgRyB9IGZyb20gJy4uL2dsb2JhbHMnO1xuaW1wb3J0IHNldEF0dHJpYnV0ZXMgZnJvbSAnLi9zZXRBdHRyaWJ1dGVzJztcbi8vYGJ1aWxkYCBpcyBhIHJlY3Vyc2l2ZSBmdW5jdGlvbiB0aGF0IG1hbmFnZXMgY3JlYXRpb24vZGlmZmluZy9yZW1vdmFsIG9mIERPTSBlbGVtZW50cyBiYXNlZCBvbiBjb21wYXJpc29uIGJldHdlZW4gYGRhdGFgIGFuZCBgY2FjaGVkYFxuLy90aGUgZGlmZiBhbGdvcml0aG0gY2FuIGJlIHN1bW1hcml6ZWQgYXMgdGhpczpcbi8vMSAtIGNvbXBhcmUgYGRhdGFgIGFuZCBgY2FjaGVkYFxuLy8yIC0gaWYgdGhleSBhcmUgZGlmZmVyZW50LCBjb3B5IGBkYXRhYCB0byBgY2FjaGVkYCBhbmQgdXBkYXRlIHRoZSBET00gYmFzZWQgb24gd2hhdCB0aGUgZGlmZmVyZW5jZSBpc1xuLy8zIC0gcmVjdXJzaXZlbHkgYXBwbHkgdGhpcyBhbGdvcml0aG0gZm9yIGV2ZXJ5IGFycmF5IGFuZCBmb3IgdGhlIGNoaWxkcmVuIG9mIGV2ZXJ5IHZpcnR1YWwgZWxlbWVudFxuLy90aGUgYGNhY2hlZGAgZGF0YSBzdHJ1Y3R1cmUgaXMgZXNzZW50aWFsbHkgdGhlIHNhbWUgYXMgdGhlIHByZXZpb3VzIHJlZHJhdydzIGBkYXRhYCBkYXRhIHN0cnVjdHVyZSwgd2l0aCBhIGZldyBhZGRpdGlvbnM6XG4vLy0gYGNhY2hlZGAgYWx3YXlzIGhhcyBhIHByb3BlcnR5IGNhbGxlZCBgbm9kZXNgLCB3aGljaCBpcyBhIGxpc3Qgb2YgRE9NIGVsZW1lbnRzIHRoYXQgY29ycmVzcG9uZCB0byB0aGUgZGF0YSByZXByZXNlbnRlZCBieSB0aGUgcmVzcGVjdGl2ZSB2aXJ0dWFsIGVsZW1lbnRcbi8vLSBpbiBvcmRlciB0byBzdXBwb3J0IGF0dGFjaGluZyBgbm9kZXNgIGFzIGEgcHJvcGVydHkgb2YgYGNhY2hlZGAsIGBjYWNoZWRgIGlzICphbHdheXMqIGEgbm9uLXByaW1pdGl2ZSBvYmplY3QsIGkuZS4gaWYgdGhlIGRhdGEgd2FzIGEgc3RyaW5nLCB0aGVuIGNhY2hlZCBpcyBhIFN0cmluZyBpbnN0YW5jZS4gSWYgZGF0YSB3YXMgYG51bGxgIG9yIGB1bmRlZmluZWRgLCBjYWNoZWQgaXMgYG5ldyBTdHJpbmcoXCJcIilgXG4vLy0gYGNhY2hlZCBhbHNvIGhhcyBhIGBjb25maWdDb250ZXh0YCBwcm9wZXJ0eSwgd2hpY2ggaXMgdGhlIHN0YXRlIHN0b3JhZ2Ugb2JqZWN0IGV4cG9zZWQgYnkgY29uZmlnKGVsZW1lbnQsIGlzSW5pdGlhbGl6ZWQsIGNvbnRleHQpXG4vLy0gd2hlbiBgY2FjaGVkYCBpcyBhbiBPYmplY3QsIGl0IHJlcHJlc2VudHMgYSB2aXJ0dWFsIGVsZW1lbnQ7IHdoZW4gaXQncyBhbiBBcnJheSwgaXQgcmVwcmVzZW50cyBhIGxpc3Qgb2YgZWxlbWVudHM7IHdoZW4gaXQncyBhIFN0cmluZywgTnVtYmVyIG9yIEJvb2xlYW4sIGl0IHJlcHJlc2VudHMgYSB0ZXh0IG5vZGVcbi8vYHBhcmVudEVsZW1lbnRgIGlzIGEgRE9NIGVsZW1lbnQgdXNlZCBmb3IgVzNDIERPTSBBUEkgY2FsbHNcbi8vYHBhcmVudFRhZ2AgaXMgb25seSB1c2VkIGZvciBoYW5kbGluZyBhIGNvcm5lciBjYXNlIGZvciB0ZXh0YXJlYSB2YWx1ZXNcbi8vYHBhcmVudENhY2hlYCBpcyB1c2VkIHRvIHJlbW92ZSBub2RlcyBpbiBzb21lIG11bHRpLW5vZGUgY2FzZXNcbi8vYHBhcmVudEluZGV4YCBhbmQgYGluZGV4YCBhcmUgdXNlZCB0byBmaWd1cmUgb3V0IHRoZSBvZmZzZXQgb2Ygbm9kZXMuIFRoZXkncmUgYXJ0aWZhY3RzIGZyb20gYmVmb3JlIGFycmF5cyBzdGFydGVkIGJlaW5nIGZsYXR0ZW5lZCBhbmQgYXJlIGxpa2VseSByZWZhY3RvcmFibGVcbi8vYGRhdGFgIGFuZCBgY2FjaGVkYCBhcmUsIHJlc3BlY3RpdmVseSwgdGhlIG5ldyBhbmQgb2xkIG5vZGVzIGJlaW5nIGRpZmZlZFxuLy9gc2hvdWxkUmVhdHRhY2hgIGlzIGEgZmxhZyBpbmRpY2F0aW5nIHdoZXRoZXIgYSBwYXJlbnQgbm9kZSB3YXMgcmVjcmVhdGVkIChpZiBzbywgYW5kIGlmIHRoaXMgbm9kZSBpcyByZXVzZWQsIHRoZW4gdGhpcyBub2RlIG11c3QgcmVhdHRhY2ggaXRzZWxmIHRvIHRoZSBuZXcgcGFyZW50KVxuLy9gZWRpdGFibGVgIGlzIGEgZmxhZyB0aGF0IGluZGljYXRlcyB3aGV0aGVyIGFuIGFuY2VzdG9yIGlzIGNvbnRlbnRlZGl0YWJsZVxuLy9gbmFtZXNwYWNlYCBpbmRpY2F0ZXMgdGhlIGNsb3Nlc3QgSFRNTCBuYW1lc3BhY2UgYXMgaXQgY2FzY2FkZXMgZG93biBmcm9tIGFuIGFuY2VzdG9yXG4vL2Bjb25maWdzYCBpcyBhIGxpc3Qgb2YgY29uZmlnIGZ1bmN0aW9ucyB0byBydW4gYWZ0ZXIgdGhlIHRvcG1vc3QgYGJ1aWxkYCBjYWxsIGZpbmlzaGVzIHJ1bm5pbmdcbi8vdGhlcmUncyBsb2dpYyB0aGF0IHJlbGllcyBvbiB0aGUgYXNzdW1wdGlvbiB0aGF0IG51bGwgYW5kIHVuZGVmaW5lZCBkYXRhIGFyZSBlcXVpdmFsZW50IHRvIGVtcHR5IHN0cmluZ3Ncbi8vLSB0aGlzIHByZXZlbnRzIGxpZmVjeWNsZSBzdXJwcmlzZXMgZnJvbSBwcm9jZWR1cmFsIGhlbHBlcnMgdGhhdCBtaXggaW1wbGljaXQgYW5kIGV4cGxpY2l0IHJldHVybiBzdGF0ZW1lbnRzIChlLmcuIGZ1bmN0aW9uIGZvbygpIHtpZiAoY29uZCkgcmV0dXJuIG0oXCJkaXZcIil9XG4vLy0gaXQgc2ltcGxpZmllcyBkaWZmaW5nIGNvZGVcbi8vZGF0YS50b1N0cmluZygpIG1pZ2h0IHRocm93IG9yIHJldHVybiBudWxsIGlmIGRhdGEgaXMgdGhlIHJldHVybiB2YWx1ZSBvZiBDb25zb2xlLmxvZyBpbiBGaXJlZm94IChiZWhhdmlvciBkZXBlbmRzIG9uIHZlcnNpb24pXG52YXIgVk9JRF9FTEVNRU5UUyA9IC9eKEFSRUF8QkFTRXxCUnxDT0x8Q09NTUFORHxFTUJFRHxIUnxJTUd8SU5QVVR8S0VZR0VOfExJTkt8TUVUQXxQQVJBTXxTT1VSQ0V8VFJBQ0t8V0JSKSQvO1xuZnVuY3Rpb24gYnVpbGQocGFyZW50RWxlbWVudCwgcGFyZW50VGFnLCBwYXJlbnRDYWNoZSwgcGFyZW50SW5kZXgsIGRhdGEsIGNhY2hlZCwgc2hvdWxkUmVhdHRhY2gsIGluZGV4LCBlZGl0YWJsZSwgbmFtZXNwYWNlLCBjb25maWdzKSB7XG4gIC8vZGF0YS50b1N0cmluZygpIG1pZ2h0IHRocm93IG9yIHJldHVybiBudWxsIGlmIGRhdGEgaXMgdGhlIHJldHVybiB2YWx1ZSBvZiBDb25zb2xlLmxvZyBpbiBmaXJlZm94IChiZWhhdmlvciBkZXBlbmRzIG9uIHZlcnNpb24pXG4gIHRyeSB7XG4gICAgaWYgKGRhdGEgPT0gbnVsbCB8fCBkYXRhLnRvU3RyaW5nKCkgPT0gbnVsbCkge1xuICAgICAgZGF0YSA9ICcnO1xuICAgIH1cbiAgfSBjYXRjaCAoXykge1xuICAgIGRhdGEgPSAnJztcbiAgfVxuICBpZiAoZGF0YS5zdWJ0cmVlID09PSAncmV0YWluJykgcmV0dXJuIGNhY2hlZDtcbiAgdmFyIGNhY2hlZFR5cGUgPSB0eXBlKGNhY2hlZCksXG4gICAgICBkYXRhVHlwZSA9IHR5cGUoZGF0YSksXG4gICAgICBpbnRhY3Q7XG4gIGlmIChjYWNoZWQgPT0gbnVsbCB8fCBjYWNoZWRUeXBlICE9PSBkYXRhVHlwZSkge1xuICAgIC8vIHZhbGlkYXRlIGNhY2hlZFxuICAgIGNhY2hlZCA9IHZhbGlkYXRlQ2FjaGVkKGRhdGEsIGNhY2hlZCwgaW5kZXgsIHBhcmVudEluZGV4LCBwYXJlbnRDYWNoZSwgZGF0YVR5cGUpO1xuICB9XG4gIGlmIChkYXRhVHlwZSA9PT0gJ2FycmF5Jykge1xuICAgIC8vIGNoaWxkcmVuIGRpZmZcbiAgICBkYXRhID0gX3JlY3Vyc2l2ZUZsYXR0ZW4oZGF0YSk7XG4gICAgaW50YWN0ID0gY2FjaGVkLmxlbmd0aCA9PT0gZGF0YS5sZW5ndGg7XG4gICAgY2FjaGVkID0gZGlmZkNoaWxkcmVuV2l0aEtleShkYXRhLCBjYWNoZWQsIHBhcmVudEVsZW1lbnQpO1xuICAgIGNhY2hlZCA9IGRpZmZBcnJheUl0ZW0oZGF0YSwgY2FjaGVkLCBwYXJlbnRFbGVtZW50LCBwYXJlbnRUYWcsIGluZGV4LCBzaG91bGRSZWF0dGFjaCwgaW50YWN0LCBlZGl0YWJsZSwgbmFtZXNwYWNlLCBjb25maWdzKTtcbiAgfSBlbHNlIGlmIChkYXRhICE9IG51bGwgJiYgZGF0YVR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgLy8gYXR0cmlidXRlcyBkaWZmXG4gICAgY2FjaGVkID0gZGlmZlZOb2RlKGRhdGEsIGNhY2hlZCwgcGFyZW50RWxlbWVudCwgaW5kZXgsIHNob3VsZFJlYXR0YWNoLCBlZGl0YWJsZSwgbmFtZXNwYWNlLCBjb25maWdzKTtcbiAgfSBlbHNlIGlmICh0eXBlKGRhdGEpICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgLy9oYW5kbGUgdGV4dCBub2Rlc1xuICAgIGNhY2hlZCA9IGRpZmZUZXh0Tm9kZShkYXRhLCBjYWNoZWQsIHBhcmVudEVsZW1lbnQsIHBhcmVudFRhZywgaW5kZXgsIHNob3VsZFJlYXR0YWNoLCBlZGl0YWJsZSk7XG4gIH1cbiAgcmV0dXJuIGNhY2hlZDtcbn1cblxuLy9kaWZmIGZ1bmN0aW9uc1xuZnVuY3Rpb24gdmFsaWRhdGVDYWNoZWQoZGF0YSwgY2FjaGVkLCBpbmRleCwgcGFyZW50SW5kZXgsIHBhcmVudENhY2hlLCBkYXRhVHlwZSkge1xuICB2YXIgb2Zmc2V0LCBlbmQ7XG4gIGlmIChjYWNoZWQgIT0gbnVsbCkge1xuICAgIGlmIChwYXJlbnRDYWNoZSAmJiBwYXJlbnRDYWNoZS5ub2Rlcykge1xuICAgICAgb2Zmc2V0ID0gaW5kZXggLSBwYXJlbnRJbmRleDtcbiAgICAgIGVuZCA9IG9mZnNldCArIChkYXRhVHlwZSA9PT0gJ2FycmF5JyA/IGRhdGEgOiBjYWNoZWQubm9kZXMpLmxlbmd0aDtcbiAgICAgIGNsZWFyKHBhcmVudENhY2hlLm5vZGVzLnNsaWNlKG9mZnNldCwgZW5kKSwgcGFyZW50Q2FjaGUuc2xpY2Uob2Zmc2V0LCBlbmQpKTtcbiAgICB9IGVsc2UgaWYgKGNhY2hlZC5ub2Rlcykge1xuICAgICAgY2xlYXIoY2FjaGVkLm5vZGVzLCBjYWNoZWQpO1xuICAgIH1cbiAgfVxuICBjYWNoZWQgPSBuZXcgZGF0YS5jb25zdHJ1Y3RvcigpO1xuICBpZiAoY2FjaGVkLnRhZykgY2FjaGVkID0ge307XG4gIGNhY2hlZC5ub2RlcyA9IFtdO1xuICByZXR1cm4gY2FjaGVkO1xufVxuXG5mdW5jdGlvbiBkaWZmQ2hpbGRyZW5XaXRoS2V5KGRhdGEsIGNhY2hlZCwgcGFyZW50RWxlbWVudCkge1xuICAvL2tleXMgYWxnb3JpdGhtOiBzb3J0IGVsZW1lbnRzIHdpdGhvdXQgcmVjcmVhdGluZyB0aGVtIGlmIGtleXMgYXJlIHByZXNlbnRcbiAgLy8xKSBjcmVhdGUgYSBtYXAgb2YgYWxsIGV4aXN0aW5nIGtleXMsIGFuZCBtYXJrIGFsbCBmb3IgZGVsZXRpb25cbiAgLy8yKSBhZGQgbmV3IGtleXMgdG8gbWFwIGFuZCBtYXJrIHRoZW0gZm9yIGFkZGl0aW9uXG4gIC8vMykgaWYga2V5IGV4aXN0cyBpbiBuZXcgbGlzdCwgY2hhbmdlIGFjdGlvbiBmcm9tIGRlbGV0aW9uIHRvIGEgbW92ZVxuICAvLzQpIGZvciBlYWNoIGtleSwgaGFuZGxlIGl0cyBjb3JyZXNwb25kaW5nIGFjdGlvbiBhcyBtYXJrZWQgaW4gcHJldmlvdXMgc3RlcHNcbiAgdmFyIERFTEVUSU9OID0gMSxcbiAgICAgIElOU0VSVElPTiA9IDIsXG4gICAgICBNT1ZFID0gMztcbiAgdmFyIGV4aXN0aW5nID0ge30sXG4gICAgICBzaG91bGRNYWludGFpbklkZW50aXRpZXMgPSBmYWxzZTtcbiAgLy8gMSlcbiAgY2FjaGVkLmZvckVhY2goZnVuY3Rpb24gKGNhY2hlZE5vZGUsIGlkeCkge1xuICAgIHZhciBrZXkgPSBfa2V5KGNhY2hlZE5vZGUpO1xuICAgIC8vbm9ybWFybGl6ZSBrZXlcbiAgICBfbm9ybWFsaXplS2V5KGNhY2hlZE5vZGUsIGtleSk7XG5cbiAgICBpZiAoa2V5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHNob3VsZE1haW50YWluSWRlbnRpdGllcyA9IHRydWU7XG4gICAgICBleGlzdGluZ1trZXldID0ge1xuICAgICAgICBhY3Rpb246IERFTEVUSU9OLFxuICAgICAgICBpbmRleDogaWR4XG4gICAgICB9O1xuICAgIH1cbiAgfSk7XG4gIC8vIGFkZCBrZXlzIHRvIGFsbCBpdGVtcyBpZiBhdCBsZWFzdCBvbmUgb2YgaXRlbXMgaGFzIGEga2V5IGF0dHJpYnV0ZVxuICB2YXIgZ3VpZCA9IDA7XG4gIGlmIChkYXRhLnNvbWUoZnVuY3Rpb24gKGRhdGFOb2RlKSB7XG4gICAgdmFyIGtleSA9IF9rZXkoZGF0YU5vZGUpO1xuICAgIC8vbm9ybWFybGl6ZSBrZXlcbiAgICBfbm9ybWFsaXplS2V5KGRhdGFOb2RlLCBrZXkpO1xuICAgIHJldHVybiBrZXkgIT09IHVuZGVmaW5lZDtcbiAgfSkpIHtcbiAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKGRhdGFOb2RlKSB7XG4gICAgICBpZiAoZGF0YU5vZGUgJiYgZGF0YU5vZGUuYXR0cnMgJiYgZGF0YU5vZGUuYXR0cnMua2V5ID09IG51bGwpIHtcbiAgICAgICAgZGF0YU5vZGUuYXR0cnMua2V5ID0gJ19fbWl0aHJpbF9fJyArIGd1aWQrKztcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICBpZiAoc2hvdWxkTWFpbnRhaW5JZGVudGl0aWVzICYmIF9pc0tleXNEaWZmZXIoZGF0YSwgY2FjaGVkKSkge1xuICAgIC8vIDIpLCAzKVxuICAgIGRhdGEuZm9yRWFjaChfZGF0YU5vZGVUb0V4aXN0aW5nKTtcbiAgICAvLyA0KVxuICAgIHZhciBjaGFuZ2VzID0gdW5kZWZpbmVkLFxuICAgICAgICBfbmV3Q2FjaGVkID0gbmV3IEFycmF5KGNhY2hlZC5sZW5ndGgpO1xuICAgIGNoYW5nZXMgPSBPYmplY3Qua2V5cyhleGlzdGluZykubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJldHVybiBleGlzdGluZ1trZXldO1xuICAgIH0pLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgIHJldHVybiBhLmFjdGlvbiAtIGIuYWN0aW9uIHx8IGEuaW5kZXggLSBiLmluZGV4O1xuICAgIH0pO1xuICAgIF9uZXdDYWNoZWQubm9kZXMgPSBjYWNoZWQubm9kZXMuc2xpY2UoKTtcblxuICAgIGNoYW5nZXMuZm9yRWFjaChfYXBwbHlDaGFuZ2VzKTtcbiAgICBjYWNoZWQgPSBfbmV3Q2FjaGVkO1xuICB9XG4gIHJldHVybiBjYWNoZWQ7XG4gIC8vaGVscGVyc1xuICBmdW5jdGlvbiBfaXNLZXkoa2V5KSB7XG4gICAgcmV0dXJuIHR5cGUoa2V5KSA9PT0gJ3N0cmluZycgfHwgdHlwZShrZXkpID09PSAnbnVtYmVyJyAmJiB0eXBlKGtleSkgIT09ICdOYU4nO1xuICB9XG5cbiAgZnVuY3Rpb24gX2tleShub2RlSXRlbSkge1xuICAgIHJldHVybiBub2RlSXRlbSAmJiBub2RlSXRlbS5hdHRycyAmJiBfaXNLZXkobm9kZUl0ZW0uYXR0cnMua2V5KSA/IG5vZGVJdGVtLmF0dHJzLmtleSA6IHVuZGVmaW5lZDtcbiAgfVxuICBmdW5jdGlvbiBfbm9ybWFsaXplS2V5KG5vZGUsIGtleSkge1xuICAgIGlmICghbm9kZSB8fCAhbm9kZS5hdHRycykgcmV0dXJuO1xuICAgIGlmIChrZXkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZGVsZXRlIG5vZGUuYXR0cnMua2V5O1xuICAgIH0gZWxzZSB7XG4gICAgICBub2RlLmF0dHJzLmtleSA9IGtleTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBfaXNLZXlzRGlmZmVyKGRhdGEsIGNhY2hlZCkge1xuICAgIGlmIChkYXRhLmxlbmd0aCAhPT0gY2FjaGVkLmxlbmd0aCkgcmV0dXJuIHRydWU7XG4gICAgcmV0dXJuIGRhdGEuc29tZShmdW5jdGlvbiAoZGF0YU5vZGUsIGlkeCkge1xuICAgICAgdmFyIGNhY2hlZE5vZGUgPSBjYWNoZWRbaWR4XTtcbiAgICAgIHJldHVybiBjYWNoZWROb2RlLmF0dHJzICYmIGRhdGFOb2RlLmF0dHJzICYmIGNhY2hlZE5vZGUuYXR0cnMua2V5ICE9PSBkYXRhTm9kZS5hdHRycy5rZXk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBfZGF0YU5vZGVUb0V4aXN0aW5nKGRhdGFOb2RlLCBub2RlSWR4KSB7XG4gICAgdmFyIGtleSA9IF9rZXkoZGF0YU5vZGUpO1xuICAgIGlmIChrZXkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKCFleGlzdGluZ1trZXldKSB7XG4gICAgICAgIGV4aXN0aW5nW2tleV0gPSB7XG4gICAgICAgICAgYWN0aW9uOiBJTlNFUlRJT04sXG4gICAgICAgICAgaW5kZXg6IG5vZGVJZHhcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBmcm9tSWR4ID0gZXhpc3Rpbmdba2V5XS5pbmRleDtcbiAgICAgICAgZXhpc3Rpbmdba2V5XSA9IHtcbiAgICAgICAgICBhY3Rpb246IE1PVkUsXG4gICAgICAgICAgaW5kZXg6IG5vZGVJZHgsXG4gICAgICAgICAgZnJvbTogZnJvbUlkeCxcbiAgICAgICAgICBlbGVtZW50OiBjYWNoZWQubm9kZXNbZnJvbUlkeF0gfHwgJGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gX2FwcGx5Q2hhbmdlcyhjaGFuZ2UpIHtcbiAgICB2YXIgY2hhbmdlSWR4ID0gY2hhbmdlLmluZGV4LFxuICAgICAgICBhY3Rpb24gPSBhY3Rpb247XG4gICAgaWYgKGFjdGlvbiA9PT0gREVMRVRJT04pIHtcbiAgICAgIGNsZWFyKGNhY2hlZFtjaGFuZ2VJZHhdLm5vZGVzLCBjYWNoZWRbY2hhbmdlSWR4XSk7XG4gICAgICBuZXdDYWNoZWQuc3BsaWNlKGNoYW5nZUlkeCwgMSk7XG4gICAgfVxuICAgIGlmIChhY3Rpb24gPT09IElOU0VSVElPTikge1xuICAgICAgdmFyIGR1bW15ID0gJGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgZHVtbXkua2V5ID0gZGF0YVtjaGFuZ2VJZHhdLmF0dHJzLmtleTtcbiAgICAgIHBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKGR1bW15LCBwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbY2hhbmdlSWR4XSB8fCBudWxsKTtcbiAgICAgIG5ld0NhY2hlZC5zcGxpY2UoY2hhbmdlSWR4LCAwLCB7XG4gICAgICAgIGF0dHJzOiB7IGtleTogZHVtbXkua2V5IH0sIG5vZGVzOiBbZHVtbXldXG4gICAgICB9KTtcbiAgICAgIG5ld0NhY2hlZC5ub2Rlc1tjaGFuZ2VJZHhdID0gZHVtbXk7XG4gICAgfVxuXG4gICAgaWYgKGFjdGlvbiA9PT0gTU9WRSkge1xuICAgICAgaWYgKHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tjaGFuZ2VJZHhdICE9PSBjaGFuZ2UuZWxlbWVudCAmJiBjaGFuZ2UuZWxlbWVudCAhPT0gbnVsbCkge1xuICAgICAgICBwYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZShjaGFuZ2UuZWxlbWVudCwgcGFyZW50RWxlbWVudC5jaGlsZE5vZGVzW2NoYW5nZUlkeF0gfHwgbnVsbCk7XG4gICAgICB9XG4gICAgICBuZXdDYWNoZWRbY2hhbmdlSWR4XSA9IGNhY2hlZFtjaGFuZ2UuZnJvbV07XG4gICAgICBtZXdDYWNoZWQubm9kZXNbY2hhbmdlSWR4XSA9IGNoYW5nZS5lbGVtZW50O1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBkaWZmQXJyYXlJdGVtKGRhdGEsIGNhY2hlZCwgcGFyZW50RWxlbWVudCwgcGFyZW50VGFnLCBpbmRleCwgc2hvdWxkUmVhdHRhY2gsIGludGFjdCwgZWRpdGFibGUsIG5hbWVzcGFjZSwgY29uZmlncykge1xuICB2YXIgc3ViQXJyYXlDb3VudCA9IDAsXG4gICAgICBjYWNoZUNvdW50ID0gMCxcbiAgICAgIG5vZGVzID0gW107XG4gIGRhdGEuZm9yRWFjaChfZGlmZkJ1aWxkSXRlbSk7XG4gIGlmICghaW50YWN0KSB7XG4gICAgLy9kaWZmIHRoZSBhcnJheSBpdHNlbGZcblxuICAgIC8vdXBkYXRlIHRoZSBsaXN0IG9mIERPTSBub2RlcyBieSBjb2xsZWN0aW5nIHRoZSBub2RlcyBmcm9tIGVhY2ggaXRlbVxuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBkYXRhLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBpZiAoY2FjaGVkW2ldICE9IG51bGwpIG5vZGVzLnB1c2guYXBwbHkobm9kZXMsIGNhY2hlZFtpXS5ub2Rlcyk7XG4gICAgfVxuICAgIC8vcmVtb3ZlIGl0ZW1zIGZyb20gdGhlIGVuZCBvZiB0aGUgYXJyYXkgaWYgdGhlIG5ldyBhcnJheSBpcyBzaG9ydGVyIHRoYW4gdGhlIG9sZCBvbmVcbiAgICAvL2lmIGVycm9ycyBldmVyIGhhcHBlbiBoZXJlLCB0aGUgaXNzdWUgaXMgbW9zdCBsaWtlbHkgYSBidWcgaW4gdGhlIGNvbnN0cnVjdGlvbiBvZiB0aGUgYGNhY2hlZGAgZGF0YSBzdHJ1Y3R1cmUgc29tZXdoZXJlIGVhcmxpZXIgaW4gdGhlIHByb2dyYW1cbiAgICBmb3IgKHZhciBpID0gMCwgbm9kZSA9IHVuZGVmaW5lZDsgbm9kZSA9IGNhY2hlZC5ub2Rlc1tpXTsgaSsrKSB7XG4gICAgICBpZiAobm9kZS5wYXJlbnROb2RlICE9IG51bGwgJiYgbm9kZXMuaW5kZXhPZihub2RlKSA8IDApIGNsZWFyKFtub2RlXSwgW2NhY2hlZFtpXV0pO1xuICAgIH1cbiAgICBpZiAoZGF0YS5sZW5ndGggPCBjYWNoZWQubGVuZ3RoKSBjYWNoZWQubGVuZ3RoID0gZGF0YS5sZW5ndGg7XG4gICAgY2FjaGVkLm5vZGVzID0gbm9kZXM7XG4gIH1cbiAgcmV0dXJuIGNhY2hlZDtcbiAgLy9oZWxwZXJzXG4gIGZ1bmN0aW9uIF9kaWZmQnVpbGRJdGVtKGRhdGFOb2RlKSB7XG4gICAgdmFyIGl0ZW0gPSBidWlsZChwYXJlbnRFbGVtZW50LCBwYXJlbnRUYWcsIGNhY2hlZCwgaW5kZXgsIGRhdGFOb2RlLCBjYWNoZWRbY2FjaGVDb3VudF0sIHNob3VsZFJlYXR0YWNoLCBpbmRleCArIHN1YkFycmF5Q291bnQgfHwgc3ViQXJyYXlDb3VudCwgZWRpdGFibGUsIG5hbWVzcGFjZSwgY29uZmlncyk7XG4gICAgaWYgKGl0ZW0gPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuICAgIGlmICghaXRlbS5ub2Rlcy5pbnRhY3QpIGludGFjdCA9IGZhbHNlO1xuICAgIGlmIChpdGVtLiR0cnVzdGVkKSB7XG4gICAgICAvL2ZpeCBvZmZzZXQgb2YgbmV4dCBlbGVtZW50IGlmIGl0ZW0gd2FzIGEgdHJ1c3RlZCBzdHJpbmcgdy8gbW9yZSB0aGFuIG9uZSBodG1sIGVsZW1lbnRcbiAgICAgIC8vdGhlIGZpcnN0IGNsYXVzZSBpbiB0aGUgcmVnZXhwIG1hdGNoZXMgZWxlbWVudHNcbiAgICAgIC8vdGhlIHNlY29uZCBjbGF1c2UgKGFmdGVyIHRoZSBwaXBlKSBtYXRjaGVzIHRleHQgbm9kZXNcbiAgICAgIHN1YkFycmF5Q291bnQgKz0gKGl0ZW0ubWF0Y2goLzxbXlxcL118XFw+XFxzKltePF0vZykgfHwgWzBdKS5sZW5ndGg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN1YkFycmF5Q291bnQgKz0gdHlwZShpdGVtKSA9PT0gJ2FycmF5JyA/IGl0ZW0ubGVuZ3RoIDogMTtcbiAgICB9XG4gICAgY2FjaGVkW2NhY2hlQ291bnQrK10gPSBpdGVtO1xuICB9XG59XG5cbmZ1bmN0aW9uIGRpZmZWTm9kZShkYXRhLCBjYWNoZWQsIHBhcmVudEVsZW1lbnQsIGluZGV4LCBzaG91bGRSZWF0dGFjaCwgZWRpdGFibGUsIG5hbWVzcGFjZSwgY29uZmlncykge1xuICB2YXIgdmlld3MgPSBbXSxcbiAgICAgIGNvbnRyb2xsZXJzID0gW10sXG4gICAgICBjb21wb25lbnROYW1lO1xuICAvL3JlY29yZCB0aGUgZmluYWwgY29tcG9uZW50IG5hbWVcbiAgLy9oYW5kbGUgdGhlIHNpdHVhdGlvbiB0aGF0IHZOb2RlIGlzIGEgY29tcG9uZW50KHt2aWV3LCBjb250cm9sbGVyfSk7XG5cbiAgd2hpbGUgKGRhdGEudmlldykge1xuICAgIHZhciB2aWV3ID0gZGF0YS52aWV3LiRvcmlnaW5hbCB8fCBkYXRhLnZpZXc7XG4gICAgdmFyIGNvbnRyb2xsZXJJbmRleCA9IGNhY2hlZC52aWV3cyA/IGNhY2hlZC52aWV3cy5pbmRleE9mKHZpZXcpIDogLTE7XG4gICAgdmFyIGNvbnRyb2xsZXIgPSBjb250cm9sbGVySW5kZXggPiAtMSA/IGNhY2hlZC5jb250cm9sbGVyc1tjb250cm9sbGVySW5kZXhdIDogbmV3IChkYXRhLmNvbnRyb2xsZXIgfHwgTk9PUCkoKTtcbiAgICBjb21wb25lbnROYW1lID0gY29udHJvbGxlci5uYW1lO1xuICAgIHZhciBrZXkgPSBkYXRhICYmIGRhdGEuYXR0cnMgJiYgZGF0YS5hdHRycy5rZXk7XG4gICAgZGF0YSA9IEcucGVuZGluZ1JlcXVlc3RzID09IDAgfHwgRy5mb3JjaW5nIHx8IGNhY2hlZCAmJiBjYWNoZWQuY29udHJvbGxlcnMgJiYgY2FjaGVkLmNvbnRyb2xsZXJzLmluZGV4T2YoY29udHJvbGxlcikgPiAtMSA/IGRhdGEudmlldyhjb250cm9sbGVyKSA6IHsgdGFnOiAncGxhY2Vob2xkZXInIH07XG4gICAgaWYgKGRhdGEuc3VidHJlZSA9PT0gJ3JldGFpbicpIHJldHVybiBjYWNoZWQ7XG4gICAgaWYgKGtleSAhPSBudWxsKSB7XG4gICAgICBpZiAoIWRhdGEuYXR0cnMpIGRhdGEuYXR0cnMgPSB7fTtcbiAgICAgIGRhdGEuYXR0cnMua2V5ID0ga2V5O1xuICAgIH1cbiAgICBpZiAoY29udHJvbGxlci5vbnVubG9hZCkgRy51bmxvYWRlcnMucHVzaCh7IGNvbnRyb2xsZXI6IGNvbnRyb2xsZXIsIGhhbmRsZXI6IGNvbnRyb2xsZXIub251bmxvYWQgfSk7XG4gICAgdmlld3MucHVzaCh2aWV3KTtcbiAgICBjb250cm9sbGVycy5wdXNoKGNvbnRyb2xsZXIpO1xuICB9XG5cbiAgLy90aGUgcmVzdWx0IG9mIHZpZXcgZnVuY3Rpb24gbXVzdCBiZSBhIHNpZ2xlIHJvb3Qgdk5vZGUsXG4gIC8vbm90IGEgYXJyYXkgb3Igc3RyaW5nXG4gIGlmICghZGF0YS50YWcgJiYgY29udHJvbGxlcnMubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoJ0NvbXBvbmVudCB0ZW1wbGF0ZSBtdXN0IHJldHVybiBhIHZpcnR1YWwgZWxlbWVudCwgbm90IGFuIGFycmF5LCBzdHJpbmcsIGV0Yy4nKTtcbiAgaWYgKCFkYXRhLmF0dHJzKSBkYXRhLmF0dHJzID0ge307XG4gIGlmICghY2FjaGVkLmF0dHJzKSBjYWNoZWQuYXR0cnMgPSB7fTtcbiAgLy9pZiBhbiBlbGVtZW50IGlzIGRpZmZlcmVudCBlbm91Z2ggZnJvbSB0aGUgb25lIGluIGNhY2hlLCByZWNyZWF0ZSBpdFxuICBpZiAoZGF0YS50YWcgIT0gY2FjaGVkLnRhZyB8fCAhX2hhc1NhbWVLZXlzKGRhdGEuYXR0cnMsIGNhY2hlZC5hdHRycykgfHwgZGF0YS5hdHRycy5pZCAhPSBjYWNoZWQuYXR0cnMuaWQgfHwgZGF0YS5hdHRycy5rZXkgIT0gY2FjaGVkLmF0dHJzLmtleSB8fCB0eXBlKGNvbXBvbmVudE5hbWUpID09PSAnc3RyaW5nJyAmJiBjYWNoZWQuY29tcG9uZW50TmFtZSAhPSBjb21wb25lbnROYW1lKSB7XG4gICAgaWYgKGNhY2hlZC5ub2Rlcy5sZW5ndGgpIGNsZWFyKGNhY2hlZC5ub2RlcywgY2FjaGVkKTtcbiAgfVxuXG4gIGlmICh0eXBlKGRhdGEudGFnKSAhPT0gJ3N0cmluZycpIHJldHVybjtcblxuICB2YXIgaXNOZXcgPSBjYWNoZWQubm9kZXMubGVuZ3RoID09PSAwLFxuICAgICAgZGF0YUF0dHJLZXlzID0gT2JqZWN0LmtleXMoZGF0YS5hdHRycyksXG4gICAgICBoYXNLZXlzID0gZGF0YUF0dHJLZXlzLmxlbmd0aCA+ICgna2V5JyBpbiBkYXRhLmF0dHJzID8gMSA6IDApLFxuICAgICAgZG9tTm9kZSxcbiAgICAgIG5ld05vZGVJZHg7XG4gIGlmIChkYXRhLmF0dHJzLnhtbG5zKSBuYW1lc3BhY2UgPSBkYXRhLmF0dHJzLnhtbG5zO2Vsc2UgaWYgKGRhdGEudGFnID09PSAnc3ZnJykgbmFtZXNwYWNlID0gJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJztlbHNlIGlmIChkYXRhLnRhZyA9PT0gJ21hdGgnKSBuYW1lc3BhY2UgPSAnaHR0cDovL3d3dy53My5vcmcvMTk5OC9NYXRoL01hdGhNTCc7XG5cbiAgaWYgKGlzTmV3KSB7XG4gICAgdmFyIF9uZXdFbGVtZW50MiA9IF9uZXdFbGVtZW50KHBhcmVudEVsZW1lbnQsIG5hbWVzcGFjZSwgZGF0YSwgaW5kZXgpO1xuXG4gICAgZG9tTm9kZSA9IF9uZXdFbGVtZW50MlswXTtcbiAgICBuZXdOb2RlSWR4ID0gX25ld0VsZW1lbnQyWzFdO1xuXG4gICAgY2FjaGVkID0ge1xuICAgICAgdGFnOiBkYXRhLnRhZyxcbiAgICAgIC8vc2V0IGF0dHJpYnV0ZXMgZmlyc3QsIHRoZW4gY3JlYXRlIGNoaWxkcmVuXG4gICAgICBhdHRyczogaGFzS2V5cyA/IHNldEF0dHJpYnV0ZXMoZG9tTm9kZSwgZGF0YS50YWcsIGRhdGEuYXR0cnMsIHt9LCBuYW1lc3BhY2UpIDogZGF0YS5hdHRycyxcbiAgICAgIGNoaWxkcmVuOiBkYXRhLmNoaWxkcmVuICE9IG51bGwgJiYgZGF0YS5jaGlsZHJlbi5sZW5ndGggPiAwID8gYnVpbGQoZG9tTm9kZSwgZGF0YS50YWcsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBkYXRhLmNoaWxkcmVuLCBjYWNoZWQuY2hpbGRyZW4sIHRydWUsIDAsIGRhdGEuYXR0cnMuY29udGVudGVkaXRhYmxlID8gZG9tTm9kZSA6IGVkaXRhYmxlLCBuYW1lc3BhY2UsIGNvbmZpZ3MpIDogZGF0YS5jaGlsZHJlbixcbiAgICAgIG5vZGVzOiBbZG9tTm9kZV1cbiAgICB9O1xuICAgIGlmIChjb250cm9sbGVycy5sZW5ndGgpIHtcbiAgICAgIGNhY2hlZC52aWV3cyA9IHZpZXdzO1xuICAgICAgY2FjaGVkLmNvbnRyb2xsZXJzID0gY29udHJvbGxlcnM7XG4gICAgICBmb3IgKHZhciBpID0gMCwgY29udHJvbGxlciA9IHVuZGVmaW5lZDsgY29udHJvbGxlciA9IGNvbnRyb2xsZXJzW2ldOyBpKyspIHtcbiAgICAgICAgaWYgKGNvbnRyb2xsZXIub251bmxvYWQgJiYgY29udHJvbGxlci5vbnVubG9hZC4kb2xkKSBjb250cm9sbGVyLm9udW5sb2FkID0gY29udHJvbGxlci5vbnVubG9hZC4kb2xkO1xuICAgICAgICBpZiAoRy5wZW5kaW5nUmVxdWVzdHMgJiYgY29udHJvbGxlci5vbnVubG9hZCkge1xuICAgICAgICAgIHZhciBfb251bmxvYWQgPSBjb250cm9sbGVyLm9udW5sb2FkO1xuICAgICAgICAgIGNvbnRyb2xsZXIub251bmxvYWQgPSBOT09QO1xuICAgICAgICAgIGNvbnRyb2xsZXIub251bmxvYWQuJG9sZCA9IF9vbnVubG9hZDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjYWNoZWQuY2hpbGRyZW4gJiYgIWNhY2hlZC5jaGlsZHJlbi5ub2RlcykgY2FjaGVkLmNoaWxkcmVuLm5vZGVzID0gW107XG4gICAgLy9lZGdlIGNhc2U6IHNldHRpbmcgdmFsdWUgb24gPHNlbGVjdD4gZG9lc24ndCB3b3JrIGJlZm9yZSBjaGlsZHJlbiBleGlzdCwgc28gc2V0IGl0IGFnYWluIGFmdGVyIGNoaWxkcmVuIGhhdmUgYmVlbiBjcmVhdGVkXG4gICAgaWYgKGRhdGEudGFnID09PSAnc2VsZWN0JyAmJiAndmFsdWUnIGluIGRhdGEuYXR0cnMpIHNldEF0dHJpYnV0ZXMoZG9tTm9kZSwgZGF0YS50YWcsIHsgdmFsdWU6IGRhdGEuYXR0cnMudmFsdWUgfSwge30sIG5hbWVzcGFjZSk7XG5cbiAgICBpZiAobmV3Tm9kZUlkeCAhPSBudWxsKSBwYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZShkb21Ob2RlLCBwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbbmV3Tm9kZUlkeF0gfHwgbnVsbCk7XG4gIH0gZWxzZSB7XG4gICAgZG9tTm9kZSA9IGNhY2hlZC5ub2Rlc1swXTtcbiAgICBpZiAoaGFzS2V5cykgc2V0QXR0cmlidXRlcyhkb21Ob2RlLCBkYXRhLnRhZywgZGF0YS5hdHRycywgY2FjaGVkLmF0dHJzLCBuYW1lc3BhY2UpO1xuICAgIGNhY2hlZC5jaGlsZHJlbiA9IGJ1aWxkKGRvbU5vZGUsIGRhdGEudGFnLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgZGF0YS5jaGlsZHJlbiwgY2FjaGVkLmNoaWxkcmVuLCBmYWxzZSwgMCwgZGF0YS5hdHRycy5jb250ZW50ZWRpdGFibGUgPyBkb21Ob2RlIDogZWRpdGFibGUsIG5hbWVzcGFjZSwgY29uZmlncyk7XG4gICAgY2FjaGVkLm5vZGVzLmludGFjdCA9IHRydWU7XG4gICAgaWYgKGNvbnRyb2xsZXJzLmxlbmd0aCkge1xuICAgICAgY2FjaGVkLnZpZXdzID0gdmlld3M7XG4gICAgICBjYWNoZWQuY29udHJvbGxlcnMgPSBjb250cm9sbGVycztcbiAgICB9XG4gICAgaWYgKHNob3VsZFJlYXR0YWNoID09PSB0cnVlICYmIGRvbU5vZGUgIT0gbnVsbCkgcGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUoZG9tTm9kZSwgcGFyZW50RWxlbWVudC5jaGlsZE5vZGVzW2luZGV4XSB8fCBudWxsKTtcbiAgfVxuICAvL3NjaGVkdWxlIGNvbmZpZ3MgdG8gYmUgY2FsbGVkLiBUaGV5IGFyZSBjYWxsZWQgYWZ0ZXIgYGJ1aWxkYCBmaW5pc2hlcyBydW5uaW5nXG4gIGlmICh0eXBlKGRhdGEuYXR0cnMuY29uZmlnKSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHZhciBjb250ZXh0ID0gY2FjaGVkLmNvbmZpZ0NvbnRleHQgPSBjYWNoZWQuY29uZmlnQ29udGV4dCB8fCB7fTtcblxuICAgIC8vIGJpbmRcbiAgICB2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbiAoZGF0YSwgYXJncykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGRhdGEuYXR0cnMuY29uZmlnLmFwcGx5KGRhdGEsIGFyZ3MpO1xuICAgICAgfTtcbiAgICB9O1xuICAgIGNvbmZpZ3MucHVzaChjYWxsYmFjayhkYXRhLCBbZG9tTm9kZSwgIWlzTmV3LCBjb250ZXh0LCBjYWNoZWRdKSk7XG4gIH1cbiAgaWYgKHR5cGUoY29tcG9uZW50TmFtZSkgPT09ICdzdHJpbmcnKSB7XG4gICAgY2FjaGVkLmNvbXBvbmVudE5hbWUgPSBjb21wb25lbnROYW1lO1xuICB9XG4gIHJldHVybiBjYWNoZWQ7XG59XG5mdW5jdGlvbiBfbmV3RWxlbWVudChwYXJlbnRFbGVtZW50LCBuYW1lc3BhY2UsIGRhdGEsIGluZGV4KSB7XG4gIHZhciBkb21Ob2RlLFxuICAgICAgZG9tTm9kZUluZGV4LFxuICAgICAgaW5zZXJ0SWR4ID0gaW5kZXg7XG4gIGlmIChwYXJlbnRFbGVtZW50ICYmIHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlcy5sZW5ndGgpIHtcbiAgICBkb21Ob2RlSW5kZXggPSBfZmluZERvbU5vZGVCeVJlZihwYXJlbnRFbGVtZW50LCBpbmRleCk7XG4gICAgaWYgKGRvbU5vZGVJbmRleCAmJiBkb21Ob2RlSW5kZXhbMF0pIHtcbiAgICAgIGluc2VydElkeCA9IGRvbU5vZGVJbmRleFsxXTtcbiAgICAgIGlmIChkb21Ob2RlSW5kZXhbMF0udGFnTmFtZS50b0xvd2VyQ2FzZSgpID09IGRhdGEudGFnLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgcmV0dXJuIFtkb21Ob2RlSW5kZXhbMF0sIG51bGxdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2xlYXIoW2RvbU5vZGVJbmRleFswXV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBpZiAoZGF0YS5hdHRycy5pcykgZG9tTm9kZSA9IG5hbWVzcGFjZSA9PT0gdW5kZWZpbmVkID8gJGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoZGF0YS50YWcsIGRhdGEuYXR0cnMuaXMpIDogJGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhuYW1lc3BhY2UsIGRhdGEudGFnLCBkYXRhLmF0dHJzLmlzKTtlbHNlIGRvbU5vZGUgPSBuYW1lc3BhY2UgPT09IHVuZGVmaW5lZCA/ICRkb2N1bWVudC5jcmVhdGVFbGVtZW50KGRhdGEudGFnKSA6ICRkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobmFtZXNwYWNlLCBkYXRhLnRhZyk7XG4gIGRvbU5vZGUuc2V0QXR0cmlidXRlKCdkYXRhLW1yZWYnLCBpbmRleCk7XG4gIHJldHVybiBbZG9tTm9kZSwgaW5zZXJ0SWR4XTtcbn1cbmZ1bmN0aW9uIF9maW5kRG9tTm9kZUJ5UmVmKHBhcmVudEVsZW1lbnQsIHJlZikge1xuICB2YXIgaSA9IDAsXG4gICAgICBsID0gcGFyZW50RWxlbWVudC5jaGlsZE5vZGVzLmxlbmd0aCxcbiAgICAgIGNoaWxkTm9kZTtcbiAgZm9yICg7IGkgPCBsOyBpKyspIHtcbiAgICBjaGlsZE5vZGUgPSBwYXJlbnRFbGVtZW50LmNoaWxkTm9kZXNbaV07XG4gICAgaWYgKGNoaWxkTm9kZS5nZXRBdHRyaWJ1dGUgJiYgY2hpbGROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1tcmVmJykgPT0gcmVmKSB7XG4gICAgICByZXR1cm4gW2NoaWxkTm9kZSwgaV07XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBkaWZmVGV4dE5vZGUoZGF0YSwgY2FjaGVkLCBwYXJlbnRFbGVtZW50LCBwYXJlbnRUYWcsIGluZGV4LCBzaG91bGRSZWF0dGFjaCwgZWRpdGFibGUpIHtcbiAgLy9oYW5kbGUgdGV4dCBub2Rlc1xuICB2YXIgbm9kZXM7XG4gIGlmIChjYWNoZWQubm9kZXMubGVuZ3RoID09PSAwKSB7XG4gICAgaWYgKGRhdGEgPT0gJycpIHJldHVybiBjYWNoZWQ7XG4gICAgY2xlYXIoW3BhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tpbmRleF1dKTtcbiAgICBpZiAoZGF0YS4kdHJ1c3RlZCkge1xuICAgICAgbm9kZXMgPSBpbmplY3RIVE1MKHBhcmVudEVsZW1lbnQsIGluZGV4LCBkYXRhKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbm9kZXMgPSBbJGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRhdGEpXTtcbiAgICAgIGlmICghcGFyZW50RWxlbWVudC5ub2RlTmFtZS5tYXRjaChWT0lEX0VMRU1FTlRTKSkgcGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUobm9kZXNbMF0sIHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tpbmRleF0gfHwgbnVsbCk7XG4gICAgfVxuICAgIGNhY2hlZCA9ICdzdHJpbmcgbnVtYmVyIGJvb2xlYW4nLmluZGV4T2YodHlwZW9mIGRhdGEpID4gLTEgPyBuZXcgZGF0YS5jb25zdHJ1Y3RvcihkYXRhKSA6IGRhdGE7XG4gICAgY2FjaGVkLm5vZGVzID0gbm9kZXM7XG4gIH0gZWxzZSBpZiAoY2FjaGVkLnZhbHVlT2YoKSAhPT0gZGF0YS52YWx1ZU9mKCkgfHwgc2hvdWxkUmVhdHRhY2ggPT09IHRydWUpIHtcbiAgICBub2RlcyA9IGNhY2hlZC5ub2RlcztcbiAgICBpZiAoIWVkaXRhYmxlIHx8IGVkaXRhYmxlICE9PSAkZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkge1xuICAgICAgaWYgKGRhdGEuJHRydXN0ZWQpIHtcbiAgICAgICAgY2xlYXIobm9kZXMsIGNhY2hlZCk7XG4gICAgICAgIG5vZGVzID0gaW5qZWN0SFRNTChwYXJlbnRFbGVtZW50LCBpbmRleCwgZGF0YSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvL2Nvcm5lciBjYXNlOiByZXBsYWNpbmcgdGhlIG5vZGVWYWx1ZSBvZiBhIHRleHQgbm9kZSB0aGF0IGlzIGEgY2hpbGQgb2YgYSB0ZXh0YXJlYS9jb250ZW50ZWRpdGFibGUgZG9lc24ndCB3b3JrXG4gICAgICAgIC8vd2UgbmVlZCB0byB1cGRhdGUgdGhlIHZhbHVlIHByb3BlcnR5IG9mIHRoZSBwYXJlbnQgdGV4dGFyZWEgb3IgdGhlIGlubmVySFRNTCBvZiB0aGUgY29udGVudGVkaXRhYmxlIGVsZW1lbnQgaW5zdGVhZFxuICAgICAgICBpZiAocGFyZW50VGFnID09PSAndGV4dGFyZWEnKSBwYXJlbnRFbGVtZW50LnZhbHVlID0gZGF0YTtlbHNlIGlmIChlZGl0YWJsZSkgZWRpdGFibGUuaW5uZXJIVE1MID0gZGF0YTtlbHNlIHtcbiAgICAgICAgICBpZiAobm9kZXNbMF0ubm9kZVR5cGUgPT09IDEgfHwgbm9kZXMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgLy93YXMgYSB0cnVzdGVkIHN0cmluZ1xuICAgICAgICAgICAgY2xlYXIoY2FjaGVkLm5vZGVzLCBjYWNoZWQpO1xuICAgICAgICAgICAgbm9kZXMgPSBbJGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRhdGEpXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUobm9kZXNbMF0sIHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tpbmRleF0gfHwgbnVsbCk7XG4gICAgICAgICAgbm9kZXNbMF0ubm9kZVZhbHVlID0gZGF0YTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBjYWNoZWQgPSBuZXcgZGF0YS5jb25zdHJ1Y3RvcihkYXRhKTtcbiAgICBjYWNoZWQubm9kZXMgPSBub2RlcztcbiAgfSBlbHNlIGNhY2hlZC5ub2Rlcy5pbnRhY3QgPSB0cnVlO1xuICByZXR1cm4gY2FjaGVkO1xufVxuXG4vL2hlbHBlcnNcbmZ1bmN0aW9uIF9yZWN1cnNpdmVGbGF0dGVuKGFycikge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgIC8vIGFyciBtYXkgYmUgbW9kaWZpZWQsIGV4LiBub2RlbGlzdFxuICAgIGlmICh0eXBlKGFycltpXSkgPT09ICdhcnJheScpIHtcbiAgICAgIGFyciA9IGFyci5jb25jYXQuYXBwbHkoW10sIGFycik7XG4gICAgICBpLS07IC8vY2hlY2sgY3VycmVudCBpbmRleCBhZ2FpbiBhbmQgZmxhdHRlbiB1bnRpbCB0aGVyZSBhcmUgbm8gbW9yZSBuZXN0ZWQgYXJyYXlzIGF0IHRoYXQgaW5kZXhcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGFycjtcbn1cbmZ1bmN0aW9uIF9oYXNTYW1lS2V5cyhvMSwgbzIpIHtcbiAgdmFyIG8xS2V5cyA9IE9iamVjdC5rZXlzKG8xKS5zb3J0KCkuam9pbigpLFxuICAgICAgbzJLZXlzID0gT2JqZWN0LmtleXMobzIpLnNvcnQoKS5qb2luKCk7XG4gIHJldHVybiBvMUtleXMgPT09IG8yS2V5cztcbn1cbmZ1bmN0aW9uIGluamVjdEhUTUwocGFyZW50RWxlbWVudCwgaW5kZXgsIGRhdGEpIHtcbiAgdmFyIG5leHRTaWJsaW5nID0gcGFyZW50RWxlbWVudC5jaGlsZE5vZGVzW2luZGV4XTtcbiAgaWYgKG5leHRTaWJsaW5nKSB7XG4gICAgdmFyIGlzRWxlbWVudCA9IG5leHRTaWJsaW5nLm5vZGVUeXBlICE9PSAxO1xuICAgIHZhciBwbGFjZWhvbGRlciA9ICRkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgaWYgKGlzRWxlbWVudCkge1xuICAgICAgcGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUocGxhY2Vob2xkZXIsIG5leHRTaWJsaW5nIHx8IG51bGwpO1xuICAgICAgcGxhY2Vob2xkZXIuaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmViZWdpbicsIGRhdGEpO1xuICAgICAgcGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChwbGFjZWhvbGRlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5leHRTaWJsaW5nLmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlYmVnaW4nLCBkYXRhKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcGFyZW50RWxlbWVudC5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWVuZCcsIGRhdGEpO1xuICB9XG4gIHZhciBub2RlcyA9IFtdLFxuICAgICAgY2hpbGROb2RlO1xuICB3aGlsZSAoKGNoaWxkTm9kZSA9IHBhcmVudEVsZW1lbnQuY2hpbGROb2Rlc1tpbmRleCsrXSkgIT09IG5leHRTaWJsaW5nKSB7XG4gICAgbm9kZXMucHVzaChjaGlsZE5vZGUpO1xuICB9XG4gIHJldHVybiBub2Rlcztcbn0iLCJpbXBvcnQgeyBkb2N1bWVudCBhcyAkZG9jdW1lbnQsIEcgfSBmcm9tICcuLi9nbG9iYWxzJztcbmltcG9ydCBidWlsZCBmcm9tICcuL2J1aWxkJztcbmltcG9ydCBjbGVhciBmcm9tICcuL2NsZWFyJztcbi8vcmVuZGVyIHF1ZXVlIHNldHRpbmdcbkcucmVuZGVyUXVldWUub25GbHVzaChfcmVuZGVyKS5vbkFkZFRhcmdldChfbWVyZ2VUYXNrKTtcbmV4cG9ydCBkZWZhdWx0IHJlbmRlcjtcbmZ1bmN0aW9uIHJlbmRlcihyb290LCB2Tm9kZSwgZm9yY2VSZWNyZWF0aW9uLCBmb3JjZSkge1xuICB2YXIgdGFzayA9IHtcbiAgICByb290OiByb290LFxuICAgIHZOb2RlOiB2Tm9kZSxcbiAgICBmb3JjZVJlY3JlYXRpb246IGZvcmNlUmVjcmVhdGlvblxuICB9O1xuICBpZiAoZm9yY2UgPT09IHRydWUpIHtcbiAgICByZXR1cm4gX3JlbmRlcih0YXNrKTtcbiAgfVxuICBHLnJlbmRlclF1ZXVlLmFkZFRhcmdldCh0YXNrKTtcbn1cbnZhciBodG1sO1xudmFyIGRvY3VtZW50Tm9kZSA9IHtcbiAgYXBwZW5kQ2hpbGQ6IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgaWYgKGh0bWwgPT09IHVuZGVmaW5lZCkgaHRtbCA9ICRkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdodG1sJyk7XG4gICAgaWYgKCRkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgJGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAhPT0gbm9kZSkge1xuICAgICAgJGRvY3VtZW50LnJlcGxhY2VDaGlsZChub2RlLCAkZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgJGRvY3VtZW50LmFwcGVuZENoaWxkKG5vZGUpO1xuICAgIH1cbiAgICB0aGlzLmNoaWxkTm9kZXMgPSAkZG9jdW1lbnQuY2hpbGROb2RlcztcbiAgfSxcbiAgaW5zZXJ0QmVmb3JlOiBmdW5jdGlvbiAobm9kZSkge1xuICAgIHRoaXMuYXBwZW5kQ2hpbGQobm9kZSk7XG4gIH0sXG4gIGNoaWxkTm9kZXM6IFtdXG59O1xuLy8gdmFyIGRvbU5vZGVDYWNoZSA9IFtdLCB2Tm9kZUNhY2hlID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbnZhciBkb21DYWNoZU1hcCA9IEcuZG9tQ2FjaGVNYXA7XG5mdW5jdGlvbiBfcmVuZGVyKHRhc2spIHtcbiAgdmFyIHJvb3QgPSB0YXNrLnJvb3Q7XG4gIHZhciB2Tm9kZSA9IHRhc2sudk5vZGU7XG4gIHZhciBmb3JjZVJlY3JlYXRpb24gPSB0YXNrLmZvcmNlUmVjcmVhdGlvbjtcblxuICBpZiAoIXJvb3QpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0Vuc3VyZSB0aGUgRE9NIGVsZW1lbnQgYmVpbmcgcGFzc2VkIHRvIG0ucm91dGUvbS5tb3VudC9tLnJlbmRlciBpcyBub3QgdW5kZWZpbmVkLicpO1xuICB9XG4gIHZhciBjb25maWdzID0gW10sXG4gICAgICBpc0RvY3VtZW50Um9vdCA9IHJvb3QgPT09ICRkb2N1bWVudCxcbiAgICAgIGRvbU5vZGUgPSBpc0RvY3VtZW50Um9vdCB8fCByb290ID09PSAkZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ID8gZG9jdW1lbnROb2RlIDogcm9vdCxcbiAgICAgIHZOb2RlQ2FjaGU7XG4gIGlmIChpc0RvY3VtZW50Um9vdCAmJiB2Tm9kZS50YWcgIT09ICdodG1sJykge1xuICAgIHZOb2RlID0geyB0YWc6ICdodG1sJywgYXR0cnM6IHt9LCBjaGlsZHJlbjogdk5vZGUgfTtcbiAgfVxuXG4gIGlmIChmb3JjZVJlY3JlYXRpb24pIHtcbiAgICByZXNldChkb21Ob2RlKTtcbiAgfVxuICB2Tm9kZUNhY2hlID0gYnVpbGQoZG9tTm9kZSwgbnVsbCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHZOb2RlLCBkb21DYWNoZU1hcC5nZXQoZG9tTm9kZSksIGZhbHNlLCAwLCBudWxsLCB1bmRlZmluZWQsIGNvbmZpZ3MpO1xuICBjb25maWdzLmZvckVhY2goZnVuY3Rpb24gKG9uUmVuZGVyKSB7XG4gICAgb25SZW5kZXIoKTtcbiAgfSk7XG4gIGRvbUNhY2hlTWFwLnNldChkb21Ob2RlLCB2Tm9kZUNhY2hlKTtcbn1cblxuLy9oZWxwZXJzXG5cbmZ1bmN0aW9uIF9tZXJnZVRhc2socXVldWUsIHRhc2spIHtcbiAgdmFyIGksXG4gICAgICBsLFxuICAgICAgcm9vdElkeCA9IC0xO1xuICBmb3IgKGkgPSAwLCBsID0gcXVldWUubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgaWYgKHF1ZXVlW2ldLnJvb3QgPT09IHRhc2sucm9vdCkge1xuICAgICAgcm9vdElkeCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgaWYgKHJvb3RJZHggPiAtMSkge1xuICAgIHF1ZXVlLnNwbGljZShyb290SWR4LCAxKTtcbiAgfVxuICBxdWV1ZS5wdXNoKHRhc2spO1xuICByZXR1cm4gcXVldWU7XG59XG5cbmZ1bmN0aW9uIHJlc2V0KHJvb3QpIHtcbiAgY2xlYXIocm9vdC5jaGlsZE5vZGVzLCBkb21DYWNoZU1hcC5nZXQocm9vdCkpO1xuICBkb21DYWNoZU1hcC5yZW1vdmUocm9vdCk7XG59IiwiaW1wb3J0IG0gZnJvbSAnLi9tJztcbmltcG9ydCByZW5kZXIgZnJvbSAnLi9yZW5kZXInO1xuZXhwb3J0IHsgbSwgcmVuZGVyIH07IiwiXG5leHBvcnQgZGVmYXVsdCB1cGRhdGU7aW1wb3J0IHsgdHlwZSB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB7IEcgfSBmcm9tICcuLi9nbG9iYWxzJztcbmltcG9ydCB7IHJlbmRlciB9IGZyb20gJy4uL3JlbmRlcic7XG5pbXBvcnQgeyBGUkFNRV9CVURHRVQgfSBmcm9tICcuL3JhZic7XG4vL2dsb2JhbCByZW5kZXIgcXVldWUgc2V0dGluZ1xudmFyIHJlbmRlclF1ZXVlID0gRy5yZW5kZXJRdWV1ZS5vbkZpbmlzaChfb25GaW5pc2gpO1xudmFyIHJlZHJhd2luZyA9IGZhbHNlO1xuZnVuY3Rpb24gdXBkYXRlKGZvcmNlKSB7XG4gIGlmIChyZWRyYXdpbmcgPT09IHRydWUpIHJldHVybjtcbiAgcmVkcmF3aW5nID0gdHJ1ZTtcbiAgaWYgKGZvcmNlID09PSB0cnVlKSBHLmZvcmNpbmcgPSB0cnVlO1xuICBfdXBkYXRlUm9vdHMoZm9yY2UpO1xuICByZWRyYXdpbmcgPSBmYWxzZTtcbn1cblxuO1xuZnVuY3Rpb24gX3VwZGF0ZVJvb3RzKGZvcmNlKSB7XG4gIHZhciByb290LCBjb21wb25lbnQsIGNvbnRyb2xsZXIsIG5lZWRSZWNyZWF0aW9uLCB0YXNrO1xuICBpZiAocmVuZGVyUXVldWUubGVuZ3RoKCkgPT09IDAgfHwgZm9yY2UgPT09IHRydWUpIHtcbiAgICBpZiAodHlwZShHLmNvbXB1dGVQcmVSZWRyYXdIb29rKSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgRy5jb21wdXRlUHJlUmVkcmF3SG9vaygpO1xuICAgICAgRy5jb21wdXRlUHJlUmVkcmF3SG9vayA9IG51bGw7XG4gICAgfVxuICB9XG4gIGlmIChyZW5kZXJRdWV1ZS5sZW5ndGgoKSA+IDApIHtcbiAgICByZW5kZXJRdWV1ZS5zdG9wKCk7XG4gIH1cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBHLnJvb3RzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIHJvb3QgPSBHLnJvb3RzW2ldO1xuICAgIGNvbXBvbmVudCA9IEcuY29tcG9uZW50c1tpXTtcbiAgICBjb250cm9sbGVyID0gRy5jb250cm9sbGVyc1tpXTtcbiAgICBuZWVkUmVjcmVhdGlvbiA9IEcucmVjcmVhdGlvbnNbaV07XG4gICAgaWYgKGNvbnRyb2xsZXIpIHtcbiAgICAgIHZhciBhcmdzID0gY29tcG9uZW50LmNvbnRyb2xsZXIgJiYgY29tcG9uZW50LmNvbnRyb2xsZXIuJCRhcmdzID8gW2NvbnRyb2xsZXJdLmNvbmNhdChjb21wb25lbnQuY29udHJvbGxlci4kJGFyZ3MpIDogW2NvbnRyb2xsZXJdO1xuICAgICAgaWYgKGZvcmNlICE9PSB0cnVlKSB7XG4gICAgICAgIHJlbmRlcihyb290LCBjb21wb25lbnQudmlldyA/IGNvbXBvbmVudC52aWV3LmFwcGx5KGNvbXBvbmVudCwgYXJncykgOiAnJywgbmVlZFJlY3JlYXRpb24pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVuZGVyKHJvb3QsIGNvbXBvbmVudC52aWV3ID8gY29tcG9uZW50LnZpZXcuYXBwbHkoY29tcG9uZW50LCBhcmdzKSA6ICcnLCBuZWVkUmVjcmVhdGlvbiwgdHJ1ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIC8vcmVzZXQgYmFjayB0byBub3QgZGVzdHJveSByb290J3MgY2hpbGRyZW5cbiAgICBHLnJlY3JlYXRpb25zW2ldID0gdm9pZCAwO1xuICB9XG4gIGlmIChmb3JjZSA9PT0gdHJ1ZSkge1xuICAgIF9vbkZpbmlzaCgpO1xuICAgIEcuZm9yY2luZyA9IGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9vbkZpbmlzaCgpIHtcbiAgaWYgKHR5cGUoRy5jb21wdXRlUG9zdFJlZHJhd0hvb2spID09PSAnZnVuY3Rpb24nKSB7XG4gICAgRy5jb21wdXRlUG9zdFJlZHJhd0hvb2soKTtcbiAgICBHLmNvbXB1dGVQb3N0UmVkcmF3SG9vayA9IG51bGw7XG4gIH1cbn0iLCJpbXBvcnQgcmVkcmF3IGZyb20gJy4vdXBkYXRlJztcbmltcG9ydCB7IEcgfSBmcm9tICcuLi9nbG9iYWxzJztcblxucmVkcmF3LnN0cmF0ZWd5ID0gRy51cGRhdGVTdHJhdGVneTtcbmZ1bmN0aW9uIHN0YXJ0Q29tcHV0YXRpb24oKSB7XG4gIEcucGVuZGluZ1JlcXVlc3RzKys7XG59XG5mdW5jdGlvbiBlbmRDb21wdXRhdGlvbigpIHtcbiAgRy5wZW5kaW5nUmVxdWVzdHMgPSBNYXRoLm1heChHLnBlbmRpbmdSZXF1ZXN0cyAtIDEsIDApO1xuICBpZiAoRy5wZW5kaW5nUmVxdWVzdHMgPT09IDApIHJlZHJhdygpO1xufVxuLy8gZnVuY3Rpb24gZW5kRmlyc3RDb21wdXRhdGlvbigpIHtcbi8vIGlmIChyZWRyYXcuc3RyYXRlZ3koKSA9PT0gXCJub25lXCIpIHtcbi8vICAgRy5wZW5kaW5nUmVxdWVzdHMtLTtcbi8vICAgcmVkcmF3LnN0cmF0ZWd5KFwiZGlmZlwiKTtcbi8vIH1cbi8vICAgZWxzZSBlbmRDb21wdXRhdGlvbigpO1xuLy8gfVxuXG5leHBvcnQgeyByZWRyYXcsIHN0YXJ0Q29tcHV0YXRpb24sIGVuZENvbXB1dGF0aW9uIH07IiwiXG5cbmV4cG9ydCBkZWZhdWx0IGNvbXBvbmVudGl6ZTtcbmltcG9ydCB7IHNsaWNlLCBOT09QIH0gZnJvbSAnLi4vdXRpbHMnO1xuZnVuY3Rpb24gcGFyYW1ldGVyaXplKGNvbXBvbmVudCwgYXJncykge1xuICB2YXIgY29udHJvbGxlciA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKGNvbXBvbmVudC5jb250cm9sbGVyIHx8IE5PT1ApLmFwcGx5KHRoaXMsIGFyZ3MpIHx8IHRoaXM7XG4gIH07XG5cbiAgdmFyIHZpZXcgPSBmdW5jdGlvbiAoY3RybCkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkgYXJncyA9IGFyZ3MuY29uY2F0KHNsaWNlKGFyZ3VtZW50cywgMSkpO1xuICAgIHJldHVybiBjb21wb25lbnQudmlldy5hcHBseShjb21wb25lbnQsIGFyZ3MubGVuZ3RoID8gW2N0cmxdLmNvbmNhdChhcmdzKSA6IFtjdHJsXSk7XG4gIH07XG4gIHZpZXcuJG9yaWdpbmFsID0gY29tcG9uZW50LnZpZXc7XG4gIHZhciBvdXRwdXQgPSB7IGNvbnRyb2xsZXI6IGNvbnRyb2xsZXIsIHZpZXc6IHZpZXcgfTtcbiAgaWYgKGFyZ3NbMF0gJiYgYXJnc1swXS5rZXkgIT0gbnVsbCkgb3V0cHV0LmF0dHJzID0geyBrZXk6IGFyZ3NbMF0ua2V5IH07XG4gIHJldHVybiBvdXRwdXQ7XG59XG5mdW5jdGlvbiBjb21wb25lbnRpemUoY29tcG9uZW50KSB7XG4gIHJldHVybiBwYXJhbWV0ZXJpemUoY29tcG9uZW50LCBzbGljZShhcmd1bWVudHMsIDEpKTtcbn0iLCJcblxuZXhwb3J0IGRlZmF1bHQgbW91bnQ7aW1wb3J0IHsgRyB9IGZyb20gJy4uL2dsb2JhbHMnO1xuXG5pbXBvcnQgeyByZWRyYXcsIHN0YXJ0Q29tcHV0YXRpb24sIGVuZENvbXB1dGF0aW9uIH0gZnJvbSAnLi4vdXBkYXRlJztcblxuaW1wb3J0IHsgdHlwZSwgc2xpY2UsIE5PT1AgfSBmcm9tICcuLi91dGlscyc7XG5cbnZhciB0b3BDb21wb25lbnQ7XG5mdW5jdGlvbiBtb3VudChyb290LCBjb21wb25lbnQsIGZvcmNlUmVjcmVhdGlvbikge1xuICBpZiAoIXJvb3QpIHRocm93IG5ldyBFcnJvcignUGxlYXNlIGVuc3VyZSB0aGUgRE9NIGVsZW1lbnQgZXhpc3RzIGJlZm9yZSByZW5kZXJpbmcgYSB0ZW1wbGF0ZSBpbnRvIGl0LicpO1xuICB2YXIgaW5kZXggPSBHLnJvb3RzLmluZGV4T2Yocm9vdCk7XG4gIGlmIChpbmRleCA8IDApIGluZGV4ID0gRy5yb290cy5sZW5ndGg7XG5cbiAgdmFyIGlzUHJldmVudGVkID0gZmFsc2U7XG4gIHZhciBldmVudCA9IHtcbiAgICBwcmV2ZW50RGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgICAgaXNQcmV2ZW50ZWQgPSB0cnVlO1xuICAgICAgRy5jb21wdXRlUHJlUmVkcmF3SG9vayA9IEcuY29tcHV0ZVBvc3RSZWRyYXdIb29rID0gbnVsbDtcbiAgICB9XG4gIH07XG4gIGZvciAodmFyIGkgPSAwLCB1bmxvYWRlciA9IHVuZGVmaW5lZDsgdW5sb2FkZXIgPSBHLnVubG9hZGVyc1tpXTsgaSsrKSB7XG4gICAgdW5sb2FkZXIuaGFuZGxlci5jYWxsKHVubG9hZGVyLmNvbnRyb2xsZXIsIGV2ZW50KTtcbiAgICB1bmxvYWRlci5jb250cm9sbGVyLm9udW5sb2FkID0gbnVsbDtcbiAgfVxuXG4gIGlmIChpc1ByZXZlbnRlZCkge1xuICAgIGZvciAodmFyIGkgPSAwLCB1bmxvYWRlciA9IHVuZGVmaW5lZDsgdW5sb2FkZXIgPSBHLnVubG9hZGVyc1tpXTsgaSsrKSB7XG4gICAgICB1bmxvYWRlci5jb250cm9sbGVyLm9udW5sb2FkID0gdW5sb2FkZXIuaGFuZGxlcjtcbiAgICB9XG4gIH0gZWxzZSBHLnVubG9hZGVycyA9IFtdO1xuXG4gIGlmIChHLmNvbnRyb2xsZXJzW2luZGV4XSAmJiB0eXBlKEcuY29udHJvbGxlcnNbaW5kZXhdLm9udW5sb2FkKSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIEcuY29udHJvbGxlcnNbaW5kZXhdLm9udW5sb2FkKGV2ZW50KTtcbiAgfVxuXG4gIGlmICghaXNQcmV2ZW50ZWQpIHtcbiAgICAvLyByZWRyYXcuc3RyYXRlZ3koXCJhbGxcIik7XG4gICAgc3RhcnRDb21wdXRhdGlvbigpO1xuICAgIEcucm9vdHNbaW5kZXhdID0gcm9vdDtcbiAgICAvLyBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDIpIGNvbXBvbmVudCA9IGNvbXBvbmVudGl6ZShjb21wb25lbnQsIHNsaWNlKGFyZ3VtZW50cywgMikpO1xuICAgIHZhciBjdXJyZW50Q29tcG9uZW50ID0gdG9wQ29tcG9uZW50ID0gY29tcG9uZW50ID0gY29tcG9uZW50IHx8IHsgY29udHJvbGxlcjogTk9PUCB9O1xuICAgIHZhciBfY29uc3RydWN0b3IgPSBjb21wb25lbnQuY29udHJvbGxlciB8fCBOT09QO1xuICAgIHZhciBjb250cm9sbGVyID0gbmV3IF9jb25zdHJ1Y3RvcigpO1xuICAgIC8vY29udHJvbGxlcnMgbWF5IGNhbGwgbS5tb3VudCByZWN1cnNpdmVseSAodmlhIG0ucm91dGUgcmVkaXJlY3RzLCBmb3IgZXhhbXBsZSlcbiAgICAvL3RoaXMgY29uZGl0aW9uYWwgZW5zdXJlcyBvbmx5IHRoZSBsYXN0IHJlY3Vyc2l2ZSBtLm1vdW50IGNhbGwgaXMgYXBwbGllZFxuICAgIGlmIChjdXJyZW50Q29tcG9uZW50ID09PSB0b3BDb21wb25lbnQpIHtcbiAgICAgIEcuY29udHJvbGxlcnNbaW5kZXhdID0gY29udHJvbGxlcjtcbiAgICAgIEcuY29tcG9uZW50c1tpbmRleF0gPSBjb21wb25lbnQ7XG4gICAgICBHLnJlY3JlYXRpb25zW2luZGV4XSA9IGZvcmNlUmVjcmVhdGlvbjtcbiAgICB9XG4gICAgZW5kQ29tcHV0YXRpb24oKTtcbiAgICByZXR1cm4gRy5jb250cm9sbGVyc1tpbmRleF07XG4gIH1cbn1cblxuOyIsIlxuXG5leHBvcnQgZGVmYXVsdCBjcmVhdGVDb21wb25lbnQ7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5pbXBvcnQgKiBhcyB1cGRhdGUgZnJvbSAnLi4vdXBkYXRlJztcbmltcG9ydCB7IHR5cGUsIGV4dGVuZCwgc2xpY2UsIHJlbW92ZVZvaWRWYWx1ZSwgdG9BcnJheSB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB7IHJ1bnRpbWUgYXMgUlQgfSBmcm9tICcuLi9nbG9iYWxzJztcbnZhciBleHRlbmRNZXRob2RzID0gWydjb21wb25lbnRXaWxsTW91bnQnLCAnY29tcG9uZW50RGlkTW91bnQnLCAnY29tcG9uZW50V2lsbFVwZGF0ZScsICdjb21wb25lbnREaWRVcGRhdGUnLCAnY29tcG9uZW50V2lsbFVubW91bnQnLCAnY29tcG9uZW50V2lsbERldGFjaGVkJywgJ2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMnLCAnZ2V0SW5pdGlhbFByb3BzJywgJ2dldEluaXRpYWxTdGF0ZSddO1xudmFyIHBpcGVkTWV0aG9kcyA9IFsnZ2V0SW5pdGlhbFByb3BzJywgJ2dldEluaXRpYWxTdGF0ZScsICdjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzJ107XG52YXIgaWdub3JlUHJvcHMgPSBbJ3NldFN0YXRlJywgJ21peGlucycsICdvbnVubG9hZCcsICdzZXRSb290J107XG5cbnZhciBDb21wb25lbnQgPSAoZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBDb21wb25lbnQocHJvcHMsIGNoaWxkcmVuKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIENvbXBvbmVudCk7XG5cbiAgICBpZiAodHlwZShwcm9wcykgIT09ICdvYmplY3QnICYmIHByb3BzICE9IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1tDb21wb25lbnRdcGFyYW0gZm9yIGNvbnN0cnVjdG9yIHNob3VsZCBhIG9iamVjdCBvciBudWxsIG9yIHVuZGVmaW5lZCEgZ2l2ZW46ICcgKyBwcm9wcyk7XG4gICAgfVxuICAgIHRoaXMucHJvcHMgPSBwcm9wcyB8fCB7fTtcbiAgICB0aGlzLnN0YXRlID0ge307XG4gICAgdGhpcy5wcm9wcy5jaGlsZHJlbiA9IHRvQXJyYXkoY2hpbGRyZW4pO1xuICAgIHRoaXMucm9vdCA9IG51bGw7XG4gICAgaWYgKHRoaXMuZ2V0SW5pdGlhbFByb3BzKSB7XG4gICAgICB0aGlzLnByb3BzID0gdGhpcy5nZXRJbml0aWFsUHJvcHModGhpcy5wcm9wcyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmdldEluaXRpYWxTdGF0ZSkge1xuICAgICAgdGhpcy5zdGF0ZSA9IHRoaXMuZ2V0SW5pdGlhbFN0YXRlKHRoaXMucHJvcHMpO1xuICAgIH1cbiAgfVxuXG4gIENvbXBvbmVudC5wcm90b3R5cGUuc2V0UHJvcHMgPSBmdW5jdGlvbiBzZXRQcm9wcyhwcm9wcywgY2hpbGRyZW4pIHtcbiAgICBpZiAodGhpcy5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKSB7XG4gICAgICBwcm9wcyA9IHRoaXMuY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhwcm9wcyk7XG4gICAgfVxuICAgIHRoaXMucHJvcHMgPSByZW1vdmVWb2lkVmFsdWUoZXh0ZW5kKHRoaXMucHJvcHMsIHByb3BzLCB7IGNoaWxkcmVuOiB0b0FycmF5KGNoaWxkcmVuKSB9KSk7XG4gIH07XG5cbiAgQ29tcG9uZW50LnByb3RvdHlwZS5vbnVubG9hZCA9IGZ1bmN0aW9uIG9udW5sb2FkKGZuKSB7XG4gICAgaWYgKHR5cGUoZm4pID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBmbi5jYWxsKHRoaXMpO1xuICAgIH1cbiAgICB0aGlzLnJvb3QgPSBudWxsO1xuICB9O1xuXG4gIENvbXBvbmVudC5wcm90b3R5cGUuc2V0Um9vdCA9IGZ1bmN0aW9uIHNldFJvb3Qocm9vdEVsKSB7XG4gICAgdGhpcy5yb290ID0gcm9vdEVsO1xuICB9O1xuXG4gIC8vIGdldEluaXRpYWxQcm9wcyhwcm9wcyl7XG5cbiAgLy8gfVxuXG4gIC8vIHJlbmRlcihwcm9wcywgc3RhdGVzKXtcblxuICAvLyB9XG4gIC8vIGdldEluaXRpYWxTdGF0ZShwcm9wcyl7XG5cbiAgLy8gfVxuICAvLyBjb21wb25lbnREaWRNb3VudChlbCl7XG5cbiAgLy8gfVxuICAvLyBzaG91bGRDb21wb25lbnRVcGRhdGUoKXtcblxuICAvLyB9XG5cbiAgLy8gY29tcG9uZW50RGlkVXBkYXRlKCl7XG5cbiAgLy8gfVxuICAvLyBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKCl7XG5cbiAgLy8gfVxuICAvLyBjb21wb25lbnRXaWxsVW5tb3VudChlKXtcblxuICAvLyB9XG4gIC8vIGNvbXBvbmVudFdpbGxEZXRhY2hlZChlbCl7XG5cbiAgLy8gfVxuXG4gIENvbXBvbmVudC5wcm90b3R5cGUuc2V0U3RhdGUgPSBmdW5jdGlvbiBzZXRTdGF0ZShzdGF0ZSwgc2lsZW5jZSkge1xuICAgIGlmICghc2lsZW5jZSAmJiBSVCA9PT0gJ2Jyb3dzZXInKSB7XG4gICAgICB1cGRhdGUuc3RhcnRDb21wdXRhdGlvbigpO1xuICAgIH1cbiAgICB0aGlzLnN0YXRlID0gZXh0ZW5kKHRoaXMuc3RhdGUsIHN0YXRlKTtcbiAgICBpZiAoIXNpbGVuY2UgJiYgUlQgPT09ICdicm93c2VyJykge1xuICAgICAgdXBkYXRlLmVuZENvbXB1dGF0aW9uKCk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBDb21wb25lbnQ7XG59KSgpO1xuXG47XG5mdW5jdGlvbiBjcmVhdGVDb21wb25lbnQob3B0aW9ucykge1xuICBpZiAodHlwZShvcHRpb25zKSAhPT0gJ29iamVjdCcpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdbY3JlYXRlQ29tcG9uZW50XXBhcmFtIHNob3VsZCBiZSBhIG9iamVjdCEgZ2l2ZW46ICcgKyBvcHRpb25zKTtcbiAgfVxuICB2YXIgY29tcG9uZW50ID0ge30sXG4gICAgICBmYWN0b3J5ID0gY3JlYXRlQ29tcG9uZW50RmFjdG9yeShvcHRpb25zKTtcbiAgY29tcG9uZW50LmNvbnRyb2xsZXIgPSBmdW5jdGlvbiAocHJvcHMsIGNoaWxkcmVuKSB7XG4gICAgdmFyIGluc3RhbmNlID0gbmV3IGZhY3RvcnkocHJvcHMsIGNoaWxkcmVuKTtcbiAgICB2YXIgY3RybCA9IHtcbiAgICAgIGluc3RhbmNlOiBpbnN0YW5jZVxuICAgIH07XG4gICAgaWYgKHR5cGUoaW5zdGFuY2UuY29tcG9uZW50V2lsbFVubW91bnQpID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjdHJsLm9udW5sb2FkID0gaW5zdGFuY2Uub251bmxvYWQuYmluZChpbnN0YW5jZSwgaW5zdGFuY2UuY29tcG9uZW50V2lsbFVubW91bnQpO1xuICAgIH1cbiAgICBpZiAodHlwZShpbnN0YW5jZS5uYW1lKSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGN0cmwubmFtZSA9IGluc3RhbmNlLm5hbWU7XG4gICAgfVxuICAgIHJldHVybiBjdHJsO1xuICB9O1xuXG4gIGNvbXBvbmVudC52aWV3ID0gbWFrZVZpZXcoKTtcbiAgcmV0dXJuIGNvbXBvbmVudDtcbn1cblxuZnVuY3Rpb24gbWl4aW5Qcm90byhwcm90bywgbWl4aW5zKSB7XG4gIHZhciBtaXhpbjtcbiAgaWYgKHR5cGUobWl4aW5zKSAhPT0gJ2FycmF5Jykge1xuICAgIG1peGlucyA9IHNsaWNlKGFyZ3VtZW50cywgMSk7XG4gIH1cbiAgbWl4aW5zID0gbWl4aW5zLmZpbHRlcihmdW5jdGlvbiAobSkge1xuICAgIHJldHVybiB0eXBlKG0pID09PSAnb2JqZWN0JztcbiAgfSk7XG4gIHdoaWxlIChtaXhpbnMubGVuZ3RoID4gMCkge1xuICAgIG1peGluID0gbWl4aW5zLnNoaWZ0KCk7XG4gICAgT2JqZWN0LmtleXMobWl4aW4pLmZvckVhY2goZnVuY3Rpb24gKHByb3BOYW1lKSB7XG4gICAgICBpZiAocHJvcE5hbWUgPT09ICdtaXhpbnMnKSB7XG4gICAgICAgIG1peGlucyA9IF9hZGRUb0hlYWQoW10uY29uY2F0KG1peGluW3Byb3BOYW1lXSksIG1peGlucyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChpZ25vcmVQcm9wcy5pbmRleE9mKHByb3BOYW1lKSAhPT0gLTEpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGV4dGVuZE1ldGhvZHMuaW5kZXhPZihwcm9wTmFtZSkgIT09IC0xKSB7XG4gICAgICAgIGlmICh0eXBlKHByb3RvW3Byb3BOYW1lXSkgPT09ICdhcnJheScpIHtcbiAgICAgICAgICBwcm90b1twcm9wTmFtZV0ucHVzaChtaXhpbltwcm9wTmFtZV0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHByb3RvW3Byb3BOYW1lXSA9IHR5cGUocHJvdG9bcHJvcE5hbWVdKSA9PT0gJ2Z1bmN0aW9uJyA/IFtwcm90b1twcm9wTmFtZV0sIG1peGluW3Byb3BOYW1lXV0gOiBbbWl4aW5bcHJvcE5hbWVdXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBwcm90b1twcm9wTmFtZV0gPSBtaXhpbltwcm9wTmFtZV07XG4gICAgfSk7XG4gIH1cblxuICBleHRlbmRNZXRob2RzLmZvckVhY2goZnVuY3Rpb24gKG1ldGhvZE5hbWUpIHtcbiAgICBpZiAodHlwZShwcm90b1ttZXRob2ROYW1lXSkgPT09ICdhcnJheScpIHtcbiAgICAgIHZhciBtZXRob2RzID0gcHJvdG9bbWV0aG9kTmFtZV0uZmlsdGVyKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgIHJldHVybiB0eXBlKHApID09PSAnZnVuY3Rpb24nO1xuICAgICAgfSk7XG4gICAgICBwcm90b1ttZXRob2ROYW1lXSA9IF9jb21wb3NlKHBpcGVkTWV0aG9kcy5pbmRleE9mKG1ldGhvZE5hbWUpICE9PSAtMSwgbWV0aG9kcyk7XG4gICAgfVxuICB9KTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZUNvbXBvbmVudEZhY3Rvcnkob3B0aW9ucykge1xuICB2YXIgZmFjdG9yeSA9IGZ1bmN0aW9uIENvbXBvbmVudEZhY3RvcnkoKSB7XG4gICAgQ29tcG9uZW50LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgX2JpbmRPbk1ldGhvZHMoZmFjdG9yeS5wcm90b3R5cGUsIHRoaXMpO1xuICB9LFxuICAgICAgbWl4aW5zO1xuICBmYWN0b3J5LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQ29tcG9uZW50LnByb3RvdHlwZSk7XG5cbiAgbWl4aW5zID0gb3B0aW9ucy5taXhpbnMgfHwgW107XG4gIGRlbGV0ZSBvcHRpb25zLm1peGlucztcbiAgaWYgKHR5cGUobWl4aW5zKSA9PT0gJ2FycmF5Jykge1xuICAgIG1peGlucyA9IG1peGlucy5jb25jYXQob3B0aW9ucyk7XG4gIH0gZWxzZSB7XG4gICAgbWl4aW5zID0gW21peGlucywgb3B0aW9uc107XG4gIH1cbiAgbWl4aW5Qcm90byhmYWN0b3J5LnByb3RvdHlwZSwgbWl4aW5zKTtcbiAgcmV0dXJuIGZhY3Rvcnk7XG59XG5cbmZ1bmN0aW9uIG1ha2VWaWV3KCkge1xuICB2YXIgY2FjaGVkVmFsdWUgPSB7fTtcbiAgLy8gZmFjdG9yeSA9IGNyZWF0ZUNvbXBvbmVudEZhY3Rvcnkob3B0aW9ucyk7XG4gIHJldHVybiBmdW5jdGlvbiBjb21wb25lbnRWaWV3KGN0cmwsIHByb3BzLCBjaGlsZHJlbikge1xuICAgIHZhciBpbnN0YW5jZSA9IGN0cmwuaW5zdGFuY2UsXG4gICAgICAgIG9sZFByb3BzID0gY2FjaGVkVmFsdWUucHJvcHMsXG4gICAgICAgIG9sZFN0YXRlID0gY2FjaGVkVmFsdWUuc3RhdGUsXG4gICAgICAgIGNvbmZpZyA9IGZ1bmN0aW9uIChub2RlLCBpc0luaXRpYWxpemVkLCBjb250ZXh0KSB7XG4gICAgICBfZXhlY3V0ZUZuKGluc3RhbmNlLCAnc2V0Um9vdCcsIG5vZGUpO1xuICAgICAgaWYgKCFpc0luaXRpYWxpemVkKSB7XG4gICAgICAgIF9leGVjdXRlRm4oaW5zdGFuY2UsICdjb21wb25lbnREaWRNb3VudCcsIG5vZGUpO1xuICAgICAgICBpZiAodHlwZShpbnN0YW5jZS5jb21wb25lbnRXaWxsRGV0YWNoZWQpID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgY29udGV4dC5vbnVubG9hZCA9IGluc3RhbmNlLmNvbXBvbmVudFdpbGxEZXRhY2hlZC5iaW5kKGluc3RhbmNlLCBub2RlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgX2V4ZWN1dGVGbihpbnN0YW5jZSwgJ2NvbXBvbmVudERpZFVwZGF0ZScsIG5vZGUsIG9sZFByb3BzLCBvbGRTdGF0ZSk7XG4gICAgICB9XG4gICAgfTtcbiAgICAvL3VwZGF0ZVByb3BzXG4gICAgaW5zdGFuY2Uuc2V0UHJvcHMocHJvcHMsIGNoaWxkcmVuKTtcbiAgICAvL2NhY2hlIHByZXZpb3VzIGluc3RhbmNlXG4gICAgY2FjaGVkVmFsdWUucHJvcHMgPSBpbnN0YW5jZS5wcm9wcztcbiAgICBjYWNoZWRWYWx1ZS5zdGF0ZSA9IGluc3RhbmNlLnN0YXRlO1xuXG4gICAgaWYgKGluc3RhbmNlLnJvb3QgIT0gbnVsbCkge1xuICAgICAgaWYgKF9leGVjdXRlRm4oaW5zdGFuY2UsICdzaG91bGRDb21wb25lbnRVcGRhdGUnLCBvbGRQcm9wcywgb2xkU3RhdGUpID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm4geyBzdWJ0cmVlOiAncmV0YWluJyB9O1xuICAgICAgfVxuICAgICAgX2V4ZWN1dGVGbihpbnN0YW5jZSwgJ2NvbXBvbmVudFdpbGxVcGRhdGUnLCBpbnN0YW5jZS5yb290LCBvbGRQcm9wcywgb2xkU3RhdGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBfZXhlY3V0ZUZuKGluc3RhbmNlLCAnY29tcG9uZW50V2lsbE1vdW50Jywgb2xkUHJvcHMsIG9sZFN0YXRlKTtcbiAgICB9XG5cbiAgICB2YXIgcmVzdWx0VmlldyA9IF9leGVjdXRlRm4oaW5zdGFuY2UsICdyZW5kZXInLCBpbnN0YW5jZS5wcm9wcywgaW5zdGFuY2Uuc3RhdGUpO1xuICAgIHJlc3VsdFZpZXcuYXR0cnMgPSByZXN1bHRWaWV3LmF0dHJzIHx8IHt9O1xuICAgIHJlc3VsdFZpZXcuYXR0cnMuY29uZmlnID0gY29uZmlnO1xuXG4gICAgcmV0dXJuIHJlc3VsdFZpZXc7XG4gIH07XG59XG5cbi8vaGVwbGVyc1xuZnVuY3Rpb24gX2JpbmRPbk1ldGhvZHMocHJvdG8sIGNvbXBvbmVudCkge1xuICBPYmplY3Qua2V5cyhwcm90bykuZm9yRWFjaChmdW5jdGlvbiAocHJvcCkge1xuICAgIHZhciB2YWwgPSBwcm90b1twcm9wXTtcbiAgICBpZiAodHlwZSh2YWwpID09PSAnZnVuY3Rpb24nIHx8IC9eb25bQS1aXVxcdyovLnRlc3QocHJvcCkpIHtcbiAgICAgIGNvbXBvbmVudFtwcm9wXSA9IHZhbC5iaW5kKGNvbXBvbmVudCk7XG4gICAgfVxuICB9KTtcbn1cbmZ1bmN0aW9uIF9leGVjdXRlRm4ob2JqLCBtZXRob2ROYW1lKSB7XG4gIHZhciBhcmdzID0gc2xpY2UoYXJndW1lbnRzLCAyKTtcbiAgaWYgKHR5cGUob2JqW21ldGhvZE5hbWVdKSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBvYmpbbWV0aG9kTmFtZV0uYXBwbHkob2JqLCBhcmdzKTtcbiAgfVxufVxuZnVuY3Rpb24gX2FkZFRvSGVhZChhcnJUb0FkZCwgdGFyZ2V0QXJyKSB7XG4gIHZhciBpLFxuICAgICAgbCA9IGFyclRvQWRkLmxlbmd0aCxcbiAgICAgIGFycjtcbiAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgIGFyciA9IGFyclRvQWRkW2ldO1xuICAgIGlmICh0YXJnZXRBcnIuaW5kZXhPZihhcnIpID09PSAtMSkge1xuICAgICAgdGFyZ2V0QXJyLnVuc2hpZnQoYXJyKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRhcmdldEFycjtcbn1cbmZ1bmN0aW9uIF9jb21wb3NlKGlzUGlwZWQsIGZucykge1xuICByZXR1cm4gZnVuY3Rpb24gX2NvbXBvc2VkKCkge1xuICAgIHZhciBhcmdzID0gc2xpY2UoYXJndW1lbnRzLCAwKSxcbiAgICAgICAgc2VsZiA9IHRoaXMsXG4gICAgICAgIGkgPSAwLFxuICAgICAgICBsID0gZm5zLmxlbmd0aCxcbiAgICAgICAgZm4sXG4gICAgICAgIHJlc3VsdCA9IGFyZ3M7XG4gICAgZm9yICg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGZuID0gZm5zW2ldO1xuICAgICAgcmVzdWx0ID0gZm4uYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgICBhcmdzID0gaXNQaXBlZCA/IHJlc3VsdCA6IGFyZ3M7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG59IiwiaW1wb3J0IGNvbXBvbmVudCBmcm9tICcuL2NvbXBvbmVudCc7XG5pbXBvcnQgbW91bnQgZnJvbSAnLi9tb3VudCc7XG5pbXBvcnQgY3JlYXRlQ29tcG9uZW50IGZyb20gJy4vY3JlYXRlQ29tcG9uZW50JztcbmV4cG9ydCB7IGNvbXBvbmVudCwgbW91bnQsIGNyZWF0ZUNvbXBvbmVudCB9OyIsImltcG9ydCB7IHJlbmRlciwgbSB9IGZyb20gJy4vcmVuZGVyJztcbmltcG9ydCB7IHJlZHJhdywgc3RhcnRDb21wdXRhdGlvbiwgZW5kQ29tcHV0YXRpb24gfSBmcm9tICcuL3VwZGF0ZSc7XG5pbXBvcnQgeyBtb3VudCwgY29tcG9uZW50LCBjcmVhdGVDb21wb25lbnQgfSBmcm9tICcuL21vdW50JztcbmltcG9ydCB7IEcgfSBmcm9tICcuL2dsb2JhbHMnO1xuaW1wb3J0IHsgX2V4dGVuZCB9IGZyb20gJy4vdXRpbHMnO1xudmFyIG1SZWFjdCA9IG07XG4vLyB2YXIgY29tbW9uRXZlbnRzID0gW1xuLy8gICAgIFwiYmx1clwiLCBcImNoYW5nZVwiLCBcImNsaWNrXCIsICBcImNvbnRleHRtZW51XCIsIFwiZGJsY2xpY2tcIixcbi8vICAgICBcImVycm9yXCIsXCJmb2N1c1wiLCBcImZvY3VzaW5cIiwgXCJmb2N1c291dFwiLCBcImlucHV0XCIsIFwia2V5ZG93blwiLFxuLy8gICAgIFwia2V5cHJlc3NcIiwgXCJrZXl1cFwiLCBcImxvYWRcIiwgXCJtb3VzZWRvd25cIiwgXCJtb3VzZXVwXCIsXG4vLyAgICAgXCJyZXNpemVcIiwgXCJzZWxlY3RcIiwgXCJzdWJtaXRcIiwgXCJ1bmxvYWRcIlxuLy8gXTtcbm1SZWFjdC5yZW5kZXIgPSByZW5kZXI7XG5tUmVhY3QucmVkcmF3ID0gcmVkcmF3O1xubVJlYWN0Lm1vdW50ID0gbW91bnQ7XG5tUmVhY3QuY29tcG9uZW50ID0gY29tcG9uZW50O1xubVJlYWN0LmNyZWF0ZUNvbXBvbmVudCA9IGNyZWF0ZUNvbXBvbmVudDtcbm1SZWFjdC5kb21EZWxlZ2F0b3IgPSBHLmRvbURlbGVnYXRvcjtcbi8vW09iamVjdC5hc3NpZ25dIHBvbHlmaWxsXG5pZiAodHlwZW9mIE9iamVjdC5hc3NpZ24gPT09ICd1bmRlZmluZWQnKSB7XG4gIE9iamVjdC5hc3NpZ24gPSBfZXh0ZW5kO1xufVxuZXhwb3J0IGRlZmF1bHQgbVJlYWN0OyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxFQUVBLFNBQVMsT0FBTyxFQUFFOztBQUZsQixFQUlBLFNBQVMsS0FBSyxHQUFHO0FBSmpCLEVBS0EsRUFBRSxJQUFJLE1BQU0sTUFBTTtBQUxsQixFQU1BLElBQUksT0FBTztBQU5YLEVBT0E7QUFQQSxFQVFBLEVBQUUsSUFBSSxNQUFNLFdBQVc7QUFSdkIsRUFTQSxJQUFJLE9BQU87QUFUWCxFQVVBO0FBVkEsRUFXQSxFQUFFLElBQUksTUFBTSxHQUFHO0FBWGYsRUFZQSxJQUFJLE9BQU87QUFaWCxFQWFBO0FBYkEsRUFjQSxFQUFFLElBQUksVUFBVSxPQUFPLFVBQVUsU0FBUyxLQUFLO0FBZC9DLEVBZUEsRUFBRSxRQUFRO0FBZlYsRUFnQkEsSUFBSSxLQUFLO0FBaEJULEVBaUJBLE1BQU0sT0FBTztBQWpCYixFQWtCQSxJQUFJLEtBQUs7QUFsQlQsRUFtQkEsTUFBTSxPQUFPO0FBbkJiLEVBb0JBLElBQUksS0FBSztBQXBCVCxFQXFCQSxNQUFNLE9BQU87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