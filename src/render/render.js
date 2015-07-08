import {
  document as $document,
  G
} from '../globals';
import build from './build';
import clear from './clear';

export {render};
function render(root, vNode, forceRecreation, force){
  var task = {
    root: root,
    vNode: vNode,
    forceRecreation: forceRecreation
  };
  if(force === true){
    return _render(task);
  }
  G.renderQueue.addTarget({
    mergeType: 1,// replace
    root: root,
    processor: _render,
    params: [task]
  });
}
var html;
var documentNode = {
  appendChild: function(node){
    if(html === undefined) { html = $document.createElement('html'); }
    if($document.documentElement && $document.documentElement !== node){
      $document.replaceChild(node, $document.documentElement);
    }else{
      $document.appendChild(node);
    }
    this.childNodes = $document.childNodes;
  },
  insertBefore: function(node){
    this.appendChild(node);
  },
  childNodes: []
};
// var domNodeCache = [], vNodeCache = Object.create(null);
var domCacheMap = G.domCacheMap;
function _render(task){
  var {root, vNode, forceRecreation} = task;
  if(!root){
    throw new Error('Ensure the DOM element being passed to m.route/m.mount/m.render is not undefined.');
  }
  var configs = [],
      isDocumentRoot = root === $document || root === $document.documentElement,
      domNode = isDocumentRoot ? documentNode : root,
      vNodeCache;
  if(isDocumentRoot && vNode.tag !== 'html') {
    vNode = {tag: 'html', attrs: {}, children: vNode};
  }

  if(forceRecreation){
    reset(domNode);
  }
  vNodeCache = build(domNode, null, undefined, undefined, vNode, domCacheMap.get(domNode), false, 0, null, undefined, configs);
  configs.forEach(function(onRender){
    onRender();
  });
  domCacheMap.set(domNode, vNodeCache);
}

function reset(root){
  clear(root.childNodes, domCacheMap.get(root));
  domCacheMap.remove(root);
}
