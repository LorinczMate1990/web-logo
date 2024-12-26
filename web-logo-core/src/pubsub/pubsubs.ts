import PubSub from "typesafe-bus";
import { TurtleCommandMessage } from "./types";

export const turtleCommandPubSub = new PubSub<TurtleCommandMessage>();