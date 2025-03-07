import { turtleCommandPubSub } from "../pubsub/pubsubs";
import { AbstractMemory, ArgType, isStructuredMemoryData } from "../types";
import { Arguments } from "../ArgumentParser";
import ColorMap from "../utils/ColorMap";

export default class CoreCommands {
  @Arguments(['numeric'])
  static async forward(args: ArgType, memory : AbstractMemory) {
    const distance = args[0] as number;
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "forward",
      distance
    });
    return {};
  }

  @Arguments(['numeric'])
  static async backward(args: ArgType, memory : AbstractMemory) {
    const distance = args[0] as number;
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "backward",
      distance
    });
    return {};
  }

  @Arguments(['numeric'])
  static async left(args: ArgType, memory : AbstractMemory) {
    const radian = parseFloat(String(args[0])) / 180.0 * Math.PI;
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "left",
      radian
    });
    return {};
  }

  @Arguments(['numeric'])
  static async right(args: ArgType, memory : AbstractMemory) {
    const radian = parseFloat(String(args[0])) / 180.0 * Math.PI;
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "right",
      radian
    });
    return {};
  }

  @Arguments([])
  static async penUp(args: ArgType, memory : AbstractMemory) {
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "setPenState",
      penState: 'up'
    });
    return {};
  }

  @Arguments([])
  static async penDown(args: ArgType, memory : AbstractMemory) {
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "setPenState",
      penState: 'down'
    });
    return {};
  }

  @Arguments([['word', 'array']])
  static async setPenColor(args: ArgType, memory : AbstractMemory) {
    // The color can be any of the following formats: "colorname" or "#RRGGBB"
    // This function must convert them to RGB
  
    let RR = 0;
    let GG = 0;
    let BB = 0;
    if (isStructuredMemoryData(args[0])) {
      if (Array.isArray(args[0].data)) {
        RR = args[0].data[0] as number; // TODO Should be checked
        GG = args[0].data[1] as number; // TODO Should be checked
        BB = args[0].data[2] as number; // TODO Should be checked
      } else {
        throw new Error(`The input of setPenColor must be a color name or a three-element numeric array`);
      }
    } else {
      const inputColor = args[0] as string;
      const colorCode = (inputColor[0] == "#")?inputColor:ColorMap[inputColor];
      if (colorCode == undefined || colorCode.length != 7) {
        throw new Error(`The ${inputColor} color is not recognized`);
      }
      RR = parseInt(colorCode.slice(1,3), 16);
      GG = parseInt(colorCode.slice(3,5), 16);
      BB = parseInt(colorCode.slice(5,7), 16);
    }

    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "setPenColor",
      color: [RR, GG, BB],
    });
    return {};
  }

  @Arguments(['numeric'])
  static async setPenWidth(args: ArgType, memory : AbstractMemory) {
    const width = args[0] as number;
    
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "setPenWidth",
      width,
    });
    return {};
  }

  @Arguments([])
  static async goHome(args: ArgType, memory : AbstractMemory) {
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "goHome",
    });
    return {};
  }
  
  @Arguments([])
  static async setHome(args: ArgType, memory : AbstractMemory) {
    turtleCommandPubSub.publish({
        topic: "turtleCommand",
        command: "setHome",
      });
      return {};
  }

  @Arguments({max: 1, front: ['numeric']}) 
  static async fill(args: ArgType, memory: AbstractMemory) {
    const tolerance = (args.length == 0)?0:args[0] as number;
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "fill",
      tolerance,
    });
    return {};
  }

  @Arguments([])
  static async clearScreen(arg : ArgType, memory : AbstractMemory) {
    turtleCommandPubSub.publish({
      topic: "systemCommand",
      command: "clearScreen"
    });
    return {};
  }
}