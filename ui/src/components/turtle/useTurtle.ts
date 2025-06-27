import { useEffect, useRef, useState } from "react";
import TurtleInstance, { GraphTurtleProperties } from "../../models/TurtleInstance.js";
import { useSubscriber } from "../../pubsub/pubsubs.js";
import { turtleCommandPubSub, TurtleCommandMessage } from 'web-logo-core'
import simpleTurtle from '../../assets/simple-turtle.png'
import { CanvasData } from "../CanvasContext.js";

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
      case "move":
        instance.position.x = message.x;
        instance.position.y = message.y;
        instance.orientation = message.orientation / 180 * Math.PI;
        break;
    }
    setGraphTurtle({
      ...instance,
      position: { ...instance.position }
    });
  }, [turtleInstance.current]);

  function moveTurtle(dX: number, dY: number) {
    // TODO: Move turtle from UI
  }

  function rotateTurtle(alpha: number) {
    // TODO: Rotate turtle from UI
  }

  return {
    graphTurtle,
    moveTurtle,
    rotateTurtle,
  };
}