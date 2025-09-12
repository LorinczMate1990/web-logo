import ArrayCommands from "../language-commands/ArrayCommands.js";
import CoreCommands from "../language-commands/CoreCommands.js";
import TurtleCommands from "../language-commands/TurtleCommands.js";
import DebugCommands from "../language-commands/DebugCommands.js";
import { InterceptableMemory, ArgType, CommandControl, VariableGetter, VariableSetter } from "../types.js";

// This is the English dict
const EnglishCommands : {[i : string] : (args: ArgType, memory: InterceptableMemory) => Promise<CommandControl>} = {
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
  "pushposition": TurtleCommands.pushPosition,
  "popposition": TurtleCommands.popPosition,
  "home": TurtleCommands.goHome,
  "sethome": TurtleCommands.setHome,
  "fill": TurtleCommands.fill,
  "clear": TurtleCommands.clearScreen,
  "cl": TurtleCommands.clearScreen,
  "newturtle": TurtleCommands.addTurtle,
  "removeturtle": TurtleCommands.removeTurtle,
  "refreshturtles": TurtleCommands.refreshTurtles,
  "watch": TurtleCommands.watch,
  "lookat": TurtleCommands.lookAt,
  "scale": TurtleCommands.scale,
  "setscale": TurtleCommands.setScale,
  "visible": TurtleCommands.visible,
  "form": TurtleCommands.setForm,
  "goto": TurtleCommands.goto,
  "emit": TurtleCommands.emit,
  
  "repeat": CoreCommands.repeat,
  "rep": CoreCommands.repeat,
  "learn": CoreCommands.learn,
  "if": (args: ArgType, memory: InterceptableMemory) => CoreCommands.conditionalBranching(args, memory, "elif", "else"),
  "each": CoreCommands.each,
  "turnoffwait": (args: ArgType, memory: InterceptableMemory) => CoreCommands.turnWait(args, memory, false),
  "turnonwait": (args: ArgType, memory: InterceptableMemory) => CoreCommands.turnWait(args, memory, true),
  "wait": CoreCommands.coWait,
  "return": CoreCommands.returnWithValue,
  "eval": CoreCommands.eval,
  "print": (args: ArgType, memory: InterceptableMemory) => CoreCommands.print(args, memory, false),
  "error": (args: ArgType, memory: InterceptableMemory) => CoreCommands.print(args, memory, true),
  "while": CoreCommands.whileCycle,
  'savecanvas': CoreCommands.saveCanvas,
  'restorecanvas': CoreCommands.restoreCanvas,
  'capture': CoreCommands.captureCanvasPart,
  'random': CoreCommands.random,
  'turtlesandbox': CoreCommands.initTurtleSandbox,
  
  "insertBeforeFirst": ArrayCommands.insertBeforeFirst,
  "insertAfterLast": ArrayCommands.insertAfterLast,
  "insertAnywhere": ArrayCommands.insertAnywhere,
  "removeFirst": ArrayCommands.removeFirst,
  "removeLast": ArrayCommands.removeLast,
  "removeAny": ArrayCommands.removeAny,
  "slice": ArrayCommands.slice,
  "filterArray": ArrayCommands.filterArray,

  "tick": DebugCommands.tick,
};
const ExtraKeywords : {"extraKeywords" : string[]} = {
  "extraKeywords": ["elif", "else"],
};

export default Object.assign(EnglishCommands, ExtraKeywords);