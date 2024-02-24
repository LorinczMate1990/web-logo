import { turtleCommandPubSub } from "../pubsub/pubsubs";
import { Command, Commands } from "./CommandList";
import BuiltinDictionary from "./builtinDicts/english";

export type ArgType = (string | CommandsWithContext)[];

export class CommandsWithContext {
  commands : Commands;
  context : Memory;
  constructor(commands: Commands, context : Memory) {
    this.commands = commands;
    this.context = context;
  }
  async execute() {
    for (let command of this.commands) {
      const label = command.label;
      const packedArguments = command.arguments.map((arg) => {
        if (typeof arg === "string") {
          return arg;
        } else {
          const newMemory = new Memory(this.context);
          return new CommandsWithContext(arg, newMemory);
        }
      });
      // The label can be a built-in command or a command in memory.
      // TODO : Check if it is a custom function
      // Now I only handle the built-in functions
      if (label in BuiltinDictionary) {
        const func = BuiltinDictionary[label];
        await func(packedArguments, this.context);
      } else {
        throw new Error("This is not implemented yet Or command not found");
      }
    }
  }
}

// TODO This whole code is too coupled. I have to create interfaces
export type ParamType = string | CommandsWithContext | number;

export interface VariableGetter {
  getVariable(key : string) : ParamType;
}

export interface VariableSetter {
  setVariable(key : string, value : ParamType) : void;
}

class Memory implements VariableGetter, VariableSetter {
  parent? : Memory;
  variables : {[key : string] : ParamType} = {};

  constructor(parent : Memory | undefined) {
    this.parent = parent;
  }

  setVariable(key : string, value : ParamType) {
    this.variables[key] = value;
  }

  getVariable(key : string) : ParamType {
    if (key in this.variables) {
      return this.variables[key];
    } 
    if (this.parent === undefined) return 0; 
    return this.parent.getVariable(key);
  }
}

class Core {
  globalMemory : Memory;

  constructor() {
    this.globalMemory = new Memory(undefined);
  }

  async executeCommands(commands : Commands) {
    const commandsWithContext = new CommandsWithContext(commands, this.globalMemory);
    await commandsWithContext.execute();
  }
}

export default Core;