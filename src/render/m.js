import {slice, type} from '../utils';
import componentize, {isComponent} from '../mount/component';
var tagReg = /(?:(^|#|\.)([^#\.\[\]]+))|(\[.+?\])/g,
  attrReg = /\[(.+?)(?:=("|'|)(.*?)\2)?\]/;

export default function m(){
  var tagStr = arguments[0],
      attrs = arguments[1],
      children = slice(arguments, 2);

  if(isComponent(tagStr)){
    return componentize(tagStr, attrs, children);
  }
  if(type(tagStr) !== 'string'){
    throw new Error('selector in m(selector, attrs, children) should be a string');
  }

  var hasAttr = attrs != null && type(attrs) === 'object' && !('tag' in attrs || 'view' in attrs) && !('subtree' in attrs),
      vNode = {
        tag: 'div',
        attrs: {}
      },
      match, pair, classAttrName, classes = [];
  //normalize arguments
  attrs = hasAttr ? attrs : {};
  classAttrName = 'class' in attrs ? 'class' : 'className';
  children = hasAttr ? children: slice(arguments, 1);
  vNode.children = type(children[0]) === 'array' ? children[0] : children;

  //parse tag string
  /*eslint no-cond-assign:0*/
  while(match = tagReg.exec(tagStr)){
    if(match[1] === '' && match[2]) { vNode.tag = match[2]; }
    else if(match[1] === '#') { vNode.attrs.id = match[2]; }
    else if(match[1] === '.') { classes.push(match[2]); }
    else if(match[3][0] === '['){
      pair = attrReg.exec(match[3]);
      vNode.attrs[pair[1]] = pair[3] || (pair[2] ? '' : true);
    }
  }

  if(classes.length > 0) { vNode.attrs[classAttrName] = classes.join(' '); }

  Object.keys(attrs).forEach(function(attrName){
    var attrVal = attrs[attrName];
    if(attrName === classAttrName &&type(attrVal) !== 'string' && attrVal.trim() !== ''){
      vNode.attrs[attrName] = (vNode.attrs[attrName] || '') + ' ' + attrVal;
    }else{
      vNode.attrs[attrName] = attrVal;
    }
  });

  return vNode;
}

m.trust = function(value){
  /*eslint no-new-wrappers:0*/
  value = new String(value);
  value.$trusted = true;
  return value;
};
