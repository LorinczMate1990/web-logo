import React, { useRef, useEffect, useState, ReactNode } from 'react';
import CanvasContext from './CanvasContext.js';
import { rgbToHex } from '../utils/ColorManipulation.js';

export interface DrawingCanvasRef {
  clearCanvas: () => void;
  drawLine: (x0: number, y0: number, x1: number, y1: number, color: [number, number, number], penWidth: number) => void;
  fill: (x: number, y : number, color: [number, number, number]) => void;
}

interface DrawingCanvasProps {
  children?: ReactNode;
  ref?: React.RefObject<DrawingCanvasRef | null>;
  onFocus? : () => void;
  onBlur? : () => void;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ ref, onFocus, onBlur, children }) => {
  const canvasContainerRef = useRef(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [canvasSize, setCanvasSize] = useState<{width: number, height: number}>({width: 0, height: 0})

  // Set up canvas context and resize the canvas based on its container
  useEffect(() => {
    const canvas = canvasRef.current;
    const resizeCanvas = () => {
      if (canvas) {

        // Save the current content of the canvas
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        setCanvasSize({width: canvas.width, height: canvas.height});

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

    function fill(x: number, y : number, color: [number, number, number]) {
      // todo Implement fill
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

    if (ref) {
      (ref).current = {
        clearCanvas,
        fill,
        drawLine
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
      <CanvasContext.Provider value={(context == null || canvasRef.current==null)?null:{context, ...canvasSize}}>
        {context ? children : null}
      </CanvasContext.Provider>
    </div>
  );
};

export default DrawingCanvas;
