import {slice, NOOP} from '../utils';
function parameterize(component, args) {
  var controller = function() {
    return (component.controller || NOOP).apply(this, args) || this;
  };
  if(component.controller) controller.prototype = component.controller.prototype;
  var view = function(ctrl) {
    if (arguments.length > 1) { args = args.concat(slice(arguments, 1)); }
    return component.view.apply(component, args.length ? [ctrl].concat(args) : [ctrl]);
  };
  view.$original = component.view;
  var output = {controller: controller, view: view};
  if (args[0] && args[0].key != null) { output.attrs = {key: args[0].key}; }
  return output;
}

export default function componentize(component) {
  return parameterize(component, slice(arguments, 1));
}
