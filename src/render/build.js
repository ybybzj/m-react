import { type, NOOP } from '../utils';
import clear from './clear';
import {
  document as $document,
  G
} from '../globals';
import setAttributes from './setAttributes';
//`build` is a recursive function that manages creation/diffing/removal of DOM elements based on comparison between `data` and `cached`
//the diff algorithm can be summarized as this:
//1 - compare `data` and `cached`
//2 - if they are different, copy `data` to `cached` and update the DOM based on what the difference is
//3 - recursively apply this algorithm for every array and for the children of every virtual element
//the `cached` data structure is essentially the same as the previous redraw's `data` data structure, with a few additions:
//- `cached` always has a property called `nodes`, which is a list of DOM elements that correspond to the data represented by the respective virtual element
//- in order to support attaching `nodes` as a property of `cached`, `cached` is *always* a non-primitive object, i.e. if the data was a string, then cached is a String instance. If data was `null` or `undefined`, cached is `new String("")`
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
//- this prevents lifecycle surprises from procedural helpers that mix implicit and explicit return statements (e.g. function foo() {if (cond) return m("div")}
//- it simplifies diffing code
//data.toString() might throw or return null if data is the return value of Console.log in Firefox (behavior depends on version)
var VOID_ELEMENTS = /^(AREA|BASE|BR|COL|COMMAND|EMBED|HR|IMG|INPUT|KEYGEN|LINK|META|PARAM|SOURCE|TRACK|WBR)$/;
export default function build(parentElement, parentTag, parentCache, parentIndex, data, cached, shouldReattach, index, editable, namespace, configs) {
  //data.toString() might throw or return null if data is the return value of Console.log in firefox (behavior depends on version)
  try {
    if (data == null || data.toString() == null) {
      data = "";
    }
  } catch (_) {
    data = "";
  }
  if (data.subtree === 'retain') return cached;
  var cachedType = type(cached),
    dataType = type(data),
    intact;
  if (cached == null || cachedType !== dataType) { // validate cached
    cached = validateCached(data, cached, index, parentIndex, parentCache, dataType);
  }
  if (dataType === 'array') { // children diff
    data = _recursiveFlatten(data);
    intact = cached.length === data.length;
    cached = diffChildrenWithKey(data, cached, parentElement);
    cached = diffArrayItem(data, cached, parentElement, parentTag, index, shouldReattach, intact, editable, namespace, configs);
  } else if (data != null && dataType === 'object') { // attributes diff
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
  cached = new data.constructor;
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
  var exsiting = {}, shouldMaintainIdentities = false;
  // 1)
  cached.forEach(function(cachedNode, idx) {
    let key = _key(cachedNode);
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
  if (data.some(function(dataNode) {
    var key = _key(dataNode);
    //normarlize key
    _normalizeKey(dataNode, key);
    return key !== undefined;
  })) {
    data.forEach(function(dataNode) {
      if (dataNode && dataNode.attrs && dataNode.attrs.key == null) {
        dataNode.attrs.key = "__mithril__" + (guid++);
      }
    });
  }
  if (shouldMaintainIdentities && _isKeysDiffer(data, cached)) {
    // 2), 3)
    data.forEach(_dataNodeToExisting);
    // 4)
    let changes, newCached = new Array(cached.length);
    changes = Object.keys(existing).map(function(key){return existing[key];}).sort(function(a,b){
      return a.action - b.action || a.index - b.index;
    });
    newCached.nodes = cached.nodes.slice();

    changes.forEach(_applyChanges);
    cached = newCached;
  }
  return cached;
  //helpers
  function _isKey(key) {
    return type(key) === 'string' || (type(key) === 'number' && type(key) !== 'NaN');
  }

  function _key(nodeItem) {
    return (nodeItem && nodeItem.attrs && _isKey(nodeItem.attrs.key)) ? nodeItem.attrs.key : undefined;
  }
  function _normalizeKey(node, key){
    if(!node || !node.attrs) return;
    if(key === undefined){
      delete node.attrs.key;
    }else{
      node.attrs.key = key;
    }
  }

  function _isKeysDiffer(data, cached) {
    if (data.length !== cached.length) return true;
    return data.some(function(dataNode, idx) {
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
      }else{
        let fromIdx = existing[key].index;
        existing[key] = {
          action: MOVE,
          index: nodeIdx,
          from: fromIdx,
          element: cached.nodes[fromIdx] || $document.createElement('div')
        };
      }
    }
  }

  function _applyChanges(change){
    var changeIdx = change.index,
        action = action;
    if(action === DELETION){
      clear(cached[changeIdx].nodes, cached[changeIdx]);
      newCached.splice(changeIdx, 1);
    }
    if(action === INSERTION){
      let dummy = $document.createElement('div');
      dummy.key = data[changeIdx].attrs.key;
      parentElement.insertBefore(dummy, parentElement.childNodes[changeIdx] || null);
      newCached.splice(changeIdx, 0, {
        attrs :{key: dummy.key}, nodes:[dummy]
      });
      newCached.nodes[changeIdx] = dummy;
    }

    if(action === MOVE){
      if(parentElement.childNodes[changeIdx] !== change.element && change.element !== null){
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
  if(!intact){
    //diff the array itself
    
    //update the list of DOM nodes by collecting the nodes from each item
    for (let i = 0, len = data.length; i < len; i++) {
      if (cached[i] != null) nodes.push.apply(nodes, cached[i].nodes);
    }
    //remove items from the end of the array if the new array is shorter than the old one
    //if errors ever happen here, the issue is most likely a bug in the construction of the `cached` data structure somewhere earlier in the program
    for (let i = 0, node; node = cached.nodes[i]; i++) {
      if (node.parentNode != null && nodes.indexOf(node) < 0) clear([node], [cached[i]]);
    }
    if (data.length < cached.length) cached.length = data.length;
    cached.nodes = nodes;
  }
  return cached;
  //helpers
  function _diffBuildItem(dataNode){
    var item = build(parentElement, parentTag, cached, index, dataNode, cached[cacheCount], shouldReattach, index + subArrayCount || subArrayCount, editable, namespace, configs);
    if(item === undefined) return;
    if(!item.nodes.intact) intact = false;
    if(item.$trusted){
      //fix offset of next element if item was a trusted string w/ more than one html element
      //the first clause in the regexp matches elements
      //the second clause (after the pipe) matches text nodes
      subArrayCount += (item.match(/<[^\/]|\>\s*[^<]/g) || [0]).length;
    }else{
      subArrayCount += type(item) === 'array' ? item.length : 1;
    }
    cached[cacheCount++] = item;
  }
}

function diffVNode(data, cached, parentElement, index, shouldReattach, editable, namespace, configs) {
  var views = [], controllers = [];
  //handle the situation that vNode is a component({view, controller});
  while(data.view){
    let view = data.view.$original || data.view;
    let controllerIndex = G.updateStrategy() == "diff" && cached.views ? cached.views.indexOf(view) : -1;
    let controller = controllerIndex > -1 ? cached.controllers[controllerIndex] : new (data.controller || NOOP);
    let key = data && data.attrs && data.attrs.key;
    data = (G.pendingRequests == 0 || G.forcing) || (cached && cached.controllers && cached.controllers.indexOf(controller) > -1) ? data.view(controller) : {tag: "placeholder"};
    if (data.subtree === "retain") return cached;
    if (key) {
      if (!data.attrs) data.attrs = {};
      data.attrs.key = key;
    }
    if (controller.onunload) G.unloaders.push({controller: controller, handler: controller.onunload});
    views.push(view);
    controllers.push(controller);
  }

  //the result of view function must be a sigle root vNode,
  //not a array or string
  if(!data.tag && controllers.length) throw new Error('Component template must return a virtual element, not an array, string, etc.');
  if(!data.attrs) data.attrs = {};
  if(!cached.attrs) cached.attrs = {};

  //if an element is different enough from the one in cache, recreate it
  if(
      data.tag != cached.tag ||
      !_hasSameKeys(data.attrs, cached.attrs)||
      data.attrs.id != cached.attrs.id ||
      data.attrs.key != cached.attrs.key ||
      (G.updateStrategy() == "all" && (!cached.configContext || cached.configContext.retain !== true)) ||
      (G.updateStrategy() == "diff" && cached.configContext && cached.configContext.retain === false)
    ){
    if (cached.nodes.length) clear(cached.nodes, cached);
    // if (cached.configContext && type(cached.configContext.onunload) === 'function') cached.configContext.onunload();
    // if (cached.controllers) {
    //   for (let i = 0, controller; controller = cached.controllers[i]; i++) {
    //     if (type(controller.onunload) === 'function') controller.onunload({preventDefault: NOOP});
    //   }
    // }
  }

  if(type(data.tag) !== 'string') return;

  var isNew = (cached.nodes.length === 0),
      dataAttrKeys = Object.keys(data.attrs),
      hasKeys = dataAttrKeys.length > ("key" in data.attrs ? 1 : 0),
      domNode;
  if (data.attrs.xmlns) namespace = data.attrs.xmlns;
  else if (data.tag === "svg") namespace = "http://www.w3.org/2000/svg";
  else if (data.tag === "math") namespace = "http://www.w3.org/1998/Math/MathML";

  if(isNew){
    if (data.attrs.is) domNode = namespace === undefined ? $document.createElement(data.tag, data.attrs.is) : $document.createElementNS(namespace, data.tag, data.attrs.is);
    else domNode = namespace === undefined ? $document.createElement(data.tag) : $document.createElementNS(namespace, data.tag);
    cached = {
      tag: data.tag,
      //set attributes first, then create children
      attrs: hasKeys ? setAttributes(domNode, data.tag, data.attrs, {}, namespace) : data.attrs,
      children: data.children != null && data.children.length > 0 ?
        build(domNode, data.tag, undefined, undefined, data.children, cached.children, true, 0, data.attrs.contenteditable ? domNode : editable, namespace, configs) :
        data.children,
      nodes: [domNode]
    };
    if (controllers.length) {
      cached.views = views;
      cached.controllers = controllers;
      for (let i = 0, controller; controller = controllers[i]; i++) {
        if (controller.onunload && controller.onunload.$old) controller.onunload = controller.onunload.$old;
        if (G.pendingRequests && controller.onunload) {
          let onunload = controller.onunload;
          controller.onunload = NOOP;
          controller.onunload.$old = onunload;
        }
      }
    }
    
    if (cached.children && !cached.children.nodes) cached.children.nodes = [];
    //edge case: setting value on <select> doesn't work before children exist, so set it again after children have been created
    if (data.tag === "select" && "value" in data.attrs) setAttributes(domNode, data.tag, {value: data.attrs.value}, {}, namespace);
    parentElement.insertBefore(domNode, parentElement.childNodes[index] || null);
  }else{
    domNode = cached.nodes[0];
    if (hasKeys) setAttributes(domNode, data.tag, data.attrs, cached.attrs, namespace);
    cached.children = data.children != null && data.children.length > 0 ?
        build(domNode, data.tag, undefined, undefined, data.children, cached.children, false, 0, data.attrs.contenteditable ? domNode : editable, namespace, configs) :
        data.children;
    cached.nodes.intact = true;
    if (controllers.length) {
      cached.views = views;
      cached.controllers = controllers;
    }
    if (shouldReattach === true && domNode != null) parentElement.insertBefore(domNode, parentElement.childNodes[index] || null);
  }
  //schedule configs to be called. They are called after `build` finishes running
  if (type(data.attrs.config) === 'function') {
    let context = cached.configContext = cached.configContext || {};

    // bind
    let callback = function(data, args) {
      return function() {
        return data.attrs.config.apply(data, args);
      };
    };
    configs.push(callback(data, [domNode, !isNew, context, cached]));
  }
  return cached;
}

function diffTextNode(data, cached, parentElement,parentTag, index, shouldReattach, editable) {
  //handle text nodes
  var nodes;
  if (cached.nodes.length === 0) {
    if (data.$trusted) {
      nodes = injectHTML(parentElement, index, data);
    }
    else {
      nodes = [$document.createTextNode(data)];
      if (!parentElement.nodeName.match(VOID_ELEMENTS)) parentElement.insertBefore(nodes[0], parentElement.childNodes[index] || null);
    }
    cached = "string number boolean".indexOf(typeof data) > -1 ? new data.constructor(data) : data;
    cached.nodes = nodes;
  }else if (cached.valueOf() !== data.valueOf() || shouldReattach === true) {
    nodes = cached.nodes;
    if (!editable || editable !== $document.activeElement) {
      if (data.$trusted) {
        clear(nodes, cached);
        nodes = injectHTML(parentElement, index, data);
      }
      else {
        //corner case: replacing the nodeValue of a text node that is a child of a textarea/contenteditable doesn't work
        //we need to update the value property of the parent textarea or the innerHTML of the contenteditable element instead
        if (parentTag === "textarea") parentElement.value = data;
        else if (editable) editable.innerHTML = data;
        else {
          if (nodes[0].nodeType === 1 || nodes.length > 1) { //was a trusted string
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
  }
  else cached.nodes.intact = true;
  return cached;
}

//helpers
function _recursiveFlatten(arr) {
  for (let i = 0; i < arr.length; i++) { // arr may be modified, ex. nodelist
    if (type(arr[i]) === 'array') {
      arr = arr.concat.apply([], arr);
      i--; //check current index again and flatten until there are no more nested arrays at that index
    }
  }
  return arr;
}
function _hasSameKeys(o1, o2){
  var o1Keys = Object.keys(o1).sort().join(),
      o2Keys = Object.keys(o2).sort().join();
  return o1Keys === o2Keys;
}
function injectHTML(parentElement, index, data){
  var nextSibling = parentElement.childNodes[index];
  if(nextSibling){
    let isElement = nextSibling.nodeType !== 1;
    let placeholder = $document.createElement('span');
    if(isElement){
      parentElement.insertBefore(placeholder, nextSibling || null);
      placeholder.insertAdjacentHTML('beforebegin', data);
      parentElement.removeChild(placeholder);
    }else{
      nextSibling.insertAdjacentHTML('beforebegin', data);
    }
  }else{
    parentElement.insertAdjacentHTML('beforeend', data);
  }
  var nodes = [], childNode;
  while((childNode = parentElement.childNodes[index++]) !== nextSibling){
    nodes.push(childNode);
  }
  return nodes;
}