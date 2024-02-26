import { turtleCommandPubSub } from "../pubsub/pubsubs";
import { ArgType, CommandsWithContext, VariableGetter, VariableSetter } from "./core";
import numericEval from "./numericEval";

export default class CoreCommands {
  // TODO Arguments must be parsed, also I need here the memory
  static async forward(args: ArgType, memory : VariableGetter & VariableSetter) {
    if (typeof args[0] !== "string") throw new Error("I have to create a custom error for this"); // TODO decorator?
    const distance = numericEval(args[0], memory);
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "forward",
      distance
    });
  }

  static async backward(args: ArgType, memory : VariableGetter & VariableSetter) {
    if (typeof args[0] !== "string") throw new Error("I have to create a custom error for this"); // TODO decorator?
    const distance = numericEval(args[0], memory);
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "backward",
      distance
    });
  }

  static async left(args: ArgType, memory : VariableGetter & VariableSetter) {
    if (typeof args[0] !== "string") throw new Error("I have to create a custom error for this"); // TODO decorator?
    const radian = numericEval(args[0], memory) / 180.0 * Math.PI;
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "left",
      radian
    });
  }

  static async right(args: ArgType, memory : VariableGetter & VariableSetter) {
    if (typeof args[0] !== "string") throw new Error("I have to create a custom error for this"); // TODO decorator?
    const radian = numericEval(args[0], memory) / 180.0 * Math.PI;
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "right",
      radian
    });
  }

  static async repeat(args: ArgType, memory : VariableGetter & VariableSetter) {
    if (typeof args[0] !== "string") throw new Error("I have to create a custom error for this"); // TODO decorator?
    const repeatNumber = numericEval(args[0], memory);
    const cycleCore = args[1] as CommandsWithContext;
    console.log("Repeat called: ", repeatNumber, cycleCore);
    for (let i=0; i<repeatNumber; ++i) {
      cycleCore.context.setVariable("i", i);
      await cycleCore.execute();
    }
  }

  static async createVar(args: ArgType, memory : VariableGetter & VariableSetter) {
    if (typeof args[0] !== "string") throw new Error("I have to create a custom error for this"); // TODO decorator?
    if (typeof args[1] !== "string") throw new Error("I have to create a custom error for this"); // TODO decorator?
    // TODO : args[1] can be string or CommandsWithContext, both are valid. But I have to create decorators, this is out of hand
    //memory.setVariable(arg[0])
  }

  static async learn(args: ArgType, memory : VariableGetter & VariableSetter) {
    /**
     * usage: learn commandName param1 param2 param3 ... paramN { code block }
     */
    if (args.length <= 1) throw Error("I have to create a custom error for this. And decorators");
    if (!(args[args.length-1] instanceof CommandsWithContext)) throw Error("I have to create a custom error for this. And decorators")
    for (let i=0; i<args.length-1; ++i) {
      if (typeof args[i] !== "string") throw new Error("I have to create a custom error for this");
    }
    const commandName = args[0] as string;
    const argNames = args.slice(1, args.length-1) as string[];
    const code = args[args.length - 1] as CommandsWithContext;
    for (const argName of argNames) {
      code.context.setVariable(argName, "");
    }
    code.context.meta = {type: "command", arguments: argNames};
    memory.setVariable(commandName, code);
  }
}