import { tokensToCommandList } from "./CommandList.js";
import { tokenizer } from "./Tokenizer.js";
import BuiltinDictionary from "./builtinDicts/english.js";
import Core from "./core.js";
import { InterpreterHooks } from "./types.js";

class Interpreter {
  core : Core;

  constructor(hooks : InterpreterHooks) {
    this.core = new Core(hooks);
  }

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