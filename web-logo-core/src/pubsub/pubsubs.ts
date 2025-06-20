import PubSub from "typesafe-bus";
import { TurtleCommandMessage } from "./types.js";

export const turtleCommandPubSub = new PubSub<TurtleCommandMessage>();