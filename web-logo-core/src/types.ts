export interface CommandData {
  getLineNumber() : number;
  getCharNumber() : number;
  getLabel() : string;
}

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

export type ParamType = number | ExecutableFactory | StructuredMemoryData;
export type ArgType = (ParamType | string)[];

export function isParamType(v : any) : v is ParamType {
  return (typeof v === "number" || isExecutableWithContext(v) || isStructuredMemoryData(v));
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

export type CommandControl = {
  return? : boolean;
  returnValue? : ParamType;
};

export interface Executable {
  execute() : Promise<CommandControl>
}

export class StructuredMemoryData {
  static StaticStructuredMemoryData = Symbol('StructuredMemoryData');
  StructuredMemoryDataSymbol = StructuredMemoryData.StaticStructuredMemoryData;

  data : ParamType[] | { [key: string]: ParamType } = {};

  static buildFromString(str: string): StructuredMemoryData {
    // Convert each character of the string to its ASCII value
    const asciiArray: number[] = Array.from(str, char => char.charCodeAt(0));

    // Create a new instance of StructuredMemoryData using the ASCII array
    return new StructuredMemoryData(asciiArray);
  }

  constructor(data : ParamType[] | { [key: string]: ParamType }) {
    this.data = data;
  }

  static isArrayIndexer(input: string): boolean {
    const parsed = parseFloat(input);
    return !isNaN(parsed) && parsed.toString() === input.trim();
  }

  getDataMember(index : string | number) {
    if (typeof index === "string" && StructuredMemoryData.isArrayIndexer(index)) {
      index = parseFloat(index);
    }
    if (typeof index == "string" && !Array.isArray(this.data)) {
      return this.data[index];
    }
    if (typeof index == "number" && Array.isArray(this.data)) {
      return this.data[index];
    }
  }

  setDataMember(index : string | number, data : ParamType) {
    if (typeof index === "string" && StructuredMemoryData.isArrayIndexer(index)) {
      index = parseFloat(index);
    }
    if (typeof index == "string" && !Array.isArray(this.data)) {
      this.data[index] = data;
    } else if (typeof index == "number" && Array.isArray(this.data)) {
      this.data[index] = data;
    } else {
      throw new Error(`setDataMember can't use this index for this object. Index: ${index}, type of it: ${typeof index}, data: ${data}`)
    }
  }

  

}

export abstract class ExecutableWithContext implements Executable, HasContextMemory {
  static StaticExecutableWithContextSymbol = Symbol('ExecutableWithContext');
  ExecutableWithContextSymbol = ExecutableWithContext.StaticExecutableWithContextSymbol;
  
  abstract get context(): AbstractMemory;
  abstract execute(): Promise<CommandControl>;
  abstract get meta() : MemoryMetaData | undefined;
}

export abstract class ExecutableFactory {
  static StaticExecutableFactorySymbol = Symbol('ExecutableFactory');
  ExecutableFactorySymbol = ExecutableFactory.StaticExecutableFactorySymbol;

  abstract getNewExecutableWithContext() : ExecutableWithContext;
  abstract get meta() : MemoryMetaData | undefined;
  abstract set meta(m : MemoryMetaData | undefined);
}

export interface VariableGetter {
  getVariable(key : string) : ParamType;
  hasVariable(key : string) : boolean;
}

export interface VariableSetter {
  setVariable(key : string, value : ParamType) : void;
  createVariable(key : string, value : ParamType) : void;
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

export type InterpreterHooks = {
  beforeRunNewCommand? : (p : {sessionId : string, command : CommandData, flushCommandQueue : () => void;}) => Promise<void> // Todo: Using some input param, this could be more useful
  beforeStartSession? : (p : {sessionId : string}) => Promise<void>
  afterFinishSession? : (p : {sessionId : string}) => Promise<void>
  afterError? : (p : {sessionId : string, error : Error}) => Promise<void>
}
