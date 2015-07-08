import {global as $global} from '../globals';
var lastTime = 0,
    FRAME_BUDGET = 16,
    vendors = ['webkit', 'moz', 'ms', 'o'],
    requestAnimationFrame = $global.requestAnimationFrame,
    cancelAnimationFrame = $global.cancelAnimationFrame || $global.cancelRequestAnimationFrame;
for(let x = 0, l = vendors.length; x < l && !requestAnimationFrame; ++x){
  requestAnimationFrame = $global[vendors[x] + 'RequestAnimationFrame'];
  cancelAnimationFrame = $global[vendors[x] + 'CancelAnimationFrame'] || $global[vendors[x] + 'CancelRequestAnimationFrame'];
}

if(!requestAnimationFrame){
  requestAnimationFrame = function (callback){
    let currTime = Date.now ? Date.now() : (new Date()).getTime();
    let timeToCall = Math.max(0, FRAME_BUDGET - (currTime - lastTime));
    let id = setTimeout(function(){
      callback(currTime + timeToCall);
    }, timeToCall);
    lastTime = currTime + timeToCall;
    return id;
  };
}

if(!cancelAnimationFrame){
  cancelAnimationFrame = function(id){
    return clearTimeout(id);
  };
}

export {requestAnimationFrame, cancelAnimationFrame, FRAME_BUDGET};
