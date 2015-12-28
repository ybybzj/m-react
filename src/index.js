import {render, m} from './render/index';
import {redraw} from './update/index';
import {mount, component, createComponent} from './mount/index';
import {G} from './globals';
import {_extend} from './utils';
var mReact = m;

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
