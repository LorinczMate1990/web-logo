import { tokensToCommandList } from "./CommandList";
import { tokenizer } from "./Tokenizer";
import BuiltinDictionary from "./builtinDicts/english";
import Core from "./core";

class Interpreter {
  core : Core = new Core();

  getKeywordList() {
    // TODO : Translating keyword is an important featur
    // When keywords are translated, this list must be updated, too
    return [...Object.keys(BuiltinDictionary), ...BuiltinDictionary.extraKeywords];
  }

  async execute(code: string) {
    const tokens = tokenizer(code);
    const commandList = tokensToCommandList(tokens);
    await this.core.executeCommands(commandList);
  }
}

export default Interpreter;