import { evaluateVariableName } from "../expressionEval/expressionEval";
import { AbstractMemory, ExecutableFactory, ExecutableWithContext, MemoryMetaData, ParamType, StructuredMemoryData, isExecutableFactory, isExecutableWithContext, isParamType, isStructuredMemoryData } from "../types";
import { NonExistingVariableMemoryError } from "./errors";
import { getBaseVariableName, getDataMember, isStructuredVariableName, setDataMember } from "./structuredVariableHandler";

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
  variables: { [key: string]: MemoryCell } = {};

  constructor(parent: AbstractMemory | undefined) {
    this.parent = parent;
  }

  setVariable(key: string, value: ParamType): void {
    let {baseName} = getBaseVariableName(key);
    if (baseName in this.variables) {
      this.createVariable(key, value);
    } else if (this.parent) {
      this.parent.setVariable(key, value);
    } else {
      throw new NonExistingVariableMemoryError("create", key);
    }
  }

  createVariable(key: string, value: ParamType) { // TODO maybe it exists in parent. I should create a separate declarator
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
    try {
      this.getVariable(key);
      return true;
    } catch (error) {
      return false;
    }
  }

  getVariable(key: string): ParamType {
    if (isStructuredVariableName(key)) {
      const {baseName, rest: variablePath} = getBaseVariableName(key);
      const memoryCellValue = this.getVariable(baseName);
      if (!isStructuredMemoryData(memoryCellValue)) {
        throw new Error("Memory cell wasn't string or struct");
      }
      const processedKey = evaluateVariableName(variablePath, this);
      const result = getDataMember(processedKey, memoryCellValue);
      return result;
    } else if (key in this.variables) {
      const memoryCell = this.variables[key];
      return memoryCell.value;
    }
    if (this.parent === undefined) throw new NonExistingVariableMemoryError("read", key); // TODO This should be an error
    return this.parent.getVariable(key);
  }
}