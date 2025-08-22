import { turtleCommandPubSub } from "../pubsub/pubsubs.js";
import { AbstractMemory, ArgType, isStructuredMemoryData, ParamType, StructuredMemoryData } from "../types.js";
import { Arguments } from "../ArgumentParser.js";
import ColorMap from "../utils/ColorMap.js";
import { GlobalTurtle, isGlobalTurtles } from "../builtin-data/types.js";

function forAllTurtles(memory: AbstractMemory, action: (turtle: GlobalTurtle) => any) {
  const turtles = memory.getVariable("$turtles");
  if (!isGlobalTurtles(turtles)) throw new Error("The global $turtles array is damaged");
  for (const turtle of turtles.data) {
    action(turtle.data);
  }
}

function forAllWatchingTurtles(memory: AbstractMemory, action: (turtle: GlobalTurtle) => any) {
  forAllTurtles(memory, (turtle: GlobalTurtle) => {
    if (turtle.listen) {
      action(turtle);
    }
  })
}

function go(distance: number, memory: AbstractMemory) {
  forAllWatchingTurtles(memory, (turtle) => {
    const rad = turtle.orientation / 180 * Math.PI;
    const x = turtle.position.data.x;
    const y = turtle.position.data.y;
    const newX = x + distance * Math.cos(rad);
    const newY = y + distance * Math.sin(rad);
    turtle.position.data.x = newX;
    turtle.position.data.y = newY;
    turtleCommandPubSub.addToQueue({
      topic: "turtleCommand",
      command: "move",
      name: String.fromCharCode(...turtle.name.data),
      x: newX,
      y: newY,
      orientation: turtle.orientation,
    });
    if (turtle.penstate) {
      turtleCommandPubSub.addToQueue({
        topic: "drawing",
        command: "line",
        segments: [{
          x0: x,
          y0: y,
          x1: newX,
          y1: newY,
          color: turtle.pencolor.data as any,
          penWidth: turtle.penwidth,
        }]
      });
    }
  });
}

function rotate(angle: number, memory: AbstractMemory) {
  forAllWatchingTurtles(memory, (turtle) => {
    turtle.orientation = (turtle.orientation + angle) % 360;
    turtleCommandPubSub.addToQueue({
      topic: "turtleCommand",
      command: "move",
      name: String.fromCharCode(...turtle.name.data),
      x: turtle.position.data.x,
      y: turtle.position.data.y,
      orientation: turtle.orientation,
    });
  });
}

export default class TurtleCommands {
  @Arguments(['numeric'])
  static async forward(args: ArgType, memory: AbstractMemory) {
    const distance = args[0] as number;
    go(distance, memory);
    return {};
  }

  @Arguments(['numeric'])
  static async backward(args: ArgType, memory: AbstractMemory) {
    const distance = args[0] as number;
    go(-distance, memory);
    return {};
  }

  @Arguments(['numeric'])
  static async left(args: ArgType, memory: AbstractMemory) {
    const angle = args[0] as number;
    rotate(-angle, memory);
    return {};
  }

  @Arguments(['numeric'])
  static async right(args: ArgType, memory: AbstractMemory) {
    const angle = args[0] as number;
    rotate(angle, memory);
    return {};
  }

  @Arguments([])
  static async penUp(args: ArgType, memory: AbstractMemory) {
    forAllWatchingTurtles(memory, (turtle) => {
      turtle.penstate = 0;
    });
    return {};
  }

  @Arguments([])
  static async penDown(args: ArgType, memory: AbstractMemory) {
    forAllWatchingTurtles(memory, (turtle) => {
      turtle.penstate = 1;
    });
    return {};
  }

  @Arguments({ variableArgumentLists: true, 1: ['word'], 3: ['numeric', 'numeric', 'numeric'] })
  static async setPenColor(args: ArgType, memory: AbstractMemory) {
    // The color can be any of the following formats: "colorname" or "#RRGGBB"
    // This function must convert them to RGB

    let RR = 0;
    let GG = 0;
    let BB = 0;
    if (args.length == 3) {
      RR = args[0] as number;
      GG = args[1] as number;
      BB = args[2] as number;
    } else {
      const inputColor = args[0] as string;
      const colorCode = (inputColor[0] == "#") ? inputColor : ColorMap[inputColor];
      if (colorCode == undefined || colorCode.length != 7) {
        throw new Error(`The ${inputColor} color is not recognized`);
      }
      RR = parseInt(colorCode.slice(1, 3), 16);
      GG = parseInt(colorCode.slice(3, 5), 16);
      BB = parseInt(colorCode.slice(5, 7), 16);
    }

    forAllWatchingTurtles(memory, (turtle) => {
      turtle.pencolor.data = [RR, GG, BB];
    });
    return {};
  }

