import { Commands } from "./CommandList";
import BuiltinDictionary from "./builtinDicts/english";
import { Memory } from "./memory/memory";
import { AbstractMemory, ExecutableWithContext, MemoryMetaData, ParamType } from "./types";

export class CommandsWithContext extends ExecutableWithContext {
  commands : Commands;
  context : AbstractMemory;
  constructor(commands: Commands, context : AbstractMemory) {
    super();
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
        const possibleCommand = this.context.getVariable(label); // TODO Check if it exists
        if (possibleCommand instanceof CommandsWithContext && possibleCommand.context.meta?.type == "command") {
          // Set variables
          // Check the numbers! This dialect doesn't support variable argument list
          const numOfArguments = packedArguments.length;
          if (possibleCommand.context.meta.arguments.length != numOfArguments) throw Error("TODO : Custom Error"); // TODO
          
          for (let i = 0; i < numOfArguments; ++i) {
            const commandArgumentName = possibleCommand.context.meta.arguments[i];
            possibleCommand.context.setVariable(commandArgumentName, packedArguments[i]);
          }
          await possibleCommand.execute();
        } else {
          throw new Error("Command not found"); // TODO Custom error
        }
      }
    }
  }
}

// TODO This whole code is too coupled. I have to create interfaces

class Core {
  globalMemory : AbstractMemory;

  constructor() {
    this.globalMemory = new Memory(undefined);
  }

  async executeCommands(commands : Commands) {
    const commandsWithContext = new CommandsWithContext(commands, this.globalMemory);
    await commandsWithContext.execute();
  }
}

export default Core;