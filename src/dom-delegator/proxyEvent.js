var ALL_PROPS = [
    "altKey", "bubbles", "cancelable", "ctrlKey",
    "eventPhase", "metaKey", "relatedTarget", "shiftKey",
    "target", "timeStamp", "type", "view", "which"
];
var KEY_PROPS = ["char", "charCode", "key", "keyCode"];
var MOUSE_PROPS = [
    "button", "buttons", "clientX", "clientY", "layerX",
    "layerY", "offsetX", "offsetY", "pageX", "pageY",
    "screenX", "screenY", "toElement"
];

var rkeyEvent = /^key|input/;
var rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/;

export default ProxyEvent
class ProxyEvent{
  constructor(ev){
    if(!this instanceof ProxyEvent){
      return new ProxyEvent(ev);
    }
    if(rkeyEvent.test(ev.type)){
      return new KeyEvent(ev);
    }
    if(rmouseEvent.test(ev.type)){
      return new MouseEvent(ev);
    }

    for(let i = 0, l = ALL_PROPS.length; i<l;i++){
      let propKey = ALL_PROPS[i];
      this[propKey] = ev[propKey];
    }

    this.originalEvent = ev;
    this._bubbles = true;
  }

  preventDefault(){
    return this.originalEvent.preventDefault();
  }
  stopPropagation(){
    this._bubbles = false;
  }
}

class MouseEvent extends ProxyEvent{
  constructor(ev){
    super(ev);
    for(let i = 0, l = MOUSE_PROPS.length; i < l; i++){
      let mouseProp = MOUSE_PROPS[i];
      this[mouseProp] = ev[mouseProp];
    }
  }
}

class KeyEvent extends ProxyEvent{
  constructor(ev){
    super(ev);
    for(let i = 0, l = KEY_PROPS.length; i < l; i++){
      let keyProp = KEY_PROPS[i];
      this[keyProp] = ev[keyProp];
    }
  }
}