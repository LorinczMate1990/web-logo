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

export type ParamType = string | ExecutableWithContext | StructuredMemoryData | number;

export function isParamType(v : any) : v is ParamType {
  return (typeof v === "string" || isExecutableWithContext(v) || isStructuredMemoryData(v));
}

export function isExecutableWithContext(v : any) : v is ExecutableWithContext {
  return v.ExecutableWithContextSymbol === ExecutableWithContext.StaticExecutableWithContextSymbol;
}

export function isStructuredMemoryData(v : any) : v is StructuredMemoryData {
  return v.StructuredMemoryDataSymbol === StructuredMemoryData.StaticStructuredMemoryData;
}


export interface Executable {
  execute() : Promise<void>;
}

export class StructuredMemoryData {
  static StaticStructuredMemoryData = Symbol('StructuredMemoryData');
  StructuredMemoryDataSymbol = StructuredMemoryData.StaticStructuredMemoryData;

  data : object = {};

  constructor(data : object) {
    this.data = data;
  }

}

export abstract class ExecutableWithContext implements Executable, HasContextMemory {
  static StaticExecutableWithContextSymbol = Symbol('ExecutableWithContext');
  ExecutableWithContextSymbol = ExecutableWithContext.StaticExecutableWithContextSymbol;
  
  abstract get context(): AbstractMemory;
  abstract execute(): Promise<void>;
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