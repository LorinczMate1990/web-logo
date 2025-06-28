import { PenState, Orientation, Position, PenColor } from "web-logo-core";
import simpleTurtle from '../assets/simple-turtle.png'
import CoordSet from "../utils/CoordSet.js";
import { rgbToHex } from "../utils/ColorManipulation.js";

type TurtlePicture = {
  path: string,
  offsetX: number,
  offsetY: number
};

class TurtleInstance {
  position: Position;
  orientation: Orientation;
  picture: TurtlePicture;

  constructor(
    position: Position,
    orientation: Orientation,
  ) {
    this.position = position;
    this.orientation = orientation;
    this.picture = {
      offsetX: 18,
      offsetY: 23,
      path: simpleTurtle,
    };
  }

}

export default TurtleInstance;
