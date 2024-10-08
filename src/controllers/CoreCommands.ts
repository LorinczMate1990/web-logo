import { memo } from "react";
import { turtleCommandPubSub } from "../pubsub/pubsubs";
import { numericEval } from "./numericEval";
import { AbstractMemory, ArgType, ExecutableFactory, ExecutableWithContext } from "./types";

export default class CoreCommands {
  // TODO Arguments must be parsed, also I need here the memory
  static async forward(args: ArgType, memory : AbstractMemory) : Promise<void> {
    if (typeof args[0] !== "string") throw new Error("I have to create a custom error for this"); // TODO decorator?
    const distance = numericEval(args[0], memory);
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "forward",
      distance
    });
  }

  static async backward(args: ArgType, memory : AbstractMemory) {
    if (typeof args[0] !== "string") throw new Error("I have to create a custom error for this"); // TODO decorator?
    const distance = numericEval(args[0], memory);
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "backward",
      distance
    });
  }

  static async left(args: ArgType, memory : AbstractMemory) {
    if (typeof args[0] !== "string") throw new Error("I have to create a custom error for this"); // TODO decorator?
    const radian = numericEval(args[0], memory) / 180.0 * Math.PI;
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "left",
      radian
    });
  }

  static async right(args: ArgType, memory : AbstractMemory) {
    if (typeof args[0] !== "string") throw new Error("I have to create a custom error for this"); // TODO decorator?
    const radian = numericEval(args[0], memory) / 180.0 * Math.PI;
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "right",
      radian
    });
  }

  static async repeat(args: ArgType, memory : AbstractMemory) {
    if (typeof args[0] !== "string") throw new Error("I have to create a custom error for this"); // TODO decorator?
    const repeatNumber = numericEval(args[0], memory);
    const cycleCoreFactory = args[1] as ExecutableFactory; // TODO It is?
    const cycleCore = cycleCoreFactory.getNewExecutableWithContext(memory);
    console.log("Repeat called: ", repeatNumber, cycleCore);
    for (let i=0; i<repeatNumber; ++i) {
      cycleCore.context.setVariable("i", String(i));
      await cycleCore.execute();
    }
  }

  static async createVar(args: ArgType, memory : AbstractMemory) {
    if (args.length == 2 || args.length == 3) throw new Error("I have to create a custom error for this"); 
    if (typeof args[0] !== "string") throw new Error("I have to create a custom error for this"); // TODO decorator?
    if (typeof args[1] !== "string") throw new Error("I have to create a custom error for this"); // TODO decorator?
    
    // TODO : args[1] can be string or ExecutableWithContext, both are valid. But I have to create decorators, this is out of hand
    //memory.setVariable(arg[0])
  }

  static async learn(args: ArgType, memory : AbstractMemory) {
    /**
     * usage: learn commandName param1 param2 param3 ... paramN { code block }
     */
    if (args.length <= 1) throw Error("I have to create a custom error for this. And decorators");
    if (typeof (args[args.length-1]) === "string") throw Error("The last parameter is string")
    for (let i=0; i<args.length-1; ++i) {
      if (typeof args[i] !== "string") throw new Error("I have to create a custom error for this");
    }
    const commandName = args[0] as string;
    const argNames = args.slice(1, args.length-1) as string[];
    const codeFactory = args[args.length - 1] as ExecutableFactory;
    codeFactory.meta = {type: "command", arguments: argNames};
    memory.setVariable(commandName, codeFactory);
    console.log("Memory after learn: ", {memory, commandName, codeFactory})
  }

  static async conditionalBranching(args: ArgType, memory : AbstractMemory) {
    /**
     * usage: if condition { code block if true} { code block if false }
     */
    if (args.length != 2 && args.length != 3) throw Error("I have to create a custom error for this. And decorators");
    if (typeof (args[1]) === "string") throw Error("The second parameter is string");
    if (typeof (args[args.length-1]) === "string") throw Error("The last parameter is string");
    if (typeof args[0] !== "string") throw new Error("I have to create a custom error for this");
    
    console.log({args})
    const condition = numericEval(args[0], memory);
    const trueBranchFactory = args[1] as ExecutableFactory;
    const falseBranchFactory = (args.length == 3)? args[1] as ExecutableFactory : undefined; 

    const trueBranch = trueBranchFactory.getNewExecutableWithContext(memory);
    const falseBranch = falseBranchFactory?.getNewExecutableWithContext(memory);

    console.log({condition})
    console.log({memory})
    
    if (condition) {
      console.log("True branch will be executed")
      await trueBranch.execute();
    } else {
      if (falseBranch) {
        console.log("False branch will be executed")
        await falseBranch.execute();
      }
    }
  }
}