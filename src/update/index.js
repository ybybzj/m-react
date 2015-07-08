import redraw from './update';
import {getParentElFrom} from '../utils';
import {
  G
} from '../globals';
//render queue setting
G.renderQueue
    .onFlush(onFlush)
    .onAddTarget(onMergeTask);

export {redraw}

function onFlush(task){
  var {processor, params} = task;
  if(typeof processor === 'function'){
    processor.apply(null, params);
  }
}

function onMergeTask(queue, task){
  var i, l, removeIdx, taskToPush;
  for(i = 0, l = queue.length; i < l; i++){
    taskToPush = canBeMerged(queue[i], task);
    if(taskToPush){
      removeIdx = i;
      break;
    }
  }
  if(removeIdx > -1){
    queue.splice(removeIdx, 1);
    queue.push(taskToPush);
  }else{
    queue.push(task);
  }

  return queue;
}
function canBeMerged(taskInQ, task){
  var inQRoot = taskInQ.root, tRoot = task.root;
  if(taskInQ.mergeType&task.mergeType){// at least one of them are replace
    return inQRoot === tRoot? task: null;
  }else{// both of them are contain
    var parent = getParentElFrom(inQRoot, tRoot);
    return !parent ? null : (parent === inQRoot)? taskInQ : task;
  }
}