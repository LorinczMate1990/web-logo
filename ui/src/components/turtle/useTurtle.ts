import { useEffect, useRef, useState } from "react";
import TurtleInstance from "../../models/TurtleInstance";
import { TurtleCommandMessage } from "../../pubsub/types";
import { useSubscriber } from "../../pubsub/pubsubs";
import { turtleCommandPubSub } from 'web-logo-core'

type GraphTurtle = {
  x : number;
  y : number;
  orientation : number;
  picture: any; // TODO What shoud this be?
};

export default function useTurtle(context : CanvasRenderingContext2D | null) {
  const [graphTurtle, setGraphTurtle] = useState<GraphTurtle | null>(null);
  const turtleInstance = useRef<TurtleInstance>();
  useEffect(() => {
    if (turtleInstance.current === null || turtleInstance.current === undefined) {
      turtleInstance.current = new TurtleInstance("turtle0", "turtles", {x: 400, y: 400}, 0, context, "down", "black", 1);
    } else {
      turtleInstance.current.setCanvasContext(context);
    }
  }, [context]);
  useSubscriber<TurtleCommandMessage>(turtleCommandPubSub, (message) => {
    const instance = turtleInstance.current;
    if (instance === undefined) return;
    switch (message.command) {
      case "forward":
        instance.go(message.distance);
        break;
      case "backward":
        instance.go(-message.distance);
        break;
      case "left":
        instance.rotate(message.radian);
        break;
      case "right":
        instance.rotate(-message.radian);
        break;
      case "setPenState":
        instance.setPenState(message.penState);
        break;
      case "setPenColor":
        instance.setPenColor(message.color);
        break;
      case "setPenWidth":
        instance.setPenWidth(message.width);
        break;
      case "goHome":
        instance.goHome();
        break;
      case "setHome":
        instance.setHome(message.x, message.y, message.orientation);
        break;
    }
    setGraphTurtle({
      x : instance.position.x,
      y : instance.position.y,
      orientation: instance.orientation,
      picture: "",
    });
  }, [turtleInstance.current]);
 
  return graphTurtle;
}