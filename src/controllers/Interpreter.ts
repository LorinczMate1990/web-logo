import { tokensToCommandList } from "./CommandList";
import { tokenizer } from "./Tokenizer";
import Core from "./core";

class Interpreter {
  core : Core = new Core();

  async execute(code: string) {
    const tokens = tokenizer(code);
    const commandList = tokensToCommandList(tokens);
    await this.core.executeCommands(commandList);
  }
}

export default Interpreter;