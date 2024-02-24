import { tokensToCommandList } from "./CommandList";
import { tokenizer } from "./Tokenizer";
import Core from "./core";

type SuccesfulExecuteResponse = {
  success: true,
  response: string,
}

type WrongfulExecuteResponse = {
  success: false,
  phase: string,
  errorCode: number,
  errorLine: number,
  errorChar: number,
}

type ExecuteResponse = WrongfulExecuteResponse | SuccesfulExecuteResponse;



class Interpreter {
  core : Core = new Core();

  async execute(code: string) {
    const tokens = tokenizer(code);
    const commandList = tokensToCommandList(tokens);
    this.core.executeCommands(commandList);
  }
}

export default Interpreter;