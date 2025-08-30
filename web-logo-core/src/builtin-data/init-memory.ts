import { AbstractMemory, StructuredMemoryData } from "../types.js";
import { GlobalTurtle, StructuredGlobalTurtles, StructuredCoords, StructuredNumericArray, StructuredPosition, StructuredPositionList, StructuredGlobalTurtle, StructuredDisplayProperties } from "./types.js";

export default function initMemory(globalMemory: AbstractMemory) {
  // init memory
  const defaultDisplayProperties: StructuredDisplayProperties = new StructuredMemoryData({
    image: new StructuredMemoryData([]),
    rotatable: 1,
    visible: 1,
  }) as StructuredDisplayProperties;

  const defaultTurtleData: GlobalTurtle = {
    name: StructuredMemoryData.buildFromString("turtle_0") as StructuredNumericArray,
    group: StructuredMemoryData.buildFromString("main") as StructuredNumericArray,
    listen: 1,
    orientation: 0,
    displayProperties: defaultDisplayProperties,
    coords: new StructuredMemoryData({ x: 200, y: 200 }) as StructuredCoords,
    home: new StructuredMemoryData({ x: 0, y: 0, orientation: 0 }) as StructuredPosition,
    pencolor: new StructuredMemoryData([0, 0, 0]) as StructuredNumericArray,
    positionStack: new StructuredMemoryData([]) as StructuredPositionList,
    penwidth: 1,
    penstate: 1,
    scale: 1,
    customData: new StructuredMemoryData({})
  };

  const defaultTurtle: StructuredGlobalTurtle = new StructuredMemoryData(defaultTurtleData) as StructuredGlobalTurtle;

  const globalTurtles: StructuredGlobalTurtles = new StructuredMemoryData([
    defaultTurtle
  ]) as StructuredGlobalTurtles;
  globalMemory.createVariable('$turtles', globalTurtles);
}