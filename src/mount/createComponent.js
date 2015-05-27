import * as update from '../update';
import {type, extend, slice, removeVoidValue, toArray} from '../utils';
var extendMethods = ['componentDidMount', 'componentDidUpdate', 'componentWillUnmount', 'componentWillDetached', 'componentWillReceiveProps'];
var ignoreProps = ['setState', 'mixins'];
class Component{
  constructor(props, children){
    if(type(props) !== 'object' && props != null){
      throw new TypeError('[Component]param for constructor should a object or null or undefined! given: ' + props);
    }
    this.props = props || {};
    this.state = {};
    this.props.children = toArray(children);
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
  setState(state){
    update.startComputation();
    this.state = extend(this.state, state);
    update.endComputation();
  }
};

export default function createComponent(options){
  if(type(options) !== 'object'){
    throw new TypeError();
  }
  var component = {},
      factory = createComponentFactory(options);
  component.controller = function(props, children){
    var instance = new factory(props, children);
    var ctrl = {
      instance: instance
    };
    if(type(instance.componentWillUnmount) === 'function'){
      ctrl.onunload = instance.componentWillUnmount.bind(instance);
    }
    return ctrl;
  };
  
  component.view = makeView();
  return component;
}


function mixinProto(proto, mixins){
  if(type(mixins) !== 'array'){
    mixins = slice(arguments, 1);
  }
  mixins = mixins.filter(function(m){return type(m) === 'object';});
  mixins.forEach(function(mixin){
    Object.keys(mixin).forEach(function(propName){
      if(extendMethods.indexOf(propName) !== -1){
        if(type(proto[propName]) === 'array'){
          proto[propName].push(mixin[propName]);
        }else{
          proto[propName] = type(proto[propName]) === 'function' ? [proto[propName], mixin[propName]] : [mixin[propName]];
        }
      }
      if(ignoreProps.indexOf(propName) !== -1){
        return;
      }
      proto[propName] = mixin[propName];
    });
  });
  extendMethods.forEach(function(methodName){
    if(type(proto[methodName]) === 'array'){
      var methods = proto[methodName].filter(function(p){
        return type(p) === 'function';
      });
      proto[methodName] = function(){
        var args = slice(arguments),
            self = this;
        methods.forEach(function(method){
          method.apply(self, args);
        });
      };
    }
  });
}

function createComponentFactory(options){
  var factory = function ComponentFactory(){
    Component.apply(this,arguments);
  };
  factory.prototype = Object.create(Component.prototype);
  options.mixins = options.mixins || [];
  if(type(options.mixins) === 'array'){
    options.mixins = options.mixins.concat(options);
  }else{
    options.mixins = [options.mixins, options];
  }
  mixinProto(factory.prototype, options.mixins);
  return factory;
}

function makeView(){
  var cachedValue = {};
      // factory = createComponentFactory(options);
  return function componentView(ctrl, props, children){
    var instance = ctrl.instance,
        config = function(node, isInitialized, context){
          if(!isInitialized){
            _executeFn(instance, 'componentDidMount', node);
            if(type(instance.componentWillDetached) === 'function'){
              context.onunload = instance.componentWillDetached.bind(instance, node);
            }
          }else{
            _executeFn(instance, 'componentDidUpdate', node);
          }
          
          
        },
        oldProps = cachedValue.props,
        oldState = cachedValue.state;
      //updateProps
      instance.setProps(props, children);
       //cache previous instance
      cachedValue.props = instance.props;
      cachedValue.state = instance.state;
      if(_executeFn(instance, 'shouldComponentUpdate', oldProps, oldState) === false){
        return {subtree: 'retain'};
      }

      var resultView = _executeFn(instance, 'render', instance.props, instance.state);
      resultView.attrs = resultView.attrs || {};
      resultView.attrs.config = config;
     
      return resultView;
  };
}

function _executeFn(obj, methodName){
  var args = slice(arguments, 2);
  if(type(obj[methodName]) === 'function'){
    return obj[methodName].apply(obj, args);
  }
}