  @Arguments(['numeric'])
  static async setPenWidth(args: ArgType, memory: AbstractMemory) {
    const width = args[0] as number;

    forAllWatchingTurtles(memory, (turtle) => {
      turtle.penwidth = width;
    });
    return {};
  }

  @Arguments([])
  static async goHome(args: ArgType, memory: AbstractMemory) {
    forAllWatchingTurtles(memory, (turtle) => {
      turtle.position.data.x = turtle.home.data.x;
      turtle.position.data.y = turtle.home.data.y;
      turtle.orientation = turtle.home.data.orientation;

      turtleCommandPubSub.addToQueue({
        topic: "turtleCommand",
        command: "move",
        name: String.fromCharCode(...turtle.name.data),
        x: turtle.position.data.x,
        y: turtle.position.data.y,
        orientation: turtle.orientation,
      });
    });
    return {};
  }

  @Arguments([])
  static async setHome(args: ArgType, memory: AbstractMemory) {
    forAllWatchingTurtles(memory, (turtle) => {
      turtle.home.data.x = turtle.position.data.x;
      turtle.home.data.y = turtle.position.data.y;
      turtle.home.data.orientation = turtle.orientation;
    });
    return {};
  }

  @Arguments({ max: 1, front: ['numeric'] })
  static async fill(args: ArgType, memory: AbstractMemory) {
    const tolerance = (args.length == 0) ? 0 : args[0] as number;
    forAllWatchingTurtles(memory, (turtle) => {
      turtleCommandPubSub.addToQueue({
        topic: "drawing",
        command: "fill",
        color: turtle.pencolor.data as any,
        x: turtle.position.data.x,
        y: turtle.position.data.y
      });
    });
    return {};
  }

  @Arguments([])
  static async clearScreen(arg: ArgType, memory: AbstractMemory) {
    turtleCommandPubSub.addToQueue({
      topic: "drawing",
      command: "clearScreen"
    });
    return {};
  }

  @Arguments(['array'])
  static async watch(args: ArgType, memory: AbstractMemory) {
    const rawWatchPattern = args[0] as StructuredMemoryData & {data: number[]};
    const watchPattern = String.fromCharCode(...rawWatchPattern.data);
    const watchPatternRegex = new RegExp(watchPattern);
    forAllTurtles(memory, (turtle) => {
      const turtleName = String.fromCharCode(...turtle.name.data);
      const turtleGroup = String.fromCharCode(...turtle.group.data);
      turtle.listen = (watchPatternRegex.test(turtleName) || watchPatternRegex.test(turtleGroup))? 1 : 0;
    });
    return {};
  }


  @Arguments(['array', 'array', 'numeric', 'numeric', 'numeric'])
  static async addTurtle(arg: ArgType, memory: AbstractMemory) {
    const name = arg[0] as StructuredMemoryData & {data: number[]};
    const group = arg[1] as StructuredMemoryData & {data: number[]};
    const x = arg[2] as number;
    const y = arg[3] as number;
    const orientation = arg[4] as number;

    const newTurtle : GlobalTurtle = {
      name,
      group,
      listen: 1,
      orientation,
      position: new StructuredMemoryData({ x, y }) as StructuredMemoryData & {data: {x: number, y: number}},
      home: new StructuredMemoryData({ x, y, orientation }) as StructuredMemoryData & {data: {x: number, y: number, orientation: number}},
      pencolor: new StructuredMemoryData([0, 0, 0]) as StructuredMemoryData & {data: [number, number, number]},
      penwidth: 1,
      penstate: 1,
      customData: new StructuredMemoryData({})
    };

    const turtles = memory.getVariable("$turtles");
    if (!isStructuredMemoryData(turtles) || !Array.isArray(turtles.data)) return {};
    turtles.data.push(new StructuredMemoryData(newTurtle));

    turtleCommandPubSub.addToQueue({
      topic: "turtleCommand",
      command: "move",
      name: String.fromCharCode(...(name.data as number[])),
      x,
      y,
      orientation,
    });
    return {};
  }

  @Arguments([])
  static async refreshTurtles(arg: ArgType, memory: AbstractMemory) {
    forAllWatchingTurtles(memory, turtle => {
      turtleCommandPubSub.addToQueue({
        topic: "turtleCommand",
        command: "move",
        name: String.fromCharCode(...turtle.name.data),
        x: turtle.position.data.x,
        y: turtle.position.data.y,
        orientation: turtle.orientation,
      });
    });
    return {};
  }
}