import React, { useContext, useEffect, useRef, useState } from 'react';
import CanvasContext from '../CanvasContext';
import { turtleCommandPubSub, useSubscriber } from '../../pubsub/pubsubs';
import { TurtleCommandMessage } from '../../pubsub/types';
import TurtleInstance from '../../models/TurtleInstance';
import useTurtle from './useTurtle';

interface TurtleProps {
	name: string;
	// Additional properties for position, orientation, etc., can be added here
}

const Turtle: React.FC<TurtleProps> = ({ name }) => {
	/*
	These hooks (useRef, useState, useEffect, useSubscriber) must be in a separate hook, this is a very complex logic
	*/
	const context = useContext(CanvasContext);
	const turtle = useTurtle(context);
	// The turtle must rendered correctly above the Canvas
	// This is the purpose of this component
	if (turtle == null) {
		return <></>
	}
	return <div style={{"position": "absolute", "top": turtle.y, "left": turtle.x }}>teknős</div>; // This component does not render any JSX itself
};

export default Turtle;
