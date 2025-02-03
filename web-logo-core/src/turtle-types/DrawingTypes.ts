type PenState = 'up' | 'down';

type PenColor = [number, number, number];

type Position = {
  x: number;
  y: number;
};
  
type Orientation = number; // Orientation is now just a number (radians)

export { PenState, PenColor, Position, Orientation };