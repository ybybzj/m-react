import {render, m} from './render';
import {redraw, startComputation, endComputation} from './update';
import {mount, component, createComponent} from './mount';
import {G} from './globals';
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
export default mReact;