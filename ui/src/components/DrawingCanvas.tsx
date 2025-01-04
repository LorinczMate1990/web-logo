import React, { useRef, useEffect, useState, ReactNode } from 'react';
import CanvasContext from './CanvasContext';

interface DrawingCanvasProps {
  children?: ReactNode; // Allow children props
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ children }) => {
  const canvasContainerRef = useRef(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  // Set up canvas context and resize the canvas based on its container
  useEffect(() => {
    const canvas = canvasRef.current;
    const resizeCanvas = () => {
      console.log("Resize canvas")
      if (canvas) {

        // Save the current content of the canvas
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
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
  }, [canvasContainerRef.current]);

  return (
    <div 
      ref={canvasContainerRef}
      style={{
        position: "relative",
        width: '100%',
        height: '100%'
      }}>
      <canvas ref={canvasRef} style={{ 
        width: "100%",
        height: "100%",
        display: 'block',
      }} />
      <CanvasContext.Provider value={context}>
        {context ? children : null}
      </CanvasContext.Provider>
    </div>
  );
};

export default DrawingCanvas;
