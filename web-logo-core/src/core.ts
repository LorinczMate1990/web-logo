import { Commands } from "./CommandList";
import { getProcessedArgumentList, PossibleArgumentParsingMethods } from "./ArgumentParser";
import BuiltinDictionary from "./builtinDicts/english";
import { Memory } from "./memory/memory";
import { AbstractMemory, ExecutableWithContext, ExecutableFactory, MemoryMetaData } from "./types";

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
      // TODO This should be done from the ArgumentParser,
      const packedArguments = command.arguments.map((arg) => {
        if (typeof arg === "string") {
          return arg;
        } else {
          return new CommandsWithContextFactory(arg, this.context);
        }
      });
      // The label can be a built-in command or a command in memory.
      if (label in BuiltinDictionary) {
        const func = BuiltinDictionary[label];
        await func(packedArguments, this.context);
      } else {
        if (!this.context.hasVariable(label)) {
          throw new Error(`Command '${label}' not found`);
        }
        const possibleCommandFactory = this.context.getVariable(label); // TODO Check if it exists
        if (possibleCommandFactory instanceof CommandsWithContextFactory) {
          // Set variables
          // Check the numbers! This dialect doesn't support variable argument list
          const possibleCommand = possibleCommandFactory.getNewExecutableWithContext();
          if (possibleCommand.meta != undefined) { // If it has no meta, it can't accept any argument, it's just an inline codeblock
            const numOfArguments = packedArguments.length;
            const argTypes = Array.from({ length: packedArguments.length }, () => new Set<PossibleArgumentParsingMethods>(['numeric', 'array', 'code']));
            const processedArguments = getProcessedArgumentList(packedArguments, argTypes, this.context);
            
            for (let i = 0; i < numOfArguments; ++i) {
              const processedArgument = processedArguments[i];
              const commandArgumentName = possibleCommand.meta.arguments[i];
              if (typeof processedArgument == "string") throw new Error("This shouldn't be possible");
              possibleCommand.context.setVariable(commandArgumentName, processedArgument);
            }
          }
          await possibleCommand.execute();
        } else {
          throw new Error(`'${label}' contains '${this.context.getVariable(label)}', not an executable`);
        }
      }
    }
  }
}

export class CommandsWithContextFactory extends ExecutableFactory {
  commands : Commands;
  parentContext : AbstractMemory;
  
  constructor(commands: Commands, parentContext: AbstractMemory) {
    super();
    this.commands = commands;
    this.parentContext = parentContext;
  }
  
  meta: MemoryMetaData | undefined;

  getNewExecutableWithContext(): ExecutableWithContext {
    const newMemory = new Memory(this.parentContext);
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