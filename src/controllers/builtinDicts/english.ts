import CoreCommands from "../CoreCommands";
import { ArgType, VariableGetter, VariableSetter } from "../core";

// This is the English dict
const BuiltinDictionary : {[i : string] : (args: ArgType, memory: VariableGetter & VariableSetter) => Promise<void>} = {
  "forward": CoreCommands.forward,
  "f": CoreCommands.forward,
  "backward": CoreCommands.backward,
  "b": CoreCommands.backward,
  "left": CoreCommands.left,
  "l": CoreCommands.left,
  "right": CoreCommands.right,
  "r": CoreCommands.right,
  "repeat": CoreCommands.repeat,
  "rep": CoreCommands.repeat,
};

export default BuiltinDictionary;