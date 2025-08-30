import { Orientation, Position } from "web-logo-core";

type TurtlePicture = {
  path: string,
  offsetX: number,
  offsetY: number,
  rotatable: boolean,
};

class TurtleInstance {
  position: Position;
  orientation: Orientation;
  picture: TurtlePicture;

  constructor(
    position: Position,
    orientation: Orientation,
    picture : TurtlePicture,
  ) {
    this.position = position;
    this.orientation = orientation;
    this.picture = {
      ...picture
    };
  }

}

export default TurtleInstance;
