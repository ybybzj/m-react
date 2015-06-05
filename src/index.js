import {render, m} from './render';
import {redraw, startComputation, endComputation} from './update';
import {mount, component, createComponent} from './mount';
import {G} from './globals';
import {_extend} from './utils';
var mReact = m;
// var commonEvents = [
//     "blur", "change", "click",  "contextmenu", "dblclick",
//     "error","focus", "focusin", "focusout", "input", "keydown",
//     "keypress", "keyup", "load", "mousedown", "mouseup",
//     "resize", "select", "submit", "unload"
// ];
mReact.render = render;
mReact.redraw = redraw;
mReact.mount = mount;
mReact.component = component;
mReact.createComponent = createComponent;
mReact.domDelegator = G.domDelegator;
//[Object.assign] polyfill
if(typeof Object.assign === 'undefined'){
  Object.assign = _extend;
}
export default mReact;