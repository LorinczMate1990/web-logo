import { useEffect, useRef, useState } from "react";
import TurtleInstance, { GraphTurtleProperties } from "../../models/TurtleInstance";
import { useSubscriber } from "../../pubsub/pubsubs";
import { turtleCommandPubSub, TurtleCommandMessage } from 'web-logo-core'
import simpleTurtle from '../../assets/simple-turtle.png'

export default function useTurtle(context : CanvasRenderingContext2D | null) {
  const [graphTurtle, setGraphTurtle] = useState<GraphTurtleProperties | null>(null);
  const turtleInstance = useRef<TurtleInstance>();
  useEffect(() => {
    if (turtleInstance.current === null || turtleInstance.current === undefined) {
      const instance = new TurtleInstance("turtle0", "turtles", {x: 400, y: 400}, 0, context, "down", "black", 1);
      turtleInstance.current = instance;
      setGraphTurtle({
        ...instance
      });
    }
    turtleInstance.current.setCanvasContext(context);
  }, [context, turtleInstance.current]);
  useSubscriber<TurtleCommandMessage>(turtleCommandPubSub, (message) => {
    const instance = turtleInstance.current;
    if (instance === undefined) {
      return;
    }
    switch (message.command) {
      case "forward":
        instance.go(message.distance);
        break;
      case "backward":
        instance.go(-message.distance);
        break;
      case "left":
        instance.rotate(-message.radian);
        break;
      case "right":
        instance.rotate(message.radian);
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
      ...instance
    });
  }, [turtleInstance.current]);
 
  return graphTurtle;
}