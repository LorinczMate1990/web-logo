import { useEffect, useRef, useState } from "react";
import TurtleInstance, { GraphTurtleProperties } from "../../models/TurtleInstance";
import { useSubscriber } from "../../pubsub/pubsubs";
import { turtleCommandPubSub, TurtleCommandMessage } from 'web-logo-core'
import simpleTurtle from '../../assets/simple-turtle.png'
import { CanvasData } from "../CanvasContext";

export default function useTurtle(canvasData: CanvasData | null) {
  const context = (canvasData == null) ? null : canvasData.context;
  const canvasWidth = canvasData?.width ?? 0;
  const canvasHeight = canvasData?.height ?? 0;

  const [graphTurtle, setGraphTurtle] = useState<GraphTurtleProperties | null>(null);
  const turtleInstance = useRef<TurtleInstance | undefined>(undefined);
  useEffect(() => {
    if (turtleInstance.current === null || turtleInstance.current === undefined) {
      const instance = new TurtleInstance("turtle0", "turtles", { x: Math.round(canvasWidth / 2), y: Math.round(canvasHeight / 2) }, Math.PI / 2 * 3, context, canvasWidth, canvasHeight, "down", [0, 0, 0], 1);
      turtleInstance.current = instance;
      setGraphTurtle({
        ...instance
      });
    }
    turtleInstance.current.setCanvasContext(context, canvasWidth, canvasHeight);

  }, [context, turtleInstance.current, canvasWidth, canvasHeight]);
  useSubscriber<TurtleCommandMessage>(turtleCommandPubSub, (message) => {
    const instance = turtleInstance.current;
    if (instance === undefined) {
      return;
    }
    if (message.topic != "turtleCommand") return;
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
        instance.setHome();
        break;
      case "fill":
        instance.fill(message.tolerance);
        break;
    }
    setGraphTurtle({
      ...instance,
      position: { ...instance.position }
    });
  }, [turtleInstance.current]);

  function moveTurtle(dX : number, dY : number) {
    const instance = turtleInstance.current;
    if (instance === undefined) {
      return;
    }
    instance.position.x += dX;
    instance.position.y += dY;
    setGraphTurtle({
      ...instance,
      position: { ...instance.position }
    });
  }

  function rotateTurtle(alpha : number) {
    const instance = turtleInstance.current;
    if (instance === undefined) {
      return;
    }

    instance.orientation = (instance.orientation + alpha) % (2*Math.PI);

    setGraphTurtle({
      ...instance,
      position: { ...instance.position }
    });
  }

  return {
    graphTurtle, 
    moveTurtle,
    rotateTurtle,
  };
}