//listen all event at capture phase
export default function removeEventListener(el, type, handler){
  return el.removeEventListener(type, handler, true);
}