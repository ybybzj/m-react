import {Map} from './store';
import DOMDelegator from './dom-delegator';
import Batch from './update/batch';
export var global = typeof window !== 'undefined' ? window : {};
export var document = global.document;
export var runtime = (typeof process !== 'undefined' && !process.browser) ? 'nodejs' : typeof window !== 'undefined' ? 'browser' : 'unknown';
export var G = {
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
