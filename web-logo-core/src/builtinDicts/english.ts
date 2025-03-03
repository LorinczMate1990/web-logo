import ArrayCommands from "../language-commands/ArrayCommands";
import CoreCommands from "../language-commands/CoreCommands";
import { AbstractMemory, ArgType, CommandControl, VariableGetter, VariableSetter } from "../types";

// This is the English dict
const BuiltinDictionary : {[i : string] : (args: ArgType, memory: AbstractMemory) => Promise<CommandControl>} = {
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
  "penup": CoreCommands.penUp,
  "pendown": CoreCommands.penDown,
  "pencolor": CoreCommands.setPenColor,
  "penwidth": CoreCommands.setPenWidth,
  "home": CoreCommands.goHome,
  "sethome": CoreCommands.setHome,
  "each": CoreCommands.each,
  "wait": CoreCommands.coWait,
  "fill": CoreCommands.fill,
  "return": CoreCommands.returnWithValue,
  "eval": CoreCommands.eval,
  "print": CoreCommands.normalPrint,
  "error": CoreCommands.errorPrint,
  "clear": CoreCommands.clearScreen,
  "cls": CoreCommands.clearScreen,

  "insertBeforeFirst": ArrayCommands.insertBeforeFirst,
  "insertAfterLast": ArrayCommands.insertAfterLast,
  "insertAnywhere": ArrayCommands.insertAnywhere,
  "removeFirst": ArrayCommands.removeFirst,
  "removeLast": ArrayCommands.removeLast,
  "removeAny": ArrayCommands.removeAny,
  "slice": ArrayCommands.slice,
};

export default BuiltinDictionary;