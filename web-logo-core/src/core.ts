import { Commands } from "./CommandList";
import { getProcessedArgumentList, PossibleArgumentParsingMethods } from "./ArgumentParser";
import BuiltinDictionary from "./builtinDicts/english";
import { Memory } from "./memory/memory";
import { AbstractMemory, ExecutableWithContext, ExecutableFactory, MemoryMetaData, ParamType, CommandControl } from "./types";

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
  async execute() : Promise<CommandControl> {
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
        const receviedCommandControl = await func(packedArguments, this.context);
        // A built-in command can give back a return value without sending a return signal
        // TODO: Little bit hacky. Must rethink
        if (receviedCommandControl.return) {
          return receviedCommandControl;
        }
        // TODO Also code duplication
        if (receviedCommandControl.returnValue && command.returnVariable) {
          if (command.createNewVariableForReturn) {
            this.context.createVariable(command.returnVariable, receviedCommandControl.returnValue);
          } else {
            this.context.setVariable(command.returnVariable, receviedCommandControl.returnValue);
          }
        }
      } else {
        if (!this.context.hasVariable(label)) {
          throw new Error(`Command '${label}' not found`);
        }
        const possibleCommandFactory = this.context.getVariable(label); // TODO Check if it exists
        if (possibleCommandFactory instanceof CommandsWithContextFactory) {
          // Set variables
          // Check the numbers! This dialect doesn't support variable argument list
          const possibleCommand = possibleCommandFactory.getNewExecutableWithContext();
          const commandIsCalled = possibleCommand.meta != undefined;
          if (commandIsCalled) { // If it has no meta, it can't accept any argument, it's just an inline codeblock
            const numOfArguments = packedArguments.length;
            const argTypes = Array.from({ length: packedArguments.length }, () => new Set<PossibleArgumentParsingMethods>(['numeric', 'array', 'code']));
            const processedArguments = getProcessedArgumentList(packedArguments, argTypes, this.context);
            
            for (let i = 0; i < numOfArguments; ++i) {
              const processedArgument = processedArguments[i];
              const commandArgumentName = possibleCommand.meta.arguments[i];
              if (typeof processedArgument == "string") throw new Error("This shouldn't be possible");
              possibleCommand.context.createVariable(commandArgumentName, processedArgument);
            }
          }
          const receviedCommandControl = await possibleCommand.execute();
          if (receviedCommandControl.return) {
            if (commandIsCalled) {
              if (receviedCommandControl.returnValue && command.returnVariable) {
                if (command.createNewVariableForReturn) {
                  this.context.createVariable(command.returnVariable, receviedCommandControl.returnValue);
                } else {
                  this.context.setVariable(command.returnVariable, receviedCommandControl.returnValue);
                }
              }
            } else {
              return receviedCommandControl;
            }
          }
        } else {
          throw new Error(`'${label}' contains '${this.context.getVariable(label)}', not an executable`);
        }
      }
    }
    return { }
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