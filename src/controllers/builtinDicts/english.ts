import CoreCommands from "../CoreCommands";
import { ArgType } from "../core";

// This is the English dict
const BuiltinDictionary : {[i : string] : (args: ArgType) => Promise<void>} = {
  "forward": CoreCommands.forward,
  "f": CoreCommands.forward,
  "backward": CoreCommands.backward,
  "b": CoreCommands.backward,
  "left": CoreCommands.left,
  "l": CoreCommands.left,
  "right": CoreCommands.right,
  "r": CoreCommands.right,
};

export default BuiltinDictionary;