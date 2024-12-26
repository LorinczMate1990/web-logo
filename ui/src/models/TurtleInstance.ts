import { PenState, Orientation, Position } from "web-logo-core";

class TurtleInstance {
  name: string;
  group: string;
  position: Position;
  orientation: Orientation;
  drawingProperties: {
    penState: PenState;
    penColor: string;
    penWidth: number;
  };
  canvasContext: CanvasRenderingContext2D | null;
  private homePosition: Position = { x: 0, y: 0 };
  private homeOrientation: Orientation = 0; // Default to 0 radians

  constructor(
    name: string,
    group: string,
    position: Position,
    orientation: Orientation,
    canvasContext: CanvasRenderingContext2D | null,
    penState: PenState = 'down',
    penColor: string = 'black',
    penWidth: number = 1
  ) {
    this.name = name;
    this.group = group;
    this.position = position;
    this.orientation = orientation;
    this.canvasContext = canvasContext;
    this.drawingProperties = {
      penState,
      penColor,
      penWidth,
    };
  }

  setCanvasContext(canvasContext: CanvasRenderingContext2D | null) {
    this.canvasContext = canvasContext;
  }

  go(distance: number) {
    const { x, y } = this.position;
    const rad = this.orientation; // Direct use of radians
    const newX = x + distance * Math.cos(rad);
    const newY = y + distance * Math.sin(rad);

    this.drawLine(newX, newY);
  }

  rotate(rad: number) {
    this.orientation = (this.orientation + rad) % (2 * Math.PI);
  }

  setHome(x: number, y: number, orientation: Orientation) {
    this.homePosition = { x, y };
    this.homeOrientation = orientation;
  }

  goHome() {
    this.drawLine(this.homePosition.x, this.homePosition.y, true);
    this.position = { ...this.homePosition };
    this.orientation = this.homeOrientation;
  }

  setPenState(penState: PenState) {
    this.drawingProperties.penState = penState;
  }

  setPenColor(color: string) {
    this.drawingProperties.penColor = color;
  }

  setPenWidth(width: number) {
    this.drawingProperties.penWidth = width;
  }

  private drawLine(newX: number, newY: number, forceDraw: boolean = false) {
    const { x, y } = this.position;
    if ((this.drawingProperties.penState === 'down' || forceDraw) && this.canvasContext) {
      this.canvasContext.beginPath();
      this.canvasContext.moveTo(x, y);
      this.canvasContext.lineTo(newX, newY);
      this.canvasContext.strokeStyle = this.drawingProperties.penColor;
      this.canvasContext.lineWidth = this.drawingProperties.penWidth;
      this.canvasContext.stroke();
    }
    this.position = { x: newX, y: newY };
  }
}

export default TurtleInstance;
