import { evaluateVariableName } from "../expressionEval/expressionEval.js";
import { AbstractMemory, ExecutableFactory, ExecutableWithContext, MemoryMetaData, ParamType, StructuredMemoryData, VariableGetter, isExecutableFactory, isExecutableWithContext, isParamType, isStructuredMemoryData } from "../types.js";
import { NonExistingVariableMemoryError } from "./errors.js";
import { getBaseVariableName, getDataMember, isStructuredVariableName, setDataMember } from "./structuredVariableHandler.js";

type StructMemoryCell = {
  type: "struct",
  value: StructuredMemoryData,
}

type CodeMemoryCell = {
  type: "code",
  value: ExecutableFactory,
}

type NumericMemoryCell = {
  type: "numeric",
  value: number,
}

type MemoryCell = NumericMemoryCell | StructMemoryCell | CodeMemoryCell;

export class Memory implements AbstractMemory {
  parent?: AbstractMemory;
  dataInjector? : VariableGetter;
  variables: { [key: string]: MemoryCell } = {};

  constructor(parent: AbstractMemory | undefined, dataInjector? : VariableGetter) {
    this.parent = parent;
    this.dataInjector = dataInjector;
  }

  setVariable(key: string, value: ParamType): void {
    const {baseName, rest: variablePath} = getBaseVariableName(key);
    let processedKey = key;
    if (isStructuredVariableName(key)) {
      const processedPath = evaluateVariableName(variablePath, this);
      const infix = (processedPath[0]) == '['?"":"." // TODO structs and arrays should be handled the same way with evaluateVariableName, but the . is missing
      processedKey = `${baseName}${infix}${processedPath}`
    }
    this._setVariable(baseName, key, processedKey, value);
  }

  _setVariable(baseName : string, key : string, processedKey : string, value : ParamType) : void {
    if (baseName in this.variables) {
      this.createVariable(processedKey, value);
    } else if (this.dataInjector?.hasVariable(baseName)) {
      throw new Error(baseName+" is an injected variable, you can not modify it.");
    } else if (this.parent) {
      this.parent.setVariable(processedKey, value);
    } else {
      throw new NonExistingVariableMemoryError("create", key);
    }
  }

  createVariable(key: string, value: ParamType) {
    if (isStructuredVariableName(key)){
      const {baseName, rest: variablePath} = getBaseVariableName(key);
      if (!(baseName in this.variables)) {
        this.variables[baseName] = {type: "struct", value: new StructuredMemoryData({})};  
      }
      let memoryCell = this.variables[baseName];
      if (memoryCell.type !== "struct") {
        this.variables[baseName] = {
          type: "struct",
          value: new StructuredMemoryData({})
        }
        memoryCell = this.variables[baseName];
      }
      if (memoryCell.type !== "struct") throw new Error("This is impossible. Only throw it to make the compiler know its type");
      const evaluatedPath = evaluateVariableName(variablePath, this);
      setDataMember(evaluatedPath, value, memoryCell.value);
    } else {
      if (typeof value === "number") {
          this.variables[key] = {
            type: "numeric",
            value,
          }
      } else if (isExecutableFactory(value)) {
        this.variables[key] = {
          type: "code",
          value,
        }
      } else if (isStructuredMemoryData(value)) {
        this.variables[key] = {
          type: "struct",
          value,
        }
      }
    }
  }

  hasVariable(key: string): boolean {
    let {baseName} = getBaseVariableName(key);
    return baseName in this.variables || (this.parent?.hasVariable(baseName))===true || (this.dataInjector?.hasVariable(baseName))===true;
  }

  getVariable(key: string): ParamType {
    if (isStructuredVariableName(key)) {
      const {baseName, rest: variablePath} = getBaseVariableName(key);
      const memoryCellValue = this.getVariable(baseName);
      if (!isStructuredMemoryData(memoryCellValue)) {
        throw new Error(`Memory cell "${baseName}" wasn't string or struct`);
      }
      const processedKey = evaluateVariableName(variablePath, this);
      const result = getDataMember(processedKey, memoryCellValue);
      return result;
    } else if (key in this.variables) {
      const memoryCell = this.variables[key];
      return memoryCell.value;
    }
    if (this.dataInjector?.hasVariable(key)===true) {
      return this.dataInjector?.getVariable(key);
    }
    if (this.parent?.hasVariable(key)===true) {
      return this.parent?.getVariable(key);
    }
    throw new NonExistingVariableMemoryError("read", key);
  }
}