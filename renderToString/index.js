'use strict';

var VOID_TAGS = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr',
    'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

function isArray(thing) {
  return Object.prototype.toString.call(thing) === '[object Array]';
}
function normalize(str){
  return str == null ? '': str;
}
function camelToDash(str) {
  return str.replace(/\W+/g, '-')
            .replace(/([a-z\d])([A-Z])/g, '$1-$2');
}
function isFunction(o){
  return Object.prototype.toString.call(o) === '[object Function]';
}

function createAttrString(attrs, ref) {
  var refStr = ref != null ? ' data-mref=' + ref : '';
  if (!attrs || !Object.keys(attrs).length) {
    return '' + refStr;
  }

  return Object.keys(attrs).map(function(name) {
    if (typeof attrs[name] === 'function' || attrs[name] == null) {
      return;
    }
    if (typeof attrs[name] === 'boolean') {
      return attrs[name] ? ' ' + name : '';
    }
    if (name === 'style') {
      var styles = attrs.style;
      if (typeof styles === 'string') {
        return ' style="' + styles + '"';
      }
      return ' style="' + Object.keys(styles).map(function(property) {
        return [camelToDash(property).toLowerCase(), styles[property]].join(':');
      }).join(';') + '"';
    }
    return ' ' + (name === 'className' ? 'class' : name) + '="' + attrs[name] + '"';
  }).join('') + refStr;
}

function createTrustedContent(view) {
  return Object.keys(view).map(function(key) {
    if (key === '$trusted') {
      return '';
    }
    return view[key];
  }).join('');
}

function render(view, idx) {
  var type = typeof view;
  if (type === 'string' || type === 'number' || type === 'boolean') {
    return view;
  }

  if (!view) {
    return '';
  }

  if (view.$trusted) {
    return createTrustedContent(view);
  }


  if (isArray(view)) {
    return view.map(function(v, i){
      return idx != null ? render(v, i+idx):render(v);
    }).join('');
  }
  var controller, hasController;
  while(view.view){
    if(!isFunction(view.view)){
      throw new Error('[renderToString] invalid component! given: '+ view);
    }
    if(isFunction(view.controller)){
      controller = new view.controller();
      hasController = true;
    }else{
      controller = null;
    }
    
    view = view.view(controller);
  }
  if(!view.tag && hasController){
    throw new Error('[renderToString] Component template must return a virtual element, not an array, string, etc.!');
  }
  var ref = idx != null ? idx : null;
  var children = render(view.children, 0);
  
  if (!children.length && VOID_TAGS.indexOf(view.tag) >= 0) {
    return '<' + view.tag + createAttrString(view.attrs, ref) + '>';
  }
  return [
    '<', view.tag, createAttrString(view.attrs, ref), '>',
    children,
    '</', view.tag, '>',
  ].join('');
}

module.exports = render;
