import { turtleCommandPubSub } from "../pubsub/pubsubs";
import { AbstractMemory, ArgType, CommandControl, ExecutableFactory, ExecutableWithContext, isExecutableFactory, isStructuredMemoryData, ParamType } from "../types";
import { Arguments, PossibleArgumentParsingMethods } from "../ArgumentParser";
import ColorMap from "../utils/ColorMap";
import { expressionEval } from "../expressionEval/expressionEval";

function sleep(ms: number) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}

export default class CoreCommands {
  @Arguments({max: 1, front: [ new Set(["array", "code", "numeric"]) ]})
  static async returnWithValue(args: ArgType, memory : AbstractMemory) {
    const value = (args.length == 1)?args[0] as ParamType:undefined;
    return {
      return: true,
      returnValue: value,
    } as CommandControl;
  }

  @Arguments(['numeric'])
  static async forward(args: ArgType, memory : AbstractMemory) {
    const distance = args[0] as number;
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "forward",
      distance
    });
    return {};
  }

  @Arguments(['numeric'])
  static async backward(args: ArgType, memory : AbstractMemory) {
    const distance = args[0] as number;
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "backward",
      distance
    });
    return {};
  }

  @Arguments(['numeric'])
  static async left(args: ArgType, memory : AbstractMemory) {
    const radian = parseFloat(String(args[0])) / 180.0 * Math.PI;
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "left",
      radian
    });
    return {};
  }

  @Arguments(['numeric'])
  static async right(args: ArgType, memory : AbstractMemory) {
    const radian = parseFloat(String(args[0])) / 180.0 * Math.PI;
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "right",
      radian
    });
    return {};
  }

  @Arguments([])
  static async penUp(args: ArgType, memory : AbstractMemory) {
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "setPenState",
      penState: 'up'
    });
    return {};
  }

  @Arguments([])
  static async penDown(args: ArgType, memory : AbstractMemory) {
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "setPenState",
      penState: 'down'
    });
    return {};
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
    return {};
  }

  @Arguments(['numeric'])
  static async setPenWidth(args: ArgType, memory : AbstractMemory) {
    const width = args[0] as number;
    
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "setPenWidth",
      width,
    });
    return {};
  }

  @Arguments([])
  static async goHome(args: ArgType, memory : AbstractMemory) {
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "goHome",
    });
    return {};
  }
  
  @Arguments([])
  static async setHome(args: ArgType, memory : AbstractMemory) {
    
    return {};
  }

  // Program control

  @Arguments(['numeric', 'code'])
  static async repeat(args: ArgType, memory : AbstractMemory) {
    const repeatNumber = parseFloat(String(args[0]));
    const cycleCoreFactory = args[1] as ExecutableFactory;
    const cycleCore = cycleCoreFactory.getNewExecutableWithContext();
    for (let i=0; i<repeatNumber; ++i) {
      cycleCore.context.createVariable("i", i);
      const commandControl = await cycleCore.execute();
      if (commandControl.return) return commandControl;
    }
    return {};
  }

  @Arguments(['array', 'code'])
  static async each(args: ArgType, memory : AbstractMemory) {
    if (!(isStructuredMemoryData(args[0]) && Array.isArray(args[0].data))) throw new Error("TODO To decorator"); // TODO
    const collection = args[0].data as ParamType[];
    const cycleCoreFactory = args[1] as ExecutableFactory;
    const cycleCore = cycleCoreFactory.getNewExecutableWithContext();
    for (const i of collection) {
      cycleCore.context.createVariable("i", i);
      const commandControl = await cycleCore.execute();
      if (commandControl.return) return commandControl;
    }
    return {};
  }

  @Arguments({max: 1, front: ['numeric']})
  static async coWait(args: ArgType, memory : AbstractMemory) {
    if (args.length == 1) { 
      await sleep(args[0] as number);
    } else {
      await sleep(0);
    } 
    return {};
  }

  @Arguments({max: 1, front: ['numeric']}) 
  static async fill(args: ArgType, memory: AbstractMemory) {
    const tolerance = (args.length == 0)?0:args[0] as number;
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "fill",
      tolerance,
    });
    return {};
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
    memory.createVariable(commandName, codeFactory);
    return {};
  }

  @Arguments({min: 2, front: ['numeric', 'code'] })
  static async conditionalBranching(args: ArgType, memory : AbstractMemory, elifWord : string, elseWord : string) {
    /**
     * usage: if condition { code block if true} [elif (condition) { code block}] else { code block if false }
     */
    let condition = args[0] as number;
    let branchIndex = 1; 

    while (condition == 0 && args.length > 2) {
      const controlWord = args[branchIndex+1];
      if (typeof controlWord !== "string") {
        throw new Error(`IF commmand must have an ${elifWord} or ${elseWord} after a command branch, but the ${branchIndex+1} is ${controlWord}`);
      }
      if (controlWord == elseWord) {
        branchIndex+=2;
        condition = 1; 
      } else if (controlWord == elifWord) {
        const conditionExpression = args[branchIndex+2];
        if (typeof conditionExpression !== "string") {
          throw new Error(`Invalid expression for IF command: ${conditionExpression}`)
        }
        const evaluatedCondition = expressionEval(conditionExpression, memory);
        if (typeof evaluatedCondition !== "number") {
          throw new Error(`Invalid expression for IF command: ${conditionExpression}, it should be number`)
        }
        condition = evaluatedCondition;
        branchIndex+=3;
      } else {
        throw new Error(`IF commmand: After a control block there must be ${elseWord} or ${elifWord}, got ${controlWord}`);
      }
    }

    let commandControl = {} as CommandControl;
    
    const executableBranchFactory = args[branchIndex];
    if (!isExecutableFactory(executableBranchFactory)) {
      throw new Error(`Invalid codeblock at IF command at position ${branchIndex}`);
    }
    const branch = executableBranchFactory.getNewExecutableWithContext();

    if (condition) {
      commandControl = await branch.execute();
      if (commandControl.return) return commandControl;
    }
    return {};
  }

  @Arguments([['numeric', 'code', 'array']])
  static async eval(arg : ArgType, memory : AbstractMemory) {
    return {returnValue: arg[0]} as CommandControl;
  }

  @Arguments({min: 1, default: new Set<PossibleArgumentParsingMethods>(['array', 'numeric'])})
  static async normalPrint(arg : ArgType, memory : AbstractMemory) {
    await CoreCommands.print(arg, false);
    return {};
  }

  @Arguments({min: 1, default: new Set<PossibleArgumentParsingMethods>(['array', 'numeric'])})
  static async errorPrint(arg : ArgType, memory : AbstractMemory) {
    await CoreCommands.print(arg, true);
    return {};
  }

  static async print(arg : ArgType, error : boolean) {
    let message = "";
    for (const i of arg) {
      if (isStructuredMemoryData(i)) {
        if (!Array.isArray(i.data)) new Error("Print only supports string arrays and numbers"); 
        const array = i.data as ParamType[];
        // Is this an ascii string?
        for (const c of array) {
          if (typeof c === "number" && c > 0 && c < 255) {
            message += String.fromCharCode(c);
          } else {
            new Error("Print only supports string arrays and numbers"); // TODO Recursive message conversion
          }
        }
        message += " ";
      } else {
        const value = i as number;
        message += `${value} `;
      }
    }
    turtleCommandPubSub.publish({
      topic: "systemCommand",
      command: "print",
      message,
      error,
    });
    return {};
  }

  @Arguments([])
  static async clearScreen(arg : ArgType, memory : AbstractMemory) {
    turtleCommandPubSub.publish({
      topic: "systemCommand",
      command: "clearScreen"
    });
    return {};
  }
}