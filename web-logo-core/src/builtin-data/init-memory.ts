import { AbstractMemory, StructuredMemoryData } from "../types.js";

export default function initMemory(globalMemory : AbstractMemory) {
    // init memory
    const globalTurtles = new StructuredMemoryData([
        new StructuredMemoryData({
        name: StructuredMemoryData.build_from_string("turtle_0"),
        group: StructuredMemoryData.build_from_string("main"),
        listen: 1,
        orientation: 0,
        position: new StructuredMemoryData({ x: 200, y: 200 }),
        home: new StructuredMemoryData({ x: 0, y: 0, orientation: 0 }),
        pencolor: new StructuredMemoryData([0, 0, 0]),
        penwidth: 1,
        penstate: 1,
        customData: new StructuredMemoryData({})
        })
    ]);
    globalMemory.createVariable('$turtles', globalTurtles);
}