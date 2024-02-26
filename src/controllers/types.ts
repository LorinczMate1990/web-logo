export type SuccesfulExecuteResponse = {
  success: true,
  response: string,
}

export type WrongfulExecuteResponse = {
  success: false,
  phase: string,
  errorCode: number,
  errorLine: number,
  errorChar: number,
}

export type ExecuteResponse = WrongfulExecuteResponse | SuccesfulExecuteResponse;

export type ParamType = string | ExecutableWithContext | number;

export interface Executable {
  execute() : Promise<void>;
}

export interface ExecutableWithContext extends Executable, HasContextMemory {

}

export interface VariableGetter {
  getVariable(key : string) : ParamType;
}

export interface VariableSetter {
  setVariable(key : string, value : ParamType) : void;
}

export type MemoryMetaData = {
  type: "command", 
  arguments: string[]
}

export interface AbstractMemory extends VariableGetter, VariableSetter {
  get meta() : MemoryMetaData | undefined;
  set meta(m : MemoryMetaData | undefined);
}

export interface HasContextMemory {
  get context() : AbstractMemory;
}

export type ArgType = (string | ExecutableWithContext)[];