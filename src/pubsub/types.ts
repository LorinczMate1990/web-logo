import { PenState } from "../models/TurtleInstance"

type MoveMessage = {
  topic: "turtleCommand",
  command: "forward" | "backward",
  distance: number,
}

type RotateMessage = {
  topic: "turtleCommand",
  command: "left" | "right",
  radian: number,
}

type DrawMessage = {
  topic: "turtleCommand",
  command: "drawSettings",
  drawState: {
    penState? : PenState,
    penColor? : string,
    penWidth? : number,
  },
}

type SetHomeStateMessage = {
  topic: "turtleCommand",
  command: "setHomeState",
  position: {x: number, y: number},
  orientation: number,
}

type GoHomeMessage = {
  topic: "turtleCommand",
  command: "goHome",
}

export type TurtleCommandMessage = GoHomeMessage | MoveMessage | RotateMessage | DrawMessage | SetHomeStateMessage;