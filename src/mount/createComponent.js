// import * as update from '../update';
import {type, extend, slice, removeVoidValue, toArray} from '../utils';
import {runtime as RT, G} from '../globals';
import build from '../render/build';
var extendMethods = ['componentWillMount', 'componentDidMount', 'componentWillUpdate','componentDidUpdate', 'componentWillUnmount', 'componentWillDetached', 'componentWillReceiveProps','getInitialProps', 'getInitialState'];
var pipedMethods = ['getInitialProps', 'getInitialState', 'componentWillReceiveProps'];
var ignoreProps = ['setState', 'mixins','onunload', 'setInternalProps','redraw'];

class Component{
  constructor(props, children){
    if(type(props) !== 'object' && props != null){
      throw new TypeError('[Component]param for constructor should a object or null or undefined! given: ' + props);
    }
    this.props = props || {};
    this.props.children = toArray(children);
    this.root = null;
    // this.state = {};
    if(this.getInitialProps){
      this.props = this.getInitialProps(this.props);
    }
    if(this.getInitialState){
      this.state = this.getInitialState(this.props);
    }
  }
  setProps(props, children){
    if(this.componentWillReceiveProps){
      props = this.componentWillReceiveProps(props);
    }
    this.props = removeVoidValue(extend(this.props, props, {children: toArray(children)}));
  }
  onunload(fn){
    if(type(fn) === 'function'){
      fn.call(this);
    }
    this.root = null;
    this.cached = null;
    this.redrawData = null;
  }
  setInternalProps(rootEl, cached, redrawData){
    this.root = rootEl;
    this.cached = cached;
    this.redrawData = redrawData;
  }
  // getInitialProps(props){

  // }

  // render(props, states){

  // }
  // getInitialState(props){

  // }
  // componentDidMount(el){

  // }
  // shouldComponentUpdate(){
    
  // }

  // componentDidUpdate(){

  // }
  // componentWillReceiveProps(){

  // }
  // componentWillUnmount(e){

  // }
  // componentWillDetached(el){

  // }
  redraw(){
    if(typeof this.redrawData == null) return;
    var instance = this;
    
    G.renderQueue.addTarget({
      mergeType: 0,// contain
      processor: _build,
      root: instance.root,
      params:[instance]
    });
  }

  setState(state, silence){
    if(this.state == null) this.state = {};
    this.state = extend(this.state, state);
    if(!silence && RT === 'browser'){
      this.redraw();
    }
  }
};
function _build(instance){
  var viewFn = instance.viewFn,
      data = viewFn[0](viewFn[1]),
      [parentElement,index,editable,namespace] = instance.redrawData,
      configs = [];
  if(instance.props.key != null){
      data.attrs = data.attrs || {};
      data.attrs.key = key;
    }
  
  instance.cached = build(parentElement, null, undefined, undefined, data, instance.cached, false, index, editable, namespace, configs);
  for(let i = 0, l= configs.length; i < l; i++){
    configs[i]();
  }
}
export default function createComponent(options){
  if(type(options) !== 'object'){
    throw new TypeError('[createComponent]param should be a object! given: ' + options);
  }
  var component = {},
      factory = createComponentFactory(options);
  component.controller = function(props, children){
    var instance = new factory(props, children);
    var ctrl = {
      instance: instance
    };
    ctrl.onunload = instance.onunload.bind(instance, instance.componentWillUnmount);
    if(type(instance.name) === 'string'){
      ctrl.name = instance.name;
    }
    return ctrl;
  };
  
  component.view = makeView();
  return component;
}


