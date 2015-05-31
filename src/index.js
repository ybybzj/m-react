import {render, m} from './render';
import {redraw, startComputation, endComputation} from './update';
import {mount, component, createComponent} from './mount';
import {G} from './globals';
var mReact = m;
var commonEvents = [
    "blur", "change", "click",  "contextmenu", "dblclick",
    "error","focus", "focusin", "focusout", "input", "keydown",
    "keypress", "keyup", "load", "mousedown", "mouseup",
    "resize", "select", "submit", "unload"
];
mReact.render = render;
mReact.redraw = redraw;
mReact.mount = mount;
mReact.component = component;
mReact.createComponent = createComponent;
var startEventlistening = false;
mReact.startEventDelegation = function(eventNames){
  if(startEventlistening === true) return;
  eventNames = eventNames || commonEvents;
  for(let i= 0, l = eventNames.length; i < l; i++){
    G.domDelegator.listenTo(eventNames[i]);
  }
  startEventlistening = true;
};
mReact.stopEventDelegation = function(){
  G.domDelegator.unlistenTo();
  startEventlistening = false;
}
export default mReact;