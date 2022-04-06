/* Publish Thingy:52 API in global window variable. */
import { Thingy } from './thingy52.js';
window.Thingy = Thingy;


const debug  = function(e) {
  console.log(e);
}

window.Thingy.addEventListener("thingy52_connect",debug);

window.Thingy.addEventListener("thingy52_battery",debug);

window.Thingy.addEventListener("thingy52_disconnect",debug);

window.Thingy.addEventListener("thingy52_button",debug);
