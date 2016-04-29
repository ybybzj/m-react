import {
  G
} from '../globals';

import {
  redraw
} from '../update/index';

import {type, NOOP} from '../utils';

var topComponent;

export default function mount(root, component, forceRecreation, isSync) {
  if (!root) {
    throw new Error('Please ensure the DOM element exists before rendering a template into it.');
  }
  var index = G.roots.indexOf(root);
  if (index < 0) { index = G.roots.length; }


  G.unloaders.each(function(unloader, controller){
    unloader.call(controller);
    controller.onunload = null;
  });

  G.unloaders.clear();

  if (G.controllers[index] && type(G.controllers[index].onunload) === 'function') {
    G.controllers[index].onunload();
  }

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
  redraw(isSync);
  return G.controllers[index];
}
