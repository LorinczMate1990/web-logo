import ArrayCommands from "../language-commands/ArrayCommands";
import CoreCommands from "../language-commands/CoreCommands";
import TurtleCommands from "../language-commands/TurtleCommands";
import { AbstractMemory, ArgType, CommandControl, VariableGetter, VariableSetter } from "../types";

// This is the English dict
const EnglishCommands : {[i : string] : (args: ArgType, memory: AbstractMemory) => Promise<CommandControl>} = {
  "forward": TurtleCommands.forward,
  "f": TurtleCommands.forward,
  "backward": TurtleCommands.backward,
  "b": TurtleCommands.backward,
  "left": TurtleCommands.left,
  "l": TurtleCommands.left,
  "right": TurtleCommands.right,
  "r": TurtleCommands.right,
  "penup": TurtleCommands.penUp,
  "pendown": TurtleCommands.penDown,
  "pencolor": TurtleCommands.setPenColor,
  "penwidth": TurtleCommands.setPenWidth,
  "home": TurtleCommands.goHome,
  "sethome": TurtleCommands.setHome,
  "fill": TurtleCommands.fill,
  "clear": TurtleCommands.clearScreen,
  "cl": TurtleCommands.clearScreen,
  
  "repeat": CoreCommands.repeat,
  "rep": CoreCommands.repeat,
  "learn": CoreCommands.learn,
  "if": (args: ArgType, memory: AbstractMemory) => CoreCommands.conditionalBranching(args, memory, "elif", "else"),
  "each": CoreCommands.each,
  "wait": CoreCommands.coWait,
  "return": CoreCommands.returnWithValue,
  "eval": CoreCommands.eval,
  "print": (args: ArgType, memory: AbstractMemory) => CoreCommands.print(args, memory, false),
  "error": (args: ArgType, memory: AbstractMemory) => CoreCommands.print(args, memory, true),
  "while": CoreCommands.whileCycle,

  "insertBeforeFirst": ArrayCommands.insertBeforeFirst,
  "insertAfterLast": ArrayCommands.insertAfterLast,
  "insertAnywhere": ArrayCommands.insertAnywhere,
  "removeFirst": ArrayCommands.removeFirst,
  "removeLast": ArrayCommands.removeLast,
  "removeAny": ArrayCommands.removeAny,
  "slice": ArrayCommands.slice,
};
const ExtraKeywords : {"extraKeywords" : string[]} = {
  "extraKeywords": ["elif", "else"],
};

export default Object.assign(EnglishCommands, ExtraKeywords);