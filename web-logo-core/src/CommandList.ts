import { Token } from "./Tokenizer";

export type Commands = Command[];

export class Command {
  label: string;
  arguments: (string | Commands)[];
  returnVariable : string | undefined;
  createNewVariableForReturn : boolean;

  constructor(label: Token) {
    this.label = label.val;
    this.arguments = [];
    this.createNewVariableForReturn = false;
  }

  addArgument(argument: Token | Commands) {
    if (argument instanceof Token) {
      this.arguments.push(argument.val);
    } else {
      this.arguments.push(argument);
    }
  }

  setReturnVariable(name : Token, createNewVariable : boolean) {
    this.returnVariable = name.toString();
    this.createNewVariableForReturn = createNewVariable;
  }
}

/**
 * The tokens will be converted to processed commands here.
 * The syntax of this dialect is the following:
 * [COMMAND LABEL] argument1 (argument2 which contains spaces) { ... This contains additional commands ... } \n
 * So every command has a label. For example: forward
 * The labels are followed by zero or more arguments
 *    An argument can be a single word (string literal, number, expression without space) or multiple words in parenthesis, like ( 3  <  2)
 *    An argument can be a series of commands. These commands must be between { and }. 
 *    The command must be closed by a new line character. Teh simple arguments must not contain \n, but the command series can of course.  
 */

type Wrapper = {
  tokens : Token[],
  pointer : number,
}

export function tokensToCommandList(tokens: Token[]): Commands {
  const wrapper : Wrapper = {
    tokens,
    pointer: 0
  };

  return _tokensToCommandList(wrapper);
}

function _tokensToCommandList(w : Wrapper) : Commands {
  const commands : Commands = [];
  let currentCommand : Command | null = null;
  let mustStartNewCommand = false;
  while (w.pointer < w.tokens.length) {
    if (w.tokens[w.pointer].eq("{")) {
      w.pointer++;
      const subCommands = _tokensToCommandList(w);
      if (currentCommand === null) {
        return subCommands; // TODO : I have to check that the tokens list is empty.
      } else {
        currentCommand.addArgument(subCommands);
      }
    } else if (w.tokens[w.pointer].eq("}")) {
      if (currentCommand !== null) {
        commands.push(currentCommand);
      }
      w.pointer++;
      return commands;
    } else if (w.tokens[w.pointer].eq("\n")) {
      w.pointer++;
      if (currentCommand === null) continue; // Is this even possible?
      commands.push(currentCommand);
      currentCommand = null;
    } else {
      if (currentCommand === null) {
        currentCommand = new Command(w.tokens[w.pointer]);
        mustStartNewCommand = false;
      } else {
        if (mustStartNewCommand) throw new Error("There can not be more arguments after a return variable name"); // TODO Ugly message
        if (w.tokens[w.pointer].eq("=>")) {
          w.pointer++;
          let createNewVariable = false;
          if (w.tokens[w.pointer].eq("new")) {
            w.pointer++;
            createNewVariable = true;
          }
          currentCommand.setReturnVariable(w.tokens[w.pointer], createNewVariable);
          mustStartNewCommand = true;
        } else {
          currentCommand.addArgument(w.tokens[w.pointer]);
        }
      }
      w.pointer++;
    }
  }
  if (currentCommand !== null) commands.push(currentCommand);
  return commands;
}