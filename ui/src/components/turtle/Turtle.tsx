import React, { useContext } from 'react';
import CanvasContext from '../CanvasContext';
import useTurtle from './useTurtle';

interface TurtleProps {
	name: string;
	// Additional properties for position, orientation, etc., can be added here
}

const Turtle: React.FC<TurtleProps> = ({ name }) => {
	const context = useContext(CanvasContext);
	const turtle = useTurtle(context);
	// The turtle must rendered correctly above the Canvas
	// This is the purpose of this component
	if (turtle == null) {
		return <></>
	}
	return <div style={{
		position: "absolute", 
		top: turtle.position.y, 
		left: turtle.position.x,
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
			<img src={turtle.picture.path}/>
		</div>
	</div>;
};

export default Turtle;
