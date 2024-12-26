import { PenState } from "../turtle-types/PenState";

type MoveMessage = {
  topic: "turtleCommand";
  command: "forward" | "backward";
  distance: number;
};

type RotateMessage = {
  topic: "turtleCommand";
  command: "left" | "right";
  radian: number;
};

type DrawSettingsMessage = {
  topic: "turtleCommand";
  command: "drawSettings";
  drawState: {
    penState?: PenState;
    penColor?: string;
    penWidth?: number;
  };
};

type SetHomeStateMessage = {
  topic: "turtleCommand";
  command: "setHomeState";
  position: { x: number; y: number };
  orientation: number;
};

type GoHomeMessage = {
  topic: "turtleCommand";
  command: "goHome";
};

type SetPenStateMessage = {
  topic: "turtleCommand";
  command: "setPenState";
  penState: PenState;
};

type SetPenColorMessage = {
  topic: "turtleCommand";
  command: "setPenColor";
  color: string;
};

type SetPenWidthMessage = {
  topic: "turtleCommand";
  command: "setPenWidth";
  width: number;
};

type SetHomehMessage = {
  topic: "turtleCommand";
  command: "setHome";
  x : number;
  y : number;
  orientation : number;
};

// Combine all messages into one TurtleCommandMessage type
export type TurtleCommandMessage =
  | MoveMessage
  | RotateMessage
  | DrawSettingsMessage
  | SetHomeStateMessage
  | GoHomeMessage
  | SetPenStateMessage
  | SetPenColorMessage
  | SetPenWidthMessage
  | SetHomehMessage;
