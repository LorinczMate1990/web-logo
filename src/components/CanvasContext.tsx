import React from 'react';

// Create a Context with a default value of null for the canvas 2D context
const CanvasContext = React.createContext<CanvasRenderingContext2D | null>(null);

export default CanvasContext;
