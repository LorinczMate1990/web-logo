import { turtleCommandPubSub } from "../pubsub/pubsubs";
import { AbstractMemory, ArgType, CommandControl, ExecutableFactory, isExecutableFactory, isStructuredMemoryData, ParamType, StructuredMemoryData } from "../types";
import { Arguments, PossibleArgumentParsingMethods } from "../ArgumentParser";
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
  static async print(arg: ArgType, memory: AbstractMemory, error: boolean) {
    function isStructuredMemoryDataAPrintableString(d : StructuredMemoryData) {
      if (!Array.isArray(d.data)) return false;
      let retValue = "";
      for (const c of d.data) {
        if (!(typeof(c) === "number")) return false;
        if (0 > c || c > 255) return false;
        retValue += String.fromCharCode(c);
      }
      return retValue;
    }

    function formatStructuredData(data: ParamType | string): string {
      if (isExecutableFactory(data)) {
        const {meta} = data;
        if (meta === undefined)
          return "[Inline codeblock]";
        else if (meta.arguments.length === 0) {
          return "[Executable without arguments]";
        } else {
          return `[Executable with arguments: ${meta.arguments.join(", ")}]`;
        }
      } else if (typeof data === "string") {
        return data; // This is impossible
      } else if (typeof data === "number") {
        // Convert to ASCII if possible
        return data.toString();
      } else if (isStructuredMemoryData(data)) {
        if (Array.isArray(data.data)) {
          const possiblePrintableString = isStructuredMemoryDataAPrintableString(data);
          if (possiblePrintableString) {
            return `"${possiblePrintableString}"`;
          } else {
            return `[${data.data.map(formatStructuredData).join(", ")}]`;
          }
        } else {
          return `{ ${Object.entries(data.data)
            .map(([key, value]) => `${key}: ${formatStructuredData(value)}`)
            .join(", ")} }`;
        }
      }
      return "[Unknown Data]";
    }
  
    let message = arg.map(formatStructuredData).join(" ");
    
    turtleCommandPubSub.publish({
      topic: "systemCommand",
      command: "print",
      message,
      error,
    });
  
    return {};
  }

 
}