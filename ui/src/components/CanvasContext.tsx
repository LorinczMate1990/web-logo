import React from 'react';

// Create a Context with a default value of null for the canvas 2D context
export type CanvasData = {context: CanvasRenderingContext2D, width : number, height : number};
const CanvasContext = React.createContext<CanvasData | null>(null);

export default CanvasContext;
