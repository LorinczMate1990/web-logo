type PenState = 'up' | 'down';

type Position = {
  x: number;
  y: number;
};
  
type Orientation = number; // Orientation is now just a number (radians)

export { PenState, Position, Orientation };