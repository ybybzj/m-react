import {
  G
} from '../globals';

import {
  redraw
} from '../update';

import {type, NOOP} from '../utils';

var topComponent;

export default function mount(root, component, forceRecreation) {
  if (!root) {
    throw new Error('Please ensure the DOM element exists before rendering a template into it.');
  }
  var index = G.roots.indexOf(root);
  if (index < 0) { index = G.roots.length; }

  var isPrevented = false;
  var event = {
    preventDefault: function() {
      isPrevented = true;
      G.computePreRedrawHook = G.computePostRedrawHook = null;
    }
  };
  G.unloaders.each(function(unloader, controller){
    unloader.call(controller, event);
    controller.onunload = null;
  });

  if (isPrevented) {
    G.unloaders.each(function(unloader, controller){
      controller.onunload = unloader;
    });
  }
  else { G.unloaders.clear(); }

  if (G.controllers[index] && type(G.controllers[index].onunload) === 'function') {
    G.controllers[index].onunload(event);
  }

  if (!isPrevented) {
    G.roots[index] = root;
    let currentComponent = topComponent = component = component || {controller: NOOP};
    let constructor = component.controller || NOOP;
    let controller = new constructor();
    //controllers may call m.mount recursively (via m.route redirects, for example)
    //this conditional ensures only the last recursive m.mount call is applied
    if (currentComponent === topComponent) {
      G.controllers[index] = controller;
      G.components[index] = component;
      G.recreations[index] = forceRecreation;
    }
    redraw();
    return G.controllers[index];
  }
}
