import { Commands } from "./CommandList";
import BuiltinDictionary from "./builtinDicts/english";
import { Memory } from "./memory/memory";
import { numericEval, stringEval } from "./numericEval";
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
        if (typeof arg === "string") {
          // This can be many things:
          //  - A numeric expression containing numbers and variables
          //  - A string expression containing a template string
          //  - A single variable containing a number/string or an Executable
          //  - Some simple string without "
          if (this.context.hasVariable(arg)) {
            console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            console.log("So I found a variable. It is: ", this.context.getVariable(arg), typeof this.context.getVariable(arg));
            return this.context.getVariable(arg);
          } else if (arg[0] == "\"") {
            return stringEval(arg, this.context);
          } else if (arg in BuiltinDictionary) {
            return arg;
          } else 
            try {
              return ""+numericEval(arg, this.context);
            } catch {
              return arg
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
        if (!this.context.hasVariable(label)) {
          throw new Error(`Command '${label}' not found`);
        }
        const possibleCommandFactory = this.context.getVariable(label); // TODO Check if it exists
        console.log({possibleCommandFactory});
        if (possibleCommandFactory instanceof CommandsWithContextFactory) {
          // Set variables
          // Check the numbers! This dialect doesn't support variable argument list
          const possibleCommand = possibleCommandFactory.getNewExecutableWithContext(this.context);
          if (possibleCommand.meta != undefined) { // If it has no meta, it can't accept any argument, it's just an inline codeblock
            const numOfArguments = packedArguments.length;
            if (possibleCommand.meta.arguments.length != numOfArguments) throw Error("TODO : Custom Error"); // TODO
            
            for (let i = 0; i < numOfArguments; ++i) {
              const commandArgumentName = possibleCommand.meta.arguments[i];
              possibleCommand.context.setVariable(commandArgumentName, packedArguments[i]);
            }
          }
          await possibleCommand.execute(); // TODO This is terrible, because every instances the command is executed share the same memory. These kind of executables in the memory should be just a factory, not the executables themselfs
        } else {
          console.log({possibleCommandFactory});
          throw new Error(`'${label}' contains '${this.context.getVariable(label)}', not an executable`);
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