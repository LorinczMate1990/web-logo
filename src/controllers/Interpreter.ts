import { tokensToCommandList } from "./CommandList";
import { tokenizer } from "./Tokenizer";
import Core from "./core";

class Interpreter {
  core : Core = new Core();

  async execute(code: string) {
    const tokens = tokenizer(code);
    console.log("tokens: ", tokens);
    const commandList = tokensToCommandList(tokens);
    console.log("commandList: ", commandList);
    this.core.executeCommands(commandList);
  }
}

export default Interpreter;