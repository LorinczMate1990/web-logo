import { memo } from "react";
import { turtleCommandPubSub } from "../pubsub/pubsubs";
import { AbstractMemory, ArgType, ExecutableFactory, ExecutableWithContext, isExecutableFactory, ParamType } from "./types";
import { numericEval, stringEval } from "./numericEval";
import BuiltinDictionary from "./builtinDicts/english";
import { CommandsWithContextFactory } from "./core";

/*
  These must be converted to ParamType which is = string | ExecutableFactory | StructuredMemoryData
  Rules:
    * word : will be string, will be handled as a string literal
    * 
*/

type PossibleArgumentParsingMethods = 'word' | 'string' | 'numeric' | 'code' | 'variable';

type ArgumentListConstraint = {
  front?: (PossibleArgumentParsingMethods | Set<PossibleArgumentParsingMethods>)[],
  back?: (PossibleArgumentParsingMethods | Set<PossibleArgumentParsingMethods>)[],
  default?: (PossibleArgumentParsingMethods | Set<PossibleArgumentParsingMethods>),
  min?: number,
  max?: number,
  exact?: number,
} | PossibleArgumentParsingMethods[];

function isValidWord(possibleWord : string) {
  return /^\p{L}+\p{N}*$/u.test(possibleWord);
}

function toSet(a: PossibleArgumentParsingMethods | Set<PossibleArgumentParsingMethods>): Set<PossibleArgumentParsingMethods> {
  if (typeof a === "string") {
    return new Set([a]);
  }
  return a;
}

function Arguments(constraints : ArgumentListConstraint) {
  return function(
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<(args: ArgType, memory: AbstractMemory) => Promise<void>>
  ) : TypedPropertyDescriptor<(args: ArgType, memory: AbstractMemory) => Promise<void>> {
    const originalMethod = descriptor.value!;
    descriptor.value = async function(args: ArgType, context: AbstractMemory) {
      if (Array.isArray(constraints)) {
        const simplifiedConstraints = constraints
        constraints = {
          front: [],
          exact: simplifiedConstraints.length
        };
        for (const i of simplifiedConstraints) {
          constraints.front!.push(new Set([i]));
        }
      }
      let useFrontUntil = constraints.front?.length ?? 0;
      let useBackAfter = args.length - (constraints.back?.length ?? 0) - 1;
      if (constraints.exact && constraints.exact != args.length) throw new Error(`${String(propertyKey)} must have exactly ${constraints.exact} arguments. (Got ${args.length})`);
      if (constraints.min && constraints.min > args.length) throw new Error(`${String(propertyKey)} must have at least ${constraints.min} arguments. (Got ${args.length})`);
      if (constraints.max && constraints.max < args.length) throw new Error(`${String(propertyKey)} must have max ${constraints.max} arguments. (Got ${args.length})`);

      const validatedArgs : ArgType = [];
      for (let i=0; i<args.length; ++i) {
        let arg = args[i];
        let enabledTypes = new Set<PossibleArgumentParsingMethods>();
        if (constraints.front && i<useFrontUntil) {
          enabledTypes = toSet(constraints.front[i]);
        } else if (constraints.back && i>useBackAfter) {
          enabledTypes = toSet(constraints.back[i - useBackAfter - 1]);
        } else if (constraints.default) {
          enabledTypes = toSet(constraints.default);
        }
        if (enabledTypes.has('word') && enabledTypes.size > 1) {
          // word can't be diferentiated from other things. I could use string here, but currently I won't let it
          // NOTE: If it is needed, numeric and string can be enabled
          throw new Error(`Coding error: ${String(propertyKey)} for ${i}. argument lets word and other types`)
        } 

        if (typeof arg === "string") {
          // This can be many things:
          //  - A numeric expression containing numbers and variables
          //  - A string expression containing a template string
          //  - A single variable containing a number/string or an Executable
          //
          if (enabledTypes.has('word') && isValidWord(arg)) {
            validatedArgs.push(arg);
          } else if (context.hasVariable(arg) && (enabledTypes.has('variable') || enabledTypes.has('code'))) {
            // TODO I should check the variable type
            validatedArgs.push(context.getVariable(arg));
          } else if (arg[0] == "\"" && enabledTypes.has('string')) {
            validatedArgs.push(stringEval(arg, context));
          } else if (arg in BuiltinDictionary && enabledTypes.has('code')) {
            // TODO This won't even work. I should handle the elements of BuiltinDictionary as any other variable containing a code
            validatedArgs.push(arg);
          } else if (enabledTypes.has('numeric')) {
            try {
              validatedArgs.push(""+numericEval(arg, context));
            } catch (e) {
              throw new Error(`${String(propertyKey)}: Arg ${i} is not a valid numeric expression: ${e}`);
            }
          } else {
            throw new Error(`${String(propertyKey)}: Arg ${i} is not valid. Enabled variables: ${Array.from(enabledTypes).join(", ")}`);
          }
        } else {
          if (enabledTypes.has('code')) {
            if (isExecutableFactory(arg)) {
              validatedArgs.push(arg);
            } else {
              throw new Error(`The ${i}. input of ${String(propertyKey)} is a memory block, not a code block`);
            }
          } else {
            throw new Error(`The ${i}. input of ${String(propertyKey)} can't be a code block. It can be ${Array.from(enabledTypes).join(", ")}`);
          }
        }
  
      }

      // Call the original function
      await originalMethod(validatedArgs, context);
    };
    return descriptor;
  }
}

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