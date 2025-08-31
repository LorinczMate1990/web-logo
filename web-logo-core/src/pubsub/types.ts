import { PenColor, PenState } from "../turtle-types/DrawingTypes.js";

type DrawLine = {
  topic: "drawing";
  command: "line";
  segments: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    color: [number, number, number];
    penWidth: number;
  }[]
};

type FillArea = {
  topic: "drawing";
  command: "fill";
  x: number;
  y: number;
  color: [number, number, number];
};

type MoveTurtle = {
  topic: "turtleCommand";
  command: "move";
  x: number;
  y: number;
  orientation: number;
  visible: boolean;
  name: string;
  image: {
    path: string,
    offsetX: number,
    offsetY: number,
    rotatable: boolean,
  }
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

type SaveCanvas = {
  topic: "drawing";
  command: "saveCanvas";
  label: string;
};

type RestoreCanvas = {
  topic: "drawing";
  command: "restoreCanvas";
  label: string;
};

type CaptureCanvasPart = {
  topic: "drawing",
  command: "capture",
  label: string,
  x: number,
  y: number,
  width: number,
  height: number
}

// Combine all messages into one TurtleCommandMessage type
export type TurtleCommandMessage =
  | PrintMessage
  | ClearScreenMessage
  | DrawLine
  | FillArea
  | MoveTurtle
  | SaveCanvas
  | RestoreCanvas
  | CaptureCanvasPart;
