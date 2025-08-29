import PubSub, { MessageCombinator } from "typesafe-bus";
import { TurtleCommandMessage } from "./types.js";

class CombineMessages implements MessageCombinator<TurtleCommandMessage> {
    combine(older: TurtleCommandMessage, newer: TurtleCommandMessage): TurtleCommandMessage | undefined {
        if (newer.topic === "drawing" && older.topic === "drawing") {
            if (newer.command === "clearScreen") return newer;
            if (newer.command === "line" && older.command === "line") {
                older.segments.push(...newer.segments);
                return older;
            }
        }
        if (newer.topic === "turtleCommand" && older.topic === "turtleCommand") {
            if (newer.command === "move" && older.command === "move" && older.name == newer.name) {
                return newer;
            }
        }
    }
}

export const turtleCommandPubSub = new PubSub<TurtleCommandMessage>(new CombineMessages());