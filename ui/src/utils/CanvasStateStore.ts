import { DrawingCanvasRef } from "../components/DrawingCanvas.js";

type CanvasStateMap = Record<string, ImageData>;

export default class CanvasStateStore {
  private canvas: DrawingCanvasRef | null = null;
  private states : CanvasStateMap = {};


  setCanvas(canvas: DrawingCanvasRef | null) {
    this.canvas = canvas;
  }

  saveState(label: string): void {
    if (!this.canvas) throw new Error("2D context not available");
    const width = this.canvas.getCanvasWidth();
    const height = this.canvas.getCanvasHeight();

    const imageData = this.canvas.getImageData(0, 0, width, height);
    if (imageData === undefined) {
      throw new Error("Got no image")
    } else {
      this.states[label] = imageData;
    }
  }

  restoreState(label: string): void {
    if (!this.canvas) throw new Error("2D context not available");
    const state = this.states[label];
    console.log("label: ", label)
    if (!state) throw new Error(`No saved state with label: ${label}`);
    this.canvas.putImageData(state, 0, 0);
  }
}