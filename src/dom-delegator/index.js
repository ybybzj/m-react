/**
 * dom-delegatore allows you to attach an EventHandler to a dom element.
 * When the correct event occurs, dom-delegator will let the global delegate
 * eventHandler to handle the event and trigger your attached EventHandler.
 */
import {
  document as $document
} from '../globals';

import addEventListener from './addEvent';
import removeEventListener from './removeEvent';
import ProxyEvent from './proxyEvent';
import {type, getHash, extend} from '../utils';
import {Map} from '../store';

export default function DOMDelegator(doc){
  if(!this instanceof DOMDelegator){
    return new DOMDelegator(doc);
  }

  doc = doc || $document;
  if(!doc.documentElement){
    throw new Error('[DOMDelegator]Invalid parameter "doc", should be a document object! given: ' + doc);
  }
  this.root = doc.documentElement;
  this.listenedEvents = getHash();
  this.eventDispatchers = getHash();
  this.globalListeners = getHash();
  this.domEvHandlerMap = new Map();
}
var proto = DOMDelegator.prototype;

prtoto.on = function on(el, evType, handler){
  var evStore = getEvStore(this.domEvHandlerMap, el, getHash());
  addListener(evStore, evType, handler);
  return this;
};

prtoto.off = function off(el, evType, handler){
  var evStore = getEvStore(this.domEvHandlerMap, el);
  if(!evStore) return this;
  if(arguments.length === 3){
    removeListener(evStore, evType, handler);
  }else if(arguments.length === 2){
    removeListener(evStore, evType);
  }

  if(arguments.length === 1 || Object.keys(evStore).length === 0){
    this.domEvHandlerMap.remove(el);
  }
  return this;
};

proto.addGlobalEventListener = function addGlobalEventListener(evType, handler){
  addListener(this.globalListeners, evType, handler);
  return this;
};
proto.removeGlobalEventListener = function removeGlobalEventListener(evType, handler){
  if(arguments.length === 2){
    removeListener(this.globalListeners, evType, handler);
  }else if(arguments.length === 1){
    removeListener(this.globalListeners, evType);
  } else{
    this.globalListeners = getHash();
  }
  
  return this;
};
proto.destroy = function destroy(){
  this.unlistenTo();
  this.listenedEvents = null;
  this.eventDispatchers = null;
  this.globalListeners = null;
  this.domEvHandlerMap.clear();
};

proto.listenTo = function listenTo(evType){
  if(!(evType in this.listenedEvents)){
    this.listenedEvents[evType] = 0;
  }
  this.listenedEvents[evType]++;

  if(this.listenedEvents[evType] !== 1){
    console.log('[DOMDelegator listenTo]event "' +
         evType + '" is already listened!');
    return ;
  }
  var listener = this.eventDispatchers[evType];
  if(!listener){
    listener = this.eventDispatchers[evType] = 
        createDispatcher(evType, this);
  }
  addEventListener(this.root, evType, listener);
  return this;
}

proto.unlistenTo = function unlistenTo(evType){
  var eventDispatchers = this.eventDispatchers,
      delegator = this;
  if(arguments.length === 0){
    Object.keys(eventDispatchers)
    .filter(function(evType){return !!eventDispatchers[evType];})
    .forEach(function(evType){
      delegator.unlistenTo(evType);
    });
    return this;
  }
  if(!(evType in this.listenedEvents) || this.listenedEvents[evType] === 0){
    console.log('[DOMDelegator unlistenTo]event "' + 
          evType + '" is already unlistened!');
    return;
  }
  this.listenedEvents[evType] = 0;
  var listener = this.eventDispatchers[evType];
  if(!listener){
    throw new Error("[DOMDelegator unlistenTo]: cannot " +
            "unlisten to " + evType);
  }
  removeEventListener(this.root, evType, listener);
  return this;
};

function createDispatcher(evType, delegator){
  var globalListeners = delegator.globalListeners,
      delegatorRoot = delegator.root;
  return function dispatcher(ev){
    var globalHandlers = globalListeners[evType] || [];
    if(globalHandlers && globalHandlers.length > 0){
      let globalEvent = new ProxyEvent(ev);
      globalEvent.target = delegatorRoot;
      callListeners(globalHandlers, globalEvent);
    }

    findAndInvokeListeners(ev.target, ev, evType, delegator);
  };
}

function findAndInvokeListeners(el, event, evType, delegator){
  var listener = getListener(el, evType, delegator);
  if(listener && listener.handlers.length > 0){
    let listenerEvent = new ProxyEvent(ev);
    listenerEvent.currentTarget = listener.currentTarget;
    callListeners(listener.handlers, listenerEvent);
    if(listenerEvent._bubbles){
      findAndInvokeListeners(listener.currentTarget.parentNode, ev, evType, delegator);
    }
  }
}

function getListener(target, evType, delegator){
  if(target == null){
    return null;
  }
  var evStore = getEvStore(delegator.domEvHandlerMap,target),
    handlers;
  if(!evStore || !(handlers = evStore[evType]) || handlers.length === 0){
    return getListener(target.parentNode, evType, delegator);
  }
  return {
    currentTarget: target,
    handlers: handlers
  };
}

function callListeners(handlers, ev){
  handlers.forEach(function(handler){
    if(type(handler) === 'function'){
      handler(ev);
    }else if(type(handler.handleEvent) === 'function'){
      handler.handleEvent(ev);
    }else{
      throw new Error("[DOMDelegator callListeners] unknown handler " +
                "found: " + JSON.stringify(handlers));
    }
  });
}
//helpers
function getEvStore(map, el, defaultStore){
  return arguments.length > 2 ? map.get(el, defaultStore): map.get(el);
}

function addListener(evHash, evType, handler){
  var handlers = evHash[evType] || [];
  if(handlers.indexOf(handler) === -1){
    handlers.push(handlers);
  }
  evHash[evType] = handlers;
  return handler;
}

function removeListener(evHash, evType, handler){
  var handlers = evHash[evType];
  if(!handlers || handlers.length === 0 || arguments.length === 2){
    delete evHash[evType];
    return handler;
  }
  var index = handlers.indexOf(handler);
  if(index !== -1){
    handlers.splice(1, index);
  }
  evHash[evType] = handlers;
  return handler;
}