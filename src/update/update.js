import {type} from '../utils';
import {
  G
} from '../globals';
import {render} from '../render';

import {requestAnimationFrame as raf, cancelAnimationFrame as cancelRaf} from './raf';
var redrawing = false, lastRedrawId = null;
export default function update(force) {
  if (redrawing) return;
  redrawing = true;
  if (force) G.forcing = true;
  //lastRedrawId is a positive number if a second redraw is requested before the next animation frame
  //lastRedrawID is null if it's the first redraw and not an event handler
  if (lastRedrawId && force !== true) {
    if (lastRedrawId > 0) cancelRaf(lastRedrawId);
    lastRedrawId = raf(_updateRoots);
  }
  else {
    _updateRoots();
    lastRedrawId = raf(function() {lastRedrawId = null});
  }
  redrawing = false;
  G.forcing = false;
};
function _updateRoots(){
  var root, component, controller;
  if(type(G.computePreRedrawHook) === 'function'){
    G.computePreRedrawHook();
    G.computePreRedrawHook = null;
  }
  for(let i = 0, l = G.roots.length; i < l ; i++){
    root = G.roots[i];
    component = G.components[i];
    controller = G.controllers[i];
    if(controller){
      let args = component.controller && component.controller.$$args ? [controller].concat(component.controller.$$args) : [controller];
      render(root, component.view ? component.view.apply(component,args) : '');
    }
  }

  if(type(G.computePostRedrawHook) === 'function'){
    G.computePostRedrawHook();
    G.computePostRedrawHook = null;
  }
  G.updateStrategy('diff');
  lastRedrawId = null;
}