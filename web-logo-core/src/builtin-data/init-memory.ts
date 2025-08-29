import { AbstractMemory, StructuredMemoryData } from "../types.js";

export default function initMemory(globalMemory : AbstractMemory) {
    // init memory
    const globalTurtles = new StructuredMemoryData([
        new StructuredMemoryData({
        name: StructuredMemoryData.buildFromString("turtle_0"),
        group: StructuredMemoryData.buildFromString("main"),
        listen: 1,
        orientation: 0,
        position: new StructuredMemoryData({ x: 200, y: 200 }),
        home: new StructuredMemoryData({ x: 0, y: 0, orientation: 0 }),
        pencolor: new StructuredMemoryData([0, 0, 0]),
        positionStack: new StructuredMemoryData([]),
        penwidth: 1,
        penstate: 1,
        scale: 1,
        customData: new StructuredMemoryData({})
        })
    ]);
    globalMemory.createVariable('$turtles', globalTurtles);
}