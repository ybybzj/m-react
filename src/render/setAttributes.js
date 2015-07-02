import { type, matchReg } from '../utils';
import {G} from '../globals';
var domDelegator = G.domDelegator;
var evAttrReg = /^ev([A-Z]\w*)/;
export default function setAttributes(domNode, tag, dataAttrs, cachedAttrs, namespace) {
  Object.keys(dataAttrs).forEach(function(attrName) {
    var dataAttr = dataAttrs[attrName],
        cachedAttr = cachedAttrs[attrName],
        evMatch;

    if (!(attrName in cachedAttrs) || (cachedAttr !== dataAttr)) {
      cachedAttrs[attrName] = dataAttr;
      try {
        //`config` isn't a real attributes, so ignore it
        if (attrName === "config" || attrName == "key") return;
        //hook event handlers to the auto-redrawing system
        else if (type(dataAttr) === 'function' && attrName.indexOf("on") === 0) {
          domNode[attrName] = dataAttr;
          // bind handler to domNode for a delegation event
        }else if((evMatch = matchReg(attrName,evAttrReg)) && evMatch[1].length){
          let evType = evMatch[1].toLowerCase();
          domDelegator.off(domNode, evType);
          if(isHandler(dataAttr)){
            domDelegator.on(domNode, evType, dataAttr);
          }
        }
        //handle `style: {...}`
        else if (attrName === "style" && dataAttr != null && type(dataAttr) === 'object') {
          Object.keys(dataAttr).forEach(function(rule) {
            if (cachedAttr == null || cachedAttr[rule] !== dataAttr[rule]) {
              domNode.style[rule] = dataAttr[rule];
            }
          });
          if (type(cachedAttr) === 'object') {
            Object.keys(cachedAttr).forEach(function(rule) {
              if (!(rule in dataAttr)) domNode.style[rule] = "";
            });
          }
        }
        //handle SVG
        else if (namespace != null) {
          if (attrName === "href") domNode.setAttributeNS("http://www.w3.org/1999/xlink", "href", dataAttr);
          else if (attrName === "className") domNode.setAttribute("class", dataAttr);
          else domNode.setAttribute(attrName, dataAttr);
        }
        //handle cases that are properties (but ignore cases where we should use setAttribute instead)
        //- list and form are typically used as strings, but are DOM element references in js
        //- when using CSS selectors (e.g. `m("[style='']")`), style is used as a string, but it's an object in js
        else if (attrName in domNode && !(attrName === "list" || attrName === "style" || attrName === "form" || attrName === "type" || attrName === "width" || attrName === "height")) {
          //#348 don't set the value if not needed otherwise cursor placement breaks in Chrome
          if (tag !== "input" || domNode[attrName] !== dataAttr) domNode[attrName] = dataAttr;
        } else domNode.setAttribute(attrName, dataAttr);
      } catch (e) {
        //swallow IE's invalid argument errors to mimic HTML's fallback-to-doing-nothing-on-invalid-attributes behavior
        if (e.message.indexOf("Invalid argument") < 0) throw e;
      }
    }
    //#348 dataAttr may not be a string, so use loose comparison (double equal) instead of strict (triple equal)
    else if (attrName === "value" && tag === "input" && domNode.value != dataAttr) {
      domNode.value = dataAttr;
    }
  });
  return cachedAttrs;
}

function isHandler(handler){
  return type(handler) === 'function' || (handler && type(handler.handleEvent) === 'function');
}