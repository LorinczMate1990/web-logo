import { DrawingCanvasRef } from "../components/DrawingCanvas.js";

type CanvasStateMap = Record<string, ImageData>;

export default class CanvasStateStore {
  private canvas: DrawingCanvasRef | null = null;
  private states: CanvasStateMap = {};


  setCanvas(canvas: DrawingCanvasRef | null) {
    this.canvas = canvas;
  }

  saveState(label: string): void {
    if (!this.canvas) throw new Error("2D context not available");
    const width = this.canvas.getCanvasWidth();
    const height = this.canvas.getCanvasHeight();

    this.savePart(label, 0, 0, width, height);
  }

  savePart(label: string, x: number, y: number, width: number, height: number) {
    if (!this.canvas) throw new Error("2D context not available");
    const imageData = this.canvas.getImageData(x, y, width, height);
    if (imageData === undefined) {
      throw new Error("Got no image")
    } else {
      this.states[label] = imageData;
    }
  }

  getState(label: string): ImageData {
    const state = this.states[label];
    if (!state) throw new Error(`No saved state with label: ${label}`);
    return state;
  }

  restoreState(label: string): void {
    if (!this.canvas) throw new Error("2D context not available");
    const state = this.getState(label);
    this.canvas.putImageData(state, 0, 0);
  }
}