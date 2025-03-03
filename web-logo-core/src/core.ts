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
    const commandLevelExecution = this.meta != undefined; // TODO : Currently the meta only means that this is a command
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
      let receviedCommandControl : CommandControl; 
      if (label in BuiltinDictionary) {
        const func = BuiltinDictionary[label];
        receviedCommandControl = await func(packedArguments, this.context);
      } else if (this.context.hasVariable(label) && this.context.getVariable(label) instanceof CommandsWithContextFactory) {
        const commandFactory = this.context.getVariable(label) as CommandsWithContextFactory;
        // Set variables
        // Check the numbers! This dialect doesn't support variable argument list
        const executable = commandFactory.getNewExecutableWithContext();
        const commandIsCalled = executable.meta != undefined;
        if (commandIsCalled) {
          const numOfArguments = packedArguments.length;
          const argTypes = Array.from({ length: packedArguments.length }, () => new Set<PossibleArgumentParsingMethods>(['numeric', 'array', 'code']));
          const processedArguments = getProcessedArgumentList(packedArguments, argTypes, this.context);
          
          for (let i = 0; i < numOfArguments; ++i) {
            const processedArgument = processedArguments[i];
            const commandArgumentName = executable.meta.arguments[i];
            if (typeof processedArgument == "string") throw new Error("This shouldn't be possible");
            executable.context.createVariable(commandArgumentName, processedArgument);
          }
        }
        receviedCommandControl = await executable.execute();
      } else {
        if (this.context.hasVariable(label)) {
          receviedCommandControl = {returnValue: this.context.getVariable(label)}
        } else {
          const fullExpression = `${label} ${command.arguments.map((a) => {
            if (typeof a === "string") {
              return a;
            } else {
              throw new Error("Expression can not contain any code block");
            }
          }).join(" ")}`;
          const processedEvaluation = getProcessedArgumentList([fullExpression], [new Set<PossibleArgumentParsingMethods>(['numeric', 'array'])], this.context);
          receviedCommandControl = {returnValue: processedEvaluation[0] as ParamType}
        }
      }
      if (receviedCommandControl.return) {
        return {
          return: !commandLevelExecution,
          returnValue: receviedCommandControl.returnValue,
        };
      }
      if (command.returnVariable) {
        if (receviedCommandControl.returnValue === undefined) {
          throw new Error("There is no return value from the called command");
        }
        if (command.createNewVariableForReturn) {
          this.context.createVariable(command.returnVariable, receviedCommandControl.returnValue);
        } else {
          this.context.setVariable(command.returnVariable, receviedCommandControl.returnValue);
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