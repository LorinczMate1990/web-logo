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
  visible: boolean;

  constructor(
    position: Position,
    orientation: Orientation,
    picture : TurtlePicture,
    visible: boolean,
  ) {
    this.position = position;
    this.orientation = orientation;
    this.visible = visible;
    this.picture = {
      ...picture
    };
  }

}

export default TurtleInstance;
