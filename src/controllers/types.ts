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

export type ParamType = string | ExecutableFactory | StructuredMemoryData;
export type ArgType = ParamType[];

export function isParamType(v : any) : v is ParamType {
  return (typeof v === "string" || isExecutableWithContext(v) || isStructuredMemoryData(v));
}

export function isExecutableWithContext(v : any) : v is ExecutableWithContext {
  return v.ExecutableWithContextSymbol === ExecutableWithContext.StaticExecutableWithContextSymbol;
}

export function isExecutableFactory(v : any) : v is ExecutableFactory {
  return v.ExecutableFactorySymbol === ExecutableFactory.StaticExecutableFactorySymbol;
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
  abstract get meta() : MemoryMetaData | undefined;
}

export abstract class ExecutableFactory {
  static StaticExecutableFactorySymbol = Symbol('ExecutableFactory');
  ExecutableFactorySymbol = ExecutableFactory.StaticExecutableFactorySymbol;

  abstract getNewExecutableWithContext(parentContext : AbstractMemory) : ExecutableWithContext;
  abstract get meta() : MemoryMetaData | undefined;
  abstract set meta(m : MemoryMetaData | undefined);
}

export interface VariableGetter {
  getVariable(key : string) : ParamType;
  hasVariable(key : string) : boolean;
}

export interface VariableSetter {
  setVariable(key : string, value : ParamType) : void;
}

export type MemoryMetaData = {
  type: "command", 
  arguments: string[]
}

export interface AbstractMemory extends VariableGetter, VariableSetter {

}

export interface HasContextMemory {
  get context() : AbstractMemory;
}