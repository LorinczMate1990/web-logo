import { PenColor, PenState } from "../turtle-types/DrawingTypes";

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
  color: PenColor;
};

type SetPenWidthMessage = {
  topic: "turtleCommand";
  command: "setPenWidth";
  width: number;
};

type FillMessage = {
  topic: "turtleCommand";
  command: "fill";
  tolerance: number;
};

type SetHomehMessage = {
  topic: "turtleCommand";
  command: "setHome";
  x : number;
  y : number;
  orientation : number;
};

type PrintMessage = {
  topic: "systemCommand";
  command: "print";
  message: string;
  error: boolean;
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
  | SetHomehMessage
  | FillMessage
  | PrintMessage;