function mixinProto(proto, mixins){
  var mixin;
  if(type(mixins) !== 'array'){
    mixins = slice(arguments, 1);
  }
  mixins = mixins.filter(function(m){return type(m) === 'object';});
  while(mixins.length > 0){
    mixin = mixins.shift();
    Object.keys(mixin).forEach(function(propName){
      if(propName === 'mixins'){
        mixins = _addToHead([].concat(mixin[propName]), mixins);
        return;
      }
      if(ignoreProps.indexOf(propName) !== -1){
        return;
      }
      if(extendMethods.indexOf(propName) !== -1){
        if(type(proto[propName]) === 'array'){
          proto[propName].push(mixin[propName]);
        }else{
          proto[propName] = type(proto[propName]) === 'function' ? [proto[propName], mixin[propName]] : [mixin[propName]];
        }
        return;
      }
      proto[propName] = mixin[propName];
    });
  }

  extendMethods.forEach(function(methodName){
    if(type(proto[methodName]) === 'array'){
      var methods = proto[methodName].filter(function(p){
        return type(p) === 'function';
      });
      proto[methodName] = _compose(pipedMethods.indexOf(methodName) !== -1,methods);
    }
  });
}
function createComponentFactory(options){
  var factory = function ComponentFactory(){
    Component.apply(this,arguments);
    _bindOnMethods(factory.prototype, this);
  }, mixins;
  factory.prototype = Object.create(Component.prototype);

  mixins = options.mixins || [];
  delete options.mixins;
  if(type(mixins) === 'array'){
    mixins = mixins.concat(options);
  }else{
    mixins = [mixins, options];
  }
  mixinProto(factory.prototype, mixins);
  return factory;
}


function makeView(){
  var cachedValue = {};
      // factory = createComponentFactory(options);
  return function componentView(ctrl, props, children){
    var instance = ctrl.instance,
        oldProps = cachedValue.props,
        oldState = cachedValue.state,
        config = function(node, isInitialized, context, cached, redrawData){
          _executeFn(instance, 'setInternalProps', node, cached, redrawData);
          if(!isInitialized){
            _executeFn(instance, 'componentDidMount', node);
            if(type(instance.componentWillDetached) === 'function'){
              context.onunload = instance.componentWillDetached.bind(instance, node);
            }
          }else{
            _executeFn(instance, 'componentDidUpdate', node, oldProps, oldState);
          }
          
          
        };
      //updateProps
      instance.setProps(props, children);
       //cache previous instance
      cachedValue.props = instance.props;
      cachedValue.state = instance.state;
      
      if(instance.root != null){
        if(_executeFn(instance, 'shouldComponentUpdate', oldProps, oldState) === false){
          return {subtree: 'retain'};
        }
        _executeFn(instance, 'componentWillUpdate', instance.root, oldProps, oldState);
      }else{
        _executeFn(instance, 'componentWillMount', oldProps, oldState);
      }
      
      var resultView = _executeFn(instance, 'render', instance.props, instance.state);
      resultView.attrs = resultView.attrs || {};
      resultView.attrs.config = config;
     
      return resultView;
  };
}

//heplers
function _bindOnMethods(proto, component){
  Object.keys(proto).forEach(function(prop){
    var val = proto[prop];
    if(type(val) === 'function' || /^on[A-Z]\w*/.test(prop)){
      component[prop] = val.bind(component);
    }
  });
}
function _executeFn(obj, methodName){
  var args = slice(arguments, 2);
  if(type(obj[methodName]) === 'function'){
    return obj[methodName].apply(obj, args);
  }
}
function _addToHead(arrToAdd, targetArr){
  var i, l= arrToAdd.length, arr;
  for(i = 0; i < l; i++){
    arr = arrToAdd[i];
    if(targetArr.indexOf(arr) === -1){
      targetArr.unshift(arr);
    }
  }
  return targetArr;
}
function _compose(isPiped, fns){
  return function _composed(){
    var args = slice(arguments,0),
        self = this,
        i = 0 ,l = fns.length, fn, result = args;
    for(; i < l; i++){
      fn = fns[i];
      result = fn.apply(self, args);
      args = isPiped ? result : args;
    }
    return result;
  };
}