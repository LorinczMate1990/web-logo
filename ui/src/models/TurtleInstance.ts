import { PenState, Orientation, Position, PenColor } from "web-logo-core";
import simpleTurtle from '../assets/simple-turtle.png'
import CoordSet from "../utils/CoordSet";
import { rgbToHex } from "../utils/ColorManipulation";

type TurtlePicture = {
  path: string,
  offsetX: number,
  offsetY: number
};

export interface GraphTurtleProperties {
  position: Position;
  orientation: Orientation;
  picture: TurtlePicture;
};

class TurtleInstance implements GraphTurtleProperties {
  name: string;
  group: string;
  position: Position;
  orientation: Orientation;
  drawingProperties: {
    penState: PenState;
    penColor: PenColor;
    penWidth: number;
  };
  canvasContext: CanvasRenderingContext2D | null;
  canvasWidth: number;
  canvasHeight: number;
  private homePosition: Position = { x: 0, y: 0 };
  private homeOrientation: Orientation = 0; // Default to 0 radians
  picture: TurtlePicture;

  constructor(
    name: string,
    group: string,
    position: Position,
    orientation: Orientation,
    canvasContext: CanvasRenderingContext2D | null,
    canvasWidth: number,
    canvasHeight: number,
    penState: PenState = 'down',
    penColor: PenColor = [0,0,0],
    penWidth: number = 1,

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
    this.picture = {
      offsetX: 18,
      offsetY: 23,
      path: simpleTurtle,
    };
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  setCanvasContext(canvasContext: CanvasRenderingContext2D | null, canvasWidth : number, canvasHeight : number) {
    this.canvasContext = canvasContext;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
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
    this.drawLine(this.homePosition.x, this.homePosition.y);
    this.position = { ...this.homePosition };
    this.orientation = this.homeOrientation;
  }

  setPenState(penState: PenState) {
    this.drawingProperties.penState = penState;
  }

  setPenColor(color: PenColor) {
    this.drawingProperties.penColor = color;
  }

  setPenWidth(width: number) {
    this.drawingProperties.penWidth = width;
  }

  fill(tolerance: number) {
    const width = this.canvasWidth;
    const height = this.canvasHeight;

    function isSameColor(data: Uint8ClampedArray, x : number, y : number, color2: [number, number, number]) {
      const idx = (y * width + x) * 4;
      return (
        data[idx] >= color2[0]-tolerance && data[idx] <= color2[0]+tolerance &&
        data[idx+1] >= color2[1]-tolerance && data[idx+1] <= color2[1]+tolerance &&
        data[idx+2] >= color2[2]-tolerance && data[idx+2] <= color2[2]+tolerance
      );
    }

    function setPixelColor(data: Uint8ClampedArray, x : number, y : number, color: [number, number, number]) {
      const idx = (y * width + x) * 4;
      data[idx] = color[0];     // Red
      data[idx + 1] = color[1]; // Green
      data[idx + 2] = color[2]; // Blue
      data[idx + 3] = 255; // Alpha
    }

    const ctx = this.canvasContext;
    if (!ctx) return;

    const { x, y } = this.position;
    const fillColor: [number, number, number] = this.drawingProperties.penColor; // Ensure correct RGBA format
    const imageData = ctx.getImageData(0, 0, this.canvasWidth, this.canvasHeight);
    const data = imageData.data;

    const startIdx = (y * width + x) * 4;
    const targetColor: [number, number, number] = [
      data[startIdx],
      data[startIdx + 1],
      data[startIdx + 2]
    ];

    // If the target color is already the fill color, return
    if (isSameColor(data, x, y, fillColor)) return;

    const queue: [number, number][] = [[x, y]];
    let pixelsFilled = 0;

    const coordSet = new CoordSet();

    while (queue.length) {
      const [currentX, currentY] = queue.shift()!;
      coordSet.addCoord(currentX, currentY);

      // Check if current pixel matches target color
      if (!isSameColor(data, currentX, currentY, targetColor)) {
        continue;
      }

      // Fill the current pixel
      setPixelColor(data, currentX, currentY, fillColor);
      pixelsFilled++;

      // Push neighbors
      if (currentX > 0 && !coordSet.hasCoord(currentX-1, currentY)) queue.push([currentX - 1, currentY]); // Left
      if (currentX < width - 1  && !coordSet.hasCoord(currentX+1, currentY)) queue.push([currentX + 1, currentY]); // Right
      if (currentY > 0  && !coordSet.hasCoord(currentX, currentY-1)) queue.push([currentX, currentY - 1]); // Top
      if (currentY < height - 1  && !coordSet.hasCoord(currentX, currentY+1)) queue.push([currentX, currentY + 1]); // Bottom
    }

    // Apply final changes to canvas
    ctx.putImageData(imageData, 0, 0);
  }


  private drawLine(newX: number, newY: number, forceDraw: boolean = false) {
    const { x, y } = this.position;
    if ((this.drawingProperties.penState === 'down' || forceDraw) && this.canvasContext) {
      this.canvasContext.beginPath();
      this.canvasContext.moveTo(x, y);
      this.canvasContext.lineTo(newX, newY);
      this.canvasContext.strokeStyle = rgbToHex(this.drawingProperties.penColor);
      this.canvasContext.lineWidth = this.drawingProperties.penWidth;
      this.canvasContext.stroke();
    }
    this.position = { x: newX, y: newY };
  }
}

export default TurtleInstance;
