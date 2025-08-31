import { AbstractMemory, packToStructuredMemoryData, StructuredMemoryData } from "../types.js";
import { GlobalTurtle, StructuredGlobalTurtles, StructuredPosition, StructuredGlobalTurtle } from "./types.js";

export default function initMemory(globalMemory: AbstractMemory) {
  // init memory
  const defaultDisplayProperties = packToStructuredMemoryData({
    image: StructuredMemoryData.buildFromString("builtin://simple-turtle"),
    rotatable: 1,
    offsetX: 18,
    offsetY: 23,
  });

  const defaultTurtleData: GlobalTurtle = {
    name: StructuredMemoryData.buildFromString("turtle_0"),
    group: StructuredMemoryData.buildFromString("main"),
    listen: 1,
    visible: 1,
    orientation: 0,
    displayProperties: defaultDisplayProperties,
    coords: packToStructuredMemoryData({ x: 200, y: 200 }),
    home: packToStructuredMemoryData({ x: 0, y: 0, orientation: 0 }),
    pencolor: packToStructuredMemoryData([0, 0, 0]),
    positionStack: packToStructuredMemoryData([]),
    penwidth: 1,
    penstate: 1,
    scale: 1,
    customData: new StructuredMemoryData({})
  };

  const defaultTurtle: StructuredGlobalTurtle = packToStructuredMemoryData(defaultTurtleData);

  const globalTurtles: StructuredGlobalTurtles = packToStructuredMemoryData([
    defaultTurtle
  ]);
  globalMemory.createVariable('$turtles', globalTurtles);
}