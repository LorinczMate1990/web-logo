import { useState } from "react";
import TurtleInstance from "../../models/TurtleInstance.js";
import { useSubscriber } from "../../pubsub/pubsubs.js";
import { turtleCommandPubSub, TurtleCommandMessage } from 'web-logo-core';

export default function useTurtles() {
  const [turtleInstances, setTurtleInstances] = useState<{ [key: string]: TurtleInstance }>({});

  useSubscriber<TurtleCommandMessage>(turtleCommandPubSub, (message) => {
    if (message.topic != "turtleCommand") return;
    switch (message.command) {
      case "move":
        const {name, visible, x, y} = message;
        const orientation = message.orientation / 180 * Math.PI;

        if (visible) {
          const updatedInstance = new TurtleInstance({ x, y }, orientation, message.image, visible);

          setTurtleInstances((instances) => {
            const ret = { ...instances };
            ret[name] = updatedInstance;
            return ret;
          });
        } else {
          setTurtleInstances((instances) => {
            const ret = { ...instances };
            delete ret[name];
            return ret;
          });
        }

        break;
    }
  }, []);

  function moveTurtle(dX: number, dY: number) {
    // TODO: Move turtle from UI
  }

  function rotateTurtle(alpha: number) {
    // TODO: Rotate turtle from UI
  }

  return {
    turtleInstances,
    moveTurtle,
    rotateTurtle,
  };
}