import {
  G
} from '../globals';

import {
  redraw,
  startComputation,
  endComputation,
  endFirstComputation
} from '../update';

import componentize from './component';
import {slice, NOOP} from '../utils';

var topComponent;

export default function mount(root, component) {
  if (!root) throw new Error("Please ensure the DOM element exists before rendering a template into it.");
  var index = G.roots.indexOf(root);
  if (index < 0) index = G.roots.length;
  
  var isPrevented = false;
  var event = {
    preventDefault: function() {
      isPrevented = true;
      G.computePreRedrawHook = G.computePostRedrawHook = null;
    }
  };
  for (let i = 0, unloader; unloader = G.unloaders[i]; i++) {
    unloader.handler.call(unloader.controller, event);
    unloader.controller.onunload = null;
  }

  if (isPrevented) {
    for (let i = 0, unloader; unloader = G.unloaders[i]; i++) unloader.controller.onunload = unloader.handler;
  }
  else G.unloaders = [];
  
  if (G.controllers[index] && type(G.controllers[index].onunload) === 'function') {
    G.controllers[index].onunload(event);
  }
  
  if (!isPrevented) {
    redraw.strategy("all");
    startComputation();
    G.roots[index] = root;
    if (arguments.length > 2) component = componentize(component, slice(arguments, 2));
    let currentComponent = topComponent = component = component || {controller: NOOP};
    let constructor = component.controller || NOOP;
    let controller = new constructor;
    //controllers may call m.mount recursively (via m.route redirects, for example)
    //this conditional ensures only the last recursive m.mount call is applied
    if (currentComponent === topComponent) {
      G.controllers[index] = controller;
      G.components[index] = component;
    }
    endFirstComputation();
    return G.controllers[index];
  }
};