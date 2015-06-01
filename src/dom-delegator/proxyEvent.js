var EV_PROPS = {
  all: ["altKey", "bubbles", "cancelable", "ctrlKey", "eventPhase", "metaKey", "relatedTarget", "shiftKey", "target", "timeStamp", "type", "view", "which"],
  mouse: ["button", "buttons", "clientX", "clientY", "layerX", "layerY", "offsetX", "offsetY", "pageX", "pageY", "screenX", "screenY", "toElement"],
  key: ["char", "charCode", "key", "keyCode"]
};
var rkeyEvent = /^key|input/;
var rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/;
import {
  extend
}
from '../utils';
export default ProxyEvent

function ProxyEvent(ev) {
  if (!this instanceof ProxyEvent) {
    return new ProxyEvent(ev);
  }
  this.init(ev);

  if (rkeyEvent.test(ev.type)) {
    synthesizeEvProps(this, ev, 'key');
  }else if (rmouseEvent.test(ev.type)) {
    synthesizeEvProps(this, ev, 'mouse');
  }
}
ProxyEvent.prototype = extend(ProxyEvent.prototype, {
  init: function(ev) {
    synthesizeEvProps(this, ev, 'all');
    this.originalEvent = ev;
    this._bubbles = true;
  },
  preventDefault: function() {
    return this.originalEvent.preventDefault();
  },
  stopPropagation: function() {
    this._bubbles = false;
  }
});

function synthesizeEvProps(proxy, ev, category) {
  var evProps = EV_PROPS[category];
  for (let i = 0, l = evProps.length; i < l; i++) {
    let prop = evProps[i];
    proxy[prop] = ev[prop];
  }
}
