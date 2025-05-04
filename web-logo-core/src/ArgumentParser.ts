import BuiltinDictionary from "./builtinDicts/english";
import { expressionEval } from "./expressionEval/expressionEval";
import { AbstractMemory, ArgType, CommandControl, isExecutableFactory } from "./types";

export type PossibleArgumentParsingMethods = 'word' | 'numeric' | 'code' | 'variable' | 'array' | "ignore";

type ArgumentListConstraint = {
  variableArgumentLists?: false, 
  front?: (PossibleArgumentParsingMethods | Set<PossibleArgumentParsingMethods>)[],
  back?: (PossibleArgumentParsingMethods | Set<PossibleArgumentParsingMethods>)[],
  default?: (PossibleArgumentParsingMethods | Set<PossibleArgumentParsingMethods>),
  min?: number,
  max?: number,
  exact?: number,
} 
| (PossibleArgumentParsingMethods | PossibleArgumentParsingMethods[])[]
| { 
  variableArgumentLists: true, 
  [key : number] : (PossibleArgumentParsingMethods | PossibleArgumentParsingMethods[])[]
};

function isValidWord(possibleWord : string) {
  return /^\p{L}+\p{N}*$/u.test(possibleWord);
}

function toSet(a: PossibleArgumentParsingMethods | Set<PossibleArgumentParsingMethods>): Set<PossibleArgumentParsingMethods> {
  if (typeof a === "string") {
    return new Set([a]);
  }
  return a;
}

export function getProcessedArgumentList(args : ArgType, enabledTypes : Set<PossibleArgumentParsingMethods>[], context: AbstractMemory) : ArgType {
  const validatedArgs : ArgType = [];
  for (let i=0; i<args.length; ++i) {
    let arg = args[i];
    let enabledType = enabledTypes[i];
    if (typeof arg === "string") {
      // This can be many things:
      //  - A numeric expression containing numbers and variables
      //  - A string expression containing a template string
      //  - A single variable containing a number/string or an Executable
      //  - An array
      if (enabledType.has('ignore')) {
        validatedArgs.push(arg);
      } else if (enabledType.has('word') && isValidWord(arg)) {
        validatedArgs.push(arg);
      } else if (context.hasVariable(arg) && (enabledType.has('variable') || enabledType.has('code'))) {
        // TODO I should check the variable type
        validatedArgs.push(context.getVariable(arg));
      } else if (arg in BuiltinDictionary && enabledType.has('code')) {
        throw new Error(`Arg ${i} seems like a built-in command, but it cannot be used as argument. Use a wrapper function`);
      } else if (enabledType.has('numeric') || enabledType.has('array')) {
        try {
          validatedArgs.push(expressionEval(arg, context)); // TODO : Must be checked if the resulted type is enabled or not (string and array is the same)
        } catch (e) {
          throw new Error(`Arg ${i} is not a valid expression: ${e}`);
        }
      } else if (enabledType.size == 0) {
        validatedArgs.push(arg);
      } else {
        throw new Error(`Arg ${i} is not valid. Enabled variables: ${Array.from(enabledType).join(", ")}`);
      }
    } else {
      if (enabledType.has('code') || enabledType.size == 0) {
        if (isExecutableFactory(arg)) {
          validatedArgs.push(arg);
        } else {
          throw new Error(`The ${i}. input is a memory block, not a code block`);
        }
      } else {
        throw new Error(`The ${i}. input can't be a code block. It can be ${Array.from(enabledType).join(", ")}`);
      }
    }

  }
  return validatedArgs;
}

// This is a decorator
export function Arguments(constraints : ArgumentListConstraint) {
  return function(
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<(args: ArgType, memory: AbstractMemory, ...extraArgs: any[]) => Promise<CommandControl>>
  ) : TypedPropertyDescriptor<(args: ArgType, memory: AbstractMemory, ...extraArgs: any[]) => Promise<CommandControl>> {
    const originalMethod = descriptor.value!;
    descriptor.value = async function(args: ArgType, context: AbstractMemory, ...extraArgs: any[]) {
      let localConstraints = constraints;
      if (!Array.isArray(localConstraints) && localConstraints.variableArgumentLists) {
        const argumentList = localConstraints[args.length]
        if (argumentList === undefined) {
          throw new Error(`${String(propertyKey)} can't have ${args.length} arguments`);
        }
        localConstraints = argumentList;
      } 
      if (Array.isArray(localConstraints)) {
        const simplifiedConstraints = localConstraints
        localConstraints = {
          front: [],
          exact: simplifiedConstraints.length
        };
        for (const i of simplifiedConstraints) {
          localConstraints.front!.push(Array.isArray(i)?new Set(i):new Set([i]));
        }
      }
      let useFrontUntil = localConstraints.front?.length ?? 0;
      let useBackAfter = args.length - (localConstraints.back?.length ?? 0) - 1;
      if (localConstraints.exact && localConstraints.exact != args.length) throw new Error(`${String(propertyKey)} must have exactly ${localConstraints.exact} arguments. (Got ${args.length})`);
      if (localConstraints.min && localConstraints.min > args.length) throw new Error(`${String(propertyKey)} must have at least ${localConstraints.min} arguments. (Got ${args.length})`);
      if (localConstraints.max && localConstraints.max < args.length) throw new Error(`${String(propertyKey)} must have max ${localConstraints.max} arguments. (Got ${args.length})`);
      
      let enabledTypes : Set<PossibleArgumentParsingMethods>[] = [];

      for (let i=0; i<args.length; ++i) {
        let enabledType = new Set<PossibleArgumentParsingMethods>();
        if (localConstraints.front && i<useFrontUntil) {
          enabledType = toSet(localConstraints.front[i]);
        } else if (localConstraints.back && i>useBackAfter) {
          enabledType = toSet(localConstraints.back[i - useBackAfter - 1]);
        } else if (localConstraints.default) {
          enabledType = toSet(localConstraints.default);
        }
        if (enabledType.has('word') && (enabledType.has('variable') || enabledType.has('numeric') || enabledType.has('code') || enabledType.has('array'))) {
          // These and words can't differentiated in every time
          throw new Error(`Coding error: ${String(propertyKey)} for ${i}. argument lets word and other types`)
        } 
        enabledTypes.push(enabledType);
      }
      
      let validatedArgs : ArgType = [];
      try {
         validatedArgs = getProcessedArgumentList(args, enabledTypes, context);
      } catch (e) {
        throw new Error(`${String(propertyKey)}: `+e);
      }
        
      // Call the original function
      return originalMethod(validatedArgs, context, ...extraArgs);
    };
    return descriptor;
  }
}