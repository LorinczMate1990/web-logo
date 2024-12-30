import { evaluateVariableName } from "../expressionEval";
import { AbstractMemory, ExecutableFactory, ExecutableWithContext, MemoryMetaData, ParamType, StructuredMemoryData, isExecutableFactory, isExecutableWithContext, isParamType, isStructuredMemoryData } from "../types";
import { getBaseVariableName, getDataMember, isStructuredVariableName, setDataMember } from "./structuredVariableHandler";

type StringMemoryCell = {
  type: "string",
  value : string,
}

type StructMemoryCell = {
  type: "struct",
  value: object, // TODO : This should be StructuredMemoryData
}

type CodeMemoryCell = {
  type: "code",
  value: ExecutableFactory,
}

type NumericMemoryCell = {
  type: "numeric",
  value: number,
}

type MemoryCell = NumericMemoryCell | StringMemoryCell | StructMemoryCell | CodeMemoryCell;

export class Memory implements AbstractMemory {
  parent?: AbstractMemory;
  variables: { [key: string]: MemoryCell } = {};

  constructor(parent: AbstractMemory | undefined) {
    this.parent = parent;
  }

  setVariable(key: string, value: ParamType) { // TODO maybe it exists in parent. I should create a separate declarator
    if (isStructuredVariableName(key)){
      const base = getBaseVariableName(key);
      if (!(base in this.variables)) {
        this.variables[base] = {type: "struct", value: {}};  
      }
      let memoryCell = this.variables[base];
      if (memoryCell.type !== "struct") {
        this.variables[base] = {
          type: "struct",
          value: {}
        }
        memoryCell = this.variables[base];
      }
      if (memoryCell.type !== "struct") throw new Error("This is impossible. Only throw it to make the compiler know its type");
      const evaluatedPath = evaluateVariableName(key, this);
      setDataMember(evaluatedPath, isStructuredMemoryData(value)?value.data:value, memoryCell.value);
    } else {
      if (typeof value === "string") {
        this.variables[key] = {
          type: "string",
          value,
        }
      } else if (typeof value === "number") {
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
          value: value.data,
        }
      }
    }
  }

  hasVariable(key: string): boolean {
    const structured = isStructuredVariableName(key);
    let baseName = key;
    if (structured) {
      baseName = getBaseVariableName(key);
    }
    return baseName in this.variables || (this.parent != undefined && this.parent.hasVariable(baseName));
  }

  getVariable(key: string): ParamType {
    // First of all I have to know if it's structured or not
    const structured = isStructuredVariableName(key);
    let baseName = key;
    if (structured) {
      baseName = getBaseVariableName(key);
    }
    if (baseName in this.variables) {
      if (structured) {
        let retRoot : object;
        const memoryCell = this.variables[baseName];
        if (memoryCell.type === "struct") {
          retRoot = memoryCell.value;
        } else if (memoryCell.type === "string") {
          retRoot = JSON.parse(memoryCell.value);
        } else {
          throw new Error("Memory cell wasn't string or struct");
        }
        const processedKey = evaluateVariableName(key, this);
        const result = getDataMember(processedKey, retRoot);
        if (typeof result === "object") {
          return new StructuredMemoryData(result);
        } else {
          return String(result);
        }
      } else {
        const memoryCell = this.variables[key];
        if (memoryCell.type === "struct") {
          return new StructuredMemoryData(memoryCell.value);
        } else if (memoryCell.type === "string" || memoryCell.type === "numeric") {
          return memoryCell.value;
        } else if (memoryCell.type === "code") {
          return memoryCell.value;
        }
      }
    }
    if (this.parent === undefined) return "";
    return this.parent.getVariable(key);
  }
}