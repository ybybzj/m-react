import redraw from './update';
import {
  G
} from '../globals';

redraw.strategy = G.updateStrategy;
function startComputation() {G.pendingRequests++;}
function endComputation() {
  G.pendingRequests = Math.max(G.pendingRequests - 1, 0);
  if (G.pendingRequests === 0) redraw();
}
// function endFirstComputation() {
  // if (redraw.strategy() === "none") {
  //   G.pendingRequests--;
  //   redraw.strategy("diff");
  // }
//   else endComputation();
// }

export {redraw, startComputation, endComputation}