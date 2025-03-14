import PubSub, { Subscribe } from "typesafe-bus";
import { useEffect } from "react";

// TODO Should be exported from pubsub
type Callback<Message> = (message: Message) => void | boolean | Promise<void> | Promise<boolean>;

// TODO Should be exported and have a better name, not an error message
type MessageMustHaveTopic = {
  topic: string;
  // Additional properties can be added here if needed
};

export type CommandLineMessage = {
  topic: "commandLine";
  content : string;
  error : boolean;
}

export const commandLinePubSub = new PubSub<CommandLineMessage>();

// This is a react-hook. Should be part of an auxiliary lib
export function useSubscriber<Message extends MessageMustHaveTopic>(subscribe: Subscribe<Message>, callback: Callback<Message>, deps?: React.DependencyList | undefined) {
  let id = 0;
  useEffect(() => {
    id = subscribe.subscribe(callback);
    return () => {subscribe.unsubscribe(id)};
  }, deps)
  return id;
};