import {gettersetter} from './utils';
export var global = window || this;
export var document = global.document;
// export var pendingRequests = gettersetter();
// export var forcing = gettersetter(false);
// export var unloaders = [];
// export var updateStrategy = gettersetter();
// export var roots = [];
// export var components = [];
// export var controllers = [];
export var G = {
  pendingRequests: 0,
  forcing: false,
  unloaders: [],
  updateStrategy: gettersetter(),
  computePreRedrawHook : null,
  computePostRedrawHook : null,
  roots: [],
  components: [],
  controllers: []
};