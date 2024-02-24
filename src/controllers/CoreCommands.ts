import { turtleCommandPubSub } from "../pubsub/pubsubs";
import { ArgType, CommandsWithContext } from "./core";

export default class CoreCommands {
  // TODO Arguments must be parsed, also I need here the memory
  static async forward(args: ArgType) {
    const distance = Number(args[0]);
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "forward",
      distance
    });
  }

  static async backward(args: ArgType) {
    const distance = Number(args[0]);
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "backward",
      distance
    });
  }

  static async left(args: ArgType) {
    const radian = Number(args[0]) / 180.0 * Math.PI;
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "left",
      radian
    });
  }

  static async right(args: ArgType) {
    const radian = Number(args[0]) / 180.0 * Math.PI;
    turtleCommandPubSub.publish({
      topic: "turtleCommand",
      command: "right",
      radian
    });
  }
}