import { turtleCommandPubSub } from "../pubsub/pubsubs.js";
import { AbstractMemory, ArgType, CommandControl, ExecutableFactory, isExecutableFactory, isStructuredMemoryData, ParamType, StructuredMemoryData } from "../types.js";
import { Arguments, PossibleArgumentParsingMethods } from "../ArgumentParser.js";
import { expressionEval } from "../expressionEval/expressionEval.js";

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

  @Arguments(['ignore', 'code'])
  static async whileCycle(args: ArgType, memory : AbstractMemory) {
    const expression = args[0] as string;
    let expressionResult = expressionEval(expression, memory);
    if (typeof expressionResult != "number") throw new Error("First parameter of while must be an expression with numeric value");
    const cycleCoreFactory = args[1] as ExecutableFactory;
    const cycleCore = cycleCoreFactory.getNewExecutableWithContext();
    while (expressionResult) {
      const commandControl = await cycleCore.execute();
      if (commandControl.return) return commandControl;
      expressionResult = expressionEval(expression, memory);
    }
    return {};
  }

  @Arguments( {variableArgumentLists: true, 2 : ['numeric', 'code'], 3: ['word', 'numeric', 'code']} )
  static async repeat(args: ArgType, memory : AbstractMemory) {
    const repeatNumber = parseFloat(String(args[(args.length == 2)?0:1]));
    const nameOfCylceParameter = (args.length == 2)?"i":(args[0] as string);
    const cycleCoreFactory = ((args.length == 2)?args[1]:args[2]) as ExecutableFactory;
    const cycleCore = cycleCoreFactory.getNewExecutableWithContext();
    const [lowerLimit, upperLimit] = (repeatNumber>0)?[0, repeatNumber]:[repeatNumber+1,1];
    for (let i=lowerLimit; i<upperLimit; ++i) {
      cycleCore.context.createVariable(nameOfCylceParameter, i);
      const commandControl = await cycleCore.execute();
      if (commandControl.return) return commandControl;
    }
    return {};
  }

  @Arguments( {variableArgumentLists: true, 2 : ['array', 'code'], 3: ['word', 'array', 'code']} )
  static async each(args: ArgType, memory : AbstractMemory) {
    const arrayIndex = (args.length == 2)?0:1;
    if (!(isStructuredMemoryData(args[arrayIndex]) && Array.isArray(args[arrayIndex].data))) throw new Error("TODO To decorator"); // TODO
    const collection = args[arrayIndex].data as ParamType[];
    const nameOfCylceParameter = (args.length == 2)?"i":(args[0] as string);
    const cycleCoreFactory = ((args.length == 2)?args[1]:args[2]) as ExecutableFactory;
    const cycleCore = cycleCoreFactory.getNewExecutableWithContext();
    for (const i of collection) {
      cycleCore.context.createVariable(nameOfCylceParameter, i);
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