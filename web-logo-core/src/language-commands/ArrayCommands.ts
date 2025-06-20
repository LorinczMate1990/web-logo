import { turtleCommandPubSub } from "../pubsub/pubsubs.js";
import { AbstractMemory, ArgType, CommandControl, ExecutableFactory, ExecutableWithContext, isExecutableFactory, isStructuredMemoryData, ParamType, StructuredMemoryData } from "../types.js";
import { Arguments, PossibleArgumentParsingMethods } from "../ArgumentParser.js";
import ColorMap from "../utils/ColorMap.js";

export default class ArrayCommands {
  @Arguments({min:2, max:3, front: ["array", "numeric", "numeric"] })
  static async slice(args: ArgType, memory : AbstractMemory) {
    const array = args[0] as StructuredMemoryData & {data: ParamType[]};
    const firstIndex = args[1] as number;
    const lastIndex = (args.length == 3)?args[2] as number:array.data.length;
    return {
      returnValue: new StructuredMemoryData(array.data.slice(firstIndex, lastIndex)),
    } as CommandControl;
  }

  @Arguments(["array"])
  static async removeFirst(args: ArgType, memory : AbstractMemory) {
    const array = args[0] as StructuredMemoryData & {data: ParamType[]};
    const removedValue = array.data.shift();
    return {
      returnValue: removedValue,
    } as CommandControl;
  }

  @Arguments(["array"])
  static async removeLast(args: ArgType, memory : AbstractMemory) {
    const array = args[0] as StructuredMemoryData & {data: ParamType[]};
    const removedValue = array.data.pop();
    return {
      returnValue: removedValue,
    } as CommandControl;
  }

  @Arguments(["array", ["array", "code", "numeric"]])
  static async insertBeforeFirst(args: ArgType, memory: AbstractMemory) {
      const array = args[0] as StructuredMemoryData & { data: ParamType[] };
      const valueToInsert = args[1] as ParamType;
      array.data.unshift(valueToInsert);
      return {};
  }

  @Arguments(["array", ["array", "code", "numeric"]])
  static async insertAfterLast(args: ArgType, memory : AbstractMemory) {
    const array = args[0] as StructuredMemoryData & {data: ParamType[]};
    const valueToInsert = args[1] as ParamType;
    array.data.push(valueToInsert);
    return { }
  }

  @Arguments(["array", "numeric"])
  static async removeAny(args: ArgType, memory: AbstractMemory) {
      const array = args[0] as StructuredMemoryData & { data: ParamType[] };
      const indexToRemove = args[1] as number;
  
      if (indexToRemove < 0 || indexToRemove >= array.data.length) {
          throw new Error("Index out of bounds"); // Ensure index is valid
      }
  
      const removedValue = array.data.splice(indexToRemove, 1)[0]; // Remove element at index
      return {
          returnValue: removedValue,
      } as CommandControl;
  }

  @Arguments(["array", "numeric", ["array", "code", "numeric"]])
  static async insertAnywhere(args: ArgType, memory : AbstractMemory) {
    const array = args[0] as StructuredMemoryData & {data: ParamType[]};
    const indexToInsert = args[1] as number;
    const valueToInsert = args[2] as ParamType;
    if (indexToInsert < 0 || indexToInsert > array.data.length) {
        throw new Error("Index out of bounds"); // Ensure index is valid
    }

    array.data.splice(indexToInsert, 0, valueToInsert); // Insert at index
    return {}
  }
}