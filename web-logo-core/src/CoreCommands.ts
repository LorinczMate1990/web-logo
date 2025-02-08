import { turtleCommandPubSub } from "./pubsub/pubsubs";
import { AbstractMemory, ArgType, ExecutableFactory, ExecutableWithContext, isExecutableFactory, isStructuredMemoryData, ParamType } from "./types";
import { Arguments, PossibleArgumentParsingMethods } from "./ArgumentParser";
import ColorMap from "./utils/ColorMap";

function sleep(ms: number) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}

export default class CoreCommands {
  @Arguments(['numeric'])
  static async forward(args: ArgType, memory : AbstractMemory) {
    const distance = args[0] as number;
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "forward",
      distance
    });
  }

  @Arguments(['numeric'])
  static async backward(args: ArgType, memory : AbstractMemory) {
    const distance = args[0] as number;
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

  @Arguments([['word', 'array']])
  static async setPenColor(args: ArgType, memory : AbstractMemory) {
    // The color can be any of the following formats: "colorname" or "#RRGGBB"
    // This function must convert them to RGB
  
    let RR = 0;
    let GG = 0;
    let BB = 0;
    if (isStructuredMemoryData(args[0])) {
      if (Array.isArray(args[0].data)) {
        RR = args[0].data[0] as number; // TODO Should be checked
        GG = args[0].data[1] as number; // TODO Should be checked
        BB = args[0].data[2] as number; // TODO Should be checked
      } else {
        throw new Error(`The input of setPenColor must be a color name or a three-element numeric array`);
      }
    } else {
      const inputColor = args[0] as string;
      const colorCode = (inputColor[0] == "#")?inputColor:ColorMap[inputColor];
      if (colorCode == undefined || colorCode.length != 7) {
        throw new Error(`The ${inputColor} color is not recognized`);
      }
      RR = parseInt(colorCode.slice(1,3), 16);
      GG = parseInt(colorCode.slice(3,5), 16);
      BB = parseInt(colorCode.slice(5,7), 16);
    }

    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "setPenColor",
      color: [RR, GG, BB],
    });
  }

  @Arguments(['numeric'])
  static async setPenWidth(args: ArgType, memory : AbstractMemory) {
    const width = args[0] as number;
    
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
      cycleCore.context.setVariable("i", i);
      await cycleCore.execute();
    }
  }

  @Arguments(['array', 'code'])
  static async each(args: ArgType, memory : AbstractMemory) {
    if (!(isStructuredMemoryData(args[0]) && Array.isArray(args[0].data))) throw new Error("TODO To decorator"); // TODO
    const collection = args[0].data as ParamType[];
    const cycleCoreFactory = args[1] as ExecutableFactory;
    const cycleCore = cycleCoreFactory.getNewExecutableWithContext();
    for (const i of collection) {
      cycleCore.context.setVariable("i", i);
      await cycleCore.execute();
    }
  }

  @Arguments({max: 1, front: ['numeric']})
  static async coWait(args: ArgType, memory : AbstractMemory) {
    if (args.length == 1) { 
      await sleep(args[0] as number);
    } else {
      await sleep(0);
    } 
  }

  @Arguments({max: 1, front: ['numeric']}) 
  static async fill(args: ArgType, memory: AbstractMemory) {
    const tolerance = (args.length == 0)?0:args[0] as number;
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "fill",
      tolerance,
    });
  }

  /*@Arguments({exact: 2, front: ['numeric', new Set(['code', 'numeric', 'string'])]})
  static async createVar(args: ArgType, memory : AbstractMemory) {
    // TODO: args[1] can be too many things and I can't make proper difference between them,
    // I need typed createVar-s
  }*/

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
    const condition = args[0] as number;
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