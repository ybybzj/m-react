import {type} from '../utils';
import {
  G
} from '../globals';
import {render} from '../render/render';

//global render queue setting
var renderQueue = G.renderQueue.onFinish(_onFinish);
var redrawing = false;
export default function update(force) {
  if (redrawing === true) { return; }
  redrawing = true;
  if (force === true) { G.forcing = true; }
  _updateRoots(force);
  redrawing = false;
}
function _updateRoots(force){
  var root, component, controller, needRecreation;
  if(renderQueue.length() === 0 || force === true){
    if(type(G.computePreRedrawHook) === 'function'){
      G.computePreRedrawHook();
      G.computePreRedrawHook = null;
    }
  }
  if(renderQueue.length() > 0){
    renderQueue.stop();
  }
  for(let i = 0, l = G.roots.length; i < l; i++){
    root = G.roots[i];
    component = G.components[i];
    controller = G.controllers[i];
    needRecreation = G.recreations[i];
    if(controller){
      if(typeof controller.instance === 'object'){
      //   // controller.instance.redraw = function componentRedraw(){
      //   //   renderQueue.addTarget({
      //   //     mergeType: 0,// contain
      //   //     processor: _render,
      //   //     root: root,
      //   //     params:[{
      //   //       root: root,
      //   //       vNode: component.view ? component.view(controller) : '',
      //   //       forceRecreation: false
      //   //     }]
      //   //   });
      //   // };
        controller.instance.viewFn = [component.view, controller];
      }
      render(root, component.view ? component.view(controller) : '', needRecreation, force);
    }
    //reset back to not destroy root's children
    G.recreations[i] = void 0;
  }
  if(force === true){
    _onFinish();
    G.forcing = false;
  }
}

function _onFinish(){
  if(type(G.computePostRedrawHook) === 'function'){
    G.computePostRedrawHook();
    G.computePostRedrawHook = null;
  }
}
