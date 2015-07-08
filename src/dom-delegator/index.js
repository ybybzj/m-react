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
import {type, getHash} from '../utils';
import {Map} from '../store';

export default function DOMDelegator(doc){
  if(!this instanceof DOMDelegator){
    return new DOMDelegator(doc);
  }

  doc = doc || $document || {documentElement: 1};//enable to run in nodejs;
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

proto.on = function on(el, evType, handler){
  var evStore = getEvStore(this.domEvHandlerMap, el, getHash());
  addListener(evStore, evType, this, handler);
  return this;
};

proto.off = function off(el, evType, handler){
  var evStore = getEvStore(this.domEvHandlerMap, el);
  if(!evStore){
    return this;
  }
  if(arguments.length >= 3){
    removeListener(evStore, evType, this, handler);
  }else if(arguments.length === 2){
    removeListener(evStore, evType, this);
  }else{
    removeAllListener(evStore, this);
  }

  if(Object.keys(evStore).length === 0){
    this.domEvHandlerMap.remove(el);
  }
  return this;
};

proto.addGlobalEventListener = function addGlobalEventListener(evType, handler){
  addListener(this.globalListeners, evType, this, handler);
  return this;
};
proto.removeGlobalEventListener = function removeGlobalEventListener(evType, handler){
  if(arguments.length >= 2){
    removeListener(this.globalListeners, evType, this, handler);
  }else if(arguments.length === 1){
    removeListener(this.globalListeners, evType, this);
  } else{
    removeAllListener(this.globalListeners, this);
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

//for each evType, increase by 1 if there is a new el start to listen
// to this type of event
proto.listenTo = function listenTo(evType){
  if(!(evType in this.listenedEvents)){
    this.listenedEvents[evType] = 0;
  }
  this.listenedEvents[evType]++;

  if(this.listenedEvents[evType] !== 1){
    return this;
  }
  var listener = this.eventDispatchers[evType];
  if(!listener){
    listener = this.eventDispatchers[evType] =
        createDispatcher(evType, this);
  }
  addEventListener(this.root, evType, listener);
  return this;
};
//for each evType, decrease by 1 if there is a el stop to listen
// to this type of event
proto.unlistenTo = function unlistenTo(evType){
  var eventDispatchers = this.eventDispatchers,
      delegator = this;
  if(arguments.length === 0){
    //remove all dispatch listeners
    Object.keys(eventDispatchers)
    .filter(function(etype){
      var rtn = !!eventDispatchers[etype];
      if(rtn){
        //force to call removeEventListener method
        eventDispatchers[etype] = 1;
      }
      return rtn;
    })
    .forEach(function(etype){
      delegator.unlistenTo(etype);
    });
    return this;
  }
  if(!(evType in this.listenedEvents) || this.listenedEvents[evType] === 0){
    console.log('[DOMDelegator unlistenTo]event "' +
          evType + '" is already unlistened!');
    return this;
  }
  this.listenedEvents[evType]--;
  if(this.listenedEvents[evType] > 0){
    return this;
  }
  var listener = this.eventDispatchers[evType];
  if(!listener){
    throw new Error('[DOMDelegator unlistenTo]: cannot ' +
            'unlisten to ' + evType);
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

function findAndInvokeListeners(el, ev, evType, delegator){
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
  var evStore = getEvStore(delegator.domEvHandlerMap, target),
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
      throw new Error('[DOMDelegator callListeners] unknown handler ' +
                'found: ' + JSON.stringify(handlers));
    }
  });
}
//helpers
function getEvStore(map, el, defaultStore){
  return arguments.length > 2 ? map.get(el, defaultStore): map.get(el);
}

function addListener(evHash, evType, delegator, handler){
  var handlers = evHash[evType] || [];
  if(handlers.length === 0){
    //it's first time for this el to listen to event of evType
    delegator.listenTo(evType);
  }
  if(handlers.indexOf(handler) === -1){
    handlers.push(handler);
  }
  evHash[evType] = handlers;
  return handler;
}

function removeListener(evHash, evType, delegator, handler){
  var handlers = evHash[evType];
  if(!handlers || handlers.length === 0 || arguments.length === 3){
    if(handlers && handlers.length){
      //this el stop to listen to event of evType
      delegator.unlistenTo(evType);
    }
    delete evHash[evType];
    return handler;
  }
  var index = handlers.indexOf(handler);
  if(index !== -1){
    handlers.splice(index, 1);
  }
  evHash[evType] = handlers;
  if(handlers.length === 0){
    //this el stop to listen to event of evType
    delegator.unlistenTo(evType);
    delete evHash[evType];
  }
  return handler;
}

function removeAllListener(evHash, delegator){
  Object.keys(evHash).forEach(function(evType){
    removeListener(evHash, evType, delegator);
  });
  return evHash;
}
