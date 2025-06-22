import { tokensToCommandList } from "./CommandList.js";
import { tokenizer } from "./Tokenizer.js";
import BuiltinDictionary from "./builtinDicts/english.js";
import Core from "./core.js";
import { InterpreterHooks } from "./types.js";

class Interpreter {
  core : Core;
  hooks : InterpreterHooks;

  constructor(hooks : InterpreterHooks) {
    this.core = new Core(hooks);
    this.hooks = hooks;
  }

  getKeywordList() {
    // TODO : Translating keyword is an important featur
    // When keywords are translated, this list must be updated, too
    return [...Object.keys(BuiltinDictionary), ...BuiltinDictionary.extraKeywords];
  }

  makeId(length : number) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

  async execute(code: string) {
    const tokens = tokenizer(code);
    const commandList = tokensToCommandList(tokens);
    const uuid = this.makeId(15);
    if (this.hooks.beforeStartSession) await this.hooks.beforeStartSession({sessionId: uuid});
    try {
      await this.core.executeCommands(commandList, uuid);
    } catch (e) {
      if (this.hooks.afterError) await this.hooks.afterError({sessionId: uuid, error: e as Error});
      throw e;
    }
    if (this.hooks.afterFinishSession) await this.hooks.afterFinishSession({sessionId: uuid});
  }
}

export default Interpreter;