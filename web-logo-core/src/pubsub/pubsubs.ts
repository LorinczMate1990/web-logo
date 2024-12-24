import PubSub, { Subscribe } from "typesafe-bus";
import { TurtleCommandMessage, } from "./types";

export const turtleCommandPubSub = new PubSub<TurtleCommandMessage>();

// TODO Should be exported from pubsub
type Callback<Message> = (message: Message) => void | boolean | Promise<void> | Promise<boolean>;

// TODO Should be exported and have a better name, not an error message
type MessageMustHaveTopic = {
  topic: string;
  // Additional properties can be added here if needed
};

