import Turtle, { TurtleVisibility } from "./Turtle.js";
import useTurtles from "./useTurtles.js"

type TurtlesProps = {
  globalVisibility: TurtleVisibility;
}

export default function Turtles({globalVisibility} : TurtlesProps) {
  const { turtleInstances } = useTurtles();


  const turtles = Object.entries(turtleInstances).map(
    ([turtleName, instance]) => {
      return <Turtle 
        key={turtleName}
        turtle={instance}
        globalVisibility={globalVisibility}
        moveTurtle={()=>0}
        rotateTurtle={()=>0}
      />;
    }
  );

  return turtles;
}