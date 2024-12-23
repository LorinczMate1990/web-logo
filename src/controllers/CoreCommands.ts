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
  front?: Set<PossibleArgumentParsingMethods>[],
  back?: Set<PossibleArgumentParsingMethods>[],
  default?: Set<PossibleArgumentParsingMethods>,
  min?: number,
  max?: number,
  exact?: number,
} | PossibleArgumentParsingMethods[];

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
      let useBackAfter = args.length - (constraints.back?.length ?? 0);
      if (constraints.exact && constraints.exact != args.length) throw new Error(`${String(propertyKey)} must have exactly ${constraints.exact} arguments. (Got ${args.length})`);
      if (constraints.min && constraints.min > args.length) throw new Error(`${String(propertyKey)} must have at least ${constraints.min} arguments. (Got ${args.length})`);
      if (constraints.max && constraints.max < args.length) throw new Error(`${String(propertyKey)} must have max ${constraints.max} arguments. (Got ${args.length})`);

      const validatedArgs : ArgType = [];
      for (let i=0; i<args.length; ++i) {
        let arg = args[i];
        let enabledTypes = new Set<PossibleArgumentParsingMethods>();
        if (constraints.front && i<useFrontUntil) {
          enabledTypes = constraints.front[i];
        } else if (constraints.front && i>useBackAfter) {
          enabledTypes = constraints.front[i-useBackAfter];
        } else if (constraints.default) {
          enabledTypes = constraints.default;
        }

        if (typeof arg === "string") {
          // This can be many things:
          //  - A numeric expression containing numbers and variables
          //  - A string expression containing a template string
          //  - A single variable containing a number/string or an Executable
          //
          if (context.hasVariable(arg) && (enabledTypes.has('variable') || enabledTypes.has('code'))) {
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
            throw new Error(`The ${i}. input of ${String(propertyKey)} can't be a code block`);
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

  static async setPenColor(args: ArgType, memory : AbstractMemory) {
    if (typeof args[0] !== "string") throw new Error("I have to create a custom error for this");
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "setPenColor",
      color: args[0],
    });
  }

  static async setPenWidth(args: ArgType, memory : AbstractMemory) {
    if (typeof args[0] !== "string") throw new Error("I have to create a custom error for this");
    const width = parseFloat(args[0]);
    if (isNaN(width)) throw new Error("The width has invalid format");
    
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "setPenWidth",
      width,
    });
  }

  static async goHome(args: ArgType, memory : AbstractMemory) {
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "goHome",
    });
  }
  
  static async setHome(args: ArgType, memory : AbstractMemory) {
    // TODO
  }

  // Program control

  static async repeat(args: ArgType, memory : AbstractMemory) {
    if (typeof args[0] !== "string") throw new Error("I have to create a custom error for this"); // TODO decorator?
    const repeatNumber = parseFloat(args[0]);
    const cycleCoreFactory = args[1] as ExecutableFactory; // TODO It is?
    const cycleCore = cycleCoreFactory.getNewExecutableWithContext();
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
    if (args.length <= 1) throw Error("Learn needs at least 2 parameters");
    if (typeof (args[args.length-1]) === "string") throw Error("The last parameter of learn must be a codeblock")
    for (let i=0; i<args.length-1; ++i) {
      if (typeof args[i] !== "string") throw new Error("I have to create a custom error for this");
    }
    const commandName = args[0] as string;
    const argNames = args.slice(1, args.length-1) as string[];
    const codeFactory = args[args.length - 1] as ExecutableFactory;
    codeFactory.meta = {type: "command", arguments: argNames};
    memory.setVariable(commandName, codeFactory);
  }

  static async conditionalBranching(args: ArgType, memory : AbstractMemory) {
    /**
     * usage: if condition { code block if true} { code block if false }
     */
    if (args.length != 2 && args.length != 3) throw Error("I have to create a custom error for this. And decorators");
    if (typeof (args[1]) === "string") throw Error("The second parameter is string");
    if (typeof (args[args.length-1]) === "string") throw Error("The last parameter is string");
    if (typeof args[0] !== "string") throw new Error("I have to create a custom error for this");
    
    const condition = parseFloat(args[0]);
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