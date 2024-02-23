import React, { useRef, useEffect, useState, ReactNode } from 'react';
import CanvasContext from './CanvasContext';

interface DrawingCanvasProps {
    width: number;
    height: number;
    children?: ReactNode; // Allow children props
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ width, height, children }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d') ?? null;
        setContext(ctx);
    }, [width, height]); // Ensure canvas context is updated if width or height changes

    return (
        <div>
            <canvas ref={canvasRef} width={width} height={height} />
            <CanvasContext.Provider value={context}>
                {/* Render children within the context provider */}
                {context ? children : null}
            </CanvasContext.Provider>
        </div>
    );
};

export default DrawingCanvas;
