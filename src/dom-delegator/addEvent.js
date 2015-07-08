//listen all event at capture phase
export default function addEventListener(el, type, handler){
  return el.addEventListener(type, handler, true);
}
