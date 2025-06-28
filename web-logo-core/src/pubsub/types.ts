import { PenColor, PenState } from "../turtle-types/DrawingTypes.js";

type DrawLine = {
  topic: "drawing";
  command: "line";
  x0 : number;
  y0 : number;
  x1 : number;
  y1 : number;
  color: [number, number, number];
  penWidth: number;
};

type FillArea = {
  topic: "drawing";
  command: "fill";
  x : number;
  y : number;
  color: [number, number, number];
};

type MoveTurtle = {
  topic: "turtleCommand";
  command: "move";
  x : number;
  y : number;
  orientation: number;
  name: string;
};

type PrintMessage = {
  topic: "systemCommand";
  command: "print";
  message: string;
  error: boolean;
};

type ClearScreenMessage = {
  topic: "drawing";
  command: "clearScreen";
};

// Combine all messages into one TurtleCommandMessage type
export type TurtleCommandMessage =
  | PrintMessage
  | ClearScreenMessage
  | DrawLine
  | FillArea
  | MoveTurtle;
