import React, { useContext } from 'react';
import CanvasContext from '../CanvasContext.js';
import Draggable from '../Draggable.js';
import TurtleInstance from '../../models/TurtleInstance.js';

export type TurtleVisibility = "visible" | "invisible";

interface TurtleProps {
	turtle: TurtleInstance;
	globalVisibility : TurtleVisibility;
	moveTurtle: (dx : number, dy: number) => void;
	rotateTurtle: (deg : number) => void;
}

const Turtle: React.FC<TurtleProps> = ({ globalVisibility, turtle, moveTurtle, rotateTurtle }) => {
	const context = useContext(CanvasContext);
	// The turtle must rendered correctly above the Canvas
	// This is the purpose of this component
	if (turtle == null || globalVisibility == "invisible") {
		return <></>
	}

	return <Draggable 
		top={turtle.position.y}
		left={turtle.position.x}
		onDrag={(dX, dY) => {
			moveTurtle(dX, dY);
		}}
		onWheel={(delta) => {
			rotateTurtle(delta*Math.PI/4)
		}}
	>
		<div style={{
			transform: `rotate(${turtle.orientation+Math.PI/2}rad)`,
			transformOrigin: `0px 0px`,
		}}>
			<div
				style={{
					position: "absolute", 
					top: -turtle.picture.offsetY, 
					left: -turtle.picture.offsetX,
				}}
			>
				<img 
					onDragStart={(e) => e.preventDefault()} 
					draggable={false}
					src={turtle.picture.path}
				/>
			</div>
		</div>
	</Draggable>
};

export default Turtle;
