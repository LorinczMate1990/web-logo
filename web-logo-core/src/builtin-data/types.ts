import { isStructuredMemoryData, StructuredMemoryData } from "../types.js";

export type GlobalTurtle = {
    name: { data: number[] } & StructuredMemoryData,
    group: { data: number[] } & StructuredMemoryData,
    listen: number,
    orientation: number,
    position: {
      data: {x: number, y : number}
    } & StructuredMemoryData,
    home: {
      data: {x: number, y : number, orientation : number}
    } & StructuredMemoryData,
    pencolor: {
      data: number[],
    } & StructuredMemoryData,
    penwidth: number,
    penstate: number,
    customData: StructuredMemoryData,
  };

export type GlobalTurtles = {
  data: ({data: GlobalTurtle} & StructuredMemoryData)[]
} & StructuredMemoryData;

export function isGlobalTurtles(input : any) : input is GlobalTurtles {
  if (!isStructuredMemoryData(input) || !Array.isArray(input.data)) return false;
  // TODO We could check the structs better, but it would damage the performance
  return true;  
}