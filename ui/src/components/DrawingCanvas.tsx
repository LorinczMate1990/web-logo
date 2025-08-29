import React, { useRef, useEffect, useState, ReactNode } from 'react';
import CanvasContext from './CanvasContext.js';
import { rgbToHex } from '../utils/ColorManipulation.js';
import CoordSet from '../utils/CoordSet.js';

export interface DrawingCanvasRef {
  clearCanvas: () => void;
  drawLine: (x0: number, y0: number, x1: number, y1: number, color: [number, number, number], penWidth: number) => void;
  fill: (x: number, y: number, color: [number, number, number]) => void;
  getCanvasWidth: () => number,
  getCanvasHeight: () => number,
  getImageData: (x : number, y : number, width : number, height : number) => ImageData | undefined,
  putImageData: (imageData : ImageData, x : number, y : number) => void,
}

interface DrawingCanvasProps {
  children?: ReactNode;
  ref?: React.RefObject<DrawingCanvasRef | null>;
  onFocus?: () => void;
  onBlur?: () => void;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ ref, onFocus, onBlur, children }) => {
  const canvasContainerRef = useRef(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [canvasSize, setCanvasSize] = useState<{ width: number, height: number }>({ width: 0, height: 0 })

  // Set up canvas context and resize the canvas based on its container
  useEffect(() => {
    const canvas = canvasRef.current;
    const resizeCanvas = () => {
      if (canvas) {

        // Save the current content of the canvas
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        setCanvasSize({ width: canvas.width, height: canvas.height });

        const tempContext = tempCanvas.getContext("2d");
        if (tempContext) {
          tempContext.drawImage(canvas, 0, 0);
        }

        const parent = canvas.parentElement;
        if (parent) {
          canvas.width = parent.clientWidth;
          canvas.height = parent.clientHeight;
        }
        const ctx = canvas.getContext('2d');
        setContext(ctx);

        if (ctx && tempContext) {
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(tempCanvas, 0, 0);
        }
      }
    };

    resizeCanvas(); // Initial setup

    if (canvasContainerRef.current == null) return;

    //window.addEventListener('resize', resizeCanvas); // Update size on window resize
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvasContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [canvasContainerRef.current, canvasRef.current]);

  useEffect(() => {
    function clearCanvas() {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx && canvasRef.current) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvasRef.current.width ?? 0, canvasRef.current.height);
      }
    }

    function fill(x: number, y: number, fillColor: [number, number, number]) {
      const tolerance = 0.01;

      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx || !canvasRef.current) return;

      const canvasWidth = canvasRef.current.width;
      const canvasHeight = canvasRef.current.height;

      function getIdx(x: number, y: number) {
        return (Math.round(y) * canvasHeight + Math.round(x)) * 4;
      }

      function isSameColor(data: Uint8ClampedArray, x: number, y: number, color2: [number, number, number]) {
        const idx = getIdx(x, y);
        return (
          data[idx] >= color2[0] - tolerance && data[idx] <= color2[0] + tolerance &&
          data[idx + 1] >= color2[1] - tolerance && data[idx + 1] <= color2[1] + tolerance &&
          data[idx + 2] >= color2[2] - tolerance && data[idx + 2] <= color2[2] + tolerance
        );
      }

      function setPixelColor(data: Uint8ClampedArray, x: number, y: number, color: [number, number, number]) {
        const idx = getIdx(x, y);
        data[idx] = color[0];     // Red
        data[idx + 1] = color[1]; // Green
        data[idx + 2] = color[2]; // Blue
        data[idx + 3] = 255; // Alpha
      }

      const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
      const data = imageData.data;

      const startIdx = getIdx(x, y);
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
        if (currentX > 0 && !coordSet.hasCoord(currentX - 1, currentY)) queue.push([currentX - 1, currentY]); // Left
        if (currentX < canvasWidth - 1 && !coordSet.hasCoord(currentX + 1, currentY)) queue.push([currentX + 1, currentY]); // Right
        if (currentY > 0 && !coordSet.hasCoord(currentX, currentY - 1)) queue.push([currentX, currentY - 1]); // Top
        if (currentY < canvasHeight - 1 && !coordSet.hasCoord(currentX, currentY + 1)) queue.push([currentX, currentY + 1]); // Bottom
      }

      // Apply final changes to canvas
      ctx.putImageData(imageData, 0, 0);
    }

    function drawLine(x0: number, y0: number, x1: number, y1: number, color: [number, number, number], penWidth: number) {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.strokeStyle = rgbToHex(color);
        ctx.lineWidth = penWidth;
        ctx.stroke();
      }
    }

    function getImageData(x : number, y : number, width : number, height : number) : ImageData | undefined {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        return ctx.getImageData(x, y, width, height);
      }
      return undefined;
    }

    function putImageData(imageData : ImageData, x : number, y : number) {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        return ctx.putImageData(imageData, x, y);
      }
    }

    if (ref) {
      ref.current = {
        clearCanvas,
        fill,
        drawLine,
        getCanvasWidth: () => canvasRef.current?.width ?? 0,
        getCanvasHeight: () => canvasRef.current?.height ?? 0,
        getImageData,
        putImageData
      };
    }
  }, [ref, canvasRef.current]);

  return (
    <div
      tabIndex={0}
      ref={canvasContainerRef}
      onFocus={onFocus}
      onBlur={onBlur}
      style={{
        position: "relative",
        width: '100%',
        height: '100%',
        outline: "none"
      }}>
      <canvas ref={canvasRef} style={{
        width: "100%",
        height: "100%",
        display: 'block',
      }} />
      <CanvasContext.Provider value={(context == null || canvasRef.current == null) ? null : { context, ...canvasSize }}>
        {context ? children : null}
      </CanvasContext.Provider>
    </div>
  );
};

export default DrawingCanvas;
