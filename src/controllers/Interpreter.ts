type SuccesfulExecuteResponse = {
    success: true,
    response: string,
}

type WrongfulExecuteResponse = {
    success: false,
    phase : string,
    errorCode: number,
    errorLine : number,
    errorChar : number,
}

type ExecuteResponse = WrongfulExecuteResponse |  SuccesfulExecuteResponse;

class Interpreter {
     /*
    Now I want to create an Interpreter.
The interpreter must do the followings:
Must have an execute function that must execute a part of code and return with a status (later)

The functions of the interpreter are the following:
1) Tokenization: Classic tokenization. Mustly split by spaces
2) Command iteration: My dialect of logo language will 
    */

    async execute(code : string) : ExecuteResponse {

    }
}

export default Interpreter;