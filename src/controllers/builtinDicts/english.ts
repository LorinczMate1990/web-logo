import CoreCommands from "../CoreCommands";
import { AbstractMemory, ArgType, VariableGetter, VariableSetter } from "../types";

// This is the English dict
const BuiltinDictionary : {[i : string] : (args: ArgType, memory: AbstractMemory) => Promise<void>} = {
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
  "learn": CoreCommands.learn,
  "if": CoreCommands.conditionalBranching,
};

export default BuiltinDictionary;