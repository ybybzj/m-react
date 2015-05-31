import {
  document as $document,
  G
} from '../globals';
import build from './build';
import clear from './clear';

export default render;

var html;
var documentNode = {
  appendChild: function(node){
    if(html === undefined) html = $document.createElement('html');
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
function render(root, vNode, forceRecreation){
  
  if(!root){
    throw new Error('Ensure the DOM element being passed to m.route/m.mount/m.render is not undefined.');
  }
  var configs = [],
      isDocumentRoot = root === $document,
      domNode = isDocumentRoot || root === $document.documentElement ? documentNode : root,
      vNodeCache = domCacheMap.get(domNode);
  if(isDocumentRoot && vNode.tag !== 'html') {
    vNode = {tag: 'html', attrs: {}, children: vNode};
  }
  if(vNodeCache === undefined){
    clear(domNode.childNodes);
  }
  if(forceRecreation){
    reset(domNode);
  }
  vNodeCache = build(domNode, null, undefined, undefined, vNode, vNodeCache, false, 0, null, undefined, configs);
  configs.forEach(function(onRender){
    onRender();
  });
  domCacheMap.set(domNode, vNodeCache);
}

//helpers
// function getVNodeKey(element){
//   var index = domNodeCache.indexOf(element);
//   return index < 0 ? domNodeCache.push(element) - 1 : index;
// }

function reset(root){
  clear(root.childNodes, domCacheMap.get(root));
  domCacheMap.remove(root);
}