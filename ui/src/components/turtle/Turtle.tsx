import React, { useContext } from 'react';
import CanvasContext from '../CanvasContext';
import useTurtle from './useTurtle';
import Draggable from '../Draggable';

export type TurtleVisibility = "visible" | "invisible";

interface TurtleProps {
	name: string;
	globalVisibility : TurtleVisibility;
}

const Turtle: React.FC<TurtleProps> = ({ name, globalVisibility }) => {
	const context = useContext(CanvasContext);
	const {graphTurtle: turtle, moveTurtle, rotateTurtle} = useTurtle(context);
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
