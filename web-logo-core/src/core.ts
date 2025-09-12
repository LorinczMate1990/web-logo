import { Commands } from "./CommandList.js";
import { getProcessedArgumentList, PossibleArgumentParsingMethods } from "./ArgumentParser.js";
import BuiltinDictionary from "./builtinDicts/english.js";
import { Memory } from "./memory/memory.js";
import { InterceptableMemory, ExecutableWithContext, ExecutableFactory, MemoryMetaData, ParamType, CommandControl, InterpreterHooks, VariableGetter } from "./types.js";
import { expressionEval } from "./expressionEval/expressionEval.js";
import { turtleCommandPubSub } from "./pubsub/pubsubs.js";

export class CommandsWithContext extends ExecutableWithContext {
  commands : Commands;
  context : InterceptableMemory;
  meta: MemoryMetaData | undefined;
  hooks : InterpreterHooks;
  sessionId : string;
  dataInjector? : VariableGetter;

  constructor(commands: Commands, context : InterceptableMemory, meta : MemoryMetaData | undefined, hooks: InterpreterHooks, sessionId : string) {
    super();
    this.sessionId = sessionId;
    this.commands = commands;
    this.context = context;
    this.meta = meta;
    this.hooks = hooks;
  }
  async execute() : Promise<CommandControl> {
    const commandLevelExecution = this.meta != undefined; // TODO : Currently the meta only means that this is a command
    for (let command of this.commands) {
      if (this.hooks.beforeRunNewCommand) {
        await this.hooks.beforeRunNewCommand({command, sessionId: this.sessionId, flushCommandQueue: () => turtleCommandPubSub.publish() });
      }
      try {
        const label = command.label;
        let evaluatedLabel = undefined;
        try {
          evaluatedLabel = expressionEval(label, this.context);
        } catch (error) {}
        // TODO This should be done from the ArgumentParser,
        const packedArguments = command.arguments.map((arg) => {
          if (typeof arg === "string") {
            return arg;
          } else {
            return new CommandsWithContextFactory(arg, this.context, this.hooks, this.sessionId);
          }
        });
        // The label can be a built-in command or a command in memory.
        let receviedCommandControl : CommandControl; 
        if (label in BuiltinDictionary) {
          const func = BuiltinDictionary[label];
          receviedCommandControl = await func(packedArguments, this.context);
        } else if (evaluatedLabel instanceof CommandsWithContextFactory) {
          const commandFactory = this.context.getVariable(label) as CommandsWithContextFactory;
          // Set variables
          // Check the numbers! This dialect doesn't support variable argument list
          const executable = commandFactory.getNewExecutableWithContext(this.context.getInterceptor());
          const commandIsCalled = executable.meta != undefined;
          if (commandIsCalled) {
            const numOfArguments = packedArguments.length;
            const argTypes = Array.from({ length: packedArguments.length }, () => new Set<PossibleArgumentParsingMethods>(['numeric', 'array', 'code', 'object']));
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
          const fullExpression = `${label} ${command.arguments.map((a) => {
            if (typeof a === "string") {
              return a;
            } else {
              throw new Error("Expression can not contain any code block");
            }
          }).join(" ")}`;
          const processedEvaluation = getProcessedArgumentList([fullExpression], [new Set<PossibleArgumentParsingMethods>(['numeric', 'array', 'object'])], this.context);
          receviedCommandControl = {returnValue: processedEvaluation[0] as ParamType}
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
      } catch (error) {
        throw new Error(`At line ${command.lineNumber+1}: ${error}`)
      }
    }
    return { }
  }
}

export class CommandsWithContextFactory extends ExecutableFactory {
  commands : Commands;
  parentContext : InterceptableMemory;
  hooks : InterpreterHooks;
  sessionId : string;
  
  constructor(commands: Commands, parentContext: InterceptableMemory, hooks: InterpreterHooks, sessionId : string) {
    super();
    this.commands = commands;
    this.parentContext = parentContext;
    this.hooks = hooks;
    this.sessionId = sessionId;
  }
  
  meta: MemoryMetaData | undefined;

  getNewExecutableWithContext(dataInjector? : VariableGetter): ExecutableWithContext {
    const newMemory = new Memory(this.parentContext, dataInjector);

    return new CommandsWithContext(this.commands, newMemory, this.meta, this.hooks, this.sessionId);
  }

}

// TODO This whole code is too coupled. I have to create interfaces

class Core {
  globalMemory : InterceptableMemory;
  hooks : InterpreterHooks;

  constructor(hooks : InterpreterHooks) {
    this.globalMemory = new Memory(undefined, undefined);
    this.hooks = hooks;
  }

  async executeCommands(commands : Commands, sessionId : string) {
    const commandsWithContext = new CommandsWithContext(commands, this.globalMemory, undefined, this.hooks, sessionId);
    await commandsWithContext.execute();
  }
}

export default Core;