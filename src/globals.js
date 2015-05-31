import {gettersetter} from './utils';
import {Map} from './store';
import DOMDelegator from './dom-delegator';
export var global = window || this;
export var document = global.document;
export var G = {
  pendingRequests: 0,
  forcing: false,
  unloaders: [],
  updateStrategy: gettersetter(),
  computePreRedrawHook : null,
  computePostRedrawHook : null,
  //mount registries
  roots: [],
  components: [],
  controllers: [],
  //render registries
  domCacheMap: new Map(),
  domDelegator: new DOMDelegator()
};