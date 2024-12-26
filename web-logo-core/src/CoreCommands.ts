import { turtleCommandPubSub } from "./pubsub/pubsubs";
import { AbstractMemory, ArgType, ExecutableFactory, ExecutableWithContext, isExecutableFactory, ParamType } from "./types";
import { numericEval, stringEval } from "./numericEval";
import BuiltinDictionary from "./builtinDicts/english";
import { CommandsWithContextFactory } from "./core";
import { Arguments } from "./ArgumentParser";

export default class CoreCommands {
  @Arguments(['numeric'])
  static async forward(args: ArgType, memory : AbstractMemory) {
    const distance = parseFloat(String(args[0]))
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "forward",
      distance
    });
  }

  @Arguments(['numeric'])
  static async backward(args: ArgType, memory : AbstractMemory) {
    const distance = parseFloat(String(args[0]));
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "backward",
      distance
    });
  }

  @Arguments(['numeric'])
  static async left(args: ArgType, memory : AbstractMemory) {
    const radian = parseFloat(String(args[0])) / 180.0 * Math.PI;
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "left",
      radian
    });
  }

  @Arguments(['numeric'])
  static async right(args: ArgType, memory : AbstractMemory) {
    const radian = parseFloat(String(args[0])) / 180.0 * Math.PI;
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "right",
      radian
    });
  }

  @Arguments([])
  static async penUp(args: ArgType, memory : AbstractMemory) {
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "setPenState",
      penState: 'up'
    });
  }

  @Arguments([])
  static async penDown(args: ArgType, memory : AbstractMemory) {
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "setPenState",
      penState: 'down'
    });
  }

  @Arguments(['word'])
  static async setPenColor(args: ArgType, memory : AbstractMemory) {
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "setPenColor",
      color: String(args[0]),
    });
  }

  @Arguments(['numeric'])
  static async setPenWidth(args: ArgType, memory : AbstractMemory) {
    const width = parseFloat(String(args[0]));
    if (isNaN(width)) throw new Error("The width has invalid format");
    
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "setPenWidth",
      width,
    });
  }

  @Arguments([])
  static async goHome(args: ArgType, memory : AbstractMemory) {
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "goHome",
    });
  }
  
  @Arguments([])
  static async setHome(args: ArgType, memory : AbstractMemory) {
    // TODO
  }

  // Program control

  @Arguments(['numeric', 'code'])
  static async repeat(args: ArgType, memory : AbstractMemory) {
    const repeatNumber = parseFloat(String(args[0]));
    const cycleCoreFactory = args[1] as ExecutableFactory;
    const cycleCore = cycleCoreFactory.getNewExecutableWithContext();
    for (let i=0; i<repeatNumber; ++i) {
      cycleCore.context.setVariable("i", String(i));
      await cycleCore.execute();
    }
  }

  @Arguments({exact: 2, front: ['numeric', new Set(['code', 'numeric', 'string'])]})
  static async createVar(args: ArgType, memory : AbstractMemory) {
    // TODO: args[1] can be too many things and I can't make proper difference between them,
    // I need typed createVar-s
  }

  @Arguments({min: 2, back: ['code'], default: 'word'})
  static async learn(args: ArgType, memory : AbstractMemory) {
    /**
     * usage: learn commandName param1 param2 param3 ... paramN { code block }
     */
    const commandName = args[0] as string;
    const argNames = args.slice(1, args.length-1) as string[];
    const codeFactory = args[args.length - 1] as ExecutableFactory;
    codeFactory.meta = {type: "command", arguments: argNames};
    memory.setVariable(commandName, codeFactory);
  }

  @Arguments({min: 2, max: 3, front: ['numeric', 'code', 'code']})
  static async conditionalBranching(args: ArgType, memory : AbstractMemory) {
    /**
     * usage: if condition { code block if true} { code block if false }
     */
    const condition = parseFloat(String(args[0]));
    const trueBranchFactory = args[1] as ExecutableFactory;
    const falseBranchFactory = (args.length == 3)? args[2] as ExecutableFactory : undefined; 

    const trueBranch = trueBranchFactory.getNewExecutableWithContext();
    const falseBranch = falseBranchFactory?.getNewExecutableWithContext();

    if (condition) {
      await trueBranch.execute();
    } else {
      if (falseBranch) {
        await falseBranch.execute();
      }
    }
  }


  static async setLocalParameter(arg : ArgType, memory : AbstractMemory) {
  }
}