import BuiltinDictionary from "./builtinDicts/english";
import { expressionEval } from "./expressionEval";
import { AbstractMemory, ArgType, isExecutableFactory } from "./types";

export type PossibleArgumentParsingMethods = 'word' | 'string' | 'numeric' | 'code' | 'variable' | 'array';

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
      if (enabledType.has('word') && isValidWord(arg)) {
        validatedArgs.push(arg);
      } else if (context.hasVariable(arg) && (enabledType.has('variable') || enabledType.has('code'))) {
        // TODO I should check the variable type
        validatedArgs.push(context.getVariable(arg));
      } else if (arg in BuiltinDictionary && enabledType.has('code')) {
        throw new Error(`Arg ${i} seems like a built-in command, but it cannot be used as argument. Use a wrapper function`);
      } else if (enabledType.has('numeric') || enabledType.has('string') || enabledType.has('array')) {
        try {
          validatedArgs.push(expressionEval(arg, context)); // TODO : Must be checked if the resulted type is enabled or not (string and array is the same)
        } catch (e) {
          throw new Error(`Arg ${i} is not a valid expression: ${e}`);
        }
      } else {
        throw new Error(`Arg ${i} is not valid. Enabled variables: ${Array.from(enabledTypes).join(", ")}`);
      }
    } else {
      if (enabledType.has('code')) {
        if (isExecutableFactory(arg)) {
          validatedArgs.push(arg);
        } else {
          throw new Error(`The ${i}. input is a memory block, not a code block`);
        }
      } else {
        throw new Error(`The ${i}. input can't be a code block. It can be ${Array.from(enabledTypes).join(", ")}`);
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
      
      let enabledTypes : Set<PossibleArgumentParsingMethods>[] = [];

      let enabledType = new Set<PossibleArgumentParsingMethods>();
      for (let i=0; i<args.length; ++i) {
        if (constraints.front && i<useFrontUntil) {
          enabledType = toSet(constraints.front[i]);
        } else if (constraints.back && i>useBackAfter) {
          enabledType = toSet(constraints.back[i - useBackAfter - 1]);
        } else if (constraints.default) {
          enabledType = toSet(constraints.default);
        }
        if (enabledType.has('word') && enabledType.size > 1) {
          // word can't be diferentiated from other things. I could use string here, but currently I won't let it
          // NOTE: If it is needed, numeric and string can be enabled
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
      await originalMethod(validatedArgs, context);
    };
    return descriptor;
  }
}