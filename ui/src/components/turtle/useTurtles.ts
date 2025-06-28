import { useEffect, useRef, useState } from "react";
import TurtleInstance from "../../models/TurtleInstance.js";
import { useSubscriber } from "../../pubsub/pubsubs.js";
import { turtleCommandPubSub, TurtleCommandMessage } from 'web-logo-core';
import Turtle from "./Turtle.js";

export default function useTurtles() {
  const [turtleInstances, setTurtleInstances] = useState<{[key: string]: TurtleInstance}>({});

  useSubscriber<TurtleCommandMessage>(turtleCommandPubSub, (message) => {
    if (message.topic != "turtleCommand") return;
    switch (message.command) {
      case "move":
        const name = message.name;

        const x = message.x;
        const y = message.y;
        const orientation = message.orientation / 180 * Math.PI;

        const updatedInstance = new TurtleInstance({x, y}, orientation);

        setTurtleInstances((instances) => {
          const ret = {...instances};
          ret[name] = updatedInstance;
          return ret;
        });

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