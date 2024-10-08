import { Commands } from "./CommandList";
import BuiltinDictionary from "./builtinDicts/english";
import { Memory } from "./memory/memory";
import { numericEval } from "./numericEval";
import { AbstractMemory, ExecutableWithContext, ExecutableFactory, MemoryMetaData, ParamType } from "./types";

export class CommandsWithContext extends ExecutableWithContext {
  commands : Commands;
  context : AbstractMemory;
  meta: MemoryMetaData | undefined;
  constructor(commands: Commands, context : AbstractMemory, meta : MemoryMetaData | undefined) {
    super();
    this.commands = commands;
    this.context = context;
    this.meta = meta;
  }
  async execute() {
    for (let command of this.commands) {
      const label = command.label;
      const packedArguments = command.arguments.map((arg) => {
        if (typeof arg === "string") { // Maybe this is numeric expression and I have the context to evaluate it right here, so I have to evaluate it.
          // If I can't evaluate it, I just give it toward as a string, but this is not correct, if it's an expression, I should evaluate it and not otherwise.
          try {
            return ""+numericEval(arg, this.context);
          } catch {
            return arg;
          }
        } else {
          return new CommandsWithContextFactory(arg);
        }
      });
      // The label can be a built-in command or a command in memory.
      if (label in BuiltinDictionary) {
        const func = BuiltinDictionary[label];
        await func(packedArguments, this.context);
      } else {
        const possibleCommandFactory = this.context.getVariable(label); // TODO Check if it exists
        alert(possibleCommandFactory);
        console.log({possibleCommandFactory});
        if (possibleCommandFactory instanceof CommandsWithContextFactory && possibleCommandFactory.meta?.type == "command") {
          // Set variables
          // Check the numbers! This dialect doesn't support variable argument list
          const possibleCommand = possibleCommandFactory.getNewExecutableWithContext(this.context);
          if (possibleCommand.meta == undefined) {
            throw new Error("This is an impossible case, the command factory returned with a command without meta");
          }
          const numOfArguments = packedArguments.length;
          if (possibleCommand.meta.arguments.length != numOfArguments) throw Error("TODO : Custom Error"); // TODO
          
          for (let i = 0; i < numOfArguments; ++i) {
            const commandArgumentName = possibleCommand.meta.arguments[i];
            possibleCommand.context.setVariable(commandArgumentName, packedArguments[i]);
          }
          await possibleCommand.execute(); // TODO This is terrible, because every instances the command is executed share the same memory. These kind of executables in the memory should be just a factory, not the executables themselfs
        } else {
          throw new Error("Command not found"); // TODO Custom error
        }
      }
    }
  }
}

export class CommandsWithContextFactory extends ExecutableFactory {
  commands : Commands;
  
  constructor(commands: Commands) {
    super();
    this.commands = commands;
  }
  
  meta: MemoryMetaData | undefined;

  getNewExecutableWithContext(parentContext: AbstractMemory): ExecutableWithContext {
    const newMemory = new Memory(parentContext);
    return new CommandsWithContext(this.commands, newMemory, this.meta);
  }

}

// TODO This whole code is too coupled. I have to create interfaces

class Core {
  globalMemory : AbstractMemory;

  constructor() {
    this.globalMemory = new Memory(undefined);
  }

  async executeCommands(commands : Commands) {
    const commandsWithContext = new CommandsWithContext(commands, this.globalMemory, undefined);
    await commandsWithContext.execute();
  }
}

export default Core;