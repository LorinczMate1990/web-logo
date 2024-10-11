import React, { useRef, useEffect, useState, ReactNode } from 'react';
import CanvasContext from './CanvasContext';

interface DrawingCanvasProps {
  children?: ReactNode; // Allow children props
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ children }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  // Set up canvas context and resize the canvas based on its container
  useEffect(() => {
    const canvas = canvasRef.current;
    const resizeCanvas = () => {
      if (canvas) {
        const parent = canvas.parentElement;
        if (parent) {
          canvas.width = parent.clientWidth;
          canvas.height = parent.clientHeight;
        }
        const ctx = canvas.getContext('2d');
        setContext(ctx);
      }
    };

    resizeCanvas(); // Initial setup

    window.addEventListener('resize', resizeCanvas); // Update size on window resize
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div style={{ border: '2px dashed red', width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      <CanvasContext.Provider value={context}>
        {context ? children : null}
      </CanvasContext.Provider>
    </div>
  );
};

export default DrawingCanvas;
