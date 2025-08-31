import { isStructuredMemoryData, StructuredMemoryData } from "../types.js";

export type StructuredCoords = {
    data: { x: number, y: number }
  } & StructuredMemoryData;

export type StructuredPosition = {
    data: { orientation: number }
  } & StructuredCoords;

export type StructuredPositionList = {
    data: StructuredPosition[]
  } & StructuredMemoryData;

export type StructuredNumericArray = {
    data: number[],
  } & StructuredMemoryData;

export type StructuredDisplayProperties = {
  data: {
    image : StructuredNumericArray,
    rotatable : number,
    visible: number,
    offsetX : number, 
    offsetY : number,
  }
} & StructuredMemoryData;

export type GlobalTurtle = {
  name: StructuredNumericArray,
  group: StructuredNumericArray,
  listen: number,
  visible: number,
  displayProperties: StructuredDisplayProperties,
  orientation: number,
  coords: StructuredCoords,
  home: StructuredPosition,
  positionStack: StructuredPositionList,
  pencolor: StructuredNumericArray,
  penwidth: number,
  penstate: number,
  scale: number,
  customData: StructuredMemoryData,
};

export type StructuredGlobalTurtle = { data: GlobalTurtle } & StructuredMemoryData;

export type StructuredGlobalTurtles = {
  data: ({ data: GlobalTurtle } & StructuredMemoryData)[]
} & StructuredMemoryData;

export function isGlobalTurtles(input: any): input is StructuredGlobalTurtles {
  if (!isStructuredMemoryData(input) || !Array.isArray(input.data)) return false;
  // TODO We could check the structs better, but it would damage the performance
  return true;
}