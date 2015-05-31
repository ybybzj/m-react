import { type, NOOP } from '../utils';
import {G} from '../globals';
var domCacheMap = G.domCacheMap;
var domDelegator = G.domDelegator;
export default function clear(domNodes, vNodes) {
  vNodes = vNodes || [];
  vNodes = [].concat(vNodes);
  for (let i = domNodes.length - 1; i > -1; i--) {
    if (domNodes[i] && domNodes[i].parentNode) {
      if (vNodes[i]) unload(vNodes[i]);// cleanup before dom is removed from dom tree
      domDelegator.off(domNodes[i]);
      domCacheMap.remove(domNodes[i]);
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
    for (let i = 0, controller; controller = vNode.controllers[i]; i++) {
      if (type(controller.onunload) === 'function') controller.onunload({
        preventDefault: NOOP
      });
    }
  }
  if (vNode.children) {
    if (type(vNode.children) === 'array') {
      for (let i = 0, child; child = vNode.children[i]; i++) unload(child);
    } else if (vNode.children.tag) {
      unload(vNode.children);
    }
  }
}