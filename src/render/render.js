import {document as $document} from '../globals';
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
var domNodeCache = [], vNodeCache = Object.create(null);

function render(root, vNode, forceRecreation){
  var configs = [];
  if(!root){
    throw new Error('Ensure the DOM element being passed to m.route/m.mount/m.render is not undefined.');
  }

  var id = getVNodeKey(root),
      isDocumentRoot = root === $document,
      domNode = isDocumentRoot || root === $document.documentElement ? documentNode : root;
  if(isDocumentRoot && vNode.tag !== 'html') {
    vNode = {tag: 'html', attrs: {}, children: vNode};
  }
  if(vNodeCache[id] === undefined){
    clear(domNode.childNodes);
  }
  if(forceRecreation){
    reset(root);
  }
  vNodeCache[id] = build(domNode, null, undefined, undefined, vNode, vNodeCache[id], false, 0, null, undefined, configs);
  configs.forEach(function(onRender){
    onRender();
  });
}

//helpers
function getVNodeKey(element){
  var index = domNodeCache.indexOf(element);
  return index < 0 ? domNodeCache.push(element) - 1 : index;
}

function reset(root){
  var cacheKey = getVNodeKey(root);
  clear(root.childNodes, vNodeCache[cacheKey]);
  vNodeCache[cacheKey] = undefined;
}